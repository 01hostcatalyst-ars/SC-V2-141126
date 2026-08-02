import React from "react";
import Link from "next/link";
import Script from "next/script";
import { getCompanyConfig } from "@/lib/config";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";
import type { Metadata } from "next";

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.signcollab.com";

export const metadata: Metadata = {
  title: "Terms of Service & Privacy Policy — Legal Governance | SignCollab",
  description:
    "Read SignCollab's complete Terms of Service and Privacy Notice. Covers electronic signature legal compliance across 27 global jurisdictions, SHA-256 audit trails, guest mode rules, platform liability limits, 48-hour deemed approval, and data privacy policies.",
  alternates: {
    canonical: "/terms",
  },
  openGraph: {
    title: "Terms of Service & Privacy Policy — SignCollab Legal Governance",
    description:
      "SignCollab's complete Terms of Service and Privacy Notice governing the bilateral contract platform across 27 countries for creators, brands, and agencies.",
    url: `${baseUrl}/terms`,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SignCollab — Terms of Service & Privacy Policy",
    description:
      "Legal terms governing SignCollab's e-signature and contract platform. Covers 27-jurisdiction compliance, liability limits, and data protection.",
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
          "SignCollab's Terms of Service and Privacy Notice covering 27 global jurisdictions, e-signature compliance, OTP verification, SHA-256 audit certificates, beta status, and user responsibilities.",
        "url": `${baseUrl}/terms`,
        "isPartOf": { "@id": `${baseUrl}/#website` },
        "about": { "@id": `${baseUrl}/#organization` },
        "specialty": "Legal",
        "inLanguage": "en-US",
      },
      {
        "@type": "FAQPage",
        "@id": `${baseUrl}/terms/#faqpage`,
        "mainEntity": [
          {
            "@type": "Question",
            "name": "Is SignCollab a law firm, legal counsel, or escrow agent?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "No. SignCollab is an independent technology proof-layer platform that facilitates contract generation, OTP identity validation, and cryptographic audit logging. SignCollab is not a party to any contract, does not provide legal or tax advice, does not hold escrow funds, and does not guarantee counterparty performance.",
            },
          },
          {
            "@type": "Question",
            "name": "Are SignCollab electronic signatures legally valid across 27 countries?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes. SignCollab electronic signatures are supported by verified email OTP validation, SHA-256 cryptographic PDF checksums, IP addresses, timestamps, and device fingerprints. They comply with electronic transaction laws across 27 jurisdictions including the US (ESIGN Act & UETA), UK (eIDAS & ECA 2000), EU (eIDAS Reg 910/2014 & eIDAS 2.0), UAE (Decree-Law 46/2021), Saudi Arabia (Royal Decree M/18), India (IT Act 2000 & Section 63 BSA 2023), Pakistan (ETO 2002), Canada, Australia, Singapore, Brazil, Mexico, and 15 additional nations.",
            },
          },
          {
            "@type": "Question",
            "name": "What are the rules for Guest Mode and contract generation limits?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Guest Mode grants users up to 2 free instant contracts per 24 hours per email address without mandatory signup. The platform reserves the right to introduce subscription or per-agreement fees in the future with reasonable advance notice.",
            },
          },
          {
            "@type": "Question",
            "name": "How does the 48-hour deemed approval protocol work?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "If a brand or counterparty fails to review or provide written feedback on a creator's submitted content draft within 48 hours, the content is automatically deemed approved under the contract terms. This prevents indefinite approval delays.",
            },
          },
          {
            "@type": "Question",
            "name": "How does SignCollab protect my personal data and contract privacy?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "SignCollab processes personal data necessary for identity verification and certificate generation. Document verification at /verify executes locally in your browser using Web Crypto APIs so document bytes are not uploaded over the network during hash checks. SignCollab never sells user data.",
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

      {/* Ambient background glow shapes */}
      <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[1000px] h-[500px] rounded-full ambient-glow-purple pointer-events-none z-0 opacity-40 blur-3xl" />
      <div className="absolute top-[35%] right-[-10%] w-[600px] h-[600px] rounded-full ambient-glow-blue pointer-events-none z-0 opacity-30 blur-3xl" />

      {/* Navigation Header */}
      <PublicHeader activeRoute="/terms" />

      {/* Main Body */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-6 md:p-12 z-10 space-y-8">
        {/* Title Heading */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-900 border border-blue-200 shadow-sm">
            Legal &amp; Governance Framework
          </span>
          <h1 className="text-4xl md:text-5xl font-black text-black leading-tight tracking-tight">
            Terms of Service &amp; <span className="text-accent-gradient">Privacy Notice</span>
          </h1>
          <p className="text-xs text-gray-500 font-semibold bg-white/60 backdrop-blur-md px-4 py-2 rounded-xl border border-gray-200/80 inline-block">
            Last Updated: August 2026 | Platform Terms, E-Sign Governance &amp; Data Rights
          </p>
        </div>

        {/* TL;DR PLAIN ENGLISH SUMMARY BOX */}
        <div className="bg-white/90 backdrop-blur-md border border-gray-200 rounded-3xl p-6 md:p-8 shadow-xl space-y-4">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
            <span className="text-xl">💡</span>
            <h2 className="text-sm font-black uppercase tracking-wider text-black">
              TL;DR Plain English Summary
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-gray-700 leading-relaxed font-medium">
            <div className="p-4 bg-blue-50/60 border border-blue-100 rounded-2xl space-y-1">
              <h3 className="font-bold text-blue-950">Technology Proof-Layer</h3>
              <p>SignCollab provides contract tools, OTP verification, and SHA-256 audit certificates. We are not a law firm, legal counsel, or escrow agent, and we do not hold deal money.</p>
            </div>
            <div className="p-4 bg-emerald-50/60 border border-emerald-100 rounded-2xl space-y-1">
              <h3 className="font-bold text-emerald-950">27 Global Jurisdictions</h3>
              <p>Our e-signatures and cryptographic audit trails comply with electronic transaction laws across 27 countries (US ESIGN, UK eIDAS, EU eIDAS, UAE Decree 46/2021, KSA Decree M/18, PK ETO 2002, India IT Act, etc.).</p>
            </div>
            <div className="p-4 bg-purple-50/60 border border-purple-100 rounded-2xl space-y-1">
              <h3 className="font-bold text-purple-950">Guest Mode &amp; 24h Quota</h3>
              <p>Guest Mode allows 2 free instant contracts per 24 hours per email address without upfront payment. Commercial fee options may be introduced with advance notice.</p>
            </div>
            <div className="p-4 bg-rose-50/60 border border-rose-100 rounded-2xl space-y-1">
              <h3 className="font-bold text-rose-950">Local Privacy &amp; Verification</h3>
              <p>Document verification at <code>/verify</code> executes locally in your web browser. Document contents are not uploaded over the network during hash calculation, and we never sell user data.</p>
            </div>
          </div>
        </div>

        {/* FULL LEGAL TERMS SECTIONS */}
        <div className="bg-white/90 backdrop-blur-md border border-gray-200 rounded-3xl p-6 md:p-10 shadow-xl space-y-8 text-xs md:text-sm text-gray-700 leading-relaxed">
          
          {/* Section 1 */}
          <section className="space-y-3">
            <h3 className="text-base font-black text-black tracking-tight uppercase border-b border-gray-100 pb-2">
              1. Platform Role &amp; Limitation Boundary
            </h3>
            <p>
              {company.name} (&quot;SignCollab&quot;) is an independent technology proof-layer platform that facilitates agreement drafting, electronic signature collection, OTP identity validation, and cryptographic record-keeping of bilateral commercial contracts between creators, brands, and agencies.
            </p>
            <p>
              SignCollab is not a party to any contract created on the platform, does not provide legal, tax, or financial advice, does not act as an escrow agent, does not hold or disburse campaign funds, and does not guarantee the enforceability, performance, or financial solvency of any counterparty.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-3 border-t border-gray-100 pt-6">
            <h3 className="text-base font-black text-black tracking-tight uppercase border-b border-gray-100 pb-2">
              2. Nature of Electronic Signatures &amp; 27-Jurisdiction Legal Framework
            </h3>
            <p>
              Signatures executed on SignCollab are electronic signatures supported by tamper-evident audit certificates (including verified 6-digit email OTP verification, SHA-256 document checksums, microsecond UTC timestamps, IP addresses, and device fingerprints) pursuant to electronic transaction laws across 27 supported global jurisdictions:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs bg-gray-50 p-4 rounded-2xl border border-gray-200 font-mono">
              <div>• United States: ESIGN Act (15 U.S.C. § 7001) &amp; UETA</div>
              <div>• United Kingdom: Electronic Communications Act 2000 &amp; UK eIDAS</div>
              <div>• European Union: eIDAS Reg 910/2014 &amp; eIDAS 2.0 (EU 2024/1183)</div>
              <div>• United Arab Emirates: Federal Decree-Law No. 46 of 2021</div>
              <div>• Saudi Arabia: Electronic Transactions Law (Royal Decree No. M/18)</div>
              <div>• Canada: Uniform Electronic Commerce Act (UECA) &amp; PIPEDA</div>
              <div>• Australia: Electronic Transactions Act 1999 (Cth)</div>
              <div>• Singapore: Electronic Transactions Act 2010 (Cap. 88)</div>
              <div>• India: IT Act 2000 &amp; Section 63 Bharatiya Sakshya Adhiniyam 2023</div>
              <div>• Pakistan: Electronic Transactions Ordinance (ETO) 2002</div>
              <div>• Brazil: MP No. 2.200-2/2001 &amp; Law No. 14.063/2020</div>
              <div>• Mexico: Código de Comercio (Articles 89-114)</div>
              <div>• Colombia: Law 527 of 1999 &amp; Decree 2364 of 2012</div>
              <div>• Indonesia: ITE Law No. 11/2008</div>
              <div>• Malaysia: Electronic Commerce Act 2006</div>
              <div>• Philippines: E-Commerce Act of 2000 (RA 8792)</div>
              <div>• Thailand: Electronic Transactions Act B.E. 2544</div>
              <div>• Vietnam: Law on Electronic Transactions 2023</div>
              <div>• China: PRC Electronic Signature Law</div>
              <div>• Nigeria: Evidence Act 2011 (Section 93)</div>
              <div>• South Africa: ECTA Act No. 25 of 2002</div>
              <div>• Kenya: KICA Act 2020</div>
              <div>• Egypt: E-Signature Law No. 15 of 2004</div>
              <div>• Qatar: E-Commerce Law No. 16 of 2010</div>
              <div>• Oman: Royal Decree No. 69/2008</div>
              <div>• Ghana: Electronic Transactions Act 2008 (Act 772)</div>
              <div>• Jamaica: Electronic Transactions Act 2006</div>
            </div>
            <p>
              SignCollab signatures do not constitute qualified digital certificates issued by a government-accredited Certification Authority. Parties remain responsible for ensuring their specific contracts comply with local statutory notarization or deed requirements.
            </p>
          </section>

          {/* Section 3 */}
          <section className="space-y-3 border-t border-gray-100 pt-6">
            <h3 className="text-base font-black text-black tracking-tight uppercase border-b border-gray-100 pb-2">
              3. Guest Mode &amp; 24-Hour Rate Limits
            </h3>
            <p>
              SignCollab permits guest users to create up to 2 free, bilaterally signed contracts per 24 hours per verified email address without mandatory account registration. Rate limits are monitored in real time. Attempting to bypass limits via temporary or throwaway email addresses may result in automated IP or domain throttling.
            </p>
          </section>

          {/* Section 4 */}
          <section className="space-y-3 border-t border-gray-100 pt-6">
            <h3 className="text-base font-black text-black tracking-tight uppercase border-b border-gray-100 pb-2">
              4. Accuracy of Information &amp; User Responsibilities
            </h3>
            <p>
              Users are solely responsible for inputting accurate party names, corporate designations, tax IDs (EIN, VAT, TRN, NTN, GSTIN, RFC), CNIC/national identity numbers, deliverable counts, payment deadlines, bank account IBANs, and usage licensing rights. SignCollab does not independently verify the accuracy of party declarations.
            </p>
          </section>

          {/* Section 5 */}
          <section className="space-y-3 border-t border-gray-100 pt-6">
            <h3 className="text-base font-black text-black tracking-tight uppercase border-b border-gray-100 pb-2">
              5. 48-Hour Deemed Approval Protocol
            </h3>
            <p>
              Where selected in the contract terms, if a brand or client counterparty fails to provide written review or rejection of a creator&apos;s submitted deliverable draft within 48 hours of transmission, the deliverable is automatically deemed approved. This protocol is designed to prevent unreasonable payment delays and scope withholding.
            </p>
          </section>

          {/* Section 6 */}
          <section className="space-y-3 border-t border-gray-100 pt-6">
            <h3 className="text-base font-black text-black tracking-tight uppercase border-b border-gray-100 pb-2">
              6. Bilateral Safeguards &amp; Penalty Clauses
            </h3>
            <p>
              Contracts generated on SignCollab may include custom bilateral penalty terms, such as late payment fees (% per day), late content delivery penalties, non-delivery cutoff windows, pre-delivery cancellation fees, and category exclusivity rules. Enforcing these provisions remains a bilateral matter between the contracting signatories.
            </p>
          </section>

          {/* Section 7 */}
          <section className="space-y-3 border-t border-gray-100 pt-6">
            <h3 className="text-base font-black text-black tracking-tight uppercase border-b border-gray-100 pb-2">
              7. Privacy, Data Protection &amp; On-Device Verification
            </h3>
            <p>
              We collect personal data required for contract creation and identity verification (names, emails, phone numbers, job titles, IP addresses, user-agent strings, and tax/government IDs). Data is retained securely to generate contract PDF certificates and audit logs.
            </p>
            <p>
              Document verification at <code className="bg-gray-100 px-1 py-0.5 rounded font-mono text-blue-900">/verify</code> computes SHA-256 hashes locally in your web browser using Web Crypto APIs. Your PDF document content is not uploaded over the network during hash checking. SignCollab does not sell user data to third parties.
            </p>
          </section>

          {/* Section 8 */}
          <section className="space-y-3 border-t border-gray-100 pt-6">
            <h3 className="text-base font-black text-black tracking-tight uppercase border-b border-gray-100 pb-2">
              8. Commercial Terms &amp; Future Fees
            </h3>
            <p>
              SignCollab is currently free during the pilot testing phase. We reserve the right to introduce premium plans, subscription tiers, or per-agreement creation fees in the future, with reasonable advance notice provided before any commercial charges take effect.
            </p>
          </section>

          {/* Section 9 */}
          <section className="space-y-3 border-t border-gray-100 pt-6">
            <h3 className="text-base font-black text-black tracking-tight uppercase border-b border-gray-100 pb-2">
              9. Limitation of Liability
            </h3>
            <p>
              To the maximum extent permitted by applicable law, SignCollab and its operators shall not be liable for any indirect, incidental, consequential, special, or punitive damages, lost profits, counterparty defaults, or campaign failures. SignCollab&apos;s total aggregate liability for any claims relating to platform access shall not exceed the total fees paid by the user to SignCollab in the twelve (12) months preceding the claim, or PKR 1,000 / USD $10 equivalent, whichever is lower.
            </p>
          </section>

          {/* Section 10 */}
          <section className="space-y-3 border-t border-gray-100 pt-6">
            <h3 className="text-base font-black text-black tracking-tight uppercase border-b border-gray-100 pb-2">
              10. Disputes Between Contracting Parties
            </h3>
            <p>
              Any dispute regarding campaign deliverables, payment defaults, usage rights violations, or contract breach is strictly between the executing contracting parties. SignCollab is under no obligation to intervene, mediate, arbitrate, or enforce performance under agreements generated on the platform.
            </p>
          </section>

          {/* Section 11 */}
          <section className="space-y-3 border-t border-gray-100 pt-6">
            <h3 className="text-base font-black text-black tracking-tight uppercase border-b border-gray-100 pb-2">
              11. Eligibility &amp; Signing Authority
            </h3>
            <p>
              By accessing SignCollab or signing an agreement, you represent and warrant that you are at least 18 years of age and hold full legal capacity and authority to bind yourself or the corporate entity you represent to the terms of the contract.
            </p>
          </section>

          {/* Section 12 */}
          <section className="space-y-3 border-t border-gray-100 pt-6">
            <h3 className="text-base font-black text-black tracking-tight uppercase border-b border-gray-100 pb-2">
              12. Governing Law &amp; Legal Notices
            </h3>
            <p>
              These Terms of Service are governed by and construed in accordance with the laws of the Islamic Republic of Pakistan. For legal inquiries or support, contact us at <a href={`mailto:${company.supportEmail}`} className="underline font-bold hover:text-black">{company.supportEmail}</a>.
            </p>
          </section>

        </div>
      </main>

      {/* Footer */}
      <PublicFooter />
    </div>
  );
}
