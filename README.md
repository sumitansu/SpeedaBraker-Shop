# Speedabraker's Shop — Project Documentation & Audit Record

> **Notice for Collaborating AI Assistants & Developers:**  
> This `README.md` documents the project status, security audit findings, and architectural roadmap established for **Speedabraker's Shop**. Any AI assistant or engineer working on this repository MUST maintain and update this document after implementing code changes or completing subsequent project phases, preserving full context, verified scope, and technical continuity.

---

# Phase 0 — Audit & Architecture Report

## Project Overview
- **Application**: Speedabraker's Shop
- **Stack**: React 19 + TypeScript + Vite 6 + Tailwind CSS 4 + Firebase (Firestore & Auth, JS SDK v12) + i18next + Motion
- **Hosting Target**: Vercel (Hobby Tier)
- **Core Functionality**: Step-by-step hardware configurator (Firmware, Display, Wireless, Antennas, Quality, Type), live charm/psychological pricing calculations, itemized billing and invoice generator, promo code engine, order verification, and admin configuration canvas.

---

## 1. Places Trusting Client-Side Data for Money

| File & Location | Vulnerability Description | Exploitation Risk |
| :--- | :--- | :--- |
| **`src/utils/pricing.ts`**<br>`getPricingCatalog()`, `updatePricingCatalog()`, `STORAGE_KEY` | The active pricing catalog is read from and persisted directly in the browser's `localStorage` (`speedabraker_pricing_catalog`). | **Critical / High**: Any user can open DevTools / browser console and run `localStorage.setItem('speedabraker_pricing_catalog', ...)` or invoke the exposed functions to set all hardware modules, antenna options, and mandatory fees to ₹0. |
| **`src/App.tsx`**<br>`handlePlaceOrder()` (lines 668–700) | Computes `grandTotal`, `discountAmount`, and `finalTotal` directly in client React component state and passes these values verbatim to `saveOrderToFirestore()`. | **Critical / High**: The client unilaterally dictates the financial amounts, discounts, and payable totals recorded in the database. |
| **`src/utils/promoCodes.ts`**<br>`validatePromoCode()` & `calculateDiscount()` | Promo validation, eligibility checking, and discount calculations are executed entirely inside client-side code. | **High**: A client can bypass minimum order thresholds, tamper with discount percentage/flat amounts, or claim unauthorized discounts. |
| **`src/utils/invoiceCode.ts`**<br>`generateOrderVerificationHash()` (line 218) | Generates SHA-256 HMAC/integrity verification hash in the browser using client-supplied price parameters and a public hardcoded salt. | **High**: Because both the hashing algorithm and the salt are bundled in public client JavaScript, an attacker can construct a forged order with custom prices and compute a matching "valid" verification hash. |
| **`src/components/AdminCanvas.tsx`**<br>`handleSavePrices()` (line 156) | Admin price edits only mutate the administrator's local browser `localStorage`, not a centralized cloud catalog. | **Medium**: Changes made by an admin in their browser do not propagate to customers or other sessions. |

---

## 2. Hardcoded Secrets, Credentials, and Salts

| File & Location | Identified Item | Current Value / Implementation |
| :--- | :--- | :--- |
| **`src/lib/firebase.ts`**<br>(lines 14–16) | **Hardcoded Admin Account & Hash** | `DEFAULT_ADMIN_ACCOUNT = { username: 'admin', passwordHash: '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918' }` (SHA-256 hash of password `"admin"` bundled in public JS). |
| **`src/lib/firebase.ts`**<br>(lines 20–21, 62–99) | **Client-Side Brute-Force Lockout** | `LOCKOUT_STORAGE_KEY = 'speedabraker_admin_lockout_v2'`. Admin rate-limiting is tracked in `localStorage`, which an attacker can clear in 1 click (`localStorage.clear()`). |
| **`src/utils/invoiceCode.ts`**<br>(line 14) | **Client-Side Verification Salt** | `const ORDER_HASH_SALT = 'SALT_2026_SBS_SECURE';` Static string in the public client bundle. |
| **`src/lib/firebase.ts`**<br>(lines 26–31) | **Default Promo Codes in Client Bundle** | `DEFAULT_PROMO_CODES`: `'SBS10'`, `'LAUNCH25'`, `'SPEEDY100'`, `'VIP500'` exposed in JS bundle. |
| **`package.json`** | **Unused Backend Dependencies** | `express`, `@google/genai`, `dotenv`, `tsx`, `esbuild` are declared in `dependencies` but are not part of the client build or runtime on Vercel. |

---

## 3. Firestore Rules Allowing Unauthenticated Writes

Reviewing `/firestore.rules`:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 1. Orders: Unauthenticated creation with unverified totals
    match /orders/{orderId} {
      allow read: if true;
      allow create: if true; // ⚠️ Anyone can create arbitrary orders with any price/discount
      allow update, delete: if false;
    }

    // 2. Admin Accounts: Read and write completely open
    match /admin_accounts/{accountId} {
      allow read: if true;   // ⚠️ Anyone can read admin credentials/hashes
      allow create, update: if true; // ⚠️ Anyone can overwrite admin accounts
      allow delete: if false;
    }

    // 3. Promo Codes: Completely open read/write
    match /promo_codes/{promoId} {
      allow read, write: if true; // ⚠️ Anyone can create, edit, or delete promo codes
    }

    // 4. Product Stock: Completely open read/write
    match /product_stock/{productId} {
      allow read, write: if true; // ⚠️ Anyone can toggle items out-of-stock
    }
  }
}
```

Every single writable collection in the project currently allows unauthenticated public access.

---

## 4. Phase Implementation Roadmap & Vercel Hobby Architecture

### Phase 1 — Security Hardening
- **Firebase Authentication for Admin**: Replace custom client SHA-256 hashing and the unauthenticated `admin_accounts` collection with official Firebase Authentication (email/password).
- **Firestore Security Rules**: Restrict writes to `promo_codes`, `product_stock`, and the new canonical `pricing_catalog` to authenticated admin accounts (`request.auth != null`). Block public writes to sensitive collections.
- **Centralized Pricing Catalog in Firestore**: Move the canonical pricing catalog to Firestore collection `config/pricing` (with a read fallback to default constants) instead of relying on client `localStorage`.
- **Order Validation & Integrity**:
  - *Vercel Serverless Architecture*: Implement a serverless endpoint `/api/order/create` (or `/api/order/verify`) that receives the user's hardware configuration (selected version, display, wireless, active slots, antenna quality, dBi, promo code), recomputes the authoritative pricing and discounts server-side using the canonical catalog, and signs the verification hash using a secure server-side environment secret (`ORDER_SIGNING_SECRET`).
- **Dependency Cleanup**: Remove unused dependencies (`express`, `@google/genai`, `dotenv`, `tsx`, `esbuild`) to reduce attack surface and build size.

### Phase 2 — SEO, Meta & Social Sharing
- Add OpenGraph, Twitter Card meta tags, favicon, manifest, and structured JSON-LD data for Speedabraker's Shop in `index.html`.

### Phase 3 — Vercel Features & Edge Optimization
- Add `vercel.json` with security headers (`Content-Security-Policy`, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`), caching headers for static assets, and clean API rewrite rules.
- Add `@vercel/analytics` and `@vercel/speed-insights` for runtime performance telemetry.

### Phase 4 — Performance & Code Splitting
- Lazy load heavy modals (`AdminCanvas`, `AdminLoginModal`, `ImportModal`, etc.) using React `lazy` and `Suspense`.
- Optimize Vite chunk splitting for fast initial paint.

### Phase 5 — Accessibility & Quality
- Audit keyboard navigation, ARIA attributes, contrast ratios, and test suite integrity.

### Phase 6 — Final Review & Documentation
- Document environment variables, manual steps in Firebase Console (e.g., creating the admin user), and rollback procedures.

---

## 5. Constraints & Architectural Trade-Offs (Vercel Hobby Tier)
1. **Serverless Execution Limits**: Vercel Hobby serverless functions have a 10s execution timeout and 1024MB memory limit, which is more than sufficient for lightweight order verification and pricing calculation.
2. **Firebase Admin SDK on Vercel**: Using Firebase Admin in a Vercel serverless function requires service account credentials in environment variables (`FIREBASE_SERVICE_ACCOUNT_KEY` or `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`). Alternatively, order creation can verify and compute the hash server-side, with client-side Firestore creation governed by a rule requiring a valid server signature, or direct Firestore writes via Firebase REST/Admin.
3. **UI/UX Preservation**: All visual components (`Header`, `TopStatusGrid`, `FirmwareStep`, `DisplayStep`, `WirelessStep`, `AntennaStep`, `BillCanvas`, `AdminCanvas`) remain visually and structurally identical to preserve the existing user experience and workflows.
