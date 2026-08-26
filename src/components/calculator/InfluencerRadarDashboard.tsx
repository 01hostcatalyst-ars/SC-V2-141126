"use client";

import React, { useState, useRef, useCallback, useMemo } from "react";
import { Platform, DeliverableFormat, PricingInput } from "@/lib/calculator/types";
import { calculateInfluencerRate } from "@/lib/calculator/engine";
import { FORMAT_LABELS } from "@/lib/calculator/constants";

interface DiscoveredPlatformData {
  status: "idle" | "loading" | "ready" | "error";
  username?: string;
  displayName?: string;
  avatarUrl?: string;
  followerCount?: number;
  avgLikes?: number;
  avgComments?: number;
  avgViews?: number;
  engagementRate?: number;
  rateCardItems?: Array<{
    format: DeliverableFormat;
    amount: number;
    formattedAmount: string;
    lowAmount: number;
    formattedLow: string;
    highAmount: number;
    formattedHigh: string;
    currency: string;
  }>;
  error?: string;
  sourceNote?: string;
}

interface ActivityEvent {
  id: string;
  timestamp: string;
  message: string;
  type: "info" | "success" | "discovery";
}

export function InfluencerRadarDashboard() {
  const [inputQuery, setInputQuery] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState<Platform>("instagram");
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Terminal / Activity Feed
  const [activityFeed, setActivityFeed] = useState<ActivityEvent[]>([]);

  // 3-Platform Data States
  const [platforms, setPlatforms] = useState<Record<Platform, DiscoveredPlatformData>>({
    instagram: { status: "idle" },
    youtube: { status: "idle" },
    tiktok: { status: "idle" },
  });

  // Creator General Info
  const [creatorMeta, setCreatorMeta] = useState<{
    displayName: string;
    primaryUsername: string;
    avatarUrl?: string;
    primaryPlatform: Platform;
  } | null>(null);

  // Guard against duplicate in-flight scrapes
  const inFlightScrapes = useRef<Set<string>>(new Set());

  // URL vs Handle Detection
  const isUrl = useMemo(() => {
    const trimmed = inputQuery.trim().toLowerCase();
    return (
      trimmed.startsWith("http://") ||
      trimmed.startsWith("https://") ||
      trimmed.includes("instagram.com") ||
      trimmed.includes("youtube.com") ||
      trimmed.includes("youtu.be") ||
      trimmed.includes("tiktok.com") ||
      trimmed.includes("www.")
    );
  }, [inputQuery]);

  const hasHandleInput = inputQuery.trim().length > 0 && !isUrl;

  const addActivity = useCallback((message: string, type: "info" | "success" | "discovery" = "info") => {
    const newEvent: ActivityEvent = {
      id: `${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
      message,
      type,
    };
    setActivityFeed((prev) => [newEvent, ...prev.slice(0, 9)]);
  }, []);

  // Compute platform-native rate card items using 16-knot formula engine
  const computePlatformRateCards = useCallback(
    (
      platform: Platform,
      followers: number,
      avgLikes: number,
      avgComments: number,
      avgViews: number
    ) => {
      const platformFormats: Record<Platform, DeliverableFormat[]> = {
        instagram: ["ig_reel", "ig_carousel", "ig_static", "ig_story"],
        youtube: ["yt_dedicated", "yt_integrated", "yt_short"],
        tiktok: ["tiktok_video"],
      };

      const formats = platformFormats[platform] || ["ig_reel"];

      return formats.map((fmt, idx) => {
        const pricingInput: PricingInput = {
          creator: {
            followerCount: followers,
            last3PostsAvgLikes: avgLikes,
            last3PostsAvgComments: avgComments,
            last3PostsAvgViews: avgViews,
            primaryPlatform: platform,
            primaryNicheId: 8, // Lifestyle Baseline (1.00x)
            regionCode: "US",
          },
          deliverables: [{ id: String(idx + 1), platform, format: fmt, quantity: 1 }],
          commercialTerms: { usageRights: { scope: "organic_repost", duration: "30_days" } },
        };

        const res = calculateInfluencerRate(pricingInput);
        return {
          format: fmt,
          amount: res.valuationRange.typicalMedian,
          formattedAmount: res.valuationRange.formatted.typical,
          lowAmount: res.valuationRange.lowP25,
          formattedLow: res.valuationRange.formatted.low,
          highAmount: res.valuationRange.highP75,
          formattedHigh: res.valuationRange.formatted.high,
          currency: res.metrics.currency,
        };
      });
    },
    []
  );

  // Scrape single platform helper using dedicated tested scrapers (/api/scrapers/*)
  const scrapePlatform = useCallback(
    async (
      targetInput: string,
      targetPlatform: Platform,
      sourceNote?: string
    ) => {
      const scrapeKey = `${targetPlatform}:${targetInput.toLowerCase().trim()}`;
      if (inFlightScrapes.current.has(scrapeKey)) return;
      inFlightScrapes.current.add(scrapeKey);

      setPlatforms((prev) => ({
        ...prev,
        [targetPlatform]: {
          ...prev[targetPlatform],
          status: "loading",
          sourceNote: sourceNote || `Direct scan for ${targetPlatform}`,
        },
      }));

      addActivity(
        sourceNote ? `Autonomous Sync: ${sourceNote}` : `Connecting to /api/scrapers/${targetPlatform} for ${targetInput}...`,
        sourceNote ? "discovery" : "info"
      );

      try {
        let endpoint = `/api/scrapers/${targetPlatform}`;
        const res = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: targetInput.trim() }),
        });

        const json = await res.json();
        if (!res.ok || !json.success || !json.data) {
          throw new Error(json.error || `Unable to resolve ${targetPlatform} data.`);
        }

        const data = json.data;
        let followerCount = 0;
        let avgLikes = 0;
        let avgComments = 0;
        let avgViews = 0;
        let username = "";
        let displayName = "";
        let avatarUrl = "";
        let biography = "";
        let engagementRate = 0;
        const externalLinks: Array<{ platform: Platform; url: string }> = [];

        if (targetPlatform === "instagram") {
          const profile = data.profile || {};
          const stats = data.stats || {};
          followerCount = profile.followerCount || 0;
          avgLikes = stats.avgLikesPerPost || 0;
          avgComments = stats.avgCommentsPerPost || 0;
          engagementRate = stats.engagementRate || 0;
          username = profile.username || targetInput.replace(/^@/, "");
          displayName = profile.fullName || profile.username || username;
          avatarUrl = profile.avatarUrl || "";
          biography = profile.biography || "";

          // Extract external links
          if (Array.isArray(profile.externalUrls)) {
            for (const u of profile.externalUrls) {
              if (u.url?.includes("youtube.com") || u.url?.includes("youtu.be")) {
                externalLinks.push({ platform: "youtube", url: u.url });
              }
              if (u.url?.includes("tiktok.com")) {
                externalLinks.push({ platform: "tiktok", url: u.url });
              }
            }
          }
          if (biography) {
            const ytMatch = biography.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:@|c\/|user\/)?|youtu\.be\/)([a-zA-Z0-9._-]+)/i);
            if (ytMatch && !externalLinks.some((l) => l.platform === "youtube")) {
              externalLinks.push({ platform: "youtube", url: `https://www.youtube.com/@${ytMatch[1]}` });
            }
            const ttMatch = biography.match(/(?:https?:\/\/)?(?:www\.)?tiktok\.com\/@?([a-zA-Z0-9._]+)/i);
            if (ttMatch && !externalLinks.some((l) => l.platform === "tiktok")) {
              externalLinks.push({ platform: "tiktok", url: `https://www.tiktok.com/@${ttMatch[1]}` });
            }
          }
        } else if (targetPlatform === "youtube") {
          const channel = data.channel || {};
          const stats = data.stats || {};
          followerCount = channel.subscriberCount || 0;
          avgViews = stats.avgViewsPerVideo || 0;
          avgLikes = stats.avgLikesPerVideo || 0;
          avgComments = stats.avgCommentsPerVideo || 0;
          engagementRate = stats.engagementRate || 0;
          username = channel.handle || channel.title || targetInput;
          displayName = channel.title || username;
          avatarUrl = channel.avatarUrl || "";
          biography = channel.description || "";

          if (Array.isArray(channel.externalLinks)) {
            for (const u of channel.externalLinks) {
              if (u.url?.includes("instagram.com")) {
                externalLinks.push({ platform: "instagram", url: u.url });
              }
              if (u.url?.includes("tiktok.com")) {
                externalLinks.push({ platform: "tiktok", url: u.url });
              }
            }
          }
          if (biography) {
            const igMatch = biography.match(/(?:https?:\/\/)?(?:www\.)?instagram\.com\/([a-zA-Z0-9._]+)/i);
            if (igMatch && !externalLinks.some((l) => l.platform === "instagram")) {
              externalLinks.push({ platform: "instagram", url: `https://www.instagram.com/${igMatch[1].replace(/\/$/, '')}` });
            }
            const ttMatch = biography.match(/(?:https?:\/\/)?(?:www\.)?tiktok\.com\/@?([a-zA-Z0-9._]+)/i);
            if (ttMatch && !externalLinks.some((l) => l.platform === "tiktok")) {
              externalLinks.push({ platform: "tiktok", url: `https://www.tiktok.com/@${ttMatch[1].replace(/\/$/, '')}` });
            }
          }
        } else if (targetPlatform === "tiktok") {
          const profile = data.profile || {};
          const stats = data.stats || {};
          followerCount = profile.followerCount || 0;
          avgViews = stats.avgViewsPerVideo || 0;
          avgLikes = stats.avgLikesPerVideo || 0;
          avgComments = stats.avgCommentsPerVideo || 0;
          engagementRate = stats.engagementRate || 0;
          username = profile.username || targetInput.replace(/^@/, "");
          displayName = profile.nickname || profile.username || username;
          avatarUrl = profile.avatarUrl || "";
          biography = profile.biography || "";
          const bioLink = profile.bioLink || "";

          if (bioLink.includes("youtube.com") || bioLink.includes("youtu.be")) {
            externalLinks.push({ platform: "youtube", url: bioLink });
          }
          if (bioLink.includes("instagram.com")) {
            externalLinks.push({ platform: "instagram", url: bioLink });
          }

          if (biography) {
            const ytMatch = biography.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:@|c\/|user\/)?|youtu\.be\/)([a-zA-Z0-9._-]+)/i);
            if (ytMatch && !externalLinks.some((l) => l.platform === "youtube")) {
              externalLinks.push({ platform: "youtube", url: `https://www.youtube.com/@${ytMatch[1]}` });
            }
            const igMatch = biography.match(/(?:https?:\/\/)?(?:www\.)?instagram\.com\/([a-zA-Z0-9._]+)/i);
            if (igMatch && !externalLinks.some((l) => l.platform === "instagram")) {
              externalLinks.push({ platform: "instagram", url: `https://www.instagram.com/${igMatch[1]}` });
            }
          }
        }

        // Compute 16-knot rate sheet dynamically
        const rateCardItems = computePlatformRateCards(
          targetPlatform,
          followerCount,
          avgLikes,
          avgComments,
          avgViews
        );

        setPlatforms((prev) => ({
          ...prev,
          [targetPlatform]: {
            status: "ready",
            username,
            displayName,
            avatarUrl,
            followerCount,
            avgLikes,
            avgComments,
            avgViews,
            engagementRate,
            rateCardItems,
            sourceNote,
          },
        }));

        addActivity(
          `Verified ${targetPlatform.toUpperCase()}: @${username} · ${followerCount.toLocaleString()} ${targetPlatform === "youtube" ? "Subscribers" : "Followers"} (${engagementRate}% ER) ${data.isCached ? "(⚡ 24h DB Cache)" : "(📡 Fresh Scan)"}`,
          "success"
        );

        // Update creator general profile if primary
        setCreatorMeta((prev) => {
          if (!prev) {
            return {
              displayName: displayName || username,
              primaryUsername: username,
              avatarUrl,
              primaryPlatform: targetPlatform,
            };
          }
          return prev;
        });

        // Trigger autonomous parallel scans for discovered links
        for (const link of externalLinks) {
          if (link.platform !== targetPlatform) {
            setPlatforms((current) => {
              if (current[link.platform].status === "idle") {
                addActivity(
                  `Discovered ${link.platform.toUpperCase()} profile in @${username}'s bio link (${link.url}). Initiating autonomous sync...`,
                  "discovery"
                );
                setTimeout(() => {
                  scrapePlatform(
                    link.url,
                    link.platform,
                    `Discovered via @${username}'s ${targetPlatform} bio link`
                  );
                }, 150);
              }
              return current;
            });
          }
        }
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : `Failed to fetch ${targetPlatform}`;
        setPlatforms((prev) => ({
          ...prev,
          [targetPlatform]: {
            status: "error",
            error: errorMsg,
          },
        }));
        addActivity(`Notice on ${targetPlatform}: ${errorMsg}`, "info");
      } finally {
        inFlightScrapes.current.delete(scrapeKey);
      }
    },
    [addActivity, computePlatformRateCards]
  );

  // Main Form Submit
  const handleStart = async (e: React.FormEvent) => {
    e.preventDefault();
    const query = inputQuery.trim();
    if (!query) return;

    setIsSearching(true);
    setHasSearched(true);
    setActivityFeed([]);
    setCreatorMeta(null);

    // Reset platform states
    setPlatforms({
      instagram: { status: "idle" },
      youtube: { status: "idle" },
      tiktok: { status: "idle" },
    });

    let initialTargetPlatform: Platform = selectedPlatform;
    if (isUrl) {
      const lower = query.toLowerCase();
      if (lower.includes("youtube.com") || lower.includes("youtu.be")) initialTargetPlatform = "youtube";
      else if (lower.includes("tiktok.com")) initialTargetPlatform = "tiktok";
      else initialTargetPlatform = "instagram";
    }

    await scrapePlatform(query, initialTargetPlatform);
    setIsSearching(false);
  };

  const handleQuickTest = (url: string, plat: Platform) => {
    setInputQuery(url);
    setSelectedPlatform(plat);
  };

  // Compute Total Combined Reach
  const totalAudienceCount = useMemo(() => {
    let sum = 0;
    if (platforms.instagram.status === "ready") sum += platforms.instagram.followerCount || 0;
    if (platforms.youtube.status === "ready") sum += platforms.youtube.followerCount || 0;
    if (platforms.tiktok.status === "ready") sum += platforms.tiktok.followerCount || 0;
    return sum;
  }, [platforms]);

  const verifiedChannelsCount = useMemo(() => {
    let count = 0;
    if (platforms.instagram.status === "ready") count++;
    if (platforms.youtube.status === "ready") count++;
    if (platforms.tiktok.status === "ready") count++;
    return count;
  }, [platforms]);

  // Compute Omnichannel Bundles (Starter & Full Pack)
  const bundleOffers = useMemo(() => {
    if (verifiedChannelsCount < 2) return null;

    // 1. Starter Cross-Post Bundle
    const starterDeliverables: Array<{ id: string; platform: Platform; format: DeliverableFormat; quantity: number }> = [];
    if (platforms.instagram.status === "ready") {
      starterDeliverables.push({ id: "1", platform: "instagram", format: "ig_reel", quantity: 1 });
    }
    if (platforms.tiktok.status === "ready") {
      starterDeliverables.push({ id: "2", platform: "tiktok", format: "tiktok_video", quantity: 1 });
    } else if (platforms.youtube.status === "ready") {
      starterDeliverables.push({ id: "2", platform: "youtube", format: "yt_short", quantity: 1 });
    }

    const starterPrimary = platforms.instagram.status === "ready" ? platforms.instagram : platforms.youtube;
    const starterInput: PricingInput = {
      creator: {
        followerCount: starterPrimary.followerCount || 25000,
        last3PostsAvgLikes: starterPrimary.avgLikes || 500,
        last3PostsAvgComments: starterPrimary.avgComments || 25,
        last3PostsAvgViews: starterPrimary.avgViews,
        primaryPlatform: "instagram",
        primaryNicheId: 8,
      },
      deliverables: starterDeliverables,
      commercialTerms: { usageRights: { scope: "organic_repost", duration: "30_days" } },
    };
    const starterCalc = calculateInfluencerRate(starterInput);

    // 2. Full Omnichannel Authority Pack
    const authorityDeliverables: Array<{ id: string; platform: Platform; format: DeliverableFormat; quantity: number }> = [];
    if (platforms.youtube.status === "ready") {
      authorityDeliverables.push({ id: "1", platform: "youtube", format: "yt_dedicated", quantity: 1 });
    }
    if (platforms.instagram.status === "ready") {
      authorityDeliverables.push({ id: "2", platform: "instagram", format: "ig_reel", quantity: 1 });
    }
    if (platforms.tiktok.status === "ready") {
      authorityDeliverables.push({ id: "3", platform: "tiktok", format: "tiktok_video", quantity: 1 });
    }

    const authInput: PricingInput = {
      creator: {
        followerCount: totalAudienceCount || 50000,
        last3PostsAvgLikes: 1000,
        last3PostsAvgComments: 50,
        primaryPlatform: "youtube",
        primaryNicheId: 8,
      },
      deliverables: authorityDeliverables,
      commercialTerms: { usageRights: { scope: "paid_partnership_ads", duration: "30_days" } },
    };
    const authCalc = calculateInfluencerRate(authInput);

    return {
      starter: {
        title: "Cross-Platform Starter Combo",
        subtitle: starterDeliverables.map((d) => FORMAT_LABELS[d.format]?.tag || d.format).join(" + "),
        typicalFormatted: starterCalc.valuationRange.formatted.typical,
        lowFormatted: starterCalc.valuationRange.formatted.low,
        highFormatted: starterCalc.valuationRange.formatted.high,
        savings: starterCalc.lineItems.bundleDiscountAmountUSD,
      },
      authority: {
        title: "Omnichannel 360 Authority Pack",
        subtitle: authorityDeliverables.map((d) => FORMAT_LABELS[d.format]?.tag || d.format).join(" + "),
        typicalFormatted: authCalc.valuationRange.formatted.typical,
        lowFormatted: authCalc.valuationRange.formatted.low,
        highFormatted: authCalc.valuationRange.formatted.high,
        savings: authCalc.lineItems.bundleDiscountAmountUSD,
      },
    };
  }, [verifiedChannelsCount, platforms, totalAudienceCount]);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">
      {/* ========================================================= */}
      {/* SECTION 1: MINIMAL SEARCH & RADAR INPUT                   */}
      {/* ========================================================= */}
      <div className="w-full max-w-xl mx-auto text-center space-y-4">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-gray-100 border border-gray-200 text-gray-700 text-[11px] font-medium tracking-wide">
            <span className="w-1.5 h-1.5 rounded-full bg-gray-900" />
            <span>2025–2026 Multi-Channel Rate Engine</span>
          </div>

          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-950">
            Influencer Rate Calculator
          </h1>

          <p className="text-xs text-gray-500 max-w-md mx-auto leading-relaxed">
            Enter a creator profile link or handle. The autonomous radar will evaluate engagement and discover linked channels.
          </p>
        </div>

        {/* Search Container */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-3 sm:p-3.5 space-y-2.5 text-left">
          <form onSubmit={handleStart} className="space-y-2.5">
            <div className="relative flex items-center bg-gray-50/80 rounded-xl border border-gray-200 focus-within:border-gray-900 focus-within:bg-white focus-within:ring-1 focus-within:ring-gray-900 transition-all p-1">
              <div className="pl-3 pr-1 text-gray-400 shrink-0">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.75"
                    d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                  />
                </svg>
              </div>

              <input
                type="text"
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                placeholder="Paste URL or enter handle (e.g. @irfanjunejo)"
                className="flex-1 px-2.5 py-1.5 text-xs sm:text-sm text-gray-900 placeholder:text-gray-400 bg-transparent outline-none font-medium"
              />

              <button
                type="submit"
                disabled={isSearching || !inputQuery.trim()}
                className="px-4 py-2 bg-gray-950 hover:bg-black disabled:opacity-40 text-white font-semibold text-xs rounded-lg transition-all shadow-2xs flex items-center justify-center gap-1.5 shrink-0 cursor-pointer disabled:cursor-not-allowed"
              >
                {isSearching ? (
                  <>
                    <svg className="w-3.5 h-3.5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      />
                    </svg>
                    <span>Scanning</span>
                  </>
                ) : (
                  <>
                    <span>Start</span>
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </>
                )}
              </button>
            </div>

            {/* Conditional Platform Selector (Only for handle) */}
            {hasHandleInput && (
              <div className="flex items-center justify-between p-2 rounded-xl bg-gray-50/70 border border-gray-150 text-xs animate-fadeIn">
                <span className="text-gray-500 font-medium text-[11px]">
                  Handle Platform:
                </span>
                <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-gray-200 shadow-2xs">
                  <button
                    type="button"
                    onClick={() => setSelectedPlatform("instagram")}
                    className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-all cursor-pointer ${
                      selectedPlatform === "instagram"
                        ? "bg-gray-950 text-white shadow-2xs"
                        : "text-gray-600 hover:text-gray-950 hover:bg-gray-100"
                    }`}
                  >
                    Instagram
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedPlatform("youtube")}
                    className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-all cursor-pointer ${
                      selectedPlatform === "youtube"
                        ? "bg-gray-950 text-white shadow-2xs"
                        : "text-gray-600 hover:text-gray-950 hover:bg-gray-100"
                    }`}
                  >
                    YouTube
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedPlatform("tiktok")}
                    className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-all cursor-pointer ${
                      selectedPlatform === "tiktok"
                        ? "bg-gray-950 text-white shadow-2xs"
                        : "text-gray-600 hover:text-gray-950 hover:bg-gray-100"
                    }`}
                  >
                    TikTok
                  </button>
                </div>
              </div>
            )}
          </form>

          {/* Quick Examples */}
          <div className="pt-1.5 border-t border-gray-100 flex flex-wrap items-center gap-1.5 text-[11px] text-gray-500">
            <span className="text-gray-400">Try:</span>
            <button
              type="button"
              onClick={() => handleQuickTest("https://www.instagram.com/irfanjunejo/", "instagram")}
              className="px-2 py-0.5 rounded-md bg-gray-50 hover:bg-gray-100 text-gray-700 transition-all border border-gray-200/60 cursor-pointer"
            >
              @irfanjunejo (Multi-Channel Bio)
            </button>
            <button
              type="button"
              onClick={() => handleQuickTest("https://www.youtube.com/@mkbhd", "youtube")}
              className="px-2 py-0.5 rounded-md bg-gray-50 hover:bg-gray-100 text-gray-700 transition-all border border-gray-200/60 cursor-pointer"
            >
              @mkbhd (YouTube)
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* SECTION 2: LIVE DISCOVERY BEACON & ACTIVITY FEED         */}
      {/* ========================================================= */}
      {hasSearched && (
        <div className="space-y-4 animate-fadeIn">
          {/* Live Activity Stream Terminal */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-gray-950 text-white border border-gray-800 shadow-md space-y-2">
            <div className="flex items-center justify-between border-b border-gray-800 pb-2 text-[11px] font-medium text-gray-400">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-gray-200 font-semibold tracking-wide uppercase">
                  Autonomous Multi-Channel Discovery Beacon
                </span>
              </div>
              <span className="font-mono text-[10px] text-gray-500">Connected: /api/scrapers/*</span>
            </div>

            <div className="space-y-1 font-mono text-[11px] max-h-28 overflow-y-auto pr-1">
              {activityFeed.map((event) => (
                <div
                  key={event.id}
                  className={`flex items-start gap-2 py-0.5 ${
                    event.type === "discovery"
                      ? "text-emerald-400 font-medium"
                      : event.type === "success"
                      ? "text-gray-200"
                      : "text-gray-400"
                  }`}
                >
                  <span className="text-gray-600 text-[10px] shrink-0">[{event.timestamp}]</span>
                  <span>{event.message}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ========================================================= */}
          {/* SECTION 3: CREATOR UNIFIED IDENTITY & COMBINED REACH      */}
          {/* ========================================================= */}
          {creatorMeta && (
            <div className="p-4 sm:p-5 rounded-2xl bg-white border border-gray-200/90 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fadeIn">
              <div className="flex items-center gap-3.5">
                {creatorMeta.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={creatorMeta.avatarUrl}
                    alt={creatorMeta.displayName}
                    className="w-12 h-12 rounded-full object-cover border border-gray-200 shadow-2xs shrink-0"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gray-950 text-white font-bold text-sm flex items-center justify-center shrink-0">
                    {creatorMeta.displayName.slice(0, 2).toUpperCase()}
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm sm:text-base font-bold text-gray-950">{creatorMeta.displayName}</h2>
                    <span className="px-2 py-0.5 rounded-md bg-gray-100 text-gray-700 text-[10px] font-semibold">
                      Multi-Channel Profile
                    </span>
                  </div>
                  <div className="text-xs text-gray-400 font-mono">@{creatorMeta.primaryUsername}</div>
                </div>
              </div>

              {/* Combined Audience Badge */}
              <div className="flex items-center gap-4 text-xs bg-gray-50 p-2.5 rounded-xl border border-gray-200/70 shrink-0">
                <div>
                  <div className="text-[10px] text-gray-400 font-medium uppercase">Combined Reach</div>
                  <div className="text-sm font-bold font-mono text-gray-950">
                    {totalAudienceCount.toLocaleString()}
                  </div>
                </div>
                <div className="w-px h-6 bg-gray-200" />
                <div>
                  <div className="text-[10px] text-gray-400 font-medium uppercase">Active Channels</div>
                  <div className="text-sm font-bold font-mono text-gray-950">
                    {verifiedChannelsCount} Platforms
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* SECTION 4: THE 3-PLATFORM EMPIRICAL RATE SHEETS           */}
          {/* ========================================================= */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch">
            {/* 1. Instagram Card */}
            <PlatformRateCardItem
              platformName="Instagram"
              icon={
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              }
              data={platforms.instagram}
              metricLabel="Followers"
              onManualSearch={(handle) => scrapePlatform(handle, "instagram")}
            />

            {/* 2. YouTube Card */}
            <PlatformRateCardItem
              platformName="YouTube"
              icon={
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              }
              data={platforms.youtube}
              metricLabel="Subscribers"
              onManualSearch={(handle) => scrapePlatform(handle, "youtube")}
            />

            {/* 3. TikTok Card */}
            <PlatformRateCardItem
              platformName="TikTok"
              icon={
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
                </svg>
              }
              data={platforms.tiktok}
              metricLabel="Followers"
              onManualSearch={(handle) => scrapePlatform(handle, "tiktok")}
            />
          </div>

          {/* ========================================================= */}
          {/* SECTION 5: OMNICHANNEL BUNDLE OPTIMIZER                   */}
          {/* ========================================================= */}
          {bundleOffers && (
            <div className="p-4 sm:p-5 rounded-2xl bg-gray-950 text-white border border-gray-800 shadow-md space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between border-b border-gray-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-400" />
                  <h3 className="text-xs sm:text-sm font-bold tracking-tight text-white">
                    Omnichannel Multi-Asset Bundle Optimizer
                  </h3>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 text-emerald-400 font-semibold">
                  10% – 15% Volume Discount Applied
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Starter Combo */}
                <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-xs font-bold text-white">{bundleOffers.starter.title}</div>
                      <div className="text-[11px] text-gray-400 font-mono">{bundleOffers.starter.subtitle}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold font-mono text-white">
                        {bundleOffers.starter.typicalFormatted}
                      </div>
                      <div className="text-[10px] text-emerald-400 font-mono">
                        Save ${bundleOffers.starter.savings} USD
                      </div>
                    </div>
                  </div>
                  <div className="text-[10px] text-gray-500 font-mono">
                    Range: {bundleOffers.starter.lowFormatted} – {bundleOffers.starter.highFormatted}
                  </div>
                </div>

                {/* 360 Authority Pack */}
                <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-xs font-bold text-white">{bundleOffers.authority.title}</div>
                      <div className="text-[11px] text-gray-400 font-mono">{bundleOffers.authority.subtitle}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold font-mono text-white">
                        {bundleOffers.authority.typicalFormatted}
                      </div>
                      <div className="text-[10px] text-emerald-400 font-mono">
                        Save ${bundleOffers.authority.savings} USD
                      </div>
                    </div>
                  </div>
                  <div className="text-[10px] text-gray-500 font-mono">
                    Range: {bundleOffers.authority.lowFormatted} – {bundleOffers.authority.highFormatted}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ----------------------------------------------------------------------
// Sub-Component: Platform Rate Card Item
// ----------------------------------------------------------------------
function PlatformRateCardItem({
  platformName,
  icon,
  data,
  metricLabel,
  onManualSearch,
}: {
  platformName: string;
  icon: React.ReactNode;
  data: DiscoveredPlatformData;
  metricLabel: string;
  onManualSearch?: (handle: string) => void;
}) {
  const [manualHandle, setManualHandle] = useState("");

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs flex flex-col justify-between p-4 space-y-3.5">
      {/* Platform Header */}
      <div className="flex items-center justify-between border-b border-gray-100 pb-2.5">
        <div className="flex items-center gap-2">
          <span className="text-gray-900">{icon}</span>
          <span className="text-xs font-bold text-gray-950">{platformName}</span>
        </div>
        <span
          className={`text-[10px] font-mono px-2 py-0.5 rounded-md font-semibold ${
            data.status === "ready"
              ? "bg-gray-100 text-gray-900"
              : data.status === "loading"
              ? "bg-gray-100 text-gray-500 animate-pulse"
              : "bg-gray-50 text-gray-400"
          }`}
        >
          {data.status === "ready" ? "Verified" : data.status === "loading" ? "Syncing..." : "Idle"}
        </span>
      </div>

      {/* Body States */}
      {data.status === "loading" && (
        <div className="py-6 space-y-2.5 text-center animate-pulse">
          <div className="w-8 h-8 rounded-full bg-gray-100 mx-auto" />
          <div className="h-3 bg-gray-100 rounded w-24 mx-auto" />
          <div className="h-2.5 bg-gray-50 rounded w-32 mx-auto" />
        </div>
      )}

      {data.status === "idle" && (
        <div className="py-4 text-center space-y-2.5">
          <div className="text-xs text-gray-500 font-medium">No {platformName} linked</div>
          <div className="flex items-center gap-1">
            <input
              type="text"
              placeholder={`@handle`}
              value={manualHandle}
              onChange={(e) => setManualHandle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && manualHandle && onManualSearch?.(manualHandle)}
              className="flex-1 px-2.5 py-1 text-xs rounded-lg border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:border-gray-900"
            />
            <button
              type="button"
              onClick={() => manualHandle && onManualSearch?.(manualHandle)}
              className="px-2.5 py-1 text-xs font-semibold bg-gray-950 text-white rounded-lg hover:bg-black cursor-pointer shadow-2xs"
            >
              Scan
            </button>
          </div>
        </div>
      )}

      {data.status === "error" && (
        <div className="py-4 text-center space-y-2">
          <div className="text-[11px] text-gray-500">{data.error || `Unable to load ${platformName}`}</div>
          <button
            type="button"
            onClick={() => data.username && onManualSearch?.(data.username)}
            className="text-[11px] font-semibold text-gray-900 underline hover:text-black cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {data.status === "ready" && (
        <div className="space-y-3">
          {/* Profile Metric Snippet */}
          <div className="flex items-center justify-between text-xs bg-gray-50 p-2.5 rounded-xl border border-gray-100">
            <div>
              <div className="text-[10px] text-gray-400 uppercase font-medium">{metricLabel}</div>
              <div className="font-bold font-mono text-gray-950">
                {(data.followerCount || 0).toLocaleString()}
              </div>
            </div>
            <div className="text-right">
              <div className="text-[10px] text-gray-400 uppercase font-medium">Observed ER</div>
              <div className="font-bold font-mono text-gray-950">
                {data.engagementRate !== undefined ? `${data.engagementRate}%` : "—"}
              </div>
            </div>
          </div>

          {/* Itemized Deliverables Rate Card */}
          <div className="space-y-1.5 pt-1">
            <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
              Itemized Defended Pricing
            </div>
            {data.rateCardItems?.map((item) => {
              const label = FORMAT_LABELS[item.format]?.label || item.format;
              return (
                <div
                  key={item.format}
                  className="flex items-center justify-between p-2 rounded-lg border border-gray-100 hover:border-gray-300 bg-white transition-all text-xs"
                >
                  <div className="truncate pr-2">
                    <div className="font-semibold text-gray-900 truncate">{label}</div>
                    <div className="text-[10px] text-gray-400 font-mono">
                      {item.formattedLow} – {item.formattedHigh}
                    </div>
                  </div>
                  <div className="font-bold font-mono text-gray-950 shrink-0">
                    {item.formattedAmount}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
