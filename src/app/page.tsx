import React from "react";
import type { Metadata } from "next";
import { SuiteHeader } from "@/components/layout/PublicHeader";
import { HomeHero } from "@/components/home/HomeHero";
import { ProblemStatementSection } from "@/components/home/ProblemStatementSection";
import { EcosystemWorkflowSection } from "@/components/home/EcosystemWorkflowSection";
import { AudiencePersonasSection } from "@/components/home/AudiencePersonasSection";
import { LiveDirectoryShowcase } from "@/components/home/LiveDirectoryShowcase";
import { MarketIntelligenceHub } from "@/components/home/MarketIntelligenceHub";
import { InstantContractsSection } from "@/components/home/InstantContractsSection";
import { UpcomingToolsSection } from "@/components/home/UpcomingToolsSection";
import { PublicFooter } from "@/components/layout/PublicFooter";

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.signcollab.com";

export const metadata: Metadata = {
  title: "SignCollab | The Commercial Operating System for the Creator Economy",
  description:
    "SignCollab is the unified commercial infrastructure for creators, brands, and agencies. Discover 3,000+ audited creators, benchmark empirical rates, and execute binding 1-page bilateral contracts with global compliance.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "SignCollab | Commercial Operating System for the Creator Economy",
    description:
      "Discover 3,000+ verified creators, audit empirical deliverable rates, and secure bilaterally signed 1-page contracts with SHA-256 audit trails.",
    url: baseUrl,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SignCollab | Commercial Operating System for the Creator Economy",
    description:
      "Discover 3,000+ verified creators, audit empirical deliverable rates, and secure bilaterally signed 1-page contracts with SHA-256 audit trails.",
  },
};

export default function Home() {
  return (
    <div className="min-h-screen bg-canvas flex flex-col relative selection:bg-indigo-600 selection:text-white">
      {/* Master Universal Suite Header */}
      <SuiteHeader activeRoute="/" />

      {/* 1. Hero Section (Ecosystem Constellation Hub, Value Trust Bar) */}
      <HomeHero />

      {/* 2. Problem Statement (The Creator Economy Dilemma: Broken Commercial Infrastructure) */}
      <ProblemStatementSection />

      {/* 3. The 4-Stage Ecosystem Workflow (Discover → Understand → Plan → Execute) */}
      <EcosystemWorkflowSection />

      {/* 4. Audience Segmentation (Dedicated value paths for Creators, Brands & Marketers, Agencies) */}
      <AudiencePersonasSection />

      {/* 5. Live Creator Directory Showcase (Search 3,000+ Verified Profiles Across 20+ Verticals) */}
      <LiveDirectoryShowcase />

      {/* 6. Rate Intelligence & Market Sector Hub (Empirical 16-Knot Valuations, Sector Benchmarks) */}
      <MarketIntelligenceHub />

      {/* 7. Instant Bilateral Contracts (1-Page Agreements, 48h Deemed Approval, SHA-256 Audit) */}
      <InstantContractsSection />

      {/* 8. Pipeline Roadmap & Public Beta Commitment (Campaign Planner & Escrow Settlement) */}
      <UpcomingToolsSection />

      {/* Master Public Footer */}
      <PublicFooter />
    </div>
  );
}
