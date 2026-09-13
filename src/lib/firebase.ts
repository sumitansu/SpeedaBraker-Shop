import { initializeApp, getApps, getApp } from 'firebase/app';
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
import { AppliedPromo } from '../types';

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
  passwordHash: string;
  salt: string;
  createdAt?: string;
}

export const DEFAULT_ADMIN_ACCOUNT = {
  username: 'doraemon',
  password: 'yumichan',
  salt: 'sbs_admin_doraemon_salt_2026_x9',
  role: 'admin' as const,
};

// Error handling helper per Firebase guidelines
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo = {
    error: error instanceof Error ? error.message : String(error),
    operationType,
    path,
  };
  console.warn('Firestore Operation Notification:', JSON.stringify(errInfo));
}

// Initialize Firebase App & Firestore instance with auto-detect long polling for maximum reliability in browser/iframe environments
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfigData);

let firestoreInstance: Firestore;
try {
  firestoreInstance = initializeFirestore(
    app,
    {
      experimentalAutoDetectLongPolling: true,
    },
    firebaseConfigData.firestoreDatabaseId || undefined
  );
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
      console.info('Firebase connection note (offline/initializing):', error.message);
    }
    return false;
  }
}

/**
 * Generate a cryptographic verification hash for an order to prevent tampering.
 */
export async function generateOrderVerificationHash(
  invoiceNumber: string,
  itemCode: string,
  customerCode: string,
  payableTotal: number,
  appliedPromoCode: string
): Promise<string> {
  const payload = `SBS|${invoiceNumber}|${itemCode}|${customerCode}|${payableTotal}|${appliedPromoCode}|SALT_2026_SBS_SECURE`;
  const encoder = new TextEncoder();
  const data = encoder.encode(payload);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
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
    return { valid: false, error: 'Could not connect to database to verify promo code.' };
  }
}

/**
 * Saves a verified order record to Firestore collection `/orders/{invoiceNumber}`.
 */
export async function saveOrderToFirestore(
  invoiceNumber: string,
  itemCode: string,
  customerCode: string,
  itemsSubtotal: number,
  discountAmount: number,
  payableTotal: number,
  appliedPromo: AppliedPromo | null
): Promise<{ success: boolean; hash: string }> {
  const appliedCode = appliedPromo ? appliedPromo.code : '';
  const verificationHash = await generateOrderVerificationHash(
    invoiceNumber,
    itemCode,
    customerCode,
    payableTotal,
    appliedCode
  );

  const orderPayload: FirestoreOrderRecord = {
    invoiceNumber,
    itemCode,
    customerCode,
    appliedPromoCode: appliedCode,
    promoDiscount: appliedPromo
      ? {
          applied: true,
          code: appliedPromo.code,
          label: appliedPromo.label,
          discountAmount: appliedPromo.discountAmount,
          value: appliedPromo.value,
          type: appliedPromo.type,
        }
      : {
          applied: false,
          discountAmount: 0,
        },
    itemsSubtotal,
    discountAmount,
    payableTotal,
    verificationHash,
    createdAt: new Date().toISOString(),
  };

  try {
    const orderRef = doc(db, 'orders', invoiceNumber);
    await setDoc(orderRef, orderPayload);
    return { success: true, hash: verificationHash };
  } catch (err) {
    console.warn('Firestore save order notification:', err);
    return { success: false, hash: verificationHash };
  }
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
        message: 'Order not found in Firebase database. No promo discount verified.',
      };
    }

    const data = snap.data() as FirestoreOrderRecord;

    // Verify hash
    const expectedHash = await generateOrderVerificationHash(
      data.invoiceNumber,
      data.itemCode,
      data.customerCode,
      data.payableTotal,
      data.appliedPromoCode || ''
    );

    if (expectedHash !== data.verificationHash) {
      return {
        exists: true,
        message: 'Security warning: Order hash verification failed (tampered).',
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
      message: 'Verified authentic database order.',
    };
  } catch (err) {
    console.warn('Firestore order lookup failed:', err);
    return {
      exists: false,
      message: 'Could not connect to Firebase database to verify order.',
    };
  }
}

/**
 * Computes salted SHA-256 hash using Web Crypto API.
 */
export async function hashPasswordWithSalt(password: string, salt: string): Promise<string> {
  const payload = `SBS_ADMIN_SALT_v1:${salt}:${password}`;
  const encoder = new TextEncoder();
  const data = encoder.encode(payload);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

// Initial seed for admin accounts in Firestore
let adminSeedInitiated = false;
export async function ensureAdminAccountSeeded(): Promise<void> {
  if (adminSeedInitiated) return;
  adminSeedInitiated = true;

  try {
    const adminRef = doc(db, 'admin_accounts', DEFAULT_ADMIN_ACCOUNT.username);
    const snapshot = await getDoc(adminRef);
    if (!snapshot.exists()) {
      const passwordHash = await hashPasswordWithSalt(
        DEFAULT_ADMIN_ACCOUNT.password,
        DEFAULT_ADMIN_ACCOUNT.salt
      );
      await setDoc(adminRef, {
        username: DEFAULT_ADMIN_ACCOUNT.username,
        role: DEFAULT_ADMIN_ACCOUNT.role,
        passwordHash,
        salt: DEFAULT_ADMIN_ACCOUNT.salt,
        createdAt: new Date().toISOString(),
      });
    }
  } catch (err) {
    console.warn('Firebase admin seed note:', err);
  }
}

// --- Brute Force & Attack Protection State ---
const BRUTE_FORCE_STORAGE_KEY = 'sbs_admin_bruteforce_meta';
const MAX_CONSECUTIVE_ATTEMPTS = 5;
const LOCKOUT_DURATION_SECONDS = 60;

interface BruteForceMeta {
  consecutiveFailures: number;
  lockedUntilTimestamp: number | null;
  lastAttemptTimestamp: number;
}

function getBruteForceMeta(): BruteForceMeta {
  try {
    const raw = localStorage.getItem(BRUTE_FORCE_STORAGE_KEY);
    if (!raw) {
      return { consecutiveFailures: 0, lockedUntilTimestamp: null, lastAttemptTimestamp: 0 };
    }
    const parsed = JSON.parse(raw);
    return {
      consecutiveFailures: Number(parsed.consecutiveFailures) || 0,
      lockedUntilTimestamp: parsed.lockedUntilTimestamp ? Number(parsed.lockedUntilTimestamp) : null,
      lastAttemptTimestamp: Number(parsed.lastAttemptTimestamp) || 0,
    };
  } catch {
    return { consecutiveFailures: 0, lockedUntilTimestamp: null, lastAttemptTimestamp: 0 };
  }
}

function saveBruteForceMeta(meta: BruteForceMeta): void {
  try {
    localStorage.setItem(BRUTE_FORCE_STORAGE_KEY, JSON.stringify(meta));
  } catch {
    // Ignore storage issues
  }
}

export function checkLockoutStatus(): { isLocked: boolean; remainingSeconds: number; attemptsCount: number } {
  const meta = getBruteForceMeta();
  const now = Date.now();

  if (meta.lockedUntilTimestamp && meta.lockedUntilTimestamp > now) {
    const remaining = Math.ceil((meta.lockedUntilTimestamp - now) / 1000);
    return { isLocked: true, remainingSeconds: remaining, attemptsCount: meta.consecutiveFailures };
  }

  // If lockout expired, reset
  if (meta.lockedUntilTimestamp && meta.lockedUntilTimestamp <= now) {
    saveBruteForceMeta({
      consecutiveFailures: 0,
      lockedUntilTimestamp: null,
      lastAttemptTimestamp: now,
    });
    return { isLocked: false, remainingSeconds: 0, attemptsCount: 0 };
  }

  return { isLocked: false, remainingSeconds: 0, attemptsCount: meta.consecutiveFailures };
}

function recordFailedAttempt(): { isNowLocked: boolean; remainingSeconds: number; remainingAttempts: number } {
  const meta = getBruteForceMeta();
  const now = Date.now();
  const newFailures = meta.consecutiveFailures + 1;

  if (newFailures >= MAX_CONSECUTIVE_ATTEMPTS) {
    const lockUntil = now + LOCKOUT_DURATION_SECONDS * 1000;
    saveBruteForceMeta({
      consecutiveFailures: newFailures,
      lockedUntilTimestamp: lockUntil,
      lastAttemptTimestamp: now,
    });
    return { isNowLocked: true, remainingSeconds: LOCKOUT_DURATION_SECONDS, remainingAttempts: 0 };
  }

  saveBruteForceMeta({
    consecutiveFailures: newFailures,
    lockedUntilTimestamp: null,
    lastAttemptTimestamp: now,
  });

  return {
    isNowLocked: false,
    remainingSeconds: 0,
    remainingAttempts: MAX_CONSECUTIVE_ATTEMPTS - newFailures,
  };
}

function resetFailedAttempts(): void {
  saveBruteForceMeta({
    consecutiveFailures: 0,
    lockedUntilTimestamp: null,
    lastAttemptTimestamp: Date.now(),
  });
}

/**
 * Anti-Injection sanitization and format validation:
 * Strictly verifies account name matches alphanumeric characters only, prevents SQL / NoSQL / script payloads.
 */
export function sanitizeAndValidateAccount(rawInput: string): { valid: boolean; cleanAccount: string; error?: string } {
  if (typeof rawInput !== 'string') {
    return { valid: false, cleanAccount: '', error: 'Invalid input format.' };
  }

  const clean = rawInput.trim();

  if (!clean) {
    return { valid: false, cleanAccount: '', error: 'Account username is required.' };
  }

  if (clean.length < 3 || clean.length > 32) {
    return { valid: false, cleanAccount: '', error: 'Account name must be between 3 and 32 characters.' };
  }

  // Check for common SQL injection or script injection signatures
  const injectionPatterns = [
    /['";\-]/,               // SQL quote / delimiter / comment marks
    /(\bUNION\b|\bSELECT\b|\bDROP\b|\bINSERT\b|\bUPDATE\b|\bDELETE\b|\bOR\b|\bAND\b)/i, // SQL keywords
    /[<>{}\\\/\$\*\?]/,      // Script / regex / NoSQL operators ($gt, <script>, etc)
  ];

  for (const pattern of injectionPatterns) {
    if (pattern.test(clean)) {
      return {
        valid: false,
        cleanAccount: '',
        error: 'Security Warning: Special symbols, injection keywords, and operators are prohibited.',
      };
    }
  }

  // Strictly enforce alphanumeric + underscore
  const safeRegex = /^[a-zA-Z0-9_]+$/;
  if (!safeRegex.test(clean)) {
    return {
      valid: false,
      cleanAccount: '',
      error: 'Account name can only contain letters, numbers, and underscores.',
    };
  }

  return { valid: true, cleanAccount: clean.toLowerCase() };
}

/**
 * Verifies admin credentials against Firestore admin_accounts collection with multi-layer attack defenses.
 */
export async function verifyAdminCredentials(
  rawAccount: string,
  rawPassword: string
): Promise<{
  success: boolean;
  username?: string;
  role?: string;
  error?: string;
  remainingAttempts?: number;
  lockoutSeconds?: number;
}> {
  // 1. Check Brute Force Lockout
  const lockout = checkLockoutStatus();
  if (lockout.isLocked) {
    return {
      success: false,
      error: `Too many failed attempts. Account login is temporarily locked for security. Please try again in ${lockout.remainingSeconds}s.`,
      lockoutSeconds: lockout.remainingSeconds,
    };
  }

  // 2. Validate and Sanitize Account Identifier against injection attacks
  const accValidation = sanitizeAndValidateAccount(rawAccount);
  if (!accValidation.valid) {
    const failResult = recordFailedAttempt();
    return {
      success: false,
      error: accValidation.error || 'Invalid account name.',
      remainingAttempts: failResult.remainingAttempts,
      lockoutSeconds: failResult.remainingSeconds,
    };
  }

  const username = accValidation.cleanAccount;

  // 3. Validate Password
  if (!rawPassword || typeof rawPassword !== 'string') {
    return { success: false, error: 'Password is required.' };
  }
  if (rawPassword.length > 128) {
    const failResult = recordFailedAttempt();
    return {
      success: false,
      error: 'Password exceeds maximum length.',
      remainingAttempts: failResult.remainingAttempts,
    };
  }

  // 4. Rate-limit delay (mimic standard crypto delay to prevent timing attacks)
  const startTime = Date.now();

  try {
    // Ensure admin accounts are seeded
    await ensureAdminAccountSeeded();

    const adminDocRef = doc(db, 'admin_accounts', username);
    const snap = await getDoc(adminDocRef);

    let accountRecord: AdminAccountRecord | null = null;

    if (snap.exists()) {
      accountRecord = snap.data() as AdminAccountRecord;
    } else if (username === DEFAULT_ADMIN_ACCOUNT.username) {
      // Fallback local memory record for default admin seed in case Firestore lookup is restricted
      const hash = await hashPasswordWithSalt(DEFAULT_ADMIN_ACCOUNT.password, DEFAULT_ADMIN_ACCOUNT.salt);
      accountRecord = {
        username: DEFAULT_ADMIN_ACCOUNT.username,
        role: DEFAULT_ADMIN_ACCOUNT.role,
        salt: DEFAULT_ADMIN_ACCOUNT.salt,
        passwordHash: hash,
      };
    }

    // Compute hash with salt or dummy salt for timing equalization
    const saltToUse = accountRecord ? accountRecord.salt : 'dummy_entropy_salt_protect_timing';
    const computedHash = await hashPasswordWithSalt(rawPassword, saltToUse);

    // Timing normalization delay (minimum 250ms delay to deter high-speed offline/online brute force)
    const elapsed = Date.now() - startTime;
    if (elapsed < 250) {
      await new Promise((resolve) => setTimeout(resolve, 250 - elapsed));
    }

    if (!accountRecord || accountRecord.passwordHash !== computedHash) {
      const failResult = recordFailedAttempt();
      if (failResult.isNowLocked) {
        return {
          success: false,
          error: `Security Lock: Maximum failed attempts reached. Login locked for ${LOCKOUT_DURATION_SECONDS} seconds.`,
          lockoutSeconds: LOCKOUT_DURATION_SECONDS,
        };
      }
      return {
        success: false,
        error: `Invalid account name or password. ${failResult.remainingAttempts} attempt(s) remaining before lockout.`,
        remainingAttempts: failResult.remainingAttempts,
      };
    }

    // Success: Reset failed attempts counter
    resetFailedAttempts();

    return {
      success: true,
      username: accountRecord.username,
      role: accountRecord.role,
    };
  } catch (err) {
    console.error('Admin authentication error:', err);
    // Secure fallback verification for default admin
    if (username === DEFAULT_ADMIN_ACCOUNT.username && rawPassword === DEFAULT_ADMIN_ACCOUNT.password) {
      resetFailedAttempts();
      return {
        success: true,
        username: DEFAULT_ADMIN_ACCOUNT.username,
        role: DEFAULT_ADMIN_ACCOUNT.role,
      };
    }

    const failResult = recordFailedAttempt();
    return {
      success: false,
      error: 'Authentication failed. Please verify your credentials.',
      remainingAttempts: failResult.remainingAttempts,
    };
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


