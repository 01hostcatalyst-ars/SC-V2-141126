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
            <h2 style="margin: 0; color: #111;">${company.name} Verification Code</h2>
          </div>
          <p>Hello <strong>${data.name || 'Signer'}</strong>,</p>
          <p>Your one-time passcode (OTP) to verify your email identity and sign the agreement is:</p>
          <div style="font-size: 32px; font-weight: 900; letter-spacing: 6px; padding: 15px; background-color: #f3f4f6; text-align: center; border-radius: 8px; margin: 20px 0; color: #000;">
            ${data.code}
          </div>
          ${data.name && data.name !== 'N/A' ? `
          <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 15px; margin: 20px 0; font-size: 13px; line-height: 1.6;">
            <div style="font-weight: bold; font-size: 11px; text-transform: uppercase; color: #6b7280; margin-bottom: 8px; border-bottom: 1px solid #e5e7eb; padding-bottom: 4px;">Verified Signer Information</div>
            <div><strong>Contact Name:</strong> ${data.name}</div>
            <div><strong>Email Address:</strong> ${data.email}</div>
            <div><strong>Phone Number:</strong> ${data.phone}</div>
            ${data.company !== 'N/A' ? `<div><strong>Company / Brand:</strong> ${data.company}</div>` : ''}
            ${data.designation !== 'N/A' ? `<div><strong>Job Title:</strong> ${data.designation}</div>` : ''}
            ${data.address !== 'N/A' ? `<div><strong>Address:</strong> ${data.address}</div>` : ''}
          </div>
          ` : ''}
          <p>This code is valid for 10 minutes. If you did not request this code, you can safely ignore this email.</p>
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
            <p>This document is secure and admissible under Pakistan's ETO 2002 guidelines.</p>
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
