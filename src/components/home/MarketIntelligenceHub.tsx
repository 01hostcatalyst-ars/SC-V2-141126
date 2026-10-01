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
  platforms: ("youtube" | "instagram" | "tiktok")[];
  combinedReach: string;
  trimmedMedianViews: string;
  engagementRate: string;
  confidence: string;
  primaryDeliverable: string;
  defendedRange: string;
  medianPriceNote: string;
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
    tagline: "High-velocity cross-platform creator audits actively indexed on SignCollab.",
    medianCpm: "$24 – $38",
    buyerIntent: "8.8 / 10",
    activeGeo: "US, UK, PK & Global",
    creators: [
      {
        id: "irfanjunejo",
        name: "Irfan Junejo",
        handle: "irfanjunejo",
        niche: "Filmmaking & Visual Media",
        avatarInitials: "IJ",
        avatarBg: "bg-zinc-950 text-white border-zinc-800",
        platforms: ["youtube", "instagram"],
        combinedReach: "2.75M",
        trimmedMedianViews: "480K",
        engagementRate: "5.82%",
        confidence: "94%",
        primaryDeliverable: "YT Dedicated Video",
        defendedRange: "Rs. 1.25M – 1.95M",
        medianPriceNote: "Defended Median: ≈ $5,600 USD",
      },
      {
        id: "mkbhd",
        name: "Marques Brownlee",
        handle: "mkbhd",
        niche: "Consumer Tech & Hardware",
        avatarInitials: "MB",
        avatarBg: "bg-red-950 text-red-200 border-red-800",
        platforms: ["youtube", "instagram"],
        combinedReach: "19.7M",
        trimmedMedianViews: "2.85M",
        engagementRate: "4.85%",
        confidence: "96%",
        primaryDeliverable: "60s Integrated Sponsor",
        defendedRange: "$28,500 – $34,000",
        medianPriceNote: "Defended Median: $31,250 USD",
      },
      {
        id: "aliabdaal",
        name: "Ali Abdaal",
        handle: "aliabdaal",
        niche: "Productivity & Tech Books",
        avatarInitials: "AA",
        avatarBg: "bg-blue-950 text-blue-200 border-blue-800",
        platforms: ["youtube", "instagram"],
        combinedReach: "5.25M",
        trimmedMedianViews: "420K",
        engagementRate: "4.60%",
        confidence: "94%",
        primaryDeliverable: "YT 60s Integrated",
        defendedRange: "$9,500 – $13,000",
        medianPriceNote: "Defended Median: $11,200 USD",
      },
      {
        id: "petermckinnon",
        name: "Peter McKinnon",
        handle: "petermckinnon",
        niche: "Cinematography & Cameras",
        avatarInitials: "PM",
        avatarBg: "bg-amber-950 text-amber-200 border-amber-800",
        platforms: ["youtube", "instagram"],
        combinedReach: "5.85M",
        trimmedMedianViews: "510K",
        engagementRate: "5.20%",
        confidence: "95%",
        primaryDeliverable: "YT Dedicated Feature",
        defendedRange: "$18,000 – $24,000",
        medianPriceNote: "Defended Median: $21,000 USD",
      },
    ],
  },
  tech: {
    title: "Consumer Tech & Hardware",
    tagline: "High capital-intensity creators with enterprise B2B and consumer buyer intent.",
    medianCpm: "$28 – $42",
    buyerIntent: "9.2 / 10",
    activeGeo: "US, UK & Global Hubs",
    creators: [
      {
        id: "mkbhd",
        name: "Marques Brownlee",
        handle: "mkbhd",
        niche: "Smartphones & Hardware",
        avatarInitials: "MB",
        avatarBg: "bg-red-950 text-red-200 border-red-800",
        platforms: ["youtube", "instagram"],
        combinedReach: "19.7M",
        trimmedMedianViews: "2.85M",
        engagementRate: "4.85%",
        confidence: "96%",
        primaryDeliverable: "60s Integrated Sponsor",
        defendedRange: "$28,500 – $34,000",
        medianPriceNote: "Defended Median: $31,250 USD",
      },
      {
        id: "linustechtips",
        name: "Linus Tech Tips",
        handle: "linustechtips",
        niche: "PC Hardware & Systems",
        avatarInitials: "LT",
        avatarBg: "bg-orange-950 text-orange-200 border-orange-800",
        platforms: ["youtube"],
        combinedReach: "15.8M",
        trimmedMedianViews: "1.95M",
        engagementRate: "4.40%",
        confidence: "95%",
        primaryDeliverable: "YT Integrated Segment",
        defendedRange: "$24,000 – $32,000",
        medianPriceNote: "Defended Median: $27,500 USD",
      },
      {
        id: "dave2d",
        name: "Dave2D",
        handle: "dave2d",
        niche: "Laptops & Clean Hardware",
        avatarInitials: "DD",
        avatarBg: "bg-cyan-950 text-cyan-200 border-cyan-800",
        platforms: ["youtube"],
        combinedReach: "3.68M",
        trimmedMedianViews: "750K",
        engagementRate: "5.10%",
        confidence: "95%",
        primaryDeliverable: "YT Dedicated Feature",
        defendedRange: "$14,500 – $18,000",
        medianPriceNote: "Defended Median: $16,250 USD",
      },
      {
        id: "austinevans",
        name: "Austin Evans",
        handle: "austinevans",
        niche: "Gaming & Budget Tech",
        avatarInitials: "AE",
        avatarBg: "bg-yellow-950 text-yellow-200 border-yellow-800",
        platforms: ["youtube"],
        combinedReach: "5.45M",
        trimmedMedianViews: "680K",
        engagementRate: "4.60%",
        confidence: "94%",
        primaryDeliverable: "YT Integrated Sponsorship",
        defendedRange: "$12,000 – $15,500",
        medianPriceNote: "Defended Median: $13,800 USD",
      },
    ],
  },
  fashion: {
    title: "Fashion & Lifestyle",
    tagline: "High organic retention with direct consumer apparel and beauty conversions.",
    medianCpm: "$16 – $24",
    buyerIntent: "8.1 / 10",
    activeGeo: "UK, US & Europe",
    creators: [
      {
        id: "emmachamberlain",
        name: "Emma Chamberlain",
        handle: "emmachamberlain",
        niche: "High Fashion & Lifestyle",
        avatarInitials: "EC",
        avatarBg: "bg-rose-950 text-rose-200 border-rose-800",
        platforms: ["instagram", "youtube"],
        combinedReach: "16.2M",
        trimmedMedianViews: "1.85M",
        engagementRate: "6.20%",
        confidence: "95%",
        primaryDeliverable: "IG Reel + Story Flight",
        defendedRange: "$32,000 – $42,000",
        medianPriceNote: "Defended Median: $36,500 USD",
      },
      {
        id: "wisdm",
        name: "Wisdom Kaye",
        handle: "wisdm",
        niche: "High Fashion & Runway Styling",
        avatarInitials: "WK",
        avatarBg: "bg-stone-900 text-stone-200 border-stone-700",
        platforms: ["tiktok", "instagram"],
        combinedReach: "12.4M",
        trimmedMedianViews: "2.10M",
        engagementRate: "7.40%",
        confidence: "96%",
        primaryDeliverable: "Dedicated Styling Reel/TikTok",
        defendedRange: "$16,000 – $22,000",
        medianPriceNote: "Defended Median: $18,500 USD",
      },
      {
        id: "alixearle",
        name: "Alix Earle",
        handle: "alixearle",
        niche: "Beauty, GRWM & College Style",
        avatarInitials: "AE",
        avatarBg: "bg-pink-950 text-pink-200 border-pink-800",
        platforms: ["tiktok", "instagram"],
        combinedReach: "6.80M",
        trimmedMedianViews: "3.20M",
        engagementRate: "8.10%",
        confidence: "94%",
        primaryDeliverable: "Dedicated TikTok Integration",
        defendedRange: "$25,000 – $35,000",
        medianPriceNote: "Defended Median: $29,000 USD",
      },
      {
        id: "patriciabright",
        name: "Patricia Bright",
        handle: "patriciabright",
        niche: "Style, Finance & Beauty",
        avatarInitials: "PB",
        avatarBg: "bg-purple-950 text-purple-200 border-purple-800",
        platforms: ["youtube", "instagram"],
        combinedReach: "3.80M",
        trimmedMedianViews: "290K",
        engagementRate: "5.10%",
        confidence: "92%",
        primaryDeliverable: "YT Dedicated Feature",
        defendedRange: "$7,500 – $10,500",
        medianPriceNote: "Defended Median: $8,800 USD",
      },
    ],
  },
  filmmaking: {
    title: "Filmmaking & Visual Media",
    tagline: "Cinematic creators imparting premium narrative credibility and visual craft.",
    medianCpm: "$22 – $36",
    buyerIntent: "8.9 / 10",
    activeGeo: "Global Cross-Border",
    creators: [
      {
        id: "irfanjunejo",
        name: "Irfan Junejo",
        handle: "irfanjunejo",
        niche: "Visual Documentary & Storytelling",
        avatarInitials: "IJ",
        avatarBg: "bg-zinc-950 text-white border-zinc-800",
        platforms: ["youtube", "instagram"],
        combinedReach: "2.75M",
        trimmedMedianViews: "480K",
        engagementRate: "5.82%",
        confidence: "94%",
        primaryDeliverable: "YT Dedicated Video",
        defendedRange: "Rs. 1.25M – 1.95M",
        medianPriceNote: "Defended Median: ≈ $5,600 USD",
      },
      {
        id: "petermckinnon",
        name: "Peter McKinnon",
        handle: "petermckinnon",
        niche: "Cinematography, Gear & Vlogs",
        avatarInitials: "PM",
        avatarBg: "bg-amber-950 text-amber-200 border-amber-800",
        platforms: ["youtube", "instagram"],
        combinedReach: "5.85M",
        trimmedMedianViews: "510K",
        engagementRate: "5.20%",
        confidence: "95%",
        primaryDeliverable: "YT Dedicated Feature",
        defendedRange: "$18,000 – $24,000",
        medianPriceNote: "Defended Median: $21,000 USD",
      },
      {
        id: "caseyneistat",
        name: "Casey Neistat",
        handle: "caseyneistat",
        niche: "Cinematic Vlogging & Narrative",
        avatarInitials: "CN",
        avatarBg: "bg-neutral-900 text-neutral-100 border-neutral-700",
        platforms: ["youtube"],
        combinedReach: "12.6M",
        trimmedMedianViews: "1.45M",
        engagementRate: "5.90%",
        confidence: "95%",
        primaryDeliverable: "YT Integrated Sponsorship",
        defendedRange: "$28,000 – $38,000",
        medianPriceNote: "Defended Median: $32,500 USD",
      },
      {
        id: "mooroosicity",
        name: "Mooroo",
        handle: "mooroosicity",
        niche: "Podcasts, Cinema & Music",
        avatarInitials: "TM",
        avatarBg: "bg-teal-950 text-teal-200 border-teal-800",
        platforms: ["youtube", "instagram"],
        combinedReach: "1.15M",
        trimmedMedianViews: "190K",
        engagementRate: "6.30%",
        confidence: "91%",
        primaryDeliverable: "YT Dedicated / Podcast Anchor",
        defendedRange: "Rs. 650K – 950K",
        medianPriceNote: "Defended Median: ≈ $2,800 USD",
      },
    ],
  },
};

export function MarketIntelligenceHub() {
  const router = useRouter();
  const [activeSector, setActiveSector] = useState<SectorKey>("trending");
  const [quickInput, setQuickInput] = useState("");
  const [sliderIndex, setSliderIndex] = useState(0);

  const currentSector = SECTOR_DATA[activeSector];
  const totalCards = currentSector.creators.length;

  const handlePrevSlide = () => {
    setSliderIndex((prev) => (prev > 0 ? prev - 1 : 0));
  };

  const handleNextSlide = () => {
    // 4 cards per page on desktop, so maxIndex = totalCards - 4 or 0
    setSliderIndex((prev) => (prev + 1 < totalCards ? prev + 1 : 0));
  };

  const handleSectorChange = (key: SectorKey) => {
    setActiveSector(key);
    setSliderIndex(0);
  };

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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8">
        
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
              Every search enriches our database. Explore empirical rates audited via our 16-Knot Quantitative Valuation Matrix across unpinned retention, view velocity, and purchasing power parity.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="flex items-center gap-1.5 text-xs text-zinc-500 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Live Database Index</span>
            </div>
            <Link
              href="/influencer-rate-calculator"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-950 text-white text-xs font-bold hover:bg-zinc-800 transition-all cursor-pointer"
            >
              <span>Audit Any Handle</span>
              <ArrowRight className="w-3.5 h-3.5 text-zinc-400" />
            </Link>
          </div>
        </div>

        {/* Sector Tabs Switcher & Carousel Navigation */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200/80 pb-3">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            {(
              [
                ["trending", "Trending Audits"],
                ["tech", "Consumer Tech & Hardware"],
                ["fashion", "Fashion & Lifestyle"],
                ["filmmaking", "Filmmaking & Media"],
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => handleSectorChange(key)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  activeSector === key
                    ? "bg-zinc-950 text-white shadow-xs"
                    : "bg-white text-zinc-600 hover:text-zinc-950 border border-zinc-200/80"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Carousel Arrows */}
          <div className="hidden sm:flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handlePrevSlide}
              aria-label="Previous creator profiles"
              className="w-8 h-8 rounded-lg bg-white border border-zinc-200 flex items-center justify-center text-zinc-700 hover:bg-zinc-100 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleNextSlide}
              aria-label="Next creator profiles"
              className="w-8 h-8 rounded-lg bg-white border border-zinc-200 flex items-center justify-center text-zinc-700 hover:bg-zinc-100 transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Dynamic Sector Benchmark Metric Strip */}
        <div className="p-3.5 sm:p-4 rounded-xl bg-white border border-zinc-200/80 shadow-2xs flex flex-wrap items-center justify-between gap-4 text-xs">
          <div>
            <span className="text-[10px] font-bold uppercase text-zinc-400 block font-mono">
              Sector Intelligence
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
                Target Market
              </span>
              <span className="font-bold text-zinc-800">{currentSector.activeGeo}</span>
            </div>
          </div>
        </div>

        {/* Carousel / Slider Container */}
        <div className="relative overflow-hidden">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {currentSector.creators.map((creator) => (
              <div
                key={creator.id}
                className="bg-white border border-zinc-200/90 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4 surface-card"
              >
                <div>
                  {/* Top: Avatar, Name, Verified Badge & Confidence */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-11 h-11 rounded-xl border flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs ${creator.avatarBg}`}
                      >
                        {creator.avatarInitials}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-xs font-bold text-zinc-950 truncate leading-tight">
                            {creator.name}
                          </h4>
                        </div>
                        <span className="text-[11px] font-mono text-zinc-400 block truncate">
                          @{creator.handle}
                        </span>
                      </div>
                    </div>

                    <span className="px-2 py-0.5 rounded-md text-[9px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200/90 shrink-0 flex items-center gap-1 font-mono">
                      <ShieldCheck className="w-3 h-3 text-emerald-600" />
                      <span>{creator.confidence} Confidence</span>
                    </span>
                  </div>

                  {/* Niche Classification */}
                  <div className="text-[11px] text-zinc-500 font-medium mb-3">
                    {creator.niche}
                  </div>

                  {/* Unified 3-Part Telemetry Strip */}
                  <div className="grid grid-cols-3 gap-1.5 p-2 rounded-xl bg-zinc-50 border border-zinc-200/70 text-left font-mono text-center">
                    <div>
                      <span className="text-[9px] uppercase font-bold text-zinc-400 block">
                        Reach
                      </span>
                      <span className="text-xs font-bold text-zinc-950 block truncate">
                        {creator.combinedReach}
                      </span>
                    </div>
                    <div className="border-x border-zinc-200 px-1">
                      <span className="text-[9px] uppercase font-bold text-zinc-400 block">
                        Median
                      </span>
                      <span className="text-xs font-bold text-zinc-950 block truncate">
                        {creator.trimmedMedianViews}
                      </span>
                    </div>
                    <div>
                      <span className="text-[9px] uppercase font-bold text-zinc-400 block">
                        ER
                      </span>
                      <span className="text-xs font-bold text-emerald-600 block truncate">
                        {creator.engagementRate}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Defended Benchmark & Rate Strip */}
                <div className="pt-3 border-t border-zinc-100 space-y-2">
                  <div className="p-2.5 rounded-xl bg-zinc-50/70 border border-zinc-200/60 space-y-1">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="font-bold uppercase tracking-wider text-zinc-400 font-mono">
                        Defended Range
                      </span>
                      <span className="text-zinc-700 font-semibold truncate max-w-[130px]">
                        {creator.primaryDeliverable}
                      </span>
                    </div>

                    <div className="text-sm font-bold font-mono text-zinc-950 leading-tight">
                      {creator.defendedRange}
                    </div>

                    <div className="text-[10px] font-mono text-zinc-500">
                      {creator.medianPriceNote}
                    </div>
                  </div>

                  <Link
                    href={`/influencer-rate-calculator?handle=${creator.handle}&platform=${creator.platforms[0]}`}
                    className="w-full py-2.5 rounded-xl bg-zinc-100 hover:bg-zinc-950 hover:text-white text-zinc-900 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer mt-1"
                  >
                    <span>Audit Full Rate Card</span>
                    <ArrowRight className="w-3.5 h-3.5 text-zinc-400" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Search Bar for Any Custom Handle */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-zinc-200/90 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-0.5">
            <span className="text-xs font-bold text-zinc-950 block">
              Audit Any Creator Handle in Seconds
            </span>
            <span className="text-xs text-zinc-500">
              Enter any Instagram, YouTube, or TikTok profile to compute a live 16-knot rate card and generate a defensible dossier.
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
                placeholder="@handle or profile link"
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
