import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";
import crypto from "crypto";
import { supabase } from "@/lib/supabase/client";
import { prisma } from "@/lib/prisma";

export async function generateContractPDF(contractId: string): Promise<{ path: string; buffer: Buffer }> {
  // 1. Fetch full contract specifications
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
  
  const initiatorSign = getSignatureByRole(
    contract.initiator.role
  );

  // Instead of importing react-dom/server which triggers build errors in API routes,
  // we compile the HTML layout string directly in server context.
  const fullHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Campaign Agreement</title>
        <style>
          body { margin: 0; padding: 0; font-family: Arial, sans-serif; color: #111; font-size: 14px; line-height: 1.5; }
          @media print {
            body { -webkit-print-color-adjust: exact; }
          }
        </style>
      </head>
      <body style="padding: 40px;">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #333; padding-bottom: 20px; marginBottom: 20px;">
          <div>
            <h1 style="font-size: 24px; margin: 0; font-weight: bold;">${process.env.NEXT_PUBLIC_COMPANY_NAME || "BrandBridge"}</h1>
            <p style="margin: 2px 0 0 0; font-size: 11px; color: #666;">${process.env.NEXT_PUBLIC_LEGAL_COMPANY_INFO || "BrandBridge Pakistan"}</p>
          </div>
          <div style="text-align: right;">
            <h4 style="margin: 0; font-size: 14px; font-weight: bold;">MUTUAL COLLABORATION AGREEMENT</h4>
            <p style="margin: 2px 0 0 0; font-size: 12px; color: #333; font-weight: bold;">No: ${contract.contractNumber}</p>
          </div>
        </div>

        <div style="display: flex; gap: 20px; margin-top: 20px; margin-bottom: 20px;">
          <div style="flex: 1; padding: 12px; border: 1px solid #ddd; border-radius: 8px;">
            <h3 style="margin: 0 0 8px 0; font-size: 12px; font-weight: bold; text-transform: uppercase; color: #666;">Party A (Initiator)</h3>
            <p style="margin: 2px 0;"><strong>Name:</strong> ${contract.initiator.name}</p>
            <p style="margin: 2px 0;"><strong>Email:</strong> ${contract.initiator.email}</p>
            ${contract.initiator.phone ? `<p style="margin: 2px 0;"><strong>Phone:</strong> ${contract.initiator.phone}</p>` : ""}
            ${contract.initiator.instagramHandle ? `<p style="margin: 2px 0;"><strong>Instagram:</strong> ${contract.initiator.instagramHandle}</p>` : ""}
          </div>

          <div style="flex: 1; padding: 12px; border: 1px solid #ddd; border-radius: 8px;">
            <h3 style="margin: 0 0 8px 0; font-size: 12px; font-weight: bold; text-transform: uppercase; color: #666;">Party B (Respondent)</h3>
            <p style="margin: 2px 0;"><strong>Name:</strong> ${contract.respondentName}</p>
            <p style="margin: 2px 0;"><strong>Email:</strong> ${contract.respondentEmail}</p>
            ${contract.respondentPhone ? `<p style="margin: 2px 0;"><strong>Phone:</strong> ${contract.respondentPhone}</p>` : ""}
            ${contract.respondentCompany ? `<p style="margin: 2px 0;"><strong>Company/IG:</strong> ${contract.respondentCompany}</p>` : ""}
          </div>
        </div>

        <div style="margin-bottom: 20px;">
          <h3 style="font-size: 14px; font-weight: bold; border-bottom: 1px solid #eee; padding-bottom: 6px; margin-bottom: 10px;">Campaign Deliverables</h3>
          <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
            <thead>
              <tr style="background: #f9f9f9; border-bottom: 1px solid #ddd;">
                <th style="text-align: left; padding: 8px;">Deliverable Type</th>
                <th style="text-align: center; padding: 8px;">Quantity</th>
                <th style="text-align: left; padding: 8px;">Retention / Duration</th>
                <th style="text-align: left; padding: 8px;">Requirement Brief</th>
              </tr>
            </thead>
            <tbody>
              ${contract.deliverables?.map((d: any) => `
                <tr style="border-bottom: 1px solid #eee;">
                  <td style="padding: 8px;">${d.type.replace(/_/g, " ")}</td>
                  <td style="padding: 8px; text-align: center;">${d.quantity}</td>
                  <td style="padding: 8px;">${d.duration || "N/A"}</td>
                  <td style="padding: 8px;">${d.notes || "None"}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>

        <div style="margin-bottom: 20px;">
          <h3 style="font-size: 14px; font-weight: bold; border-bottom: 1px solid #eee; padding-bottom: 6px; margin-bottom: 10px;">Usage Rights & Platform Scope</h3>
          <p style="margin: 4px 0;"><strong>Platforms Allowed:</strong> ${contract.platformsAllowed.join(", ")}</p>
          <p style="margin: 4px 0;"><strong>Usage Scope:</strong> ${contract.usageType.replace(/_/g, " ")}</p>
          <p style="margin: 4px 0;"><strong>Usage Duration:</strong> ${contract.usageRightsDuration.replace(/_/g, " ")}</p>
        </div>

        <div style="margin-bottom: 20px;">
          <h3 style="font-size: 14px; font-weight: bold; border-bottom: 1px solid #eee; padding-bottom: 6px; margin-bottom: 10px;">Financial Compensation</h3>
          <p style="margin: 4px 0;"><strong>Total Campaign Value:</strong> PKR ${Number(contract.totalAmount).toLocaleString()}</p>
          <p style="margin: 4px 0;"><strong>Advance Payout:</strong> PKR ${Number(contract.advancePayment || 0).toLocaleString()}</p>
          <p style="margin: 4px 0;"><strong>Remaining Payout:</strong> PKR ${getRemainingAmount().toLocaleString()}</p>
          <p style="margin: 4px 0;"><strong>Payment Method:</strong> ${contract.paymentMethod ? contract.paymentMethod.replace(/_/g, " ") : "Not Specified"}</p>
          ${contract.bankAccountIban ? `<p style="margin: 4px 0;"><strong>Bank Account IBAN:</strong> ${contract.bankAccountIban}</p>` : ""}
          ${contract.mobileWalletNumber ? `<p style="margin: 4px 0;"><strong>Mobile Wallet Account:</strong> ${contract.mobileWalletNumber}</p>` : ""}
        </div>

        <div style="margin-bottom: 20px;">
          <h3 style="font-size: 14px; font-weight: bold; border-bottom: 1px solid #eee; padding-bottom: 6px; margin-bottom: 10px;">Delivery Terms & Penalties</h3>
          <p style="margin: 4px 0;"><strong>Delivery Deadline:</strong> ${contract.deliveryTimeframeDays} Days after mutual execution</p>
          <p style="margin: 4px 0;"><strong>Revision Rounds Included:</strong> ${contract.revisionRounds} rounds</p>
          <p style="margin: 4px 0;"><strong>Late Payment Penalty (Charged to Brand):</strong> ${contract.latePaymentPenaltyPct}% per day delay</p>
          <p style="margin: 4px 0;"><strong>Late Delivery Penalty (Charged to Creator):</strong> ${contract.lateContentPenaltyPct}% per day delay</p>
          <p style="margin: 4px 0;"><strong>Content Exclusivity:</strong> ${contract.exclusivityClause ? `Required (${contract.exclusivityDuration})` : "Not Required"}</p>
          <p style="margin: 4px 0;"><strong>Copyright Terms:</strong> ${contract.contentOwnership}</p>
        </div>

        <div style="display: flex; gap: 20px; margin-top: 40px; border-top: 1px solid #eee; padding-top: 20px;">
          <div style="flex: 1; text-align: center;">
            <p style="margin: 0; font-size: 11px; color: #666;">PARTY A (Initiator Signature)</p>
            ${initiatorSign ? `
              <div style="margin: 10px 0;">
                <img src="${initiatorSign.signatureImageUrl}" alt="Party A Sig" style="max-width: 150px; max-height: 60px;" />
                <p style="margin: 4px 0 0 0; font-size: 10px; color: #333;">IP: ${initiatorSign.ipAddress}</p>
                <p style="margin: 2px 0 0 0; font-size: 9px; color: #666;">Signed: ${new Date(initiatorSign.signedAt).toUTCString()}</p>
              </div>
            ` : `
              <p style="margin: 15px 0; font-style: italic; color: #888;">Pending Signature</p>
            `}
          </div>

          <div style="flex: 1; text-align: center;">
            <p style="margin: 0; font-size: 11px; color: #666;">PARTY B (Respondent Signature)</p>
            ${respondentSign ? `
              <div style="margin: 10px 0;">
                <img src="${respondentSign.signatureImageUrl}" alt="Party B Sig" style="max-width: 150px; max-height: 60px;" />
                <p style="margin: 4px 0 0 0; font-size: 10px; color: #333;">IP: ${respondentSign.ipAddress}</p>
                <p style="margin: 2px 0 0 0; font-size: 9px; color: #666;">Signed: ${new Date(respondentSign.signedAt).toUTCString()}</p>
              </div>
            ` : `
              <p style="margin: 15px 0; font-style: italic; color: #888;">Pending Signature</p>
            `}
          </div>
        </div>

        <div style="border-top: 2px solid #333; margin-top: 40px; padding-top: 15px; text-align: center; font-size: 9px; color: #666;">
          <p style="margin: 0 0 4px 0;">This document is a legally binding electronic record generated by ${process.env.NEXT_PUBLIC_COMPANY_NAME || "BrandBridge"} and executed under the guidelines of Pakistan's Electronic Transactions Ordinance (ETO 2002).</p>
          <p style="margin: 0;">Document SHA-256 integrity hash: <strong>${contract.documentHash || "Awaiting Verification"}</strong></p>
        </div>
      </body>
    </html>
  `;

  // 3. Generate PDF Buffer via Puppeteer
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
    margin: { top: "20mm", bottom: "20mm", left: "20mm", right: "20mm" },
  });
  await browser.close();

  // 4. Compute SHA-256 integrity hash representing generated document content
  const hash = crypto.createHash("sha256").update(pdfBuffer).digest("hex");

  // 5. Upload document to Supabase storage
  const filePath = `agreements/${contractId}.pdf`;
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from("profiles")
    .upload(filePath, pdfBuffer, {
      contentType: "application/pdf",
      upsert: true,
    });

  if (uploadError) throw new Error(uploadError.message);

  // 6. Write PDF metadata inside contract row in DB
  await prisma.contract.update({
    where: { id: contractId },
    data: {
      documentHash: hash,
      pdfUrl: uploadData.path,
    },
  });

  return { path: uploadData.path, buffer: Buffer.from(pdfBuffer) };
}
