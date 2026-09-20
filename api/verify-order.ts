import { createHmac } from 'crypto';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

const REQUIRED_PROJECT_ID = 'shop-speedabraker';

let dbInstance: Firestore | null = null;

function getDb(): Firestore {
  if (dbInstance) return dbInstance;

  if (getApps().length === 0) {
    if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
      let serviceAccountCert: any;
      try {
        serviceAccountCert = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
      } catch (err: any) {
        console.error('Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY JSON:', err?.message || err);
        throw new Error('Server configuration error.');
      }

      if (!serviceAccountCert || serviceAccountCert.project_id !== REQUIRED_PROJECT_ID) {
        console.error(
          `Firebase service account project_id mismatch: expected "${REQUIRED_PROJECT_ID}", got "${serviceAccountCert?.project_id}"`
        );
        throw new Error('Server configuration error.');
      }

      initializeApp({
        credential: cert(serviceAccountCert),
      });
    } else if (
      process.env.FIREBASE_PROJECT_ID &&
      process.env.FIREBASE_CLIENT_EMAIL &&
      process.env.FIREBASE_PRIVATE_KEY
    ) {
      if (process.env.FIREBASE_PROJECT_ID !== REQUIRED_PROJECT_ID) {
        console.error(
          `Firebase project_id mismatch: expected "${REQUIRED_PROJECT_ID}", got "${process.env.FIREBASE_PROJECT_ID}"`
        );
        throw new Error('Server configuration error.');
      }

      initializeApp({
        credential: cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        }),
      });
    } else {
      console.error(
        'Missing Firebase credentials: neither FIREBASE_SERVICE_ACCOUNT_KEY nor FIREBASE_PROJECT_ID/FIREBASE_CLIENT_EMAIL/FIREBASE_PRIVATE_KEY configured.'
      );
      throw new Error('Server configuration error.');
    }
  }

  dbInstance = getFirestore();
  return dbInstance;
}

export default async function handler(req: any, res: any) {
  // CORS Configuration using ALLOWED_ORIGIN env var
  const allowedOrigin = process.env.ALLOWED_ORIGIN || '';
  if (allowedOrigin) {
    res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    return res.status(200).json({
      status: 'active',
      service: "Speedabraker's Shop Order Verification API",
      timestamp: new Date().toISOString(),
    });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Mandatory signing secret check: return 500 if missing (no fallback secret)
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

  const invoiceNumber = typeof body?.invoiceNumber === 'string' ? body.invoiceNumber.trim() : '';
  if (!invoiceNumber) {
    return res.status(400).json({
      error: 'Missing required field: invoiceNumber.',
    });
  }

  try {
    const db = getDb();
    const orderDoc = await db.collection('orders').doc(invoiceNumber).get();

    if (!orderDoc.exists) {
      return res.status(404).json({
        verified: false,
        error: 'Order not found.',
      });
    }

    const storedOrder = orderDoc.data();
    if (!storedOrder) {
      return res.status(404).json({
        verified: false,
        error: 'Order record is empty.',
      });
    }

    // Extract STORED values directly from Firestore database (never use client-sent totals)
    const storedItemCode = typeof storedOrder.itemCode === 'string' ? storedOrder.itemCode : '';
    const storedCustomerCode = typeof storedOrder.customerCode === 'string' ? storedOrder.customerCode : '';
    const storedPayableTotal = typeof storedOrder.payableTotal === 'number' ? storedOrder.payableTotal : 0;
    const storedPromoCode =
      typeof storedOrder.appliedPromoCode === 'string'
        ? storedOrder.appliedPromoCode
        : typeof storedOrder.promoDiscount?.code === 'string'
        ? storedOrder.promoDiscount.code
        : '';
    const storedHash = typeof storedOrder.verificationHash === 'string' ? storedOrder.verificationHash : '';

    // Recompute expected hash using stored database values
    const message = `ORDER_INTEGRITY_V2:${invoiceNumber}:${storedItemCode}:${storedCustomerCode}:${storedPayableTotal}:${storedPromoCode}`;
    const expectedServerHash = createHmac('sha256', signingSecret).update(message).digest('hex');

    const isVerified = Boolean(storedHash && storedHash === expectedServerHash);

    return res.status(200).json({
      verified: isVerified,
      tamperDetected: !isVerified,
      invoiceNumber,
    });
  } catch (err: any) {
    // Sanitized error response - never return stack traces or internal errors
    console.error('Order verification API error in api/verify-order:', err?.message || err);
    if (err?.message === 'Server configuration error.') {
      return res.status(500).json({ error: 'Server configuration error.' });
    }
    return res.status(500).json({ error: 'Internal server error validating order integrity.' });
  }
}
