import React from "react";
import type { Metadata } from "next";
import { getCompanyConfig } from "@/lib/config";
import { SuiteHeader } from "@/components/layout/PublicHeader";
import { HomeHero } from "@/components/home/HomeHero";
import { InteractiveBentoShowcase } from "@/components/home/InteractiveBentoShowcase";
import { CreatorProofGrid } from "@/components/home/CreatorProofGrid";
import { WorkflowBridgeSection } from "@/components/home/WorkflowBridgeSection";
import { PublicFooter } from "@/components/layout/PublicFooter";

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.signcollab.com";

export const metadata: Metadata = {
  title: "BrandBridge | The Commercial Operating System for the Creator Economy",
  description:
    "BrandBridge (SignCollab) is the commercial agreement & rate valuation infrastructure for creators, brands, and agencies. Audit empirical rates, enforce bilateral contract terms, and secure audit trails with global e-signature compliance.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "BrandBridge | Commercial Operating System for Creators & Brands",
    description:
      "Audit empirical influencer deliverable rates, enforce commercial terms, and secure bilaterally signed audit trails with global electronic signature compliance.",
    url: baseUrl,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "BrandBridge | Commercial Operating System for Creators & Brands",
    description:
      "Audit empirical influencer deliverable rates, enforce commercial terms, and secure bilaterally signed audit trails with global electronic signature compliance.",
  },
};

export default function Home() {
  const company = getCompanyConfig();

  return (
    <div className="min-h-screen bg-canvas flex flex-col relative selection:bg-zinc-950 selection:text-white">
      {/* Master Universal Suite Header */}
      <SuiteHeader activeRoute="/" />

      {/* 1. Hero Section with Collabstr-style Omni-Search */}
      <HomeHero />

      {/* 2. Interactive Live Bento Showcase (Radar + Contract + SHA-256) */}
      <InteractiveBentoShowcase />

      {/* 3. Multi-Tier Creator Proof Grid */}
      <CreatorProofGrid />

      {/* 4. The 3-Step Bilateral Workflow Bridge */}
      <WorkflowBridgeSection />

      {/* Master Public Footer */}
      <PublicFooter />
    </div>
  );
}
