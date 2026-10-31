"use client";

import React, { useState, useRef, useCallback, useMemo, useEffect } from "react";

import { CalculatorSearch, CalculatorAnalysis } from "./CalculatorJourney";
import { CreatorProfileView } from "@/components/creators/CreatorProfileView";
import { buildCalculatorProfile, type CalculatorPlatformData } from "@/lib/calculator/profile-presentation";
import { ArrowRight, CheckCircle2, Zap, Video, Camera, Music2, X } from "lucide-react";
import { Platform, DeliverableFormat, PricingInput, RegionCode } from "@/lib/calculator/types";
import { calculateInfluencerRate, roundCommercial } from "@/lib/calculator/engine";
import { generateOmnichannelPackages, GeneratedPackage } from "@/lib/calculator/packages";
import { FORMAT_LABELS, REGIONAL_CONFIG, PRIMARY_NICHES, SUB_NICHES, getSubNichesByPrimaryId } from "@/lib/calculator/constants";
import { YouTubeVideoItem, TikTokVideoItem } from "@/lib/scrapers/types";
import { extractEmailFromBio } from "@/lib/scrapers/instagram/parser";
import { CompleteCreatorIntelligence } from "@/lib/ai/types";
import { MultiPlatformCreatorInput } from "@/lib/ai/gemini";

type DiscoveredPlatformData = CalculatorPlatformData;

interface ActivityEvent {
  id: string;
  timestamp: string;
  message: string;
  type: "info" | "success" | "discovery";
}

function formatShortNumber(num: number | undefined | null): string {
  if (num === undefined || num === null || isNaN(num)) return "0";
  if (num < 1000) return num.toString();
  if (num < 1_000_000) {
    const k = num / 1000;
    return k % 1 === 0 ? `${k}K` : `${parseFloat(k.toFixed(1))}K`;
  }
  if (num < 1_000_000_000) {
    const m = num / 1_000_000;
    return m % 1 === 0 ? `${m}M` : `${parseFloat(m.toFixed(2))}M`;
  }
  const b = num / 1_000_000_000;
  return b % 1 === 0 ? `${b}B` : `${parseFloat(b.toFixed(2))}B`;
}

export function InfluencerRadarDashboard() {
  const [inputQuery, setInputQuery] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState<Platform>("instagram");
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [isResolvingIdentity, setIsResolvingIdentity] = useState(false);

  // Progressive Scroll UX Refs & Sticky Search Bar
  const heroSectionRef = useRef<HTMLDivElement>(null);
  const telemetrySectionRef = useRef<HTMLDivElement>(null);
  const valuationDashboardRef = useRef<HTMLDivElement>(null);

  // Calibration State (Country & Niche)
  const [selectedRegion, setSelectedRegion] = useState<RegionCode>("US");
  const [activeNicheId, setActiveNicheId] = useState<number>(8);
  const [activeSubNicheId, setActiveSubNicheId] = useState<number | undefined>(801);

  // Missing Platforms Modal State
  const [isMissingModalOpen, setIsMissingModalOpen] = useState(false);
  const [missingInputs, setMissingInputs] = useState<{ youtube: string; instagram: string; tiktok: string }>({
    youtube: "",
    instagram: "",
    tiktok: "",
  });
  const forceNextSynthesisBypassCache = useRef(false);

  // Terminal / Activity Feed
  const [activityFeed, setActivityFeed] = useState<ActivityEvent[]>([]);

  // 3-Platform Data States
  const [platforms, setPlatforms] = useState<Record<Platform, DiscoveredPlatformData>>({
    instagram: { status: "idle" },
    youtube: { status: "idle" },
    tiktok: { status: "idle" },
  });

  // 19-Point Creator Intelligence State
  const [completeIntelligence, setCompleteIntelligence] = useState<CompleteCreatorIntelligence | null>(null);
  const completeIntelligenceRef = useRef<CompleteCreatorIntelligence | null>(null);
  useEffect(() => {
    completeIntelligenceRef.current = completeIntelligence;
  }, [completeIntelligence]);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const synthesizedHash = useRef<string>("");

  // Valuation Calibration Pipeline State (atomic reveal after AI country/niche synthesis)
  const [isValuationCalibrated, setIsValuationCalibrated] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [copiedPackageId, setCopiedPackageId] = useState<string | null>(null);
  const hasUserManuallySelectedRegion = useRef(false);
  const platformsRef = useRef(platforms);
  useEffect(() => {
    platformsRef.current = platforms;
  }, [platforms]);

  // Reveal only after all collection, insight generation and rate calculation settle.
  const reportReady = isValuationCalibrated && !isSearching && !isResolvingIdentity && !isSynthesizing && !Object.values(platforms).some(channel => channel.status === "loading");
  const [reportRevealed, setReportRevealed] = useState(false);
  useEffect(() => {
    if (!reportReady) { setReportRevealed(false); return; }
    const timer = setTimeout(() => setReportRevealed(true), 500);
    return () => clearTimeout(timer);
  }, [reportReady]);

  useEffect(() => {
    if (reportRevealed && valuationDashboardRef.current) {
      const timer = setTimeout(() => {
        valuationDashboardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [reportRevealed]);

  // Creator General Info
  const [creatorMeta, setCreatorMeta] = useState<{
    displayName: string;
    primaryUsername: string;
    avatarUrl?: string;
    primaryPlatform: Platform;
    contactEmail?: string;
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

  // Compute platform-native rate card items using 16-knot formula engine from CALCULATOR_FORMULAS_AND_SCENARIOS.md
  const computePlatformRateCards = useCallback(
    (
      platform: Platform,
      followers: number,
      avgLikes: number,
      avgComments: number,
      avgViews: number,
      avgShares: number = 0,
      primaryNicheId: number = 8,
      regionCode: RegionCode = "US",
      extraMetrics?: {
        avgShortLikes?: number;
        avgShortComments?: number;
        avgShortViews?: number;
      },
      subNicheId?: number,
      secondaryNicheIds?: number[],
      productionLevel?: string,
      isLuxuryOrHighEnd?: boolean
    ) => {
      const platformFormats: Record<Platform, DeliverableFormat[]> = {
        instagram: ["ig_reel", "ig_carousel", "ig_static", "ig_story"],
        youtube: ["yt_dedicated", "yt_integrated", "yt_short"],
        tiktok: ["tiktok_video"],
      };

      const formats = platformFormats[platform] || ["ig_reel"];

      return formats.map((fmt, idx) => {
        const isYtShort = platform === "youtube" && fmt === "yt_short";
        const itemLikes = isYtShort && extraMetrics?.avgShortLikes !== undefined ? extraMetrics.avgShortLikes : avgLikes;
        const itemComments = isYtShort && extraMetrics?.avgShortComments !== undefined ? extraMetrics.avgShortComments : avgComments;
        const itemViews = isYtShort && extraMetrics?.avgShortViews !== undefined ? extraMetrics.avgShortViews : avgViews;

        const pricingInput: PricingInput = {
          creator: {
            followerCount: Math.max(followers, 1000),
            last3PostsAvgLikes: itemLikes,
            last3PostsAvgComments: itemComments,
            last3PostsAvgViews: itemViews,
            last3PostsAvgShares: avgShares,
            primaryPlatform: platform,
            primaryNicheId,
            subNicheId,
            secondaryNicheIds,
            productionLevel,
            isLuxuryOrHighEnd,
            regionCode,
          },
          deliverables: [{ id: String(idx + 1), platform, format: fmt, quantity: 1 }],
          commercialTerms: { usageRights: { scope: "organic_repost", duration: "30_days" } },
        };

        const res = calculateInfluencerRate(pricingInput);
        const median = res.valuationRange.typicalMedian;
        const low = res.valuationRange.lowP25;
        const high = res.valuationRange.highP75;

        // USD Equivalent if in foreign currency (e.g. PKR, INR, AED, GBP)
        const regConfig = REGIONAL_CONFIG[regionCode] || REGIONAL_CONFIG["US"];
        const isForeign = regionCode !== "US";
        const realUsdMedian = roundCommercial(median / (regConfig.fxRateToUSD || 1));
        const usdEquivalent = isForeign ? `~$${realUsdMedian.toLocaleString()} USD` : undefined;

        return {
          format: fmt,
          amount: median,
          formattedAmount: res.valuationRange.formatted.typical,
          lowAmount: low,
          formattedLow: res.valuationRange.formatted.low,
          highAmount: high,
          formattedHigh: res.valuationRange.formatted.high,
          currency: res.metrics.currency,
          usdEquivalentFormatted: usdEquivalent,
        };
      });
    },
    []
  );

  // Recalculates all active platform cards when Country, Niche, or Sub-Niche changes
  const recomputeAllPlatformRates = useCallback(
    (
      targetRegion: RegionCode,
      targetNicheId: number,
      targetSubNicheId?: number,
      overrideSecondaryNicheIds?: number[],
      overrideProductionLevel?: string,
      overrideIsLuxury?: boolean
    ) => {
      const intel = completeIntelligenceRef.current;
      const secondaryNicheIds = overrideSecondaryNicheIds ?? intel?.profile?.secondaryNiches?.map((s) => s.id);
      const productionLevel = overrideProductionLevel ?? intel?.content?.productionLevel;
      const isLuxuryOrHighEnd = overrideIsLuxury ?? intel?.profile?.isLuxuryOrHighEnd;

      setPlatforms((prev) => {
        const updated = { ...prev };

        if (updated.instagram.status === "ready") {
          updated.instagram = {
            ...updated.instagram,
            rateCardItems: computePlatformRateCards(
              "instagram",
              updated.instagram.followerCount || 0,
              updated.instagram.avgLikes || 0,
              updated.instagram.avgComments || 0,
              updated.instagram.avgViews || 0,
              0,
              targetNicheId,
              targetRegion,
              undefined,
              targetSubNicheId,
              secondaryNicheIds,
              productionLevel,
              isLuxuryOrHighEnd
            ),
          };
        }

        if (updated.youtube.status === "ready") {
          updated.youtube = {
            ...updated.youtube,
            rateCardItems: computePlatformRateCards(
              "youtube",
              updated.youtube.followerCount || 0,
              updated.youtube.avgLikes || 0,
              updated.youtube.avgComments || 0,
              updated.youtube.avgViews || 0,
              0,
              targetNicheId,
              targetRegion,
              {
                avgShortLikes: updated.youtube.avgShortLikes,
                avgShortComments: updated.youtube.avgShortComments,
                avgShortViews: updated.youtube.avgShortViews || 0,
              },
              targetSubNicheId,
              secondaryNicheIds,
              productionLevel,
              isLuxuryOrHighEnd
            ),
          };
        }

        if (updated.tiktok.status === "ready") {
          updated.tiktok = {
            ...updated.tiktok,
            rateCardItems: computePlatformRateCards(
              "tiktok",
              updated.tiktok.followerCount || 0,
              updated.tiktok.avgLikes || 0,
              updated.tiktok.avgComments || 0,
              updated.tiktok.avgViews || 0,
              0,
              targetNicheId,
              targetRegion,
              undefined,
              targetSubNicheId,
              secondaryNicheIds,
              productionLevel,
              isLuxuryOrHighEnd
            ),
          };
        }

        return updated;
      });
    },
    [computePlatformRateCards]
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
          retryInput: targetInput,
          sourceNote: sourceNote || `Direct scan for ${targetPlatform}`,
        },
      }));

      addActivity(
        sourceNote ? `Autonomous Sync: ${sourceNote}` : `Connecting to /api/scrapers/${targetPlatform} for ${targetInput}...`,
        sourceNote ? "discovery" : "info"
      );

      try {
        const endpoint = `/api/scrapers/${targetPlatform}`;

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

        let avgLongViews = 0;
        let avgShortViews = 0;
        let avgLongEngagementRate = 0;
        let avgShortEngagementRate = 0;
        let avgShortLikes = 0;
        let avgShortComments = 0;
        let channelCountry: string | undefined = undefined;
        let extractedEmail: string | undefined = undefined;

        if (targetPlatform === "instagram") {
          const profile = data.profile || {};
          const stats = data.stats || {};
          channelCountry = profile.countryCode || profile.city;
          followerCount = profile.followerCount || 0;
          avgLikes = stats.avgLikesPerPost || 0;
          avgComments = stats.avgCommentsPerPost || 0;
          engagementRate = stats.avgEngagementRate ?? stats.engagementRate ?? 0;

          if (engagementRate === 0 && followerCount > 0 && (avgLikes > 0 || avgComments > 0)) {
            engagementRate = Number((((avgLikes + avgComments) / followerCount) * 100).toFixed(2));
          }

          username = (profile.username || targetInput).replace(/^@+/, "");
          displayName = profile.fullName || profile.username || username;
          avatarUrl = profile.avatarUrl || "";
          biography = profile.biography || "";
          extractedEmail = profile.extractedEmail || (biography ? extractEmailFromBio(biography) : undefined);

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
          avgLongViews = stats.avgLongVideoViews || 0;
          avgShortViews = stats.avgShortVideoViews || 0;
          avgLongEngagementRate = stats.avgLongEngagementRate || 0;
          avgShortEngagementRate = stats.avgShortEngagementRate || 0;

          // Official YouTube Country
          channelCountry = channel.country;
          if (channel.country && REGIONAL_CONFIG[channel.country.toUpperCase() as RegionCode]) {
            setSelectedRegion(channel.country.toUpperCase() as RegionCode);
          }

          const longVids = Array.isArray(data.longVideos) ? data.longVideos : [];
          const shortVids = Array.isArray(data.shortVideos) ? data.shortVideos : [];

          // Prioritize outlier-trimmed core benchmark videos (tagged with isErSample)
          const sampleLongVids = longVids.filter((v: { isErSample?: boolean }) => v.isErSample);
          const targetLongVids = sampleLongVids.length > 0 ? sampleLongVids : longVids;

          const sampleShortVids = shortVids.filter((v: { isErSample?: boolean }) => v.isErSample);
          const targetShortVids = sampleShortVids.length > 0 ? sampleShortVids : shortVids;

          if (targetLongVids.length > 0) {
            avgLikes = Math.round(targetLongVids.reduce((s: number, v: { likeCount?: number }) => s + (v.likeCount || 0), 0) / targetLongVids.length);
            avgComments = Math.round(targetLongVids.reduce((s: number, v: { commentCount?: number }) => s + (v.commentCount || 0), 0) / targetLongVids.length);
            avgViews = avgLongViews || Math.round(targetLongVids.reduce((s: number, v: { viewCount?: number }) => s + (v.viewCount || 0), 0) / targetLongVids.length);
            if (avgLongEngagementRate === 0 && avgViews > 0 && (avgLikes > 0 || avgComments > 0)) {
              avgLongEngagementRate = Number((((avgLikes + avgComments) / avgViews) * 100).toFixed(2));
            }
          }

          if (targetShortVids.length > 0) {
            avgShortLikes = Math.round(targetShortVids.reduce((s: number, v: { likeCount?: number }) => s + (v.likeCount || 0), 0) / targetShortVids.length);
            avgShortComments = Math.round(targetShortVids.reduce((s: number, v: { commentCount?: number }) => s + (v.commentCount || 0), 0) / targetShortVids.length);
            avgShortViews = avgShortViews || Math.round(targetShortVids.reduce((s: number, v: { viewCount?: number }) => s + (v.viewCount || 0), 0) / targetShortVids.length);
            if (avgShortEngagementRate === 0 && avgShortViews > 0 && (avgShortLikes > 0 || avgShortComments > 0)) {
              avgShortEngagementRate = Number((((avgShortLikes + avgShortComments) / avgShortViews) * 100).toFixed(2));
            }
          }

          engagementRate = avgLongEngagementRate || avgShortEngagementRate || 0;

          if (engagementRate === 0 && avgViews > 0 && (avgLikes > 0 || avgComments > 0)) {
            engagementRate = Number((((avgLikes + avgComments) / avgViews) * 100).toFixed(2));
          }

          username = (channel.handle || channel.title || targetInput).replace(/^@+/, "");
          displayName = channel.title || username;
          avatarUrl = channel.avatarUrl || "";
          biography = channel.description || "";
          extractedEmail = channel.extractedEmail || (biography ? extractEmailFromBio(biography) : undefined);

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
              externalLinks.push({ platform: "tiktok", url: `https://www.tiktok.com/@${ttMatch[1]}` });
            }
          }
        } else if (targetPlatform === "tiktok") {
          const profile = data.profile || {};
          const stats = data.stats || {};
          followerCount = profile.followerCount || 0;
          avgViews = stats.avgViewsPerVideo || 0;
          avgLikes = stats.avgLikesPerVideo || 0;
          avgComments = stats.avgCommentsPerVideo || 0;
          const avgShares = stats.avgSharesPerVideo || 0;
          engagementRate = stats.avgEngagementRate ?? stats.engagementRate ?? 0;

          if (engagementRate === 0 && avgViews > 0 && (avgLikes > 0 || avgComments > 0 || avgShares > 0)) {
            engagementRate = Number((((avgLikes + avgComments + avgShares) / avgViews) * 100).toFixed(2));
          }

          username = (profile.username || targetInput).replace(/^@+/, "");
          displayName = profile.nickname || profile.username || username;
          avatarUrl = profile.avatarUrl || "";
          biography = profile.biography || "";
          extractedEmail = profile.extractedEmail || (biography ? extractEmailFromBio(biography) : undefined);
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

        // Compute rate sheet dynamically using active region & niche ONLY if valuation already calibrated
        const rateCardItems = isValuationCalibrated
          ? computePlatformRateCards(
              targetPlatform,
              followerCount,
              avgLikes,
              avgComments,
              avgViews,
              targetPlatform === "tiktok" ? (data.stats?.avgSharesPerVideo || 0) : 0,
              activeNicheId,
              selectedRegion,
              targetPlatform === "youtube"
                ? {
                    avgShortLikes,
                    avgShortComments,
                    avgShortViews,
                  }
                : undefined,
              activeSubNicheId
            )
          : undefined;

        // Render this platform's card IMMEDIATELY with verified metrics
        setPlatforms((prev) => ({
          ...prev,
          [targetPlatform]: {
            status: "ready",
            username,
            displayName,
            avatarUrl,
            country: channelCountry,
            followerCount,
            avgLikes,
            avgComments,
            avgViews,
            engagementRate,
            longEngagementRate: targetPlatform === "youtube" ? (avgLongEngagementRate > 0 ? avgLongEngagementRate : undefined) : undefined,
            shortEngagementRate: targetPlatform === "youtube" ? (avgShortEngagementRate > 0 ? avgShortEngagementRate : undefined) : undefined,
            avgLongViews: targetPlatform === "youtube" ? avgLongViews : undefined,
            avgShortViews: targetPlatform === "youtube" ? avgShortViews : undefined,
            avgShortLikes: targetPlatform === "youtube" ? avgShortLikes : undefined,
            avgShortComments: targetPlatform === "youtube" ? avgShortComments : undefined,
            posts: targetPlatform === "instagram" ? data.posts : undefined,
            videos:
              targetPlatform === "youtube"
                ? [...(data.longVideos || []), ...(data.shortVideos || [])]
                : targetPlatform === "tiktok"
                ? data.videos
                : undefined,
            rateCardItems,
            sourceNote,
            collectedAt: typeof data.scrapedAt === "string" ? data.scrapedAt : undefined,
            extractedEmail,
          },
        }));

        addActivity(
          `Verified ${targetPlatform.toUpperCase()}: @${username} · ${followerCount.toLocaleString()} ${targetPlatform === "youtube" ? "Subscribers" : "Followers"} (${engagementRate}% ER) ${data.isCached ? "(Verified Cache)" : "(Live Scan)"}`,
          "success"
        );

        // Update creator general identity profile if primary
        setCreatorMeta((prev) => {
          if (!prev) {
            return {
              displayName: displayName || username,
              primaryUsername: username.replace(/^@+/, ""),
              avatarUrl,
              primaryPlatform: targetPlatform,
              contactEmail: extractedEmail,
            };
          }
          return {
            ...prev,
            contactEmail: prev.contactEmail || extractedEmail,
          };
        });

        // Trigger autonomous parallel scans for discovered links
        for (const link of externalLinks) {
          if (link.platform !== targetPlatform && platformsRef.current[link.platform].status === "idle") {
            addActivity(
              `Discovered ${link.platform.toUpperCase()} profile in @${username}'s bio link (${link.url}). Initiating autonomous sync...`,
              "discovery"
            );
            scrapePlatform(
              link.url,
              link.platform,
              `Discovered via @${username}'s ${targetPlatform} bio link`
            );
          }
        }

        // Automatically persist cross-platform discovery to Identity Cluster
        if (externalLinks.length > 0) {
          const bindingPayload: Record<string, string> = {};
          if (targetPlatform === "youtube") bindingPayload.youtubeHandle = username;
          if (targetPlatform === "instagram") bindingPayload.instagramUsername = username;
          if (targetPlatform === "tiktok") bindingPayload.tiktokUsername = username;

          for (const l of externalLinks) {
            if (l.platform === "youtube") bindingPayload.youtubeHandle = l.url;
            if (l.platform === "instagram") bindingPayload.instagramUsername = l.url;
            if (l.platform === "tiktok") bindingPayload.tiktokUsername = l.url;
          }

          fetch("/api/creators/bind-identity", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              canonicalName: displayName || username,
              ...bindingPayload,
            }),
          }).catch((err) => console.warn("[Auto-bind External Links Warning]:", err));
        }
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : `Failed to fetch ${targetPlatform}`;
        setPlatforms((prev) => ({
          ...prev,
          [targetPlatform]: {
            ...prev[targetPlatform],
            status: "error",
            error: errorMsg,
          },
        }));
        addActivity(`Notice on ${targetPlatform}: ${errorMsg}`, "info");
      } finally {
        inFlightScrapes.current.delete(scrapeKey);
      }
    },
    [addActivity, computePlatformRateCards, activeNicheId, activeSubNicheId, selectedRegion, isValuationCalibrated]
  );

  // Main Form Submit
  const handleStart = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const query = inputQuery.trim();
    if (!query) return;

    setIsSearching(true);
    setIsResolvingIdentity(true);
    setHasSearched(true);
    setIsValuationCalibrated(false);
    hasUserManuallySelectedRegion.current = false;
    setActivityFeed([]);
    setCreatorMeta(null);
    setCompleteIntelligence(null);
    synthesizedHash.current = "";
    forceNextSynthesisBypassCache.current = false;

    // Reset platform states
    setPlatforms({
      instagram: { status: "idle" },
      youtube: { status: "idle" },
      tiktok: { status: "idle" },
    });

    // Stage 2 Smooth Auto-Scroll down to Telemetry Station
    setTimeout(() => {
      telemetrySectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 150);

    let initialTargetPlatform: Platform = selectedPlatform;
    if (isUrl) {
      const lower = query.toLowerCase();
      if (lower.includes("youtube.com") || lower.includes("youtu.be")) initialTargetPlatform = "youtube";
      else if (lower.includes("tiktok.com")) initialTargetPlatform = "tiktok";
      else initialTargetPlatform = "instagram";
    }

    // Step 1: Pre-search Identity Cluster Resolution
    // If the creator has already been bound across multiple platforms, trigger all of them simultaneously!
    try {
      const resolveRes = await fetch(`/api/creators/resolve-identity?query=${encodeURIComponent(query)}&platform=${initialTargetPlatform}`);
      const resolveJson = await resolveRes.json();
      setIsResolvingIdentity(false);
      if (resolveJson.success && resolveJson.resolved && resolveJson.cluster?.accounts) {
        const accounts = resolveJson.cluster.accounts;
        const availablePlatforms: Array<{ plat: Platform; input: string }> = [];
        if (accounts.youtube) availablePlatforms.push({ plat: "youtube", input: accounts.youtube });
        if (accounts.instagram) availablePlatforms.push({ plat: "instagram", input: accounts.instagram });
        if (accounts.tiktok) availablePlatforms.push({ plat: "tiktok", input: accounts.tiktok });

        if (availablePlatforms.length > 1) {
          addActivity(
            `Identity Cluster Resolved: Recognized ${resolveJson.cluster.canonicalName}. Synchronizing ${availablePlatforms.length} verified channels in parallel...`,
            "discovery"
          );
          await Promise.all(
            availablePlatforms.map(({ plat, input }) =>
              scrapePlatform(input, plat, `Cluster Sync for ${resolveJson.cluster.canonicalName}`)
            )
          );
          setIsSearching(false);
          return;
        }
      }
    } catch (e) {
      setIsResolvingIdentity(false);
      console.warn('[Identity Resolver Pre-check Error]:', e);
    }

    await scrapePlatform(query, initialTargetPlatform);
    setIsSearching(false);
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

  // Unified 19-Point Omnichannel AI Synthesis Function
  const triggerOmnichannelSynthesis = useCallback(async (bypassCache = false) => {
    const shouldBypass = bypassCache || forceNextSynthesisBypassCache.current;
    forceNextSynthesisBypassCache.current = false;

    const readyList: Platform[] = [];
    if (platforms.youtube.status === "ready") readyList.push("youtube");
    if (platforms.instagram.status === "ready") readyList.push("instagram");
    if (platforms.tiktok.status === "ready") readyList.push("tiktok");

    if (readyList.length === 0) return;

    const currentHash = readyList.map((p) => `${p}:${platforms[p].username || ""}`).sort().join("|");
    if (currentHash === synthesizedHash.current && !shouldBypass) return;

    setIsSynthesizing(true);
    addActivity(`SignCollab Profile LLM Engine: Synthesizing 19-point Creator Intelligence across ${readyList.length} platform(s)...`, "info");

    try {
      const multiInput: MultiPlatformCreatorInput = {
        creatorName:
          creatorMeta?.displayName ||
          platforms.youtube.displayName ||
          platforms.instagram.displayName ||
          platforms.tiktok.displayName ||
          platforms.youtube.username ||
          platforms.instagram.username ||
          platforms.tiktok.username ||
          "Creator",
        primaryPlatform: readyList[0],
        reportedCountry: REGIONAL_CONFIG[selectedRegion]?.name || selectedRegion,
      };

      if (platforms.youtube.status === "ready") {
        const ytVideos = (platforms.youtube.videos as unknown as YouTubeVideoItem[]) || [];
        const topComments: string[] = [];
        for (const v of ytVideos.slice(0, 5)) {
          if (Array.isArray(v.comments)) {
            for (const c of v.comments.slice(0, 5)) {
              if (c.textDisplay) topComments.push(c.textDisplay);
            }
          }
        }

        multiInput.youtube = {
          handle: platforms.youtube.username,
          title: platforms.youtube.displayName,
          subscriberCount: platforms.youtube.followerCount,
          avgViews: platforms.youtube.avgViews,
          country: platforms.youtube.country,
          recentTitles: ytVideos.map((v) => v.title).filter((t): t is string => Boolean(t)).slice(0, 15),
          topComments,
          observedEr: platforms.youtube.engagementRate,
        };
      }

      if (platforms.instagram.status === "ready") {
        const igPosts = platforms.instagram.posts || [];
        const topComments: string[] = [];
        for (const p of igPosts.slice(0, 4)) {
          if (Array.isArray(p.comments)) {
            for (const c of p.comments.slice(0, 5)) {
              if (c.text) topComments.push(c.text);
            }
          }
        }

        multiInput.instagram = {
          username: platforms.instagram.username || "",
          fullName: platforms.instagram.displayName,
          city: platforms.instagram.country,
          followerCount: platforms.instagram.followerCount,
          avgLikes: platforms.instagram.avgLikes,
          recentCaptions: igPosts.map((p) => p.caption).filter((c): c is string => Boolean(c)).slice(0, 12),
          topComments,
          observedEr: platforms.instagram.engagementRate,
        };
      }

      if (platforms.tiktok.status === "ready") {
        const ttVideos = (platforms.tiktok.videos as unknown as TikTokVideoItem[]) || [];
        const topComments: string[] = [];
        for (const v of ttVideos.slice(0, 5)) {
          if (Array.isArray(v.comments)) {
            for (const c of v.comments.slice(0, 5)) {
              if (c.text) topComments.push(c.text);
            }
          }
        }

        multiInput.tiktok = {
          username: platforms.tiktok.username || "",
          nickname: platforms.tiktok.displayName,
          followerCount: platforms.tiktok.followerCount,
          avgViews: platforms.tiktok.avgViews,
          recentDescriptions: ttVideos.map((v) => v.description).filter((d): d is string => Boolean(d)).slice(0, 12),
          topComments,
          observedEr: platforms.tiktok.engagementRate,
        };
      }

      const res = await fetch("/api/calculator/synthesize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ multiInput, regionCode: selectedRegion, bypassCache: shouldBypass }),
      });

      const json = await res.json();
      if (json.success && json.intelligence) {
        const intel = json.intelligence as CompleteCreatorIntelligence;
        setCompleteIntelligence(intel);
        synthesizedHash.current = currentHash;

        const detectedCountry = (intel.geography?.countryCode as RegionCode) || selectedRegion;
        const detectedNicheId = intel.profile?.primaryNiche?.id || activeNicheId;
        const detectedSubNicheId = intel.profile?.subNiche?.id || activeSubNicheId;

        const targetCountry = (!hasUserManuallySelectedRegion.current && detectedCountry && REGIONAL_CONFIG[detectedCountry])
          ? detectedCountry
          : selectedRegion;

        if (!hasUserManuallySelectedRegion.current && detectedCountry && REGIONAL_CONFIG[detectedCountry]) {
          setSelectedRegion(detectedCountry);
        }
        if (detectedNicheId) {
          setActiveNicheId(detectedNicheId);
        }
        if (detectedSubNicheId) {
          setActiveSubNicheId(detectedSubNicheId);
        }

        const detectedSecondaryNicheIds = intel.profile?.secondaryNiches?.map((s) => s.id);
        const detectedProductionLevel = intel.content?.productionLevel;
        const detectedIsLuxury = intel.profile?.isLuxuryOrHighEnd;

        // Recompute all platform rates atomically with the detected country PPP, niche & sub-niche!
        recomputeAllPlatformRates(
          targetCountry,
          detectedNicheId,
          detectedSubNicheId,
          detectedSecondaryNicheIds,
          detectedProductionLevel,
          detectedIsLuxury
        );
        setIsValuationCalibrated(true);

        const subNicheText = intel.profile?.subNiche ? ` · ${intel.profile.subNiche.name}` : '';
        addActivity(
          `Intelligence Verified (24h Cache): ${intel.profile.creatorType} · ${intel.profile.primaryNiche.name}${subNicheText} · Calibrated for ${REGIONAL_CONFIG[targetCountry]?.name || targetCountry} (${REGIONAL_CONFIG[targetCountry]?.currency || 'USD'})`,
          "success"
        );
      } else {
        // Mark this attempt settled so recalculation does not silently retry synthesis.
        synthesizedHash.current = currentHash;
        // Fallback: unlock valuation with current defaults so user is never stuck
        recomputeAllPlatformRates(selectedRegion, activeNicheId, activeSubNicheId);
        setIsValuationCalibrated(true);
      }
    } catch (e) {
      console.warn("[InfluencerRadar AI Synthesis Warning]:", e);
      synthesizedHash.current = currentHash;
      // Fallback: unlock valuation with current defaults
      recomputeAllPlatformRates(selectedRegion, activeNicheId, activeSubNicheId);
      setIsValuationCalibrated(true);
    } finally {
      setIsSynthesizing(false);
    }
  }, [platforms, creatorMeta, selectedRegion, activeNicheId, activeSubNicheId, recomputeAllPlatformRates, addActivity]);

  // Auto-trigger synthesis once all in-flight scrapes settle
  useEffect(() => {
    const isAnyInFlight =
      platforms.instagram.status === "loading" ||
      platforms.youtube.status === "loading" ||
      platforms.tiktok.status === "loading";

    if (!isAnyInFlight && verifiedChannelsCount > 0) {
      const timer = setTimeout(() => {
        triggerOmnichannelSynthesis();
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [platforms, verifiedChannelsCount, triggerOmnichannelSynthesis]);

  // Handle Missing Platforms Submission (invoked on-demand from Radar button or badge)
  const handleSubmitMissingPlatforms = () => {
    setIsMissingModalOpen(false);

    if (missingInputs.youtube.trim() && platforms.youtube.status !== "ready") {
      forceNextSynthesisBypassCache.current = true;
      scrapePlatform(missingInputs.youtube.trim(), "youtube", "User linked YouTube account");
    }
    if (missingInputs.instagram.trim() && platforms.instagram.status !== "ready") {
      forceNextSynthesisBypassCache.current = true;
      scrapePlatform(missingInputs.instagram.trim(), "instagram", "User linked Instagram account");
    }
    if (missingInputs.tiktok.trim() && platforms.tiktok.status !== "ready") {
      forceNextSynthesisBypassCache.current = true;
      scrapePlatform(missingInputs.tiktok.trim(), "tiktok", "User linked TikTok account");
    }

    // Persist manual platform binding to Identity Cluster for all future users globally
    const bindPayload: Record<string, string> = {
      canonicalName: creatorMeta?.displayName || "Creator",
    };
    if (missingInputs.youtube.trim()) bindPayload.youtubeHandle = missingInputs.youtube.trim();
    else if (platforms.youtube.username) bindPayload.youtubeHandle = platforms.youtube.username;

    if (missingInputs.instagram.trim()) bindPayload.instagramUsername = missingInputs.instagram.trim();
    else if (platforms.instagram.username) bindPayload.instagramUsername = platforms.instagram.username;

    if (missingInputs.tiktok.trim()) bindPayload.tiktokUsername = missingInputs.tiktok.trim();
    else if (platforms.tiktok.username) bindPayload.tiktokUsername = platforms.tiktok.username;

    fetch("/api/creators/bind-identity", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(bindPayload),
    }).catch((err) => console.warn("[Manual Link Bind Warning]:", err));
  };

  // Build 1-Click Instant Sponsorship Contract Bridge HREF (/instant)
  const buildContractHref = useCallback(() => {
    const deliverablesList: Array<{ platform: string; format: string; quantity: number; typicalRate: number; name: string }> = [];
    let totalTypical = 0;

    (["instagram", "youtube", "tiktok"] as Platform[]).forEach((plat) => {
      const pData = platforms[plat];
      if (pData.status === "ready" && pData.rateCardItems && pData.rateCardItems.length > 0) {
        pData.rateCardItems.forEach((item) => {
          deliverablesList.push({
            platform: plat,
            format: item.format,
            quantity: 1,
            typicalRate: item.amount,
            name: FORMAT_LABELS[item.format]?.label || item.format,
          });
          totalTypical += item.amount;
        });
      }
    });

    const primaryDeliverables = deliverablesList.slice(0, 3);
    const calculatedAmount = primaryDeliverables.reduce((acc, d) => acc + d.typicalRate, 0);

    const queryParams = new URLSearchParams({
      from: "calculator",
      creator: creatorMeta?.displayName || "Creator",
      creatorName: creatorMeta?.displayName || "Creator",
      handle: (creatorMeta?.primaryUsername || "").replace(/^@+/, ""),
      creatorHandle: (creatorMeta?.primaryUsername || "").replace(/^@+/, ""),
      platform: (creatorMeta?.primaryPlatform || "instagram").toUpperCase(),
      currency: REGIONAL_CONFIG[selectedRegion]?.currency || "USD",
      region: selectedRegion,
      amount: calculatedAmount > 0 ? calculatedAmount.toString() : "500",
      deliverables: primaryDeliverables.length > 0 ? JSON.stringify(primaryDeliverables) : "",
      niche: PRIMARY_NICHES.find((n) => n.id === activeNicheId)?.name || "",
    });
    return `/instant?${queryParams.toString()}`;
  }, [platforms, creatorMeta, selectedRegion, activeNicheId]);

  // 5-Objective Adaptive Omnichannel Package Recommendation Engine
  const recommendedPackages = useMemo(() => {
    if (!isValuationCalibrated) return [];
    return generateOmnichannelPackages(
      platforms,
      creatorMeta?.displayName || "Creator",
      activeNicheId,
      activeSubNicheId,
      selectedRegion,
      completeIntelligence || undefined
    );
  }, [platforms, creatorMeta, activeNicheId, activeSubNicheId, selectedRegion, completeIntelligence, isValuationCalibrated]);

  // 1-Click Copy Package Proposal Handler
  const handleCopyPackageProposal = useCallback((pkg: GeneratedPackage) => {
    const deliverablesText = pkg.calibratedDeliverables?.length
      ? pkg.calibratedDeliverables.map((d) => `• [${d.phase}] ${d.quantity}x ${d.title.replace(/^\d+x\s*/i, "").trim()} (${d.platform.toUpperCase()}): ${d.totalStandaloneFormatted} — ${d.description}`).join("\n")
      : pkg.deliverables.map((d) => `• [${d.phase}] ${d.quantity}x ${d.title.replace(/^\d+x\s*/i, "").trim()} (${d.platform.toUpperCase()}): ${d.description}`).join("\n");

    const adConceptsText = pkg.adConcepts?.length
      ? `\nVerbatim Spoken Ad Hooks:\n${pkg.adConcepts.map((c) => `• ${c.conceptName} (${c.suggestedPlatform.toUpperCase()}): ${c.hookVerbatim} (${c.angleSummary})`).join("\n")}`
      : "";

    const assetsText = pkg.concreteAssets?.length
      ? `\nDigital Assets Deliverables:\n${pkg.concreteAssets.map((a) => `• ${a.specification}`).join("\n")}`
      : "";

    const rulesText = pkg.collaborationGuidelines?.length
      ? `\nCritical Collaboration Guidelines:\n${pkg.collaborationGuidelines.map((g) => `• Rule ${g.ruleNumber} (${g.ruleTitle}): ${g.directive} [Risk: ${g.commercialRisk}]`).join("\n")}`
      : "";

    const rightsBreakdownText = pkg.pricing.commercialRightsFeeLocalized && pkg.pricing.commercialRightsFeeLocalized > 0
      ? `  - Content Deliverables Subtotal: ${pkg.pricing.rawContentSumFormatted}\n  - Included Commercial Rights & Buyout Value: +${pkg.pricing.commercialRightsFeeFormatted}\n`
      : "";

    const text = `SignCollab Omnichannel Campaign Proposal: ${pkg.name} (${pkg.tag})
Target Creator: ${creatorMeta?.displayName || "Creator"}
Campaign Objective: ${pkg.objective}

Institutional Valuation & Commercial Terms:
• Recommended Bundle Negotiation Target: ${pkg.pricing.recommendedBundleFormatted || pkg.pricing.typicalFormatted} ${pkg.pricing.usdEquivalentTypical ? `(${pkg.pricing.usdEquivalentTypical})` : ""}
• Standalone Benchmark Sum: ${pkg.pricing.standaloneBenchmarkFormatted || pkg.pricing.typicalFormatted}
${rightsBreakdownText}• Multi-Asset Efficiency Adjustment: ${pkg.discountPercentApplied > 0 ? `-${pkg.discountPercentApplied}% (${pkg.pricing.savingsFormatted})` : "Standard Baseline Benchmark (0%)"}
• Defended Negotiation Range: ${pkg.pricing.lowFormatted} – ${pkg.pricing.highFormatted}

Deliverables & Itemized Valuations:
${deliverablesText}
${adConceptsText}${assetsText}
Included Commercial Entitlements:
${pkg.entitlements.map((e) => `• ${e.label}: ${e.detail}`).join("\n")}
${rulesText}
Defended via SignCollab 16-Knot Market Valuation Engine`;

    navigator.clipboard.writeText(text);
    setCopiedPackageId(pkg.id);
    setTimeout(() => setCopiedPackageId(null), 2500);
  }, [creatorMeta]);

  const calculatorProfile = useMemo(() => creatorMeta ? buildCalculatorProfile({
    creator: creatorMeta, platforms, intelligence: completeIntelligence, packages: recommendedPackages,
    region: selectedRegion, nicheId: activeNicheId, subNicheId: activeSubNicheId,
  }) : null, [creatorMeta, platforms, completeIntelligence, recommendedPackages, selectedRegion, activeNicheId, activeSubNicheId]);

  // Executive Valuation Report PDF Export Handler
  const handleExportPDF = useCallback(async () => {
    if (!creatorMeta || isExportingPdf) return;
    setIsExportingPdf(true);

    try {
      const activeNiche = PRIMARY_NICHES.find((n) => n.id === activeNicheId);
      const availableSubs = activeNicheId ? getSubNichesByPrimaryId(activeNicheId) : [];
      const activeSub = availableSubs.find((s) => s.id === activeSubNicheId);

      const payload = {
        profile: calculatorProfile || undefined,
        creatorMeta: {
          displayName: creatorMeta.displayName,
          primaryUsername: creatorMeta.primaryUsername,
          avatarUrl: creatorMeta.avatarUrl,
          contactEmail: creatorMeta.contactEmail,
        },
        selectedRegion,
        activeNicheName: activeNiche?.name,
        activeSubNicheName: activeSub?.name,
        totalAudienceCount,
        verifiedChannelsCount,
        platforms,
        recommendedPackages,
        completeIntelligence,
        instantContractUrl: buildContractHref(),
      };

      const res = await fetch("/api/calculator/export-pdf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to generate rate card PDF.");
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const safeName = (creatorMeta.displayName || creatorMeta.primaryUsername || "Creator")
        .replace(/[^a-zA-Z0-9_-]/g, "_");
      a.download = `SignCollab_RateCard_${safeName}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error: any) {
      console.error("Export PDF error:", error);
      alert(error.message || "Failed to export PDF report. Please try again.");
    } finally {
      setIsExportingPdf(false);
    }
  }, [
    creatorMeta,
    isExportingPdf,
    activeNicheId,
    activeSubNicheId,
    selectedRegion,
    totalAudienceCount,
    verifiedChannelsCount,
    platforms,
    recommendedPackages,
    completeIntelligence,
    buildContractHref,
    calculatorProfile,
  ]);

  return (
    <div className={`w-full mx-auto space-y-8 ${reportRevealed ? "calculator-results-wide" : "max-w-5xl"}`}>
      {/* ========================================================= */}
      {/* STAGE 1: HERO SEARCH SECTION                              */}
      {/* ========================================================= */}
      {!hasSearched ? (
        <div ref={heroSectionRef}>
          <CalculatorSearch query={inputQuery} onQuery={setInputQuery} platform={selectedPlatform} onPlatform={setSelectedPlatform} showPlatforms={hasHandleInput} onSubmit={handleStart} />
        </div>
      ) : (
        <>
          {!reportRevealed && <div ref={telemetrySectionRef} className="scroll-mt-28">
            <CalculatorAnalysis complete={reportReady} query={inputQuery} platforms={platforms} searching={isSearching} resolving={isResolvingIdentity} synthesizing={isSynthesizing} intelligenceReady={Boolean(completeIntelligence)} onRetry={() => { void handleStart(); }} onNewSearch={() => setHasSearched(false)} onLink={() => setIsMissingModalOpen(true)} />
          </div>}
          {reportRevealed && calculatorProfile && <div ref={valuationDashboardRef} className="scroll-mt-24">
            <CreatorProfileView profile={calculatorProfile} calculator={{
              controls: <div className="calculator-result-controls">
                {isValuationCalibrated && (
                <div className="p-3.5 sm:p-4 rounded-2xl bg-zinc-50 border border-zinc-200 flex flex-wrap items-center justify-between gap-3 animate-fadeIn">
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wide">
                        Market:
                      </span>
                      <select
                        aria-label="Pricing market"
                        value={selectedRegion}
                        onChange={(e) => {
                          const newReg = e.target.value as RegionCode;
                          hasUserManuallySelectedRegion.current = true;
                          setSelectedRegion(newReg);
                          recomputeAllPlatformRates(newReg, activeNicheId, activeSubNicheId);
                        }}
                        className="bg-white border border-zinc-300 rounded-lg px-2.5 py-1 font-semibold text-zinc-900 focus:outline-none focus:border-zinc-900 cursor-pointer text-xs shadow-2xs"
                      >
                        <option value="PK">Pakistan (PKR)</option>
                        <option value="US">United States (USD)</option>
                        <option value="GB">United Kingdom (GBP)</option>
                        <option value="IN">India (INR)</option>
                        <option value="CA">Canada (CAD)</option>
                        <option value="AU">Australia (AUD)</option>
                        <option value="AE">United Arab Emirates (AED)</option>
                        <option value="SA">Saudi Arabia (SAR)</option>
                        <option value="DE">Germany (EUR)</option>
                        <option value="FR">France (EUR)</option>
                        <option value="SG">Singapore (SGD)</option>
                        <option value="BR">Brazil (BRL)</option>
                        <option value="BD">Bangladesh (BDT)</option>
                        <option value="NG">Nigeria (NGN)</option>
                        <option value="EG">Egypt (EGP)</option>
                        <option value="TR">Turkey (TRY)</option>
                        <option value="ZA">South Africa (ZAR)</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wide">
                        Sector:
                      </span>
                      <select
                        aria-label="Creator niche"
                        value={activeNicheId}
                        onChange={(e) => {
                          const newNiche = Number(e.target.value);
                          const availableSubs = getSubNichesByPrimaryId(newNiche);
                          const defaultSub = availableSubs[0]?.id;
                          setActiveNicheId(newNiche);
                          setActiveSubNicheId(defaultSub);
                          recomputeAllPlatformRates(selectedRegion, newNiche, defaultSub);
                          setCompleteIntelligence((prev) => {
                            if (!prev) return prev;
                            const matchedPrimary = PRIMARY_NICHES.find((p) => p.id === newNiche);
                            const matchedSub = SUB_NICHES.find((s) => s.id === defaultSub);
                            return {
                              ...prev,
                              profile: {
                                ...prev.profile,
                                primaryNiche: matchedPrimary
                                  ? { id: matchedPrimary.id, name: matchedPrimary.name, multiplier: matchedPrimary.multiplier }
                                  : prev.profile.primaryNiche,
                                subNiche: matchedSub
                                  ? { id: matchedSub.id, name: matchedSub.name, multiplier: matchedSub.multiplier }
                                  : prev.profile.subNiche,
                              },
                            };
                          });
                        }}
                        className="bg-white border border-zinc-300 rounded-lg px-2.5 py-1 font-semibold text-zinc-900 focus:outline-none focus:border-zinc-900 cursor-pointer text-xs shadow-2xs max-w-[210px] truncate"
                      >
                        {PRIMARY_NICHES.map((n) => (
                          <option key={n.id} value={n.id}>
                            {n.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wide">
                        Sub-Niche:
                      </span>
                      <select
                        aria-label="Creator sub-niche"
                        value={activeSubNicheId || ""}
                        onChange={(e) => {
                          const newSub = Number(e.target.value);
                          setActiveSubNicheId(newSub);
                          recomputeAllPlatformRates(selectedRegion, activeNicheId, newSub);
                          setCompleteIntelligence((prev) => {
                            if (!prev) return prev;
                            const matchedSub = SUB_NICHES.find((s) => s.id === newSub);
                            return {
                              ...prev,
                              profile: {
                                ...prev.profile,
                                subNiche: matchedSub
                                  ? { id: matchedSub.id, name: matchedSub.name, multiplier: matchedSub.multiplier }
                                  : prev.profile.subNiche,
                              },
                            };
                          });
                        }}
                        className="bg-white border border-zinc-300 rounded-lg px-2.5 py-1 font-semibold text-zinc-900 focus:outline-none focus:border-zinc-900 cursor-pointer text-xs shadow-2xs max-w-[240px] truncate"
                      >
                        {getSubNichesByPrimaryId(activeNicheId).map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="text-[11px] text-zinc-500 font-medium">
                    Applied Market: <span className="font-semibold text-zinc-950">{REGIONAL_CONFIG[selectedRegion]?.name || selectedRegion}</span> ({REGIONAL_CONFIG[selectedRegion]?.currency})
                  </div>
                </div>
              )}
                <div className="calculator-account-tools">
                  <span>Showing {verifiedChannelsCount} connected {verifiedChannelsCount === 1 ? "platform" : "platforms"}.</span>
                  <button type="button" onClick={() => setIsMissingModalOpen(true)}>Link another account</button>
                  {Object.entries(platforms).filter(([, data]) => data.status === "error").map(([key, data]) => <button key={key} type="button" onClick={() => scrapePlatform(data.retryInput || data.username || "", key as Platform)}>Retry {key === "youtube" ? "YouTube" : key === "tiktok" ? "TikTok" : "Instagram"}</button>)}
                  <button type="button" disabled={isSynthesizing} onClick={() => triggerOmnichannelSynthesis(true)}>Refresh insights</button>
                </div>
              </div>,
              notices: <>{!completeIntelligence && <p role="status" className="calculator-result-notice">Audience insights are unavailable for this report. Rates use the available platform data and current market settings, which you can adjust below.</p>}{Object.values(platforms).some(channel => channel.status === "error") && <p role="status" className="calculator-result-notice">Some platforms could not be collected. This report includes the accounts that completed successfully.</p>}</>,
              contractUrl: buildContractHref(), onNewSearch: () => { setHasSearched(false); setInputQuery(""); window.scrollTo({ top: 0, behavior: "instant" }); },
              onExport: handleExportPDF, isExporting: isExportingPdf,
              onLink: () => setIsMissingModalOpen(true), onCopyPackage: handleCopyPackageProposal, copiedPackageId,
            }} />
          </div>}
        </>
      )}

      {/* ========================================================= */}
      {/* SECTION 7: MISSING PLATFORM DISCOVERY MODAL POPUP         */}
      {/* ========================================================= */}
      {isMissingModalOpen && (() => {
        const hasAnyMissingInput = Boolean(
          (missingInputs.youtube && missingInputs.youtube.trim().length > 0) ||
          (missingInputs.instagram && missingInputs.instagram.trim().length > 0) ||
          (missingInputs.tiktok && missingInputs.tiktok.trim().length > 0)
        );

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-gray-950/75 backdrop-blur-md animate-fadeIn">
            <div className="relative bg-white/95 rounded-2xl sm:rounded-3xl border border-gray-200/90 shadow-2xl max-w-lg w-full max-h-[92vh] overflow-y-auto text-left animate-scaleUp">
              {/* Background World Map Pattern from Hero with high mobile visibility */}
              <div
                className="absolute inset-0 pointer-events-none opacity-35 sm:opacity-30 bg-center bg-cover bg-no-repeat transition-opacity"
                style={{ backgroundImage: "url('/hero-image-calcuator.webp')" }}
              />
              {/* Soft gradient mask for text readability */}
              <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-white/90 via-white/80 to-white/90" />

              {/* Modal Content */}
              <div className="relative z-10">
                {/* Modal Header Banner */}
                <div className="px-4 sm:px-6 pt-4 sm:pt-6 pb-3 sm:pb-4 border-b border-zinc-100 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full bg-zinc-950 text-white text-[10px] sm:text-[11px] font-medium shadow-2xs">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span>Omnichannel Radar Discovery</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsMissingModalOpen(false)}
                      className="text-zinc-400 hover:text-zinc-900 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-zinc-100 hover:bg-zinc-200 transition-colors flex items-center justify-center font-medium text-xs cursor-pointer"
                      aria-label="Close modal"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <h3 className="text-base sm:text-lg font-semibold text-zinc-950 tracking-tight pt-1">
                    Unlock Complete 360° Report
                  </h3>
                  <p className="text-xs text-zinc-500 leading-relaxed">
                    Have another account for this creator? Add its handle to include it in the report. Only link accounts that belong to this creator.
                  </p>
                </div>

                {/* Modal Body */}
                <div className="px-4 sm:px-6 py-3.5 sm:py-4 space-y-3.5 sm:space-y-4">
                  {/* Verified Accounts Section */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-medium text-zinc-400 uppercase tracking-wider">
                      <span>Verified Connected Channels</span>
                      <span className="text-emerald-600 font-medium lowercase tracking-normal">({verifiedChannelsCount}/3 connected)</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {platforms.youtube.status === "ready" && (
                        <div className="px-3 py-2 rounded-xl bg-white/90 border border-zinc-200 shadow-2xs flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <Video className="w-4 h-4 text-red-600 shrink-0" />
                            <div className="truncate">
                              <div className="text-xs font-semibold text-zinc-900 truncate">YouTube</div>
                              <div className="text-[10px] font-sans text-zinc-500 truncate">@{platforms.youtube.username?.replace(/^@/, "")}</div>
                            </div>
                          </div>
                          <span className="shrink-0 px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-semibold flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Verified</span>
                          </span>
                        </div>
                      )}

                      {platforms.instagram.status === "ready" && (
                        <div className="px-3 py-2 rounded-xl bg-white/90 border border-zinc-200 shadow-2xs flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <Camera className="w-4 h-4 text-pink-600 shrink-0" />
                            <div className="truncate">
                              <div className="text-xs font-semibold text-zinc-900 truncate">Instagram</div>
                              <div className="text-[10px] font-sans text-zinc-500 truncate">@{platforms.instagram.username?.replace(/^@/, "")}</div>
                            </div>
                          </div>
                          <span className="shrink-0 px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-semibold flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Verified</span>
                          </span>
                        </div>
                      )}

                      {platforms.tiktok.status === "ready" && (
                        <div className="px-3 py-2 rounded-xl bg-white/90 border border-zinc-200 shadow-2xs flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <Music2 className="w-4 h-4 text-zinc-950 shrink-0" />
                            <div className="truncate">
                              <div className="text-xs font-semibold text-zinc-900 truncate">TikTok</div>
                              <div className="text-[10px] font-sans text-zinc-500 truncate">@{platforms.tiktok.username?.replace(/^@/, "")}</div>
                            </div>
                          </div>
                          <span className="shrink-0 px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-semibold flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Verified</span>
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Missing Accounts Input Fields */}
                  <div className="space-y-3 pt-3 border-t border-zinc-100">
                    <div className="text-[11px] font-medium text-zinc-700 uppercase tracking-wider">
                      Add Unfound Channel(s)
                    </div>

                    {platforms.youtube.status !== "ready" && (
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-zinc-800 flex items-center gap-1.5">
                          <Video className="w-3.5 h-3.5 text-red-600" />
                          <span>YouTube Channel Link or @Handle</span>
                        </label>
                        <div className="relative flex items-center">
                          <input
                            type="text"
                            value={missingInputs.youtube}
                            onChange={(e) => setMissingInputs((prev) => ({ ...prev, youtube: e.target.value }))}
                            placeholder="https://youtube.com/@channel or @handle"
                            className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-zinc-200 bg-white/90 focus:bg-white focus:outline-none focus:border-zinc-950 focus:ring-2 focus:ring-zinc-950/10 font-medium transition-all shadow-2xs"
                          />
                        </div>
                      </div>
                    )}

                    {platforms.instagram.status !== "ready" && (
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-zinc-800 flex items-center gap-1.5">
                          <Camera className="w-3.5 h-3.5 text-pink-600" />
                          <span>Instagram Profile Link or @Handle</span>
                        </label>
                        <div className="relative flex items-center">
                          <input
                            type="text"
                            value={missingInputs.instagram}
                            onChange={(e) => setMissingInputs((prev) => ({ ...prev, instagram: e.target.value }))}
                            placeholder="https://instagram.com/username or @handle"
                            className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-zinc-200 bg-white/90 focus:bg-white focus:outline-none focus:border-zinc-950 focus:ring-2 focus:ring-zinc-950/10 font-medium transition-all shadow-2xs"
                          />
                        </div>
                      </div>
                    )}

                    {platforms.tiktok.status !== "ready" && (
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-zinc-800 flex items-center gap-1.5">
                          <Music2 className="w-3.5 h-3.5 text-zinc-950" />
                          <span>TikTok Profile Link or @Handle</span>
                        </label>
                        <div className="relative flex items-center">
                          <input
                            type="text"
                            value={missingInputs.tiktok}
                            onChange={(e) => setMissingInputs((prev) => ({ ...prev, tiktok: e.target.value }))}
                            placeholder="https://tiktok.com/@username or @handle"
                            className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-zinc-200 bg-white/90 focus:bg-white focus:outline-none focus:border-zinc-950 focus:ring-2 focus:ring-zinc-950/10 font-medium transition-all shadow-2xs"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Benefit Card */}
                  <div className="p-3 rounded-2xl bg-white/80 border border-zinc-200/90 shadow-2xs flex items-start gap-2.5 text-xs">
                    <div className="w-5 h-5 rounded-md bg-zinc-950 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                      <Zap className="w-3 h-3 text-amber-400" />
                    </div>
                    <div className="text-zinc-600 leading-relaxed text-[11px]">
                      Connecting all 3 channels unlocks the <strong className="text-zinc-950 font-semibold">Omnichannel 360 Authority Package</strong> with automatic multi-platform bundle discounts.
                    </div>
                  </div>
                </div>

                {/* Modal Actions Footer */}
                <div className="px-4 sm:px-6 py-3.5 sm:py-4 bg-zinc-50/90 border-t border-zinc-100 flex items-center justify-end gap-2">
                  {hasAnyMissingInput ? (
                    <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-2 w-full">
                      <button
                        type="button"
                        onClick={() => setIsMissingModalOpen(false)}
                        className="w-full sm:w-auto px-4 py-2.5 text-xs font-semibold text-zinc-600 hover:text-zinc-900 bg-white hover:bg-zinc-100 border border-zinc-200 rounded-xl transition-all cursor-pointer text-center shadow-2xs"
                      >
                        Skip &amp; View {verifiedChannelsCount}-Platform Report
                      </button>

                      <button
                        type="button"
                        onClick={handleSubmitMissingPlatforms}
                        className="w-full sm:w-auto px-5 py-2.5 text-xs font-medium text-white bg-zinc-900 hover:bg-black rounded-xl transition-all shadow-md cursor-pointer flex items-center justify-center gap-1.5 text-center animate-fadeIn"
                      >
                        <span>Sync &amp; Complete 360° Report</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setIsMissingModalOpen(false)}
                      className="w-full px-5 py-3 text-xs font-medium text-white bg-zinc-900 hover:bg-black rounded-xl transition-all shadow-md cursor-pointer flex items-center justify-center gap-2 text-center"
                    >
                      <span>Continue &amp; View {verifiedChannelsCount}-Platform Report</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
