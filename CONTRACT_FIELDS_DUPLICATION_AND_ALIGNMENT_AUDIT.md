# Comprehensive Audit: Contract Form Field Duplications, Misalignments & System Data Flow

> **Document Status:** Comprehensive Audit & Information Gathering  
> **Target Scope:** All 6 Contract Workflows (`CREATOR_TO_BRAND`, `BRAND_TO_CREATOR`, `AGENCY_TO_CREATOR`, `AGENCY_TO_BRAND`, `BRAND_TO_AGENCY`, `CREATOR_TO_AGENCY`) across **Registered User Contracts** (`/contracts/new`), **Instant Contracts** (`/instant`), **Respondent Signing** (`/c/[token]`), **Database Schema** (`prisma/schema.prisma`), and **PDF Output Engines** (`Contract PDF` & `Audit Certificate PDF`).

---

## 1. Executive Summary

During our audit of the contract system, we identified critical issues regarding **duplicate form fields, misplaced inputs, data overwriting during respondent signing, and semantic field pollution**. 

For example, `creatorHandle` is asked from Party A (Brand/Agency) during creation, asked again from Party B (Creator) during signing via a proxy field `collabDetails`, saved across 3 separate database columns (`creatorHandle`, `collabDetails`, `respondentCompany`), and ultimately rendered on the final PDF under *"Special Collaboration Notes & Campaign Brief"* as `@username`.

This document provides an exhaustive, logical breakdown of all field duplications, data flow mismatches, and rendering anomalies across UI, API, Database, and PDF outputs, establishing clear recommendations for what is correct and what should be refactored or removed.

---

## 2. Exhaustive Breakdown of Duplicate & Misplaced Fields

### Problem #1: `creatorHandle` & `creatorName` Duplication, Double Entry & Data Overwriting

#### **Current Condition:**
1. **Creation Forms (`/contracts/new` & `/instant`):**
   - When Party A is a Brand or Agency (e.g. `BRAND_TO_CREATOR`, `AGENCY_TO_CREATOR`), Party A is asked to enter `"Creator Full Name"` (`creatorName`) and `"Creator Handle / Username"` (`creatorHandle`).
   - When Party A is a Creator initiating a deal (`CREATOR_TO_BRAND`, `CREATOR_TO_AGENCY`), the form asks for `initiatorName` AND ALSO asks for `creatorName` and `creatorHandle` in the dynamic counterparty fields section! Party A (Creator) is forced to enter their own name and handle **twice**.
2. **Respondent Form (`/c/[token]`):**
   - When Party B (Creator) opens the shared contract link, the form asks for `"Creator IG Handle *"` — but binds it to the `collabDetails` state variable!
   - Party B is also asked for `"Signer's Full Legal Name"` (bound to `respondentName`).
3. **API & Backend Sign Route (`/api/contracts/share/[token]/sign/route.ts`):**
   - When Party B signs, the API executes:
     `creatorHandle: (respondentUserRole === "CREATOR" && collabDetails) ? collabDetails : contract.creatorHandle`
     `creatorName: (respondentUserRole === "CREATOR" && name) ? name : contract.creatorName`
   - This **overwrites** whatever Party A originally entered in `creatorHandle` and `creatorName` with `collabDetails` and `respondentName`.

#### **Database Reaction:**
- `contract.creatorHandle` is updated.
- `contract.collabDetails` is updated with the same handle value.
- `contract.respondentCompany` is ALSO updated with `collabDetails` (the handle) because `c/[token]/page.tsx` sets `respondentCompany = collabDetails` for Creator respondents!

#### **PDF & Certificate Reaction:**
- **Contract PDF Template (`template.tsx`):** Displays Creator Name & Handle in the **Party B Box** AND again in the **Campaign & Talent Assignment Box** directly below it.
- **Contract PDF Engine (`generate.ts` Section 9):** Section 9 prints:  
  `Special Collaboration Notes & Campaign Brief: @creatorhandle` (because `collabDetails` holds the handle).
- **Audit Certificate PDF (`generateCertificate.ts`):** Prints:  
  `Counterparty Campaign Notes: @creatorhandle`.

#### **Logical Assessment & Correct Approach:**
- **What is Correct:** The Creator's handle (@handle) and legal name are single properties of the Creator entity.
- **What Should Be Removed / Refactored:**
  - Party A should only specify target `creatorHandle` / `creatorName` if Party A is a Brand or Agency sending a deal to a Creator.
  - If Creator is Party A (Initiator), `creatorName` and `creatorHandle` must be auto-populated from Party A's profile (`initiatorName` & `user.instagramHandle`), NOT asked as a duplicate input.
  - On `/c/[token]`, the Creator input field must bind directly to `creatorHandle`, NOT `collabDetails`.

---

### Problem #2: `collabDetails` Triplication & Semantic Field Pollution

#### **Current Condition:**
`collabDetails` (`collab_details` in DB) was originally designed for freeform text notes or custom campaign briefs. However, in `/c/[token]/page.tsx`, the form uses `collabDetails` as the state holder for `"Creator IG Handle"`.

#### **Data Flow & Database Reaction:**
1. User types `@sarahvlogs` into `"Creator IG Handle"` on `/c/[token]`.
2. Component sends `{ collabDetails: "@sarahvlogs", ... }` to `/api/contracts/share/[token]/sign`.
3. Backend writes `@sarahvlogs` into **3 separate DB columns**:
   - Column 1: `contract.collabDetails` = `"@sarahvlogs"`
   - Column 2: `contract.creatorHandle` = `"@sarahvlogs"`
   - Column 3: `contract.respondentCompany` = `"@sarahvlogs"` (via fallback mapping for Creator roles)

#### **PDF & Certificate Reaction:**
- **Contract PDF (`generate.ts` L538):**
  Section 9 prints: `Special Collaboration Notes & Campaign Brief: @sarahvlogs`.
- **Audit Certificate PDF (`generateCertificate.ts` L252):**
  Table prints: `Counterparty Campaign Notes: @sarahvlogs`.

#### **Logical Assessment & Correct Approach:**
- **What is Correct:** `creatorHandle` should store the Instagram handle (`@sarahvlogs`). `collabDetails` should be reserved strictly for optional, freeform collaboration notes or campaign instructions.
- **What Should Be Removed / Refactored:** Stop using `collabDetails` as a substitute for `creatorHandle`. Fix `/c/[token]/page.tsx` so `"Creator IG Handle"` binds directly to `creatorHandle`.

---

### Problem #3: `brandName` & `brandHandle` vs `companyName` Entity Mismatches

#### **Current Condition:**
- In `Contract` model: `brandName` and `brandHandle` exist as top-level fields.
- In `ContractParty` model: `companyName` exists for each party.
- In `User` model: `agencyName` / `companyName` exists.

1. **Creation Form Logic (`/contracts/new` & `/instant`):**
   - In `CREATOR_TO_BRAND` or `AGENCY_TO_CREATOR`, Party A enters `"Target Brand Name"` (`brandName`) and `"Brand Handle"` (`brandHandle`).
   - In `BRAND_TO_CREATOR`, Brand is Party A, so Brand enters `initiatorCompanyName` ("Company Name"). The API explicitly leaves `contract.brandName` as `undefined` (NULL in DB)!
2. **Respondent Form Logic (`/c/[token]`):**
   - When Brand is Party B (`CREATOR_TO_BRAND`), Brand enters `"Brand / Company Name"` (`respondentCompany`).
   - Backend updates `contract.respondentCompany` and `ContractParty.companyName`.
   - `contract.brandName` remains set to whatever Creator typed during creation (e.g. "Nike"), while `contract.respondentCompany` contains what Brand typed (e.g. "Nike Global International LLC").

#### **PDF & Certificate Reaction:**
- **Contract PDF (`template.tsx` L163-167):**
  `bName` falls back to `initiatorParty.companyName` or `respondentParty.companyName` if `contract.brandName` is NULL.
  If both exist and differ, Party B Box shows "Nike Global International LLC", while Campaign Assignment Box shows "Nike".

#### **Logical Assessment & Correct Approach:**
- **What is Correct:** A contract has one Brand entity. The Brand's formal legal entity name belongs in `ContractParty.companyName` (where role = `BRAND`), while `brandName` / `brandHandle` represents the commercial brand moniker/handle.
- **What Should Be Refactored:** Harmonize `brandName` with `ContractParty.companyName` when Brand is the signing party.

---

### Problem #4: Payment Method & IBAN Data Leakage / Pre-fill Bug

#### **Current Condition:**
In `/c/[token]/page.tsx` (lines 89-91):
```typescript
if (data.contract.paymentMethod) setPaymentMethod(data.contract.paymentMethod);
if (data.contract.bankAccountIban) setBankAccountIban(data.contract.bankAccountIban);
if (data.contract.mobileWalletNumber) setMobileWalletNumber(data.contract.mobileWalletNumber);
```

#### **Bug & System Impact:**
When Party A (Initiator, e.g. Creator in `CREATOR_TO_BRAND`) creates a contract, Creator fills their receiving payment details into `contract.paymentMethod` and `contract.bankAccountIban`.

When Party B (Respondent, e.g. Brand) opens the shared contract link `/c/[token]`:
The page fetches the contract data and **pre-fills Party B's local state** with Party A's bank IBAN and payment method!
If Party B is also a payee (or in multi-party scenarios), Party B sees Party A's sensitive IBAN pre-populated in their input form.

#### **Logical Assessment & Correct Approach:**
- **What is Correct:** Party A's payout details belong in `ContractParty(INITIATOR)` or `contract.bankAccountIban`. Party B's payout details belong in `ContractParty(RESPONDENT)` or `contract.respondentBankAccountIban`.
- **What Should Be Removed / Refactored:** On `/c/[token]`, initialize Respondent payment state from `contract.respondentPaymentMethod` and `contract.respondentBankAccountIban`, **never** from Initiator's `contract.paymentMethod`.

---

### Problem #5: Tax ID & National ID Column Quadruplication

#### **Current Condition:**
Tax IDs and National IDs are saved in 4 distinct locations per contract:
1. `Contract.initiatorNtn` / `Contract.initiatorCnic`
2. `Contract.initiatorTaxId` / `Contract.initiatorNationalId`
3. `ContractParty.ntn` / `ContractParty.cnic`
4. `ContractParty.taxId` / `ContractParty.nationalId`

And the same duplication exists for Respondent:
1. `Contract.respondentNtn` / `Contract.respondentCnic`
2. `Contract.respondentTaxId` / `Contract.respondentNationalId`
3. `ContractParty.ntn` / `ContractParty.cnic`
4. `ContractParty.taxId` / `ContractParty.nationalId`

#### **System Impact:**
In `/api/contracts/route.ts` and `/api/contracts/share/[token]/sign/route.ts`, a single user input (e.g. Tax ID "1234567-8") triggers 4 database field assignments. If one field is updated without updating the others, DB records become inconsistent.

#### **Logical Assessment & Correct Approach:**
- **What is Correct:** `ContractParty` table is the immutable snapshot of party identity at signing time. `ContractParty.taxId` and `ContractParty.nationalId` are the normalized columns.
- **What Should Be Refactored:** `ContractParty` should serve as the primary source of truth. Top-level `Contract` table tax columns should either be mirrors derived from `ContractParty` or phased out.

---

### Problem #6: Loss of `creatorLegalName` & `respondentCapacity` on Respondent Signing

#### **Current Condition:**
1. **Respondent UI (`/c/[token]`):**
   - Supports selecting `"Signing Capacity *"` (`CREATOR_SELF` vs `CREATOR_MANAGER`).
   - If `CREATOR_MANAGER` is selected, an input for `"Creator Full Legal Name"` (`creatorLegalName`) is shown.
2. **API & Backend Sign Route (`/api/contracts/share/[token]/sign/route.ts`):**
   - Body destructuring in `sign/route.ts` **does not destructure** `creatorLegalName` or `respondentCapacity`!
   - As a result, when a Talent Manager signs for a Creator on `/c/[token]`, the Creator's legal name entered in `creatorLegalName` is **dropped and completely lost**.

#### **PDF & Certificate Reaction:**
- **Contract PDF:** Cannot display *"Executed by Manager [Manager Name] on behalf of Creator [Creator Legal Name]"*. It only shows the Manager's name as the signer.
- **Audit Certificate:** Cannot distinguish whether the signer was the Creator directly or an authorized Manager.

#### **Logical Assessment & Correct Approach:**
- **What is Correct:** The backend must accept `respondentCapacity` and `creatorLegalName`, saving them in `ContractParty` or `Signature` metadata.
- **What Should Be Fixed:** Add `respondentCapacity` and `creatorLegalName` to `/api/contracts/share/[token]/sign/route.ts` payload processing and PDF rendering.

---

### Problem #7: Feature Discrepancies Between Instant Contracts & Registered Contracts

#### **Comparison Table:**

| Feature / Field | Registered User Flow (`/contracts/new`) | Instant Contract Flow (`/instant`) | Status / Discrepancy |
| :--- | :--- | :--- | :--- |
| **Signing Capacity Selector** | ❌ Missing (Only has `initiatorName` & `initiatorDesignation`) | ✅ Present (`CREATOR_SELF` vs `CREATOR_MANAGER`) | Discrepancy: Registered users cannot specify if they are a Manager signing for a Creator. |
| **`creatorLegalName` Field** | ❌ Missing | ✅ Present | Discrepancy: Registered Managers cannot enter Represented Creator Name. |
| **Initiator Live Guest Limit Check** | ❌ N/A (Authenticated) | ✅ Present (2 contracts / 24h per email) | Working as intended. |
| **Counterparty Validation Notice** | ✅ Present (Blue Info Badge) | ✅ Present (Blue Info Badge) | Aligned. |
| **Tax ID Label Localization** | ✅ Present (Via Jurisdiction Config) | ✅ Present (Via Jurisdiction Config) | Aligned. |

---

### Problem #8: Address Fallback Leaks on PDF (`collabDeliveryAddress` vs `companyAddress`)

#### **Current Condition:**
In `src/lib/pdf/template.tsx` (lines 127 and 149):
```typescript
// Party A Address Resolution
initiatorParty.companyAddress || contract.initiatorCompanyAddress || contract.initiator?.agencyAddress || contract.collabDeliveryAddress

// Party B Address Resolution
respondentParty.companyAddress || contract.respondentAddress || contract.collabDeliveryAddress
```

#### **Bug & System Impact:**
`collabDeliveryAddress` is the physical shipping address where collaboration products/samples are delivered.
If a Brand or Creator does not specify an official corporate/residential address, the PDF engine falls back to `collabDeliveryAddress` for BOTH Party A and Party B!
This causes the product delivery warehouse address to be printed as the official corporate address for both parties.

#### **Logical Assessment & Correct Approach:**
- **What is Correct:** Corporate/Residential legal address and Product Delivery Address are separate fields.
- **What Should Be Removed:** Remove `collabDeliveryAddress` from party legal address fallback chains.

---

## 3. Comprehensive Matrix of All 6 Contract Workflows

The table below outlines who Party A and Party B are, who receives payment (Payee), who delivers content (Deliverer), and how fields should be assigned across all 6 contract types:

| Workflow Code | Workflow Label | Party A (Initiator) | Party B (Respondent) | Financial Payee | Content Deliverer | Dynamic Fields Required in Creation Form | Fields Required in Respondent Form (`/c/[token]`) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **`CREATOR_TO_BRAND`** | Creator ➔ Brand | Creator (Individual / Manager) | Brand (Company) | Party A (Creator) | Party A (Creator) | `brandName`, `brandHandle` | Brand Name, Company Address, Tax ID (NTN/EIN), Representative Name & Job Title |
| **`BRAND_TO_CREATOR`** | Brand ➔ Creator | Brand (Company) | Creator (Individual / Manager) | Party B (Creator) | Party B (Creator) | `creatorName`, `creatorHandle` | Creator IG Handle, Signing Capacity (Self/Manager), Creator Legal Name, Phone, Address, CNIC/ID, Payout IBAN/Wallet |
| **`AGENCY_TO_CREATOR`** | Agency ➔ Creator | Agency (Company) | Creator (Individual / Manager) | Party B (Creator) | Party B (Creator) | `brandName`, `brandHandle`, `creatorName`, `creatorHandle`, `campaignName` | Creator IG Handle, Signing Capacity (Self/Manager), Creator Legal Name, Phone, Address, CNIC/ID, Payout IBAN/Wallet |
| **`AGENCY_TO_BRAND`** | Agency ➔ Brand | Agency (Company) | Brand (Company) | Party A (Agency) | Party A (Agency / Creator Roster) | `creatorName`, `creatorHandle` (Roster Lead) | Brand Name, Company Address, Tax ID (NTN/EIN), Representative Name & Job Title |
| **`BRAND_TO_AGENCY`** | Brand ➔ Agency | Brand (Company) | Agency (Company) | Party B (Agency) | Party B (Agency) | `creatorName`, `creatorHandle`, `campaignName` | Agency Name, Company Address, Tax ID (NTN/EIN), Representative Name & Job Title, Payout IBAN |
| **`CREATOR_TO_AGENCY`** | Creator ➔ Agency | Creator (Individual / Manager) | Agency (Management / Firm) | Party A (Creator) | Party A (Creator) | `brandName`, `campaignName` | Agency Name, Company Address, Tax ID (NTN/EIN), Representative Name & Job Title |

---

## 4. DB, UI, and PDF Reaction Summary Table

| Field / Feature | UI Behavior (Creation & Signing) | Database Storage (`prisma/schema.prisma`) | PDF Contract Reaction (`template.tsx` & `generate.ts`) | Audit Certificate Reaction (`generateCertificate.ts`) | Required Fix Action |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **`creatorHandle`** | Asked in Creation & Signing (via `collabDetails` proxy) | Saved in `creatorHandle`, `collabDetails`, & `respondentCompany` | Printed in Party Box, Campaign Box, AND Section 9 Notes | Printed as "Counterparty Campaign Notes" | Bind UI directly to `creatorHandle`. Remove `collabDetails` proxy. |
| **`collabDetails`** | Replaced IG handle input on `/c/[token]` | Duplicate copy of IG handle | Prints `@handle` under Section 9 Campaign Brief | Prints `@handle` under Audit Notes | Restore `collabDetails` for freeform notes only. |
| **`brandName`** | Asked in Creator/Agency forms; NULL in Brand creation | Saved in `contract.brandName` (or NULL if Brand initiated) | Falls back to `initiatorParty.companyName` if NULL | Resolved from `ContractParty` or `Contract` | Auto-populate `brandName` from Party A `companyName` when Brand initiates. |
| **`paymentMethod` / IBAN** | Pre-fills Respondent state with Initiator IBAN on `/c/[token]` | Saved in `paymentMethod` & `respondentPaymentMethod` | Correctly separates Party A & Party B payout blocks | Displays payout routes in signer audit recap | Fix `/c/[token]` state initialization to use `respondentPaymentMethod` / `respondentBankAccountIban`. |
| **Tax IDs / National IDs** | Entered once per party | Duplicated across 4 columns in `Contract` & `ContractParty` | Reads from `ContractParty` snapshot | Reads from `ContractParty` snapshot | Use `ContractParty` as sole source of truth; clean up redundant top-level columns. |
| **`creatorLegalName`** | Collected on `/c/[token]`, but ignored by API | Not saved in DB when Respondent signs | Not rendered on PDF when Manager signs | Not rendered on Certificate | Add `creatorLegalName` to `/api/contracts/share/[token]/sign` & save in DB/PDF. |
| **`collabDeliveryAddress`** | Shipping address for sample product | Saved in `contract.collabDeliveryAddress` | Leaks into Party A/B Legal Address if missing | N/A | Remove `collabDeliveryAddress` from party legal address fallback logic. |

---

## 5. Summary & Next Steps for Resolution

1. **No Code Changed Yet:** As requested, this turn was dedicated strictly to thorough research, data flow analysis, and creating this comprehensive audit documentation.
2. **Key Findings Documented:**
   - Identified 8 major categories of field duplication, misplacement, and data corruption.
   - Identified the root cause of the `@handle` rendering bug in PDF Section 9 & Audit Certificate (`collabDetails` proxy misuse).
   - Identified the IBAN pre-fill bug on `/c/[token]` where Creator IBAN leaked into Brand respondent state.
   - Identified the missing `creatorLegalName` backend processing on respondent signature.
3. **Future Action File:** We will use this document (`CONTRACT_FIELDS_DUPLICATION_AND_ALIGNMENT_AUDIT.md`) as the master reference when we begin resolving these duplication issues step-by-step.
