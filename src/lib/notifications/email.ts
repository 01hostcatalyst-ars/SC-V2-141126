import { getCompanyConfig } from "@/lib/config";

export function renderEmailTemplate(
  template: "contract_link" | "signed_notification" | "contract_active" | "reminder" | "expired" | "otp",
  data: Record<string, string>
): string {
  const company = getCompanyConfig();

  const baseStyles = `
    font-family: Arial, sans-serif;
    color: #333;
    line-height: 1.6;
    max-width: 600px;
    margin: 0 auto;
    padding: 20px;
    border: 1px solid #eee;
    border-radius: 12px;
  `;

  const headerStyles = `
    border-bottom: 2px solid #2563eb;
    padding-bottom: 15px;
    margin-bottom: 20px;
  `;

  const buttonStyles = `
    display: inline-block;
    background-color: #2563eb;
    color: white;
    text-decoration: none;
    padding: 12px 24px;
    border-radius: 8px;
    font-weight: bold;
    margin: 20px 0;
  `;

  const footerStyles = `
    border-top: 1px solid #eee;
    padding-top: 15px;
    margin-top: 30px;
    font-size: 11px;
    color: #888;
    text-align: center;
  `;

  switch (template) {
    case "otp":
      return `
        <div style="${baseStyles}">
          <div style="${headerStyles}">
            <h2 style="margin: 0; color: #111;">${company.name} Initiator Verification Code</h2>
          </div>
          <p>Hello <strong>${data.name || 'Signer'}</strong>,</p>
          <p>Your one-time passcode (OTP) to verify your identity and sign your agreement is:</p>
          <div style="font-size: 34px; font-weight: 900; letter-spacing: 6px; padding: 16px; background-color: #111827; text-align: center; border-radius: 10px; margin: 20px 0; color: #ffffff;">
            ${data.code}
          </div>
          ${data.name && data.name !== 'N/A' ? `
          <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 10px; padding: 16px; margin: 20px 0; font-size: 13px; line-height: 1.6;">
            <div style="font-weight: bold; font-size: 11px; text-transform: uppercase; color: #4b5563; margin-bottom: 10px; border-bottom: 1px solid #e5e7eb; padding-bottom: 6px; letter-spacing: 0.5px;">Verified Initiator Legal Identity &amp; E-Signature</div>
            <div style="margin-bottom: 4px;"><strong>Initiator Name:</strong> ${data.name}</div>
            <div style="margin-bottom: 4px;"><strong>Email Address:</strong> ${data.email}</div>
            <div style="margin-bottom: 4px;"><strong>Phone Number:</strong> ${data.phone}</div>
            <div style="margin-bottom: 4px;"><strong>Capacity / Title:</strong> ${data.designation}</div>
            ${data.companyName && data.companyName !== 'N/A' ? `<div style="margin-bottom: 4px;"><strong>Company / Agency:</strong> ${data.companyName}</div>` : ''}
            ${data.companyAddress && data.companyAddress !== 'N/A' ? `<div style="margin-bottom: 4px;"><strong>Address:</strong> ${data.companyAddress}</div>` : ''}
            ${data.ntn && data.ntn !== 'N/A' ? `<div style="margin-bottom: 4px;"><strong>NTN:</strong> ${data.ntn}</div>` : ''}
            ${data.cnic && data.cnic !== 'N/A' ? `<div style="margin-bottom: 4px;"><strong>CNIC:</strong> ${data.cnic}</div>` : ''}
            ${data.brandName && data.brandName !== 'N/A' ? `<div style="margin-bottom: 4px;"><strong>Brand Name:</strong> ${data.brandName} ${data.brandHandle && data.brandHandle !== 'N/A' ? `(${data.brandHandle})` : ''}</div>` : ''}
            ${data.creatorName && data.creatorName !== 'N/A' ? `<div style="margin-bottom: 4px;"><strong>Creator Name:</strong> ${data.creatorName} ${data.creatorHandle && data.creatorHandle !== 'N/A' ? `(${data.creatorHandle})` : ''}</div>` : ''}
            ${data.campaignName && data.campaignName !== 'N/A' ? `<div style="margin-bottom: 4px;"><strong>Campaign Name:</strong> ${data.campaignName}</div>` : ''}
            ${data.signatureB64 ? `
            <div style="margin-top: 14px; padding-top: 10px; border-top: 1px dashed #d1d5db;">
              <div style="font-weight: bold; font-size: 11px; text-transform: uppercase; color: #6b7280; margin-bottom: 6px;">Drawn Digital Signature</div>
              <img src="${data.signatureB64}" alt="Digital Signature" style="max-height: 70px; border: 1px solid #d1d5db; background-color: #ffffff; border-radius: 6px; padding: 6px;" />
            </div>
            ` : ''}
          </div>
          ` : ''}
          <p>This code is valid for 10 minutes. Enter this code on the page to complete your signature execution.</p>
          <div style="${footerStyles}">
            <p>This identity verification layer is compliant under Pakistan's ETO 2002 guidelines.</p>
            <p>Powered by ${company.name} | ${company.legalInfo}</p>
          </div>
        </div>
      `;

    case "contract_link":
      return `
        <div style="${baseStyles}">
          <div style="${headerStyles}">
            <h2 style="margin: 0; color: #111;">${company.name} Agreement Invited</h2>
          </div>
          <p>Hello,</p>
          <p>You have received a new mutual collaboration agreement (<strong>No: ${data.contractNumber}</strong>) from <strong>${data.initiatorName}</strong>.</p>
          <p>Please click the button below to review, verify your email, and sign the agreement:</p>
          <a href="${data.link}" style="${buttonStyles}" target="_blank">Review & Sign Agreement</a>
          <p>This invitation link will expire in 7 days (on ${data.expiryDate}).</p>
          <div style="${footerStyles}">
            <p>This email was sent dynamically by ${company.name}.</p>
            <p>${company.legalInfo}</p>
          </div>
        </div>
      `;

    case "signed_notification":
      return `
        <div style="${baseStyles}">
          <div style="${headerStyles}">
            <h2 style="margin: 0; color: #111;">Counterparty Signature Logged</h2>
          </div>
          <p>Hello ${data.initiatorName},</p>
          <p>The respondent (<strong>${data.respondentName}</strong>) has successfully verified their email and signed agreement <strong># ${data.contractNumber}</strong>.</p>
          <p>Please log in to your dashboard to review their input fields and apply your final signature to activate the contract:</p>
          <a href="${data.link}" style="${buttonStyles}" target="_blank">Go to Agreement</a>
          <div style="${footerStyles}">
            <p>This email was sent dynamically by ${company.name}.</p>
            <p>${company.legalInfo}</p>
          </div>
        </div>
      `;

    case "contract_active":
      return `
        <div style="${baseStyles}">
          <div style="${headerStyles}">
            <h2 style="margin: 0; color: #22c55e;">Agreement Activated & Active</h2>
          </div>
          <p>Hello,</p>
          <p>Both signatures have been logged and verified. Your mutual collaboration agreement (<strong>No: ${data.contractNumber}</strong>) is now officially <strong>ACTIVE</strong>.</p>
          <p>Copies of the <strong>Executed Contract PDF</strong> and the <strong>Standalone Audit Certificate PDF</strong> are attached to this email. You can also view or download them anytime from your dashboard.</p>
          <div style="${footerStyles}">
            <p>Executed using SignCollab E-Signature Vault structured under ETO 2002 guidelines.</p>
            <p>Powered by ${company.name} | ${company.legalInfo}</p>
          </div>
        </div>
      `;

    case "reminder":
      return `
        <div style="${baseStyles}">
          <div style="${headerStyles}">
            <h2 style="margin: 0; color: #eab308;">Agreement Expiry Reminder</h2>
          </div>
          <p>Hello,</p>
          <p>This is a quick reminder that the collaboration agreement draft (<strong>No: ${data.contractNumber}</strong>) from <strong>${data.initiatorName}</strong> will expire in 2 days.</p>
          <p>Please review and sign before the deadline to prevent cancellation:</p>
          <a href="${data.link}" style="${buttonStyles}" target="_blank">Review & Sign Now</a>
          <div style="${footerStyles}">
            <p>Powered by ${company.name} | ${company.legalInfo}</p>
          </div>
        </div>
      `;

    case "expired":
      return `
        <div style="${baseStyles}">
          <div style="${headerStyles}">
            <h2 style="margin: 0; color: #f43f5e;">Agreement Expired</h2>
          </div>
          <p>Hello ${data.initiatorName},</p>
          <p>We are writing to notify you that agreement draft <strong># ${data.contractNumber}</strong> has expired, as the respondent did not apply their signature within the 7-day window.</p>
          <p>You can duplicate or recreate a new draft from your dashboard if you still wish to pursue this deal.</p>
          <div style="${footerStyles}">
            <p>Powered by ${company.name} | ${company.legalInfo}</p>
          </div>
        </div>
      `;

    default:
      return `<p>${company.name} Notification</p>`;
  }
}
