import React from "react";
import Link from "next/link";
import Script from "next/script";
import { getCompanyConfig } from "@/lib/config";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";
import type { Metadata } from "next";

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.signcollab.com";

export const metadata: Metadata = {
  title: "Platform Features — Security & Contract Architecture | SignCollab",
  description:
    "Explore SignCollab's complete feature architecture: 6-step contract wizard, OTP bilateral e-signatures, SHA-256 tamper-proof audit certificates, local browser verification, and 27-jurisdiction global compliance engine.",
  alternates: {
    canonical: "/features",
  },
  openGraph: {
    title: "Platform Features — Security & Contract Architecture | SignCollab",
    description:
      "Explore SignCollab's 6-step contract wizard, OTP-verified e-signatures, SHA-256 tamper-proof audit trails, and multi-jurisdiction compliance across 27 countries.",
    url: `${baseUrl}/features`,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SignCollab Features — Creator & Brand Contract Architecture",
    description:
      "6-step contract wizard, OTP-verified e-signatures, SHA-256 audit certificates, and global legal compliance for creators, brands, and agencies.",
  },
};

export default function FeaturesPage() {
  const company = getCompanyConfig();

  const featuresJsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${baseUrl}/features`,
        "name": "SignCollab Features & Architecture",
        "description":
          "Detailed breakdown of SignCollab's contract wizard, bilateral e-signature engine, SHA-256 audit certificate generation, document verification, and 27-jurisdiction legal compliance framework.",
        "url": `${baseUrl}/features`,
        "isPartOf": { "@id": `${baseUrl}/#website` },
        "about": { "@id": `${baseUrl}/#organization` },
        "breadcrumb": { "@id": `${baseUrl}/#breadcrumb` },
        "inLanguage": "en-US",
      },
      {
        "@type": "FAQPage",
        "@id": `${baseUrl}/features/#faqpage`,
        "mainEntity": [
          {
            "@type": "Question",
            "name": "How does SignCollab's 6-step contract wizard work?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "SignCollab guides users through 6 structured steps: (1) Deliverables & Tagging, (2) Usage Rights & Licensing, (3) Financial & Payment Terms, (4) Delivery, Revisions & Product Provisions, (5) Safeguards, Penalties & Exclusivity, and (6) Workflow & Identity Verification. It turns informal conversations into binding, legally sound digital contracts.",
            },
          },
          {
            "@type": "Question",
            "name": "How many legal jurisdictions does SignCollab support?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "SignCollab supports 27 global jurisdictions: United States (US ESIGN & UETA), United Kingdom (UK eIDAS), European Union (EU eIDAS Reg 910/2014 & eIDAS 2.0), UAE (Decree-Law 46/2021), Saudi Arabia (Royal Decree M/18), Canada (UECA & PIPEDA), Australia (ETA 1999), Singapore (ETA 2010), India (IT Act 2000 & Section 63 BSA 2023), Pakistan (ETO 2002), Brazil (MP 2.200-2 & Law 14.063), Mexico (Commerce Code), Colombia (Law 527/1999), Indonesia (ITE Law), Malaysia (ECA 2006), Philippines (RA 8792), Thailand (ETA B.E. 2544), Vietnam (ET Law 2023), China (PRC E-Signature Law), Nigeria (Evidence Act 2011), South Africa (ECTA 2002), Kenya (KICA 2020), Egypt (Law 15/2004), Qatar (Law 16/2010), Oman (RD 69/2008), Ghana (Act 772), and Jamaica (ET Act 2006).",
            },
          },
          {
            "@type": "Question",
            "name": "How does local browser document verification work?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "SignCollab's verification engine processes contract PDFs locally inside your browser to compute their SHA-256 hash fingerprint before contacting servers. If even a single character or comma is altered, the SHA-256 hash changes completely, flagging the document as tampered.",
            },
          },
          {
            "@type": "Question",
            "name": "What is Guest Mode in SignCollab?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Guest Mode lets users generate up to 2 free, fully signed instant contracts per 24 hours per email address without creating an account or paying upfront fees.",
            },
          },
          {
            "@type": "Question",
            "name": "What information is included in the SHA-256 audit trail certificate?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "The audit certificate includes the master contract SHA-256 hash checksum, verified signatory email addresses, phone numbers, job titles, exact UTC timestamps, IP addresses, browser user-agent signatures, OTP verification logs, and governing legal jurisdiction notices.",
            },
          },
        ],
      },
      {
        "@type": "HowTo",
        "@id": `${baseUrl}/features/#howto`,
        "name": "How to Create a Bilateral Creator-Brand Contract on SignCollab",
        "description":
          "A step-by-step guide to generating a legally compliant bilateral contract using SignCollab's 6-step guided wizard.",
        "totalTime": "PT5M",
        "step": [
          {
            "@type": "HowToStep",
            "position": 1,
            "name": "Specify Deliverables & Tagging",
            "text": "Define content formats (Reels, TikToks, Shorts, YouTube, Carousels), post counts, tagging instructions (#ad #collab), and promo code rules.",
          },
          {
            "@type": "HowToStep",
            "position": 2,
            "name": "Set Commercial Usage Rights",
            "text": "Configure usage scope (Organic Social, Paid Ads, Print & Billboard, Broadcast Media), platform permissions, and licensing duration.",
          },
          {
            "@type": "HowToStep",
            "position": 3,
            "name": "Configure Financials & Payouts",
            "text": "Select currency, statutory tax treatment, advance deposit terms, milestone payment dates, and payout routes (Bank IBAN, Local Mobile Wallet, Wire).",
          },
          {
            "@type": "HowToStep",
            "position": 4,
            "name": "Define Delivery & Product Provisions",
            "text": "Set delivery turnaround days, revision caps, product shipment details, return policies, and the 48-hour deemed approval rule.",
          },
          {
            "@type": "HowToStep",
            "position": 5,
            "name": "Establish Safeguards & Penalties",
            "text": "Configure late payment penalties, late content delivery fees, non-delivery cutoff rules, category exclusivity terms, and confidentiality embargoes.",
          },
          {
            "@type": "HowToStep",
            "position": 6,
            "name": "Verify Identity & Execute",
            "text": "Select workflow relationship, complete email OTP authentication, and generate a secure counterparty signing link.",
          },
        ],
      },
    ],
  };

  const coreFeatures = [
    {
      badge: "Guided Contract Builder",
      title: "6-Step Commercial Wizard",
      desc: "Turn informal DM promises into structured, enforceable legal agreements with smart autocompletions for deliverables, usage scope, and financial terms.",
      icon: (
        <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
    {
      badge: "Cryptographic Security",
      title: "SHA-256 Tamper-Proof Audit Certificates",
      desc: "Every executed agreement generates a master contract PDF and an Audit Certificate featuring SHA-256 hash checksums, verified emails, IP addresses, and timestamps.",
      icon: (
        <svg className="w-6 h-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
    },
    {
      badge: "Global Legal Engine",
      title: "27 Jurisdiction Compliance Engine",
      desc: "Automated mapping of governing law, dispute resolution clauses, and electronic signature compliance across 27 countries in North America, Europe, Middle East, Asia-Pacific, Latin America, and Africa.",
      icon: (
        <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 002 2h1.5a2.5 2.5 0 002.5-2.5V14.39M15 15.5H14a2 2 0 01-2-2v-.5a2 2 0 00-2-2H9" />
        </svg>
      ),
    },
    {
      badge: "Identity Authentication",
      title: "OTP Email Verification & Device Fingerprinting",
      desc: "Prevent unauthorized signoffs with mandatory 6-digit email OTP verification, device user-agent logging, and IP tracking before contract activation.",
      icon: (
        <svg className="w-6 h-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 004 11c0 2.473.345 4.866.99 7.132M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
    {
      badge: "Client-Side Privacy",
      title: "Local Browser Verification Tool",
      desc: "Upload contract PDFs to compute SHA-256 hashes locally in your browser. Document content never leaves your device during authenticity checks.",
      icon: (
        <svg className="w-6 h-6 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      ),
    },
    {
      badge: "Instant Access",
      title: "Guest Mode (2 Free Contracts/24 Hours)",
      desc: "Generate and sign 2 full-featured, bilaterally signed contracts per 24 hours per email address with zero mandatory signup or upfront fees.",
      icon: (
        <svg className="w-6 h-6 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
    },
  ];

  const wizardSteps = [
    {
      number: "01",
      title: "Deliverables & Tagging",
      desc: "Specify exact deliverables (Reels, TikToks, Shorts, YouTube Videos, Carousels), post counts, tagging instructions (#ad #collab), promo codes, and co-author IG collab tags.",
    },
    {
      number: "02",
      title: "Usage Rights & Licensing",
      desc: "Define licensing scope (Organic Social, Paid Ads, Print & Billboard, Broadcast Media), platform allowances (Instagram, TikTok, YouTube, LinkedIn, X), and duration terms.",
    },
    {
      number: "03",
      title: "Financials & Payout Routes",
      desc: "Select currency, statutory tax rules, advance deposit requirements, milestone payment dates, and local payout channels (Bank IBAN, Mobile Wallets, Wire Transfer).",
    },
    {
      number: "04",
      title: "Delivery, Revisions & Products",
      desc: "Set turnaround days, revision caps, product shipment details, return shipping rules, and the 48-hour deemed approval protocol to prevent hostage submissions.",
    },
    {
      number: "05",
      title: "Safeguards, Penalties & Exclusivity",
      desc: "Establish late payment penalties, late content delivery fees, non-delivery cutoff rules, category exclusivity terms, and confidentiality embargoes.",
    },
    {
      number: "06",
      title: "Workflow & Identity Verification",
      desc: "Choose relationship workflows (Creator ➔ Brand, Brand ➔ Creator, Agency ➔ Creator), enter tax/company IDs, complete OTP email verification, and launch counterparty signing links.",
    },
  ];

  const regions = [
    { name: "North America", countries: "United States (ESIGN & UETA), Canada (UECA & PIPEDA), Mexico (Commerce Code)" },
    { name: "Europe & UK", countries: "United Kingdom (eIDAS & ECA 2000), European Union (eIDAS Reg 910/2014 & eIDAS 2.0)" },
    { name: "Middle East & Gulf", countries: "UAE (Decree-Law 46/2021), Saudi Arabia (Royal Decree M/18), Qatar (Law 16/2010), Oman (RD 69/2008), Egypt (Law 15/2004)" },
    { name: "Asia-Pacific", countries: "India (IT Act & BSA 2023 Sec 63), Pakistan (ETO 2002), Singapore (ETA 2010), Australia (ETA 1999), Indonesia (ITE Law), Malaysia (ECA 2006), Philippines (RA 8792), Thailand (ETA B.E. 2544), Vietnam (ET Law 2023), China (PRC E-Signature Law)" },
    { name: "Latin America", countries: "Brazil (MP 2.200-2 & Law 14.063), Colombia (Law 527/1999), Jamaica (ET Act 2006)" },
    { name: "Africa", countries: "Nigeria (Evidence Act 2011), South Africa (ECTA 2002), Kenya (KICA 2020), Ghana (Act 772)" },
  ];

  return (
    <div className="min-h-screen bg-theme-gradient flex flex-col relative overflow-hidden">
      {/* Schema.org Structured Data */}
      <Script
        id="features-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(featuresJsonLd) }}
      />

      {/* Ambient background glow elements */}
      <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[1000px] h-[500px] rounded-full ambient-glow-purple pointer-events-none z-0 opacity-40 blur-3xl" />
      <div className="absolute top-[35%] right-[-10%] w-[600px] h-[600px] rounded-full ambient-glow-blue pointer-events-none z-0 opacity-30 blur-3xl" />

      {/* Navigation Header */}
      <PublicHeader activeRoute="/features" />

      {/* Main Content */}
      <main className="flex-1 z-10">
        {/* HERO SECTION */}
        <section className="max-w-4xl mx-auto px-6 pt-16 pb-12 text-center">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold bg-blue-100/90 text-blue-900 border border-blue-300 mb-6 shadow-sm">
            Platform Architecture • Security &amp; Legal Compliance
          </span>
          <h1 className="text-4xl md:text-6xl font-black text-black leading-tight tracking-tight mb-6">
            Engineered for <span className="text-accent-gradient">Trust &amp; Clarity</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-800 font-medium leading-relaxed max-w-3xl mx-auto mb-8 bg-white/60 backdrop-blur-md p-6 rounded-2xl border border-gray-200/80 shadow-sm">
            SignCollab combines a 6-step guided contract wizard, OTP email authentication, SHA-256 cryptographic audit trails, local document verification, and a 27-jurisdiction legal compliance engine.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <span className="px-3 py-1 rounded-md text-xs font-bold bg-blue-50 border border-blue-200 text-blue-800">
              #27Jurisdictions
            </span>
            <span className="px-3 py-1 rounded-md text-xs font-bold bg-emerald-50 border border-emerald-200 text-emerald-800">
              #SHA256Checksum
            </span>
            <span className="px-3 py-1 rounded-md text-xs font-bold bg-purple-50 border border-purple-200 text-purple-800">
              #OTPAuthentication
            </span>
            <span className="px-3 py-1 rounded-md text-xs font-bold bg-amber-50 border border-amber-200 text-amber-800">
              #GuestMode
            </span>
            <span className="px-3 py-1 rounded-md text-xs font-bold bg-rose-50 border border-rose-200 text-rose-800">
              #LocalVerification
            </span>
          </div>
        </section>

        {/* CORE PLATFORM FEATURES GRID */}
        <section className="max-w-6xl mx-auto px-6 py-10">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-black text-black tracking-tight mb-3">
              Core Platform Capabilities
            </h2>
            <p className="text-sm text-gray-600">
              Purpose-built infrastructure for modern creator, brand, and agency partnerships.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {coreFeatures.map((feat, i) => (
              <div
                key={i}
                className="bg-white/80 backdrop-blur-md p-6 rounded-2xl border border-gray-200/80 shadow-sm hover:shadow-md transition-all hover:-translate-y-1 flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center mb-4 shadow-inner">
                    {feat.icon}
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full mb-2 inline-block border border-blue-100">
                    {feat.badge}
                  </span>
                  <h3 className="text-lg font-bold text-black mb-2">{feat.title}</h3>
                  <p className="text-xs text-gray-600 leading-relaxed">{feat.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 6-STEP CONTRACT WIZARD ARCHITECTURE */}
        <section className="max-w-5xl mx-auto px-6 py-12">
          <div className="bg-white/90 backdrop-blur-md rounded-3xl p-8 md:p-12 border border-gray-200 shadow-xl">
            <div className="max-w-3xl mx-auto text-center mb-10">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full">
                Contract Creation Flow
              </span>
              <h2 className="text-3xl md:text-4xl font-black text-black tracking-tight mt-4 mb-3">
                The 6-Step Guided Contract Wizard
              </h2>
              <p className="text-sm text-gray-600">
                Eliminate ambiguity and legal gaps in under 5 minutes without needing a lawyer.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {wizardSteps.map((step, idx) => (
                <div key={idx} className="bg-gray-50/80 border border-gray-200/80 p-6 rounded-2xl flex gap-4">
                  <span className="text-2xl font-black text-emerald-600 shrink-0 font-mono">
                    {step.number}
                  </span>
                  <div>
                    <h3 className="font-bold text-black text-base mb-1">{step.title}</h3>
                    <p className="text-xs text-gray-600 leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 27 JURISDICTION GLOBAL COMPLIANCE ENGINE */}
        <section className="max-w-6xl mx-auto px-6 py-12">
          <div className="bg-gradient-to-br from-slate-900 via-gray-900 to-black text-white p-8 md:p-12 rounded-3xl shadow-2xl border border-gray-800">
            <div className="max-w-3xl mx-auto text-center mb-10">
              <span className="text-xs font-black uppercase tracking-wider text-blue-400 bg-blue-950 border border-blue-800 px-3.5 py-1 rounded-full">
                Multi-Jurisdiction Compliance Engine
              </span>
              <h2 className="text-3xl md:text-4xl font-black tracking-tight mt-4 mb-3">
                Supported Across 27 Countries Worldwide
              </h2>
              <p className="text-sm text-gray-300 leading-relaxed">
                SignCollab automatically binds appropriate governing law, dispute resolution clauses, statutory tax notes, and electronic signature compliance frameworks based on selected country jurisdiction.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {regions.map((r, idx) => (
                <div key={idx} className="bg-white/5 border border-white/10 p-5 rounded-2xl">
                  <h3 className="font-bold text-emerald-400 text-sm mb-2 uppercase tracking-wide">
                    {r.name}
                  </h3>
                  <p className="text-xs text-gray-300 leading-relaxed">
                    {r.countries}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* LOCAL VERIFICATION & AUDIT CERTIFICATE SECURITY */}
        <section className="max-w-5xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Local Browser Verification */}
          <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-200 flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-rose-700 bg-rose-100 px-3 py-1 rounded-full mb-4 inline-block">
                Privacy Protection
              </span>
              <h3 className="text-2xl font-bold text-black mb-3">
                Local Client-Side Document Verification
              </h3>
              <p className="text-xs md:text-sm text-gray-600 leading-relaxed mb-4">
                Our verification tool running at <code className="bg-gray-100 px-1.5 py-0.5 rounded text-rose-700 font-mono">/verify</code> calculates the SHA-256 hash locally in your web browser using Web Crypto APIs.
              </p>
              <ul className="space-y-2 text-xs text-gray-700 font-medium">
                <li className="flex items-center gap-2">
                  <span className="text-rose-600 font-bold">✓</span> Document contents are never uploaded over the wire during hash checks.
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-rose-600 font-bold">✓</span> Instant validation against stored cryptographic transaction ledger.
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-rose-600 font-bold">✓</span> Flag tampered documents instantly if a single character is modified.
                </li>
              </ul>
            </div>
            <div className="mt-6 pt-4 border-t border-gray-100">
              <Link href="/verify" className="text-xs font-bold text-rose-700 hover:underline flex items-center gap-1">
                Try Document Verification Tool ➔
              </Link>
            </div>
          </div>

          {/* Audit Certificate Contents */}
          <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-200 flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full mb-4 inline-block">
                Proof Certificate
              </span>
              <h3 className="text-2xl font-bold text-black mb-3">
                SHA-256 Audit Trail Certificate PDF
              </h3>
              <p className="text-xs md:text-sm text-gray-600 leading-relaxed mb-4">
                Every completed contract outputs an official Audit Certificate detailing complete execution provenance:
              </p>
              <ul className="space-y-2 text-xs text-gray-700 font-medium">
                <li className="flex items-center gap-2">
                  <span className="text-emerald-600 font-bold">✓</span> SHA-256 master contract checksum fingerprint.
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-600 font-bold">✓</span> OTP verified email addresses &amp; mobile numbers.
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-600 font-bold">✓</span> Signatory job titles, IP addresses &amp; device user-agents.
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-600 font-bold">✓</span> Microsecond-accurate UTC timestamps for all actions.
                </li>
              </ul>
            </div>
            <div className="mt-6 pt-4 border-t border-gray-100">
              <Link href="/instant" className="text-xs font-bold text-emerald-800 hover:underline flex items-center gap-1">
                Generate Instant Contract PDF ➔
              </Link>
            </div>
          </div>
        </section>

        {/* CALL TO ACTION BANNER */}
        <section className="max-w-4xl mx-auto px-6 py-12 text-center">
          <div className="bg-black text-white p-8 md:p-12 rounded-3xl shadow-2xl relative overflow-hidden">
            <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
            <span className="inline-block text-xs font-black uppercase tracking-wider text-emerald-400 bg-emerald-950 border border-emerald-800 px-3 py-1 rounded-full mb-4">
              Get Started Free
            </span>
            <h3 className="text-2xl md:text-4xl font-black tracking-tight mb-4">
              Ready to Secure Your Next Commercial Collaboration?
            </h3>
            <p className="text-sm md:text-base text-gray-300 max-w-xl mx-auto leading-relaxed mb-8">
              Generate a bilaterally signed digital agreement in minutes. No credit card or mandatory account creation required.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/instant"
                className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-sm transition-all shadow-lg hover:shadow-emerald-500/20"
              >
                Create Instant Contract
              </Link>
              <Link
                href="/about"
                className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm transition-all border border-white/20"
              >
                Read About SignCollab
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <PublicFooter />
    </div>
  );
}
