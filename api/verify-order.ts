import { createHmac } from 'crypto';

interface OrderVerificationPayload {
  invoiceNumber: string;
  itemCode: string;
  customerCode: string;
  itemsSubtotal: number;
  discountAmount: number;
  payableTotal: number;
  appliedPromoCode?: string;
}

const SERVER_SALT = process.env.ORDER_VERIFICATION_SECRET || 'SBS_SERVER_VERIFY_SALT_2026_x9k';

function computeServerHash(
  invoiceNumber: string,
  itemCode: string,
  customerCode: string,
  payableTotal: number,
  appliedPromo: string
): string {
  const message = `ORDER_INTEGRITY_V2:${invoiceNumber}:${itemCode}:${customerCode}:${payableTotal}:${appliedPromo}`;
  return createHmac('sha256', SERVER_SALT).update(message).digest('hex');
}

export default async function handler(req: any, res: any) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
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

  try {
    const body: OrderVerificationPayload = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;

    const {
      invoiceNumber,
      itemCode,
      customerCode,
      itemsSubtotal,
      discountAmount,
      payableTotal,
      appliedPromoCode = '',
    } = body;

    // Validate parameters
    if (!invoiceNumber || !itemCode || !customerCode || typeof payableTotal !== 'number') {
      return res.status(400).json({
        error: 'Missing required order fields: invoiceNumber, itemCode, customerCode, payableTotal.',
      });
    }

    // Mathematical sanity check: payableTotal must equal max(0, itemsSubtotal - discountAmount)
    const expectedPayable = Math.max(0, Math.round((itemsSubtotal || 0) - (discountAmount || 0)));
    const tamperDetected = Math.abs(payableTotal - expectedPayable) > 1;

    // Compute cryptographic server hash
    const serverHash = computeServerHash(
      invoiceNumber,
      itemCode,
      customerCode,
      payableTotal,
      appliedPromoCode
    );

    return res.status(200).json({
      verified: !tamperDetected,
      tamperDetected,
      expectedPayableTotal: expectedPayable,
      serverHash,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error('Order verification API error:', err);
    return res.status(500).json({ error: 'Internal server error validating order integrity' });
  }
}
