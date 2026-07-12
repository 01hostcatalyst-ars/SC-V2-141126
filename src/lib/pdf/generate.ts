import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";
import crypto from "crypto";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { prisma } from "@/lib/prisma";

export async function generateContractPDF(contractId: string): Promise<{ path: string; buffer: Buffer }> {
  // 1. Fetch full contract specifications with relations
  const contract = await prisma.contract.findUnique({
    where: { id: contractId },
    include: {
      deliverables: true,
      signatures: true,
      initiator: true,
      respondent: true,
    },
  });

  if (!contract) throw new Error("Contract not found");

  const getRemainingAmount = () => {
    return Number(contract.totalAmount || 0) - Number(contract.advancePayment || 0);
  };

  const formatUsageType = (type: any) => {
    if (Array.isArray(type)) {
      return type.map((t) => t.replace(/_/g, " ")).join(", ");
    }
    if (typeof type === 'string') {
      return type.replace(/_/g, " ");
    }
    return "N/A";
  };

  const getSignatureByRole = (role: string) => {
    return contract.signatures?.find((s: any) => s.signerRole === role);
  };

  const respondentSign = getSignatureByRole(
    contract.contractType === "BRAND_TO_CREATOR" || contract.contractType === "AGENCY_TO_CREATOR"
      ? "CREATOR"
      : "BRAND"
  );

  const initiatorSign = getSignatureByRole(contract.initiator.role);

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
            color: #475569;
            margin: 2px 0 0 0;
          }
          .doc-title-block {
            text-align: right;
          }
          .doc-type {
            font-size: 9.5pt;
            font-weight: 800;
            color: #000000;
            margin: 0;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .doc-number {
            font-size: 9pt;
            font-weight: 700;
            color: #2563eb;
            margin: 2px 0 0 0;
          }
          .preamble-box {
            background-color: #f8fafc;
            border: 1px solid #cbd5e1;
            border-radius: 6px;
            padding: 10px 14px;
            font-size: 9pt;
            color: #334155;
            margin-bottom: 16px;
            line-height: 1.4;
          }
          .section-header {
            font-size: 10.5pt;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: #0f172a;
            border-bottom: 1.5px solid #0f172a;
            padding-bottom: 4px;
            margin-top: 18px;
            margin-bottom: 10px;
            page-break-after: avoid;
          }
          .parties-grid {
            display: flex;
            gap: 16px;
            margin-bottom: 16px;
          }
          .party-card {
            flex: 1;
            border: 1px solid #cbd5e1;
            border-radius: 6px;
            padding: 10px 14px;
            background: #ffffff;
          }
          .party-title {
            font-size: 9pt;
            font-weight: 800;
            text-transform: uppercase;
            color: #475569;
            margin: 0 0 6px 0;
            border-bottom: 1px solid #f1f5f9;
            padding-bottom: 4px;
          }
          .info-row {
            margin: 3px 0;
            font-size: 9.5pt;
          }
          .info-row strong {
            color: #0f172a;
          }
          table.data-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 14px;
            font-size: 9.5pt;
          }
          table.data-table th {
            background-color: #f1f5f9;
            color: #0f172a;
            font-weight: 800;
            text-transform: uppercase;
            font-size: 8.5pt;
            padding: 8px 10px;
            border: 1px solid #cbd5e1;
            text-align: left;
          }
          table.data-table td {
            padding: 8px 10px;
            border: 1px solid #cbd5e1;
            vertical-align: top;
          }
          .badge {
            display: inline-block;
            background-color: #0f172a;
            color: #ffffff;
            font-size: 8pt;
            font-weight: 700;
            padding: 2px 6px;
            border-radius: 4px;
            text-transform: uppercase;
            margin-right: 4px;
          }
          .badge-alert {
            background-color: #ef4444;
            color: #ffffff;
          }
          .badge-warn {
            background-color: #f59e0b;
            color: #ffffff;
          }
          .penalty-box {
            background-color: #fffbeb;
            border: 1px solid #fde68a;
            border-radius: 6px;
            padding: 10px 14px;
            font-size: 9pt;
            color: #92400e;
            margin-bottom: 14px;
            line-height: 1.5;
          }
          .signature-section {
            margin-top: 26px;
            page-break-inside: avoid;
          }
          .signature-grid {
            display: flex;
            gap: 20px;
            margin-top: 12px;
          }
          .sig-card {
            flex: 1;
            border: 1px solid #cbd5e1;
            border-radius: 8px;
            padding: 12px;
            text-align: center;
            background: #ffffff;
          }
          .sig-img-container {
            height: 65px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 8px 0;
          }
          .sig-img {
            max-height: 55px;
            max-width: 180px;
            object-contain: fit;
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
        <div className="header" style="display: flex; justify-content: space-between; border-bottom: 2px solid #0f172a; padding-bottom: 10px; margin-bottom: 14px;">
          <div>
            <h1 style="font-size: 18pt; font-weight: 900; margin: 0; color: #000;">${process.env.NEXT_PUBLIC_COMPANY_NAME || "SignCollab"}</h1>
            <p style="margin: 2px 0 0 0; font-size: 8.5pt; color: #475569;">${process.env.NEXT_PUBLIC_LEGAL_COMPANY_INFO || "SignCollab Legal Protocol, Pakistan"}</p>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 9pt; font-weight: 800; color: #000; text-transform: uppercase;">${getContractTitle()}</div>
            <div style="font-size: 9pt; font-weight: 700; color: #2563eb; margin-top: 2px;">Ref No: ${contract.contractNumber}</div>
          </div>
        </div>

        <!-- Legal Preamble -->
        <div style="background-color: #f8fafc; border: 1px solid #cbd5e1; border-radius: 6px; padding: 8px 12px; font-size: 8.5pt; color: #334155; margin-bottom: 14px;">
          <strong>LEGAL PREAMBLE & E-SIGN BINDING NOTICE:</strong> This document represents a legally binding electronic agreement executed under the Electronic Transactions Ordinance (ETO 2002) of Pakistan. All parameters, financial consideration, usage licenses, and bilateral penalties set forth herein are legally enforceable upon execution by both parties.
        </div>

        <!-- Section 1: Parties & Recitals -->
        <div style="font-size: 10pt; font-weight: 800; text-transform: uppercase; color: #0f172a; border-bottom: 1.5px solid #0f172a; padding-bottom: 3px; margin-bottom: 8px;">
          1. PARTIES &amp; RECITALS
        </div>
        <div style="display: flex; gap: 14px; margin-bottom: 14px;">
          <div style="flex: 1; border: 1px solid #cbd5e1; border-radius: 6px; padding: 10px; font-size: 9pt;">
            <div style="font-weight: 800; text-transform: uppercase; color: #475569; margin-bottom: 6px; border-bottom: 1px solid #f1f5f9; padding-bottom: 2px;">PARTY A (AGENCY / INITIATOR)</div>
            <div style="margin: 2px 0;"><strong>Legal Name:</strong> ${contract.initiator.name}</div>
            <div style="margin: 2px 0;"><strong>Email:</strong> ${contract.initiator.email}</div>
            ${contract.initiator.phone ? `<div style="margin: 2px 0;"><strong>Phone:</strong> ${contract.initiator.phone}</div>` : ""}
            ${(contract.initiator as any).agencyName ? `<div style="margin: 2px 0;"><strong>Company:</strong> ${(contract.initiator as any).agencyName}</div>` : ""}
            ${(contract.initiator as any).agencyAddress ? `<div style="margin: 2px 0;"><strong>Address:</strong> ${(contract.initiator as any).agencyAddress}</div>` : ""}
          </div>

          <div style="flex: 1; border: 1px solid #cbd5e1; border-radius: 6px; padding: 10px; font-size: 9pt;">
            <div style="font-weight: 800; text-transform: uppercase; color: #475569; margin-bottom: 6px; border-bottom: 1px solid #f1f5f9; padding-bottom: 2px;">PARTY B (CLIENT BRAND / RESPONDENT)</div>
            <div style="margin: 2px 0;"><strong>Contact Person:</strong> ${contract.respondentName || "Pending Execution"}</div>
            <div style="margin: 2px 0;"><strong>Email:</strong> ${contract.respondentEmail || "Pending Execution"}</div>
            ${contract.respondentPhone ? `<div style="margin: 2px 0;"><strong>Phone:</strong> ${contract.respondentPhone}</div>` : ""}
            ${contract.respondentCompany ? `<div style="margin: 2px 0;"><strong>Brand / Company:</strong> ${contract.respondentCompany}</div>` : ""}
            ${contract.respondentDesignation ? `<div style="margin: 2px 0;"><strong>Job Title:</strong> ${contract.respondentDesignation}</div>` : ""}
            ${contract.respondentAddress ? `<div style="margin: 2px 0;"><strong>Address:</strong> ${contract.respondentAddress}</div>` : ""}
          </div>
        </div>

        ${(contract.brandName || contract.campaignName || contract.creatorName) ? `
        <div style="border: 1px solid #cbd5e1; border-radius: 6px; padding: 8px 12px; background-color: #ffffff; margin-bottom: 14px; font-size: 9pt;">
          <div style="font-weight: 800; text-transform: uppercase; color: #475569; margin-bottom: 4px;">CAMPAIGN & TALENT ASSIGNMENT</div>
          <div style="display: flex; gap: 30px;">
            ${contract.brandName ? `<div><strong>Client Brand:</strong> ${contract.brandName} ${contract.brandHandle ? `(${contract.brandHandle})` : ""}</div>` : ""}
            ${contract.campaignName ? `<div><strong>Campaign / Product:</strong> ${contract.campaignName}</div>` : ""}
            ${contract.creatorName ? `<div><strong>Target Creator:</strong> ${contract.creatorName} ${contract.creatorHandle ? `(${contract.creatorHandle})` : ""}</div>` : ""}
          </div>
        </div>
        ` : ""}

        <!-- Section 2: Campaign Deliverables Specifications -->
        <div style="font-size: 10pt; font-weight: 800; text-transform: uppercase; color: #0f172a; border-bottom: 1.5px solid #0f172a; padding-bottom: 3px; margin-top: 14px; margin-bottom: 8px;">
          2. CAMPAIGN DELIVERABLES SPECIFICATIONS
        </div>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 14px; font-size: 9pt; border: 1px solid #cbd5e1;">
          <thead>
            <tr style="background-color: #f1f5f9; color: #0f172a; text-transform: uppercase; font-size: 8pt;">
              <th style="padding: 6px 8px; border: 1px solid #cbd5e1; text-align: left;">Platform Format</th>
              <th style="padding: 6px 8px; border: 1px solid #cbd5e1; text-align: center; width: 60px;">Quantity</th>
              <th style="padding: 6px 8px; border: 1px solid #cbd5e1; text-align: center; width: 120px;">Retention / Duration</th>
              <th style="padding: 6px 8px; border: 1px solid #cbd5e1; text-align: left;">Brief &amp; Instructions</th>
            </tr>
          </thead>
          <tbody>
            ${contract.deliverables?.map((d: any) => `
              <tr>
                <td style="padding: 6px 8px; border: 1px solid #cbd5e1; font-weight: bold;">${d.type.replace(/_/g, " ")}</td>
                <td style="padding: 6px 8px; border: 1px solid #cbd5e1; text-align: center; font-weight: bold;">${d.quantity}</td>
                <td style="padding: 6px 8px; border: 1px solid #cbd5e1; text-align: center; color: #475569;">${d.duration || "Permanent"}</td>
                <td style="padding: 6px 8px; border: 1px solid #cbd5e1; color: #334155;">${d.notes || "Standard creative execution as agreed."}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>

        <!-- Section 3: Usage Rights, Platform Scope & Licensing Terms -->
        <div style="font-size: 10pt; font-weight: 800; text-transform: uppercase; color: #0f172a; border-bottom: 1.5px solid #0f172a; padding-bottom: 3px; margin-top: 14px; margin-bottom: 8px;">
          3. USAGE RIGHTS, PLATFORM SCOPE &amp; LICENSING TERMS
        </div>
        <div style="border: 1px solid #cbd5e1; border-radius: 6px; padding: 10px; font-size: 9pt; margin-bottom: 14px; background: #ffffff; line-height: 1.6;">
          <div style="margin-bottom: 4px;"><strong>Permitted Platforms:</strong> ${contract.platformsAllowed?.map((p: string) => `<span style="background: #0f172a; color: #fff; padding: 1px 5px; border-radius: 3px; font-size: 7.5pt; font-weight: 700; uppercase">${p}</span>`).join(" ")}</div>
          <div style="margin-bottom: 4px;"><strong>Granted License Category:</strong> <strong>${formatUsageType(contract.usageType)}</strong></div>
          <div style="margin-bottom: 4px;"><strong>Licensed Duration:</strong> <strong>${contract.usageRightsDuration}</strong></div>
          <div style="font-size: 8.5pt; color: #64748b; margin-top: 6px; border-top: 1px dashed #cbd5e1; padding-top: 4px;">
            <em>WITHHELD RIGHTS NOTICE: Party A and Creator reserve all intellectual property rights not expressly granted above. Any commercial re-use, television broadcast, dark-posting, or off-platform print distribution outside the licensed parameters is strictly prohibited without prior written amendment.</em>
          </div>
        </div>

        <!-- Section 4: Financial Compensation, Escrow & Payment Schedule -->
        <div style="font-size: 10pt; font-weight: 800; text-transform: uppercase; color: #0f172a; border-bottom: 1.5px solid #0f172a; padding-bottom: 3px; margin-top: 14px; margin-bottom: 8px;">
          4. FINANCIAL COMPENSATION &amp; PAYMENT SCHEDULE
        </div>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 14px; font-size: 9pt; border: 1px solid #cbd5e1;">
          <thead>
            <tr style="background-color: #f1f5f9; color: #0f172a; text-transform: uppercase; font-size: 8pt;">
              <th style="padding: 6px 8px; border: 1px solid #cbd5e1; text-align: left;">Total Campaign Valuation</th>
              <th style="padding: 6px 8px; border: 1px solid #cbd5e1; text-align: left;">Advance Escrow Payout</th>
              <th style="padding: 6px 8px; border: 1px solid #cbd5e1; text-align: left;">Remaining Payout</th>
              <th style="padding: 6px 8px; border: 1px solid #cbd5e1; text-align: left;">Payment Method &amp; Route</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="padding: 6px 8px; border: 1px solid #cbd5e1; font-weight: bold; font-size: 10pt;">PKR ${Number(contract.totalAmount).toLocaleString()}</td>
              <td style="padding: 6px 8px; border: 1px solid #cbd5e1;">
                <strong>PKR ${Number(contract.advancePayment || 0).toLocaleString()}</strong>
                ${contract.advancePaymentDate ? `<br><span style="font-size: 8pt; color: #64748b;">Due: ${new Date(contract.advancePaymentDate).toLocaleDateString()}</span>` : ""}
              </td>
              <td style="padding: 6px 8px; border: 1px solid #cbd5e1;">
                <strong>PKR ${getRemainingAmount().toLocaleString()}</strong>
                ${contract.remainingPaymentDate ? `<br><span style="font-size: 8pt; color: #64748b;">Due: ${new Date(contract.remainingPaymentDate).toLocaleDateString()}</span>` : ""}
              </td>
              <td style="padding: 6px 8px; border: 1px solid #cbd5e1;">
                <strong>${contract.paymentMethod ? contract.paymentMethod.replace(/_/g, " ") : "Not Specified"}</strong>
                <br><span style="font-size: 8pt; font-family: monospace; color: #475569;">${contract.paymentMethod === "BANK_IBAN" ? (contract.bankAccountIban || "Pending") : (contract.mobileWalletNumber || "Pending")}</span>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Section 5: Delivery Timeframe, Revisions & Pre-Approval -->
        <div style="font-size: 10pt; font-weight: 800; text-transform: uppercase; color: #0f172a; border-bottom: 1.5px solid #0f172a; padding-bottom: 3px; margin-top: 14px; margin-bottom: 8px;">
          5. DELIVERY TIMEFRAME, REVISIONS &amp; PRE-APPROVAL
        </div>
        <div style="border: 1px solid #cbd5e1; border-radius: 6px; padding: 10px; font-size: 9pt; margin-bottom: 14px; background: #ffffff; display: flex; gap: 20px;">
          <div style="flex: 1;"><strong>Delivery Window:</strong> ${contract.deliveryTimeframeDays} Days post mutual execution</div>
          <div style="flex: 1;"><strong>Revision Rounds Included:</strong> ${contract.revisionRounds} Rounds</div>
          <div style="flex: 1;"><strong>Content Pre-Approval:</strong> <strong>${contract.brandApprovalRequired ? "Required prior to posting" : "Not Required"}</strong></div>
        </div>

        <!-- Section 6: Exclusivity Restrictions & Prohibited Competitors -->
        <div style="font-size: 10pt; font-weight: 800; text-transform: uppercase; color: #0f172a; border-bottom: 1.5px solid #0f172a; padding-bottom: 3px; margin-top: 14px; margin-bottom: 8px;">
          6. EXCLUSIVITY RESTRICTIONS &amp; PROHIBITED COMPETITORS
        </div>
        <div style="border: 1px solid #cbd5e1; border-radius: 6px; padding: 10px; font-size: 9pt; margin-bottom: 14px; background: #ffffff;">
          <div style="margin-bottom: 4px;"><strong>Exclusivity Clause Status:</strong> <strong>${contract.exclusivityClause ? `Active (${contract.exclusivityDuration || "Yes"})` : "Not Required"}</strong></div>
          ${contract.exclusivityClause && contract.exclusivityCompetitors ? `
            <div style="margin-top: 4px; font-size: 8.5pt; color: #dc2626;"><strong>Prohibited Competitors / Categories:</strong> ${contract.exclusivityCompetitors}</div>
          ` : ""}
        </div>

        <!-- Section 7: Confidentiality & Pre-Launch Product Embargo (NDA) -->
        <div style="font-size: 10pt; font-weight: 800; text-transform: uppercase; color: #0f172a; border-bottom: 1.5px solid #0f172a; padding-bottom: 3px; margin-top: 14px; margin-bottom: 8px;">
          7. CONFIDENTIALITY &amp; PRE-LAUNCH PRODUCT EMBARGO (NDA)
        </div>
        <div style="border: 1px solid ${contract.confidentialityRequired ? "#fde68a" : "#cbd5e1"}; border-radius: 6px; padding: 10px; font-size: 9pt; margin-bottom: 14px; background: ${contract.confidentialityRequired ? "#fffbeb" : "#ffffff"};">
          <div><strong>Confidentiality Status:</strong> <strong>${contract.confidentialityRequired ? "STRICT PRE-LAUNCH NDA ACTIVE" : "Standard Commercial Confidentiality"}</strong></div>
          ${contract.confidentialityRequired ? `
            <div style="margin-top: 4px; font-size: 8.5pt; color: #92400e;">
              <strong>Embargo Launch Date:</strong> ${contract.embargoDate ? new Date(contract.embargoDate).toLocaleDateString() : "Required until official product launch"}<br>
              ${contract.earlyDisclosurePenalty ? `<strong>Early Disclosure Leak Penalty:</strong> PKR ${Number(contract.earlyDisclosurePenalty).toLocaleString()} payable upon unauthorized leak or premature posting.` : ""}
            </div>
          ` : ""}
        </div>

        ${contract.collabProduct ? `
        <!-- Section 8: Collaboration Product Shipment -->
        <div style="font-size: 10pt; font-weight: 800; text-transform: uppercase; color: #0f172a; border-bottom: 1.5px solid #0f172a; padding-bottom: 3px; margin-top: 14px; margin-bottom: 8px;">
          8. COLLABORATION PRODUCT SHIPMENT &amp; PROVISIONING
        </div>
        <div style="border: 1px solid #cbd5e1; border-radius: 6px; padding: 10px; font-size: 9pt; margin-bottom: 14px; background: #ffffff;">
          <div style="display: flex; gap: 20px;">
            <div><strong>Product Details:</strong> ${contract.collabProduct} (${contract.collabProductProvisionType || "Provision"})</div>
            ${contract.collabDeliveryDate ? `<div><strong>Expected Arrival:</strong> ${new Date(contract.collabDeliveryDate).toLocaleDateString()}</div>` : ""}
          </div>
          ${contract.collabDeliveryAddress ? `<div style="margin-top: 4px; font-size: 8.5pt; color: #475569;"><strong>Shipment Address:</strong> ${contract.collabDeliveryAddress}</div>` : ""}
        </div>
        ` : ""}

        <!-- Section 9: Tagging Requirements & Content Copyright Ownership -->
        <div style="font-size: 10pt; font-weight: 800; text-transform: uppercase; color: #0f172a; border-bottom: 1.5px solid #0f172a; padding-bottom: 3px; margin-top: 14px; margin-bottom: 8px;">
          9. TAGGING REQUIREMENTS &amp; COPYRIGHT OWNERSHIP
        </div>
        <div style="border: 1px solid #cbd5e1; border-radius: 6px; padding: 10px; font-size: 9pt; margin-bottom: 14px; background: #ffffff; line-height: 1.5;">
          ${contract.taggingRequirements ? `<div style="margin-bottom: 4px;"><strong>Tagging &amp; Caption Guidelines:</strong> ${contract.taggingRequirements}</div>` : ""}
          <div><strong>Content Copyright Clause:</strong> ${contract.contentOwnership}</div>
        </div>

        <!-- Section 10: Bilateral Safeguard Penalties & Termination -->
        <div style="font-size: 10pt; font-weight: 800; text-transform: uppercase; color: #0f172a; border-bottom: 1.5px solid #0f172a; padding-bottom: 3px; margin-top: 14px; margin-bottom: 8px;">
          10. BILATERAL SAFEGUARD PENALTIES &amp; TERMINATION
        </div>
        <div style="border: 1px solid #cbd5e1; border-radius: 6px; padding: 10px; font-size: 8.5pt; margin-bottom: 14px; background: #f8fafc; line-height: 1.6;">
          <div>• <strong>Late Payment Penalty (Charged to Brand):</strong> ${Number(contract.latePaymentPenaltyPct)}% per calendar day of delay.</div>
          <div>• <strong>Late Content Delivery Penalty (Charged to Agency/Creator):</strong> ${Number(contract.lateContentPenaltyPct)}% per calendar day of delay.</div>
          <div>• <strong>Unauthorized Brand Re-Use Penalty:</strong> ${Number(contract.unauthorizedUsagePenaltyPct || 50)}% of total contract value per violation outside licensed platforms, duration, or category.</div>
          <div>• <strong>Non-Delivery Advance Refund:</strong> ${contract.advanceRefundable !== false ? `Advance payment is 100% refundable within ${contract.advanceRefundTimeframeDays || 7} business days of non-delivery notice.` : "Non-refundable advance."}</div>
          <div>• <strong>Pre-Delivery Termination Fee:</strong> ${Number(contract.cancellationFeePct || 25)}% of total campaign fee owed if terminated post-execution prior to deliverable hand-off.</div>
        </div>

        <!-- Section 11: ETO 2002 Bilateral Signature Audit Log & SHA-256 Verification -->
        <div style="font-size: 10pt; font-weight: 800; text-transform: uppercase; color: #0f172a; border-bottom: 1.5px solid #0f172a; padding-bottom: 3px; margin-top: 18px; margin-bottom: 8px; page-break-before: auto;">
          11. ETO 2002 BILATERAL SIGNATURE AUDIT LOG &amp; CRYPTOGRAPHIC VERIFICATION
        </div>
        <div style="display: flex; gap: 16px; margin-top: 10px; page-break-inside: avoid;">
          <div style="flex: 1; border: 1px solid #cbd5e1; border-radius: 6px; padding: 10px; text-align: center; background: #ffffff;">
            <div style="font-size: 8pt; font-weight: 800; uppercase; color: #475569;">PARTY A (INITIATOR SIGNATURE)</div>
            ${initiatorSign ? `
              <div style="height: 55px; display: flex; align-items: center; justify-content: center; margin: 6px 0;">
                <img src="${initiatorSign.signatureImageUrl}" alt="Party A Sig" style="max-height: 50px; max-width: 160px; object-fit: contain;" />
              </div>
              <div style="font-size: 7.5pt; color: #475569;">
                <div>Signer: ${contract.initiator.name} (${contract.initiator.email})</div>
                <div>IP: ${initiatorSign.ipAddress} | Device: ${initiatorSign.deviceFingerprint ? initiatorSign.deviceFingerprint.slice(0, 12) + "..." : "N/A"}</div>
                <div>Signed UTC: ${new Date(initiatorSign.signedAt).toUTCString()}</div>
              </div>
            ` : `
              <div style="height: 55px; display: flex; items-center; justify-content: center; color: #94a3b8; font-style: italic; font-size: 8.5pt;">Pending Signature</div>
            `}
          </div>

          <div style="flex: 1; border: 1px solid #cbd5e1; border-radius: 6px; padding: 10px; text-align: center; background: #ffffff;">
            <div style="font-size: 8pt; font-weight: 800; uppercase; color: #475569;">PARTY B (RESPONDENT SIGNATURE)</div>
            ${respondentSign ? `
              <div style="height: 55px; display: flex; align-items: center; justify-content: center; margin: 6px 0;">
                <img src="${respondentSign.signatureImageUrl}" alt="Party B Sig" style="max-height: 50px; max-width: 160px; object-fit: contain;" />
              </div>
              <div style="font-size: 7.5pt; color: #475569;">
                <div>Signer: ${contract.respondentName} (${contract.respondentEmail})</div>
                <div>Verified Email OTP: ✓ Verified | IP: ${respondentSign.ipAddress}</div>
                <div>Signed UTC: ${new Date(respondentSign.signedAt).toUTCString()}</div>
              </div>
            ` : `
              <div style="height: 55px; display: flex; items-center; justify-content: center; color: #94a3b8; font-style: italic; font-size: 8.5pt;">Pending Signature</div>
            `}
          </div>
        </div>

        <!-- SHA-256 Footer Checksum Bar -->
        <div style="border-top: 1.5px solid #0f172a; margin-top: 20px; padding-top: 8px; text-align: center; font-size: 7.5pt; color: #475569; page-break-inside: avoid;">
          <div>This agreement is a tamper-evident legal record stored in SignCollab Vault under Pakistan ETO 2002 Ordinance standards.</div>
          <div style="font-family: monospace; font-weight: bold; margin-top: 2px;">DOCUMENT SHA-256 HASH: <span style="color: #2563eb;">${contract.documentHash || "COMPUTING INTEGRITY HASH..."}</span></div>
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

  // 4. Compute SHA-256 integrity hash over PDF binary buffer
  const hash = crypto.createHash("sha256").update(pdfBuffer).digest("hex");

  // 5. Upload document to Supabase storage
  const filePath = `agreements/${contractId}.pdf`;
  const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
    .from("profiles")
    .upload(filePath, pdfBuffer, {
      contentType: "application/pdf",
      upsert: true,
    });

  if (uploadError) throw new Error(uploadError.message);

  // 6. Write PDF metadata & SHA-256 hash into Contract table in PostgreSQL
  await prisma.contract.update({
    where: { id: contractId },
    data: {
      documentHash: hash,
      pdfUrl: uploadData.path,
    },
  });

  return { path: uploadData.path, buffer: Buffer.from(pdfBuffer) };
}
