"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Activity,
  ArrowRight,
  Search,
  ChevronLeft,
  ChevronRight,
  Users,
} from "lucide-react";
import { CreatorCard, CreatorItem } from "@/components/creators/CreatorCard";

interface SectorConfig {
  id: string;
  label: string;
  nicheId: number | null;
  tagline: string;
  medianCpm: string;
  buyerIntent: string;
  activeGeo: string;
}

const SECTORS: SectorConfig[] = [
  {
    id: "trending",
    label: "Trending Creators",
    nicheId: null,
    tagline: "High-velocity cross-platform creator profiles indexed across our global database.",
    medianCpm: "$24 – $38",
    buyerIntent: "High Intent",
    activeGeo: "US, UK, PK & Global",
  },
  {
    id: "tech",
    label: "Consumer Tech & Hardware",
    nicheId: 6,
    tagline: "Benchmark specifications, hardware teardowns, prosumer computing, and mobile flagships.",
    medianCpm: "$28 – $45",
    buyerIntent: "Very High Intent",
    activeGeo: "Tier-1 Global Markets",
  },
  {
    id: "lifestyle",
    label: "Lifestyle & Entertainment",
    nicheId: 8,
    tagline: "Universal consumer culture, daily narrative vlogs, relatable comedy, and mass audience reach.",
    medianCpm: "$18 – $28",
    buyerIntent: "Moderate-High Intent",
    activeGeo: "US, UK, PK & GCC",
  },
  {
    id: "gaming",
    label: "Gaming & Esports",
    nicheId: 14,
    tagline: "Live interactive streams, AAA game titles, esports gameplay, and gaming peripherals.",
    medianCpm: "$16 – $26",
    buyerIntent: "High Engagement",
    activeGeo: "Global Esports Audiences",
  },
  {
    id: "auto",
    label: "Automotive & Mobility",
    nicheId: 17,
    tagline: "OEM automaker ad budgets, electric vehicles, performance cars, and powersports.",
    medianCpm: "$30 – $52",
    buyerIntent: "High Commercial Intent",
    activeGeo: "US, UK & Regional OEM",
  },
  {
    id: "fashion",
    label: "Fashion & Apparel",
    nicheId: 12,
    tagline: "Prestige luxury styling, streetwear drops, seasonal lookbooks, and designer accessories.",
    medianCpm: "$22 – $35",
    buyerIntent: "High Intent",
    activeGeo: "Tier-1 Metro & Global",
  },
  {
    id: "creative",
    label: "Filmmaking & Media",
    nicheId: 18,
    tagline: "Cinematic creators imparting premium narrative credibility, lens optics, and production craft.",
    medianCpm: "$22 – $36",
    buyerIntent: "High Intent",
    activeGeo: "Global Cross-Border",
  },
];

const PAGE_SIZE = 3;

export function MarketIntelligenceHub() {
  const router = useRouter();
  const [activeSectorId, setActiveSectorId] = useState<string>("trending");
  const [creators, setCreators] = useState<CreatorItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [pageIndex, setPageIndex] = useState<number>(0);
  const [quickInput, setQuickInput] = useState<string>("");

  const cacheRef = useRef<Record<string, CreatorItem[]>>({});

  const currentSector =
    SECTORS.find((s) => s.id === activeSectorId) || SECTORS[0];

  useEffect(() => {
    let isMounted = true;

    async function loadSectorCreators() {
      if (cacheRef.current[activeSectorId]) {
        setCreators(cacheRef.current[activeSectorId]);
        setPageIndex(0);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const queryParams = new URLSearchParams({
          limit: "12",
          sort: "followers_desc",
        });
        if (currentSector.nicheId !== null) {
          queryParams.set("nicheId", String(currentSector.nicheId));
        }

        const res = await fetch(`/api/creators?${queryParams.toString()}`);
        if (!res.ok) throw new Error("Failed to fetch sector creators");

        const data = await res.json();
        if (isMounted) {
          const list = data.creators || [];
          cacheRef.current[activeSectorId] = list;
          setCreators(list);
          setPageIndex(0);
        }
      } catch (err) {
        console.error("Error loading creators for homepage hub:", err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadSectorCreators();

    return () => {
      isMounted = false;
    };
  }, [activeSectorId, currentSector.nicheId]);

  const totalPages = Math.ceil(creators.length / PAGE_SIZE) || 1;
  const visibleCreators = creators.slice(
    pageIndex * PAGE_SIZE,
    (pageIndex + 1) * PAGE_SIZE
  );

  const handlePrevSlide = () => {
    setPageIndex((prev) => (prev > 0 ? prev - 1 : totalPages - 1));
  };

  const handleNextSlide = () => {
    setPageIndex((prev) => (prev + 1 < totalPages ? prev + 1 : 0));
  };

  const handleSectorChange = (sectorId: string) => {
    setActiveSectorId(sectorId);
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
    router.push(
      `/influencer-rate-calculator?handle=${encodeURIComponent(cleanHandle)}&platform=instagram`
    );
  };

  return (
    <section
      id="valuation-hub"
      className="py-16 md:py-24 bg-zinc-50/70 dark:bg-zinc-950/40 border-y border-zinc-200/80 dark:border-zinc-800/80 text-left scroll-mt-20"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-400 text-[11px] font-bold uppercase tracking-wider border border-indigo-200 dark:border-indigo-800/60">
              <Activity className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>Empirical Rate Intelligence &amp; Market Benchmarks</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-semibold text-zinc-950 dark:text-white font-display tracking-tight">
              Know What You&apos;re Worth. Know What to Pay.
            </h2>
            <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 font-medium">
              Explore live, multi-platform creator valuations benchmarked against retention, view velocity, and real geographic audience purchasing power.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0 flex-wrap">
            <Link
              href="/creators"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white border border-zinc-200 dark:border-zinc-800 text-xs font-bold hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all cursor-pointer shadow-2xs"
            >
              <Users className="w-3.5 h-3.5 text-zinc-500" />
              <span>Creator Directory</span>
            </Link>
            <Link
              href="/influencer-rate-calculator"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 text-xs font-bold hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-all cursor-pointer"
            >
              <span>Audit Any Handle</span>
              <ArrowRight className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-600" />
            </Link>
          </div>
        </div>

        {/* Sector Tabs Switcher & Carousel Navigation */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200/80 dark:border-zinc-800/80 pb-3">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {SECTORS.map((sector) => (
              <button
                key={sector.id}
                type="button"
                onClick={() => handleSectorChange(sector.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  activeSectorId === sector.id
                    ? "bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 shadow-xs"
                    : "bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white border border-zinc-200/80 dark:border-zinc-800/80"
                }`}
              >
                {sector.label}
              </button>
            ))}
          </div>

          {/* Carousel Arrows & Counter */}
          <div className="hidden sm:flex items-center gap-3 shrink-0">
            {creators.length > 0 && (
              <span className="text-xs text-zinc-500 dark:text-zinc-400 font-mono">
                {pageIndex * PAGE_SIZE + 1}–
                {Math.min((pageIndex + 1) * PAGE_SIZE, creators.length)} of{" "}
                {creators.length}
              </span>
            )}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handlePrevSlide}
                disabled={creators.length <= PAGE_SIZE}
                aria-label="Previous creator profiles"
                className="w-8 h-8 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleNextSlide}
                disabled={creators.length <= PAGE_SIZE}
                aria-label="Next creator profiles"
                className="w-8 h-8 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Dynamic Sector Benchmark Metric Strip */}
        <div className="p-3.5 sm:p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 shadow-2xs flex flex-wrap items-center justify-between gap-4 text-xs">
          <div>
            <span className="text-[10px] font-bold uppercase text-zinc-400 dark:text-zinc-500 block font-mono">
              Sector Intelligence
            </span>
            <span className="font-semibold text-zinc-900 dark:text-zinc-100">
              {currentSector.tagline}
            </span>
          </div>

          <div className="flex items-center gap-6 shrink-0 font-mono">
            <div>
              <span className="text-[10px] uppercase text-zinc-400 dark:text-zinc-500 font-bold block">
                Median Sector CPM
              </span>
              <span className="font-bold text-zinc-950 dark:text-white">
                {currentSector.medianCpm}
              </span>
            </div>
            <div className="w-px h-6 bg-zinc-200 dark:bg-zinc-800" />
            <div>
              <span className="text-[10px] uppercase text-zinc-400 dark:text-zinc-500 font-bold block">
                Buyer Intent Index
              </span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                {currentSector.buyerIntent}
              </span>
            </div>
            <div className="w-px h-6 bg-zinc-200 dark:bg-zinc-800 hidden sm:block" />
            <div className="hidden sm:block">
              <span className="text-[10px] uppercase text-zinc-400 dark:text-zinc-500 font-bold block">
                Target Market
              </span>
              <span className="font-bold text-zinc-800 dark:text-zinc-200">
                {currentSector.activeGeo}
              </span>
            </div>
          </div>
        </div>

        {/* Large Financial Valuation Engine Visualization */}
        <div className="p-6 sm:p-8 rounded-3xl bg-zinc-950 text-white border border-zinc-800 shadow-xl space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Terminal Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-4 relative z-10">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-purple-400">
                16-Knot Empirical Valuation Engine
              </span>
              <span className="text-zinc-600 hidden sm:inline">•</span>
              <span className="text-xs text-zinc-400 font-mono hidden sm:inline">
                Active Sector: {currentSector.label}
              </span>
            </div>
            <div className="text-[11px] font-mono text-zinc-400">
              Benchmark: Dedicated Long-Form Integration (10-15 Min)
            </div>
          </div>

          {/* Valuation Centerpiece */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center relative z-10">
            {/* Left: The Computed Benchmark Figure */}
            <div className="space-y-2">
              <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 block">
                Computed Commercial Benchmark
              </span>
              <div className="text-4xl sm:text-5xl font-black font-mono text-white tracking-tight">
                {currentSector.id === "tech" ? "$14,800" : currentSector.id === "auto" ? "$18,500" : currentSector.id === "fashion" ? "$9,200" : currentSector.id === "gaming" ? "$7,800" : currentSector.id === "creative" ? "$11,200" : "$12,400"}
              </div>
              <p className="text-xs text-zinc-400 font-normal leading-relaxed">
                Mathematically defended deliverable price based on 30-day view velocity and buyer purchasing power.
              </p>
            </div>

            {/* Center: The Defended Range Slider / Visual Track */}
            <div className="lg:col-span-2 space-y-3 p-4 sm:p-5 rounded-2xl bg-zinc-900/90 border border-zinc-800">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-zinc-400">Floor Rate (Min)</span>
                <span className="text-purple-400 font-bold">Defended Market Range</span>
                <span className="text-zinc-400">Ceiling Rate (Max)</span>
              </div>

              {/* Visual Range Bar */}
              <div className="relative w-full h-3 bg-zinc-800 rounded-full overflow-hidden">
                <div className="absolute left-[15%] right-[15%] top-0 bottom-0 bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500 rounded-full" />
                <div className="absolute left-[50%] -translate-x-1/2 top-0 bottom-0 w-3 bg-white rounded-full shadow-lg" />
              </div>

              <div className="flex items-center justify-between text-xs font-mono font-bold text-zinc-300">
                <span>{currentSector.id === "tech" ? "$11,200" : currentSector.id === "auto" ? "$14,000" : currentSector.id === "fashion" ? "$6,800" : currentSector.id === "gaming" ? "$5,500" : currentSector.id === "creative" ? "$8,400" : "$9,800"}</span>
                <span className="text-white bg-purple-950 px-2 py-0.5 rounded border border-purple-800/60">
                  Target: {currentSector.id === "tech" ? "$14,800" : currentSector.id === "auto" ? "$18,500" : currentSector.id === "fashion" ? "$9,200" : currentSector.id === "gaming" ? "$7,800" : currentSector.id === "creative" ? "$11,200" : "$12,400"}
                </span>
                <span>{currentSector.id === "tech" ? "$19,500" : currentSector.id === "auto" ? "$24,000" : currentSector.id === "fashion" ? "$12,500" : currentSector.id === "gaming" ? "$10,800" : currentSector.id === "creative" ? "$15,000" : "$16,200"}</span>
              </div>
            </div>
          </div>

          {/* Bottom: 4 Empirical Valuation Multipliers Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2 relative z-10">
            <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 space-y-1">
              <span className="text-[10px] font-mono uppercase text-zinc-500 block">01 Base Sector CPM</span>
              <div className="text-sm font-bold font-mono text-zinc-200">{currentSector.medianCpm}</div>
              <span className="text-[10px] text-zinc-500 block">Deliverable baseline</span>
            </div>

            <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 space-y-1">
              <span className="text-[10px] font-mono uppercase text-zinc-500 block">02 View Velocity</span>
              <div className="text-sm font-bold font-mono text-emerald-400">1.84x Velocity</div>
              <span className="text-[10px] text-zinc-500 block">72h vs 30d reach ratio</span>
            </div>

            <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 space-y-1">
              <span className="text-[10px] font-mono uppercase text-zinc-500 block">03 Retention Score</span>
              <div className="text-sm font-bold font-mono text-indigo-400">64.8% Retained</div>
              <span className="text-[10px] text-zinc-500 block">Skip-resistance index</span>
            </div>

            <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 space-y-1">
              <span className="text-[10px] font-mono uppercase text-zinc-500 block">04 Geographic PPP</span>
              <div className="text-sm font-bold font-mono text-purple-400">1.42x PPP Factor</div>
              <span className="text-[10px] text-zinc-500 block">{currentSector.activeGeo}</span>
            </div>
          </div>
        </div>

        {/* Creators Grid Container: Same Cards as Creators Directory */}
        <div className="relative">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  className="animate-pulse flex flex-col justify-between p-5 rounded-[9px] bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-center gap-3.5 pb-3 border-b border-zinc-100 dark:border-zinc-800/60">
                      <div className="w-14 h-14 rounded-full bg-zinc-200 dark:bg-zinc-800 shrink-0" />
                      <div className="space-y-2 flex-1">
                        <div className="w-32 h-4 bg-zinc-200 dark:bg-zinc-800 rounded" />
                        <div className="w-20 h-3 bg-zinc-200 dark:bg-zinc-800 rounded" />
                      </div>
                    </div>
                    <div className="w-full h-8 bg-zinc-100 dark:bg-zinc-800/60 rounded" />
                    <div className="w-full h-24 bg-zinc-50 dark:bg-zinc-800/40 rounded-[9px]" />
                  </div>
                  <div className="w-full h-10 bg-zinc-900/10 dark:bg-white/10 rounded-full" />
                </div>
              ))}
            </div>
          ) : visibleCreators.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {visibleCreators.map((creator) => (
                <CreatorCard key={creator.id} creator={creator} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 space-y-3 rounded-[9px] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
              <Users className="w-10 h-10 text-zinc-400 mx-auto" />
              <p className="text-sm font-semibold text-zinc-900 dark:text-white">
                No profiles indexed in this category yet
              </p>
            </div>
          )}
        </div>

        {/* Directory CTA */}
        <div className="flex items-center justify-center pt-2">
          <Link
            href="/creators"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-900 dark:text-white border border-zinc-200 dark:border-zinc-800 text-xs font-bold transition shadow-2xs hover:shadow-sm"
          >
            <Users className="w-3.5 h-3.5 text-zinc-500" />
            <span>Explore Verified Profiles in Creator Directory</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1 text-zinc-400" />
          </Link>
        </div>

        {/* Bottom Search Bar for Any Custom Handle */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800/90 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-0.5">
            <span className="text-xs font-bold text-zinc-950 dark:text-white block">
              Audit Any Creator Handle in Seconds
            </span>
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
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
                className="w-full pl-8 pr-3 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 focus:bg-white dark:focus:bg-zinc-800 focus:outline-none focus:ring-1 focus:ring-zinc-950 dark:focus:ring-white text-zinc-900 dark:text-white"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-zinc-950 hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200 text-white text-xs font-bold rounded-xl transition-all shrink-0 cursor-pointer"
            >
              Audit Rate
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
