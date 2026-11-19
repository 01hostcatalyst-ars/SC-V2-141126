import { launchBrowser } from "@/lib/pdf/chromiumLauncher";
import QRCode from "qrcode";
import { prisma } from "@/lib/prisma";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { getJurisdiction } from "@/lib/config/jurisdictions";

export async function generateAuditCertificatePDF(contractId: string) {
  const contract = await prisma.contract.findUnique({
    where: { id: contractId },
    include: {
      initiator: true,
      respondent: true,
      signatures: true,
      parties: true,
      auditLogs: {
        include: { user: true },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!contract) {
    throw new Error("Contract not found.");
  }

  const jur = getJurisdiction((contract as any).jurisdictionCountryCode || "US");

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://signcollab.com";
  const verifyUrl = `${appUrl}/verify?token=${contract.verifyToken}`;
  const qrCodeDataUrl = await QRCode.toDataURL(verifyUrl, { margin: 1, width: 120 });

  const initiatorParty = contract.parties.find(p => p.partyType === "INITIATOR") || {
    name: contract.initiator?.name || "Initiator",
    email: contract.initiator?.email || "",
    phone: contract.initiatorPhone || contract.initiator?.phone,
    role: (contract.contractType.startsWith("CREATOR_") ? "CREATOR" : contract.contractType.startsWith("BRAND_") ? "BRAND" : "AGENCY") as any,
    designation: contract.initiatorDesignation,
    companyName: contract.initiatorCompanyName || contract.initiator?.agencyName,
    companyAddress: contract.initiatorCompanyAddress || contract.initiator?.agencyAddress,
    ntn: contract.initiatorNtn,
    cnic: contract.initiatorCnic,
  };

  const respondentParty = contract.parties.find(p => p.partyType === "RESPONDENT") || {
    name: contract.respondentName || contract.respondent?.name || "N/A",
    email: contract.respondentEmail || contract.respondent?.email || "N/A",
    phone: contract.respondentPhone || contract.respondent?.phone,
    role: (contract.contractType.endsWith("_CREATOR") ? "CREATOR" : contract.contractType.endsWith("_BRAND") ? "BRAND" : "AGENCY") as any,
    designation: contract.respondentDesignation,
    companyName: contract.respondentCompany || contract.respondent?.agencyName,
    companyAddress: contract.respondentAddress || contract.respondent?.agencyAddress,
    ntn: contract.respondentNtn,
    cnic: contract.respondentCnic,
  };

  const initiatorSignature = contract.signatures.find(
    (s) => s.signerPartyId === (initiatorParty as any).id || s.signerId === contract.initiatorId
  );
  const respondentSignature = contract.signatures.find(
    (s) => s.signerPartyId === (respondentParty as any).id || s.signerId !== contract.initiatorId
  );

  const formatLegalDate = (date: Date | null | undefined, countryCodeOrTz: string = "US") => {
    if (!date) return "N/A";
    const j = getJurisdiction(countryCodeOrTz);
    return `${new Date(date).toLocaleString("en-US", {
      dateStyle: "medium",
      timeStyle: "medium",
    })} (${j.tzAbbr})`;
  };


  const partyATaxId = (initiatorParty as any).taxId || (initiatorParty as any).ntn || (initiatorParty as any).cnic;
  const partyBTaxId = (respondentParty as any).taxId || (respondentParty as any).ntn || (respondentParty as any).cnic;

  const formatActorDetails = (log: any) => {
    let details: any = log.details;
    if (typeof details === "string") {
      try {
        details = JSON.parse(details);
      } catch (e) {
        // keep string
      }
    }

    const email = log.user?.email || details?.email || details?.userEmail || details?.signerEmail || details?.initiatorEmail || "";
    
    // Prioritize ContractParty snapshot matching email or userId
    const party = contract.parties?.find(
      (p: any) => (email && p.email?.toLowerCase() === email.toLowerCase()) || (p.userId && p.userId === log.userId)
    );

    const name = party?.name || log.user?.name || details?.name || details?.initiatorName || "";
    const role = party?.role || log.user?.role || details?.signerRole || details?.role || "";
    const company = party?.companyName || (details?.company || details?.agencyName || "");

    if (name || email) {
      const displayName = name ? `<strong>${name}</strong> (${email || party?.email || ""})` : `<strong>${email}</strong>`;
      const roleStr = role ? `<span style="color: #2563eb; font-weight: bold;"> [${role}]</span>` : "";
      const companyStr = (company && party?.role !== "CREATOR") ? `<div style="font-size: 7.5pt; color: #475569; margin-top: 1px;">Rep: <strong>${company}</strong></div>` : "";
      return `<div>${displayName}${roleStr}${companyStr}</div>`;
    }

    if (typeof details === "string" && details.trim()) {
      return details;
    }

    return "System Recorded Event";
  };

  const getContractTitle = (type: string) => {
    switch (type) {
      case "AGENCY_TO_BRAND": return "AGENCY TO BRAND INFLUENCER MARKETING & CONTENT LICENSING AGREEMENT";
      case "AGENCY_TO_CREATOR": return "AGENCY TO CREATOR CONTENT PRODUCTION & SERVICE AGREEMENT";
      case "BRAND_TO_CREATOR": return "BRAND TO CREATOR DIRECT SPONSORSHIP AGREEMENT";
      case "BRAND_TO_AGENCY": return "BRAND TO AGENCY CAMPAIGN MANAGEMENT & SERVICE AGREEMENT";
      case "CREATOR_TO_BRAND": return "CREATOR TO BRAND DIRECT CONTENT ENGAGEMENT AGREEMENT";
      case "CREATOR_TO_AGENCY": return "CREATOR TO AGENCY CONTENT COLLABORATION & SERVICE AGREEMENT";
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
              Cryptographic Audit Trail &amp; ${jur.lawAbbreviation} Proof of Execution
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
            <td>${formatLegalDate(contract.createdAt, jur.countryCode)}</td>
          </tr>
          <tr>
            <th>Bilateral Execution Date</th>
            <td>${formatLegalDate(contract.activatedAt || contract.updatedAt, jur.countryCode)}</td>
          </tr>
          ${contract.collabDetails ? `
            <tr>
              <th>Counterparty Campaign Notes</th>
              <td>${contract.collabDetails}</td>
            </tr>
          ` : ""}
        </table>

        <!-- Signer Identity Records -->
        <div class="section-title">1. BILATERAL SIGNER IDENTITY &amp; OTP AUDIT RECAP</div>
        <div style="display: flex; gap: 10px; margin-bottom: 12px;">
          <!-- Party A -->
          <div style="flex: 1; border: 1px solid #cbd5e1; border-radius: 6px; padding: 8px; background: #f8fafc; font-size: 8.5pt;">
            <div style="font-weight: 800; text-transform: uppercase; color: #0f172a; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; margin-bottom: 6px;">
              PARTY A (INITIATOR ENTITY)
            </div>
            <div style="font-weight: 900; font-size: 9.5pt; color: #0f172a; text-transform: uppercase; margin-bottom: 2px;">
              ${initiatorParty.companyName || initiatorParty.name}
            </div>

            ${partyATaxId ? `<div style="font-size: 8pt; color: #475569; font-weight: bold; margin-bottom: 4px;">${jur.taxIdLabel}: ${partyATaxId}</div>` : ""}
            <div style="border-top: 1px dashed #cbd5e1; padding-top: 4px; margin-top: 4px;">
              <div><strong>Authorized Signer:</strong> ${initiatorParty.name} ${initiatorParty.designation ? `(${initiatorParty.designation})` : ""}</div>
              <div><strong>Email:</strong> ${initiatorParty.email}</div>
              <div><strong>IP Address:</strong> ${initiatorSignature?.ipAddress || "Record Logged"}</div>
              <div><strong>OTP Status:</strong> <span style="color: #16a34a; font-weight: bold;">Verified</span></div>
              <div><strong>Signed:</strong> ${formatLegalDate(initiatorSignature?.signedAt || contract.createdAt, jur.countryCode)}</div>
            </div>
          </div>

          <!-- Party B -->
          <div style="flex: 1; border: 1px solid #cbd5e1; border-radius: 6px; padding: 8px; background: #f8fafc; font-size: 8.5pt;">
            <div style="font-weight: 800; text-transform: uppercase; color: #0f172a; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; margin-bottom: 6px;">
              PARTY B (COUNTERPARTY ENTITY)
            </div>
            <div style="font-weight: 900; font-size: 9.5pt; color: #0f172a; text-transform: uppercase; margin-bottom: 2px;">
              ${(() => {
                const rParty = respondentParty as any;
                const partyBEntity = rParty.companyName || (rParty.role === "CREATOR" ? (contract.creatorName || rParty.name) : rParty.name);
                return partyBEntity;
              })()}
            </div>
            ${partyBTaxId ? `<div style="font-size: 8pt; color: #475569; font-weight: bold; margin-bottom: 4px;">${jur.taxIdLabel}: ${partyBTaxId}</div>` : ""}
            <div style="border-top: 1px dashed #cbd5e1; padding-top: 4px; margin-top: 4px;">
              <div><strong>Authorized Signer:</strong> ${respondentParty.name} ${respondentParty.designation ? `(${respondentParty.designation})` : ""}</div>
              <div><strong>Email:</strong> ${respondentParty.email}</div>
              <div><strong>IP Address:</strong> ${respondentSignature?.ipAddress || "Record Logged"}</div>
              <div><strong>OTP Status:</strong> <span style="color: #16a34a; font-weight: bold;">Verified</span></div>
              <div><strong>Signed:</strong> ${formatLegalDate(respondentSignature?.signedAt || contract.activatedAt, jur.countryCode)}</div>
            </div>
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
          <span style="color: #0f172a;">${(contract as any).finalDocumentHash || contract.contentHash || "PENDING_EXECUTION"}</span>
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
                <td>${formatLegalDate(log.createdAt, jur.countryCode)}</td>
                <td><strong>${log.action}</strong></td>
                <td>${formatActorDetails(log)}</td>
                <td><code>${log.ipAddress || (typeof log.details === "object" && (log.details as any)?.ipAddress) || "Logged"}</code></td>
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
          <div style="font-size: 6.8pt; line-height: 1.35; color: #64748b; max-width: 95%; margin: 0 auto 4px auto;">PLATFORM ROLE &amp; LIABILITY DISCLAIMER: SignCollab is an independent technology service provider facilitating digital document creation and cryptographic signature logging in compliance with ${jur.governingLawName}. SignCollab is not a legal representative, broker, or party to this agreement, provides no legal advice, and disclaims all liability arising from the performance, enforcement, or dispute of its terms.</div>
          <div>Verify authenticity online at: <strong>${verifyUrl}</strong></div>
        </div>
      </body>
    </html>
  `;

  const browser = await launchBrowser();
  let certPdfBuffer: Uint8Array;
  try {
    const page = await browser.newPage();
    await page.setContent(certificateHtml, { waitUntil: "domcontentloaded" });
    certPdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "12mm", bottom: "12mm", left: "12mm", right: "12mm" },
    });
  } finally {
    await browser.close();
  }

  const filePath = `certificates/${contractId}_certificate.pdf`;
  const { data: uploadData, error: uploadError } = await getSupabaseAdmin().storage
    .from("profiles")
    .upload(filePath, certPdfBuffer, {
      contentType: "application/pdf",
      upsert: true,
    });

  if (uploadError) throw new Error(uploadError.message);

  return { path: uploadData.path, buffer: Buffer.from(certPdfBuffer) };
}
