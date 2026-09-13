import { AppliedPromo } from '../types';
import { validatePromoCodeWithFirestore } from '../lib/firebase';

/**
 * SPEEDABRAKER SHOP - SECURE PROMO CODE SUBSYSTEM (FIREBASE BACKED)
 *
 * All promo codes and discounts are verified in real-time against Firebase Firestore.
 * Suffixes like D10/D20 on customer codes are strictly ignored and rejected to prevent
 * spoofing or unauthorized discounts.
 */

const PROMO_SALT = 'SBS_PROMO_V1_2026';

export interface PromoTierConfig {
  tierId: string;
  type: 'percent' | 'flat';
  value: number;
  label: string;
}

export const PROMO_TIERS: Record<string, PromoTierConfig> = {
  D10: { tierId: 'D10', type: 'percent', value: 10, label: '10% Discount' },
  D15: { tierId: 'D15', type: 'percent', value: 15, label: '15% Special Discount' },
  D20: { tierId: 'D20', type: 'percent', value: 20, label: '20% Premium Discount' },
  D50: { tierId: 'D50', type: 'percent', value: 50, label: '50% Half Price Discount' },
  F10: { tierId: 'F10', type: 'flat', value: 100, label: '₹100 Flat Discount' },
  F20: { tierId: 'F20', type: 'flat', value: 200, label: '₹200 VIP Flat Discount' },
  F50: { tierId: 'F50', type: 'flat', value: 500, label: '₹500 Mega Flat Discount' },
};

/**
 * Computes salted SHA-256 hash using standard Web Cryptography API.
 */
export async function hashPromoCode(input: string): Promise<string> {
  const normalized = input.trim().toUpperCase();
  const payload = `${PROMO_SALT}:${normalized}`;
  const enc = new TextEncoder();
  const data = enc.encode(payload);

  if (typeof crypto !== 'undefined' && crypto.subtle && crypto.subtle.digest) {
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  }

  return payload;
}

/**
 * Validates a user-entered promo code securely against Firebase Firestore database.
 */
export async function validatePromoCode(
  rawInput: string,
  subtotal: number
): Promise<{ valid: boolean; promo?: AppliedPromo; error?: string }> {
  return validatePromoCodeWithFirestore(rawInput, subtotal);
}

/**
 * Calculates discount and payable total given a subtotal and optional applied promo.
 */
export function calculateDiscount(
  subtotal: number,
  promo: AppliedPromo | null
): { discountAmount: number; finalTotal: number } {
  if (!promo) {
    return { discountAmount: 0, finalTotal: Math.max(0, subtotal) };
  }

  let discountAmount = 0;
  if (promo.type === 'percent') {
    discountAmount = Math.min(subtotal, Math.round((subtotal * promo.value) / 100));
  } else {
    discountAmount = Math.min(subtotal, promo.value);
  }

  const finalTotal = Math.max(0, subtotal - discountAmount);
  return { discountAmount, finalTotal };
}

/**
 * Retrieves promo configuration by its tier ID.
 */
export function getPromoDetailsByTier(
  tierId: string,
  subtotal: number,
  originalCodeDisplay?: string
): AppliedPromo | null {
  const tier = PROMO_TIERS[tierId.toUpperCase()];
  if (!tier) return null;

  const discountAmount =
    tier.type === 'percent'
      ? Math.min(subtotal, Math.round((subtotal * tier.value) / 100))
      : Math.min(subtotal, tier.value);

  return {
    code: originalCodeDisplay || tier.label,
    tierId: tier.tierId,
    type: tier.type,
    value: tier.value,
    label: tier.label,
    discountAmount,
  };
}

/**
 * Extracts the base random customer code (preserving the order's unique random identity).
 * Strips any legacy or spoofed promo suffixes (e.g. 'D10', 'D20', 'F10', etc.).
 */
export function extractBaseCustomerCode(customerCode: string): string {
  if (!customerCode) return '';
  return customerCode.replace(/(?:D\d{2}|F\d{2}|P\d{2})$/i, '');
}

/**
 * Strictly returns null for unverified string suffixes.
 * Discounts MUST be verified in Firebase database, not parsed from customer code strings.
 */
export function extractPromoTierFromCustomerCode(_customerCode: string): string | null {
  return null;
}

/**
 * Customer code is kept clean and random; does NOT embed unverified promo suffixes.
 */
export function embedPromoInCustomerCode(baseCustomerCode: string, _tierId?: string): string {
  return extractBaseCustomerCode(baseCustomerCode);
}

