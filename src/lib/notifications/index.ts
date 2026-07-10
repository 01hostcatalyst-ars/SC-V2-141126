import { Resend } from "resend";
import { getCompanyConfig } from "@/lib/config";
import { renderEmailTemplate } from "./email";

const resend = new Resend(process.env.RESEND_API_KEY || "re_mock_key");

interface EmailPayload {
  to: string;
  subject: string;
  template: "contract_link" | "signed_notification" | "contract_active" | "reminder" | "expired";
  data: Record<string, string>;
  pdfBuffer?: Buffer;
}

export async function sendEmailNotification(payload: EmailPayload) {
  const company = getCompanyConfig();

  // If Resend API Key is unconfigured, fallback gracefully to print notifications in development
  if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY.includes("mock")) {
    console.log(`[MOCK EMAIL DISPATCH]
      TO: ${payload.to}
      SUBJECT: ${payload.subject}
      TEMPLATE: ${payload.template}
      DATA: ${JSON.stringify(payload.data)}
      HAS_ATTACHMENT: ${!!payload.pdfBuffer}
    `);
    return { success: true, message: "Mock email printed to console." };
  }

  const htmlContent = renderEmailTemplate(payload.template, payload.data);
  const attachments = payload.pdfBuffer
    ? [
        {
          filename: `Agreement-${payload.data.contractNumber}.pdf`,
          content: payload.pdfBuffer,
        },
      ]
    : undefined;

  try {
    const { data, error } = await resend.emails.send({
      from: `${company.name} <contracts@${company.domain}>`,
      to: payload.to,
      subject: payload.subject,
      html: htmlContent,
      attachments,
    });

    if (error) {
      console.error("Resend API returned error dispatching email:", error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (err: any) {
    console.error("Resend connection failed:", err);
    return { success: false, error: err.message };
  }
}
