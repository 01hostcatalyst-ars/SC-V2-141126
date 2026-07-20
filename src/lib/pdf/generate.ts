import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";
import crypto from "crypto";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { prisma } from "@/lib/prisma";
import { formatLegalDate, parseUserAgentString, formatUsageLicenseText, formatDeliverableTypeName, computeContentHash } from "@/lib/utils";
import { getJurisdiction } from "@/lib/config/jurisdictions";
import { formatCurrencyAmount } from "@/lib/currency";
import { calculateContractTax } from "@/lib/tax";

function formatPaymentRoute(method: string | null | undefined, details: any): string {
  if (!method) return "Pending";
  
  let d = details;
  if (typeof d === "string") {
    try { d = JSON.parse(d); } catch (_) { d = {}; }
  } else if (!d) {
    d = {};
  }
  
  const m = method.toUpperCase();
  switch (m) {
    case "BANK_IBAN":
      return `IBAN: ${d.iban || d.bankAccountIban || "N/A"}${d.swift || d.bankSwiftBic ? ` | SWIFT: ${d.swift || d.bankSwiftBic}` : ""}`;
    case "WIRE_TRANSFER":
      return `Bank: ${d.bankName || "N/A"} | Account: ${d.accountNo || d.bankAccountIban || "N/A"}${d.swift || d.bankSwiftBic ? ` | SWIFT: ${d.swift || d.bankSwiftBic}` : ""}`;
    case "ACH_ROUTING":
      return `Routing: ${d.routingNo || d.bankRoutingNumber || "N/A"} | Account: ${d.accountNo || d.bankAccountIban || "N/A"}`;
    case "PAYPAL":
      return `PayPal: ${d.paypalEmail || d.email || "N/A"}`;
    case "WISE":
      return `Wise Tag: ${d.wiseTag || "N/A"}`;
    case "SEPA":
      return `IBAN: ${d.iban || d.bankAccountIban || "N/A"}${d.bic || d.bankSwiftBic ? ` | BIC: ${d.bic || d.bankSwiftBic}` : ""}`;
    case "LOCAL_MOBILE_WALLET":
      return `Wallet Number: ${d.mobileWalletNumber || d.phone || "N/A"}`;
    case "CREDIT_DEBIT_CARD":
      return `Card On File`;
    default:
      if (d.bankAccountIban) return `IBAN: ${d.bankAccountIban}`;
      if (d.mobileWalletNumber) return `Wallet: ${d.mobileWalletNumber}`;
      return `${method.replace(/_/g, " ")}`;
  }
}

export async function generateContractPDF(contractId: string): Promise<{ path: string; buffer: Buffer }> {
  // 1. Fetch full contract specifications with relations
  const contract = await prisma.contract.findUnique({
    where: { id: contractId },
    include: {
      deliverables: true,
      signatures: true,
      initiator: true,
      respondent: true,
      parties: true,
    },
  });

  if (!contract) throw new Error("Contract not found");

  const jur = getJurisdiction((contract as any).jurisdictionCountryCode || "US");
  const currCode = (contract.currency as string) || jur.defaultCurrency || "USD";

  const taxInfo = calculateContractTax(
    {
      totalValuation: Number(contract.totalAmount || 0),
      taxTreatment: ((contract as any).taxTreatment as any) || "INCLUSIVE",
      taxRatePct: Number((contract as any).taxRatePct || 0),
    },
    currCode
  );

  const getRemainingAmount = () => {
    return Number(contract.totalAmount || 0) - Number(contract.advancePayment || 0);
  };

  const initiatorParty = contract.parties.find(p => p.partyType === "INITIATOR") || {
    name: contract.initiator?.name || "Initiator",
    email: contract.initiator?.email || "",
    phone: contract.initiatorPhone || contract.initiator?.phone,
    role: contract.contractType.startsWith("CREATOR_") ? "CREATOR" : contract.contractType.startsWith("BRAND_") ? "BRAND" : "AGENCY",
    designation: contract.initiatorDesignation,
    companyName: contract.initiatorCompanyName || contract.initiator?.agencyName,
    companyAddress: contract.initiatorCompanyAddress || contract.initiator?.agencyAddress,
    ntn: contract.initiatorNtn,
    cnic: contract.initiatorCnic,
  };

  const respondentParty = contract.parties.find(p => p.partyType === "RESPONDENT") || {
    name: contract.respondentName || contract.respondent?.name || "Pending Execution",
    email: contract.respondentEmail || contract.respondent?.email || "Pending Execution",
    phone: contract.respondentPhone || contract.respondent?.phone,
    role: contract.contractType.endsWith("_CREATOR") ? "CREATOR" : contract.contractType.endsWith("_BRAND") ? "BRAND" : "AGENCY",
    designation: contract.respondentDesignation,
    companyName: contract.respondentCompany || contract.respondent?.agencyName,
    companyAddress: contract.respondentAddress || contract.respondent?.agencyAddress,
    ntn: contract.respondentNtn,
    cnic: contract.respondentCnic,
  };

  const initiatorSign = contract.signatures?.find(
    (s: any) => s.signerPartyId === (initiatorParty as any).id || s.signerId === contract.initiatorId
  );

  const respondentSign = contract.signatures?.find(
    (s: any) => s.signerPartyId === (respondentParty as any).id || s.signerId === contract.respondentId || (s.signerId !== contract.initiatorId && s.signerRole !== initiatorParty.role)
  );

  // Determine contract direction human readable header
  const getContractTitle = () => {
    switch (contract.contractType as string) {
      case "AGENCY_TO_BRAND":
        return "AGENCY TO BRAND INFLUENCER MARKETING & CONTENT LICENSING AGREEMENT";
      case "AGENCY_TO_CREATOR":
        return "AGENCY TO CREATOR CONTENT PRODUCTION & SERVICE AGREEMENT";
      case "BRAND_TO_CREATOR":
        return "BRAND TO CREATOR DIRECT SPONSORSHIP AGREEMENT";
      case "CREATOR_TO_BRAND":
        return "CREATOR TO BRAND DIRECT CONTENT ENGAGEMENT AGREEMENT";
      default:
        return "MUTUAL COLLABORATION & CONTENT LICENSING AGREEMENT";
    }
  };

  const finalDocHash = (contract as any).finalDocumentHash || contract.documentHash || computeContentHash(contract);

  const partyATaxId = (initiatorParty as any).taxId || (initiatorParty as any).ntn || (initiatorParty as any).cnic || (initiatorParty as any).nationalId;
  const partyBTaxId = (respondentParty as any).taxId || (respondentParty as any).ntn || (respondentParty as any).cnic || (respondentParty as any).nationalId;

  // Build high-grade legal contract HTML
  const fullHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Legal Campaign Agreement - ${contract.contractNumber}</title>
        <style>
          @page {
            size: A4;
            margin: 15mm;
          }
          body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            color: #0f172a;
            font-size: 10.5pt;
            line-height: 1.5;
            margin: 0;
            padding: 0;
            background: #ffffff;
          }
          .header {
            border-bottom: 2px solid #0f172a;
            padding-bottom: 12px;
            margin-bottom: 18px;
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
          }
          .brand-title {
            font-size: 20pt;
            font-weight: 900;
            color: #000000;
            margin: 0;
            letter-spacing: -0.5px;
          }
          .brand-sub {
            font-size: 8.5pt;
            color: #64748b;
            margin: 2px 0 0 0;
          }
          .contract-badge {
            text-align: right;
          }
          .contract-badge-title {
            font-size: 9.5pt;
            font-weight: 800;
            text-transform: uppercase;
            color: #0f172a;
          }
          .contract-badge-num {
            font-size: 9pt;
            font-weight: 700;
            color: #2563eb;
            margin-top: 2px;
          }
          .section-title {
            font-size: 10pt;
            font-weight: 800;
            text-transform: uppercase;
            color: #0f172a;
            border-bottom: 1.5px solid #0f172a;
            padding-bottom: 3px;
            margin-top: 14px;
            margin-bottom: 8px;
            page-break-after: avoid;
          }
          .grid-2 {
            display: flex;
            gap: 14px;
            margin-bottom: 14px;
          }
          .party-card {
            flex: 1;
            border: 1px solid #cbd5e1;
            border-radius: 6px;
            padding: 10px;
            font-size: 9pt;
            background: #ffffff;
          }
          .party-card-title {
            font-weight: 800;
            text-transform: uppercase;
            color: #475569;
            margin-bottom: 6px;
            border-bottom: 1px solid #f1f5f9;
            padding-bottom: 2px;
          }
          .table-spec {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 14px;
            font-size: 9pt;
            border: 1px solid #cbd5e1;
          }
          .table-spec th {
            background-color: #f1f5f9;
            color: #0f172a;
            padding: 6px 8px;
            border: 1px solid #cbd5e1;
            text-transform: uppercase;
            font-size: 8pt;
          }
          .table-spec td {
            padding: 6px 8px;
            border: 1px solid #cbd5e1;
          }
          .box-clause {
            border: 1px solid #cbd5e1;
            border-radius: 6px;
            padding: 10px;
            font-size: 9pt;
            margin-bottom: 14px;
            background: #ffffff;
            line-height: 1.6;
          }
          .signatures-grid {
            display: flex;
            gap: 16px;
            margin-top: 10px;
            page-break-inside: avoid;
          }
          .signature-box {
            flex: 1;
            border: 1px solid #cbd5e1;
            border-radius: 6px;
            padding: 10px;
            text-align: center;
            background: #ffffff;
          }
          .signature-img {
            max-height: 50px;
            max-width: 160px;
            object-fit: contain;
          }
          .audit-text {
            font-size: 7.5pt;
            color: #64748b;
            margin: 2px 0;
            line-height: 1.3;
          }
          .footer-sha {
            margin-top: 24px;
            padding-top: 10px;
            border-top: 1.5px solid #0f172a;
            font-size: 7.5pt;
            color: #475569;
            text-align: center;
            line-height: 1.4;
          }
        </style>
      </head>
      <body>
        <!-- Header -->
        <div style="display: flex; justify-content: space-between; align-items: flex-end; border-bottom: 2px solid #0f172a; padding-bottom: 10px; margin-bottom: 16px;">
          <div>
            <h1 style="font-size: 18pt; font-weight: 900; margin: 0; color: #000; letter-spacing: -0.5px;">${process.env.NEXT_PUBLIC_COMPANY_NAME || "SignCollab"}</h1>
            <p style="margin: 2px 0 0 0; font-size: 8.5pt; color: #475569;">${process.env.NEXT_PUBLIC_LEGAL_COMPANY_INFO || "SignCollab Digital Agreement Platform"}</p>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 9.5pt; font-weight: 800; color: #0f172a; text-transform: uppercase;">${getContractTitle()}</div>
            <div style="font-size: 7.2pt; color: #64748b; margin-top: 2px;">
              Ref No: <strong style="color: #2563eb;">${contract.contractNumber}</strong> | Created: ${formatLegalDate(contract.createdAt)} | ${jur.lawAbbreviation} Compliant
            </div>
          </div>
        </div>

        ${contract.status === "DRAFT" ? `
          <div style="background: #fffbebf0; border: 1.5px solid #f59e0b; border-radius: 6px; padding: 6px 12px; font-size: 8pt; font-weight: 800; color: #b45309; text-align: center; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 12px;">
            ⚠️ DRAFT PREVIEW — UNEXECUTED &amp; UNVERIFIED DOCUMENT (FOR REVIEW ONLY)
          </div>
        ` : ""}

        <!-- Section 1: Parties -->
        <div style="font-size: 10pt; font-weight: 800; text-transform: uppercase; color: #0f172a; border-bottom: 1.5px solid #0f172a; padding-bottom: 3px; margin-bottom: 8px;">
          1. CONTRACTING PARTIES &amp; LEGAL IDENTIFICATION
        </div>
        <div style="display: flex; gap: 12px; margin-bottom: 14px; font-size: 8.5pt;">
          <div style="flex: 1; border: 1px solid #cbd5e1; border-radius: 6px; padding: 10px; background: #f8fafc;">
            <div style="font-weight: 800; text-transform: uppercase; color: #475569; margin-bottom: 4px; font-size: 8pt;">PARTY A (INITIATOR ENTITY)</div>
            <div style="font-size: 10.5pt; font-weight: 900; color: #0f172a; text-transform: uppercase; margin-bottom: 2px;">
              ${initiatorParty.companyName || initiatorParty.name}
            </div>
            ${partyATaxId ? `<div style="font-size: 8pt; color: #475569; font-weight: bold; margin-bottom: 4px;">${jur.taxIdLabel}: ${partyATaxId}</div>` : ""}
            <div style="border-top: 1px dashed #cbd5e1; padding-top: 4px; margin-top: 6px;">
              <div style="font-weight: 800; text-transform: uppercase; color: #64748b; font-size: 7.5pt; margin-bottom: 2px;">Authorized Signatory Representative</div>
              <div><strong>Representative:</strong> ${initiatorParty.name} ${initiatorParty.designation ? `(${initiatorParty.designation})` : ""}</div>
              <div><strong>Email:</strong> ${initiatorParty.email}</div>
              ${initiatorParty.phone ? `<div><strong>Phone:</strong> ${initiatorParty.phone}</div>` : ""}
              ${initiatorParty.companyAddress ? `<div><strong>Address:</strong> ${initiatorParty.companyAddress}</div>` : ""}
            </div>
          </div>

          <div style="flex: 1; border: 1px solid #cbd5e1; border-radius: 6px; padding: 10px; background: #f8fafc;">
            <div style="font-weight: 800; text-transform: uppercase; color: #475569; margin-bottom: 4px; font-size: 8pt;">PARTY B (COUNTERPARTY ENTITY)</div>
            <div style="font-size: 10.5pt; font-weight: 900; color: #0f172a; text-transform: uppercase; margin-bottom: 2px;">
              ${respondentParty.companyName || contract.creatorName || respondentParty.name}
            </div>
            ${partyBTaxId ? `<div style="font-size: 8pt; color: #475569; font-weight: bold; margin-bottom: 4px;">${jur.taxIdLabel}: ${partyBTaxId}</div>` : ""}
            <div style="border-top: 1px dashed #cbd5e1; padding-top: 4px; margin-top: 6px;">
              <div style="font-weight: 800; text-transform: uppercase; color: #64748b; font-size: 7.5pt; margin-bottom: 2px;">
                ${respondentParty.companyName ? "Authorized Signatory Representative" : "Individual Signer Details"}
              </div>
              <div><strong>Representative:</strong> ${respondentParty.name} ${respondentParty.designation ? `(${respondentParty.designation})` : ""}</div>
              <div><strong>Email:</strong> ${respondentParty.email}</div>
              ${respondentParty.phone ? `<div><strong>Phone:</strong> ${respondentParty.phone}</div>` : ""}
              ${(respondentParty.companyAddress || (respondentParty as any).address) ? `<div><strong>Address:</strong> ${respondentParty.companyAddress || (respondentParty as any).address}</div>` : ""}
            </div>
          </div>
        </div>

        ${(contract.brandName || contract.creatorName || contract.campaignName) ? `
          <div style="border: 1px solid #cbd5e1; border-radius: 6px; padding: 8px; margin-bottom: 14px; background: #ffffff; font-size: 8.5pt;">
            <div style="font-weight: 800; color: #0f172a; text-transform: uppercase; margin-bottom: 4px;">CAMPAIGN &amp; CREATOR CONTEXT</div>
            <div style="display: flex; gap: 16px;">
              ${contract.brandName ? `<div><strong>Client Brand:</strong> ${contract.brandName} (${contract.brandHandle || "N/A"})</div>` : ""}
              ${contract.creatorName ? `<div><strong>Creator:</strong> ${contract.creatorName} (${contract.creatorHandle || "N/A"})</div>` : ""}
              ${contract.campaignName ? `<div><strong>Campaign:</strong> ${contract.campaignName}</div>` : ""}
            </div>
          </div>
        ` : ""}

        <!-- Section 2: Deliverables -->
        <div style="font-size: 10pt; font-weight: 800; text-transform: uppercase; color: #0f172a; border-bottom: 1.5px solid #0f172a; padding-bottom: 3px; margin-bottom: 8px;">
          2. CAMPAIGN DELIVERABLES SPECIFICATIONS &amp; RETENTION ENFORCEMENT
        </div>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 6px; font-size: 8.5pt; border: 1px solid #cbd5e1;">
          <thead>
            <tr style="background-color: #f1f5f9; color: #0f172a; text-transform: uppercase; font-size: 8pt;">
              <th style="padding: 6px 8px; border: 1px solid #cbd5e1; text-align: left;">Platform Format</th>
              <th style="padding: 6px 8px; border: 1px solid #cbd5e1; text-align: center; width: 60px;">Quantity</th>
              <th style="padding: 6px 8px; border: 1px solid #cbd5e1; text-align: center; width: 120px;">Stay Published</th>
              <th style="padding: 6px 8px; border: 1px solid #cbd5e1; text-align: left;">Brief &amp; Instructions</th>
            </tr>
          </thead>
          <tbody>
            ${contract.deliverables?.map((d: any) => `
              <tr>
                <td style="padding: 6px 8px; border: 1px solid #cbd5e1; font-weight: bold;">${formatDeliverableTypeName(d.type)}</td>
                <td style="padding: 6px 8px; border: 1px solid #cbd5e1; text-align: center; font-weight: bold;">${d.quantity}</td>
                <td style="padding: 6px 8px; border: 1px solid #cbd5e1; text-align: center; color: #475569;">${d.duration || "Permanent"}</td>
                <td style="padding: 6px 8px; border: 1px solid #cbd5e1; color: #334155;">${d.notes || "Standard creative execution as agreed."}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
        <div style="font-size: 7.5pt; color: #475569; margin-bottom: 14px; font-style: italic;">
          * RETENTION BREACH ENFORCEMENT: Premature deletion, archiving, or hiding of deliverables prior to the agreed retention duration constitutes a material breach, subjecting the breaching party to a mandatory pro-rata refund plus a 25% early-deletion penalty fee.
        </div>

        <!-- Section 3: Usage Rights -->
        <div style="font-size: 10pt; font-weight: 800; text-transform: uppercase; color: #0f172a; border-bottom: 1.5px solid #0f172a; padding-bottom: 3px; margin-top: 14px; margin-bottom: 8px;">
          3. USAGE RIGHTS, PLATFORM SCOPE &amp; LICENSING TERMS
        </div>
        <div style="border: 1px solid #cbd5e1; border-radius: 6px; padding: 10px; font-size: 8.5pt; margin-bottom: 14px; background: #ffffff; line-height: 1.6;">
          <div style="margin-bottom: 4px;"><strong>Permitted Platforms:</strong> ${contract.platformsAllowed?.map((p: string) => (p === "X_TWITTER" ? "X (TWITTER)" : p)).join(", ")}</div>
          <div style="margin-bottom: 4px;"><strong>Granted Commercial License:</strong> <strong>${formatUsageLicenseText(contract.usageType)}</strong></div>
          <div style="margin-bottom: 4px;"><strong>Licensed Duration:</strong> <strong>${contract.usageRightsDuration}</strong></div>
          <div style="font-size: 7.5pt; color: #64748b; margin-top: 6px; border-top: 1px dashed #cbd5e1; padding-top: 4px;">
            <em>WITHHELD RIGHTS NOTICE: Party A and Creator reserve all intellectual property rights not expressly granted above. Any commercial re-use, television broadcast, dark-posting, or off-platform print distribution outside the licensed parameters is strictly prohibited without prior written amendment.</em>
          </div>
        </div>

        <!-- Section 4: Financial Compensation -->
        <div style="font-size: 10pt; font-weight: 800; text-transform: uppercase; color: #0f172a; border-bottom: 1.5px solid #0f172a; padding-bottom: 3px; margin-top: 14px; margin-bottom: 8px;">
          4. FINANCIAL COMPENSATION &amp; PAYMENT SCHEDULE
        </div>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 14px; font-size: 8.5pt; border: 1px solid #cbd5e1;">
          <thead>
            <tr style="background-color: #f1f5f9; color: #0f172a; text-transform: uppercase; font-size: 8pt;">
              <th style="padding: 6px 8px; border: 1px solid #cbd5e1; text-align: left;">Total Valuation</th>
              <th style="padding: 6px 8px; border: 1px solid #cbd5e1; text-align: left;">Tax Treatment &amp; Terms</th>
              <th style="padding: 6px 8px; border: 1px solid #cbd5e1; text-align: left;">Advance Payout</th>
              <th style="padding: 6px 8px; border: 1px solid #cbd5e1; text-align: left;">Remaining Payout</th>
              <th style="padding: 6px 8px; border: 1px solid #cbd5e1; text-align: left;">Payment Route</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="padding: 6px 8px; border: 1px solid #cbd5e1; font-weight: bold; font-size: 9.5pt;">${formatCurrencyAmount(Number(contract.totalAmount || 0), currCode)}</td>
              <td style="padding: 6px 8px; border: 1px solid #cbd5e1; font-size: 8pt;">${taxInfo.displayText}</td>
              <td style="padding: 6px 8px; border: 1px solid #cbd5e1;">
                <strong>${formatCurrencyAmount(Number(contract.advancePayment || 0), currCode)}</strong>
                ${contract.advancePaymentDate ? `<br /><span style="font-size: 7.5pt; color: #64748b;">Due: ${formatLegalDate(contract.advancePaymentDate, jur.countryCode)}</span>` : ""}
              </td>
              <td style="padding: 6px 8px; border: 1px solid #cbd5e1;">
                <strong>${formatCurrencyAmount(getRemainingAmount(), currCode)}</strong>
                ${contract.remainingPaymentDate ? `<br /><span style="font-size: 7.5pt; color: #64748b;">Due: ${formatLegalDate(contract.remainingPaymentDate, jur.countryCode)}</span>` : ""}
              </td>
              <td style="padding: 6px 8px; border: 1px solid #cbd5e1;">
                <strong>${contract.paymentMethod ? (contract.paymentMethod as string).replace(/_/g, " ") : "Not Specified"}</strong>
                <br /><span style="font-size: 7.5pt; font-family: monospace; color: #475569;">
                  ${formatPaymentRoute(contract.paymentMethod, (contract as any).paymentRoutingDetails || { bankAccountIban: contract.bankAccountIban, mobileWalletNumber: contract.mobileWalletNumber })}
                </span>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Section 5: Delivery Protocol & Revisions -->
        <div style="font-size: 10pt; font-weight: 800; text-transform: uppercase; color: #0f172a; border-bottom: 1.5px solid #0f172a; padding-bottom: 3px; margin-top: 14px; margin-bottom: 8px;">
          5. DELIVERY TIMEFRAME, REVISIONS &amp; PRE-APPROVAL PROTOCOL
        </div>
        <div style="border: 1px solid #cbd5e1; border-radius: 6px; padding: 10px; font-size: 8.5pt; margin-bottom: 14px; background: #ffffff; line-height: 1.6;">
          <div style="display: flex; gap: 12px; margin-bottom: 6px;">
            <div style="flex: 1;"><strong>Initial Draft Window:</strong> ${contract.deliveryTimeframeDays} Calendar Days</div>
            <div style="flex: 1;"><strong>Revision Rounds:</strong> ${contract.revisionRounds} Included</div>
            <div style="flex: 1;"><strong>Revision Turnaround:</strong> ${contract.revisionTurnaroundDays || 5} Days / Round</div>
          </div>
          <div><strong>Pre-Approval Protocol:</strong> ${contract.brandApprovalRequired ? "Strict Pre-Approval Required (48-hour deemed approval applies if feedback is withheld)" : "Direct Content Publishing Permitted"}</div>
        </div>

        <!-- Section 6: Exclusivity Restrictions -->
        <div style="font-size: 10pt; font-weight: 800; text-transform: uppercase; color: #0f172a; border-bottom: 1.5px solid #0f172a; padding-bottom: 3px; margin-top: 14px; margin-bottom: 8px;">
          6. EXCLUSIVITY RESTRICTIONS &amp; PROHIBITED COMPETITORS
        </div>
        <div style="border: 1px solid #cbd5e1; border-radius: 6px; padding: 10px; font-size: 8.5pt; margin-bottom: 14px; background: #ffffff; line-height: 1.6;">
          <div><strong>Category Exclusivity:</strong> ${contract.exclusivityClause ? `Active (${contract.exclusivityDuration || "Agreed Duration"})` : "Non-Exclusive"}</div>
          ${contract.exclusivityClause && contract.exclusivityCompetitors ? `<div><strong>Restricted Competitors / Categories:</strong> ${contract.exclusivityCompetitors}</div>` : ""}
        </div>

        <!-- Section 7: Confidentiality & Pre-Launch Embargo (NDA) -->
        <div style="font-size: 10pt; font-weight: 800; text-transform: uppercase; color: #0f172a; border-bottom: 1.5px solid #0f172a; padding-bottom: 3px; margin-top: 14px; margin-bottom: 8px;">
          7. CONFIDENTIALITY &amp; PRE-LAUNCH PRODUCT EMBARGO (NDA)
        </div>
        <div style="border: 1px solid ${contract.confidentialityRequired ? "#fde68a" : "#cbd5e1"}; border-radius: 6px; padding: 10px; font-size: 8.5pt; margin-bottom: 14px; background: ${contract.confidentialityRequired ? "#fffbeb" : "#ffffff"}; line-height: 1.6;">
          <div><strong>Pre-Launch NDA Status:</strong> ${contract.confidentialityRequired ? `Strict Pre-Launch NDA Active (Embargo Date: ${contract.embargoDate ? formatLegalDate(contract.embargoDate, jur.countryCode) : "Official Release Date"})` : "Standard Commercial Confidentiality"}</div>
          ${contract.confidentialityRequired && contract.earlyDisclosurePenalty ? `<div><strong>Early Leak Liquidated Damages:</strong> ${formatCurrencyAmount(Number(contract.earlyDisclosurePenalty), currCode)}</div>` : ""}
        </div>

        <!-- Section 8: Collaboration Product Shipment & Loan Terms -->
        <div style="font-size: 10pt; font-weight: 800; text-transform: uppercase; color: #0f172a; border-bottom: 1.5px solid #0f172a; padding-bottom: 3px; margin-top: 14px; margin-bottom: 8px;">
          8. COLLABORATION PRODUCT SHIPMENT &amp; LOAN RETURN TERMS
        </div>
        <div style="border: 1px solid #cbd5e1; border-radius: 6px; padding: 10px; font-size: 8.5pt; margin-bottom: 14px; background: #ffffff; line-height: 1.6;">
          ${contract.collabProduct ? `
            <div>• <strong>Product Item:</strong> <strong>${contract.collabProduct}</strong> (${contract.collabProductProvisionType || "Provision"})</div>
            <div>• <strong>Delivery Start Trigger:</strong> Timeframe (${contract.deliveryTimeframeDays} days) starts post receipt of product shipment or advance payment.</div>
            ${contract.collabDeliveryAddress ? `<div>• <strong>Shipment Address:</strong> ${contract.collabDeliveryAddress}</div>` : ""}
            ${contract.collabProductProvisionType === "Product Loan" ? `
              <div style="margin-top: 6px; padding-top: 6px; border-top: 1px dashed #cbd5e1; color: #92400e;">
                <div>• <strong>Product Loan Return:</strong> Required within <strong>${contract.collabProductReturnDays || 7} days</strong> post-deliverable. Return Shipping Paid By: <strong>${contract.collabProductReturnShippingBy || "Brand"}</strong>.</div>
                ${contract.collabProductReturnAddress ? `<div>• Return Shipping Address: ${contract.collabProductReturnAddress}</div>` : ""}
                ${contract.collabProductNonReturnFee ? `<div>• Non-Return Penalty Fee: <strong>${formatCurrencyAmount(Number(contract.collabProductNonReturnFee), currCode)}</strong></div>` : ""}
              </div>
            ` : ""}
          ` : `
            <div>• <strong>Product Shipment Status:</strong> No physical product loan or shipment required for this collaboration. Deliverable delivery window commences post-execution and advance payment receipt as agreed.</div>
          `}
        </div>


        <!-- Section 9: Tagging Requirements & Copyright Ownership -->
        <div style="font-size: 10pt; font-weight: 800; text-transform: uppercase; color: #0f172a; border-bottom: 1.5px solid #0f172a; padding-bottom: 3px; margin-top: 14px; margin-bottom: 8px;">
          9. TAGGING REQUIREMENTS &amp; COPYRIGHT OWNERSHIP
        </div>
        <div style="border: 1px solid #cbd5e1; border-radius: 6px; padding: 10px; font-size: 8.5pt; margin-bottom: 14px; background: #ffffff; line-height: 1.6;">
          ${contract.taggingRequirements ? `<div style="margin-bottom: 4px;"><strong>Tagging &amp; Caption Guidelines:</strong> ${contract.taggingRequirements}</div>` : ""}
          <div><strong>Content Copyright Clause:</strong> ${contract.contentOwnership}</div>
        </div>

        <!-- Section 10: Bilateral Safeguards & Liquidated Damages -->
        <div style="font-size: 10pt; font-weight: 800; text-transform: uppercase; color: #0f172a; border-bottom: 1.5px solid #0f172a; padding-bottom: 3px; margin-top: 14px; margin-bottom: 8px;">
          10. BILATERAL SAFEGUARDS &amp; LATE PENALTY CAPS
        </div>
        <div style="border: 1px solid #cbd5e1; border-radius: 6px; padding: 10px; font-size: 8.5pt; margin-bottom: 14px; background: #f8fafc; line-height: 1.6;">
          <div>• <strong>Late Payment Penalty (Charged to Brand):</strong> ${Number(contract.latePaymentPenaltyPct || 3)}% per calendar day of delay.</div>
          <div>• <strong>Late Content Delivery Penalty (Charged to Agency/Creator):</strong> ${Number(contract.lateContentPenaltyPct || 3)}% per calendar day of delay.</div>
          <div>• <strong>Liquidated Damages Cap:</strong> Total accrued delay penalties are strictly capped at <strong>${Number(contract.penaltyCapPct || 20)}%</strong> of Total Campaign Valuation.</div>
          <div>• <strong>Non-Delivery Cutoff &amp; Default:</strong> Delay exceeding ${contract.nonDeliveryCutoffDays || 7} calendar days post-deadline constitutes a material breach, granting the non-breaching party immediate right of cancellation and 100% advance refund recovery.</div>
          <div>• <strong>Unauthorized Brand Re-Use Penalty:</strong> ${Number(contract.unauthorizedUsagePenaltyPct || 50)}% of total contract value per violation outside licensed scope.</div>
          <div>• <strong>Pre-Delivery Cancellation Fee:</strong> ${Number(contract.cancellationFeePct || 25)}% of total campaign fee owed if terminated post-execution prior to deliverable hand-off.</div>
        </div>

        <!-- Section 11: Governing Law & Dispute Resolution (ADR) -->
        <div style="font-size: 10pt; font-weight: 800; text-transform: uppercase; color: #0f172a; border-bottom: 1.5px solid #0f172a; padding-bottom: 3px; margin-top: 14px; margin-bottom: 8px;">
          11. GOVERNING LAW &amp; DISPUTE RESOLUTION (ADR)
        </div>
        <div style="border: 1px solid #cbd5e1; border-radius: 6px; padding: 10px; font-size: 8.5pt; margin-bottom: 14px; background: #ffffff; line-height: 1.6;">
          ${jur.disputeClause} Legal recourse and dispute determination shall be administered under the <strong>${jur.arbitrationAct}</strong>.
        </div>

        <!-- Section 12: Bilateral Signature Audit Log -->
        <div style="font-size: 10pt; font-weight: 800; text-transform: uppercase; color: #0f172a; border-bottom: 1.5px solid #0f172a; padding-bottom: 3px; margin-top: 14px; margin-bottom: 8px;">
          12. ${jur.lawAbbreviation.toUpperCase()} BILATERAL SIGNATURE AUDIT LOG &amp; CRYPTOGRAPHIC VERIFICATION
        </div>
        <div style="display: flex; gap: 12px; margin-bottom: 14px;">
          <div style="flex: 1; border: 1px solid #cbd5e1; border-radius: 6px; padding: 10px; text-align: center; background: #ffffff;">
            <div style="font-size: 8pt; font-weight: 800; text-transform: uppercase; color: #475569;">PARTY A (INITIATOR SIGNATURE)</div>
            ${initiatorSign ? `
              <div style="height: 55px; display: flex; align-items: center; justify-content: center; margin: 6px 0;">
                <img src="${initiatorSign.signatureImageUrl}" alt="Party A Sig" style="max-height: 50px; max-width: 160px; object-fit: contain;" />
              </div>
              <div style="font-size: 7.5pt; color: #334155;">
                <div style="font-weight: 800; color: #0f172a; font-size: 8pt; text-transform: uppercase;">EXECUTED ON BEHALF OF:</div>
                <div style="font-weight: 900; color: #2563eb; text-transform: uppercase; font-size: 9.5pt; margin-bottom: 4px;">
                  ${initiatorParty.companyName || initiatorParty.name}
                </div>
                <div>Authorized Signer: <strong>${initiatorParty.name}</strong> ${initiatorParty.designation ? `(${initiatorParty.designation})` : ""}</div>
                <div>Email: ${initiatorParty.email} | IP: ${initiatorSign.ipAddress}</div>
                <div>Signed: ${formatLegalDate(initiatorSign.signedAt, jur.countryCode)}</div>
              </div>
            ` : `
              <div style="height: 55px; display: flex; align-items: center; justify-content: center; color: #94a3b8; font-style: italic; font-size: 8.5pt;">Pending Signature</div>
            `}
          </div>

          <div style="flex: 1; border: 1px solid #cbd5e1; border-radius: 6px; padding: 10px; text-align: center; background: #ffffff;">
            <div style="font-size: 8pt; font-weight: 800; text-transform: uppercase; color: #475569;">PARTY B (RESPONDENT SIGNATURE)</div>
            ${respondentSign ? `
              <div style="height: 55px; display: flex; align-items: center; justify-content: center; margin: 6px 0;">
                <img src="${respondentSign.signatureImageUrl}" alt="Party B Sig" style="max-height: 50px; max-width: 160px; object-fit: contain;" />
              </div>
              <div style="font-size: 7.5pt; color: #334155;">
                <div style="font-weight: 800; color: #0f172a; font-size: 8pt; text-transform: uppercase;">EXECUTED ON BEHALF OF:</div>
                <div style="font-weight: 900; color: #2563eb; text-transform: uppercase; font-size: 9.5pt; margin-bottom: 4px;">
                  ${respondentParty.companyName || contract.creatorName || respondentParty.name}
                </div>
                <div>Authorized Signer: <strong>${respondentParty.name}</strong> ${respondentParty.designation ? `(${respondentParty.designation})` : ""}</div>
                <div>Verified Email OTP: ✓ Verified | Email: ${respondentParty.email} | IP: ${respondentSign.ipAddress}</div>
                <div>Signed: ${formatLegalDate(respondentSign.signedAt, jur.countryCode)}</div>
              </div>
            ` : `
              <div style="height: 55px; display: flex; align-items: center; justify-content: center; color: #94a3b8; font-style: italic; font-size: 8.5pt;">Pending Signature</div>
            `}
          </div>
        </div>

        <!-- SHA-256 Footer Checksum Bar -->
        <div style="border-top: 1.5px solid #0f172a; margin-top: 20px; padding-top: 8px; text-align: center; font-size: 7.5pt; color: #475569; page-break-inside: avoid;">
          <div style="font-size: 6.8pt; line-height: 1.35; color: #64748b; max-width: 95%; margin: 0 auto 4px auto;">PLATFORM ROLE &amp; LIABILITY DISCLAIMER: SignCollab is an independent technology service provider facilitating digital document creation and cryptographic signature logging in compliance with ${jur.governingLawName}. SignCollab is not a legal representative, broker, or party to this agreement, provides no legal advice, and disclaims all liability arising from the performance, enforcement, or dispute of its terms.</div>
          <div style="font-family: monospace; font-weight: bold; margin-top: 2px;">BILATERAL EXECUTED SHA-256: <span style="color: #2563eb;">${finalDocHash}</span></div>
        </div>
      </body>
    </html>
  `;

  // 3. Launch Puppeteer PDF Renderer
  let executablePath = "";
  if (process.platform === "win32") {
    const fs = require("fs");
    const paths = [
      "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
      "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
      "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
    ];
    for (const p of paths) {
      if (fs.existsSync(p)) {
        executablePath = p;
        break;
      }
    }
    if (!executablePath) {
      throw new Error("Could not locate local Chrome or Edge browser executable on Windows.");
    }
  } else {
    executablePath = await chromium.executablePath();
  }

  const browser = await puppeteer.launch({
    args: process.platform === "win32" ? [] : chromium.args,
    executablePath,
    headless: true,
  });

  const page = await browser.newPage();
  await page.setContent(fullHtml, { waitUntil: "domcontentloaded" });
  const pdfBuffer = await page.pdf({
    format: "A4",
    printBackground: true,
    margin: { top: "12mm", bottom: "12mm", left: "12mm", right: "12mm" },
  });
  await browser.close();

  // 4. Compute SHA-256 integrity hash over rendered PDF binary buffer
  const pdfBinaryHash = crypto.createHash("sha256").update(pdfBuffer).digest("hex");

  // 5. Upload document to Supabase storage
  const filePath = `agreements/${contractId}.pdf`;
  const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
    .from("profiles")
    .upload(filePath, pdfBuffer, {
      contentType: "application/pdf",
      upsert: true,
    });

  if (uploadError) throw new Error(uploadError.message);

  // 6. Write PDF metadata & binary file checksum into Contract table in PostgreSQL
  await prisma.contract.update({
    where: { id: contractId },
    data: {
      finalDocumentHash: finalDocHash,
      documentHash: finalDocHash,
      pdfBinaryHash,
      pdfUrl: uploadData.path,
    },
  });

  return { path: uploadData.path, buffer: Buffer.from(pdfBuffer) };
}
