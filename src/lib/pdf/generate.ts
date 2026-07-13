import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";
import crypto from "crypto";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { prisma } from "@/lib/prisma";
import { formatLegalDate, parseUserAgentString, formatUsageLicenseText, formatDeliverableTypeName, computeContentHash } from "@/lib/utils";

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

  const finalDocHash = (contract as any).finalDocumentHash || contract.documentHash || computeContentHash(contract);

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
        <div style="display: flex; justify-content: space-between; border-bottom: 2px solid #0f172a; padding-bottom: 10px; margin-bottom: 14px;">
          <div>
            <h1 style="font-size: 18pt; font-weight: 900; margin: 0; color: #000;">${process.env.NEXT_PUBLIC_COMPANY_NAME || "SignCollab"}</h1>
            <p style="margin: 2px 0 0 0; font-size: 8.5pt; color: #475569;">${process.env.NEXT_PUBLIC_LEGAL_COMPANY_INFO || "SignCollab Digital Agreement Platform"}</p>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 9pt; font-weight: 800; color: #000; text-transform: uppercase;">${getContractTitle()}</div>
            <div style="font-size: 9pt; font-weight: 700; color: #2563eb; margin-top: 2px;">Ref No: ${contract.contractNumber}</div>
        <div style="border-bottom: 2px solid #0f172a; padding-bottom: 10px; margin-bottom: 16px;">
          <div style="font-size: 14pt; font-weight: 900; color: #0f172a; text-transform: uppercase;">SIGNCOLLAB LEGAL VAULT</div>
          <div style="font-size: 11pt; font-weight: 700; color: #334155; margin-top: 2px;">${getContractTitle()}</div>
          <div style="font-size: 8.5pt; color: #64748b; margin-top: 4px;">Ref No: <strong>${contract.contractNumber}</strong> | Created: ${formatLegalDate(contract.createdAt)} | ETO 2002 Ordinance Verified</div>
        </div>

        <!-- Section 1: Parties -->
        <div style="font-size: 10pt; font-weight: 800; text-transform: uppercase; color: #0f172a; border-bottom: 1.5px solid #0f172a; padding-bottom: 3px; margin-bottom: 8px;">
          1. CONTRACTING PARTIES &amp; LEGAL IDENTIFICATION
        </div>
        <div style="display: flex; gap: 12px; margin-bottom: 14px; font-size: 8.5pt;">
          <div style="flex: 1; border: 1px solid #cbd5e1; border-radius: 6px; padding: 8px; background: #f8fafc;">
            <div style="font-weight: 800; color: #0f172a; text-transform: uppercase; margin-bottom: 4px;">PARTY A (INITIATOR)</div>
            <div><strong>Name:</strong> ${contract.initiator.name}</div>
            <div><strong>Email:</strong> ${contract.initiator.email}</div>
            ${(contract.initiator as any).agencyName ? `<div><strong>Agency:</strong> ${(contract.initiator as any).agencyName}</div>` : ""}
            ${contract.initiatorDesignation ? `<div><strong>Designation:</strong> ${contract.initiatorDesignation}</div>` : ""}
            ${contract.initiatorNtn ? `<div><strong>NTN / Reg:</strong> ${contract.initiatorNtn}</div>` : ""}
          </div>

          <div style="flex: 1; border: 1px solid #cbd5e1; border-radius: 6px; padding: 8px; background: #f8fafc;">
            <div style="font-weight: 800; color: #0f172a; text-transform: uppercase; margin-bottom: 4px;">PARTY B (COUNTERPARTY)</div>
            <div><strong>Name:</strong> ${contract.respondentName || "Pending Execution"}</div>
            <div><strong>Email:</strong> ${contract.respondentEmail || "Pending Execution"}</div>
            ${contract.respondentCompany ? `<div><strong>Company:</strong> ${contract.respondentCompany}</div>` : ""}
            ${contract.respondentDesignation ? `<div><strong>Designation:</strong> ${contract.respondentDesignation}</div>` : ""}
            ${contract.respondentNtn ? `<div><strong>NTN / Reg:</strong> ${contract.respondentNtn}</div>` : ""}
          </div>
        </div>

        ${(contract.brandName || contract.creatorName) ? `
          <div style="border: 1px solid #cbd5e1; border-radius: 6px; padding: 8px; margin-bottom: 14px; background: #ffffff; font-size: 8.5pt;">
            <div style="font-weight: 800; color: #0f172a; text-transform: uppercase; margin-bottom: 4px;">CAMPAIGN &amp; CREATOR CONTEXT</div>
            <div style="display: flex; gap: 16px;">
              ${contract.brandName ? `<div><strong>Client Brand:</strong> ${contract.brandName} (${contract.brandHandle || "N/A"})</div>` : ""}
              ${contract.creatorName ? `<div><strong>Creator:</strong> ${contract.creatorName} (${contract.creatorHandle || "N/A"})</div>` : ""}
              ${contract.campaignName ? `<div><strong>Campaign:</strong> ${contract.campaignName}</div>` : ""}
            </div>
          </div>
        ` : ""}

        <!-- Section 2: Campaign Deliverables -->
        <div style="font-size: 10pt; font-weight: 800; text-transform: uppercase; color: #0f172a; border-bottom: 1.5px solid #0f172a; padding-bottom: 3px; margin-bottom: 8px;">
          2. CAMPAIGN DELIVERABLES SPECIFICATIONS &amp; RETENTION ENFORCEMENT
        </div>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 8px; font-size: 8.5pt; border: 1px solid #cbd5e1;">
          <thead>
            <tr style="background-color: #f1f5f9; color: #0f172a; text-transform: uppercase; font-size: 8pt;">
              <th style="padding: 6px 8px; border: 1px solid #cbd5e1; text-align: left;">Platform Format</th>
              <th style="padding: 6px 8px; border: 1px solid #cbd5e1; text-align: center; width: 60px;">Quantity</th>
              <th style="padding: 6px 8px; border: 1px solid #cbd5e1; text-align: center; width: 120px;">Retention Duration</th>
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

        <!-- Section 5: Draft Delivery Turnaround, Product Loan & Revision Protocol -->
        <div style="font-size: 10pt; font-weight: 800; text-transform: uppercase; color: #0f172a; border-bottom: 1.5px solid #0f172a; padding-bottom: 3px; margin-top: 14px; margin-bottom: 8px;">
          5. DELIVERY PROTOCOL, PRODUCT SHIPMENT &amp; REVISIONS
        </div>
        <div style="border: 1px solid #cbd5e1; border-radius: 6px; padding: 10px; font-size: 8.5pt; margin-bottom: 14px; background: #ffffff; line-height: 1.6;">
          <div style="display: flex; gap: 12px; margin-bottom: 6px;">
            <div style="flex: 1;"><strong>Initial Draft Window:</strong> ${contract.deliveryTimeframeDays} Calendar Days</div>
            <div style="flex: 1;"><strong>Revision Rounds:</strong> ${contract.revisionRounds} Included</div>
            <div style="flex: 1;"><strong>Revision Turnaround:</strong> ${contract.revisionTurnaroundDays || 5} Days / Round</div>
          </div>
          <div><strong>Pre-Approval Protocol:</strong> ${contract.brandApprovalRequired ? "Strict Pre-Approval Required (48-hour deemed approval applies if feedback is withheld)" : "Direct Content Publishing Permitted"}</div>
          
          ${contract.collabProduct ? `
            <div style="margin-top: 8px; padding-top: 6px; border-top: 1px dashed #cbd5e1; background: #fffbebf0; padding: 6px; border-radius: 4px;">
              <strong>COLLABORATION PRODUCT &amp; SHIPMENT TERMS:</strong>
              <div>• Product Item: <strong>${contract.collabProduct}</strong> (${contract.collabProductProvisionType || "Provision"})</div>
              <div>• Delivery Start Trigger: Timeframe (${contract.deliveryTimeframeDays} days) starts post receipt of product shipment or advance payment.</div>
              ${contract.collabProductProvisionType === "Product Loan" ? `
                <div>• Product Loan Return: Required within <strong>${contract.collabProductReturnDays || 7} days</strong> post-deliverable. Return Shipping Paid By: <strong>${contract.collabProductReturnShippingBy || "Brand"}</strong>.</div>
                ${contract.collabProductNonReturnFee ? `<div>• Non-Return Penalty Fee: <strong>PKR ${Number(contract.collabProductNonReturnFee).toLocaleString()}</strong></div>` : ""}
              ` : ""}
            </div>
          ` : ""}
        </div>

        <!-- Section 6: Exclusivity & NDA Terms -->
        <div style="font-size: 10pt; font-weight: 800; text-transform: uppercase; color: #0f172a; border-bottom: 1.5px solid #0f172a; padding-bottom: 3px; margin-top: 14px; margin-bottom: 8px;">
          6. EXCLUSIVITY &amp; CONFIDENTIALITY EMBARGO
        </div>
        <div style="border: 1px solid #cbd5e1; border-radius: 6px; padding: 10px; font-size: 8.5pt; margin-bottom: 14px; background: #ffffff; line-height: 1.6;">
          <div><strong>Category Exclusivity:</strong> ${contract.exclusivityClause ? `Active (${contract.exclusivityDuration || "Agreed Duration"})` : "Non-Exclusive"}</div>
          ${contract.exclusivityClause && contract.exclusivityCompetitors ? `<div><strong>Restricted Competitors:</strong> ${contract.exclusivityCompetitors}</div>` : ""}
          <div style="margin-top: 4px;"><strong>Pre-Launch NDA Status:</strong> ${contract.confidentialityRequired ? `Strict Pre-Launch NDA Active (Embargo Date: ${contract.embargoDate ? formatLegalDate(contract.embargoDate) : "Official Release Date"})` : "Standard Commercial Confidentiality"}</div>
          ${contract.confidentialityRequired && contract.earlyDisclosurePenalty ? `<div><strong>Early Leak Liquidated Damages:</strong> PKR ${Number(contract.earlyDisclosurePenalty).toLocaleString()}</div>` : ""}
        </div>

        <!-- Section 7: Bilateral Safeguards & Liquidated Damages -->
        <div style="font-size: 10pt; font-weight: 800; text-transform: uppercase; color: #0f172a; border-bottom: 1.5px solid #0f172a; padding-bottom: 3px; margin-top: 14px; margin-bottom: 8px;">
          7. BILATERAL SAFEGUARDS &amp; LATE PENALTY CAPS
        </div>
        <div style="border: 1px solid #cbd5e1; border-radius: 6px; padding: 10px; font-size: 8.5pt; margin-bottom: 14px; background: #f8fafc; line-height: 1.6;">
          <div>• <strong>Late Payment Penalty:</strong> ${Number(contract.latePaymentPenaltyPct || 3)}% per calendar day of delay.</div>
          <div>• <strong>Late Content Delivery Penalty:</strong> ${Number(contract.lateContentPenaltyPct || 3)}% per calendar day of delay.</div>
          <div>• <strong>Liquidated Damages Cap:</strong> Total accrued delay penalties are strictly capped at <strong>${Number(contract.penaltyCapPct || 20)}%</strong> of Total Campaign Valuation.</div>
          <div>• <strong>Non-Delivery Cutoff &amp; Default:</strong> Delay exceeding 14 calendar days post-deadline constitutes a material breach, granting the non-breaching party immediate right of cancellation and full refund recovery.</div>
        </div>

        <!-- Section 8: Dispute Resolution (ADR & Arbitration Act 1940) -->
        <div style="font-size: 10pt; font-weight: 800; text-transform: uppercase; color: #0f172a; border-bottom: 1.5px solid #0f172a; padding-bottom: 3px; margin-top: 14px; margin-bottom: 8px;">
          8. GOVERNING LAW &amp; DISPUTE RESOLUTION (ADR)
        </div>
        <div style="border: 1px solid #cbd5e1; border-radius: 6px; padding: 10px; font-size: 8.5pt; margin-bottom: 14px; background: #ffffff; line-height: 1.6;">
          This Agreement is governed by the laws of the Islamic Republic of Pakistan. Any dispute arising out of or in connection with this Agreement shall first proceed to 14 days of mandatory good-faith negotiation between authorized executive representatives. If unresolved:
          <br>
          (a) Claims equal to or under <strong>PKR 500,000</strong> shall proceed to summary determination in local civil courts of competent jurisdiction;
          <br>
          (b) Claims exceeding <strong>PKR 500,000</strong> shall proceed to final and binding arbitration by a sole arbitrator under the <strong>Arbitration Act 1940 of Pakistan</strong>. The prevailing party shall be entitled to recover full legal costs and attorney fees.
        </div>

        <!-- Section 9: ETO 2002 Bilateral Signature Audit Log -->
        <div style="font-size: 10pt; font-weight: 800; text-transform: uppercase; color: #0f172a; border-bottom: 1.5px solid #0f172a; padding-bottom: 3px; margin-top: 14px; margin-bottom: 8px;">
          9. ETO 2002 BILATERAL SIGNATURE AUDIT LOG &amp; CRYPTOGRAPHIC VERIFICATION
        </div>
        <div style="display: flex; gap: 12px; margin-bottom: 14px;">
          <div style="flex: 1; border: 1px solid #cbd5e1; border-radius: 6px; padding: 10px; text-align: center; background: #ffffff;">
            <div style="font-size: 8pt; font-weight: 800; uppercase; color: #475569;">PARTY A (INITIATOR SIGNATURE)</div>
            ${initiatorSign ? `
              <div style="height: 55px; display: flex; align-items: center; justify-content: center; margin: 6px 0;">
                <img src="${initiatorSign.signatureImageUrl}" alt="Party A Sig" style="max-height: 50px; max-width: 160px; object-fit: contain;" />
              </div>
              <div style="font-size: 7.5pt; color: #475569;">
                <div>Signer: ${contract.initiator.name} (${contract.initiator.email})</div>
                <div>IP: ${initiatorSign.ipAddress} | Signed: ${formatLegalDate(initiatorSign.signedAt)}</div>
              </div>
            ` : `
              <div style="height: 55px; display: flex; align-items: center; justify-content: center; color: #94a3b8; font-style: italic; font-size: 8.5pt;">Pending Signature</div>
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
                <div>IP: ${respondentSign.ipAddress} | Signed: ${formatLegalDate(respondentSign.signedAt)}</div>
              </div>
            ` : `
              <div style="height: 55px; display: flex; align-items: center; justify-content: center; color: #94a3b8; font-style: italic; font-size: 8.5pt;">Pending Signature</div>
            `}
          </div>
        </div>

        <!-- SHA-256 Footer Checksum Bar -->
        <div style="border-top: 1.5px solid #0f172a; margin-top: 20px; padding-top: 8px; text-align: center; font-size: 7.5pt; color: #475569; page-break-inside: avoid;">
          <div>This agreement is a tamper-evident legal record stored in SignCollab Vault under Pakistan ETO 2002 Ordinance standards.</div>
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
