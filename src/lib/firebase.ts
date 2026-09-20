import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  initializeFirestore,
  getFirestore,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  collection,
  onSnapshot,
  Firestore,
} from 'firebase/firestore';
import firebaseConfigData from '../../firebase-applet-config.json';
import { AppliedPromo, UpperBoxConfig, LowerSlotConfig, AntennaDbiType } from '../types';

export interface ProductStockRecord {
  productId: string;
  productName: string;
  category: 'display' | 'wireless' | 'antenna_quality' | 'antenna_dbi';
  inStock: boolean;
  updatedAt?: string;
}

export const DEFAULT_PRODUCT_STOCK: ProductStockRecord[] = [
  {
    productId: 'display_oled',
    productName: 'OLED Status Display Module',
    category: 'display',
    inStock: true,
  },
  {
    productId: 'wireless_5ghz',
    productName: '5GHz High-Speed Wireless Control Module',
    category: 'wireless',
    inStock: true,
  },
  {
    productId: 'antenna_quality_normal',
    productName: 'Normal Antenna (Standard Gain - ₹200)',
    category: 'antenna_quality',
    inStock: true,
  },
  {
    productId: 'antenna_quality_powerful',
    productName: 'Powerful Antenna (High-Output Gain - ₹700)',
    category: 'antenna_quality',
    inStock: true,
  },
  {
    productId: 'antenna_dbi_0',
    productName: '0 dBi Antenna (Internal Stub - ₹100)',
    category: 'antenna_dbi',
    inStock: true,
  },
  {
    productId: 'antenna_dbi_6',
    productName: '6 dBi Antenna (Omni-Directional - ₹150)',
    category: 'antenna_dbi',
    inStock: true,
  },
  {
    productId: 'antenna_dbi_12',
    productName: '12 dBi Antenna (High-Gain Long Range - ₹450)',
    category: 'antenna_dbi',
    inStock: true,
  },
];

export interface FirestoreOrderRecord {
  invoiceNumber: string;
  itemCode: string;
  customerCode: string;
  appliedPromoCode: string;
  promoDiscount: {
    applied: boolean;
    code?: string;
    label?: string;
    discountAmount: number;
    value?: number;
    type?: string;
  };
  itemsSubtotal: number;
  discountAmount: number;
  payableTotal: number;
  verificationHash: string;
  createdAt: string;
}

export interface FirestorePromoCodeRecord {
  code: string;
  type: 'percent' | 'flat';
  value: number;
  label: string;
  minOrderValue: number;
  active: boolean;
  createdAt?: string;
}

export interface AdminAccountRecord {
  username: string;
  role: 'admin' | 'superadmin';
  createdAt?: string;
}

// Error handling helper per Firebase guidelines
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

// Initialize Firebase App & Auth
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfigData);
export const auth = getAuth(app);

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    operationType,
    path,
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
  };
  console.warn('Firestore Operation Notification:', JSON.stringify(errInfo));
}

// Configure Firestore instance with forced long polling in browser/iframe environments.
// This prevents streaming connection timeout errors (code=unavailable / Could not reach Cloud Firestore backend)
// that happen when reverse proxies or iframes buffer or interrupt WebChannel streams.
let firestoreInstance: Firestore;
try {
  if (typeof window !== 'undefined') {
    firestoreInstance = initializeFirestore(
      app,
      {
        experimentalForceLongPolling: true,
      },
      firebaseConfigData.firestoreDatabaseId || undefined
    );
  } else {
    firestoreInstance = getFirestore(
      app,
      firebaseConfigData.firestoreDatabaseId || undefined
    );
  }
} catch {
  firestoreInstance = getFirestore(
    app,
    firebaseConfigData.firestoreDatabaseId || undefined
  );
}

export const db: Firestore = firestoreInstance;

// Connection test on boot as required by system guidelines
export async function testFirebaseConnection(): Promise<boolean> {
  try {
    const testDoc = doc(db, 'product_stock', 'display_oled');
    await getDoc(testDoc);
    return true;
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('the client is offline') || error.message.includes('unavailable')) {
        console.info('Firestore is operating in offline/cached mode until backend reconnects.');
      } else {
        console.info('Firebase connection note (offline/initializing):', error.message);
      }
    }
    return false;
  }
}

/**
 * Validates a promo code strictly against Firebase Firestore.
 */
export async function validatePromoCodeWithFirestore(
  inputCode: string,
  currentSubtotal: number
): Promise<{ valid: boolean; promo?: AppliedPromo; error?: string }> {
  const code = inputCode.trim().toUpperCase();
  if (!code) {
    return { valid: false, error: 'Please enter a promo code' };
  }

  try {
    const promoRef = doc(db, 'promo_codes', code);
    const snap = await getDoc(promoRef);

    if (!snap.exists()) {
      return {
        valid: false,
        error: `Promo code "${code}" is invalid or does not exist.`,
      };
    }

    const promoData = snap.data() as FirestorePromoCodeRecord;

    if (!promoData || !promoData.active) {
      return {
        valid: false,
        error: `Promo code "${code}" is currently inactive.`,
      };
    }

    if (promoData.minOrderValue && currentSubtotal < promoData.minOrderValue) {
      return {
        valid: false,
        error: `Minimum order amount of ₹${promoData.minOrderValue} required for this promo.`,
      };
    }

    let discountAmount = 0;
    if (promoData.type === 'percent') {
      discountAmount = Math.round((currentSubtotal * promoData.value) / 100);
    } else {
      discountAmount = Math.min(currentSubtotal, promoData.value);
    }

    return {
      valid: true,
      promo: {
        code: promoData.code || code,
        tierId: promoData.code || code,
        type: promoData.type === 'flat' ? 'flat' : 'percent',
        value: promoData.value,
        label: promoData.label || `${code} discount`,
        discountAmount,
      },
    };
  } catch (err) {
    console.error('Firestore promo validation error:', err);
    return { valid: false, error: 'Could not verify promo code.' };
  }
}

export interface CreateOrderParams {
  upperBoxes: UpperBoxConfig[];
  slots: LowerSlotConfig[];
  antennaDbiTypes: Record<number, AntennaDbiType | undefined>;
  customerCode: string;
  promoCode?: string;
}

/**
 * Saves a verified order record by invoking the server-authoritative API endpoint /api/create-order.
 * The server securely recalculates pricing from Firestore config/pricing, validates any promo code,
 * signs the order with ORDER_SIGNING_SECRET, and writes to Firestore via Firebase Admin SDK.
 * If the API fails, it throws an error and fails the order without client-side fallback.
 */
export async function saveOrderToFirestore(
  params: CreateOrderParams
): Promise<{ success: boolean; invoiceNumber: string; customerCode: string; hash: string }> {
  const res = await fetch('/api/create-order', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      upperBoxes: params.upperBoxes,
      slots: params.slots,
      antennaDbiTypes: params.antennaDbiTypes,
      customerCode: params.customerCode,
      promoCode: params.promoCode || '',
    }),
  });

  const data = await res.json().catch(() => null);

  if (!res.ok || !data?.success) {
    const errorMessage = data?.error || `Order creation failed (${res.status})`;
    throw new Error(errorMessage);
  }

  return {
    success: true,
    invoiceNumber: data.invoiceNumber,
    customerCode: data.customerCode,
    hash: data.verificationHash,
  };
}

/**
 * Checks an order in Firestore to verify whether it is an authentic database order.
 * This prevents anyone from claiming a fake discount by tampering with customer code strings.
 */
export async function verifyOrderInFirestore(invoiceNumber: string): Promise<{
  exists: boolean;
  order?: FirestoreOrderRecord;
  verifiedPromo?: AppliedPromo | null;
  message: string;
}> {
  try {
    const orderRef = doc(db, 'orders', invoiceNumber);
    const snap = await getDoc(orderRef);

    if (!snap.exists()) {
      return {
        exists: false,
        message: 'Order not found. No promo discount verified.',
      };
    }

    const data = snap.data() as FirestoreOrderRecord;

    // Rely on verified from the API instead of comparing hashes on the client
    let isVerified = false;
    try {
      const res = await fetch('/api/verify-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invoiceNumber: data.invoiceNumber,
        }),
      });
      if (res.ok) {
        const verifyRes = await res.json();
        if (verifyRes?.verified === true) {
          isVerified = true;
        }
      }
    } catch {
      // Ignore API error in offline/local preview mode
    }

    if (!isVerified) {
      return {
        exists: true,
        message: 'Security warning: Order verification failed (tampered or unverified).',
      };
    }

    let verifiedPromo: AppliedPromo | null = null;
    if (data.promoDiscount?.applied && data.appliedPromoCode) {
      verifiedPromo = {
        code: data.appliedPromoCode,
        tierId: data.appliedPromoCode,
        type: (data.promoDiscount.type === 'flat' ? 'flat' : 'percent') as 'percent' | 'flat',
        value: data.promoDiscount.value || 0,
        label: data.promoDiscount.label || `${data.appliedPromoCode} Discount`,
        discountAmount: data.discountAmount,
      };
    }

    return {
      exists: true,
      order: data,
      verifiedPromo,
      message: 'Verified authentic order.',
    };
  } catch (err) {
    console.warn('Firestore order lookup failed:', err);
    return {
      exists: false,
      message: 'Could not verify order.',
    };
  }
}

/**
 * Authenticates admin via official Firebase Authentication (email and password).
 */
export async function loginAdminWithFirebase(
  email: string,
  rawPassword: string
): Promise<{
  success: boolean;
  username?: string;
  role?: string;
  error?: string;
}> {
  const cleanEmail = (email || '').trim();
  if (!cleanEmail) {
    return { success: false, error: 'Admin email is required.' };
  }
  if (!rawPassword) {
    return { success: false, error: 'Password is required.' };
  }

  try {
    const userCredential = await signInWithEmailAndPassword(auth, cleanEmail, rawPassword);
    return {
      success: true,
      username: userCredential.user.email || userCredential.user.displayName || cleanEmail,
      role: 'admin',
    };
  } catch (err: unknown) {
    console.warn('Firebase Auth login attempt result:', err);
    let message = 'Invalid admin credentials.';
    const firebaseErr = err as { code?: string; message?: string };
    if (
      firebaseErr?.code === 'auth/invalid-credential' ||
      firebaseErr?.code === 'auth/wrong-password' ||
      firebaseErr?.code === 'auth/user-not-found'
    ) {
      message = 'Invalid email or password.';
    } else if (firebaseErr?.code === 'auth/too-many-requests') {
      message = 'Too many failed attempts. Please try again later.';
    } else if (firebaseErr?.code === 'auth/invalid-email') {
      message = 'Please enter a valid email address.';
    } else if (firebaseErr?.message) {
      message = firebaseErr.message;
    }

    return {
      success: false,
      error: message,
    };
  }
}

/**
 * Signs out the currently authenticated admin
 */
export async function logoutAdmin(): Promise<void> {
  await signOut(auth);
}

/**
 * Subscribes to Firebase Authentication state changes
 */
export function subscribeAdminAuth(callback: (user: FirebaseUser | null) => void): () => void {
  return onAuthStateChanged(auth, callback);
}

/**
 * Saves centralized pricing catalog to Firestore config/pricing document.
 */
export async function savePricingCatalogToFirestore(catalogData: unknown): Promise<void> {
  try {
    const pricingRef = doc(db, 'config', 'pricing');
    await setDoc(
      pricingRef,
      {
        ...(catalogData as object),
        updatedAt: new Date().toISOString(),
        updatedBy: auth.currentUser?.email || auth.currentUser?.uid || 'admin',
      },
      { merge: true }
    );
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, 'config/pricing');
    throw err;
  }
}

/**
 * Fetches centralized pricing catalog from Firestore.
 */
export async function fetchPricingCatalogFromFirestore(): Promise<Record<string, unknown> | null> {
  try {
    const pricingRef = doc(db, 'config', 'pricing');
    const snap = await getDoc(pricingRef);
    if (snap.exists()) {
      return snap.data() as Record<string, unknown>;
    }
    return null;
  } catch (err) {
    console.warn('Firestore pricing fetch note (using defaults):', err);
    return null;
  }
}

/**
 * Subscribes to real-time changes in the centralized pricing catalog in Firestore.
 */
export function subscribePricingCatalogFromFirestore(
  callback: (catalog: Record<string, unknown>) => void
): () => void {
  try {
    const pricingRef = doc(db, 'config', 'pricing');
    return onSnapshot(
      pricingRef,
      (docSnap) => {
        if (docSnap.exists()) {
          callback(docSnap.data() as Record<string, unknown>);
        }
      },
      (error) => {
        console.warn('Realtime pricing listener note:', error);
      }
    );
  } catch (err) {
    console.warn('Realtime pricing subscription error:', err);
    return () => {};
  }
}

/**
 * Ensures initial product stock documents exist in Firestore.
 */
export async function ensureProductStockSeeded(): Promise<void> {
  try {
    for (const item of DEFAULT_PRODUCT_STOCK) {
      const stockRef = doc(db, 'product_stock', item.productId);
      const snap = await getDoc(stockRef);
      if (!snap.exists()) {
        await setDoc(stockRef, {
          ...item,
          updatedAt: new Date().toISOString(),
        });
      }
    }
  } catch (err) {
    console.warn('Product stock auto-seed note:', err);
  }
}

/**
 * Fetches all product stock records from Firestore (with local default fallback).
 */
export async function fetchAllProductStock(): Promise<ProductStockRecord[]> {
  try {
    const snap = await getDocs(collection(db, 'product_stock'));
    if (snap.empty) {
      // Seed if empty
      await ensureProductStockSeeded();
      return DEFAULT_PRODUCT_STOCK;
    }
    const list: ProductStockRecord[] = [];
    snap.forEach((d) => {
      const data = d.data() as ProductStockRecord;
      if ((data.category as string) === 'firmware') return;
      list.push({
        productId: d.id,
        productName: data.productName || d.id,
        category: data.category || 'display',
        inStock: data.inStock !== false,
        updatedAt: data.updatedAt,
      });
    });

    // Merge with any missing defaults
    const map = new Map(list.map((i) => [i.productId, i]));
    for (const def of DEFAULT_PRODUCT_STOCK) {
      if (!map.has(def.productId)) {
        list.push(def);
      }
    }

    return list;
  } catch (err) {
    console.warn('Error fetching product stock from Firestore, using defaults:', err);
    return DEFAULT_PRODUCT_STOCK;
  }
}

/**
 * Updates stock status (inStock: true/false) for a product in Firestore.
 */
export async function updateProductStockInFirestore(
  productId: string,
  inStock: boolean,
  meta?: Partial<ProductStockRecord>
): Promise<void> {
  const stockRef = doc(db, 'product_stock', productId);
  const defaultMeta = DEFAULT_PRODUCT_STOCK.find((p) => p.productId === productId);

  const payload: ProductStockRecord = {
    productId,
    productName: meta?.productName || defaultMeta?.productName || productId,
    category: meta?.category || defaultMeta?.category || 'display',
    inStock,
    updatedAt: new Date().toISOString(),
  };

  try {
    await setDoc(stockRef, payload, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `product_stock/${productId}`);
  }
}

/**
 * Subscribes to real-time changes in product stock.
 */
export function subscribeProductStock(
  callback: (stockMap: Record<string, boolean>, fullList: ProductStockRecord[]) => void
): () => void {
  try {
    const colRef = collection(db, 'product_stock');
    return onSnapshot(
      colRef,
      (snapshot) => {
        const stockMap: Record<string, boolean> = {};
        const list: ProductStockRecord[] = [];

        // Prepopulate with defaults
        for (const def of DEFAULT_PRODUCT_STOCK) {
          stockMap[def.productId] = def.inStock;
        }

        snapshot.forEach((docSnap) => {
          const data = docSnap.data() as ProductStockRecord;
          const pid = docSnap.id;
          if ((data.category as string) === 'firmware') return;
          stockMap[pid] = data.inStock !== false;
          list.push({
            productId: pid,
            productName: data.productName || pid,
            category: data.category || 'display',
            inStock: data.inStock !== false,
            updatedAt: data.updatedAt,
          });
        });

        // Merge defaults if not in list
        const listIds = new Set(list.map((l) => l.productId));
        for (const def of DEFAULT_PRODUCT_STOCK) {
          if (!listIds.has(def.productId)) {
            list.push(def);
          }
        }

        callback(stockMap, list);
      },
      (error) => {
        console.warn('Realtime product stock listener fallback:', error);
        const defaultMap: Record<string, boolean> = {};
        for (const def of DEFAULT_PRODUCT_STOCK) {
          defaultMap[def.productId] = def.inStock;
        }
        callback(defaultMap, DEFAULT_PRODUCT_STOCK);
      }
    );
  } catch (err) {
    console.warn('Realtime subscribe error:', err);
    const defaultMap: Record<string, boolean> = {};
    for (const def of DEFAULT_PRODUCT_STOCK) {
      defaultMap[def.productId] = def.inStock;
    }
    callback(defaultMap, DEFAULT_PRODUCT_STOCK);
    return () => {};
  }
}

/**
 * Subscribes to real-time changes in promo codes collection.
 */
export function subscribePromoCodes(
  callback: (promos: FirestorePromoCodeRecord[]) => void
): () => void {
  try {
    const colRef = collection(db, 'promo_codes');
    return onSnapshot(
      colRef,
      (snapshot) => {
        const list: FirestorePromoCodeRecord[] = [];
        snapshot.forEach((d) => {
          const data = d.data() as FirestorePromoCodeRecord;
          list.push({
            code: (data.code || d.id).toUpperCase(),
            type: data.type === 'flat' ? 'flat' : 'percent',
            value: Number(data.value) || 0,
            label: data.label || data.code || d.id,
            minOrderValue: Number(data.minOrderValue) || 0,
            active: data.active !== false,
            createdAt: data.createdAt,
          });
        });
        callback(list);
      },
      (error) => {
        console.warn('Realtime promo listener fallback:', error);
        fetchAllPromoCodesFromFirestore().then(callback);
      }
    );
  } catch (err) {
    console.warn('Realtime promo subscribe error:', err);
    fetchAllPromoCodesFromFirestore().then(callback);
    return () => {};
  }
}

/**
 * Fetches all promo codes from Firestore for Admin management.
 */
export async function fetchAllPromoCodesFromFirestore(): Promise<FirestorePromoCodeRecord[]> {
  try {
    const snap = await getDocs(collection(db, 'promo_codes'));
    if (snap.empty) {
      return [];
    }
    const list: FirestorePromoCodeRecord[] = [];
    snap.forEach((d) => {
      const data = d.data() as FirestorePromoCodeRecord;
      list.push({
        code: (data.code || d.id).toUpperCase(),
        type: data.type || 'percent',
        value: Number(data.value) || 0,
        label: data.label || data.code || d.id,
        minOrderValue: Number(data.minOrderValue) || 0,
        active: data.active !== false,
        createdAt: data.createdAt,
      });
    });
    return list;
  } catch (err) {
    console.warn('Error fetching promo codes from Firestore:', err);
    return [];
  }
}

/**
 * Adds or updates a promo code in Firestore.
 */
export async function savePromoCodeToFirestore(promo: {
  code: string;
  type: 'percent' | 'flat';
  value: number;
  label: string;
  minOrderValue: number;
  active: boolean;
}): Promise<void> {
  const code = promo.code.trim().toUpperCase();
  if (!code) throw new Error('Promo code is required');

  const payload: FirestorePromoCodeRecord = {
    code,
    type: promo.type,
    value: Number(promo.value),
    label: promo.label.trim() || `${code} (${promo.type === 'percent' ? `${promo.value}%` : `₹${promo.value}`} off)`,
    minOrderValue: Number(promo.minOrderValue) || 0,
    active: Boolean(promo.active),
    createdAt: new Date().toISOString(),
  };

  const promoRef = doc(db, 'promo_codes', code);
  try {
    await setDoc(promoRef, payload);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `promo_codes/${code}`);
  }
}

/**
 * Removes / deletes a promo code completely from Firestore.
 */
export async function deletePromoCodeFromFirestore(code: string): Promise<void> {
  const normCode = code.trim().toUpperCase();
  if (!normCode) return;

  const promoRef = doc(db, 'promo_codes', normCode);
  try {
    await deleteDoc(promoRef);
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `promo_codes/${normCode}`);
  }
}

/**
 * Toggles a promo code's active status.
 */
export async function togglePromoCodeActiveInFirestore(code: string, active: boolean): Promise<void> {
  const normCode = code.trim().toUpperCase();
  if (!normCode) return;

  const promoRef = doc(db, 'promo_codes', normCode);
  try {
    await setDoc(promoRef, { active }, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `promo_codes/${normCode}`);
  }
}


