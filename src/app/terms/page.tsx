import React from "react";
import Link from "next/link";
import Script from "next/script";
import { getCompanyConfig } from "@/lib/config";
import type { Metadata } from "next";

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.signcollab.com";

export const metadata: Metadata = {
  title: "Terms of Service & Privacy Policy — SignCollab Legal",
  description:
    "Read SignCollab's Terms of Service and Privacy Notice. Covers platform liability, electronic signature compliance (US ESIGN, UK eIDAS, EU eIDAS, UAE, Pakistan ETO 2002), data handling, beta status, and user responsibilities for creator-brand contracts.",
  alternates: {
    canonical: "/terms",
  },
  openGraph: {
    title: "Terms of Service & Privacy Policy — SignCollab",
    description:
      "SignCollab's complete Terms of Service and Privacy Notice governing the bilateral contract platform for creators, brands, and agencies.",
    url: `${baseUrl}/terms`,
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "SignCollab — Terms of Service & Privacy Policy",
    description:
      "Legal terms governing the SignCollab e-signature and contract platform. Covers e-sign compliance, liability limits, and data handling.",
  },
};

export default function TermsPage() {
  const company = getCompanyConfig();

  const termsJsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${baseUrl}/terms`,
        "name": "Terms of Service & Privacy Policy — SignCollab",
        "description":
          "SignCollab's complete Terms of Service and Privacy Notice covering platform liability, e-signature compliance, data handling practices, beta disclosure, and user responsibilities.",
        "url": `${baseUrl}/terms`,
        "isPartOf": { "@id": `${baseUrl}/#website` },
        "about": { "@id": `${baseUrl}/#organization` },
        "breadcrumb": { "@id": `${baseUrl}/#breadcrumb` },
        "specialty": "Legal",
        "lastReviewed": "2026-07-01",
        "inLanguage": "en-US",
      },
      {
        "@type": "FAQPage",
        "@id": `${baseUrl}/terms/#faqpage`,
        "mainEntity": [
          {
            "@type": "Question",
            "name": "Is SignCollab a law firm or escrow agent?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "No. SignCollab is an independent technology platform that facilitates agreement drafting, OTP identity validation, and digital audit logging. SignCollab is not a party to any agreement, does not provide legal, tax, or financial advice, does not act as an escrow agent, and does not guarantee the enforceability of contracts created on the platform.",
            },
          },
          {
            "@type": "Question",
            "name": "Are SignCollab electronic signatures legally valid?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "SignCollab electronic signatures are supported by an audit trail including email OTP verification, SHA-256 cryptographic checksums, IP addresses, timestamps, and device fingerprints. They are created pursuant to applicable electronic transaction laws including the US ESIGN Act and UETA, UK eIDAS, EU eIDAS Regulation 910/2014, UAE Federal Decree-Law No. 46/2021, and Pakistan ETO 2002. They do not constitute qualified digital signatures from a government Certification Service Provider.",
            },
          },
          {
            "@type": "Question",
            "name": "Is SignCollab free to use?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes. SignCollab is currently free during the early beta/MVP phase. The platform reserves the right to introduce subscription or per-agreement fees in the future with reasonable advance notice before charges apply.",
            },
          },
          {
            "@type": "Question",
            "name": "How does SignCollab handle my personal data?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "SignCollab collects personal data necessary for contract creation and identity verification, including names, emails, phone numbers, social media handles, tax IDs, IP addresses, and device signatures. Data is retained securely for contract certificates and verification logs. SignCollab does not sell user data to third parties.",
            },
          },
          {
            "@type": "Question",
            "name": "What is SignCollab's liability limit?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "SignCollab's total aggregate liability for any claims relating to platform access shall not exceed the total fees paid by the user in the preceding 12 months, or PKR 1,000, whichever is lower. SignCollab is not liable for indirect, incidental, consequential, or punitive damages, or for non-payment by counterparties.",
            },
          },
        ],
      },
    ],
  };

  return (
    <div className="min-h-screen bg-theme-gradient flex flex-col relative overflow-hidden text-left">
      {/* Terms Page JSON-LD */}
      <Script
        id="terms-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(termsJsonLd) }}
      />
      {/* Background ambient glow shapes */}
      <div className="absolute top-[10%] left-[-5%] w-[80%] h-[50%] rounded-full ambient-glow-purple pointer-events-none z-0" />
      <div className="absolute bottom-[10%] right-[-5%] w-[80%] h-[50%] rounded-full ambient-glow-blue pointer-events-none z-0" />

      {/* Header */}
      <header className="w-full h-16 border-b border-gray-200/60 bg-white/70 backdrop-blur-md flex items-center justify-between px-4 sm:px-6 z-10 sticky top-0">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <span className="hidden sm:flex w-8 h-8 rounded-lg bg-black items-center justify-center font-bold text-white text-base shrink-0">
            {company.name[0]}
          </span>
          <span className="font-bold text-base sm:text-lg text-black tracking-tight uppercase">
            {company.name}
          </span>
        </Link>
        <Link
          href="/"
          className="text-xs font-semibold px-4 py-2 rounded-full border border-gray-300 bg-white hover:bg-gray-50 text-black transition-colors"
        >
          ← Back to Home
        </Link>
      </header>

      {/* Main Body */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-6 md:p-12 z-10 space-y-8">
        {/* Title Heading */}
        <div className="space-y-2">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-900 border border-blue-200">
            Legal &amp; Governance
          </span>
          <h1 className="text-3xl md:text-4xl font-black text-black">Terms of Service &amp; Privacy Notice</h1>
          <p className="text-xs text-gray-500 font-medium">Effective Date: July 2026 | Governing Platform Rules &amp; Data Policies</p>
        </div>

        {/* TL;DR Box */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-base">💡</span>
            <h2 className="text-xs font-bold uppercase tracking-wider text-black">TL;DR Plain English Summary</h2>
          </div>
          <ul className="text-xs text-gray-700 space-y-2 leading-relaxed font-medium">
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">•</span>
              <span><strong>SignCollab is a tech provider, not a law firm or escrow agent:</strong> We facilitate agreement drafting, OTP identity validation, and digital audit logging. We are not party to your deal.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">•</span>
              <span><strong>Electronic Signatures &amp; Legal Frameworks:</strong> Signatures and audit logs generated on SignCollab rely on email OTP verification, SHA-256 hashes, device metadata, and IP logs under applicable governing law frameworks (including US ESIGN &amp; UETA, UK eIDAS, Pakistan ETO 2002, EU eIDAS, and UAE Federal Decree-Law No. 46/2021).</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">•</span>
              <span><strong>Accuracy &amp; Terms:</strong> You are responsible for entering accurate party identities, delivery dates, and financial figures.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">•</span>
              <span><strong>Early Beta/MVP Status:</strong> The platform is currently provided free of charge during our pilot phase.</span>
            </li>
          </ul>
        </div>

        {/* Full Terms Sections */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8 shadow-sm space-y-8 text-xs text-gray-700 leading-relaxed">
          
          {/* Section 1 */}
          <section className="space-y-2">
            <h3 className="text-sm font-black text-black uppercase tracking-wider">1. Platform Role &amp; Limitation Boundary</h3>
            <p>
              {company.name} (&quot;SignCollab&quot;) is an independent technology platform that facilitates the creation, electronic signing, and tamper-evident record-keeping of bilateral commercial agreements between creators, brands, and agencies. 
            </p>
            <p>
              SignCollab is not a party to any agreement created on the platform, does not provide legal, tax, or financial advice, does not act as an escrow agent, does not hold funds on behalf of any user, and does not guarantee the outcome, legal enforceability, or performance of any contract executed by users.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-2 border-t border-gray-100 pt-6">
            <h3 className="text-sm font-black text-black uppercase tracking-wider">2. Nature of Electronic Signatures &amp; E-Sign Compliance</h3>
            <p>
              Signatures collected through SignCollab are electronic signatures supported by an audit trail (including verified email OTP verification, SHA-256 cryptographic document checksums, IP addresses, timestamps, and device fingerprints) pursuant to applicable governing law electronic transaction acts (including US ESIGN &amp; UETA, UK eIDAS, Pakistan ETO 2002, and UAE Federal Decree-Law No. 46/2021).
            </p>
            <p>
              They do not constitute certified digital signatures issued by an accredited government Certification Service Provider. While SignCollab creates strong evidentiary records, enforceability remains subject to applicable law and factual determinations of relevant competent authorities.
            </p>
          </section>

          {/* Section 3 */}
          <section className="space-y-2 border-t border-gray-100 pt-6">
            <h3 className="text-sm font-black text-black uppercase tracking-wider">3. Accuracy of Information &amp; User Responsibility</h3>
            <p>
              Users are solely responsible for the accuracy and completeness of all information submitted on SignCollab, including tax identification numbers (NTN), CNIC numbers, business entity names, contact persons, financial payment details, deliverable specifications, and payment deadlines. SignCollab does not independently vet or verify party declarations beyond the email identity verification protocols described herein.
            </p>
          </section>

          {/* Section 4 */}
          <section className="space-y-2 border-t border-gray-100 pt-6">
            <h3 className="text-sm font-black text-black uppercase tracking-wider">4. Beta / Early Phase Disclosure</h3>
            <p>
              SignCollab is currently operating in an early testing (Beta / MVP) phase. Features, availability, and user interfaces may be updated or modified without prior notice. Software is provided on an &quot;AS IS&quot; and &quot;AS AVAILABLE&quot; basis. Users are advised to review all agreement drafts independently before execution.
            </p>
          </section>

          {/* Section 5 */}
          <section className="space-y-2 border-t border-gray-100 pt-6">
            <h3 className="text-sm font-black text-black uppercase tracking-wider">5. Limitation of Liability</h3>
            <p>
              To the maximum extent permitted by applicable law, SignCollab and its operators shall not be liable for any indirect, incidental, consequential, special, or punitive damages, loss of revenue, non-payment by counterparties, or breach of contract between users. SignCollab&apos;s total aggregate liability for any claims relating to platform access shall not exceed the total fees paid by the user to SignCollab in the twelve (12) months preceding the event, or PKR 1,000, whichever is lower.
            </p>
          </section>

          {/* Section 6 */}
          <section className="space-y-2 border-t border-gray-100 pt-6">
            <h3 className="text-sm font-black text-black uppercase tracking-wider">6. Disputes Between Contracting Parties</h3>
            <p>
              Any dispute regarding campaign deliverables, payment defaults, usage rights violations, or contract breach is strictly between the executing contracting parties. SignCollab is under no obligation to intervene, mediate, arbitrate, or enforce performance under agreements generated on the platform.
            </p>
          </section>

          {/* Section 7 */}
          <section className="space-y-2 border-t border-gray-100 pt-6">
            <h3 className="text-sm font-black text-black uppercase tracking-wider">7. Privacy &amp; Data Handling Notice</h3>
            <p>
              We collect personal data necessary to facilitate bilateral contract creation and identity verification, including full names, email addresses, phone numbers, social media handles, NTN/CNIC details, IP addresses, and device signatures. 
            </p>
            <p>
              Data is retained securely to generate contract certificates and proof verification logs. We do not sell user data to third parties. Data handling practices comply with reasonable industry standards on a best-efforts basis during this phase.
            </p>
          </section>

          {/* Section 8 */}
          <section className="space-y-2 border-t border-gray-100 pt-6">
            <h3 className="text-sm font-black text-black uppercase tracking-wider">8. Fees &amp; Commercial Terms</h3>
            <p>
              SignCollab is currently accessible free of charge during the early testing phase. We reserve the right to introduce subscription or pay-per-agreement fees in the future, with reasonable advance notice provided before any commercial charges apply to new contracts.
            </p>
          </section>

          {/* Section 9 */}
          <section className="space-y-2 border-t border-gray-100 pt-6">
            <h3 className="text-sm font-black text-black uppercase tracking-wider">9. Eligibility &amp; Signing Capacity</h3>
            <p>
              By accessing SignCollab or signing an agreement, you represent and warrant that you are at least 18 years of age and hold full legal capacity and authority to bind yourself or the corporate entity you represent to the terms of the agreement.
            </p>
          </section>

          {/* Section 10 */}
          <section className="space-y-2 border-t border-gray-100 pt-6">
            <h3 className="text-sm font-black text-black uppercase tracking-wider">10. Governing Law &amp; Contact</h3>
            <p>
              These Terms of Service are governed by and construed in accordance with the laws of the Islamic Republic of Pakistan. For legal inquiries or platform support, contact us at <a href={`mailto:${company.supportEmail}`} className="underline font-bold hover:text-black">{company.supportEmail}</a>.
            </p>
          </section>

        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-gray-200/60 bg-white/70 backdrop-blur-md py-6 flex flex-col md:flex-row items-center justify-between px-6 gap-4 z-10">
        <span className="text-xs text-gray-500 font-semibold">
          © {new Date().getFullYear()} {company.name}. All rights reserved.
        </span>
        <div className="flex gap-4 items-center flex-wrap justify-center">
          <Link href="/features" className="text-xs text-gray-600 hover:text-black font-semibold transition-colors">
            Features
          </Link>
          <span className="text-gray-300">|</span>
          <Link href="/verify" className="text-xs text-gray-600 hover:text-black font-semibold transition-colors">
            Verify Document
          </Link>
          <span className="text-gray-300">|</span>
          <Link href="/terms" className="text-xs text-black font-bold hover:underline">
            Terms &amp; Privacy
          </Link>
          <span className="text-gray-300">|</span>
          <Link href="/contact" className="text-xs text-gray-600 hover:text-black font-semibold transition-colors">
            Contact &amp; Support
          </Link>
        </div>
      </footer>
    </div>
  );
}
