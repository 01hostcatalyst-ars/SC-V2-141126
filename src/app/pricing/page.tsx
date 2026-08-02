import React from "react";
import Link from "next/link";
import Script from "next/script";
import type { Metadata } from "next";
import { getCompanyConfig } from "@/lib/config";
import { PricingClient } from "@/components/pricing/PricingClient";

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.signcollab.com";

export const metadata: Metadata = {
  title: "Pricing Plans — Simple, Transparent Creator Contract Pricing | SignCollab",
  description:
    "Explore SignCollab's transparent pricing plans built for brands, agencies, and creators. Starter ($0), Professional ($19), Business ($39), Team ($79), and Enterprise. Launch offer: 50% OFF your first 3 months.",
  alternates: {
    canonical: "/pricing",
  },
  openGraph: {
    title: "Pricing Plans — Simple, Transparent Creator Contract Pricing | SignCollab",
    description:
      "No per-envelope fees or hidden charges. Launch offer: 50% OFF your first 3 months across Starter, Professional, Business, Team, and Enterprise plans.",
    url: `${baseUrl}/pricing`,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SignCollab Pricing — Transparent Creator Contract Plans",
    description:
      "Transparent creator contract pricing with zero per-envelope fees. Launch special: 50% OFF your first 3 months.",
  },
};

export default function PricingPage() {
  const company = getCompanyConfig();

  const pricingJsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${baseUrl}/pricing`,
        "url": `${baseUrl}/pricing`,
        "name": "Pricing Plans — SignCollab",
        "description": "Simple, transparent pricing plans for creators, brands, and agencies.",
        "isPartOf": { "@id": `${baseUrl}/#website` },
        "about": { "@id": `${baseUrl}/#organization` },
        "inLanguage": "en-US",
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${baseUrl}/pricing/#breadcrumb`,
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": baseUrl,
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": "Pricing",
            "item": `${baseUrl}/pricing`,
          },
        ],
      },
      {
        "@type": "OfferCatalog",
        "@id": `${baseUrl}/pricing/#offercatalog`,
        "name": "SignCollab Creator Contract Subscriptions",
        "itemListElement": [
          {
            "@type": "Offer",
            "name": "Starter Plan",
            "price": "0",
            "priceCurrency": "USD",
            "description": "Up to 2 instant agreements per day. No credit card required.",
            "url": `${baseUrl}/pricing`,
          },
          {
            "@type": "Offer",
            "name": "Professional Plan",
            "price": "9.50",
            "priceCurrency": "USD",
            "description": "Includes up to 250 agreements/month. 50% OFF first 3 months (regular $19/mo).",
            "url": `${baseUrl}/pricing`,
          },
          {
            "@type": "Offer",
            "name": "Business Plan",
            "price": "19.50",
            "priceCurrency": "USD",
            "description": "Includes up to 1,000 agreements/month. 50% OFF first 3 months (regular $39/mo).",
            "url": `${baseUrl}/pricing`,
          },
          {
            "@type": "Offer",
            "name": "Team Plan",
            "price": "39.50",
            "priceCurrency": "USD",
            "description": "Includes up to 2,500 agreements/month and 5 team member seats. 50% OFF first 3 months (regular $79/mo).",
            "url": `${baseUrl}/pricing`,
          },
          {
            "@type": "Offer",
            "name": "Enterprise Plan",
            "price": "Contact Sales",
            "priceCurrency": "USD",
            "description": "Unlimited team members, custom volume, and white-label PDF branding.",
            "url": `${baseUrl}/contact`,
          },
        ],
      },
      {
        "@type": "FAQPage",
        "@id": `${baseUrl}/pricing/#faqpage`,
        "mainEntity": [
          {
            "@type": "Question",
            "name": "How does the 50% Launch Offer work?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "All paid monthly plans receive 50% off for your first 3 months. No coupon code is required; the discount is automatically applied at checkout.",
            },
          },
          {
            "@type": "Question",
            "name": "What happens after I reach my monthly limit?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "You can upgrade your plan anytime to immediately increase your agreement capacity, or wait until your monthly quota resets at the start of your next billing cycle.",
            },
          },
          {
            "@type": "Question",
            "name": "Can I change or cancel my plan anytime?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes. You can upgrade, downgrade, or cancel your subscription whenever your business needs change.",
            },
          },
        ],
      },
    ],
  };

  return (
    <div className="min-h-screen bg-theme-gradient flex flex-col relative overflow-hidden">
      {/* Schema.org Structured Data */}
      <Script
        id="pricing-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pricingJsonLd) }}
      />

      {/* Ambient background glow elements */}
      <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[1000px] h-[500px] rounded-full ambient-glow-purple pointer-events-none z-0 opacity-40 blur-3xl" />
      <div className="absolute top-[35%] right-[-10%] w-[600px] h-[600px] rounded-full ambient-glow-blue pointer-events-none z-0 opacity-30 blur-3xl" />

      {/* Navigation Header */}
      <header className="w-full border-b border-gray-200/80 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="font-black text-xl tracking-tight text-black uppercase">
              {company.name}
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200 uppercase tracking-wide">
              Pricing &amp; Plans
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-gray-700">
            <Link href="/" className="hover:text-black transition-colors">
              Home
            </Link>
            <Link href="/about" className="hover:text-black transition-colors">
              About Us
            </Link>
            <Link href="/vision" className="hover:text-black transition-colors">
              Vision &amp; Mission
            </Link>
            <Link href="/features" className="hover:text-black transition-colors">
              Features
            </Link>
            <Link href="/pricing" className="text-black font-bold border-b-2 border-black pb-0.5">
              Pricing
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
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-12 z-10">
        <PricingClient companyName={company.name} supportEmail={company.supportEmail} />
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
            <Link href="/about" className="hover:text-black transition-colors">
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
            <Link href="/pricing" className="text-black font-bold hover:underline">
              Pricing
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
