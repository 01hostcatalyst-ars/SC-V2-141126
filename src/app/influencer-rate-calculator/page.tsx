import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { InfluencerRadarDashboard } from "@/components/calculator/InfluencerRadarDashboard";

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
        "url": "https://www.signcollab.com"
      },
      "breadcrumb": {
        "@id": "https://www.signcollab.com/influencer-rate-calculator#breadcrumbs"
      },
      "mainEntity": {
        "@id": "https://www.signcollab.com/influencer-rate-calculator#webapp"
      },
      "publisher": {
        "@id": "https://www.signcollab.com/#organization"
      }
    },
    {
      "@type": "WebApplication",
      "@id": "https://www.signcollab.com/influencer-rate-calculator#webapp",
      "name": "SignCollab Influencer Rate Calculator & Creator Intelligence Engine",
      "alternateName": "SignCollab Influencer Rate Calculator",
      "url": "https://www.signcollab.com/influencer-rate-calculator",
      "applicationCategory": "BusinessApplication",
      "operatingSystem": "All",
      "browserRequirements": "Requires JavaScript. Requires HTML5.",
      "description":
        "AI-powered creator valuation and intelligence tool that analyzes creator profiles across Instagram, TikTok, and YouTube to provide deliverable pricing, multi-platform bundle rates, and 19-point creator intelligence dossiers.",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD",
        "availability": "https://schema.org/InStock"
      },
      "featureList": [
        "Automatic creator profile discovery across Instagram, TikTok, and YouTube",
        "Unified cross-platform sponsorship valuation from a single creator link or username",
        "Itemized deliverable pricing for Instagram Reels, Carousels, Static Posts, and Stories",
        "Itemized deliverable pricing for YouTube Dedicated Videos, Integrated Sponsorships, and Shorts",
        "Itemized deliverable pricing for TikTok Videos and Series",
        "Multi-channel campaign bundle pricing (2-Platform Starter Packs & 360° Authority Bundles)",
        "19-point Creator Intelligence Dossier (Audience Demographics, Buyer Intent, Content DNA, Brand Safety)",
        "Regional economic and purchasing-power currency adjustment across 17 regional markets",
        "Recent media content audit analyzing baseline interaction trends"
      ],
      "areaServed": [
        { "@type": "Country", "name": "United States", "identifier": "US" },
        { "@type": "Country", "name": "Pakistan", "identifier": "PK" },
        { "@type": "Country", "name": "United Kingdom", "identifier": "GB" },
        { "@type": "Country", "name": "India", "identifier": "IN" },
        { "@type": "Country", "name": "Canada", "identifier": "CA" },
        { "@type": "Country", "name": "Australia", "identifier": "AU" },
        { "@type": "Country", "name": "United Arab Emirates", "identifier": "AE" },
        { "@type": "Country", "name": "Saudi Arabia", "identifier": "SA" },
        { "@type": "Country", "name": "Germany", "identifier": "DE" },
        { "@type": "Country", "name": "France", "identifier": "FR" },
        { "@type": "Country", "name": "Singapore", "identifier": "SG" },
        { "@type": "Country", "name": "Brazil", "identifier": "BR" },
        { "@type": "Country", "name": "Bangladesh", "identifier": "BD" },
        { "@type": "Country", "name": "Nigeria", "identifier": "NG" },
        { "@type": "Country", "name": "Egypt", "identifier": "EG" },
        { "@type": "Country", "name": "Turkey", "identifier": "TR" },
        { "@type": "Country", "name": "South Africa", "identifier": "ZA" }
      ],
      "author": {
        "@type": "Organization",
        "@id": "https://www.signcollab.com/#organization",
        "name": "SignCollab",
        "url": "https://www.signcollab.com",
        "logo": "https://www.signcollab.com/icon.png"
      }
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
            "text": "The SignCollab Influencer Rate Calculator is an AI-powered creator valuation system that analyzes creator footprints across Instagram, YouTube, and TikTok to provide methodology-based sponsorship rate ranges, itemized deliverable pricing, and strategic creator intelligence dossiers."
          }
        },
        {
          "@type": "Question",
          "name": "How does automatic cross-platform creator discovery work?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "When you enter a single creator handle or profile link from Instagram, YouTube, or TikTok, the engine scans public profile footprints and bio links to automatically discover and connect the creator's secondary channels into a unified report."
          }
        },
        {
          "@type": "Question",
          "name": "What deliverable formats and rates are calculated?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "The calculator produces estimated market rate ranges for Instagram Reels, Feed Carousels, Static Posts, and Story Sets; YouTube Dedicated Videos, 60s Integrated Sponsorships, and Shorts; TikTok Videos; and multi-platform campaign packages."
          }
        },
        {
          "@type": "Question",
          "name": "What is included in the 19-point Creator Intelligence Dossier?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "The dossier provides an AI-synthesized analysis structured around four key pillars: Audience Demographics & Purchasing Intent, Content DNA & Production Standards, Brand Fit & Sponsorship Safety, and Strategic Strengths with partnership recommendations."
          }
        },
        {
          "@type": "Question",
          "name": "Does the calculator support international currencies and regional pricing?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes. The calculator applies regional economic purchasing-power adjustments across 17 regional markets, showing estimated pricing in local currencies (including PKR, USD, GBP, EUR, INR, AED, SAR, CAD, AUD) alongside USD conversions."
          }
        }
      ]
    },
    {
      "@type": "BreadcrumbList",
      "@id": "https://www.signcollab.com/influencer-rate-calculator#breadcrumbs",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": "https://www.signcollab.com"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "Influencer Rate Calculator",
          "item": "https://www.signcollab.com/influencer-rate-calculator"
        }
      ]
    },
    {
      "@type": "Organization",
      "@id": "https://www.signcollab.com/#organization",
      "name": "SignCollab",
      "url": "https://www.signcollab.com",
      "logo": "https://www.signcollab.com/icon.png"
    }
  ]
};

export default function InfluencerRateCalculatorPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#f9f9f9] font-sans text-gray-900 selection:bg-black selection:text-white">
      {/* Structured JSON-LD for Search Engines & AI Crawlers */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <PublicHeader />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Breadcrumb Trail */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-semibold text-gray-500 mb-6">
          <Link href="/" className="hover:text-black transition-colors">
            Home
          </Link>
          <span>/</span>
          <span className="text-gray-950 font-bold">Influencer Rate Calculator</span>
        </nav>

        {/* Master Interactive Radar Dashboard */}
        <InfluencerRadarDashboard />

        {/* Crawlable Methodology & FAQs Section */}
        <section className="mt-16 sm:mt-20 pt-12 border-t border-gray-200/90 space-y-10">
          <div className="max-w-3xl">
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-gray-950">
              SignCollab Influencer Valuation &amp; Creator Intelligence Methodology
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed mt-2">
              SignCollab combines cross-platform profile scanning, empirical engagement benchmarking, and AI creator intelligence to help brands and creators establish data-informed sponsorship pricing.
            </p>
          </div>

          {/* 4 Pillars Overview Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-white border border-gray-200 shadow-2xs space-y-1.5">
              <h3 className="font-bold text-gray-950 text-sm">1. Automatic Profile Discovery</h3>
              <p className="text-gray-600 leading-relaxed">
                Connects public footprints across Instagram, YouTube, and TikTok from a single link to provide unified omnichannel reach and rate analysis.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white border border-gray-200 shadow-2xs space-y-1.5">
              <h3 className="font-bold text-gray-950 text-sm">2. Itemized Deliverable Pricing</h3>
              <p className="text-gray-600 leading-relaxed">
                Calculates estimated rate ranges for individual formats (Reels, Static Posts, Dedicated Videos, Shorts, TikToks) and multi-channel campaign packages.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white border border-gray-200 shadow-2xs space-y-1.5">
              <h3 className="font-bold text-gray-950 text-sm">3. 19-Point Creator Intelligence</h3>
              <p className="text-gray-600 leading-relaxed">
                Synthesizes audience demographics, commercial purchasing intent, content DNA, brand safety ratings, and actionable campaign angles.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white border border-gray-200 shadow-2xs space-y-1.5">
              <h3 className="font-bold text-gray-950 text-sm">4. Regional Economic Calibration</h3>
              <p className="text-gray-600 leading-relaxed">
                Applies purchasing-power parity adjustments across 17 regional markets with native currency rates alongside USD equivalents.
              </p>
            </div>
          </div>

          {/* Frequently Asked Questions */}
          <div className="space-y-4 pt-4 border-t border-gray-200/60">
            <h3 className="text-base font-bold text-gray-950">
              Frequently Asked Questions
            </h3>

            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-white border border-gray-200 shadow-2xs space-y-1.5">
                <h4 className="font-bold text-gray-950 text-xs sm:text-sm">
                  What is the SignCollab Influencer Rate Calculator &amp; Creator Intelligence Engine?
                </h4>
                <p className="text-xs text-gray-600 leading-relaxed">
                  The SignCollab Influencer Rate Calculator is an AI-powered creator valuation system that analyzes creator footprints across Instagram, YouTube, and TikTok to provide methodology-based sponsorship rate ranges, itemized deliverable pricing, and strategic creator intelligence dossiers.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white border border-gray-200 shadow-2xs space-y-1.5">
                <h4 className="font-bold text-gray-950 text-xs sm:text-sm">
                  How does automatic cross-platform creator discovery work?
                </h4>
                <p className="text-xs text-gray-600 leading-relaxed">
                  When you enter a single creator handle or profile link from Instagram, YouTube, or TikTok, the engine scans public profile footprints and bio links to automatically discover and connect the creator&apos;s secondary channels into a unified report.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white border border-gray-200 shadow-2xs space-y-1.5">
                <h4 className="font-bold text-gray-950 text-xs sm:text-sm">
                  What deliverable formats and rates are calculated?
                </h4>
                <p className="text-xs text-gray-600 leading-relaxed">
                  The calculator produces estimated market rate ranges for Instagram Reels, Feed Carousels, Static Posts, and Story Sets; YouTube Dedicated Videos, 60s Integrated Sponsorships, and Shorts; TikTok Videos; and multi-platform campaign packages.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white border border-gray-200 shadow-2xs space-y-1.5">
                <h4 className="font-bold text-gray-950 text-xs sm:text-sm">
                  What is included in the 19-point Creator Intelligence Dossier?
                </h4>
                <p className="text-xs text-gray-600 leading-relaxed">
                  The dossier provides an AI-synthesized analysis structured around four key pillars: Audience Demographics &amp; Purchasing Intent, Content DNA &amp; Production Standards, Brand Fit &amp; Sponsorship Safety, and Strategic Strengths with partnership recommendations.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white border border-gray-200 shadow-2xs space-y-1.5">
                <h4 className="font-bold text-gray-950 text-xs sm:text-sm">
                  Does the calculator support international currencies and regional pricing?
                </h4>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Yes. The calculator applies regional economic purchasing-power adjustments across 17 regional markets, showing estimated pricing in local currencies (including PKR, USD, GBP, EUR, INR, AED, SAR, CAD, AUD) alongside USD conversions.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
