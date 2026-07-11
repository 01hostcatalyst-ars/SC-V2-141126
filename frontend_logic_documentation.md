# BrandBridge Frontend Logic Documentation

This document acts as the reference for the frontend logic and workflows that were implemented in the initial code before starting the redesign. It maps all components, page behaviors, form inputs, dynamic fields, and API bindings.

---

## 1. Core Authentication Workflows

### 1.1 Login Page & Form (`LoginForm.tsx`)
- **Inputs**: `email` (string), `password` (string).
- **Validation**: Ensures both fields are non-empty.
- **Request**: Sends a POST request to `/api/auth/login` containing `{ email, password }`.
- **Session Management**:
  - Receives `session` object (containing `access_token` and `refresh_token`).
  - Dynamically imports `@/lib/supabase/client` on the client-side.
  - Invokes `supabase.auth.setSession(...)` with the tokens to write the session into cookies, ensuring route middleware and protected routers can parse it correctly.
  - Redirects to `/dashboard`.

### 1.2 Sign-Up Page & Form (`SignupForm.tsx`)
- **Inputs**: Varies dynamically depending on selected `Role` (CREATOR | BRAND | AGENCY).
- **Global Fields**:
  - `name` (Full Name for Creator; Contact Person Name for Brand/Agency)
  - `email`
  - `phone`
  - `password`
- **Role-Specific Fields**:
  - **CREATOR**: `instagramHandle` (optional), `cnicNumber` (optional)
  - **BRAND**: `brandName` (mapped to `agencyName` field in database/API), `brandAddress` (mapped to `agencyAddress`), `designation`
  - **AGENCY**: `agencyName`, `agencyAddress`, `designation`
- **Request**: Sends a POST request to `/api/auth/signup` with all fields mapped.
- **Next Step**: Redirects to `/verify?email=<email>` upon successful response.

### 1.3 OTP Verification Page (`OTPInput.tsx` / `verify/page.tsx`)
- **Inputs**: 6-digit verification code.
- **URL Parameter**: Parses `email` from query parameter.
- **Request**: Sends POST request to `/api/auth/verify-otp` with `{ email, token }`.
- **Success Handling**: On verification success, redirects to `/dashboard`.

---

## 2. Dashboard Logic (`Dashboard` router group)

### 2.1 Role-Adaptive Dashboards
All roles land on `/dashboard`, but sub-render custom components based on the user's role:
- **StatsBar**: Renders cards for Total Contracts, Active Contracts, Completed Contracts, and Pending Signatures.
- **Creator Dashboard**: Renders list of initiated/received contracts; Quick action triggers New Contract (`CREATOR_TO_BRAND`).
- **Brand Dashboard**: Renders list of initiated/received contracts; Quick action triggers New Contract (`BRAND_TO_CREATOR`).
- **Agency Dashboard**:
  - Split views: Contains tabs for "Brand Contracts" and "Creator Contracts".
  - Shows linked contracts (displays linking between agency-brand contracts and agency-creator contracts).
  - Quick action allows choosing between "Agency → Brand" and "Agency → Creator" contracts.

---

## 3. Contract Creation Flow (`ContractWizard.tsx`)

A multi-step stepper form (6 steps) that adapts inputs depending on user role:

### Step 1: Deliverables
- Manage an array of deliverables.
- Fields per deliverable: `type` (Select dropdown of `DeliverableType` values, e.g. `IMAGE_POST`, `REEL`, `STORY`, etc.), `quantity` (integer), `duration` (string, e.g. "24 hours"), `notes` (text).

### Step 2: Usage Rights
- `platformsAllowed`: Array of strings representing platform checkboxes (Instagram, TikTok, YouTube, Facebook, Twitter).
- `usageType`: Select field mapped to `UsageType` (ORGANIC_ONLY, PAID_AD, BILLBOARD_PRINT, ALL_MEDIA).
- `usageRightsDuration`: Input text or options (e.g. "6 months").

### Step 3: Financial Terms
- `totalAmount` (decimal/string)
- `advancePayment` (decimal/string, optional)
- `paymentMethod` (BANK_IBAN, JAZZCASH, EASYPAISA)
- `bankAccountIban` (string, shown if BANK_IBAN selected)
- `mobileWalletNumber` (string, shown if wallet selected)

### Step 4: Delivery Terms
- `deliveryTimeframeDays` (days after execution, e.g., 7)
- `revisionRounds` (number, default 1)
- `brandApprovalRequired` (boolean toggle)
- `exclusivityClause` (boolean toggle)
- `exclusivityDuration` (string, shown if exclusivity is checked)
- `contentOwnership` (text area, default terms pre-filled)
- `taggingRequirements` (text area, optional)

### Step 5: Bilateral Penalties
- `latePaymentPenaltyPct`: Late payment penalty percentage per day (defaults to 3%).
- `lateContentPenaltyPct`: Late content delivery penalty percentage per day (defaults to 3%).

### Step 6: Review & Submit
- Display a summary of all filled terms.
- Click "Create Contract" to fire POST to `/api/contracts`.
- On success, redirect to `/contracts/[id]`.

---

## 4. Contract Detail & E-Signature Pad

### 4.1 Detail View (`/contracts/[id]/page.tsx`)
- Displays full contract details, deliverables table, usage rights, financial information, and timeline status.
- Shows PDF download links if contract is active.
- Handles initiator signature:
  - If contract is in status `PENDING_INITIATOR` (meaning respondent signed first), initiator can click "Sign and Activate" to show the Signature modal.
  - Submits initiator signature via `/api/contracts/[id]/sign`.

### 4.2 Respondent Public Page (`/c/[token]/page.tsx` & `RespondentForm.tsx`)
- Accessible via unauthenticated public token link.
- Renders terms side-bar (static) and respondent form on the main side.
- **Respondent Form Fields**: Name, Email, Phone, Company/Brand Name (if applicable), Address, Designation.
- **Verification Trigger**:
  1. User fills email and clicks "Send OTP".
  2. Calls `/api/contracts/share/:token/send-otp` via POST to send verification email.
  3. User enters the 6-digit code and clicks "Verify OTP".
  4. Calls `/api/contracts/share/:token/verify-otp` to authenticate and unlock signature pad.
- **Signature Execution**:
  1. Once OTP is verified, Signature Modal is unlocked.
  2. Respondent signs inside the pad and checks "Electronic Consent".
  3. Clicks "Sign & Submit".
  4. Failsafe updates details (`PUT /api/contracts/share/:token`) and submits signature payload (`POST /api/contracts/share/:token/sign`) with image data and device user agent fingerprint.
  5. Redirects to `/c/[token]/success`.
