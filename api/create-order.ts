import { createHmac } from 'crypto';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

export interface PricingCatalog {
  version: {
    V1: number;
    V2: number;
    None: number;
  };
  display: {
    Yes: number;
    No: number;
    None: number;
  };
  wireless: {
    Yes: number;
    No: number;
    None: number;
  };
  antenna: {
    baseSocket: number;
    quality: {
      Normal: number;
      Powerful: number;
    };
    dbi: {
      '0dbi': number;
      '6dbi': number;
      '12dbi': number;
    };
  };
  mandatoryModules: number;
}

const DEFAULT_PRICING_CATALOG: PricingCatalog = {
  version: {
    V1: 100,
    V2: 300,
    None: 0,
  },
  display: {
    Yes: 300,
    No: 0,
    None: 0,
  },
  wireless: {
    Yes: 700,
    No: 0,
    None: 0,
  },
  antenna: {
    baseSocket: 50,
    quality: {
      Normal: 200,
      Powerful: 700,
    },
    dbi: {
      '0dbi': 100,
      '6dbi': 150,
      '12dbi': 450,
    },
  },
  mandatoryModules: 700,
};

let dbInstance: Firestore | null = null;

function getDb(): Firestore {
  if (dbInstance) return dbInstance;

  if (getApps().length === 0) {
    if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
      try {
        const serviceAccountCert = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
        initializeApp({
          credential: cert(serviceAccountCert),
        });
      } catch {
        initializeApp({
          projectId: process.env.VITE_FIREBASE_PROJECT_ID || 'speedabrakers-shop-10a95',
        });
      }
    } else if (
      process.env.FIREBASE_PROJECT_ID &&
      process.env.FIREBASE_CLIENT_EMAIL &&
      process.env.FIREBASE_PRIVATE_KEY
    ) {
      initializeApp({
        credential: cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        }),
      });
    } else {
      initializeApp({
        projectId: process.env.VITE_FIREBASE_PROJECT_ID || process.env.GCLOUD_PROJECT || 'speedabrakers-shop-10a95',
      });
    }
  }

  dbInstance = getFirestore();
  return dbInstance;
}

function applyPsychologicalPricing(amount: number): number {
  if (amount <= 0) return 0;
  return Math.max(0, Math.round(amount) - 1);
}

function generateRandomCustomerCode(): string {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

function computeItemCode(
  versionVal: string,
  displayVal: string,
  wirelessVal: string,
  slots: Array<{ id: number; value: string }>,
  antennaDbiTypes: Record<number, string | undefined>
): string {
  const v = versionVal === 'V1' ? 1 : versionVal === 'V2' ? 2 : 0;
  const d = displayVal === 'Yes' ? 1 : 0;
  const w = wirelessVal === 'Yes' ? 1 : 0;

  const getSlotState = (slotId: number): number => {
    const slot = slots.find((s) => s.id === slotId);
    if (!slot || slot.value.toLowerCase() === 'none') return 0;
    const isPowerful = slot.value.toLowerCase() === 'powerful';
    const rawDbi = antennaDbiTypes[slotId];
    const dbi = rawDbi ? rawDbi.toLowerCase().replace(/\s+/g, '') : '';
    let dbiOffset = 0;
    if (dbi === '6dbi') dbiOffset = 1;
    else if (dbi === '12dbi') dbiOffset = 2;

    return (isPowerful ? 4 : 1) + dbiOffset;
  };

  const s1 = getSlotState(1);
  const s2 = getSlotState(2);
  const s3 = getSlotState(3);
  const s4 = getSlotState(4);

  let intVal = v;
  intVal = intVal * 2 + d;
  intVal = intVal * 2 + w;
  intVal = intVal * 7 + s1;
  intVal = intVal * 7 + s2;
  intVal = intVal * 7 + s3;
  intVal = intVal * 7 + s4;

  return intVal.toString(36).toUpperCase().padStart(3, '0');
}

export default async function handler(req: any, res: any) {
  // CORS configuration
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // 4. HMAC secret verification: fail immediately if missing
  const signingSecret = process.env.ORDER_SIGNING_SECRET;
  if (!signingSecret) {
    return res.status(500).json({
      error: 'Server configuration error: ORDER_SIGNING_SECRET environment variable is missing.',
    });
  }

  let body: any;
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  } catch {
    return res.status(400).json({ error: 'Malformed JSON payload.' });
  }

  if (!body || typeof body !== 'object') {
    return res.status(400).json({ error: 'Request body must be a valid JSON object.' });
  }

  // Extract and normalize hardware inputs (never accept client-sent prices)
  let versionVal = 'None';
  let displayVal = 'None';
  let wirelessVal = 'None';

  if (Array.isArray(body.upperBoxes)) {
    const vBox = body.upperBoxes.find((b: any) => String(b.label).toLowerCase() === 'version');
    const dBox = body.upperBoxes.find((b: any) => String(b.label).toLowerCase() === 'display');
    const wBox = body.upperBoxes.find((b: any) => String(b.label).toLowerCase() === 'wireless');
    if (vBox?.value) versionVal = String(vBox.value).trim();
    if (dBox?.value) displayVal = String(dBox.value).trim();
    if (wBox?.value) wirelessVal = String(wBox.value).trim();
  } else {
    if (typeof body.version === 'string') versionVal = body.version.trim();
    if (typeof body.display === 'string') displayVal = body.display.trim();
    else if (typeof body.display === 'boolean') displayVal = body.display ? 'Yes' : 'No';
    if (typeof body.wireless === 'string') wirelessVal = body.wireless.trim();
    else if (typeof body.wireless === 'boolean') wirelessVal = body.wireless ? 'Yes' : 'No';
  }

  // Validate hardware option values
  if (!['V1', 'V2', 'None'].includes(versionVal)) {
    return res.status(400).json({ error: 'Invalid firmware version selected.' });
  }
  if (!['Yes', 'No', 'None'].includes(displayVal)) {
    return res.status(400).json({ error: 'Invalid display option selected.' });
  }
  if (!['Yes', 'No', 'None'].includes(wirelessVal)) {
    return res.status(400).json({ error: 'Invalid wireless option selected.' });
  }

  // Validate slots
  const validSlotQualities = ['none', 'yes', 'conf', 'normal', 'powerful'];
  const rawSlots = Array.isArray(body.slots) ? body.slots : [];
  const normalizedSlots: Array<{ id: number; value: string }> = [1, 2, 3, 4].map((id) => {
    const found = rawSlots.find((s: any) => Number(s.id) === id);
    if (!found || typeof found.value !== 'string') {
      return { id, value: 'None' };
    }
    const val = found.value.trim();
    return {
      id,
      value: validSlotQualities.includes(val.toLowerCase()) ? val : 'None',
    };
  });

  // Validate antenna dBi types
  const validDbiList = ['0dbi', '6dbi', '12dbi'];
  const rawDbiMap = body.antennaDbiTypes && typeof body.antennaDbiTypes === 'object' ? body.antennaDbiTypes : {};
  const normalizedDbiTypes: Record<number, string | undefined> = {};
  for (let i = 1; i <= 4; i++) {
    const rawVal = rawDbiMap[i] ?? rawDbiMap[String(i)];
    if (typeof rawVal === 'string') {
      const cleanVal = rawVal.toLowerCase().replace(/\s+/g, '');
      if (validDbiList.includes(cleanVal)) {
        normalizedDbiTypes[i] = cleanVal;
      }
    }
  }

  // Validate or generate customer code (must be non-empty alphanumeric, max 32 chars)
  let customerCode = '';
  if (typeof body.customerCode === 'string' && /^[A-Za-z0-9]{3,32}$/.test(body.customerCode.trim())) {
    customerCode = body.customerCode.trim().toUpperCase();
  } else {
    customerCode = generateRandomCustomerCode();
  }

  // Promo code input
  const promoCodeString =
    typeof body.promoCode === 'string'
      ? body.promoCode.trim().toUpperCase()
      : typeof body.appliedPromoCode === 'string'
      ? body.appliedPromoCode.trim().toUpperCase()
      : '';

  try {
    const db = getDb();

    // 1. Load prices from Firestore config/pricing (fallback DEFAULT_PRICING_CATALOG)
    let catalog: PricingCatalog = { ...DEFAULT_PRICING_CATALOG };
    try {
      const pricingSnap = await db.collection('config').doc('pricing').get();
      if (pricingSnap.exists) {
        const remoteData = pricingSnap.data();
        if (remoteData) {
          catalog = {
            version: { ...DEFAULT_PRICING_CATALOG.version, ...(remoteData.version || {}) },
            display: { ...DEFAULT_PRICING_CATALOG.display, ...(remoteData.display || {}) },
            wireless: { ...DEFAULT_PRICING_CATALOG.wireless, ...(remoteData.wireless || {}) },
            antenna: {
              ...DEFAULT_PRICING_CATALOG.antenna,
              ...(remoteData.antenna || {}),
              quality: {
                ...DEFAULT_PRICING_CATALOG.antenna.quality,
                ...(remoteData.antenna?.quality || {}),
              },
              dbi: {
                ...DEFAULT_PRICING_CATALOG.antenna.dbi,
                ...(remoteData.antenna?.dbi || {}),
              },
            },
            mandatoryModules:
              typeof remoteData.mandatoryModules === 'number'
                ? remoteData.mandatoryModules
                : DEFAULT_PRICING_CATALOG.mandatoryModules,
          };
        }
      }
    } catch {
      // Offline / fallback to DEFAULT_PRICING_CATALOG
    }

    // 2. Recompute subtotal on the server
    let rawHardwareTotal = 0;
    if (versionVal === 'V1') rawHardwareTotal += catalog.version.V1;
    else if (versionVal === 'V2') rawHardwareTotal += catalog.version.V2;

    if (displayVal === 'Yes') rawHardwareTotal += catalog.display.Yes;
    if (wirelessVal === 'Yes') rawHardwareTotal += catalog.wireless.Yes;

    for (const slot of normalizedSlots) {
      const val = slot.value.toLowerCase();
      if (val === 'yes' || val === 'conf') {
        rawHardwareTotal += catalog.antenna.baseSocket;
      } else if (val === 'normal') {
        rawHardwareTotal += catalog.antenna.baseSocket + catalog.antenna.quality.Normal;
      } else if (val === 'powerful') {
        rawHardwareTotal += catalog.antenna.baseSocket + catalog.antenna.quality.Powerful;
      }

      if (val !== 'none') {
        const dbi = normalizedDbiTypes[slot.id];
        if (dbi && dbi in catalog.antenna.dbi) {
          rawHardwareTotal += catalog.antenna.dbi[dbi as keyof typeof catalog.antenna.dbi];
        }
      }
    }

    const rawGrandTotal = rawHardwareTotal + (catalog.mandatoryModules || 700);
    const itemsSubtotal = applyPsychologicalPricing(rawGrandTotal);

    // 3. Validate promo code against Firestore
    let discountAmount = 0;
    let appliedPromo: any = null;

    if (promoCodeString) {
      const promoSnap = await db.collection('promo_codes').doc(promoCodeString).get();
      if (!promoSnap.exists) {
        return res.status(400).json({
          error: `Promo code "${promoCodeString}" is invalid or does not exist.`,
        });
      }

      const promoData = promoSnap.data();
      if (!promoData || !promoData.active) {
        return res.status(400).json({
          error: `Promo code "${promoCodeString}" is currently inactive.`,
        });
      }

      if (typeof promoData.minOrderValue === 'number' && itemsSubtotal < promoData.minOrderValue) {
        return res.status(400).json({
          error: `Minimum order amount of ₹${promoData.minOrderValue} required for promo code "${promoCodeString}".`,
        });
      }

      if (promoData.type === 'percent') {
        discountAmount = Math.min(
          itemsSubtotal,
          Math.round((itemsSubtotal * Number(promoData.value || 0)) / 100)
        );
      } else {
        discountAmount = Math.min(itemsSubtotal, Number(promoData.value || 0));
      }

      appliedPromo = {
        applied: true,
        code: promoData.code || promoCodeString,
        label: promoData.label || `${promoCodeString} discount`,
        value: promoData.value,
        type: promoData.type,
        discountAmount,
      };
    }

    const payableTotal = Math.max(0, itemsSubtotal - discountAmount);

    // Deterministic item code & invoice number
    const itemCode = computeItemCode(versionVal, displayVal, wirelessVal, normalizedSlots, normalizedDbiTypes);
    const invoiceNumber = `SBS-${itemCode}-${customerCode}`;

    // 4. Create HMAC-SHA256 hash using process.env.ORDER_SIGNING_SECRET
    const appliedCodeStr = appliedPromo ? appliedPromo.code : '';
    const message = `ORDER_INTEGRITY_V2:${invoiceNumber}:${itemCode}:${customerCode}:${payableTotal}:${appliedCodeStr}`;
    const verificationHash = createHmac('sha256', signingSecret).update(message).digest('hex');

    // 5. Write order using Admin SDK
    const nowIso = new Date().toISOString();
    const orderRecord = {
      invoiceNumber,
      itemCode,
      customerCode,
      appliedPromoCode: appliedCodeStr,
      promoDiscount: appliedPromo || { applied: false, discountAmount: 0 },
      itemsSubtotal,
      discountAmount,
      payableTotal,
      verificationHash,
      hardware: {
        version: versionVal,
        display: displayVal,
        wireless: wirelessVal,
        slots: normalizedSlots,
        antennaDbiTypes: normalizedDbiTypes,
      },
      createdAt: nowIso,
    };

    await db.collection('orders').doc(invoiceNumber).set(orderRecord);

    // Return invoice data
    return res.status(201).json({
      success: true,
      invoiceNumber,
      itemCode,
      customerCode,
      itemsSubtotal,
      discountAmount,
      payableTotal,
      appliedPromo,
      verificationHash,
      createdAt: nowIso,
    });
  } catch (err: any) {
    // Never return stack traces or database errors to the client
    console.error('Create order error in api/create-order:', err?.message || err);
    return res.status(500).json({ error: 'Internal server error processing order.' });
  }
}
