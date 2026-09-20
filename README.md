# Speedabraker's Shop — Project Documentation & Audit Record

> **CRITICAL NOTICE FOR AI ASSISTANTS AND DEVELOPERS:**  
> This `README.md` contains the exact status, reports, and instructions provided after the last code change. Any other AI assistant or developer working on this codebase MUST update this README with the full report of everything said to the user after making subsequent code changes, preserving full context, phase status, and technical continuity.

---

# Implementation Status Table (Completed in Codebase)

| Feature / Component | Implementation Details | Status |
| :--- | :--- | :--- |
| **Firebase Project Migration** | Migrated to new Firebase Project `shop-speedabraker` with default `(default)` database (region `asia-south1` Mumbai). Updated `firebase-applet-config.json`, `src/lib/firebase.ts`, `api/create-order.ts`, `api/verify-order.ts`, and `.env.example`. | **DONE** |
| **Firebase Auth Admin** | Configured `src/lib/firebase.ts` and `src/components/modals/AdminLoginModal.tsx` for real email/password authentication (`signInWithEmailAndPassword`) with admin UID `CZQpz3IbA9fX3fgYyhEHbA7zdz03`. | **DONE** |
| **`isAdmin()` Firestore Rule** | Hardened `firestore.rules` to strictly require `request.auth.uid == 'CZQpz3IbA9fX3fgYyhEHbA7zdz03'` or `request.auth.token.admin == true`. | **DONE** |
| **Server-Side Order Creation** | Built `/api/create-order.ts` using Firebase Admin SDK. Recomputes all prices server-side, validates promos, enforces `.create()` conflict prevention (HTTP 409), generates `customerCode` strictly on server, signs with HMAC-SHA256, and uses clean deduplicated CORS Origin check. Strict project ID safety check against `shop-speedabraker`. | **DONE** |
| **IP Rate Limiting & TTL** | Enforced 5 orders per IP per 10 minutes in `/api/create-order.ts` using `rate_limits` collection keyed by SHA-256 IP hash. Stores `expiresAt` Date field for automated Firestore TTL cleanup. | **DONE** |
| **Server-Side Order Verification** | Rewrote `/api/verify-order.ts` to verify orders strictly against stored Firestore documents without trusting client totals or returning internal hash strings. Strict project ID safety check against `shop-speedabraker`. | **DONE** |
| **Database Seeding Controls** | Added "Import default promo codes" and "Initialise store data" buttons to `AdminCanvas.tsx` calling `seedDefaultPromoCodes` and `initializeStoreData` helper functions. | **DONE** |
| **Firestore Security Rules** | Rules locked for `orders` (`allow create: if false;`), `rate_limits` (`allow read, write: if false;`), `promo_codes` (`allow list: if isAdmin();`), `config` (admin-only writes), and `product_stock`. | **DONE** |
| **Vercel Headers & CSP** | Configured `vercel.json` with HSTS (`max-age=63072000; includeSubDomains; preload`), `X-Content-Type-Options: nosniff`, `Permissions-Policy`, SPA rewrites preserving `/api/*`, and CSP. | **DONE** |
| **Vercel Analytics & Insights** | Integrated `@vercel/analytics` and `@vercel/speed-insights` inside root `<ErrorBoundary>`. | **DONE** |
| **SEO, Social Sharing & Domain** | Configured canonical URL, OpenGraph, Twitter card targeting `og-image.png`, `robots.txt`, `sitemap.xml`, Schema.org JSON-LD, all pointing to `https://shop-speedabraker.vercel.app`. Pruned obsolete `og-image.svg`. | **DONE** |
| **Code Splitting & Lazy Modals** | Converted `AdminCanvas` and all 12 modal components to `React.lazy()` + `<React.Suspense fallback={null}>` dynamic imports with Vite vendor chunking. | **DONE** |
| **User-Facing Text Cleanup** | Removed all user-visible occurrences of "Firebase", "Firestore", and "database" from customer and administrative interfaces across `src/App.tsx`, `src/components/modals/AdminLoginModal.tsx`, and `src/components/AdminCanvas.tsx`. | **DONE** |
| **Server-Authoritative Invoicing** | Synchronized client-side state (`invoiceNumber`, `customerCode`, `verificationHash`) with server return values from `/api/create-order`. Client updates `customerCode` and uses `confirmedInvoiceNumber` state on order placement. Configuration changes automatically clear confirmed invoice state. Deleted obsolete functions (`sanitizeAndValidateAccount`, `verifyAdminCredentials`). | **DONE** |

---

# Migration

The project was migrated from the legacy project `speedabrakers-shop-10a95` to the new production project **`shop-speedabraker`**.

Key architectural changes during migration:
- **Project ID**: `shop-speedabraker` (region `asia-south1` Mumbai).
- **Firestore Database**: Uses the standard **`(default)`** database instance. The custom database ID was removed from `firebase-applet-config.json` and client SDK initializers.
- **Admin Authentication**: Admin UID `CZQpz3IbA9fX3fgYyhEHbA7zdz03` configured in `firestore.rules`.
- **Backend APIs**: `api/create-order.ts` and `api/verify-order.ts` enforce strict project validation, rejecting any credentials not matching `shop-speedabraker` and refusing silent initialization without credentials.
- **Store Seeding**: Admin UI in `AdminCanvas.tsx` includes one-click buttons to seed default promo codes and initialize product stock / pricing catalog directly into Firestore.

---

# My manual steps

Follow these exact steps in your external cloud consoles to complete production setup:

### 1. Firebase Console (`shop-speedabraker`)
1. **Enable Email/Password sign-in**:
   - Open [Firebase Console](https://console.firebase.google.com/) -> Select project `shop-speedabraker` -> **Build** -> **Authentication**.
   - Navigate to the **Sign-in method** tab.
   - Click **Email/Password**, toggle **Enable** to ON, and click **Save**.
2. **Verify admin user account**:
   - In **Authentication**, verify user account with UID `CZQpz3IbA9fX3fgYyhEHbA7zdz03` exists (or create it with the matching email).
3. **Deploy Firestore Security Rules**:
   - Open `firestore.rules` and deploy them via Firebase CLI (`firebase deploy --only firestore:rules`) or by copying into **Firestore Database** -> **Rules** and clicking **Publish**.
4. **Enable Firestore TTL Policy for Rate Limiting**:
   - In Firebase Console, navigate to **Firestore Database** -> **TTL** (or **Data** -> **TTL policies**).
   - Click **Create TTL Policy**.
   - Set Collection group: `rate_limits`
   - Set Timestamp field: `expiresAt`
   - Click **Create**. Firestore will automatically purge expired rate limit documents.
5. **Download Firebase Admin Service Account Key**:
   - In Firebase Console, click the **Gear icon (Project settings)** -> **Service accounts** tab.
   - Click **Generate new private key** -> **Generate key**.
   - Save the downloaded JSON file securely.

### 2. Vercel Environment Variables
Log in to [Vercel](https://vercel.com/) -> Select your project -> **Settings** -> **Environment Variables**. Configure the following variables across Production, Preview, and Development:

| Variable Name | Description | Required Value / Format |
| :--- | :--- | :--- |
| `ORDER_SIGNING_SECRET` | 32+ character cryptographic secret string used by `/api/create-order` and `/api/verify-order` for HMAC-SHA256 signatures | `your_long_secure_random_secret_string` |
| `ALLOWED_ORIGIN` | Authorized domain origin for CORS validation and header checks (no trailing slash) | `https://shop-speedabraker.vercel.app` |
| `FIREBASE_SERVICE_ACCOUNT_KEY` | Minified JSON string of the downloaded service account key for project `shop-speedabraker` | `{"type":"service_account","project_id":"shop-speedabraker","private_key":"...","client_email":"..."}` |

*(Alternatively, instead of `FIREBASE_SERVICE_ACCOUNT_KEY`, you can provide individual variables: `FIREBASE_PROJECT_ID` = `shop-speedabraker`, `FIREBASE_CLIENT_EMAIL`, and `FIREBASE_PRIVATE_KEY`).*

### 3. Initialise Store Data & Promo Codes
Once signed into the shop admin panel with your admin user account:
1. Open Admin Panel -> Click **"Initialise store data"** to write product stock and pricing catalog into Firestore.
2. Go to **Promo Codes** tab -> Click **"Import default promo codes"** to populate `D10`, `D15`, `D20`, `D50`, `F10`, `F20`, and `F50` into Firestore.

---

# Append-Only Changelog & Audit History

### [2026-09-19] — Firebase Project Migration to `shop-speedabraker`
- **Files Modified**:
  - `/firebase-applet-config.json`: Updated with new project credentials (`shop-speedabraker`, `asia-south1`) and removed unused legacy fields.
  - `/src/lib/firebase.ts`: Switched Firestore initialization to standard `(default)` database. Added `seedDefaultPromoCodes` and `initializeStoreData` functions.
  - `/api/create-order.ts`: Removed fallback project IDs, added strict safety validation checking that service account project matches `shop-speedabraker`, and returned HTTP 500 on configuration failure.
  - `/api/verify-order.ts`: Removed fallback project IDs, added strict project safety check for `shop-speedabraker`, and returned HTTP 500 on missing credentials.
  - `/firestore.rules`: Updated `isAdmin()` function to enforce admin UID `CZQpz3IbA9fX3fgYyhEHbA7zdz03`.
  - `/src/components/AdminCanvas.tsx`: Added "Import default promo codes" button in promo codes tab and "Initialise store data" button in admin header with confirmation alert.
  - `/.env.example`: Updated comments and examples to reflect `shop-speedabraker`.
  - `/README.md`: Updated project ID, documentation, migration details, and manual steps.
- **Verification**: `bun run lint` and `bun run build` passing cleanly.

---

# Phase 0 — Audit & Architecture Report (Verified)

## Project Overview
- **Application**: Speedabraker's Shop
- **Stack**: React 19 + TypeScript + Vite 6 + Tailwind CSS 4 + Firebase (Firestore & Auth, JS SDK v12) + i18next + Motion
- **Hosting Target**: Vercel (Hobby Tier)
- **Production URL**: `https://shop-speedabraker.vercel.app`
- **Active Branch**: `v2-hardening`
- **Core Functionality**: Step-by-step hardware configurator (Firmware, Display, Wireless, Antennas, Quality, Type), live psychological pricing calculations, itemized billing and invoice generator, promo code engine, order verification, and admin configuration canvas.

---

## 1. Places Trusting Client-Side Data for Money

| File & Location | Vulnerability Description | Remediation Implemented |
| :--- | :--- | :--- |
| **`src/utils/pricing.ts`**<br>`getPricingCatalog()`, `updatePricingCatalog()` | The active pricing catalog was stored in client browser `localStorage`. | Centralized in Firestore at document `config/pricing` with real-time listener synchronization and write restriction to Admins. |
| **`src/App.tsx`**<br>`handlePlaceOrder()` | Computed grand totals and discounts in client state before saving. | Integrated with Vercel serverless function `/api/create-order` and `/api/verify-order` to validate totals and produce server HMAC signatures. |
| **`src/utils/promoCodes.ts`**<br>`validatePromoCode()` | Promo validation was executed exclusively on client state. | Protected via Firestore admin-only promo collection rules and server-side verification in `/api/create-order`. |
| **`src/lib/firebase.ts`**<br>`generateOrderVerificationHash()` | Generated verification hash in browser using client salt. | Order verification now prioritizes server-side cryptographic HMAC-SHA256 signature generated in `/api/create-order` and verified in `/api/verify-order`. |
| **`src/components/AdminCanvas.tsx`**<br>`handleSavePrices()` | Admin price edits only mutated administrator's local browser storage. | Now writes directly to Firestore `config/pricing` via `savePricingCatalogToFirestore()`, immediately propagating to all users. |

---

## 2. Hardcoded Credentials & Salts Audit

| File & Location | Identified Item | Remediation Implemented |
| :--- | :--- | :--- |
| **`src/lib/firebase.ts`** | **Hardcoded Admin Credentials** | Removed hardcoded default credentials and plain-text fallbacks; migrated to standard Firebase Authentication (`signInWithEmailAndPassword`). |
| **`src/lib/firebase.ts`** | **Brute-Force Lockout** | Standardized through Firebase Authentication rate-limiting and client-side anti-hammering guard. |
| **`src/lib/firebase.ts`** | **Order Verification Salt** | Replaced with server-side secret (`ORDER_SIGNING_SECRET`) processed inside Vercel serverless functions. |
| **`package.json`** | **Unused Dependencies** | Pruned unused packages (`@google/genai`, `express`, `dotenv`, `tsx`, `esbuild`) to optimize build time and dependencies. |

---

## 3. Hardened Firestore Security Rules (`firestore.rules`)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Global Default-Deny Safety Net
    match /{document=**} {
      allow read, write: if false;
    }

    function isAuthenticated() {
      return request.auth != null;
    }

    function isAdmin() {
      return request.auth != null && (
        request.auth.uid == 'CZQpz3IbA9fX3fgYyhEHbA7zdz03' ||
        request.auth.token.admin == true
      );
    }

    // Config Collection (Pricing Catalog)
    match /config/{configId} {
      allow get: if true;
      allow list: if isAdmin();
      allow create, update, delete: if isAdmin();
    }

    // Promo Codes Collection
    match /promo_codes/{codeId} {
      allow get: if true;
      allow list: if isAdmin();
      allow create, update, delete: if isAdmin();
    }

    // Orders Collection: Client creation denied; must use /api/create-order via Admin SDK
    match /orders/{invoiceId} {
      allow get: if true;
      allow list: if isAdmin();
      allow create, update, delete: if false;
    }

    // Rate Limits Collection: Forbidden from all client access
    match /rate_limits/{docId} {
      allow read, write: if false;
    }

    // Product Stock Collection
    match /product_stock/{productId} {
      allow get, list: if true;
      allow create, update, delete: if isAdmin();
    }

    // Deprecated Admin Accounts Collection
    match /admin_accounts/{username} {
      allow read, write: if false;
    }
  }
}
```

---

# Append-Only Changelog & Audit History

### [2026-09-19] — Firestore Rules Authorization Hardening
- **File Modified**: `/firestore.rules`
- **Changes**:
  1. **Strict Admin Verification**: Updated `isAdmin()` function to remove the permissive `|| request.auth != null` fallback. Admin permissions now strictly require `request.auth.uid == 'CZQpz3IbA9fX3fgYyhEHbA7zdz03'` or `request.auth.token.admin == true`.
  2. **Promo Code Collection Privacy**: Changed `allow list: if true;` to `allow list: if isAdmin();` in the `promo_codes` match block. Customers can still query specific promo codes by ID via `get`, but cannot enumerate or dump the entire promo collection.
- **Verification**: `bun run lint` and `bun run build` passing cleanly.

### [2026-09-19] — Serverless Order Creation API (`/api/create-order.ts`) & Firebase Admin SDK
- **Files Modified / Created**: `/package.json`, `/.env.example`, `/api/create-order.ts`.
- **Changes**: Built full Vercel serverless function using Firebase Admin SDK to handle secure server-authoritative order creation, independent price calculation, promo validation, and HMAC-SHA256 order signing.

### [2026-09-19] — Client-Side Migration to `/api/create-order` & Firestore Write Locking
- **Files Modified**: `/firestore.rules`, `/src/lib/firebase.ts`, `/src/App.tsx`, `/src/components/BillCanvas.tsx`.
- **Changes**: Set orders rule to `allow create: if false;`, routed client checkout through `/api/create-order`, and deleted client verification hashing logic.

### [2026-09-19] — Order Verification API (`/api/verify-order.ts`) Security Rewrite
- **Files Modified**: `/.env.example`, `/api/verify-order.ts`.
- **Changes**: Direct Firestore database verification, zero client price trust, strict signing secret enforcement, and sanitized responses.

### [2026-09-19] — Vercel Analytics, Speed Insights & Production vercel.json Security Configuration
- **Files Modified**: `/package.json`, `/src/main.tsx`, `/vercel.json`.
- **Changes**: Installed `@vercel/analytics` and `@vercel/speed-insights`. Configured strict CSP, HSTS, no-cache headers, and SPA rewrites.

### [2026-09-19] — SEO, Social Sharing Cards & Domain Standardization
- **Files Modified / Created**: `/public/robots.txt`, `/public/sitemap.xml`, `/public/og-image.png`, `/index.html`, `/metadata.json`, `/.env.example`.
- **Changes**: Corrected domain across all assets to `https://shop-speedabraker.vercel.app`. Generated 1200x630 PNG preview card. Deleted obsolete `/public/og-image.svg`.

### [2026-09-19] — UI String Sanitization, Rate Limit TTL & CORS Deduplication
- **Files Modified / Deleted**:
  - `/api/create-order.ts`: Deduplicated CORS Origin validation into a single check covering both OPTIONS and POST. Added `expiresAt` Date field (`now + 10 min`) to rate limit documents for automated Firestore TTL policy cleanup.
  - `/api/verify-order.ts`: Sanitized error messages to remove database mentions.
  - `/src/App.tsx`: Removed "database" from order verification and tamper error messages.
  - `/src/components/modals/AdminLoginModal.tsx`: Updated verification message to "Signed in as administrator."
  - `/src/components/AdminCanvas.tsx`: Sanitized all administrative promo sync, save, and delete messages.
  - `/public/og-image.svg`: Deleted obsolete unused asset.
  - `/README.md`: Updated comprehensive status table, remaining items, manual setup guide with TTL policy instructions, and rollback procedure.

### [2026-09-19] — Server-Authoritative Invoice Number & Customer Code Synchronization
- **Files Modified**:
  - `/src/lib/firebase.ts`: Updated `saveOrderToFirestore` return type to include `customerCode`. Deleted obsolete unused functions `sanitizeAndValidateAccount` and `verifyAdminCredentials`.
  - `/src/utils/invoiceCode.ts`: Updated `generateOrderDetailsJson` to accept and serialize optional `verificationHash` in the invoice payload.
  - `/src/App.tsx`: Added `confirmedInvoiceNumber` and `confirmedOrderHash` states. Updated `handlePlaceOrder` to synchronize state with server-generated `customerCode`, `invoiceNumber`, and `hash`. Added automatic invalidation of confirmed order state upon hardware configuration changes. Updated `handleConfirmReset` and `applyImportedConfiguration` to manage confirmed invoice state cleanly.
  - `/README.md`: Documented server ownership of invoice number and customer code.
