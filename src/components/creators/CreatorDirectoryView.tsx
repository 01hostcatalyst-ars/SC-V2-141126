"use client";

import React, { useState, useEffect, useCallback, useTransition, useRef, useId } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, Users, ChevronLeft, ChevronRight, ChevronDown, Check, X, ArrowUpDown } from "lucide-react";
import { PRIMARY_NICHES } from "@/lib/calculator/constants";
import {
  YouTubeIcon,
  InstagramIcon,
  TikTokIcon,
} from "@/components/icons/PlatformIcons";
import { CreatorCard, CreatorItem } from "./CreatorCard";
import { serializeJsonLd } from '@/lib/structured-data';
import { buildCreatorsDirectoryJsonLd, type DirectoryCreatorItem } from "@/lib/creators/directory-schema";

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

const SORT_OPTIONS = [
  { value: "followers_desc", label: "Most followers" },
  { value: "followers_asc", label: "Fewest followers" },
  { value: "rate_desc", label: "Highest estimated rate" },
  { value: "rate_asc", label: "Lowest estimated rate" },
  { value: "name_asc", label: "Name: A–Z" },
  { value: "recent", label: "Recently discovered" },
];

function DirectoryFilterChip({ label, value, options, onChange, active = false, sortControl = false }: {
  label: string;
  value: string;
  options: Array<{ value: string; label: string }>;
  onChange: (value: string) => void;
  active?: boolean;
  sortControl?: boolean;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const id = useId();
  const [anchor, setAnchor] = useState({ left: 0, top: 0 });
  const selected = options.find((option) => option.value === value)?.label;
  const open = () => {
    const rect = trigger.current?.getBoundingClientRect();
    if (rect) setAnchor({ left: Math.max(12, Math.min(rect.left, window.innerWidth - 332)), top: Math.min(rect.bottom + 8, Math.max(12, window.innerHeight - 360)) });
    dialog.current?.showModal();
  };
  return (
    <>
      <button ref={trigger} type="button" className="directory-filter-chip" data-active={active} aria-haspopup="dialog" onClick={open}>
        {sortControl && <ArrowUpDown aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />}
        <span>{sortControl ? selected : active ? `${label}: ${selected}` : label}</span>
        <ChevronDown aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
      </button>
      <dialog ref={dialog} className="directory-filter-dialog" aria-labelledby={id} style={{ "--filter-left": `${anchor.left}px`, "--filter-top": `${anchor.top}px` } as React.CSSProperties} onClick={(event) => { if (event.target === event.currentTarget) dialog.current?.close(); }}>
        <div className="directory-filter-panel">
          <div className="directory-filter-panel-heading"><h2 id={id}>{sortControl ? "Sort creators" : label === "Followers" ? "Combined follower bracket" : label}</h2><button type="button" aria-label={`Close ${label}`} onClick={() => dialog.current?.close()}><X aria-hidden="true" className="h-4 w-4" /></button></div>
          <div className="directory-filter-options" role="group" aria-label={label}>
            {options.map((option) => <button key={option.value} type="button" aria-pressed={value === option.value} onClick={() => { onChange(option.value); dialog.current?.close(); }}><span>{option.label}</span>{value === option.value && <Check aria-hidden="true" className="h-4 w-4 shrink-0" />}</button>)}
          </div>
        </div>
      </dialog>
    </>
  );
}

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
  const [resultQuery, setResultQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const pageSize = 10;

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
    setLoadError(null);
    const params = new URLSearchParams();

    if (debouncedSearch.trim()) params.set("search", debouncedSearch.trim());
    if (platform && platform !== "all") params.set("platform", platform);
    if (country && country !== "ALL") params.set("country", country);
    if (nicheId) params.set("nicheId", nicheId);
    if (tier && tier !== "all") params.set("tier", tier);
    if (sort) params.set("sort", sort);
    if (page > 1) params.set("page", page.toString());
    params.set("limit", String(pageSize));

    const queryStr = params.toString();
    startTransition(() => {
      router.replace(`/creators${queryStr ? `?${queryStr}` : ""}`, { scroll: false });
    });

    try {
      const res = await fetch(`/api/creators?${queryStr}`);
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error("Creator directory request failed");
      }
      setData(json);
      setResultQuery(queryStr);
    } catch {
      setLoadError("We couldn’t load the creator directory. Please try again shortly.");
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch, platform, country, nicheId, tier, sort, page, pageSize, router]);

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

  // Build markup from the exact API result used to render cards, not a second query.
  const visibleSchema = data && !isLoading && !loadError
    ? buildCreatorsDirectoryJsonLd(data.creators.map((creator): DirectoryCreatorItem => ({
        slug: creator.slug,
        name: creator.canonicalName,
        alternateName: creator.brandName,
        creatorType: creator.creatorType,
        avatarUrl: creator.avatarUrl,
        primaryNiche: creator.primaryNicheName || "",
        secondaryNiche: creator.subNicheName,
        countryCode: creator.countryCode,
        countryName: creator.countryName,
        primaryAudienceMarket: creator.primaryAudienceCountry?.name,
        combinedFollowers: creator.combinedFollowers,
        platforms: {
          youtube: creator.platforms?.youtube ? { handle: creator.platforms.youtube.handle, url: `https://www.youtube.com/@${creator.platforms.youtube.handle}`, followerCount: creator.platforms.youtube.followers } : null,
          instagram: creator.platforms?.instagram ? { handle: creator.platforms.instagram.handle, url: `https://www.instagram.com/${creator.platforms.instagram.handle}`, followerCount: creator.platforms.instagram.followers } : null,
          tiktok: creator.platforms?.tiktok ? { handle: creator.platforms.tiktok.handle, url: `https://www.tiktok.com/@${creator.platforms.tiktok.handle}`, followerCount: creator.platforms.tiktok.followers } : null,
        },
      })), data.pagination.totalCount, 'https://www.signcollab.com', resultQuery)
    : null;

  return (
    <div className="discovery-shell" data-range-style="soft">
      {visibleSchema && <script id="creator-directory-jsonld" type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(visibleSchema) }} />}

      <div className="discovery-workspace space-y-7">
      {/* Hero Header */}
      <div className="space-y-4">
        <div className="directory-intro">
          <p className="directory-intro-label">Creator discovery</p>
          <h1>Find your next creator.</h1>
          <p className="directory-intro-description">Compare platform performance, audience fit, and estimated rates.</p>
        </div>

        <div className="directory-discovery-controls">
          <div className="directory-search-field relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label="Search creators"
              placeholder="Search creators, brands, or @handles"
              className="w-full pl-10 pr-10 py-3 text-sm rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-2xs"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                aria-label="Clear search"
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Platform Filter Buttons */}
          <div className="directory-platform-tabs inline-flex flex-wrap p-1 bg-zinc-100 dark:bg-zinc-800/80 rounded-xl shrink-0">
            {[
              { id: "all", label: "All Platforms" },
              { id: "youtube", label: "YouTube" },
              { id: "instagram", label: "Instagram" },
              { id: "tiktok", label: "TikTok" },
            ].map((p) => (
              <button
                key={p.id}
                type="button"
                aria-pressed={platform === p.id}
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
                {p.id === "all" && <Users aria-hidden="true" className="w-3.5 h-3.5 shrink-0" />}
                {p.id === "youtube" && <YouTubeIcon className="w-3.5 h-3.5 shrink-0" />}
                {p.id === "instagram" && <InstagramIcon className="w-3.5 h-3.5 shrink-0" />}
                {p.id === "tiktok" && <TikTokIcon className="w-3.5 h-3.5 shrink-0" />}
                <span>{p.id === "all" ? "All" : p.label}</span>
              </button>
            ))}
          </div>

          <div className="directory-chip-toolbar">
            <div className="directory-filter-chips">
              <DirectoryFilterChip label="Country" value={country} active={country !== "ALL"} options={POPULAR_COUNTRIES.map((item) => ({ value: item.code, label: item.name }))} onChange={(value) => { setCountry(value); setPage(1); }} />
              <DirectoryFilterChip label="Niche" value={nicheId} active={Boolean(nicheId)} options={[{ value: "", label: "All niches" }, ...PRIMARY_NICHES.map((item) => ({ value: String(item.id), label: item.name }))]} onChange={(value) => { setNicheId(value); setPage(1); }} />
              <DirectoryFilterChip label="Followers" value={tier} active={tier !== "all"} options={FOLLOWER_TIERS.map((item) => ({ value: item.id, label: item.label }))} onChange={(value) => { setTier(value); setPage(1); }} />
            </div>
            <DirectoryFilterChip label="Sort" value={sort} options={SORT_OPTIONS} sortControl onChange={(value) => { setSort(value); setPage(1); }} />
          </div>
        </div>
      </div>

      <div>
        {/* Right Creators Grid */}
        <section className="min-w-0 space-y-5">
          {/* Status bar */}
          <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
            <div>
              {loadError ? (
                <span>Directory temporarily unavailable</span>
              ) : isLoading ? (
                <span>Loading creators...</span>
              ) : (
                <span>
                  Found <strong className="text-zinc-900 dark:text-white">{data?.pagination.totalCount || 0}</strong> creators
                </span>
              )}
            </div>

            {!loadError && data && data.pagination.totalPages > 1 && (
              <div>
                Page {data.pagination.currentPage} of {data.pagination.totalPages}
              </div>
            )}
          </div>

          {hasActiveFilters && (
            <div className="directory-active-filters" aria-label="Active filters">
              {[
                { key: "search", label: debouncedSearch.trim() ? `Search: ${debouncedSearch.trim()}` : "", clear: () => { setSearchTerm(""); setDebouncedSearch(""); } },
                { key: "platform", label: platform !== "all" ? platform === "youtube" ? "YouTube" : platform === "instagram" ? "Instagram" : "TikTok" : "", clear: () => setPlatform("all") },
                { key: "country", label: country !== "ALL" ? POPULAR_COUNTRIES.find((item) => item.code === country)?.name || country : "", clear: () => setCountry("ALL") },
                { key: "niche", label: nicheId ? PRIMARY_NICHES.find((item) => String(item.id) === nicheId)?.name || nicheId : "", clear: () => setNicheId("") },
                { key: "tier", label: tier !== "all" ? FOLLOWER_TIERS.find((item) => item.id === tier)?.label || tier : "", clear: () => setTier("all") },
              ].filter((item) => item.label).map((item) => <button key={item.key} type="button" aria-label={`Remove ${item.label} filter`} onClick={() => { item.clear(); setPage(1); }}><span>{item.label}</span><X aria-hidden="true" className="h-3 w-3 shrink-0" /></button>)}
              <button type="button" className="directory-clear-filters" onClick={handleResetFilters}>Clear all</button>
            </div>
          )}

          {/* Grid of Cards */}
          {loadError ? (
            <div role="alert" className="rounded-xl border border-zinc-200 bg-white p-8 text-center dark:border-zinc-800 dark:bg-zinc-900">
              <h2 className="text-base font-semibold">Unable to load creators</h2>
              <p className="mt-2 text-sm text-zinc-500">{loadError}</p>
              <button type="button" onClick={() => void fetchData()} className="mt-5 min-h-11 rounded-lg bg-zinc-900 px-5 text-sm font-semibold text-white dark:bg-white dark:text-zinc-900">Try again</button>
            </div>
          ) : isLoading ? (
            <div className="grid grid-cols-1 gap-4">
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
            <div className="grid grid-cols-1 items-start gap-4">
              {data.creators.map((creator) => (
                <CreatorCard key={creator.id} creator={creator} layout="directory" />
              ))}
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
          {!loadError && data && data.pagination.totalPages > 1 && (
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
    </div>
  );
}
