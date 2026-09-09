"use client";

import React from "react";
import Link from "next/link";
import {
  TrendingUp,
  ArrowRight,
  ShieldCheck,
  Activity,
  Award,
} from "lucide-react";

interface CreatorCardItem {
  name: string;
  handle: string;
  tier: "Micro" | "Mid-Tier" | "Macro";
  niche: string;
  avatarInitials: string;
  avatarBg: string;
  combinedReach: string;
  engagementRate: string;
  platform: "instagram" | "youtube" | "tiktok";
  primaryRate: string;
  primaryFormat: string;
}

const CREATOR_ROSTER: CreatorCardItem[] = [
  {
    name: "Ayesha Noor",
    handle: "ayeshanoor.beauty",
    tier: "Micro",
    niche: "Skincare & Aesthetics",
    avatarInitials: "AN",
    avatarBg: "bg-rose-950 text-rose-200",
    combinedReach: "48.2K",
    engagementRate: "6.42%",
    platform: "instagram",
    primaryRate: "$420 - $550",
    primaryFormat: "1x Dedicated Reel",
  },
  {
    name: "Marques Brownlee",
    handle: "mkbhd",
    tier: "Macro",
    niche: "Consumer Electronics",
    avatarInitials: "MB",
    avatarBg: "bg-red-950 text-red-200",
    combinedReach: "19.4M",
    engagementRate: "4.85%",
    platform: "youtube",
    primaryRate: "$14,500+",
    primaryFormat: "Integrated Segment",
  },
  {
    name: "Hamza Malik",
    handle: "hamzatech",
    tier: "Mid-Tier",
    niche: "Tech & Mobile Gadgets",
    avatarInitials: "HM",
    avatarBg: "bg-blue-950 text-blue-200",
    combinedReach: "385K",
    engagementRate: "5.12%",
    platform: "youtube",
    primaryRate: "$1,850 - $2,400",
    primaryFormat: "Video + IG Reel",
  },
  {
    name: "Zara & Co.",
    handle: "zaratravels",
    tier: "Mid-Tier",
    niche: "Travel & Hospitality",
    avatarInitials: "ZT",
    avatarBg: "bg-emerald-950 text-emerald-200",
    combinedReach: "245K",
    engagementRate: "5.94%",
    platform: "tiktok",
    primaryRate: "$950 - $1,300",
    primaryFormat: "2x TikTok Videos",
  },
];

export function CreatorProofGrid() {
  return (
    <section className="py-16 md:py-24 bg-zinc-50/70 border-y border-zinc-200/80 text-left">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
          <div className="space-y-1.5 max-w-xl">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 font-mono">
              Empirical Market Benchmark
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-zinc-950 font-display tracking-tight">
              Calibrated for Every Creator Tier.
            </h2>
            <p className="text-xs sm:text-sm text-zinc-600 font-medium">
              From emerging micro-influencers to category-defining media brands, audit rates backed by empirical telemetry.
            </p>
          </div>

          <Link
            href="/influencer-rate-calculator"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-950 hover:text-zinc-700 hover:underline shrink-0"
          >
            <span>Audit Any Public Handle ➔</span>
          </Link>
        </div>

        {/* 4-Card Creator Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {CREATOR_ROSTER.map((creator) => (
            <div
              key={creator.handle}
              className="bg-white border border-zinc-200/90 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4 surface-card"
            >
              {/* Top Row: Avatar & Tier Badge */}
              <div>
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs ${creator.avatarBg}`}
                    >
                      {creator.avatarInitials}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-zinc-950 truncate leading-tight">
                        {creator.name}
                      </h4>
                      <span className="text-[11px] font-mono text-zinc-400 block truncate">
                        @{creator.handle}
                      </span>
                    </div>
                  </div>

                  <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-700 border border-zinc-200 shrink-0">
                    {creator.tier}
                  </span>
                </div>

                {/* Niche Indicator */}
                <div className="text-[11px] text-zinc-500 font-medium mb-3">
                  {creator.niche}
                </div>

                {/* Metrics Bar */}
                <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-zinc-50 border border-zinc-100 text-left">
                  <div>
                    <span className="text-[9px] uppercase font-bold text-zinc-400 block">Audience</span>
                    <span className="text-xs font-mono font-bold text-zinc-950">{creator.combinedReach}</span>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase font-bold text-zinc-400 block">Engagement</span>
                    <span className="text-xs font-mono font-bold text-emerald-600">{creator.engagementRate}</span>
                  </div>
                </div>
              </div>

              {/* Defensible Rate Card Strip */}
              <div className="pt-3 border-t border-zinc-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] uppercase font-bold text-zinc-400">Defensible Rate</span>
                  <span className="text-[10px] text-zinc-500 font-medium">{creator.primaryFormat}</span>
                </div>
                <div className="text-sm font-bold font-mono text-zinc-950 mb-3">
                  {creator.primaryRate}
                </div>

                <Link
                  href={`/influencer-rate-calculator?handle=${creator.handle}&platform=${creator.platform}`}
                  className="w-full py-2 rounded-lg bg-zinc-100 hover:bg-zinc-950 hover:text-white text-zinc-900 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Activity className="w-3.5 h-3.5" strokeWidth={2} />
                  <span>Audit Metrics</span>
                </Link>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
