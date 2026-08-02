import React from "react";
import Link from "next/link";
import Script from "next/script";
import type { Metadata } from "next";
import { getCompanyConfig } from "@/lib/config";
import { PricingClient } from "@/components/pricing/PricingClient";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";

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
      <PublicHeader activeRoute="/pricing" />

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-12 z-10">
        <PricingClient companyName={company.name} supportEmail={company.supportEmail} />
      </main>

      {/* Footer */}
      <PublicFooter />
    </div>
  );
}
