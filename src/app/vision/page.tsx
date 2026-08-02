import React from "react";
import Link from "next/link";
import Script from "next/script";
import { getCompanyConfig } from "@/lib/config";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";
import type { Metadata } from "next";

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.signcollab.com";

export const metadata: Metadata = {
  title: "Vision & Mission — Building Better Collaborations | SignCollab",
  description:
    "Discover SignCollab's vision and mission: building the trusted collaboration infrastructure for the global creator economy with simple, transparent, and legally reliable digital agreements.",
  alternates: {
    canonical: "/vision",
  },
  openGraph: {
    title: "Vision & Mission — Building Better Collaborations | SignCollab",
    description:
      "SignCollab exists to make professional collaborations simple, transparent, and trusted—helping brands, agencies, and creators build stronger partnerships through clear digital agreements.",
    url: `${baseUrl}/vision`,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Vision & Mission — SignCollab",
    description:
      "Building the trusted collaboration infrastructure for the global creator economy. Clear digital agreements for brands, agencies, and creators.",
  },
};

export default function VisionPage() {
  const company = getCompanyConfig();

  const visionJsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${baseUrl}/vision`,
        "name": "Vision & Mission — SignCollab",
        "description":
          "SignCollab exists to make professional collaborations simple, transparent, and trusted—helping brands, agencies, and creators build stronger partnerships through clear digital agreements.",
        "url": `${baseUrl}/vision`,
        "isPartOf": { "@id": `${baseUrl}/#website` },
        "about": { "@id": `${baseUrl}/#organization` },
        "breadcrumb": { "@id": `${baseUrl}/#breadcrumb` },
        "inLanguage": "en-US",
      },
      {
        "@type": "AboutPage",
        "@id": `${baseUrl}/vision/#aboutpage`,
        "name": "About SignCollab - Vision & Mission",
        "mainEntity": {
          "@type": "Organization",
          "name": company.name || "SignCollab",
          "url": baseUrl,
          "slogan": "Building Better Collaborations",
          "knowsAbout": [
            "Creator Contracts",
            "Electronic Signatures",
            "Influencer Marketing Agreements",
            "Bilateral Audit Trails",
            "Digital Contract Infrastructure"
          ]
        }
      }
    ],
  };

  const values = [
    {
      icon: (
        <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: "Clarity Before Commitment",
      subtitle: "Preventing misunderstandings before they become problems",
      description: "A successful collaboration starts with everyone understanding the exact same expectations. Clear agreements give all parties confidence from day one."
    },
    {
      icon: (
        <svg className="w-6 h-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      title: "Trust Through Transparency",
      subtitle: "Verifiable records over memory or screenshots",
      description: "Trust should never depend on fading chat logs or unverified screenshots. Every agreement provides a tamper-proof record of what was accepted, signed, and agreed upon."
    },
    {
      icon: (
        <svg className="w-6 h-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
        </svg>
      ),
      title: "Simplicity Matters",
      subtitle: "Understandable legal frameworks for everyone",
      description: "Legal agreements should be crystal clear to creators, brands, and managers alike—not just lawyers. We design every workflow to eliminate friction while preserving complete legal reliability."
    },
    {
      icon: (
        <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      title: "Collaboration Is a Partnership",
      subtitle: "Supporting balanced relationships with mutual respect",
      description: "Brands, agencies, and creators all contribute unique value. Our platform supports balanced, equitable relationships where responsibilities and protections are shared symmetrically."
    },
    {
      icon: (
        <svg className="w-6 h-6 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      ),
      title: "Security Is Fundamental",
      subtitle: "Protecting commercial agreements with enterprise care",
      description: "Professional contracts contain sensitive commercial data. Protecting documents, cryptographic signatures, and audit certificates is our foundational duty."
    }
  ];

  const missionPoints = [
    { title: "What will be delivered", desc: "Detailed deliverable counts, formats (Reels, Shorts, Posts), and platforms." },
    { title: "When it will be delivered", desc: "Clear deadlines, review cycles, and deemed approval windows." },
    { title: "How content can be used", desc: "Usage rights scope, ex-exclusivity periods, and ad boosting terms." },
    { title: "When payments are due", desc: "Payment triggers, deposit terms, and milestone disbursement rules." },
    { title: "What responsibilities each party accepts", desc: "Clear bilateral obligations, brand guidelines, and compliance promises." }
  ];

  const informalPitfalls = [
    "Missed deliverables & missed campaign launch dates",
    "Confusion over content usage rights & paid boosting",
    "Delayed payment terms & unverified payment status",
    "Unclear revision requests & scope creep",
    "Costly contract disputes without signed paper trails",
    "Lost documentation across scattered DMs and email threads"
  ];

  return (
    <div className="min-h-screen bg-theme-gradient flex flex-col relative overflow-hidden">
      {/* Schema.org Structured Data */}
      <Script
        id="vision-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(visionJsonLd) }}
      />

      {/* Ambient background glow elements */}
      <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[1000px] h-[500px] rounded-full ambient-glow-purple pointer-events-none z-0 opacity-40 blur-3xl" />
      <div className="absolute top-[30%] right-[-10%] w-[600px] h-[600px] rounded-full ambient-glow-blue pointer-events-none z-0 opacity-30 blur-3xl" />

      {/* Navigation Header */}
      <PublicHeader activeRoute="/vision" />

      {/* Main Content */}
      <main className="flex-1 z-10">
        {/* HERO SECTION */}
        <section className="max-w-4xl mx-auto px-6 pt-16 pb-12 text-center">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold bg-blue-100/90 text-blue-900 border border-blue-300 mb-6 shadow-sm">
            Vision &amp; Mission • Building Better Collaborations
          </span>
          <h1 className="text-4xl md:text-6xl font-black text-black leading-tight tracking-tight mb-6">
            Building Better <span className="text-accent-gradient">Collaborations</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-800 font-medium leading-relaxed max-w-3xl mx-auto mb-8 bg-white/60 backdrop-blur-md p-6 rounded-2xl border border-gray-200/80 shadow-sm">
            SignCollab exists to make professional collaborations simple, transparent, and trusted—helping brands, agencies, and creators build stronger partnerships through clear digital agreements.
          </p>

          <div className="text-sm md:text-base text-gray-600 leading-relaxed max-w-3xl mx-auto space-y-4 text-left bg-white/40 backdrop-blur-sm p-6 rounded-xl border border-gray-200/60">
            <p>
              The creator economy moves faster every year. Brands launch campaigns in days, agencies manage dozens of partnerships at once, and creators work with companies across cities, countries, and time zones.
            </p>
            <p>
              Yet many collaborations still begin with scattered messages, unclear expectations, and agreements that are difficult to track.
            </p>
            <p className="font-semibold text-gray-900">
              At SignCollab, we believe every professional collaboration deserves the same level of clarity, trust, and accountability—regardless of team size or campaign budget.
            </p>
          </div>
        </section>

        {/* VISION & MISSION DUAL CARDS */}
        <section className="max-w-5xl mx-auto px-6 py-10 grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Our Vision */}
          <div className="bg-gradient-to-br from-blue-900 to-indigo-950 text-white p-8 rounded-3xl shadow-xl flex flex-col justify-between border border-blue-800 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
              <svg className="w-40 h-40 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
            <div>
              <span className="inline-block text-xs font-black uppercase tracking-wider text-blue-300 bg-blue-800/60 px-3 py-1 rounded-full mb-4">
                Our Vision
              </span>
              <h2 className="text-2xl md:text-3xl font-bold mb-4">
                The Collaboration Infrastructure for the Global Creator Economy
              </h2>
              <p className="text-blue-100 text-sm md:text-base leading-relaxed mb-6">
                To become the trusted collaboration infrastructure for the global creator economy, where every partnership begins with a clear agreement and every commitment is transparent, secure, and verifiable.
              </p>
            </div>
            <p className="text-xs text-blue-200/80 border-t border-blue-800/80 pt-4 leading-relaxed italic">
              We envision a future where brands, agencies, and creators can work together with confidence instead of uncertainty—spending less time resolving disputes and more time building successful campaigns.
            </p>
          </div>

          {/* Our Mission */}
          <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-200/90 flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
              <svg className="w-40 h-40 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <span className="inline-block text-xs font-black uppercase tracking-wider text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full mb-4">
                Our Mission
              </span>
              <h2 className="text-2xl md:text-3xl font-bold text-black mb-4">
                Simple, Transparent &amp; Legally Reliable Agreements
              </h2>
              <p className="text-gray-700 text-sm md:text-base leading-relaxed mb-6">
                Our mission is to make professional collaborations simple, transparent, and legally reliable by providing agreements that are easy to create, easy to sign, and easy to manage.
              </p>
              
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">
                We build tools that help every participant understand exactly:
              </p>
              <ul className="space-y-2 mb-6">
                {missionPoints.map((point, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs md:text-sm text-gray-800 font-medium">
                    <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">✓</span>
                    <span><strong>{point.title}</strong> — <span className="text-gray-600">{point.desc}</span></span>
                  </li>
                ))}
              </ul>
            </div>
            <p className="text-xs text-gray-500 border-t border-gray-100 pt-4 font-semibold">
              When expectations are clear from the beginning, partnerships become stronger and campaigns become more successful.
            </p>
          </div>
        </section>

        {/* WHAT WE BELIEVE (5 CORE VALUES) */}
        <section className="max-w-6xl mx-auto px-6 py-12">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-black text-black tracking-tight mb-3">
              What We Believe
            </h2>
            <p className="text-sm text-gray-600">
              Five guiding principles that shape every contract wizard, signature flow, and audit trail we create.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {values.map((v, i) => (
              <div
                key={i}
                className="bg-white/80 backdrop-blur-md p-6 rounded-2xl border border-gray-200/80 shadow-sm hover:shadow-md transition-all hover:-translate-y-1 flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center mb-4 shadow-inner">
                    {v.icon}
                  </div>
                  <h3 className="text-lg font-bold text-black mb-1">{v.title}</h3>
                  <p className="text-xs font-semibold text-emerald-700 mb-3">{v.subtitle}</p>
                  <p className="text-xs text-gray-600 leading-relaxed">{v.description}</p>
                </div>
              </div>
            ))}

            {/* Extra summary card to complete 6-grid */}
            <div className="bg-gradient-to-br from-emerald-500 to-teal-700 text-white p-6 rounded-2xl shadow-sm flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider bg-white/20 px-2.5 py-1 rounded-full">
                  Our Core Metric
                </span>
                <h3 className="text-xl font-bold mt-4 mb-2">Better Agreements = Better Collaborations</h3>
                <p className="text-xs text-emerald-50 leading-relaxed">
                  Every feature we build is measured against a simple benchmark: does it reduce friction and build trust between creators and brands?
                </p>
              </div>
              <div className="pt-4 border-t border-white/20 text-xs font-medium text-emerald-100">
                SignCollab Proof Layer
              </div>
            </div>
          </div>
        </section>

        {/* WHY SIGNCOLLAB EXISTS */}
        <section className="max-w-5xl mx-auto px-6 py-12">
          <div className="bg-white/90 backdrop-blur-md rounded-3xl p-8 md:p-12 border border-gray-200 shadow-xl">
            <div className="max-w-3xl mx-auto">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-700 bg-rose-100 px-3 py-1 rounded-full">
                Why SignCollab Exists
              </span>
              <h2 className="text-3xl font-black text-black tracking-tight mt-4 mb-4">
                Replacing DM Promises With Professional Digital Proof
              </h2>
              <p className="text-sm md:text-base text-gray-700 leading-relaxed mb-6">
                Too many collaborations rely on direct messages, emails, spreadsheets, and verbal promises. These informal workflows often lead to avoidable friction:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
                {informalPitfalls.map((pitfall, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3 rounded-xl bg-rose-50/60 border border-rose-100 text-xs font-semibold text-rose-950">
                    <span className="w-5 h-5 rounded-full bg-rose-200 text-rose-800 flex items-center justify-center font-bold text-xs shrink-0">✕</span>
                    <span>{pitfall}</span>
                  </div>
                ))}
              </div>

              <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-200 text-center">
                <p className="text-sm md:text-base font-bold text-emerald-950">
                  SignCollab was created to give every collaboration a professional foundation without adding unnecessary complexity.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* LOOKING AHEAD & OUR PROMISE */}
        <section className="max-w-4xl mx-auto px-6 py-12 text-center">
          <div className="bg-white/60 backdrop-blur-md p-8 md:p-10 rounded-3xl border border-gray-200/80 mb-10 shadow-sm">
            <h2 className="text-2xl md:text-3xl font-black text-black tracking-tight mb-4">
              Looking Ahead
            </h2>
            <p className="text-sm md:text-base text-gray-700 leading-relaxed max-w-2xl mx-auto mb-4">
              Our goal is not simply to replace paper contracts. We are building a platform that supports the complete lifecycle of professional collaborations—from creating agreements and collecting signatures to maintaining organized records that teams can rely on as they grow.
            </p>
            <p className="text-xs md:text-sm text-gray-600 leading-relaxed max-w-2xl mx-auto">
              As the creator economy continues to expand worldwide, we want every collaboration—whether between a small creator and a local business or a global agency and an international brand—to begin with clarity, confidence, and trust.
            </p>
          </div>

          {/* OUR PROMISE BANNER */}
          <div className="bg-black text-white p-8 md:p-12 rounded-3xl shadow-2xl relative overflow-hidden">
            <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
            <span className="inline-block text-xs font-black uppercase tracking-wider text-emerald-400 bg-emerald-950 border border-emerald-800 px-3 py-1 rounded-full mb-4">
              Our Promise
            </span>
            <h3 className="text-2xl md:text-4xl font-black tracking-tight mb-4">
              &quot;Better agreements create better collaborations.&quot;
            </h3>
            <p className="text-sm md:text-base text-gray-300 max-w-xl mx-auto leading-relaxed mb-8">
              That&apos;s why we&apos;re committed to making professional agreements accessible, secure, and simple for brands, agencies, and creators everywhere.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/instant"
                className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-sm transition-all shadow-lg hover:shadow-emerald-500/20"
              >
                Create Instant Contract
              </Link>
              <Link
                href="/features"
                className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm transition-all border border-white/20"
              >
                Explore Features &amp; Security
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
