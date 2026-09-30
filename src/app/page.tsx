import React from "react";
import type { Metadata } from "next";
import { SuiteHeader } from "@/components/layout/PublicHeader";
import { HomeHero } from "@/components/home/HomeHero";
import { MarketIntelligenceHub } from "@/components/home/MarketIntelligenceHub";
import { InstantContractsSection } from "@/components/home/InstantContractsSection";
import { UpcomingToolsSection } from "@/components/home/UpcomingToolsSection";
import { PublicFooter } from "@/components/layout/PublicFooter";

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.signcollab.com";

export const metadata: Metadata = {
  title: "SignCollab | The Commercial Operating System for the Creator Economy",
  description:
    "SignCollab is the commercial agreement & rate valuation infrastructure for creators, brands, and agencies. Audit empirical rates, enforce bilateral contract terms, and secure audit trails with global e-signature compliance.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "SignCollab | Commercial Operating System for Creators & Brands",
    description:
      "Audit empirical influencer deliverable rates, enforce commercial terms, and secure bilaterally signed audit trails with global electronic signature compliance.",
    url: baseUrl,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SignCollab | Commercial Operating System for Creators & Brands",
    description:
      "Audit empirical influencer deliverable rates, enforce commercial terms, and secure bilaterally signed audit trails with global electronic signature compliance.",
  },
};

export default function Home() {
  return (
    <div className="min-h-screen bg-canvas flex flex-col relative selection:bg-zinc-950 selection:text-white">
      {/* Master Universal Suite Header */}
      <SuiteHeader activeRoute="/" />

      {/* 1. Hero Section (Platform Positioning, Live Ecosystem Preview, Dual CTAs) */}
      <HomeHero />

      {/* 2. Rate Intelligence & Market Sector Hub (16-Knot Valuation, Sector Tabs, Audited Cards) */}
      <MarketIntelligenceHub />

      {/* 3. Instant Contracts & Legal Settlement (1-Page Bilateral Terms, Interactive Clauses, SHA-256) */}
      <InstantContractsSection />

      {/* 4. Upcoming Tools Suite (Creator Directory & Campaign Planner Roadmap + Free Beta Commitment) */}
      <UpcomingToolsSection />

      {/* Master Public Footer */}
      <PublicFooter />
    </div>
  );
}
