# Complete Technical Reference & Beginner's Guide to Instant Contracts (SignCollab / BrandBridge)

Welcome! This comprehensive guide explains **everything** about the Instant Contract system in SignCollab. It is designed to educate beginner to intermediate developers on how contracts are structured, created, stored in PostgreSQL via Prisma, signed, cryptographically hashed, rendered as PDFs (along with standalone Audit Certificates), and delivered via automated email notifications under Pakistan's Electronic Transactions Ordinance (ETO 2002) legal framework.

---

## 1. Overview of Instant Contracts

An **Instant Contract** is a bilaterally binding digital legal agreement generated on the platform. The deal lifecycle moves through the following stages:

```
[DRAFT] ➔ [PENDING_RESPONDENT] ➔ [PENDING_INITIATOR / ACTIVE] ➔ [COMPLETED / CANCELLED / EXPIRED]
```

1. **Party A (Initiator)** creates a contract draft specifying deliverables, financial payouts, usage rights, and safeguards.
2. **Publishing / Share Token**: Initiator verifies their identity via Email OTP, publishes the agreement, and receives a unique `shareToken` link (`/c/[shareToken]`).
3. **Party B (Respondent)** opens the link, completes missing identity fields (e.g., CNIC/NTN, payment details), verifies their identity via Email OTP, and applies their digital signature.
4. **Bilateral Execution**:
   - If Party A pre-signed or signs upon submission, the contract immediately transitions to `ACTIVE`.
   - Cryptographic hashes are calculated, the **Contract PDF** and **Standalone Audit Certificate PDF** are rendered in headless Chrome/Edge via Puppeteer, saved to Supabase Storage, and emailed to both parties.

---

## 2. The 6 Contract Types

The system supports **6 distinct contract directions** defined in `prisma/schema.prisma` as `enum ContractType`:

| ContractType Enum | Human Readable Name | Party A (Initiator) | Party B (Respondent) | Primary Use Case |
| :--- | :--- | :--- | :--- | :--- |
| `CREATOR_TO_BRAND` | Creator to Brand Direct Engagement | Creator | Brand | A content creator pitching standard sponsorship terms directly to a brand. |
| `BRAND_TO_CREATOR` | Brand to Creator Direct Sponsorship | Brand | Creator | A brand directly hiring a creator for promotional social media posts. |
| `BRAND_TO_AGENCY` | Brand to Agency Campaign Management | Brand | Agency | A brand delegating campaign strategy, management, or creator sourcing to an agency. |
| `AGENCY_TO_BRAND` | Agency to Brand Marketing & Licensing | Agency | Brand | An agency pitching marketing packages or content licensing to a brand. |
| `AGENCY_TO_CREATOR` | Agency to Creator Content Service | Agency | Creator | An agency hiring a creator for a campaign (can link to parent `BRAND_TO_AGENCY` contract). |
| `CREATOR_TO_AGENCY` | Creator to Agency Representation | Creator | Agency | A creator engaging an agency for management, campaign representation, or talent services. |

---

## 3. Database Schema & Field Storage Breakdown

All contracts are stored in PostgreSQL using **Prisma ORM** in the `contracts` table (`model Contract`), linked with `users`, `deliverables`, `signatures`, `audit_logs`, and `otp_verifications`.

### 3.1 Core Database Fields & Data Types

Below is how every single field is saved in the database:

| Field Name (`schema.prisma`) | Database Data Type | Description & Form Validation | Saved By |
| :--- | :--- | :--- | :--- |
| `id` | `String` (UUID PK) | Unique identifier for internal DB queries. | System (`@default(uuid())`) |
| `contractNumber` | `String` (Unique) | Human-readable ID formatted as `BB-XXXXXX-XXXX` (e.g. `BB-582910-4821`). | System (`/api/contracts`) |
| `verifyToken` | `String` (UUID Unique) | Public verification token embedded in PDF & QR code (`/verify?token=...`). | System (`@default(uuid())`) |
| `shareToken` | `String` (UUID Unique) | Public URL token sent to counterparty (`/c/[shareToken]`). | System (`@default(uuid())`) |
| `contractType` | `ContractType` Enum | One of the 6 contract direction types. | Initiator |
| `status` | `ContractStatus` Enum | `DRAFT`, `PENDING_RESPONDENT`, `PENDING_INITIATOR`, `ACTIVE`, `EXPIRED`, `COMPLETED`, `CANCELLED`. | System Lifecycle |
| `initiatorId` | `String` (FK -> `users.id`) | Foreign key linking Party A's user account. | Initiator Session |
| `respondentId` | `String?` (FK -> `users.id`) | Foreign key linking Party B's user account (created/linked upon signing). | Respondent Sign Action |
| `linkedContractId` | `String?` (Unique FK) | Links an `AGENCY_TO_CREATOR` contract to a parent `BRAND_TO_AGENCY` deal. | Initiator (Agency) |

#### Party A (Initiator) Details
| Field Name | Database Type | Description |
| :--- | :--- | :--- |
| `initiatorDesignation` | `String?` | Job title or signing capacity (e.g. "Managing Director", "Content Creator"). |
| `initiatorPhone` | `String?` | Direct contact number of initiator. |
| `initiatorCompanyName` | `String?` | Entity/Agency name of initiator. |
| `initiatorCompanyAddress`| `String?` | Physical registered address of initiator. |
| `initiatorNtn` | `String?` | National Tax Number for business entity. |
| `initiatorCnic` | `String?` | Computerized National ID Card number for individual signer. |

#### Party B (Respondent) Details (Filled via `/c/[shareToken]`)
| Field Name | Database Type | Description |
| :--- | :--- | :--- |
| `respondentName` | `String?` | Full legal name of counterparty representative. |
| `respondentEmail` | `String?` | Verified email address of counterparty. |
| `respondentPhone` | `String?` | Contact phone number of counterparty. |
| `respondentCompany` | `String?` | Business or company name of counterparty. |
| `respondentAddress` | `String?` | Physical address of counterparty. |
| `respondentDesignation` | `String?` | Job title of counterparty representative. |
| `respondentNtn` | `String?` | NTN of counterparty (if business entity). |
| `respondentCnic` | `String?` | CNIC of counterparty (if individual creator). |

#### Context & Party Meta
| Field Name | Database Type | Description |
| :--- | :--- | :--- |
| `brandName` | `String?` | Client brand name (used in Agency/Creator deals). |
| `brandHandle` | `String?` | Brand Instagram handle or website URL. |
| `campaignName` | `String?` | Title of campaign (e.g., "Summer Launch 2026"). |
| `creatorName` | `String?` | Creator full name. |
| `creatorHandle` | `String?` | Creator social media username (e.g. `@janedoe`). |

#### Financial Payout Terms
| Field Name | Database Type | Description |
| :--- | :--- | :--- |
| `totalAmount` | `Decimal` | Total campaign valuation in PKR. |
| `advancePayment` | `Decimal?` | Upfront advance payment amount in PKR. |
| `advancePaymentDate` | `DateTime?` | Due date for advance payment. |
| `remainingAmount` | `Decimal?` | Calculated automatically: `totalAmount - advancePayment`. |
| `remainingPaymentDate` | `DateTime?` | Due date for final payout post-deliverable delivery. |
| `paymentMethod` | `PaymentMethod?` | `BANK_IBAN`, `JAZZCASH`, `EASYPAISA` (Initiator payment terms). |
| `bankAccountIban` | `String?` | Bank IBAN for initiator payout. |
| `mobileWalletNumber` | `String?` | JazzCash / EasyPaisa wallet number for initiator. |
| `advanceReceived` | `Boolean` | Flag indicating if advance payment has been confirmed received. |
| `respondentPaymentMethod` | `PaymentMethod?` | Counterparty payout method preference. |
| `respondentBankAccountIban` | `String?` | Counterparty IBAN for receiving payments. |
| `respondentMobileWalletNumber` | `String?` | Counterparty mobile wallet number. |

#### Deliverables & Content Specifications
Deliverables are stored in a separate table (`deliverables`) linked via 1-to-many relationship:
- `type` (`DeliverableType` enum: `REEL`, `STORY`, `IMAGE_POST`, `CAROUSEL_POST`, `YOUTUBE_VIDEO`, `TIKTOK_VIDEO`, `LIVE_SESSION`, `AD`)
- `quantity` (`Int`, default `1`)
- `duration` (`String?`, e.g. "30 Days" or "Permanent")
- `notes` (`String?`, creative brief and tagging guidelines)

#### Commercial Usage Rights
| Field Name | Database Type | Description |
| :--- | :--- | :--- |
| `platformsAllowed` | `String[]` | Array of permitted platforms (e.g. `["INSTAGRAM", "YOUTUBE"]`). |
| `usageType` | `UsageType[]` Enum Array | Array containing `ORGANIC_ONLY`, `PAID_AD`, `BILLBOARD_PRINT`, `ALL_MEDIA`. |
| `usageRightsDuration` | `String` | Duration of usage rights (e.g., "30 Days", "1 Year"). |

#### Delivery, Revisions & Pre-Approval
| Field Name | Database Type | Description |
| :--- | :--- | :--- |
| `deliveryTimeframeDays` | `Int` | Days allowed post-contract activation or product receipt to deliver draft. |
| `revisionRounds` | `Int` | Included revision rounds (default `1`). |
| `revisionTurnaroundDays`| `Int` | Days allowed per revision turnaround (default `5`). |
| `brandApprovalRequired` | `Boolean` | If `true`, requires 48-hour pre-approval before posting content. |

#### Physical Product Shipment & Product Loan Terms
| Field Name | Database Type | Description |
| :--- | :--- | :--- |
| `collabProduct` | `String?` | Product name/description to be shipped. |
| `collabProductProvisionType` | `String?` | `"Product Gift / Provision"` or `"Product Loan"`. |
| `collabDeliveryAddress` | `String?` | Address to ship collaboration product. |
| `collabDeliveryDate` | `DateTime?` | Target product delivery date. |
| `collabProductReturnDays` | `Int?` | Days allowed post-campaign to return loaned product. |
| `collabProductReturnAddress` | `String?` | Return address for product loans. |
| `collabProductReturnShippingBy` | `String?` | Who pays return shipping (`"Brand"` or `"Creator"`). |
| `collabProductNonReturnFee` | `Decimal?` | Penalty fee in PKR if loaned product is not returned. |

#### Exclusivity, NDA & Confidentiality
| Field Name | Database Type | Description |
| :--- | :--- | :--- |
| `exclusivityClause` | `Boolean` | Enable category exclusivity clause. |
| `exclusivityDuration` | `String?` | Exclusivity period (e.g. "60 Days"). |
| `exclusivityCompetitors` | `String?` | Prohibited competitor names or categories. |
| `confidentialityRequired` | `Boolean` | Pre-launch NDA active flag. |
| `embargoDate` | `DateTime?` | Date until which campaign details are strictly confidential. |
| `earlyDisclosurePenalty` | `Decimal?` | Liquidated damages for early leak/disclosure under NDA. |

#### Bilateral Safeguards & Penalties
| Field Name | Database Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `latePaymentPenaltyPct` | `Decimal` | `3.00%` | Daily interest charged to Brand for late payout. |
| `lateContentPenaltyPct` | `Decimal` | `3.00%` | Daily fee charged to Creator for delayed delivery. |
| `penaltyCapPct` | `Decimal` | `20.00%` | Maximum total delay penalty cap (% of total amount). |
| `unauthorizedUsagePenaltyPct` | `Decimal` | `50.00%` | Fee for using content outside licensed scope. |
| `advanceRefundable` | `Boolean` | `true` | Is advance payment refundable upon non-delivery? |
| `advanceRefundTimeframeDays` | `Int` | `7` | Days to refund advance if creator defaults. |
| `nonDeliveryCutoffDays` | `Int` | `7` | Days late after which non-breaching party can terminate. |
| `cancellationFeePct` | `Decimal` | `25.00%` | Fee owed if deal is cancelled post-execution. |

#### Copyright & Guidelines
| Field Name | Database Type | Description |
| :--- | :--- | :--- |
| `contentOwnership` | `String` | Legal copyright ownership clause. |
| `taggingRequirements` | `String?` | Caption tags, hashtags, and mention guidelines. |

---

## 4. Cryptographic Hashing Architecture

SignCollab employs a **3-Hash Architecture** to guarantee document integrity, non-repudiation, and auditability.

```
+-----------------------------------------------------------------------------+
| 1. Canonical Payload Hash (contentHash)                                     |
|    SHA-256 of deterministic JSON payload (contract terms, financials, etc.)   |
+-----------------------------------------------------------------------------+
                                       |
                                       v
+-----------------------------------------------------------------------------+
| 2. Signing Event Hash (signingEventHash)                                    |
|    SHA-256 of (contentHash + Signer Email + IP + UserAgent + Fingerprint)   |
+-----------------------------------------------------------------------------+
                                       |
                                       v
+-----------------------------------------------------------------------------+
| 3. Final Bilateral Executed Document Hash (finalDocumentHash)               |
|    SHA-256 of (contentHash + Party B Signing Event + Party A Signing Event) |
+-----------------------------------------------------------------------------+
                                       |
                                       v
+-----------------------------------------------------------------------------+
| 4. PDF Binary Checksum (pdfBinaryHash)                                      |
|    SHA-256 of rendered A4 PDF file byte array buffer                        |
+-----------------------------------------------------------------------------+
```

### 4.1 How `contentHash` is Generated (`src/lib/utils.ts`)

`buildCanonicalContractPayload(contract)` creates a deterministic, sorted JSON representation of the contract's terms:

```typescript
export function buildCanonicalContractPayload(contract: any): string {
  const canonicalObj = {
    contractNumber: contract.contractNumber || "",
    contractType: contract.contractType || "",
    linkedContractId: contract.linkedContractId || "",
    initiator: {
      name: contract.initiator?.name || "",
      email: contract.initiator?.email || "",
      phone: contract.initiatorPhone || contract.initiator?.phone || "",
      company: contract.initiator?.companyName || contract.initiator?.agencyName || contract.initiatorCompanyName || "",
      designation: contract.initiatorDesignation || contract.initiator?.designation || "",
      ntn: contract.initiatorNtn || contract.initiator?.ntn || "",
      cnic: contract.initiatorCnic || contract.initiator?.cnicNumber || "",
    },
    respondent: {
      name: contract.respondentName || "",
      email: contract.respondentEmail || "",
      phone: contract.respondentPhone || "",
      company: contract.respondentCompany || "",
      address: contract.respondentAddress || "",
      designation: contract.respondentDesignation || "",
      ntn: contract.respondentNtn || "",
      cnic: contract.respondentCnic || "",
    },
    brand: {
      name: contract.brandName || "",
      handle: contract.brandHandle || "",
      campaignName: contract.campaignName || "",
    },
    creator: {
      name: contract.creatorName || "",
      handle: contract.creatorHandle || "",
    },
    financials: {
      totalAmount: contract.totalAmount ? String(contract.totalAmount) : "0",
      advancePayment: contract.advancePayment ? String(contract.advancePayment) : "0",
      advancePaymentDate: contract.advancePaymentDate ? new Date(contract.advancePaymentDate).toISOString() : "",
      remainingPaymentDate: contract.remainingPaymentDate ? new Date(contract.remainingPaymentDate).toISOString() : "",
      paymentMethod: contract.paymentMethod || "",
      bankAccountIban: contract.bankAccountIban || "",
      mobileWalletNumber: contract.mobileWalletNumber || "",
      respondentPaymentMethod: contract.respondentPaymentMethod || "",
      respondentBankAccountIban: contract.respondentBankAccountIban || "",
      respondentMobileWalletNumber: contract.respondentMobileWalletNumber || "",
    },
    deliverables: Array.isArray(contract.deliverables)
      ? contract.deliverables
          .map((d: any) => ({
            type: d.type || "",
            quantity: Number(d.quantity || 1),
            duration: d.duration || "",
            notes: d.notes || "",
          }))
          .sort((a: any, b: any) => (a.type || "").localeCompare(b.type || ""))
      : [],
    rights: {
      platformsAllowed: Array.isArray(contract.platformsAllowed) ? [...contract.platformsAllowed].sort() : [],
      usageType: Array.isArray(contract.usageType) ? [...contract.usageType].sort() : [],
      usageRightsDuration: contract.usageRightsDuration || "",
    },
    terms: {
      deliveryTimeframeDays: Number(contract.deliveryTimeframeDays || 0),
      revisionRounds: Number(contract.revisionRounds || 1),
      revisionTurnaroundDays: Number(contract.revisionTurnaroundDays || 5),
      brandApprovalRequired: Boolean(contract.brandApprovalRequired),
      exclusivityClause: Boolean(contract.exclusivityClause),
      exclusivityDuration: contract.exclusivityDuration || "",
      exclusivityCompetitors: contract.exclusivityCompetitors || "",
      confidentialityRequired: Boolean(contract.confidentialityRequired),
      embargoDate: contract.embargoDate ? new Date(contract.embargoDate).toISOString() : "",
      earlyDisclosurePenalty: contract.earlyDisclosurePenalty ? String(contract.earlyDisclosurePenalty) : "0",
      latePaymentPenaltyPct: String(contract.latePaymentPenaltyPct || 3),
      lateContentPenaltyPct: String(contract.lateContentPenaltyPct || 3),
      penaltyCapPct: String(contract.penaltyCapPct || 20),
      unauthorizedUsagePenaltyPct: String(contract.unauthorizedUsagePenaltyPct || 50),
      advanceRefundable: Boolean(contract.advanceRefundable ?? true),
      advanceRefundTimeframeDays: Number(contract.advanceRefundTimeframeDays || 7),
      nonDeliveryCutoffDays: Number(contract.nonDeliveryCutoffDays || 7),
      cancellationFeePct: String(contract.cancellationFeePct || 25),
      contentOwnership: contract.contentOwnership || "",
      taggingRequirements: contract.taggingRequirements || "",
    },
    collabProduct: contract.collabProduct ? {
      name: contract.collabProduct || "",
      provisionType: contract.collabProductProvisionType || "",
      deliveryAddress: contract.collabDeliveryAddress || "",
      deliveryDate: contract.collabDeliveryDate ? new Date(contract.collabDeliveryDate).toISOString() : "",
      returnDays: contract.collabProductReturnDays ? Number(contract.collabProductReturnDays) : null,
      returnAddress: contract.collabProductReturnAddress || "",
      returnShippingBy: contract.collabProductReturnShippingBy || "",
      nonReturnFee: contract.collabProductNonReturnFee ? String(contract.collabProductNonReturnFee) : null,
    } : null,
  };

  return JSON.stringify(canonicalObj);
}
```

The string is hashed with `crypto.createHash("sha256").update(payload).digest("hex")`.

### 4.2 What Items are Included vs. Excluded from `contentHash`

#### Fully Included in `contentHash` (Complete Term Coverage):
- Contract Metadata (`contractNumber`, `contractType`, `linkedContractId`)
- Parties' Full Identification (`name`, `email`, `phone`, `company`, `designation`, `ntn`, `cnic`)
- Brand & Creator Details (`brandName`, `brandHandle`, `campaignName`, `creatorName`, `creatorHandle`)
- Financial Amounts, Payout Dates & Both Parties' Payout Channels (`totalAmount`, `advancePayment`, `advancePaymentDate`, `remainingPaymentDate`, `paymentMethod`, `bankAccountIban`, `mobileWalletNumber`, `respondentPaymentMethod`, `respondentBankAccountIban`, `respondentMobileWalletNumber`)
- Deliverables List (Sorted alphabetically by type)
- Usage Rights (Sorted `platformsAllowed`, sorted `usageType`, `usageRightsDuration`)
- Complete Terms & Safeguards (`deliveryTimeframeDays`, `revisionRounds`, `revisionTurnaroundDays`, `brandApprovalRequired`, `exclusivityClause`, `exclusivityDuration`, `exclusivityCompetitors`, `confidentialityRequired`, `embargoDate`, `earlyDisclosurePenalty`, `latePaymentPenaltyPct`, `lateContentPenaltyPct`, `penaltyCapPct`, `unauthorizedUsagePenaltyPct`, `advanceRefundable`, `advanceRefundTimeframeDays`, `nonDeliveryCutoffDays`, `cancellationFeePct`, `contentOwnership`, `taggingRequirements`)
- Collaboration Product & Loan Return details

#### Intentionally Excluded Items:
- **Dynamic System Tokens & State Timestamps**: `verifyToken`, `shareToken`, `status`, `createdAt`, `updatedAt`, `expiresAt`, `activatedAt` are intentionally omitted so the content hash remains completely deterministic regardless of deal lifecycle stage updates.

---

## 5. PDF Generation Architecture

PDF generation uses **`puppeteer-core`** with headless Google Chrome / Microsoft Edge on Windows (or `@sparticuz/chromium` on serverless environments).

```
API Request -> Fetch Contract DB Record -> Build HTML string -> Puppeteer Render A4 PDF Buffer -> Compute SHA-256 -> Upload to Supabase Storage -> Update DB pdfUrl & pdfBinaryHash
```

### 5.1 Contract PDF (`src/lib/pdf/generate.ts`)

1. **HTML Template Construction**:
   - Headers with company branding and legal notice ("Structured under ETO 2002").
   - DRAFT watermark badge if contract is unexecuted.
   - Section 1: Contracting Parties (Party A vs Party B cards).
   - Section 2: Deliverables specifications table & Retention Breach Enforcement warning.
   - Section 3: Usage rights & permitted platform scope.
   - Section 4: Financial compensation schedule.
   - Section 5: Delivery timeframe, revision rounds, pre-approval protocol.
   - Section 6: Exclusivity restrictions.
   - Section 7: Confidentiality & Pre-Launch NDA (Embargo Date).
   - Section 8: Collaboration product shipment & loan return terms.
   - Section 9: Tagging requirements & copyright ownership clause.
   - Section 10: Bilateral safeguards & liquidated damages caps.
   - Section 11: Governing law & ADR (Pakistan Arbitration Act 1940).
   - Section 12: Bilateral signature audit log with base64 drawn signatures, IPs, emails, timestamps. *(Signatures are retrieved via direct user ID matching `s.signerId === contract.initiatorId` to ensure both Party A and Party B signatures render reliably without role enum mismatch issues).*
   - Footer: Checksum bar displaying `BILATERAL EXECUTED SHA-256`.

2. **Puppeteer A4 Rendering**:
   - Launches headless browser instance.
   - Sets page content with `waitUntil: "domcontentloaded"`.
   - Generates A4 PDF buffer with `margin: 12mm`, `printBackground: true`.

3. **Storage & Verification**:
   - `pdfBinaryHash = crypto.createHash("sha256").update(pdfBuffer).digest("hex")`.
   - Uploads to Supabase Storage bucket `profiles` at path `agreements/${contractId}.pdf`.
   - Updates `finalDocumentHash`, `documentHash`, `pdfBinaryHash`, and `pdfUrl` in PostgreSQL.

### 5.2 Standalone Audit Certificate PDF (`src/lib/pdf/generateCertificate.ts`)

The **Audit Certificate** serves as legal proof of execution under ETO 2002:

1. **QR Code Generation**: Uses `qrcode` package to embed a dynamic QR code pointing to `${APP_URL}/verify?token=${contract.verifyToken}`.
2. **Sections Included**:
   - **Document Reference Summary**: Ref No, Public Verify Token, Title, Lifecycle Status, Timestamps.
   - **Bilateral Signer Identity & OTP Audit Recap**: Signer roles, verified emails, IP addresses, OTP status, signed dates.
   - **Cryptographic Integrity**: Displays `pdfBinaryHash` and `finalDocumentHash`.
   - **Chronological Event Audit Log**: Formats every entry in `AuditLog` table (Timestamp, Action, Actor Email/Role, IP Address).
3. **Storage**:
   - Uploads to Supabase Storage bucket `profiles` at path `certificates/${contractId}_certificate.pdf`.

---

## 6. Email Notification & OTP Authentication Workflow

Email notifications are powered by the **Resend API** (`src/lib/notifications/index.ts` & `email.ts`).

### 6.1 OTP Authentication Flow

```
[User Clicks Request OTP] ➔ Generate 6-Digit Code ➔ Save to OtpVerification Table ➔ Email via Resend ➔ User Inputs Code ➔ Verify & Set verified = true ➔ Enable E-Signature
```

1. **Code Generation**:
   ```typescript
   const code = Math.floor(100000 + Math.random() * 900000).toString();
   const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
   ```
2. **Database Record (`otp_verifications` table)**:
   Stores `email`, `code`, `expiresAt`, `verified: false`, `attempts: 0`.
3. **Dispatch Email**:
   Calls `sendEmailNotification` with template `"otp"`. Displays a 6-digit code in a dark styled box along with signer identity details.
4. **Verification**:
   Endpoints (`/api/contracts/initiator-otp` or `/api/contracts/share/[token]/verify-otp`) search for an unexpired matching code for that email and mark `verified: true`.
5. **Signing Pre-requisite**:
   The signing endpoints (`/sign`) query `otp_verifications` to ensure a `verified: true` record exists for the signer's email before allowing signature registration!

### 6.2 Active Contract & Certificate Email Dispatch

When the final signature is applied and status becomes `ACTIVE`:

1. PDF generator builds `pdfResult.buffer` (Contract PDF) and `certResult.buffer` (Audit Certificate PDF).
2. Attachments array created:
   ```typescript
   const attachments = [
     { filename: `Contract-${contract.contractNumber}.pdf`, content: pdfResult.buffer },
     { filename: `Audit-Certificate-${contract.contractNumber}.pdf`, content: certResult.buffer }
   ];
   ```
3. `sendEmailNotification` is invoked **twice**:
   - **Recipient 1**: `contract.initiator.email`
   - **Recipient 2**: `contract.respondentEmail`
   - Subject: `Active Agreement & Audit Certificate - [contractNumber]`
   - Template: `"contract_active"`

### 6.3 Development Fallback (Mock Mode)

If `RESEND_API_KEY` is not set or contains `"mock"`, the system automatically logs email details and OTP codes to the console (`[MOCK EMAIL DISPATCH]` / `[DEV OTP ALERT]`), allowing full offline development and testing!

---

## 7. Complete Step-by-Step Contract Lifecycle

```
Initiator Creates Draft
        │
        ▼
POST /api/contracts
(Saves DB record with status DRAFT)
        │
        ▼
POST /api/contracts/initiator-otp (Action: send) -> Sends OTP to Initiator
POST /api/contracts/initiator-otp (Action: verify) -> Verifies Initiator Code
        │
        ▼
POST /api/contracts/[id]/submit
(Calculates contentHash, sets status PENDING_RESPONDENT, generates shareToken)
        │
        ▼
GET /api/contracts/share/[token] (Respondent opens link)
PUT /api/contracts/share/[token] (Respondent fills CNIC/NTN & payment details)
        │
        ▼
POST /api/contracts/share/[token]/send-otp -> Sends OTP to Respondent
POST /api/contracts/share/[token]/verify-otp -> Verifies Respondent Code
        │
        ▼
POST /api/contracts/share/[token]/sign
(Computes signingEventHash & finalDocumentHash, sets status ACTIVE, triggers PDFs & sends emails)
        │
        ▼
Public Verification via POST /api/contracts/verify or scanning QR code!
```

---

## 8. Summary Checklist for Developers

- **Contract Types**: Always set `contractType` correctly (`CREATOR_TO_BRAND`, `BRAND_TO_CREATOR`, `BRAND_TO_AGENCY`, `AGENCY_TO_BRAND`, `AGENCY_TO_CREATOR`, `CREATOR_TO_AGENCY`).
- **Hashes**: Remember that `contentHash` canonical payload covers primary financial, deliverable, and party fields, while `signingEventHash` binds identity & IP, `finalDocumentHash` locks bilateral signatures, and `pdfBinaryHash` verifies the raw PDF buffer.
- **PDF Generation**: Handled by `puppeteer-core` with chromium fallback. Both Contract PDF and Audit Certificate PDF are saved in Supabase storage and attached to dispatch emails.
- **Emails & OTP**: All OTP codes expire in 10 minutes. Signed contract notifications deliver both PDFs as attachments.

*Document generated for SignCollab / BrandBridge platform developer onboard training.*
