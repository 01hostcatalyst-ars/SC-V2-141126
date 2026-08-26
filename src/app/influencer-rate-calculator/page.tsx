import React from "react";
import { Metadata } from "next";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { InfluencerRadarDashboard } from "@/components/calculator/InfluencerRadarDashboard";

export const metadata: Metadata = {
  title: "Influencer Rate Calculator | SignCollab 2025–2026 Engine",
  description:
    "Autonomous multi-channel sponsorship pricing engine for Instagram, TikTok, and YouTube with engagement benchmarking and cross-platform discovery.",
};

export default function InfluencerRateCalculatorPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#f9f9f9] font-sans text-gray-900 selection:bg-black selection:text-white">
      <PublicHeader />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-14">
        <InfluencerRadarDashboard />
      </main>

      <PublicFooter />
    </div>
  );
}
