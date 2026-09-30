"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Activity,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  TrendingUp,
  Search,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Video,
  Camera,
  Music2,
} from "lucide-react";

type SectorKey = "trending" | "tech" | "fashion" | "filmmaking";

interface CreatorIntelligenceCard {
  id: string;
  name: string;
  handle: string;
  niche: string;
  avatarInitials: string;
  avatarBg: string;
  avatarUrl?: string;
  platforms: ("youtube" | "instagram" | "tiktok")[];
  combinedReach: string;
  viewVelocity: string;
  engagementRate: string;
  confidence: string;
  primaryFormat: string;
  defendedRange: string;
  usdEquivalent: string;
}

interface SectorData {
  title: string;
  tagline: string;
  medianCpm: string;
  buyerIntent: string;
  activeGeo: string;
  creators: CreatorIntelligenceCard[];
}

const SECTOR_DATA: Record<SectorKey, SectorData> = {
  trending: {
    title: "Trending Global Audits",
    tagline: "Highest-velocity cross-platform audits currently indexed on SignCollab.",
    medianCpm: "$24 – $38",
    buyerIntent: "8.6 / 10",
    activeGeo: "US, UK & Cross-Border",
    creators: [
      {
        id: "irfanjunejo",
        name: "Irfan Junejo",
        handle: "irfanjunejo",
        niche: "Filmmaking & Visual Media",
        avatarInitials: "IJ",
        avatarBg: "bg-zinc-950 text-white",
        avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&h=120&fit=crop",
        platforms: ["youtube", "instagram"],
        combinedReach: "2.75M",
        viewVelocity: "480K Median Views",
        engagementRate: "5.82%",
        confidence: "94%",
        primaryFormat: "YT Dedicated Video",
        defendedRange: "Rs. 1.25M – 1.95M",
        usdEquivalent: "$5,600 USD",
      },
      {
        id: "mkbhd",
        name: "Marques Brownlee",
        handle: "mkbhd",
        niche: "Consumer Tech & Hardware",
        avatarInitials: "MB",
        avatarBg: "bg-red-950 text-red-200",
        platforms: ["youtube", "instagram"],
        combinedReach: "19.7M",
        viewVelocity: "2.85M Median Views",
        engagementRate: "4.85%",
        confidence: "96%",
        primaryFormat: "60s Integrated Sponsor",
        defendedRange: "$28,500 – $34,000",
        usdEquivalent: "$31,250 USD",
      },
      {
        id: "zoyalifestyle",
        name: "Zoya & Style",
        handle: "zoyalifestyle",
        niche: "Fashion & Aesthetics",
        avatarInitials: "ZS",
        avatarBg: "bg-rose-950 text-rose-200",
        platforms: ["instagram", "tiktok"],
        combinedReach: "485K",
        viewVelocity: "145K Reel Plays",
        engagementRate: "6.15%",
        confidence: "92%",
        primaryFormat: "Dedicated IG Reel",
        defendedRange: "$1,350 – $1,850",
        usdEquivalent: "$1,600 USD",
      },
      {
        id: "alitechreview",
        name: "Ali Reviews Tech",
        handle: "alitechreview",
        niche: "Mobile & Gaming Hardware",
        avatarInitials: "AR",
        avatarBg: "bg-blue-950 text-blue-200",
        platforms: ["youtube", "instagram"],
        combinedReach: "740K",
        viewVelocity: "210K Median Views",
        engagementRate: "5.40%",
        confidence: "93%",
        primaryFormat: "YT Integrated Segment",
        defendedRange: "$2,400 – $3,100",
        usdEquivalent: "$2,750 USD",
      },
    ],
  },
  tech: {
    title: "Consumer Tech & Hardware",
    tagline: "High capital-intensity creators with enterprise purchasing intent.",
    medianCpm: "$28 – $42",
    buyerIntent: "9.2 / 10",
    activeGeo: "US, UK & Global Tech Hubs",
    creators: [
      {
        id: "mkbhd",
        name: "Marques Brownlee",
        handle: "mkbhd",
        niche: "Smartphones & Hardware",
        avatarInitials: "MB",
        avatarBg: "bg-red-950 text-red-200",
        platforms: ["youtube", "instagram"],
        combinedReach: "19.7M",
        viewVelocity: "2.85M Median Views",
        engagementRate: "4.85%",
        confidence: "96%",
        primaryFormat: "60s Integrated Sponsor",
        defendedRange: "$28,500 – $34,000",
        usdEquivalent: "$31,250 USD",
      },
      {
        id: "dave2d",
        name: "Dave2D",
        handle: "dave2d",
        niche: "Laptops & Industrial Design",
        avatarInitials: "DD",
        avatarBg: "bg-cyan-950 text-cyan-200",
        platforms: ["youtube"],
        combinedReach: "3.68M",
        viewVelocity: "750K Median Views",
        engagementRate: "5.10%",
        confidence: "95%",
        primaryFormat: "YT Dedicated Feature",
        defendedRange: "$14,500 – $18,000",
        usdEquivalent: "$16,250 USD",
      },
      {
        id: "austinevans",
        name: "Austin Evans",
        handle: "austinevans",
        niche: "Gaming Rigs & Mobile",
        avatarInitials: "AE",
        avatarBg: "bg-amber-950 text-amber-200",
        platforms: ["youtube", "tiktok"],
        combinedReach: "5.45M",
        viewVelocity: "680K Median Views",
        engagementRate: "4.60%",
        confidence: "94%",
        primaryFormat: "Integrated Sponsorship",
        defendedRange: "$12,000 – $15,500",
        usdEquivalent: "$13,800 USD",
      },
      {
        id: "techleadpro",
        name: "Dev & Cloud Review",
        handle: "devcloudreview",
        niche: "Developer Tools & SaaS",
        avatarInitials: "DC",
        avatarBg: "bg-indigo-950 text-indigo-200",
        platforms: ["youtube"],
        combinedReach: "420K",
        viewVelocity: "85K High-Intent Views",
        engagementRate: "6.80%",
        confidence: "91%",
        primaryFormat: "Dedicated SaaS Deep-Dive",
        defendedRange: "$4,500 – $5,800",
        usdEquivalent: "$5,100 USD",
      },
    ],
  },
  fashion: {
    title: "Fashion & Lifestyle",
    tagline: "High organic aesthetic retention with strong direct consumer conversion.",
    medianCpm: "$14 – $22",
    buyerIntent: "7.8 / 10",
    activeGeo: "UK, US & Europe",
    creators: [
      {
        id: "camilastyle",
        name: "Camila Wardrobe",
        handle: "camilawardrobe",
        niche: "Luxury Apparel & Styling",
        avatarInitials: "CW",
        avatarBg: "bg-pink-950 text-pink-200",
        platforms: ["instagram", "tiktok"],
        combinedReach: "860K",
        viewVelocity: "240K Reel Plays",
        engagementRate: "5.90%",
        confidence: "93%",
        primaryFormat: "1x Reel + 3x Story Set",
        defendedRange: "$2,800 – $3,600",
        usdEquivalent: "$3,200 USD",
      },
      {
        id: "sofiaelena",
        name: "Sofia Elena Skin",
        handle: "sofiaelenaskin",
        niche: "Clean Beauty & Skincare",
        avatarInitials: "SE",
        avatarBg: "bg-emerald-950 text-emerald-200",
        platforms: ["instagram", "tiktok"],
        combinedReach: "340K",
        viewVelocity: "95K Organic Plays",
        engagementRate: "6.40%",
        confidence: "92%",
        primaryFormat: "Dedicated Skin Routine Reel",
        defendedRange: "$1,100 – $1,450",
        usdEquivalent: "$1,275 USD",
      },
      {
        id: "marcuswardrobe",
        name: "Marcus Streetwear",
        handle: "marcusstreetwear",
        niche: "Men's Footwear & Tailoring",
        avatarInitials: "MS",
        avatarBg: "bg-stone-900 text-stone-200",
        platforms: ["instagram", "youtube"],
        combinedReach: "520K",
        viewVelocity: "160K Median Plays",
        engagementRate: "5.30%",
        confidence: "91%",
        primaryFormat: "Feed Carousel + Story Set",
        defendedRange: "$1,400 – $1,900",
        usdEquivalent: "$1,650 USD",
      },
      {
        id: "studiochic",
        name: "Studio Sustainable",
        handle: "studiosustainable",
        niche: "Circular & Vintage Fashion",
        avatarInitials: "SS",
        avatarBg: "bg-teal-950 text-teal-200",
        platforms: ["tiktok", "instagram"],
        combinedReach: "190K",
        viewVelocity: "68K Engaged Views",
        engagementRate: "7.10%",
        confidence: "89%",
        primaryFormat: "2x TikTok Flighting",
        defendedRange: "$750 – $980",
        usdEquivalent: "$860 USD",
      },
    ],
  },
  filmmaking: {
    title: "Filmmaking & Visual Media",
    tagline: "Elite production value creators imparting cinematic institutional prestige.",
    medianCpm: "$22 – $35",
    buyerIntent: "8.9 / 10",
    activeGeo: "Global Cross-Border",
    creators: [
      {
        id: "irfanjunejo",
        name: "Irfan Junejo",
        handle: "irfanjunejo",
        niche: "Cinematic Documentary & Vlogs",
        avatarInitials: "IJ",
        avatarBg: "bg-zinc-950 text-white",
        avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&h=120&fit=crop",
        platforms: ["youtube", "instagram"],
        combinedReach: "2.75M",
        viewVelocity: "480K Median Views",
        engagementRate: "5.82%",
        confidence: "94%",
        primaryFormat: "YT Dedicated Video",
        defendedRange: "Rs. 1.25M – 1.95M",
        usdEquivalent: "$5,600 USD",
      },
      {
        id: "petervisuals",
        name: "Peter Cinematic",
        handle: "petercinematic",
        niche: "Camera Gear & Color Grading",
        avatarInitials: "PC",
        avatarBg: "bg-purple-950 text-purple-200",
        platforms: ["youtube"],
        combinedReach: "1.45M",
        viewVelocity: "320K Tech Views",
        engagementRate: "5.50%",
        confidence: "95%",
        primaryFormat: "YT Integrated Gear Review",
        defendedRange: "$6,200 – $7,800",
        usdEquivalent: "$7,000 USD",
      },
      {
        id: "urbanframes",
        name: "Urban Frames Studio",
        handle: "urbanframes",
        niche: "Street Photography & Lenses",
        avatarInitials: "UF",
        avatarBg: "bg-zinc-800 text-zinc-100",
        platforms: ["instagram", "youtube"],
        combinedReach: "560K",
        viewVelocity: "175K Visual Impressions",
        engagementRate: "6.20%",
        confidence: "92%",
        primaryFormat: "Dedicated IG Carousel + Reel",
        defendedRange: "$1,800 – $2,350",
        usdEquivalent: "$2,050 USD",
      },
      {
        id: "nomadcinema",
        name: "Nomad Cinema Doc",
        handle: "nomadcinema",
        niche: "Travel Expeditions & Drones",
        avatarInitials: "NC",
        avatarBg: "bg-amber-900 text-amber-100",
        platforms: ["youtube", "instagram"],
        combinedReach: "410K",
        viewVelocity: "135K Organic Plays",
        engagementRate: "6.70%",
        confidence: "90%",
        primaryFormat: "YT Integrated Sponsorship",
        defendedRange: "$2,200 – $2,900",
        usdEquivalent: "$2,550 USD",
      },
    ],
  },
};

export function MarketIntelligenceHub() {
  const router = useRouter();
  const [activeSector, setActiveSector] = useState<SectorKey>("trending");
  const [quickInput, setQuickInput] = useState("");

  const currentSector = SECTOR_DATA[activeSector];

  const handleInlineSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = quickInput.trim();
    if (!query) {
      router.push("/influencer-rate-calculator");
      return;
    }
    const cleanHandle = query
      .replace(/^@/, "")
      .replace(/^https?:\/\/(www\.)?(instagram|youtube|tiktok)\.com\//, "");
    router.push(`/influencer-rate-calculator?handle=${encodeURIComponent(cleanHandle)}&platform=instagram`);
  };

  return (
    <section id="valuation-hub" className="py-16 md:py-24 bg-zinc-50/70 border-y border-zinc-200/80 text-left scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-10">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-bold uppercase tracking-wider border border-emerald-200">
              <Activity className="w-3.5 h-3.5 text-emerald-600" />
              <span>Tool 01 • Rate Intelligence Engine</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-semibold text-zinc-950 font-display tracking-tight">
              Know What You&apos;re Worth. Know What to Pay.
            </h2>
            <p className="text-sm sm:text-base text-zinc-600 font-medium">
              Defended via our 16-Knot Quantitative Valuation Matrix. Audited across unpinned Instagram Reels, YouTube view velocity, and 17-country purchasing power parity.
            </p>
          </div>

          <Link
            href="/influencer-rate-calculator"
            className="inline-flex items-center gap-2 text-xs font-bold text-zinc-950 hover:text-emerald-700 transition-colors shrink-0"
          >
            <span>Open Full Valuation Radar</span>
            <ArrowRight className="w-4 h-4 text-zinc-400" />
          </Link>
        </div>

        {/* Sector Tabs Switcher */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-zinc-200/80">
          <button
            type="button"
            onClick={() => setActiveSector("trending")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              activeSector === "trending"
                ? "bg-zinc-950 text-white shadow-sm"
                : "bg-white text-zinc-600 hover:text-zinc-950 border border-zinc-200/80"
            }`}
          >
            Trending Global Audits
          </button>
          <button
            type="button"
            onClick={() => setActiveSector("tech")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              activeSector === "tech"
                ? "bg-zinc-950 text-white shadow-sm"
                : "bg-white text-zinc-600 hover:text-zinc-950 border border-zinc-200/80"
            }`}
          >
            Consumer Tech &amp; Hardware
          </button>
          <button
            type="button"
            onClick={() => setActiveSector("fashion")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              activeSector === "fashion"
                ? "bg-zinc-950 text-white shadow-sm"
                : "bg-white text-zinc-600 hover:text-zinc-950 border border-zinc-200/80"
            }`}
          >
            Fashion &amp; Lifestyle
          </button>
          <button
            type="button"
            onClick={() => setActiveSector("filmmaking")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              activeSector === "filmmaking"
                ? "bg-zinc-950 text-white shadow-sm"
                : "bg-white text-zinc-600 hover:text-zinc-950 border border-zinc-200/80"
            }`}
          >
            Filmmaking &amp; Visual Media
          </button>
        </div>

        {/* Dynamic Sector Benchmark Metric Strip */}
        <div className="p-3.5 sm:p-4 rounded-xl bg-white border border-zinc-200/80 shadow-2xs flex flex-wrap items-center justify-between gap-4 text-xs">
          <div>
            <span className="text-[10px] font-bold uppercase text-zinc-400 block font-mono">
              Sector Overview
            </span>
            <span className="font-semibold text-zinc-900">{currentSector.tagline}</span>
          </div>

          <div className="flex items-center gap-6 shrink-0 font-mono">
            <div>
              <span className="text-[10px] uppercase text-zinc-400 font-bold block">
                Median Sector CPM
              </span>
              <span className="font-bold text-zinc-950">{currentSector.medianCpm}</span>
            </div>
            <div className="w-px h-6 bg-zinc-200" />
            <div>
              <span className="text-[10px] uppercase text-zinc-400 font-bold block">
                Buyer Intent Index
              </span>
              <span className="font-bold text-emerald-600">{currentSector.buyerIntent}</span>
            </div>
            <div className="w-px h-6 bg-zinc-200 hidden sm:block" />
            <div className="hidden sm:block">
              <span className="text-[10px] uppercase text-zinc-400 font-bold block">
                Primary Footprint
              </span>
              <span className="font-bold text-zinc-800">{currentSector.activeGeo}</span>
            </div>
          </div>
        </div>

        {/* 4-Card Responsive Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {currentSector.creators.map((creator) => (
            <div
              key={creator.id}
              className="bg-white border border-zinc-200/90 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4 surface-card"
            >
              <div>
                {/* Avatar & Platform Badges */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3 min-w-0">
                    {creator.avatarUrl ? (
                      <img
                        src={creator.avatarUrl}
                        alt={creator.name}
                        className="w-11 h-11 rounded-xl object-cover border border-zinc-200 shrink-0 shadow-2xs"
                      />
                    ) : (
                      <div
                        className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs ${creator.avatarBg}`}
                      >
                        {creator.avatarInitials}
                      </div>
                    )}
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-zinc-950 truncate leading-tight">
                        {creator.name}
                      </h4>
                      <span className="text-[11px] font-mono text-zinc-400 block truncate">
                        @{creator.handle}
                      </span>
                    </div>
                  </div>

                  <span className="px-2 py-0.5 rounded-md text-[9px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 shrink-0 flex items-center gap-1 font-mono">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" /> {creator.confidence}
                  </span>
                </div>

                {/* Niche Classification */}
                <div className="text-[11px] text-zinc-500 font-medium mb-3">
                  {creator.niche}
                </div>

                {/* Audited Performance Strip */}
                <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-zinc-50 border border-zinc-100 text-left font-mono">
                  <div>
                    <span className="text-[9px] uppercase font-bold text-zinc-400 block">
                      Combined Reach
                    </span>
                    <span className="text-xs font-bold text-zinc-950">{creator.combinedReach}</span>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase font-bold text-zinc-400 block">
                      Organic ER
                    </span>
                    <span className="text-xs font-bold text-emerald-600">
                      {creator.engagementRate}
                    </span>
                  </div>
                </div>

                {/* View Velocity Indicator */}
                <div className="mt-2 text-[10px] text-zinc-400 font-mono">
                  {creator.viewVelocity}
                </div>
              </div>

              {/* Defended Rate Strip */}
              <div className="pt-3 border-t border-zinc-100 space-y-2">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="uppercase font-bold text-zinc-400">Defended Benchmark</span>
                  <span className="text-zinc-600 font-medium">{creator.primaryFormat}</span>
                </div>

                <div className="flex items-baseline justify-between">
                  <div className="text-sm font-bold font-mono text-zinc-950">
                    {creator.defendedRange}
                  </div>
                  <div className="text-[10px] font-mono text-zinc-400">
                    {creator.usdEquivalent}
                  </div>
                </div>

                <Link
                  href={`/influencer-rate-calculator?handle=${creator.handle}&platform=${creator.platforms[0]}`}
                  className="w-full py-2.5 rounded-xl bg-zinc-100 hover:bg-zinc-950 hover:text-white text-zinc-900 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer mt-1"
                >
                  <Activity className="w-3.5 h-3.5" />
                  <span>Audit Full Rate Card</span>
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Search Bar for Any Custom Handle */}
        <div className="p-4 sm:p-6 rounded-2xl bg-white border border-zinc-200/90 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-bold text-zinc-950 block">
              Audit Any Creator Handle in Seconds
            </span>
            <span className="text-xs text-zinc-500">
              Enter any Instagram, YouTube, or TikTok username to compute a live 16-knot rate card.
            </span>
          </div>

          <form
            onSubmit={handleInlineSearch}
            className="flex items-center gap-2 w-full sm:w-auto shrink-0"
          >
            <div className="relative flex-1 sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                value={quickInput}
                onChange={(e) => setQuickInput(e.target.value)}
                placeholder="@username or channel link"
                className="w-full pl-8 pr-3 py-2 text-xs rounded-xl bg-zinc-50 border border-zinc-200 focus:bg-white focus:outline-none focus:ring-1 focus:ring-zinc-950"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-bold rounded-xl transition-all shrink-0 cursor-pointer"
            >
              Audit Rate
            </button>
          </form>
        </div>

      </div>
    </section>
  );
}
