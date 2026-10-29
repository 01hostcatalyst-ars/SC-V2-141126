import type { Metadata } from "next";
import { LegalPage } from "@/components/layout/LegalPage";
import { getCompanyConfig } from "@/lib/config";

export const metadata: Metadata = {
  title: "Data Deletion Instructions | SignCollab",
  description: "Request deletion of SignCollab account information, Facebook or Instagram integration data, or a public creator listing.",
  alternates: { canonical: "/data-deletion" },
};

export default function DataDeletionPage() {
  const { supportEmail } = getCompanyConfig();
  const emailLink = `mailto:${supportEmail}?subject=${encodeURIComponent("SignCollab data deletion request")}`;
  return <LegalPage title="Data deletion instructions">
    <section><h2>Request deletion without signing in</h2><p>You can request deletion of your SignCollab information even if you do not have an account. This includes information obtained through Facebook or Instagram integrations, and public creator information stored in our directory.</p><ol>
      <li>Email <a href={emailLink}>{supportEmail}</a> with the subject <strong>SignCollab data deletion request</strong>.</li>
      <li>Include the email associated with your SignCollab account, if any, and the relevant social username or profile URL.</li>
      <li>Tell us whether you want your account deleted, connected Facebook/Instagram data deleted, a creator listing removed, or specific information corrected or deleted. Identify relevant agreement IDs if your request concerns an agreement.</li>
      <li>Send the request from the associated email where possible. We may ask for proportionate verification that you own the account or represent the person concerned. Do not send passwords, access tokens or identity documents unless we arrange a necessary, secure verification method.</li>
    </ol><p><a href={emailLink}>Start a deletion request by email</a>. If your device has no email app, copy the address into your email service.</p></section>
    <section><h2>What happens next</h2><p>Requests are handled by our support team, not an automated deletion endpoint. We review the scope, verify identity where needed, and delete applicable account records, social-integration data, stored creator information and derived reports linked to the request, or explain any applicable exception. We will reply with the outcome or any information needed to proceed.</p><p>We handle requests without undue delay and within applicable legal deadlines. The time needed depends on identity verification and the records involved; contact the same email address for a status update.</p></section>
    <section><h2>Records that may need to be retained</h2><p>Some agreement records, signing evidence, security records or information needed for legal obligations or claims may need to be retained. Backup copies may remain until the applicable backup cycle expires. Where an exception applies, we will explain what is retained and why. A deletion request does not cancel an agreement or remove copies held independently by other agreement participants.</p></section>
    <section><h2>Disconnect Facebook or Instagram access</h2><p>If you previously connected SignCollab, you can also revoke access in the relevant Facebook or Instagram settings. Look for Business Integrations or Apps and Websites, select SignCollab if listed, and remove its access. Menu names may vary.</p><p>Removing access stops future access through that authorization; it does not by itself delete information already stored by SignCollab. Email us to request that deletion. This process does not delete your Facebook or Instagram account or content from those platforms.</p></section>
  </LegalPage>;
}
