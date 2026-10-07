"use client";

import React, { useState, useEffect, useCallback, useTransition } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Search,
  Filter,
  Users,
  DollarSign,
  TrendingUp,
  ShieldCheck,
  ArrowRight,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  SlidersHorizontal,
  X,
  FileText,
  Sparkles,
} from "lucide-react";
import { PRIMARY_NICHES } from "@/lib/calculator/constants";
import {
  PlatformBadge,
  YouTubeIcon,
  InstagramIcon,
  TikTokIcon,
} from "@/components/icons/PlatformIcons";

interface PlatformMetric {
  handle: string;
  followers: number;
  er?: number;
  lfEr?: number;
  sfEr?: number;
}

interface FlagshipRateItem {
  platform: "youtube" | "instagram" | "tiktok";
  format: string;
  label: string;
  recommendedAmount: number;
  formattedRecommended: string;
  lowAmount: number;
  formattedLow: string;
  highAmount: number;
  formattedHigh: string;
  currency: string;
  symbol: string;
  erPercent: number;
  erLabel: string;
}

interface CreatorItem {
  id: string;
  slug: string;
  canonicalName: string;
  brandName?: string | null;
  primaryNicheId?: number | null;
  primaryNicheName?: string | null;
  subNicheName?: string | null;
  countryCode?: string | null;
  countryName?: string | null;
  combinedFollowers: number;
  primaryPlatform: string;
  avatarUrl?: string | null;
  verifiedEmail?: string | null;
  typicalRateMinUsd?: number | null;
  typicalRateMaxUsd?: number | null;
  avgEngagementRate?: number | null;
  isClaimed: boolean;
  handles: {
    youtube?: string | null;
    instagram?: string | null;
    tiktok?: string | null;
  };
  platforms?: {
    youtube?: PlatformMetric | null;
    instagram?: PlatformMetric | null;
    tiktok?: PlatformMetric | null;
  };
  flagshipRates?: FlagshipRateItem[];
}

function formatFollowerCount(num: number): string {
  if (!num) return "0";
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
  return num.toLocaleString();
}

interface ApiResponse {
  success: boolean;
  creators: CreatorItem[];
  pagination: {
    totalCount: number;
    totalPages: number;
    currentPage: number;
    limit: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

const POPULAR_COUNTRIES = [
  { code: "ALL", name: "All Countries" },
  { code: "US", name: "United States" },
  { code: "GB", name: "United Kingdom" },
  { code: "PK", name: "Pakistan" },
  { code: "IN", name: "India" },
  { code: "AE", name: "United Arab Emirates" },
  { code: "CA", name: "Canada" },
  { code: "AU", name: "Australia" },
  { code: "ES", name: "Spain" },
  { code: "DE", name: "Germany" },
];

const FOLLOWER_TIERS = [
  { id: "all", label: "All Tiers" },
  { id: "mega", label: "Mega (1M+ Followers)" },
  { id: "macro", label: "Macro (250K - 1M)" },
  { id: "mid", label: "Mid-Tier (50K - 250K)" },
  { id: "micro", label: "Micro (10K - 50K)" },
  { id: "nano", label: "Nano (< 10K)" },
];

export function CreatorDirectoryView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // URL state sync
  const initialSearch = searchParams.get("search") || "";
  const initialPlatform = searchParams.get("platform") || "all";
  const initialCountry = searchParams.get("country") || "ALL";
  const initialNiche = searchParams.get("nicheId") || "";
  const initialTier = searchParams.get("tier") || "all";
  const initialSort = searchParams.get("sort") || "followers_desc";
  const initialPage = parseInt(searchParams.get("page") || "1", 10);

  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [debouncedSearch, setDebouncedSearch] = useState(initialSearch);
  const [platform, setPlatform] = useState(initialPlatform);
  const [country, setCountry] = useState(initialCountry);
  const [nicheId, setNicheId] = useState(initialNiche);
  const [tier, setTier] = useState(initialTier);
  const [sort, setSort] = useState(initialSort);
  const [page, setPage] = useState(initialPage);

  const [data, setData] = useState<ApiResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1);
    }, 350);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Sync state to URL and fetch data
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    const params = new URLSearchParams();

    if (debouncedSearch.trim()) params.set("search", debouncedSearch.trim());
    if (platform && platform !== "all") params.set("platform", platform);
    if (country && country !== "ALL") params.set("country", country);
    if (nicheId) params.set("nicheId", nicheId);
    if (tier && tier !== "all") params.set("tier", tier);
    if (sort) params.set("sort", sort);
    if (page > 1) params.set("page", page.toString());
    params.set("limit", "24");

    const queryStr = params.toString();
    startTransition(() => {
      router.replace(`/creators${queryStr ? `?${queryStr}` : ""}`, { scroll: false });
    });

    try {
      const res = await fetch(`/api/creators?${queryStr}`);
      const json = await res.json();
      if (json.success) {
        setData(json);
      }
    } catch (err) {
      console.error("Failed to load creators:", err);
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch, platform, country, nicheId, tier, sort, page, router]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleResetFilters = () => {
    setSearchTerm("");
    setDebouncedSearch("");
    setPlatform("all");
    setCountry("ALL");
    setNicheId("");
    setTier("all");
    setSort("followers_desc");
    setPage(1);
  };

  const hasActiveFilters =
    Boolean(debouncedSearch.trim()) ||
    platform !== "all" ||
    country !== "ALL" ||
    Boolean(nicheId) ||
    tier !== "all";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Hero Header */}
      <div className="space-y-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
          <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          <span>Institutional Creator Discovery Protocol</span>
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
            Creator Commercial Directory
          </h1>
          <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 max-w-3xl leading-relaxed">
            Search multi-platform creators with verified cross-network reach,
            empirical SignCollab market valuations, and direct bilateral legal agreement execution.
          </p>
        </div>

        {/* Global Search and Platform Switcher */}
        <div className="pt-2 flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by creator name, channel brand, handle (@mkbhd), or slug..."
              className="w-full pl-10 pr-10 py-3 text-sm rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-2xs"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Platform Filter Buttons */}
          <div className="inline-flex p-1 bg-zinc-100 dark:bg-zinc-800/80 rounded-xl shrink-0">
            {[
              { id: "all", label: "All Platforms" },
              { id: "youtube", label: "YouTube" },
              { id: "instagram", label: "Instagram" },
              { id: "tiktok", label: "TikTok" },
            ].map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => {
                  setPlatform(p.id);
                  setPage(1);
                }}
                className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg transition ${
                  platform === p.id
                    ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-xs font-bold"
                    : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                }`}
              >
                {p.id === "youtube" && <YouTubeIcon className="w-3.5 h-3.5 shrink-0" />}
                {p.id === "instagram" && <InstagramIcon className="w-3.5 h-3.5 shrink-0" />}
                {p.id === "tiktok" && <TikTokIcon className="w-3.5 h-3.5 shrink-0" />}
                <span>{p.label}</span>
              </button>
            ))}
          </div>

          {/* Mobile Filter Toggle */}
          <button
            type="button"
            onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
            className="md:hidden flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Filters</span>
          </button>
        </div>
      </div>

      {/* Main Directory Body: Sidebar + Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Left Filter Sidebar */}
        <aside
          className={`space-y-6 md:block ${
            mobileFilterOpen ? "block" : "hidden"
          } p-5 md:p-0 rounded-2xl md:rounded-none bg-white md:bg-transparent dark:bg-zinc-900 md:dark:bg-transparent border md:border-0 border-zinc-200 dark:border-zinc-800`}
        >
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-blue-500" />
              <span>Filter Criteria</span>
            </h3>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                Reset
              </button>
            )}
          </div>

          {/* Follower Tiers */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Follower Bracket
            </label>
            <div className="space-y-1">
              {FOLLOWER_TIERS.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => {
                    setTier(t.id);
                    setPage(1);
                  }}
                  className={`w-full text-left px-3 py-1.5 rounded-lg text-xs transition flex items-center justify-between ${
                    tier === t.id
                      ? "bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-semibold"
                      : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/60"
                  }`}
                >
                  <span>{t.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Primary Niche */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Primary Niche
            </label>
            <select
              value={nicheId}
              onChange={(e) => {
                setNicheId(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="">All Niches (Global)</option>
              {PRIMARY_NICHES.map((n) => (
                <option key={n.id} value={n.id}>
                  {n.name}
                </option>
              ))}
            </select>
          </div>

          {/* Country Selector */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Primary Geography
            </label>
            <select
              value={country}
              onChange={(e) => {
                setCountry(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              {POPULAR_COUNTRIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Order */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Sort Sequence
            </label>
            <select
              value={sort}
              onChange={(e) => {
                setSort(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="followers_desc">Most Followers (Default)</option>
              <option value="followers_asc">Least Followers</option>
              <option value="rate_desc">Highest Estimated Rate</option>
              <option value="rate_asc">Lowest Estimated Rate</option>
              <option value="name_asc">Alphabetical (A-Z)</option>
              <option value="recent">Recently Discovered</option>
            </select>
          </div>
        </aside>

        {/* Right Creators Grid */}
        <section className="md:col-span-3 space-y-6">
          {/* Status bar */}
          <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
            <div>
              {isLoading ? (
                <span>Auditing creators database...</span>
              ) : (
                <span>
                  Found <strong className="text-zinc-900 dark:text-white">{data?.pagination.totalCount || 0}</strong> creators
                </span>
              )}
            </div>

            {data && data.pagination.totalPages > 1 && (
              <div>
                Page {data.pagination.currentPage} of {data.pagination.totalPages}
              </div>
            )}
          </div>

          {/* Grid of Cards */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="p-5 rounded-[9px] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 animate-pulse space-y-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-full bg-zinc-200 dark:bg-zinc-800" />
                    <div className="space-y-2 flex-1">
                      <div className="w-24 h-4 bg-zinc-200 dark:bg-zinc-800 rounded" />
                      <div className="w-16 h-3 bg-zinc-200 dark:bg-zinc-800 rounded" />
                    </div>
                  </div>
                  <div className="w-full h-8 bg-zinc-100 dark:bg-zinc-800/60 rounded" />
                </div>
              ))}
            </div>
          ) : data && data.creators.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {data.creators.map((creator) => {
                const name = creator.brandName || creator.canonicalName;

                return (
                  <div
                    key={creator.id}
                    className="group relative flex flex-col justify-between p-5 rounded-[9px] bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 shadow-2xs hover:shadow-md hover:border-zinc-300 dark:hover:border-zinc-700 transition duration-200"
                  >
                    {/* Top Content: Anchored firmly at the top */}
                    <div className="space-y-0 divide-y divide-zinc-100 dark:divide-zinc-800/60">
                      {/* Header: Avatar, Identity & Primary Audience/Niches */}
                      <div className="pb-3 space-y-2">
                        <div className="flex items-center gap-3.5">
                          <Link
                            href={`/creators/${creator.slug}`}
                            className="relative shrink-0 block"
                          >
                            {creator.avatarUrl ? (
                              <>
                                <img
                                  src={creator.avatarUrl}
                                  alt={name}
                                  referrerPolicy="no-referrer"
                                  className="w-14 h-14 rounded-full object-cover ring-1 ring-zinc-200 dark:ring-zinc-700 hover:opacity-90 transition"
                                  onError={(e) => {
                                    const target = e.currentTarget;
                                    target.style.display = "none";
                                    const fallback = target.nextElementSibling as HTMLElement | null;
                                    if (fallback) fallback.style.display = "flex";
                                  }}
                                />
                                <div
                                  style={{ display: "none" }}
                                  className="w-14 h-14 rounded-full bg-zinc-100 dark:bg-zinc-800 ring-1 ring-zinc-200 dark:ring-zinc-700 items-center justify-center font-bold text-lg text-zinc-500"
                                >
                                  {name.charAt(0)}
                                </div>
                              </>
                            ) : (
                              <div className="w-14 h-14 rounded-full bg-zinc-100 dark:bg-zinc-800 ring-1 ring-zinc-200 dark:ring-zinc-700 flex items-center justify-center font-bold text-lg text-zinc-500">
                                {name.charAt(0)}
                              </div>
                            )}
                            {creator.isClaimed && (
                              <div className="absolute bottom-0 right-0 p-0.5 bg-blue-600 rounded-full text-white ring-2 ring-white dark:ring-zinc-900 shadow-xs">
                                <ShieldCheck className="w-3 h-3" />
                              </div>
                            )}
                          </Link>

                          <div className="space-y-0.5 min-w-0 flex-1">
                            <Link
                              href={`/creators/${creator.slug}`}
                              className="block group-hover:text-blue-600 dark:group-hover:text-blue-400 transition"
                            >
                              <h3 className="text-base font-bold text-zinc-900 dark:text-white truncate">
                                {name}
                              </h3>
                            </Link>
                            {creator.canonicalName && (
                              <p className="text-xs text-zinc-400 dark:text-zinc-500 font-medium truncate uppercase tracking-wider">
                                {creator.canonicalName}
                              </p>
                            )}
                            {creator.primaryNicheName && (
                              <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 truncate" title={creator.primaryNicheName}>
                                {creator.primaryNicheName}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Primary Audience & Sub-Niche (Directly below identity, no divider) */}
                        <div className="space-y-1 text-xs pt-0.5">
                          {(creator.countryName || creator.countryCode) && (
                            <div className="text-zinc-700 dark:text-zinc-300">
                              <span className="text-zinc-500 dark:text-zinc-400 font-medium">Primary Audience: </span>
                              <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                                {creator.countryName || creator.countryCode} {creator.countryCode ? `(${creator.countryCode})` : ""}
                              </span>
                            </div>
                          )}
                          {creator.subNicheName && (
                            <div className="text-zinc-600 dark:text-zinc-400 truncate" title={creator.subNicheName}>
                              {creator.subNicheName}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Platform Rates List (Flat, anchored directly below header) */}
                      {(() => {
                        const activePlatforms: Array<{
                          platform: "youtube" | "instagram" | "tiktok";
                          handle: string;
                          followers: number;
                          unit: string;
                          metricsText: string;
                          deliverableName: string;
                          rate?: FlagshipRateItem;
                        }> = [];

                        if (
                          creator.platforms?.youtube &&
                          (creator.platforms.youtube.followers > 0 || creator.platforms.youtube.handle)
                        ) {
                          const m = creator.platforms.youtube;
                          const rate = creator.flagshipRates?.find(
                            (r) => r.platform === "youtube" || r.format === "yt_dedicated"
                          );
                          const lfEr = Number(m.lfEr || m.er || rate?.erPercent || 1.8);
                          const sfEr = Number(m.sfEr || 2.5);
                          activePlatforms.push({
                            platform: "youtube",
                            handle: m.handle,
                            followers: m.followers,
                            unit: "Subscriber",
                            metricsText: `LF ER: ${lfEr.toFixed(2).replace(/\.00$/, "")}%  SF ER: ${sfEr.toFixed(2).replace(/\.00$/, "")}%`,
                            deliverableName: "Youtube LF",
                            rate,
                          });
                        }

                        if (
                          creator.platforms?.instagram &&
                          (creator.platforms.instagram.followers > 0 || creator.platforms.instagram.handle)
                        ) {
                          const m = creator.platforms.instagram;
                          const rate = creator.flagshipRates?.find(
                            (r) => r.platform === "instagram" || r.format === "ig_reel"
                          );
                          const er = Number(m.er || rate?.erPercent || 1.47);
                          activePlatforms.push({
                            platform: "instagram",
                            handle: m.handle,
                            followers: m.followers,
                            unit: "Followers",
                            metricsText: `ER: ${er.toFixed(2).replace(/\.00$/, "")}%`,
                            deliverableName: "Instagram Reel",
                            rate,
                          });
                        }

                        if (
                          creator.platforms?.tiktok &&
                          (creator.platforms.tiktok.followers > 0 || creator.platforms.tiktok.handle)
                        ) {
                          const m = creator.platforms.tiktok;
                          const rate = creator.flagshipRates?.find(
                            (r) => r.platform === "tiktok" || r.format === "tiktok_video"
                          );
                          const er = Number(m.er || rate?.erPercent || 4.24);
                          activePlatforms.push({
                            platform: "tiktok",
                            handle: m.handle,
                            followers: m.followers,
                            unit: "Followers",
                            metricsText: `ER: ${er.toFixed(2).replace(/\.00$/, "")}%`,
                            deliverableName: "TikTok Video",
                            rate,
                          });
                        }

                        // Order by audience size descending (primary flagship platform at top)
                        activePlatforms.sort((a, b) => b.followers - a.followers);

                        if (activePlatforms.length === 0) {
                          return (
                            <div className="py-4 text-center text-xs text-zinc-400 dark:text-zinc-500">
                              No active verified channels linked
                            </div>
                          );
                        }

                        return (
                          <div className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                            {activePlatforms.map((p) => (
                              <div
                                key={p.platform}
                                className="py-3 space-y-1"
                              >
                                {/* Line 1: SVG Icon + Full Handle */}
                                <div className="flex items-center gap-2">
                                  <PlatformBadge platform={p.platform} size="sm" />
                                  <span className="font-bold text-zinc-900 dark:text-white font-mono text-xs truncate">
                                    @{p.handle}
                                  </span>
                                </div>

                                {/* Line 2: Audience Metrics & ER */}
                                <div className="text-xs font-mono text-zinc-600 dark:text-zinc-400 flex flex-wrap items-center gap-x-2 gap-y-0.5">
                                  <span className="font-bold text-zinc-900 dark:text-zinc-200">
                                    {formatFollowerCount(p.followers)} {p.unit}
                                  </span>
                                  {p.metricsText && (
                                    <span className="text-zinc-600 dark:text-zinc-400">
                                      {p.metricsText}
                                    </span>
                                  )}
                                </div>

                                {/* Line 3: Flagship Deliverable & Typical Estimate */}
                                {p.rate ? (
                                  <div className="text-xs font-medium text-zinc-900 dark:text-zinc-100 pt-0.5">
                                    <span>{p.deliverableName}: </span>
                                    <span className="font-bold font-mono text-zinc-900 dark:text-white">
                                      {p.rate.formattedRecommended}
                                    </span>
                                    <span className="text-zinc-500 dark:text-zinc-400 text-[11px] font-normal ml-1">
                                      (Typical Estimate)
                                    </span>
                                  </div>
                                ) : null}

                                {/* Line 4: Estimated Range */}
                                {p.rate ? (
                                  <div className="text-xs font-mono text-zinc-500 dark:text-zinc-400">
                                    <span className="text-zinc-500 dark:text-zinc-400 font-medium">Estimated Range: </span>
                                    <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                                      {p.rate.formattedLow} – {p.rate.formattedHigh}
                                    </span>
                                  </div>
                                ) : (
                                  <div className="text-[10px] text-zinc-400 dark:text-zinc-500 font-mono italic pt-0.5">
                                    Calibrating empirical 16-knot rate...
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        );
                      })()}
                    </div>

                    {/* Bottom Action Button: Pinned to bottom */}
                    <div className="pt-4 mt-auto">
                      <Link
                        href={`/creators/${creator.slug}`}
                        className="w-full flex items-center justify-center gap-2 py-3 px-4 text-xs font-bold rounded-full bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100 text-white transition-all shadow-xs group-hover:bg-blue-600 dark:group-hover:bg-blue-500 dark:group-hover:text-white"
                      >
                        <span>See Complete Detail</span>
                        <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16 space-y-4 rounded-[9px] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
              <Users className="w-10 h-10 text-zinc-400 mx-auto" />
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
                  No creators matched your search criteria
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto">
                  Try broadening your follower tier bracket, removing specific country filters, or searching by a different handle.
                </p>
              </div>
              <button
                type="button"
                onClick={handleResetFilters}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 hover:opacity-90 transition"
              >
                Reset All Filters
              </button>
            </div>
          )}

          {/* Pagination Controls */}
          {data && data.pagination.totalPages > 1 && (
            <div className="flex items-center justify-between pt-6 border-t border-zinc-200 dark:border-zinc-800">
              <button
                type="button"
                disabled={!data.pagination.hasPrevPage}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 disabled:opacity-40 transition"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>

              <div className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                Page {data.pagination.currentPage} of {data.pagination.totalPages}
              </div>

              <button
                type="button"
                disabled={!data.pagination.hasNextPage}
                onClick={() => setPage((p) => p + 1)}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 disabled:opacity-40 transition"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
