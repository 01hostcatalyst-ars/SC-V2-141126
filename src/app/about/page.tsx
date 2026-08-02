import React from "react";
import Link from "next/link";
import Image from "next/image";
import Script from "next/script";
import { getCompanyConfig } from "@/lib/config";
import type { Metadata } from "next";

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.signcollab.com";

export const metadata: Metadata = {
  title: "About Us — Building Better Collaborations | SignCollab",
  description:
    "Learn about SignCollab's platform, mission, values, and founder Muhammad Arsalan. We empower brands, agencies, and creators with clear, secure, and legally reliable digital agreements.",
  alternates: {
    canonical: "/about",
  },
  openGraph: {
    title: "About SignCollab — Building Better Collaborations",
    description:
      "SignCollab is a collaboration agreement platform built for brands, agencies, and creators. Founded by Muhammad Arsalan to simplify contracts and build trusted partnerships.",
    url: `${baseUrl}/about`,
    type: "website",
    images: [
      {
        url: `${baseUrl}/founder.jpeg`,
        width: 800,
        height: 800,
        alt: "Muhammad Arsalan - Founder of SignCollab",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "About SignCollab — Platform Overview & Founder Story",
    description:
      "SignCollab provides digital contract infrastructure for brands, agencies, and creators. Founded by Muhammad Arsalan.",
    images: [`${baseUrl}/founder.jpeg`],
  },
};

export default function AboutPage() {
  const company = getCompanyConfig();

  const aboutJsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${baseUrl}/about`,
        "name": "About SignCollab",
        "description":
          "SignCollab is a collaboration agreement platform built for brands, agencies, and creators.",
        "url": `${baseUrl}/about`,
        "isPartOf": { "@id": `${baseUrl}/#website` },
        "about": { "@id": `${baseUrl}/#organization` },
        "breadcrumb": { "@id": `${baseUrl}/#breadcrumb` },
        "inLanguage": "en-US",
      },
      {
        "@type": "AboutPage",
        "@id": `${baseUrl}/about/#aboutpage`,
        "name": "About SignCollab & Founder Muhammad Arsalan",
        "mainEntity": {
          "@type": "Organization",
          "name": company.name || "SignCollab",
          "url": baseUrl,
          "logo": `${baseUrl}/icon.png`,
          "foundingDate": "2024",
          "founder": {
            "@type": "Person",
            "name": "Muhammad Arsalan",
            "jobTitle": "Founder & CEO",
            "url": "https://www.linkedin.com/in/arsalananis/",
            "sameAs": ["https://www.linkedin.com/in/arsalananis/"],
            "image": `${baseUrl}/founder.jpeg`,
            "description": "Technology entrepreneur, SaaS builder, and marketing strategist with over 10 years of experience in software development, digital marketing, eCommerce, and business automation."
          }
        }
      }
    ],
  };

  const workflowHighlights = [
    { title: "Campaign Deliverables", desc: "Detailed format specifications (Reels, Posts, Shorts, YouTube videos)." },
    { title: "Publishing Requirements", desc: "Posting schedules, tagging instructions, and deeming windows." },
    { title: "Commercial Usage Rights", desc: "Exclusivity periods, organic vs paid rights, and ad boosting terms." },
    { title: "Payment Terms", desc: "Milestones, deposit rules, payout triggers, and currency terms." },
    { title: "Revisions & Timelines", desc: "Turnaround times, deeming approval rules, and revision caps." },
    { title: "Mutual Responsibilities", desc: "Clear bilateral obligations, brand guidelines, and compliance standards." }
  ];

  return (
    <div className="min-h-screen bg-theme-gradient flex flex-col relative overflow-hidden">
      {/* Schema.org Structured Data */}
      <Script
        id="about-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutJsonLd) }}
      />

      {/* Ambient background glow elements */}
      <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[1000px] h-[500px] rounded-full ambient-glow-purple pointer-events-none z-0 opacity-40 blur-3xl" />
      <div className="absolute top-[30%] left-[-10%] w-[600px] h-[600px] rounded-full ambient-glow-blue pointer-events-none z-0 opacity-30 blur-3xl" />

      {/* Navigation Header */}
      <header className="w-full border-b border-gray-200/80 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="font-black text-xl tracking-tight text-black uppercase">
              {company.name}
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 uppercase tracking-wide">
              About Us
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-gray-700">
            <Link href="/" className="hover:text-black transition-colors">
              Home
            </Link>
            <Link href="/about" className="text-black font-bold border-b-2 border-black pb-0.5">
              About Us
            </Link>
            <Link href="/vision" className="hover:text-black transition-colors">
              Vision &amp; Mission
            </Link>
            <Link href="/features" className="hover:text-black transition-colors">
              Features
            </Link>
            <Link href="/knowledge" className="hover:text-black transition-colors">
              Academy
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/instant"
              className="px-4 py-2 text-xs font-bold rounded-lg bg-black text-white hover:bg-gray-800 transition-all shadow-sm"
            >
              Create Free Contract
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 z-10">
        {/* HERO SECTION */}
        <section className="max-w-4xl mx-auto px-6 pt-16 pb-12 text-center">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold bg-emerald-100/90 text-emerald-900 border border-emerald-300 mb-6 shadow-sm">
            About SignCollab • Building Better Collaborations
          </span>
          <h1 className="text-4xl md:text-6xl font-black text-black leading-tight tracking-tight mb-6">
            About <span className="text-accent-gradient">SignCollab</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-800 font-medium leading-relaxed max-w-3xl mx-auto mb-8 bg-white/60 backdrop-blur-md p-6 rounded-2xl border border-gray-200/80 shadow-sm">
            SignCollab is a collaboration agreement platform built for brands, agencies, and creators.
          </p>

          <div className="text-sm md:text-base text-gray-600 leading-relaxed max-w-3xl mx-auto space-y-4 text-left bg-white/40 backdrop-blur-sm p-6 md:p-8 rounded-2xl border border-gray-200/60 shadow-sm">
            <p>
              We help organizations create clear agreements, collect secure electronic signatures, and maintain organized records of every collaboration—making it easier to establish expectations before work begins.
            </p>
            <p className="font-semibold text-gray-900">
              Whether you&apos;re managing a single creator partnership or coordinating campaigns across multiple stakeholders, SignCollab provides the structure needed to keep every collaboration clear, professional, and accountable.
            </p>
          </div>
        </section>

        {/* FOUNDER SPOTLIGHT SECTION */}
        <section className="max-w-5xl mx-auto px-6 py-10">
          <div className="bg-gradient-to-br from-slate-900 via-gray-900 to-black text-white rounded-3xl p-8 md:p-12 shadow-2xl border border-gray-800 relative overflow-hidden">
            {/* Glow accent */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

            <span className="inline-block text-xs font-black uppercase tracking-wider text-emerald-400 bg-emerald-950/80 border border-emerald-800 px-3.5 py-1 rounded-full mb-8">
              Our Founder
            </span>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Photo & Badge (Column 1-5) */}
              <div className="lg:col-span-5 flex flex-col items-center text-center">
                <div className="relative w-48 h-48 md:w-56 md:h-56 rounded-2xl overflow-hidden border-4 border-emerald-500/30 shadow-2xl mb-4 group transition-transform hover:scale-[1.02]">
                  <Image
                    src="/founder.jpeg"
                    alt="Muhammad Arsalan — Founder of SignCollab"
                    fill
                    className="object-cover object-center"
                    priority
                  />
                </div>
                <h2 className="text-2xl font-black text-white tracking-tight">
                  Muhammad Arsalan
                </h2>
                <p className="text-emerald-400 text-sm font-bold mt-1">
                  Founder, SignCollab
                </p>

                {/* LinkedIn Link */}
                <a
                  href="https://www.linkedin.com/in/arsalananis/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-all shadow-md hover:shadow-blue-500/20"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.25V10.9H6.46M7.86 6.7a1.63 1.63 0 1 0 0 3.26 1.63 1.63 0 0 0 0-3.26Z" />
                  </svg>
                  Connect on LinkedIn
                </a>
              </div>

              {/* Founder Story & Bio (Column 6-12) */}
              <div className="lg:col-span-7 space-y-4 text-gray-300 text-sm md:text-base leading-relaxed border-t lg:border-t-0 lg:border-l border-gray-800 pt-6 lg:pt-0 lg:pl-8">
                <p className="font-semibold text-white text-base md:text-lg leading-snug">
                  Technology entrepreneur, SaaS builder, and marketing strategist with over 10 years of experience in software development, digital marketing, eCommerce, and business automation.
                </p>
                <p>
                  After working with businesses, agencies, and marketing teams, Muhammad recognized a recurring challenge: professional collaborations were often managed through scattered conversations, generic contracts, and disconnected tools.
                </p>
                <p>
                  That experience inspired the creation of SignCollab—a platform purpose-built to help brands, agencies, and creators establish clear agreements, collect secure electronic signatures, and collaborate with confidence.
                </p>
                <p className="text-xs md:text-sm text-emerald-200/90 pt-2 italic">
                  Today, he continues to lead SignCollab&apos;s product vision while working closely with contributors, industry professionals, and early adopters to build a platform shaped by real-world collaboration needs.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* WHY SIGNCOLLAB EXISTS & BUILT FOR MODERN COLLABORATION */}
        <section className="max-w-5xl mx-auto px-6 py-10 space-y-8">
          {/* Why SignCollab Exists */}
          <div className="bg-white/90 backdrop-blur-md rounded-3xl p-8 md:p-12 border border-gray-200 shadow-xl">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-700 bg-rose-100 px-3 py-1 rounded-full">
              Why SignCollab Exists
            </span>
            <h2 className="text-2xl md:text-4xl font-black text-black tracking-tight mt-4 mb-4">
              Providing a Better Foundation for Modern Partnerships
            </h2>

            <div className="text-gray-700 text-sm md:text-base leading-relaxed space-y-4">
              <p>
                The creator economy has transformed the way businesses and creative professionals work together. Campaigns move quickly. Teams collaborate across different cities and countries. Partnerships often begin through emails, social media, or messaging apps.
              </p>
              <p>
                Yet many collaborations still rely on scattered conversations, generic document templates, or verbal agreements.
              </p>
              <p>
                Important details—such as deliverables, timelines, content usage rights, revisions, payment terms, and responsibilities—can easily become unclear when information is spread across multiple platforms. These challenges create unnecessary misunderstandings, delays, and disputes.
              </p>
              <div className="bg-emerald-50 border border-emerald-200 p-5 rounded-2xl font-semibold text-emerald-950 text-sm md:text-base mt-4">
                SignCollab was created to provide a better foundation for professional collaborations—one where expectations are clearly documented, agreements are easy to sign, and every party has confidence in what has been agreed.
              </div>
            </div>
          </div>

          {/* Built for Modern Collaboration */}
          <div className="bg-white/90 backdrop-blur-md rounded-3xl p-8 md:p-12 border border-gray-200 shadow-xl">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-100 px-3 py-1 rounded-full">
              Built for Modern Collaboration
            </span>
            <h2 className="text-2xl md:text-4xl font-black text-black tracking-tight mt-4 mb-4">
              Designed Around Real Creator &amp; Brand Workflows
            </h2>

            <p className="text-gray-700 text-sm md:text-base leading-relaxed mb-6">
              Unlike general-purpose document signing platforms, SignCollab is designed around the real workflows of brands, agencies, and creators. Our platform helps teams document the details that matter most:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {workflowHighlights.map((w, idx) => (
                <div key={idx} className="bg-gray-50 border border-gray-200 p-4 rounded-xl">
                  <h3 className="font-bold text-black text-sm mb-1">{w.title}</h3>
                  <p className="text-xs text-gray-600">{w.desc}</p>
                </div>
              ))}
            </div>

            <p className="text-sm font-semibold text-gray-800 bg-blue-50/60 p-4 rounded-xl border border-blue-100">
              By transforming conversations into structured agreements, SignCollab helps reduce uncertainty and allows teams to focus on building successful partnerships.
            </p>
          </div>
        </section>

        {/* WHAT WE STAND FOR */}
        <section className="max-w-4xl mx-auto px-6 py-10 text-center">
          <div className="bg-gradient-to-br from-emerald-600 to-teal-800 text-white p-8 md:p-12 rounded-3xl shadow-xl">
            <span className="text-xs font-black uppercase tracking-wider bg-white/20 px-3 py-1 rounded-full">
              What We Stand For
            </span>
            <h2 className="text-2xl md:text-4xl font-black tracking-tight mt-4 mb-4">
              &quot;Professional collaborations should be built on clarity, transparency, and trust.&quot;
            </h2>
            <p className="text-sm md:text-base text-emerald-100 leading-relaxed max-w-2xl mx-auto">
              We believe agreements should be easy to understand, simple to manage, and accessible to everyone involved. When expectations are clearly documented, partnerships become stronger, communication improves, and businesses can move forward with confidence.
            </p>
          </div>
        </section>

        {/* BUILT THROUGH COLLABORATION */}
        <section className="max-w-5xl mx-auto px-6 py-10">
          <div className="bg-white/90 backdrop-blur-md rounded-3xl p-8 md:p-12 border border-gray-200 shadow-xl">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-700 bg-purple-100 px-3 py-1 rounded-full">
              Community &amp; Evolution
            </span>
            <h2 className="text-2xl md:text-4xl font-black text-black tracking-tight mt-4 mb-4">
              Built Through Collaboration
            </h2>

            <div className="text-gray-700 text-sm md:text-base leading-relaxed space-y-4">
              <p>
                Although SignCollab is founder-led, it has never been built alone.
              </p>
              <p>
                The platform continues to evolve through the ideas, feedback, testing, and expertise of contributors from different backgrounds and regions, including professionals in marketing, software engineering, design, business operations, legal review, and the creator economy.
              </p>
              <p>
                Every conversation with agencies, brands, creators, and industry professionals helps shape the product, ensuring that SignCollab solves real-world collaboration challenges rather than theoretical ones.
              </p>
              <p className="font-semibold text-gray-900 border-l-4 border-purple-600 pl-4 py-1 italic">
                As we grow, we remain committed to listening, improving, and building alongside the community we serve.
              </p>
            </div>
          </div>
        </section>

        {/* LOOKING AHEAD & CLOSING COMMITMENT */}
        <section className="max-w-4xl mx-auto px-6 py-12 text-center">
          <div className="bg-white/60 backdrop-blur-md p-8 md:p-10 rounded-3xl border border-gray-200/80 mb-10 shadow-sm">
            <h2 className="text-2xl md:text-3xl font-black text-black tracking-tight mb-4">
              Looking Ahead
            </h2>
            <p className="text-sm md:text-base text-gray-700 leading-relaxed max-w-2xl mx-auto mb-4">
              We&apos;re building more than an electronic signature platform. Our goal is to create the collaboration infrastructure that modern brands, agencies, and creators can rely on—from agreement creation and electronic signatures to organized records and long-term partnership management.
            </p>
            <p className="text-xs md:text-sm text-gray-600 leading-relaxed max-w-2xl mx-auto">
              As digital collaborations continue to expand across industries and borders, SignCollab will continue building tools that make professional partnerships simpler, more transparent, and more dependable.
            </p>
          </div>

          {/* COMMITMENT BANNER */}
          <div className="bg-black text-white p-8 md:p-12 rounded-3xl shadow-2xl relative overflow-hidden">
            <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
            <span className="inline-block text-xs font-black uppercase tracking-wider text-emerald-400 bg-emerald-950 border border-emerald-800 px-3 py-1 rounded-full mb-4">
              Our Commitment
            </span>
            <h3 className="text-2xl md:text-4xl font-black tracking-tight mb-4">
              Better Agreements. Better Collaborations.
            </h3>
            <p className="text-sm md:text-base text-gray-300 max-w-xl mx-auto leading-relaxed mb-8">
              Every feature we build is guided by one principle: <strong>Better agreements create better collaborations.</strong> That&apos;s our commitment to every brand, agency, and creator who chooses SignCollab.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/instant"
                className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-sm transition-all shadow-lg hover:shadow-emerald-500/20"
              >
                Create Instant Contract
              </Link>
              <Link
                href="/vision"
                className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm transition-all border border-white/20"
              >
                Read Vision &amp; Mission
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-gray-200/80 bg-white/80 backdrop-blur-md py-8 px-6 z-10 mt-auto">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col items-center md:items-start gap-1 text-center md:text-left">
            <span className="font-bold text-sm tracking-tight text-black uppercase">
              {company.name}
            </span>
            <p className="text-xs text-gray-500 font-medium">
              Bilateral Agreement Proof-Layer &amp; Tamper-Proof Audit Trails
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-semibold text-gray-600">
            <Link href="/" className="hover:text-black transition-colors">
              Home
            </Link>
            <Link href="/about" className="text-black font-bold hover:underline">
              About Us
            </Link>
            <Link href="/vision" className="hover:text-black transition-colors">
              Vision &amp; Mission
            </Link>
            <Link href="/knowledge" className="hover:text-black transition-colors">
              Knowledge Base
            </Link>
            <Link href="/survey" className="hover:text-emerald-600 transition-colors text-emerald-700 font-bold">
              Pricing Index Survey
            </Link>
            <Link href="/features" className="hover:text-black transition-colors">
              Features
            </Link>
            <Link href="/verify" className="hover:text-black transition-colors">
              Verify Document
            </Link>
            <Link href="/terms" className="hover:text-black transition-colors">
              Terms &amp; Privacy
            </Link>
            <Link href="/contact" className="hover:text-black transition-colors font-bold text-gray-800">
              Contact &amp; Support
            </Link>
          </div>
        </div>

        <div className="max-w-6xl mx-auto border-t border-gray-100 mt-6 pt-4 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-400 gap-2 text-center sm:text-left">
          <span>
            © {new Date().getFullYear()} {company.name}. All rights reserved.
          </span>
          <span className="text-gray-400 font-medium">
            {company.supportEmail}
          </span>
        </div>
      </footer>
    </div>
  );
}
