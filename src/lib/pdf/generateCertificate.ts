import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";
import QRCode from "qrcode";
import { prisma } from "@/lib/prisma";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function generateAuditCertificatePDF(contractId: string) {
  const contract = await prisma.contract.findUnique({
    where: { id: contractId },
    include: {
      initiator: true,
      respondent: true,
      signatures: true,
      auditLogs: {
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!contract) {
    throw new Error("Contract not found.");
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://signcollab.com";
  const verifyUrl = `${appUrl}/verify?token=${contract.verifyToken}`;
  const qrCodeDataUrl = await QRCode.toDataURL(verifyUrl, { margin: 1, width: 120 });

  const initiatorSignature = contract.signatures.find(
    (s) => s.signerRole === "CREATOR" || s.signerRole === "AGENCY" || s.signerId === contract.initiatorId
  );
  const respondentSignature = contract.signatures.find(
    (s) => s.signerRole === "BRAND" || (contract.respondentId && s.signerId === contract.respondentId)
  );

  const getContractTitle = (type: string) => {
    switch (type) {
      case "AGENCY_TO_BRAND": return "AGENCY TO BRAND INFLUENCER MARKETING & CONTENT LICENSING AGREEMENT";
      case "AGENCY_TO_CREATOR": return "AGENCY TO CREATOR CONTENT PRODUCTION & SERVICE AGREEMENT";
      case "BRAND_TO_CREATOR": return "BRAND TO CREATOR DIRECT SPONSORSHIP AGREEMENT";
      case "CREATOR_TO_BRAND": return "CREATOR TO BRAND DIRECT CONTENT ENGAGEMENT AGREEMENT";
      default: return "MUTUAL COLLABORATION & CONTENT LICENSING AGREEMENT";
    }
  };

  const certificateHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>Audit Certificate - ${contract.contractNumber}</title>
        <style>
          @page { size: A4; margin: 12mm; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            color: #0f172a;
            margin: 0;
            padding: 0;
            font-size: 9pt;
            line-height: 1.4;
            background: #ffffff;
          }
          .cert-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            border-bottom: 2.5px solid #0f172a;
            padding-bottom: 12px;
            margin-bottom: 16px;
          }
          .title-badge {
            display: inline-block;
            background: #0f172a;
            color: #ffffff;
            font-weight: 900;
            font-size: 8pt;
            letter-spacing: 1px;
            padding: 3px 8px;
            border-radius: 4px;
            text-transform: uppercase;
            margin-bottom: 4px;
          }
          .section-title {
            font-size: 9.5pt;
            font-weight: 800;
            text-transform: uppercase;
            color: #0f172a;
            border-bottom: 1.5px solid #cbd5e1;
            padding-bottom: 4px;
            margin-top: 14px;
            margin-bottom: 8px;
          }
          .data-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 10px;
            font-size: 8.5pt;
          }
          .data-table th, .data-table td {
            border: 1px solid #cbd5e1;
            padding: 6px 8px;
            text-align: left;
          }
          .data-table th {
            background: #f1f5f9;
            font-weight: 800;
            color: #1e293b;
            text-transform: uppercase;
            width: 28%;
          }
          .hash-box {
            font-family: monospace;
            font-size: 7.5pt;
            background: #f8fafc;
            border: 1px solid #cbd5e1;
            border-radius: 4px;
            padding: 6px 8px;
            word-break: break-all;
            margin-bottom: 6px;
          }
        </style>
      </head>
      <body>
        <!-- Header -->
        <div class="cert-header">
          <div>
            <div class="title-badge">SignCollab Legal Vault</div>
            <h1 style="font-size: 16pt; font-weight: 900; margin: 2px 0 0 0; color: #000;">
              CERTIFICATE OF COMPLETION
            </h1>
            <p style="margin: 2px 0 0 0; font-size: 8.5pt; color: #475569;">
              Cryptographic Audit Trail &amp; ETO 2002 Proof of Execution
            </p>
          </div>
          <div style="text-align: right;">
            <img src="${qrCodeDataUrl}" alt="Verification QR" style="width: 70px; height: 70px;" />
            <div style="font-size: 7.5pt; font-family: monospace; color: #64748b; margin-top: 2px;">Scan to Verify</div>
          </div>
        </div>

        <!-- Document Reference Summary -->
        <table class="data-table">
          <tr>
            <th>Document Ref No</th>
            <td><strong>${contract.contractNumber}</strong></td>
          </tr>
          <tr>
            <th>Public Verify Token</th>
            <td><code style="font-family: monospace; font-size: 8pt; color: #2563eb;">${contract.verifyToken}</code></td>
          </tr>
          <tr>
            <th>Contract Title</th>
            <td>${getContractTitle(contract.contractType)}</td>
          </tr>
          <tr>
            <th>Execution Status</th>
            <td>
              <span style="font-weight: 800; color: ${contract.status === "ACTIVE" || contract.status === "COMPLETED" ? "#16a34a" : "#ca8a04"};">
                ● ${contract.status}
              </span>
            </td>
          </tr>
          <tr>
            <th>Created Timestamp</th>
            <td>${formatLegalDate(contract.createdAt)}</td>
          </tr>
          <tr>
            <th>Bilateral Execution Date</th>
            <td>${formatLegalDate(contract.activatedAt || contract.updatedAt)}</td>
          </tr>
        </table>

        <!-- Signer Identity Records -->
        <div class="section-title">1. BILATERAL SIGNER IDENTITY &amp; OTP AUDIT RECAP</div>
        <div style="display: flex; gap: 10px; margin-bottom: 12px;">
          <!-- Party A -->
          <div style="flex: 1; border: 1px solid #cbd5e1; border-radius: 6px; padding: 8px; background: #f8fafc; font-size: 8.5pt;">
            <div style="font-weight: 800; text-transform: uppercase; color: #0f172a; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; margin-bottom: 6px;">
              PARTY A (INITIATOR)
            </div>
            <div><strong>Name:</strong> ${contract.initiator.name}</div>
            <div><strong>Email:</strong> ${contract.initiator.email}</div>
            <div><strong>IP Address:</strong> ${initiatorSignature?.ipAddress || "Record Logged"}</div>
            <div><strong>OTP Status:</strong> <span style="color: #16a34a; font-weight: bold;">Verified</span></div>
            <div><strong>Timestamp:</strong> ${formatLegalDate(initiatorSignature?.createdAt || contract.createdAt)}</div>
          </div>

          <!-- Party B -->
          <div style="flex: 1; border: 1px solid #cbd5e1; border-radius: 6px; padding: 8px; background: #f8fafc; font-size: 8.5pt;">
            <div style="font-weight: 800; text-transform: uppercase; color: #0f172a; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; margin-bottom: 6px;">
              PARTY B (RESPONDENT)
            </div>
            <div><strong>Name:</strong> ${contract.respondentName || contract.respondent?.name || "N/A"}</div>
            <div><strong>Email:</strong> ${contract.respondentEmail || contract.respondent?.email || "N/A"}</div>
            <div><strong>IP Address:</strong> ${respondentSignature?.ipAddress || "Record Logged"}</div>
            <div><strong>OTP Status:</strong> <span style="color: #16a34a; font-weight: bold;">Verified</span></div>
            <div><strong>Timestamp:</strong> ${formatLegalDate(respondentSignature?.createdAt || contract.activatedAt)}</div>
          </div>
        </div>

        <!-- Cryptographic Hashes -->
        <div class="section-title">2. CRYPTOGRAPHIC INTEGRITY & EXTERNAL CHECKSUMS</div>
        <div class="hash-box">
          <strong style="color: #0f172a;">PRIMARY CONTRACT PDF BINARY SHA-256 (pdfBinaryHash):</strong><br />
          <span style="color: #2563eb;">${contract.pdfBinaryHash || "PENDING_EXECUTION"}</span>
        </div>
        <div class="hash-box">
          <strong style="color: #0f172a;">PAYLOAD STRUCTURED DATA SHA-256 (finalDocumentHash):</strong><br />
          <span style="color: #0f172a;">${contract.finalDocumentHash || contract.contentHash || "PENDING_EXECUTION"}</span>
        </div>

        <!-- Audit Trail Event Log Table -->
        <div class="section-title">3. CHRONOLOGICAL EVENT AUDIT LOG</div>
        <table class="data-table" style="font-size: 8pt;">
          <thead>
            <tr>
              <th style="width: 25%;">Timestamp</th>
              <th style="width: 30%;">Action</th>
              <th style="width: 25%;">Actor</th>
              <th style="width: 20%;">IP Address</th>
            </tr>
          </thead>
          <tbody>
            ${
              contract.auditLogs.length > 0
                ? contract.auditLogs
                    .map(
                      (log) => `
              <tr>
                <td>${formatLegalDate(log.createdAt)}</td>
                <td><strong>${log.action}</strong></td>
                <td>${typeof log.details === "object" && log.details !== null ? JSON.stringify(log.details) : log.details || "System Event"}</td>
                <td><code>${log.ipAddress || "127.0.0.1"}</code></td>
              </tr>
            `
                    )
                    .join("")
                : `
              <tr>
                <td colspan="4" style="text-align: center; color: #64748b;">Contract execution audit records registered in vault.</td>
              </tr>
            `
            }
          </tbody>
        </table>

        <!-- Certificate Footer -->
        <div style="border-top: 1.5px solid #0f172a; margin-top: 18px; padding-top: 8px; font-size: 7.5pt; color: #475569; text-align: center;">
          This Audit Certificate is an immutable proof of completion issued by SignCollab Vault under the Electronic Transactions Ordinance (ETO 2002) framework.<br />
          Verify authenticity online at: <strong>${verifyUrl}</strong>
        </div>
      </body>
    </html>
  `;

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
  } else {
    executablePath = await chromium.executablePath();
  }

  const browser = await puppeteer.launch({
    args: process.platform === "win32" ? [] : chromium.args,
    executablePath,
    headless: true,
  });

  const page = await browser.newPage();
  await page.setContent(certificateHtml, { waitUntil: "domcontentloaded" });
  const certPdfBuffer = await page.pdf({
    format: "A4",
    printBackground: true,
    margin: { top: "12mm", bottom: "12mm", left: "12mm", right: "12mm" },
  });
  await browser.close();

  const filePath = `certificates/${contractId}_certificate.pdf`;
  const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
    .from("profiles")
    .upload(filePath, certPdfBuffer, {
      contentType: "application/pdf",
      upsert: true,
    });

  if (uploadError) throw new Error(uploadError.message);

  return { path: uploadData.path, buffer: Buffer.from(certPdfBuffer) };
}
