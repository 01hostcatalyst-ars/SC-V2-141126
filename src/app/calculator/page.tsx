import React from "react";
import Link from "next/link";
import { Metadata } from "next";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { CalculatorHero } from "@/components/calculator/CalculatorHero";
import { CalculatorContainer } from "@/components/calculator/CalculatorContainer";
import { getCalculatorDatabaseConstants } from "@/lib/calculator/db-service";

export const metadata: Metadata = {
  title: "SignCollab Influencer Rate & Pricing Calculator | Verified 2025–2026 Engine",
  description:
    "Calculate defensible market pricing for creator campaigns across Instagram, TikTok, and YouTube with engagement scaling and commercial rights licensing.",
};

export default async function CalculatorPage() {
  const dbConstants = await getCalculatorDatabaseConstants();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "SignCollab Influencer Rate & Pricing Calculator",
    applicationCategory: "BusinessApplication",
    operatingSystem: "All",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    description:
      "Calculate defensible market pricing for creator campaigns across Instagram, TikTok, and YouTube with engagement scaling and commercial rights licensing.",
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f9f9f9] font-sans text-gray-900 selection:bg-black selection:text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <PublicHeader />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 mb-6">
          <Link href="/" className="hover:text-black transition-colors">
            Home
          </Link>
          <span>/</span>
          <span className="text-gray-900 font-bold">Influencer Rate Calculator</span>
        </div>

        {/* Hero Section */}
        <CalculatorHero />

        {/* Master Interactive Calculator Container */}
        <CalculatorContainer initialDbConstants={dbConstants} />

        {/* Methodology & Educational Trust Section */}
        <section className="mt-16 sm:mt-24 pt-12 border-t border-gray-200">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-[11px] font-black uppercase tracking-widest text-gray-400">
              Transparent Methodology
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-gray-950 mt-1 uppercase tracking-tight font-display">
              How SignCollab Calculates Fair Market Rates
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 font-medium mt-2">
              Unlike generic follower-count calculators, our engine evaluates multi-dimensional creator performance using verified 2025–2026 industry datasets.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-gray-200/90 shadow-2xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-700">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                </svg>
              </div>
              <h3 className="text-sm font-bold text-gray-950 uppercase tracking-tight">1. Piecewise Continuous Interpolation</h3>
              <p className="text-xs text-gray-600 leading-relaxed font-medium">
                We eliminate artificial 50% price cliffs at follower boundaries (e.g. 9,999 vs 10,001) using continuous linear interpolation between verified industry anchor knots.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-200/90 shadow-2xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-700">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-sm font-bold text-gray-950 uppercase tracking-tight">2. True Engagement &amp; Velocity</h3>
              <p className="text-xs text-gray-600 leading-relaxed font-medium">
                We assess recent likes, comments, and video views against platform baselines, rewarding high-converting creators while discounting inactive follower counts.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-200/90 shadow-2xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-700">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-sm font-bold text-gray-950 uppercase tracking-tight">3. Commercial Rights &amp; Contracts</h3>
              <p className="text-xs text-gray-600 leading-relaxed font-medium">
                Add-on licensing for Meta Partnership Ads, whitelisting, website embeds, and exclusivity are calculated additively and exported directly into legally binding bilateral contracts.
              </p>
            </div>
          </div>

          {/* Clean FAQ Grid */}
          <div className="mt-12 bg-white rounded-2xl border border-gray-200/90 p-6 sm:p-8 space-y-6 shadow-2xs">
            <h3 className="text-base font-bold text-gray-950 uppercase tracking-tight">Frequently Asked Questions</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              <div>
                <h4 className="font-bold text-gray-900 mb-1">Is this the exact price an influencer must charge?</h4>
                <p className="text-gray-600 leading-relaxed font-medium">
                  No. This calculator delivers an empirical market valuation range (25th percentile, Median, 75th percentile). Actual rates may vary based on negotiation leverage, specialized niche authority, and production complexity.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-gray-900 mb-1">How does the contract export work?</h4>
                <p className="text-gray-600 leading-relaxed font-medium">
                  Clicking &quot;Create Contract with this Estimate&quot; transfers your deliverables, duration, commercial rights, and compensation amount directly into the SignCollab Instant Contract wizard for free digital signing.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-gray-900 mb-1">How are multi-item bundle discounts applied?</h4>
                <p className="text-gray-600 leading-relaxed font-medium">
                  Campaigns with 2 to 3 deliverables automatically receive a 10% package discount, while campaigns with 4 or more deliverables receive a 15% discount on the net content subtotal.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-gray-900 mb-1">Are regional currencies supported?</h4>
                <p className="text-gray-600 leading-relaxed font-medium">
                  Yes. The engine calibrates pricing for the US, UK, Canada, Pakistan, and India using regional purchasing power parity (PPP) indices and real-time currency conversions.
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
