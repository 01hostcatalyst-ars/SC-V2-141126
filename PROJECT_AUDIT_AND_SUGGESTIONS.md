# BrandBridge / SignCollab — Complete Codebase Audit, Architecture Analysis & Suggestions

**Date:** July 2026  
**Auditor:** Antigravity AI  
**Scope:** Full repository review (`src/app`, `src/lib`, `src/components`, `prisma/schema.prisma`, API routes, PDF generation engines)  
**Status:** Audit & Recommendations (No code modified per user directive)

---

## Executive Summary

**BrandBridge / SignCollab** is a multi-party, multi-jurisdiction digital agreement platform tailored for creator marketing, influencer sponsorships, and agency service agreements. It bridges the gap between simple e-signatures (e.g., DocuSign) and legal campaign compliance by embedding campaign-specific parameters—such as platform usage rights, deliverable retention rules, bilateral delay penalties, product loan terms, and tax treatment rules—into cryptographically hashed digital contracts.

The codebase is built on **Next.js 15.1 (App Router)**, **React 19**, **Tailwind CSS v4**, **Prisma 7.8 (PostgreSQL)**, **Supabase Auth & Storage**, and **Puppeteer-core** for PDF document and audit certificate generation.

While the core legal framework, 3-hash integrity model, and multi-jurisdiction capabilities are sophisticated, our deep code inspection revealed several **critical security vulnerabilities**, **data model inconsistencies**, **serverless execution risks**, and **maintainability bottlenecks** that should be addressed before scaling.

---

## System Architecture & Key Strengths

### 1. Cryptographic 3-Hash Integrity Model
The application implements an advanced document verification system in `src/lib/utils.ts` and `/api/contracts/share/[token]/sign/route.ts`:
- **Base Content Hash (`contentHash`):** Deterministic SHA-256 hash calculated over canonical JSON representation of substantive contract terms (`buildCanonicalContractPayload`).
- **Signing Event Hash (`signingEventHash`):** SHA-256 hash combining `baseContentHash`, signer identity, IP address, user agent, and device fingerprint.
- **Bilateral Executed Hash (`finalDocumentHash`):** SHA-256 hash chaining `baseContentHash`, Party A’s `signingEventHash`, and Party B’s `signingEventHash`.
- **Binary PDF Checksum (`pdfBinaryHash`):** SHA-256 hash generated directly over the rendered A4 PDF buffer output.

### 2. Multi-Jurisdiction Legal & Tax Engine
Located in `src/lib/config/jurisdictions.ts`, `src/lib/tax.ts`, and `src/lib/currency.ts`:
- Supports global jurisdictions (**US ESIGN, UK, UAE, Pakistan, EU, etc.**) with tailored dispute resolution clauses, statutory tax labels (EIN/VAT/TRN/NTN), and governing law references.
- Supports **27 global currencies** with exact decimal formatting rules.
- Tax engine handles `INCLUSIVE`, `EXCLUSIVE`, `REVERSE_CHARGE` (cross-border B2B), and `EXEMPT` treatments.

### 3. Six Directional Workflows
Handles all 6 bi-directional relationship models in creator marketing:
1. `CREATOR_TO_BRAND` (Direct Sponsorship Deal)
2. `BRAND_TO_CREATOR` (Brand Sponsorship Offer)
3. `AGENCY_TO_CREATOR` (Campaign Delegation)
4. `AGENCY_TO_BRAND` (Master Services Agreement)
5. `BRAND_TO_AGENCY` (Agency Retainer)
6. `CREATOR_TO_AGENCY` (Representation Deal)

---

## Detailed Code Problems & Security Vulnerabilities

### Category A: Security & Authentication Edge Cases

#### 1. Loose Email OTP Verification Scoping
* **Location:** [src/app/api/contracts/share/[token]/sign/route.ts](file:///d:/BrandBridge%20v1/src/app/api/contracts/share/[token]/sign/route.ts#L44-L54)
* **Problem:** When a counterparty attempts to sign, the code checks if an email OTP has been verified using:
  ```typescript
  const verification = await prisma.otpVerification.findFirst({
    where: { email, verified: true },
    orderBy: { createdAt: "desc" },
  });
  ```
* **Impact:** This query checks if *any* past OTP verification exists for the given email address. It does **not** verify that the OTP was requested for this specific contract or within a recent timeframe (e.g., last 15 minutes). If a user verified an OTP days ago for a completely different contract, `findFirst` will return true, bypassing identity verification for the new contract.
* **Suggestion:** Tie `OtpVerification` records to `contractId` (or `shareToken`) and check `expiresAt: { gte: new Date() }` during final signing.

#### 2. Public Share Link Inaccessibility Post-Execution
* **Location:** [src/app/api/contracts/share/[token]/route.ts](file:///d:/BrandBridge%20v1/src/app/api/contracts/share/[token]/route.ts#L33-L35)
* **Problem:** Once a contract moves to `ACTIVE` or `COMPLETED`, accessing `GET /api/contracts/share/[token]` returns an HTTP 400 error: `"This agreement link has expired or is no longer open for counterparty signing."`.
* **Impact:** The counterparty who signed via the guest share link cannot revisit `/c/[token]` to view or download their executed contract unless they create a full account.
* **Suggestion:** When `status === "ACTIVE"`, return the completed contract details (read-only mode) along with links to download the executed PDF and Audit Certificate.

#### 3. Easily Circumvented Guest Rate Limiting
* **Location:** [src/app/api/guest/contracts/route.ts](file:///d:/BrandBridge%20v1/src/app/api/guest/contracts/route.ts#L84-L103) & [src/app/api/guest/check-limit/route.ts](file:///d:/BrandBridge%20v1/src/app/api/guest/check-limit/route.ts#L17-L28)
* **Problem:** Guest contract creation limits users to 2 contracts per 24 hours based strictly on `initiator.email`.
* **Impact:** Anyone can bypass this restriction by adding Gmail aliases (`user+1@gmail.com`) or using temporary email services. There is no IP-based rate limiting or CAPTCHA protection.
* **Suggestion:** Implement Redis/upstash or Cloudflare IP-based rate limiting on guest endpoints alongside email checks.

#### 4. Unsanitized Base64 Signature Injection into HTML PDF Templates
* **Location:** [src/lib/pdf/generate.ts](file:///d:/BrandBridge%20v1/src/lib/pdf/generate.ts#L559) & [src/lib/pdf/generateCertificate.ts](file:///d:/BrandBridge%20v1/src/lib/pdf/generateCertificate.ts#L264)
* **Problem:** Base64 signature strings (`signatureB64`) are stored directly in `Signature.signatureImageUrl` and inserted into raw HTML strings rendered by Puppeteer:
  ```html
  <img src="${initiatorSign.signatureImageUrl}" alt="Party A Sig" />
  ```
* **Impact:** If an attacker crafts a malicious `signatureB64` payload containing unescaped HTML/JavaScript, it could inject malicious markup into the Puppeteer browser instance during PDF generation.
* **Suggestion:** Validate that `signatureImageUrl` strictly starts with `data:image/png;base64,` or `data:image/svg+xml;` and sanitize all dynamic string inputs rendered into Puppeteer HTML templates.

---

### Category B: Data Architecture & Schema Discrepancies

#### 5. Authenticated vs Guest Contract Creation Inconsistency
* **Location:** [src/app/api/contracts/route.ts](file:///d:/BrandBridge%20v1/src/app/api/contracts/route.ts#L99-L194) vs [src/app/api/guest/contracts/route.ts](file:///d:/BrandBridge%20v1/src/app/api/guest/contracts/route.ts#L136-L288)
* **Problem:**
  - `/api/contracts` (Authenticated route): Creates a contract with status `DRAFT`, creates only Party A in `ContractParty`, and does **not** compute `contentHash` or generate an initiator signature.
  - `/api/guest/contracts` (Guest route): Creates a contract with status `PENDING_RESPONDENT`, computes `contentHash`, generates Party A signature, records signing event hashes, and creates audit logs.
* **Impact:** Authenticated dashboard users experience a fragmented workflow where contracts created via dashboard lack initial signatures and hashes until explicitly submitted via a separate endpoint, whereas guest contracts are fully pre-signed.
* **Suggestion:** Unify contract creation logic into a shared service layer module (`src/lib/services/contract.service.ts`) used by both guest and authenticated routes.

#### 6. Canonical Hash Payload Omits Tax ID Fields
* **Location:** [src/lib/utils.ts](file:///d:/BrandBridge%20v1/src/lib/utils.ts#L107-L204) (`buildCanonicalContractPayload`)
* **Problem:** The canonical payload builder includes `ntn` and `cnic`, but fails to include the newer generic tax fields added to the Prisma schema (`initiatorTaxId`, `initiatorNationalId`, `respondentTaxId`, `respondentNationalId`).
* **Impact:** If a user updates their generic `taxId` (e.g. US EIN or UAE TRN), `buildCanonicalContractPayload` will not reflect the change in the calculated `contentHash`.
* **Suggestion:** Update `buildCanonicalContractPayload` to include `taxId` and `nationalId` fallback values.

---

### Category C: Infrastructure & Reliability Risks

#### 7. Synchronous Puppeteer PDF Generation in HTTP Request Handlers
* **Location:** [src/app/api/contracts/share/[token]/sign/route.ts](file:///d:/BrandBridge%20v1/src/app/api/contracts/share/[token]/sign/route.ts#L220-L266)
* **Problem:** When the respondent signs, the endpoint synchronously awaits `generateContractPDF` and `generateAuditCertificatePDF` before returning the HTTP response.
* **Impact:**
  - Launching Chromium, loading HTML, rendering dual A4 PDFs, and uploading to Supabase Storage can take **5–12 seconds**.
  - On serverless platforms like Vercel (where default function execution timeouts are 10s or 15s), this frequently causes 504 Gateway Timeouts during counterparty signing.
* **Suggestion:**
  - Move PDF rendering and email delivery out of the critical HTTP response path.
  - Immediately return HTTP 200/201 with status `ACTIVE`, and trigger PDF generation asynchronously (or via background job queue like Inngest / Vercel Cron / QStash).

#### 8. Lack of Error Recovery for Failed Email Delivery
* **Location:** [src/lib/notifications/email.ts](file:///d:/BrandBridge%20v1/src/lib/notifications/email.ts) & [src/app/api/contracts/share/[token]/sign/route.ts](file:///d:/BrandBridge%20v1/src/app/api/contracts/share/[token]/sign/route.ts#L244-L265)
* **Problem:** If Resend API rate limits or fails during contract completion, the error is caught and logged to `console.error`, but no retry mechanism or failed delivery state is recorded in the database.
* **Impact:** Users may complete a contract signing without receiving their executed PDF attachments, with no way for administrators to retry dispatch.
* **Suggestion:** Add an `emailStatus` or `NotificationLog` table to track email dispatch status and enable one-click resend from the dashboard.

---

### Category D: Code Maintainability & UI Architecture

#### 9. Monolithic Frontend Page Components
* **Location:** [src/app/instant/page.tsx](file:///d:/BrandBridge%20v1/src/app/instant/page.tsx) (1,581 lines) & [src/app/c/[token]/page.tsx](file:///d:/BrandBridge%20v1/src/app/c/%5Btoken%5D/page.tsx) (910 lines)
* **Problem:** `src/app/instant/page.tsx` contains 6 complete wizard sections, live jurisdiction calculations, custom select rendering, OTP modal logic, canvas signature states, and inline CSS within a single 78KB file.
* **Impact:** High complexity, difficult code review, duplicated state management, and increased risk of regression bugs when editing UI steps.
* **Suggestion:** Decompose `InstantContractPage` into modular component steps:
  - `components/contract-wizard/Step1Deliverables.tsx`
  - `components/contract-wizard/Step2UsageRights.tsx`
  - `components/contract-wizard/Step3Financials.tsx`
  - `components/contract-wizard/Step4DeliveryTerms.tsx`
  - `components/contract-wizard/Step5Safeguards.tsx`
  - `components/contract-wizard/Step6PartiesAndSign.tsx`

---

## Architectural Comparison & Recommendations Matrix

| Feature Area | Current State | Risk Level | Recommended Target State |
| :--- | :--- | :---: | :--- |
| **OTP Verification** | Global email lookup (`findFirst`) | 🔴 **High** | Scoped to contract ID + expiration check |
| **PDF Generation** | Synchronous inside API route | 🔴 **High** | Asynchronous background job / Queue |
| **Share Link Access** | Blocked (400 error) when Active | 🟡 **Medium** | Read-only access to executed PDF & Cert |
| **Contract Creation** | Dual logic in `/api/contracts` & `/api/guest` | 🟡 **Medium** | Unified `ContractService` backend module |
| **Frontend Layout** | Monolithic 1500+ line page files | 🟡 **Medium** | Decomposed component step architecture |
| **Input Sanitization** | Raw Base64 string interpolation | 🟡 **Medium** | Strict Base64 validation & HTML escaping |

---

## Actionable Implementation Plan (Phase-Wise)

### Phase 1: Security & Verification Hardening
1. Refactor `OtpVerification` to include `contractId` and enforce strict expiration checks on `sign`.
2. Fix `GET /api/contracts/share/[token]` to return completed contracts in read-only mode when `status === "ACTIVE"`.
3. Add Base64 signature format validation and HTML sanitization in `generate.ts` and `generateCertificate.ts`.

### Phase 2: Core Service Unification & Canonical Hashes
1. Create `src/lib/services/contract.service.ts` to centralize contract creation, party snapshots, and hash calculation.
2. Update `buildCanonicalContractPayload` in `src/lib/utils.ts` to include generic `taxId` and `nationalId` fields.

### Phase 3: Performance & Background Processing
1. Decouple PDF generation and Resend email dispatch from the synchronous HTTP request handler in `share/[token]/sign`.
2. Add background retry logic or an admin trigger for re-sending failed contract email notifications.

### Phase 4: UI Refactoring & Modularization
1. Break down `src/app/instant/page.tsx` into 6 step components under `src/components/contract-wizard/`.
2. Extract shared form validation rules into a reusable helper hook (`useContractValidation`).

---

> [!NOTE]  
> No code changes have been made during this turn in accordance with your instruction ("do not change anything now"). The analysis above reflects exact findings from inspecting the workspace code files.
