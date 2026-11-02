import React from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { getCompanyConfig } from "@/lib/config";
import { PricingClient } from "@/components/pricing/PricingClient";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";

const baseUrl = 'https://www.signcollab.com';

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


  return (
    <div className="min-h-screen bg-theme-gradient flex flex-col relative overflow-hidden">
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
