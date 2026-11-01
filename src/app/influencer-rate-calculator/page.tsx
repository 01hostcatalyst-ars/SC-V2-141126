import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { InfluencerRadarDashboard } from "@/components/calculator/InfluencerRadarDashboard";
import {
  ChevronRight,
  Radio,
  Tag,
  Sparkles,
  Globe,
  HelpCircle,
  ShieldCheck,
  Layers,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Influencer Rate Calculator – Creator Pricing & Intelligence | SignCollab",
  description:
    "Calculate data-informed sponsorship rates, creator intelligence, audience insights, content analysis, and cross-platform campaign pricing across Instagram, TikTok, and YouTube.",
  alternates: {
    canonical: "https://www.signcollab.com/influencer-rate-calculator",
  },
  openGraph: {
    title: "Influencer Rate Calculator – Creator Pricing & Intelligence | SignCollab",
    description:
      "Calculate data-informed sponsorship rates, creator intelligence, audience insights, content analysis, and cross-platform campaign pricing across Instagram, TikTok, and YouTube.",
    url: "https://www.signcollab.com/influencer-rate-calculator",
    siteName: "SignCollab",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Influencer Rate Calculator – Creator Pricing & Intelligence | SignCollab",
    description:
      "Calculate data-informed sponsorship rates, creator intelligence, audience insights, content analysis, and cross-platform campaign pricing across Instagram, TikTok, and YouTube.",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": "https://www.signcollab.com/influencer-rate-calculator#webpage",
      "url": "https://www.signcollab.com/influencer-rate-calculator",
      "name": "Influencer Rate Calculator – Creator Pricing & Intelligence | SignCollab",
      "description":
        "Calculate data-informed sponsorship rates, creator intelligence, audience insights, content analysis, and cross-platform campaign pricing across Instagram, TikTok, and YouTube.",
      "inLanguage": "en-US",
      "isPartOf": {
        "@type": "WebSite",
        "@id": "https://www.signcollab.com/#website",
        "name": "SignCollab",
        "url": "https://www.signcollab.com",
      },
      "breadcrumb": {
        "@id": "https://www.signcollab.com/influencer-rate-calculator#breadcrumbs",
      },
      "mainEntity": {
        "@id": "https://www.signcollab.com/influencer-rate-calculator#webapp",
      },
      "publisher": {
        "@id": "https://www.signcollab.com/#organization",
      },
    },
    {
      "@type": "WebApplication",
      "@id": "https://www.signcollab.com/influencer-rate-calculator#webapp",
      "name": "SignCollab Influencer Rate Radar",
      "url": "https://www.signcollab.com/influencer-rate-calculator",
      "applicationCategory": "BusinessApplication",
      "operatingSystem": "All",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD",
      },
      "featureList": [
        "Cross-platform profile scanning (Instagram, YouTube, TikTok)",
        "16-knot empirical cubic Bézier rate valuation",
        "19-point AI creator intelligence dossier",
        "17-region purchasing power parity (PPP) calibration",
        "Omnichannel multi-platform bundle discounting",
        "1-click legal contract export",
      ],
    },
    {
      "@type": "FAQPage",
      "@id": "https://www.signcollab.com/influencer-rate-calculator#faq",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "What is the SignCollab Influencer Rate Calculator & Creator Intelligence Engine?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "SignCollab estimates sponsorship rates with a calculation engine calibrated using creator surveys, pricing research, case studies, agency deal history, and contract data. AI analyzes supplied creator data to produce audience and content insights; it does not calculate prices.",
          },
        },
        {
          "@type": "Question",
          "name": "How does the SignCollab 16-Knot Quantitative Valuation Matrix calculate creator rates?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Our 16-knot pricing engine uses platform metrics, content formats, niche, and the selected pricing market to calculate estimated rate ranges. Campaign packages also account for deliverables and commercial scope. Benchmarks are calibrated using creator surveys, pricing research, case studies, agency deal history, and contract data. AI provides profile insights and classifications; it does not calculate prices. Estimates support negotiation and are not confirmed creator quotes.",
          },
        },
        {
          "@type": "Question",
          "name": "How does automatic cross-platform creator discovery work?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "When you enter a single creator handle or profile link from Instagram, YouTube, or TikTok, the engine scans public profile footprints and bio links to automatically discover and connect the creator's secondary channels into a unified report.",
          },
        },
        {
          "@type": "Question",
          "name": "What deliverable formats and rates are calculated?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "The calculator produces estimated market rate ranges for Instagram Reels, Feed Carousels, Static Posts, and Story Sets; YouTube Dedicated Videos, 60s Integrated Sponsorships, and Shorts; TikTok Videos; and multi-platform campaign packages.",
          },
        },
        {
          "@type": "Question",
          "name": "What is included in the 19-point Creator Intelligence Dossier?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "The dossier provides an AI-synthesized analysis structured around four key pillars: Audience Demographics & Purchasing Intent, Content DNA & Production Standards, Brand Fit & Sponsorship Safety, and Strategic Strengths with partnership recommendations.",
          },
        },
        {
          "@type": "Question",
          "name": "Does the calculator support international currencies and regional pricing?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes. The calculator applies regional economic purchasing-power adjustments across 17 regional markets, showing estimated pricing in local currencies (including PKR, USD, GBP, EUR, INR, AED, SAR, CAD, AUD) alongside USD conversions.",
          },
        },
      ],
    },
    {
      "@type": "BreadcrumbList",
      "@id": "https://www.signcollab.com/influencer-rate-calculator#breadcrumbs",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": "https://www.signcollab.com",
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "Influencer Rate Calculator",
          "item": "https://www.signcollab.com/influencer-rate-calculator",
        },
      ],
    },
    {
      "@type": "Organization",
      "@id": "https://www.signcollab.com/#organization",
      "name": "SignCollab",
      "url": "https://www.signcollab.com",
      "logo": "https://www.signcollab.com/icon.png",
    },
  ],
};

export default function InfluencerRateCalculatorPage() {
  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 font-sans text-zinc-900 selection:bg-pink-500 selection:text-white relative overflow-x-clip antialiased">
      {/* Structured JSON-LD for Search Engines & AI Crawlers */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <PublicHeader activeRoute="/influencer-rate-calculator" />

      <main className="calculator-route-main flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-10 relative z-10">
        {/* Breadcrumb Trail */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs font-medium text-zinc-500 mb-6">
          <Link href="/" className="hover:text-zinc-900 transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
          <span className="text-zinc-900 font-semibold">Influencer Rate Calculator</span>
        </nav>

        {/* Master Staged Interactive Radar Dashboard */}
        <InfluencerRadarDashboard />

        {/* Option A: Below-the-Fold Crawlable Methodology & FAQs Section */}
        <section id="calculator-methodology" className="calculator-methodology mt-20 sm:mt-24 pt-12 border-t border-zinc-200/90 space-y-12">
          <div className="max-w-3xl text-left space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200/80">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>How our estimates work</span>
            </span>
            <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-zinc-900 font-sans">
              How we build your rate report
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500 leading-relaxed max-w-2xl">
              SignCollab combines cross-platform profile scanning, empirical engagement benchmarking, and AI creator intelligence to establish defensible, data-informed sponsorship rates for brands and talent.
            </p>
          </div>

          {/* 4 Pillars Overview Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-left">
            <div className="surface-card p-5 rounded-2xl border border-zinc-200/90 shadow-sm space-y-2 hover:border-zinc-300 transition-all">
              <div className="flex items-center gap-2 text-zinc-900 font-semibold text-sm">
                <div className="w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-emerald-700">
                  <Radio className="w-4 h-4" />
                </div>
                <span>1. Automatic Profile Discovery</span>
              </div>
              <p className="text-zinc-500 leading-relaxed pl-9">
                Connects public footprints across Instagram, YouTube, and TikTok from a single link to provide a report with separate platform metrics and estimated rates.
              </p>
            </div>

            <div className="surface-card p-5 rounded-2xl border border-zinc-200/90 shadow-sm space-y-2 hover:border-zinc-300 transition-all">
              <div className="flex items-center gap-2 text-zinc-900 font-semibold text-sm">
                <div className="w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-emerald-700">
                  <Tag className="w-4 h-4" />
                </div>
                <span>2. Itemized Deliverable Pricing</span>
              </div>
              <p className="text-zinc-500 leading-relaxed pl-9">
                Calculates estimated rate ranges for individual formats (Reels, Static Posts, Dedicated Videos, Shorts, TikToks) and multi-channel campaign packages.
              </p>
            </div>

            <div className="surface-card p-5 rounded-2xl border border-zinc-200/90 shadow-sm space-y-2 hover:border-zinc-300 transition-all">
              <div className="flex items-center gap-2 text-zinc-900 font-semibold text-sm">
                <div className="w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-emerald-700">
                  <Sparkles className="w-4 h-4" />
                </div>
                <span>3. Audience & content insights</span>
              </div>
              <p className="text-zinc-500 leading-relaxed pl-9">
                Synthesizes audience demographics, commercial purchasing intent, content DNA, brand safety ratings, and actionable campaign angles.
              </p>
            </div>

            <div className="surface-card p-5 rounded-2xl border border-zinc-200/90 shadow-sm space-y-2 hover:border-zinc-300 transition-all">
              <div className="flex items-center gap-2 text-zinc-900 font-semibold text-sm">
                <div className="w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-emerald-700">
                  <Globe className="w-4 h-4" />
                </div>
                <span>4. Market & currency settings</span>
              </div>
              <p className="text-zinc-500 leading-relaxed pl-9">
                Applies purchasing-power parity adjustments across 17 regional markets with native currency rates alongside USD equivalents.
              </p>
            </div>
          </div>

          {/* Frequently Asked Questions Accordion */}
          <div className="space-y-4 pt-4 border-t border-zinc-200/70 text-left">
            <div className="flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-zinc-500" />
              <h3 className="text-base font-semibold text-zinc-900 font-sans">
                Frequently Asked Questions
              </h3>
            </div>

            <div className="space-y-3">
              <details className="group surface-card p-4 rounded-xl border border-zinc-200/90 shadow-2xs open:border-zinc-300 transition-all">
                <summary className="font-medium text-zinc-900 text-xs sm:text-sm cursor-pointer list-none flex items-center justify-between">
                  <span>What is the SignCollab Influencer Rate Calculator &amp; Creator Intelligence Engine?</span>
                  <span className="text-zinc-400 group-open:rotate-180 transition-transform text-xs">▼</span>
                </summary>
                <p className="text-xs text-zinc-500 leading-relaxed mt-2.5 pt-2 border-t border-zinc-100">
                  SignCollab estimates sponsorship rates with a calculation engine calibrated using creator surveys, pricing research, case studies, agency deal history, and contract data. AI analyzes supplied creator data to produce audience and content insights; it does not calculate prices.
                </p>
              </details>

              <details className="group surface-card p-4 sm:p-5 rounded-xl border border-zinc-200/90 shadow-2xs open:border-zinc-300 transition-all">
                <summary className="font-medium text-zinc-900 text-xs sm:text-sm cursor-pointer list-none flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>How does the SignCollab 16-Knot Quantitative Valuation Matrix calculate creator rates?</span>
                  </span>
                  <span className="text-zinc-400 group-open:rotate-180 transition-transform text-xs">▼</span>
                </summary>
                <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed mt-3 pt-3 border-t border-zinc-100">Our 16-knot pricing engine uses platform metrics, content formats, niche, and the selected pricing market to calculate estimated rate ranges. Campaign packages also account for deliverables and commercial scope. Benchmarks are calibrated using creator surveys, pricing research, case studies, agency deal history, and contract data. AI provides profile insights and classifications; it does not calculate prices. Estimates support negotiation and are not confirmed creator quotes.</p>
              </details>

              <details className="group surface-card p-4 rounded-xl border border-zinc-200/90 shadow-2xs open:border-zinc-300 transition-all">
                <summary className="font-medium text-zinc-900 text-xs sm:text-sm cursor-pointer list-none flex items-center justify-between">
                  <span>How does automatic cross-platform creator discovery work?</span>
                  <span className="text-zinc-400 group-open:rotate-180 transition-transform text-xs">▼</span>
                </summary>
                <p className="text-xs text-zinc-500 leading-relaxed mt-2.5 pt-2 border-t border-zinc-100">
                  When you enter a single creator handle or profile link from Instagram, YouTube, or TikTok, the engine scans public profile footprints and bio links to automatically discover and connect the creator&apos;s secondary channels into a unified report.
                </p>
              </details>

              <details className="group surface-card p-4 rounded-xl border border-zinc-200/90 shadow-2xs open:border-zinc-300 transition-all">
                <summary className="font-medium text-zinc-900 text-xs sm:text-sm cursor-pointer list-none flex items-center justify-between">
                  <span>What deliverable formats and rates are calculated?</span>
                  <span className="text-zinc-400 group-open:rotate-180 transition-transform text-xs">▼</span>
                </summary>
                <p className="text-xs text-zinc-500 leading-relaxed mt-2.5 pt-2 border-t border-zinc-100">
                  The calculator produces estimated market rate ranges for Instagram Reels, Feed Carousels, Static Posts, and Story Sets; YouTube Dedicated Videos, 60s Integrated Sponsorships, and Shorts; TikTok Videos; and multi-platform campaign packages.
                </p>
              </details>

              <details className="group surface-card p-4 rounded-xl border border-zinc-200/90 shadow-2xs open:border-zinc-300 transition-all">
                <summary className="font-medium text-zinc-900 text-xs sm:text-sm cursor-pointer list-none flex items-center justify-between">
                  <span>What is included in the 19-point Creator Intelligence Dossier?</span>
                  <span className="text-zinc-400 group-open:rotate-180 transition-transform text-xs">▼</span>
                </summary>
                <p className="text-xs text-zinc-500 leading-relaxed mt-2.5 pt-2 border-t border-zinc-100">
                  The dossier provides an AI-synthesized analysis structured around four key pillars: Audience Demographics &amp; Purchasing Intent, Content DNA &amp; Production Standards, Brand Fit &amp; Sponsorship Safety, and Strategic Strengths with partnership recommendations.
                </p>
              </details>

              <details className="group surface-card p-4 rounded-xl border border-zinc-200/90 shadow-2xs open:border-zinc-300 transition-all">
                <summary className="font-medium text-zinc-900 text-xs sm:text-sm cursor-pointer list-none flex items-center justify-between">
                  <span>Does the calculator support international currencies and regional pricing?</span>
                  <span className="text-zinc-400 group-open:rotate-180 transition-transform text-xs">▼</span>
                </summary>
                <p className="text-xs text-zinc-500 leading-relaxed mt-2.5 pt-2 border-t border-zinc-100">
                  Yes. The calculator applies regional economic purchasing-power adjustments across 17 regional markets, showing estimated pricing in local currencies (including PKR, USD, GBP, EUR, INR, AED, SAR, CAD, AUD) alongside USD conversions.
                </p>
              </details>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
