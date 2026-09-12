"use client";

import React, { useState, useRef, useCallback, useMemo, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  ArrowRight,
  ArrowUp,
  Clock,
  CheckCircle2,
  Zap,
  Radio,
  Sparkles,
  Package,
  FileText,
  Copy,
  Globe,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  ShieldCheck,
  Flame,
  Crown,
  Users,
  Video,
  Camera,
  Music2,
  X,
  RefreshCw,
  Loader2,
  AlertCircle,
  TrendingUp,
  DollarSign,
  Activity,
} from "lucide-react";
import { Platform, DeliverableFormat, PricingInput, RegionCode } from "@/lib/calculator/types";
import { calculateInfluencerRate } from "@/lib/calculator/engine";
import { FORMAT_LABELS, REGIONAL_CONFIG, PRIMARY_NICHES, SUB_NICHES, getSubNichesByPrimaryId } from "@/lib/calculator/constants";
import { InstagramPostItem, YouTubeVideoItem, TikTokVideoItem } from "@/lib/scrapers/types";
import { CompleteCreatorIntelligence } from "@/lib/ai/types";
import { MultiPlatformCreatorInput } from "@/lib/ai/gemini";

interface DiscoveredPlatformData {
  status: "idle" | "loading" | "ready" | "error";
  username?: string;
  displayName?: string;
  avatarUrl?: string;
  country?: string;
  followerCount?: number;
  avgLikes?: number;
  avgComments?: number;
  avgViews?: number;
  engagementRate?: number;
  longEngagementRate?: number;
  shortEngagementRate?: number;
  avgLongViews?: number;
  avgShortViews?: number;
  posts?: InstagramPostItem[];
  videos?: Array<Record<string, unknown>>;
  rateCardItems?: Array<{
    format: DeliverableFormat;
    amount: number;
    formattedAmount: string;
    lowAmount: number;
    formattedLow: string;
    highAmount: number;
    formattedHigh: string;
    currency: string;
    usdEquivalentFormatted?: string;
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

interface PlatformTickerStep {
  step: number;
  percent: number;
  text: string;
}

const INSTAGRAM_TICKER_STEPS: PlatformTickerStep[] = [
  { step: 1, percent: 12, text: "Initial handshake & entity resolution for target account" },
  { step: 2, percent: 25, text: "Ingesting profile telemetry, follower graphs & verification status" },
  { step: 3, percent: 38, text: "Auditing 12 recent chronological uploads & filtering pinned media" },
  { step: 4, percent: 50, text: "Extracting cross-platform identity links & bio semantic vectors" },
  { step: 5, percent: 65, text: "LLM Neural Classifier: Indexing creator primary & secondary niches" },
  { step: 6, percent: 80, text: "Deep-auditing pure unpinned Reels & empirical interaction signals" },
  { step: 7, percent: 92, text: "Executing 16-knot empirical rate valuation & commercial modeling" },
  { step: 8, percent: 100, text: "Instagram Telemetry Active: Multi-tier defended rates verified" },
];

const YOUTUBE_TICKER_STEPS: PlatformTickerStep[] = [
  { step: 1, percent: 15, text: "Resolving channel entity, handle & subscriber baseline telemetry" },
  { step: 2, percent: 30, text: "Connecting to video stream indexer & upload archive registry" },
  { step: 3, percent: 48, text: "Auditing long-form video performance & view-velocity distribution" },
  { step: 4, percent: 65, text: "Analyzing YouTube Shorts retention & audience engagement signals" },
  { step: 5, percent: 80, text: "LLM Content Indexing: Extracting topic vectors & category classification" },
  { step: 6, percent: 92, text: "Computing dedicated, integrated & short video valuation matrices" },
  { step: 7, percent: 100, text: "YouTube Telemetry Active: Channel metrics & rates defensible" },
];

const TIKTOK_TICKER_STEPS: PlatformTickerStep[] = [
  { step: 1, percent: 15, text: "Resolving TikTok creator handle & follower baseline telemetry" },
  { step: 2, percent: 35, text: "Extracting short-form video telemetry & play-count velocity" },
  { step: 3, percent: 55, text: "Auditing likes, comments & viral share distribution metrics" },
  { step: 4, percent: 75, text: "LLM Behavioral Modeling: Synthesizing interaction coefficients" },
  { step: 5, percent: 90, text: "Executing 16-knot short-form video deliverable commercial valuation" },
  { step: 6, percent: 100, text: "TikTok Telemetry Active: Defended video deliverable rate verified" },
];

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

  // Progressive Scroll UX Refs & Sticky Search Bar
  const heroSectionRef = useRef<HTMLDivElement>(null);
  const telemetrySectionRef = useRef<HTMLDivElement>(null);
  const valuationDashboardRef = useRef<HTMLDivElement>(null);
  const [isStickyBarVisible, setIsStickyBarVisible] = useState(false);

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
  const hasPromptedMissingModal = useRef(false);

  // Platform Ticker Step State (6-8 steps each)
  const [igStepIdx, setIgStepIdx] = useState(0);
  const [ytStepIdx, setYtStepIdx] = useState(0);
  const [ttStepIdx, setTtStepIdx] = useState(0);

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
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const synthesizedHash = useRef<string>("");

  // Valuation Calibration Pipeline State (atomic reveal after AI country/niche synthesis)
  const [isValuationCalibrated, setIsValuationCalibrated] = useState(false);
  const hasUserManuallySelectedRegion = useRef(false);
  const platformsRef = useRef(platforms);
  useEffect(() => {
    platformsRef.current = platforms;
  }, [platforms]);

  // Track scroll position to reveal sticky search / creator bar when scrolled past hero
  useEffect(() => {
    const handleScroll = () => {
      if (hasSearched && window.scrollY > 280) {
        setIsStickyBarVisible(true);
      } else {
        setIsStickyBarVisible(false);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [hasSearched]);

  // Stage 3 Smooth Auto-Scroll down to Valuation Dashboard when calibrated
  useEffect(() => {
    if (isValuationCalibrated && valuationDashboardRef.current) {
      const timer = setTimeout(() => {
        valuationDashboardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [isValuationCalibrated]);

  // Instagram Ticker Step Progression
  useEffect(() => {
    if (platforms.instagram.status === "loading") {
      setIgStepIdx(0);
      const interval = setInterval(() => {
        setIgStepIdx((prev) => (prev < INSTAGRAM_TICKER_STEPS.length - 2 ? prev + 1 : prev));
      }, 3500);
      return () => clearInterval(interval);
    } else if (platforms.instagram.status === "ready") {
      setIgStepIdx(INSTAGRAM_TICKER_STEPS.length - 1);
    }
  }, [platforms.instagram.status]);

  // YouTube Ticker Step Progression
  useEffect(() => {
    if (platforms.youtube.status === "loading") {
      setYtStepIdx(0);
      const interval = setInterval(() => {
        setYtStepIdx((prev) => (prev < YOUTUBE_TICKER_STEPS.length - 2 ? prev + 1 : prev));
      }, 1800);
      return () => clearInterval(interval);
    } else if (platforms.youtube.status === "ready") {
      setYtStepIdx(YOUTUBE_TICKER_STEPS.length - 1);
    }
  }, [platforms.youtube.status]);

  // TikTok Ticker Step Progression
  useEffect(() => {
    if (platforms.tiktok.status === "loading") {
      setTtStepIdx(0);
      const interval = setInterval(() => {
        setTtStepIdx((prev) => (prev < TIKTOK_TICKER_STEPS.length - 2 ? prev + 1 : prev));
      }, 1800);
      return () => clearInterval(interval);
    } else if (platforms.tiktok.status === "ready") {
      setTtStepIdx(TIKTOK_TICKER_STEPS.length - 1);
    }
  }, [platforms.tiktok.status]);

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
      subNicheId?: number
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
        const isForeign = regionCode !== "US";
        const usdMedian = res.lineItems.totalUSD;
        const usdEquivalent = isForeign ? `~$${usdMedian.toLocaleString()} USD` : undefined;

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
    (targetRegion: RegionCode, targetNicheId: number, targetSubNicheId?: number) => {
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
              targetSubNicheId
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
                avgShortLikes: 0,
                avgShortComments: 0,
                avgShortViews: updated.youtube.avgShortViews || 0,
              },
              targetSubNicheId
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
              targetSubNicheId
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

          if (longVids.length > 0) {
            avgLikes = Math.round(longVids.reduce((s: number, v: { likeCount?: number }) => s + (v.likeCount || 0), 0) / longVids.length);
            avgComments = Math.round(longVids.reduce((s: number, v: { commentCount?: number }) => s + (v.commentCount || 0), 0) / longVids.length);
            avgViews = avgLongViews;
          }

          if (shortVids.length > 0) {
            avgShortLikes = Math.round(shortVids.reduce((s: number, v: { likeCount?: number }) => s + (v.likeCount || 0), 0) / shortVids.length);
            avgShortComments = Math.round(shortVids.reduce((s: number, v: { commentCount?: number }) => s + (v.commentCount || 0), 0) / shortVids.length);
          }

          engagementRate = avgLongEngagementRate;

          if (engagementRate === 0 && avgViews > 0 && (avgLikes > 0 || avgComments > 0)) {
            engagementRate = Number((((avgLikes + avgComments) / avgViews) * 100).toFixed(2));
          }

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
            longEngagementRate: targetPlatform === "youtube" ? avgLongEngagementRate : undefined,
            shortEngagementRate: targetPlatform === "youtube" ? avgShortEngagementRate : undefined,
            avgLongViews: targetPlatform === "youtube" ? avgLongViews : undefined,
            avgShortViews: targetPlatform === "youtube" ? avgShortViews : undefined,
            posts: targetPlatform === "instagram" ? data.posts : undefined,
            videos:
              targetPlatform === "youtube"
                ? [...(data.longVideos || []), ...(data.shortVideos || [])]
                : targetPlatform === "tiktok"
                ? data.videos
                : undefined,
            rateCardItems,
            sourceNote,
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
              primaryUsername: username,
              avatarUrl,
              primaryPlatform: targetPlatform,
            };
          }
          return prev;
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
    [addActivity, computePlatformRateCards, activeNicheId, activeSubNicheId, selectedRegion]
  );

  // Main Form Submit
  const handleStart = async (e: React.FormEvent) => {
    e.preventDefault();
    const query = inputQuery.trim();
    if (!query) return;

    setIsSearching(true);
    setHasSearched(true);
    setIsValuationCalibrated(false);
    hasUserManuallySelectedRegion.current = false;
    setActivityFeed([]);
    setCreatorMeta(null);
    setCompleteIntelligence(null);
    hasPromptedMissingModal.current = false;

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

  // Unified 19-Point Omnichannel AI Synthesis Function
  const triggerOmnichannelSynthesis = useCallback(async (bypassCache = false) => {
    const readyList: Platform[] = [];
    if (platforms.youtube.status === "ready") readyList.push("youtube");
    if (platforms.instagram.status === "ready") readyList.push("instagram");
    if (platforms.tiktok.status === "ready") readyList.push("tiktok");

    if (readyList.length === 0) return;

    const currentHash = readyList.map((p) => `${p}:${platforms[p].username || ""}`).sort().join("|");
    if (currentHash === synthesizedHash.current && !bypassCache) return;

    setIsSynthesizing(true);
    addActivity(`Gemini 3.7 Flash: Synthesizing 19-point Creator Intelligence across ${readyList.length} platform(s)...`, "info");

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
        body: JSON.stringify({ multiInput, regionCode: selectedRegion, bypassCache }),
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

        // Recompute all platform rates atomically with the detected country PPP, niche & sub-niche!
        recomputeAllPlatformRates(targetCountry, detectedNicheId, detectedSubNicheId);
        setIsValuationCalibrated(true);

        const subNicheText = intel.profile?.subNiche ? ` · ${intel.profile.subNiche.name} (${intel.profile.subNiche.multiplier}x)` : '';
        addActivity(
          `Intelligence Verified (24h Cache): ${intel.profile.creatorType} · ${intel.profile.primaryNiche.name}${subNicheText} · Calibrated for ${REGIONAL_CONFIG[targetCountry]?.name || targetCountry} (${REGIONAL_CONFIG[targetCountry]?.pppIndex || 1}x PPP)`,
          "success"
        );
      } else {
        // Fallback: unlock valuation with current defaults so user is never stuck
        recomputeAllPlatformRates(selectedRegion, activeNicheId, activeSubNicheId);
        setIsValuationCalibrated(true);
      }
    } catch (e) {
      console.warn("[InfluencerRadar AI Synthesis Warning]:", e);
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

  // Prompt Missing Platforms Modal ONLY after valuation has calibrated and settled
  useEffect(() => {
    const isAnyInFlight =
      platforms.instagram.status === "loading" ||
      platforms.youtube.status === "loading" ||
      platforms.tiktok.status === "loading";

    if (
      !isAnyInFlight &&
      !isSynthesizing &&
      isValuationCalibrated &&
      verifiedChannelsCount > 0 &&
      verifiedChannelsCount < 3 &&
      !hasPromptedMissingModal.current
    ) {
      const modalTimer = setTimeout(() => {
        setIsMissingModalOpen(true);
        hasPromptedMissingModal.current = true;
      }, 2500);

      return () => clearTimeout(modalTimer);
    }
  }, [platforms, isSynthesizing, isValuationCalibrated, verifiedChannelsCount]);

  // Handle Missing Platforms Submission
  const handleSubmitMissingPlatforms = () => {
    setIsMissingModalOpen(false);

    if (missingInputs.youtube.trim() && platforms.youtube.status !== "ready") {
      scrapePlatform(missingInputs.youtube.trim(), "youtube", "User linked YouTube account");
    }
    if (missingInputs.instagram.trim() && platforms.instagram.status !== "ready") {
      scrapePlatform(missingInputs.instagram.trim(), "instagram", "User linked Instagram account");
    }
    if (missingInputs.tiktok.trim() && platforms.tiktok.status !== "ready") {
      scrapePlatform(missingInputs.tiktok.trim(), "tiktok", "User linked TikTok account");
    }
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
      handle: creatorMeta?.primaryUsername || "",
      creatorHandle: creatorMeta?.primaryUsername || "",
      platform: (creatorMeta?.primaryPlatform || "instagram").toUpperCase(),
      currency: REGIONAL_CONFIG[selectedRegion]?.currency || "USD",
      region: selectedRegion,
      amount: calculatedAmount > 0 ? calculatedAmount.toString() : "500",
      deliverables: primaryDeliverables.length > 0 ? JSON.stringify(primaryDeliverables) : "",
      niche: PRIMARY_NICHES.find((n) => n.id === activeNicheId)?.name || "",
    });
    return `/instant?${queryParams.toString()}`;
  }, [platforms, creatorMeta, selectedRegion, activeNicheId]);

  // Compute Omnichannel Bundles (Starter & Full Pack)
  // Per spec: each deliverable uses its OWN platform's native metrics (Steps 1-4)
  const bundleOffers = useMemo(() => {
    if (verifiedChannelsCount < 2 || !isValuationCalibrated) return null;

    const regConfig = REGIONAL_CONFIG[selectedRegion] || REGIONAL_CONFIG["US"];

    // Helper: Calculate a bundle by computing each deliverable individually with its own platform's metrics
    const computeBundle = (
      deliverables: Array<{ id: string; platform: Platform; format: DeliverableFormat; quantity: number }>,
      usageScope: "organic_repost" | "paid_partnership_ads"
    ) => {
      // Step 1-4: Calculate each deliverable with its own platform's native data
      let grossTotalUSD = 0;
      for (const item of deliverables) {
        const platData = platforms[item.platform];
        const isYtShort = item.platform === "youtube" && item.format === "yt_short";
        const itemViews = isYtShort && platData.avgShortViews ? platData.avgShortViews : platData.avgViews;
        const singleInput: PricingInput = {
          creator: {
            followerCount: platData.followerCount || 25000,
            last3PostsAvgLikes: platData.avgLikes || 500,
            last3PostsAvgComments: platData.avgComments || 25,
            last3PostsAvgViews: itemViews,
            primaryPlatform: item.platform,
            primaryNicheId: activeNicheId,
            regionCode: selectedRegion,
          },
          deliverables: [{ ...item, quantity: 1 }],
          commercialTerms: { usageRights: { scope: "organic_repost", duration: "30_days" } },
        };
        const res = calculateInfluencerRate(singleInput);
        grossTotalUSD += res.lineItems.grossTotalUSD;
      }

      // Step 5: Multi-Asset Bundle Volume Discount
      const totalAssetCount = deliverables.reduce((sum, d) => sum + d.quantity, 0);
      const bundleDiscountPercent = totalAssetCount >= 4 ? 0.15 : totalAssetCount >= 2 ? 0.10 : 0.00;
      const bundleDiscountAmountUSD = grossTotalUSD * bundleDiscountPercent;
      const netContentFeeUSD = grossTotalUSD - bundleDiscountAmountUSD;

      // Step 6: Commercial Rights Surcharge
      const usagePercent = usageScope === "paid_partnership_ads" ? 0.25 : 0.00;
      const commercialRightsFeeUSD = netContentFeeUSD * usagePercent;
      const totalUSD = netContentFeeUSD + commercialRightsFeeUSD;

      // Step 8: PPP & FX localization
      const localizedMedian = totalUSD * regConfig.pppIndex * regConfig.fxRateToUSD;

      // Step 9: Defended Negotiation Bounds
      const lowP25 = Math.round(localizedMedian * 0.80);
      const typicalMedian = Math.round(localizedMedian);
      const highP75 = Math.round(localizedMedian * 1.25);

      const savingsLocalized = Math.round(bundleDiscountAmountUSD * regConfig.pppIndex * regConfig.fxRateToUSD);

      return { grossTotalUSD, totalUSD, lowP25, typicalMedian, highP75, savingsLocalized };
    };

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

    const starterResult = computeBundle(starterDeliverables, "organic_repost");

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

    const authResult = computeBundle(authorityDeliverables, "paid_partnership_ads");

    const isForeign = selectedRegion !== "US";
    const starterUsd = isForeign ? `(~$${starterResult.totalUSD.toLocaleString()} USD)` : "";
    const authUsd = isForeign ? `(~$${authResult.totalUSD.toLocaleString()} USD)` : "";

    return {
      starter: {
        title: "Cross-Platform Starter Combo",
        subtitle: starterDeliverables.map((d) => FORMAT_LABELS[d.format]?.tag || d.format).join(" + "),
        typicalFormatted: `${regConfig.symbol}${starterResult.typicalMedian.toLocaleString()} ${starterUsd}`,
        lowFormatted: `${regConfig.symbol}${starterResult.lowP25.toLocaleString()}`,
        highFormatted: `${regConfig.symbol}${starterResult.highP75.toLocaleString()}`,
        savings: `${regConfig.symbol}${starterResult.savingsLocalized.toLocaleString()} ${regConfig.currency}`,
      },
      authority: {
        title: "Omnichannel 360 Authority Pack",
        subtitle: authorityDeliverables.map((d) => FORMAT_LABELS[d.format]?.tag || d.format).join(" + "),
        typicalFormatted: `${regConfig.symbol}${authResult.typicalMedian.toLocaleString()} ${authUsd}`,
        lowFormatted: `${regConfig.symbol}${authResult.lowP25.toLocaleString()}`,
        highFormatted: `${regConfig.symbol}${authResult.highP75.toLocaleString()}`,
        savings: `${regConfig.symbol}${authResult.savingsLocalized.toLocaleString()} ${regConfig.currency}`,
      },
    };
  }, [verifiedChannelsCount, platforms, activeNicheId, selectedRegion]);

  // Extract and normalize primary & secondary regional markets
  const { cleanPrimaryMarket, secondaryMarketsList } = useMemo(() => {
    const isInvalid = (val: string | null | undefined): boolean => {
      if (!val) return true;
      const v = val.trim().toLowerCase();
      return (
        v === "global" ||
        v === "worldwide" ||
        v === "international" ||
        v === "none" ||
        v === "unknown" ||
        v === "null" ||
        v === "n/a"
      );
    };

    let primary = completeIntelligence?.audience?.primaryMarket?.trim() || "";
    let secondaries = Array.isArray(completeIntelligence?.audience?.secondaryMarkets)
      ? [...completeIntelligence.audience.secondaryMarkets]
      : [];

    // Clean composite strings if cached before normalization (e.g. "Pakistan & South Asian Global Diaspora (UAE, UK, US)")
    if (primary.includes('&') || primary.includes('/') || primary.toLowerCase().includes('diaspora') || primary.includes('(')) {
      const splitParts = primary.split(/\s*&\s*|\s*\/\s*|\s*,\s*(?=[A-Z])/);
      if (splitParts.length > 1) {
        primary = splitParts[0].replace(/\s*\(.*?\)/g, '').trim();
        for (let i = 1; i < splitParts.length; i++) {
          const sec = splitParts[i].trim();
          if (sec && !secondaries.includes(sec)) secondaries.push(sec);
        }
      } else if (primary.includes('(')) {
        const match = primary.match(/^([^(]+)\s*\((.*?)\)$/);
        if (match) {
          primary = match[1].trim();
          const sec = match[2].trim();
          if (sec && !secondaries.includes(sec)) secondaries.push(sec);
        }
      }
    }

    // Resolve primary country - NEVER return "Global" or "Worldwide"
    if (isInvalid(primary)) {
      if (!isInvalid(completeIntelligence?.geography?.countryName)) {
        primary = completeIntelligence!.geography!.countryName!;
      } else if (completeIntelligence?.geography?.countryCode && REGIONAL_CONFIG[completeIntelligence.geography.countryCode as RegionCode]) {
        primary = REGIONAL_CONFIG[completeIntelligence.geography.countryCode as RegionCode].name;
      } else if (platforms.youtube.country && REGIONAL_CONFIG[platforms.youtube.country.toUpperCase() as RegionCode]) {
        primary = REGIONAL_CONFIG[platforms.youtube.country.toUpperCase() as RegionCode].name;
      } else {
        primary = REGIONAL_CONFIG[selectedRegion]?.name || "United States";
      }
    }

    return { cleanPrimaryMarket: primary, secondaryMarketsList: secondaries };
  }, [completeIntelligence, selectedRegion, platforms.youtube.country]);

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8">
      {/* ========================================================= */}
      {/* STAGE 1: HERO SEARCH SECTION                              */}
      {/* ========================================================= */}
      {!hasSearched ? (
        /* INITIAL LANDING: CENTERED HERO IN VIEWPORT */
        <div
          ref={heroSectionRef}
          className="relative w-full rounded-2xl sm:rounded-3xl border border-zinc-200/90 bg-white/80 backdrop-blur-xs overflow-hidden p-6 sm:p-10 lg:p-14 shadow-sm min-h-[72vh] flex flex-col items-center justify-center text-center transition-all duration-500"
        >
          {/* Background Map Image with refined contrast */}
          <div
            className="absolute inset-0 pointer-events-none opacity-30 sm:opacity-35 bg-center bg-cover bg-no-repeat transition-opacity duration-500"
            style={{ backgroundImage: "url('/hero-image-calcuator.webp')" }}
          />
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-white/90 via-white/80 to-white/95" />

          <div className="relative z-10 max-w-2xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-900 text-white text-[11px] font-medium tracking-wide shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>2025–2026 Multi-Channel Rate Engine</span>
            </div>

            <div className="space-y-2.5">
              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-zinc-900 leading-tight">
                Influencer Rate Calculator
              </h1>
              <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed max-w-xl mx-auto">
                Enter a creator profile link or handle. Our autonomous radar discovers connected channels, audits engagement velocity, and calibrates defended deliverable rates.
              </p>
            </div>

            {/* Centered Search Card */}
            <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-zinc-200 shadow-md p-3 sm:p-4 space-y-3 text-left max-w-xl mx-auto">
              <form onSubmit={handleStart} className="space-y-2.5">
                <div className="relative flex items-center bg-zinc-50/90 rounded-xl border border-zinc-200 focus-within:border-zinc-900 focus-within:bg-white focus-within:ring-1 focus-within:ring-zinc-900 transition-all p-1">
                  <div className="pl-2.5 sm:pl-3 pr-1 text-zinc-400 shrink-0">
                    <Search className="w-4 h-4" />
                  </div>

                  <input
                    type="text"
                    value={inputQuery}
                    onChange={(e) => setInputQuery(e.target.value)}
                    placeholder="Paste URL or handle (@creator)"
                    className="w-full min-w-0 px-2 py-1.5 text-xs sm:text-sm text-zinc-900 placeholder:text-zinc-400 bg-transparent outline-none font-medium"
                  />

                  <button
                    type="submit"
                    disabled={isSearching || !inputQuery.trim()}
                    className="px-3.5 sm:px-4 py-2 bg-zinc-900 hover:bg-black disabled:opacity-40 text-white font-medium text-xs rounded-lg transition-all shadow-2xs flex items-center justify-center gap-1.5 shrink-0 cursor-pointer disabled:cursor-not-allowed"
                  >
                    {isSearching ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Scanning</span>
                      </>
                    ) : (
                      <>
                        <span>Start</span>
                        <ArrowRight className="w-3 h-3" />
                      </>
                    )}
                  </button>
                </div>

                {/* Conditional Platform Selector (Only for handle) */}
                {hasHandleInput && (
                  <div className="flex flex-wrap items-center justify-between p-2 rounded-xl bg-zinc-50/70 border border-zinc-150 text-xs gap-1.5 animate-fadeIn">
                    <span className="text-zinc-500 font-medium text-[11px] sm:text-xs">Handle Platform:</span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setSelectedPlatform("instagram")}
                        className={`px-2 sm:px-2.5 py-1 text-[10px] sm:text-[11px] font-semibold rounded-md transition-all cursor-pointer ${
                          selectedPlatform === "instagram"
                            ? "bg-zinc-900 text-white shadow-2xs"
                            : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100"
                        }`}
                      >
                        Instagram
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedPlatform("youtube")}
                        className={`px-2 sm:px-2.5 py-1 text-[10px] sm:text-[11px] font-semibold rounded-md transition-all cursor-pointer ${
                          selectedPlatform === "youtube"
                            ? "bg-zinc-900 text-white shadow-2xs"
                            : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100"
                        }`}
                      >
                        YouTube
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedPlatform("tiktok")}
                        className={`px-2 sm:px-2.5 py-1 text-[10px] sm:text-[11px] font-semibold rounded-md transition-all cursor-pointer ${
                          selectedPlatform === "tiktok"
                            ? "bg-zinc-900 text-white shadow-2xs"
                            : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100"
                        }`}
                      >
                        TikTok
                      </button>
                    </div>
                  </div>
                )}
              </form>

              {/* Quick Examples */}
              <div className="pt-1.5 border-t border-zinc-100 flex flex-wrap items-center gap-1.5 text-[11px] text-zinc-500">
                <span className="text-zinc-400 font-medium">Try:</span>
                <button
                  type="button"
                  onClick={() => handleQuickTest("https://www.instagram.com/irfanjunejo/", "instagram")}
                  className="px-2 py-0.5 rounded-md bg-zinc-50 hover:bg-zinc-100 text-zinc-700 transition-all border border-zinc-200/60 cursor-pointer"
                >
                  @irfanjunejo <span className="hidden sm:inline">(Multi-Channel Bio)</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickTest("https://www.youtube.com/@mkbhd", "youtube")}
                  className="px-2 py-0.5 rounded-md bg-zinc-50 hover:bg-zinc-100 text-zinc-700 transition-all border border-zinc-200/60 cursor-pointer"
                >
                  @mkbhd <span className="hidden sm:inline">(YouTube)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* STAGES 2 & 3: HERO AT TOP + PROGRESSIVE SCROLL FLOW */
        <>
          {/* Top Hero Section (Scrollable Back Up) */}
          <div
            ref={heroSectionRef}
            className="relative w-full rounded-2xl sm:rounded-3xl border border-zinc-200/90 bg-white/70 backdrop-blur-xs overflow-hidden p-4 sm:p-6 lg:p-8 shadow-sm transition-all duration-500"
          >
            <div
              className="absolute inset-0 pointer-events-none opacity-30 sm:opacity-35 bg-center bg-cover bg-no-repeat transition-opacity duration-500"
              style={{ backgroundImage: "url('/hero-image-calcuator.webp')" }}
            />
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-white/80 via-white/70 to-white/90 sm:bg-gradient-to-r sm:from-white/95 sm:via-white/80 sm:to-white/95" />

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 lg:gap-8 items-center">
              <div className="lg:col-span-6 space-y-2 text-left">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-zinc-900 text-white text-[10px] sm:text-[11px] font-medium tracking-wide shadow-2xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Live Radar Station Active</span>
                </div>

                <h1 className="text-xl sm:text-2xl lg:text-3xl font-semibold tracking-tight text-zinc-900 leading-tight">
                  Influencer Rate Calculator
                </h1>

                <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed max-w-lg">
                  Auditing live engagement velocity, cross-platform bio links, and regional economic purchasing power parity.
                </p>
              </div>

              <div className="lg:col-span-6">
                <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-zinc-200 shadow-md p-3 sm:p-4 space-y-2.5 text-left">
                  <form onSubmit={handleStart} className="space-y-2.5">
                    <div className="relative flex items-center bg-zinc-50/90 rounded-xl border border-zinc-200 focus-within:border-zinc-900 focus-within:bg-white focus-within:ring-1 focus-within:ring-zinc-900 transition-all p-1">
                      <div className="pl-2.5 sm:pl-3 pr-1 text-zinc-400 shrink-0">
                        <Search className="w-4 h-4" />
                      </div>

                      <input
                        type="text"
                        value={inputQuery}
                        onChange={(e) => setInputQuery(e.target.value)}
                        placeholder="Paste URL or handle (@creator)"
                        className="w-full min-w-0 px-2 py-1.5 text-xs sm:text-sm text-zinc-900 placeholder:text-zinc-400 bg-transparent outline-none font-medium"
                      />

                      <button
                        type="submit"
                        disabled={isSearching || !inputQuery.trim()}
                        className="px-3.5 sm:px-4 py-2 bg-zinc-900 hover:bg-black disabled:opacity-40 text-white font-medium text-xs rounded-lg transition-all shadow-2xs flex items-center justify-center gap-1.5 shrink-0 cursor-pointer disabled:cursor-not-allowed"
                      >
                        {isSearching ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Scanning</span>
                          </>
                        ) : (
                          <>
                            <span>Start</span>
                            <ArrowRight className="w-3 h-3" />
                          </>
                        )}
                      </button>
                    </div>

                    {hasHandleInput && (
                      <div className="flex flex-wrap items-center justify-between p-2 rounded-xl bg-zinc-50/70 border border-zinc-150 text-xs gap-1.5 animate-fadeIn">
                        <span className="text-zinc-500 font-medium text-[11px] sm:text-xs">Handle Platform:</span>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => setSelectedPlatform("instagram")}
                            className={`px-2 sm:px-2.5 py-1 text-[10px] sm:text-[11px] font-semibold rounded-md transition-all cursor-pointer ${
                              selectedPlatform === "instagram"
                                ? "bg-zinc-900 text-white shadow-2xs"
                                : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100"
                            }`}
                          >
                            Instagram
                          </button>
                          <button
                            type="button"
                            onClick={() => setSelectedPlatform("youtube")}
                            className={`px-2 sm:px-2.5 py-1 text-[10px] sm:text-[11px] font-semibold rounded-md transition-all cursor-pointer ${
                              selectedPlatform === "youtube"
                                ? "bg-zinc-900 text-white shadow-2xs"
                                : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100"
                            }`}
                          >
                            YouTube
                          </button>
                          <button
                            type="button"
                            onClick={() => setSelectedPlatform("tiktok")}
                            className={`px-2 sm:px-2.5 py-1 text-[10px] sm:text-[11px] font-semibold rounded-md transition-all cursor-pointer ${
                              selectedPlatform === "tiktok"
                                ? "bg-zinc-900 text-white shadow-2xs"
                                : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100"
                            }`}
                          >
                            TikTok
                          </button>
                        </div>
                      </div>
                    )}
                  </form>

                  <div className="pt-1.5 border-t border-zinc-100 flex flex-wrap items-center gap-1.5 text-[11px] text-zinc-500">
                    <span className="text-zinc-400 font-medium">Try:</span>
                    <button
                      type="button"
                      onClick={() => handleQuickTest("https://www.instagram.com/irfanjunejo/", "instagram")}
                      className="px-2 py-0.5 rounded-md bg-zinc-50 hover:bg-zinc-100 text-zinc-700 transition-all border border-zinc-200/60 cursor-pointer"
                    >
                      @irfanjunejo <span className="hidden sm:inline">(Multi-Channel Bio)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickTest("https://www.youtube.com/@mkbhd", "youtube")}
                      className="px-2 py-0.5 rounded-md bg-zinc-50 hover:bg-zinc-100 text-zinc-700 transition-all border border-zinc-200/60 cursor-pointer"
                    >
                      @mkbhd <span className="hidden sm:inline">(YouTube)</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* DOCKED STICKY BAR WHEN SCROLLED PAST HERO */}
          {isStickyBarVisible && (
            <div className="sticky top-16 sm:top-20 z-30 w-full transition-all duration-300 animate-slideDown">
              <div className="surface-card p-2 sm:p-2.5 rounded-2xl shadow-lg border border-zinc-200/90 bg-white/95 backdrop-blur-md flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-zinc-900 text-white flex items-center justify-center shrink-0">
                    {selectedPlatform === "youtube" ? (
                      <Video className="w-4 h-4 text-red-500" />
                    ) : selectedPlatform === "tiktok" ? (
                      <Music2 className="w-4 h-4 text-cyan-400" />
                    ) : (
                      <Camera className="w-4 h-4 text-pink-500" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-semibold text-zinc-900 truncate">
                        {creatorMeta?.displayName || inputQuery}
                      </span>
                      {creatorMeta?.primaryUsername && (
                        <span className="text-[10px] text-zinc-400 font-mono hidden sm:inline">
                          @{creatorMeta.primaryUsername}
                        </span>
                      )}
                      {isValuationCalibrated ? (
                        <span className="px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-medium border border-emerald-200/60 hidden md:inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Calibrated
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.5 rounded-md bg-cyan-50 text-cyan-700 text-[10px] font-mono hidden md:inline-flex items-center gap-1">
                          <Loader2 className="w-3 h-3 animate-spin text-cyan-500" /> Radar In Progress
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      heroSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
                    }}
                    className="px-2.5 py-1.5 text-xs font-medium text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 rounded-xl transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">New Search</span>
                  </button>

                  {isValuationCalibrated && (
                    <Link
                      href={buildContractHref()}
                      className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-medium rounded-xl transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Create Contract</span>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* SECTION 2: TELEMETRY & PROCESSING STATION                 */}
          {/* ========================================================= */}
          <div
            ref={telemetrySectionRef}
            className="space-y-4 scroll-mt-24 transition-all duration-500 animate-fadeIn"
          >
            {/* Reassuring Radar Process Banner with 2-4 Min Timing Callout */}
            <div className="p-4 sm:p-5 rounded-2xl bg-zinc-950 text-white shadow-xl border border-zinc-800 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800/80 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-zinc-900 border border-zinc-700 flex items-center justify-center shrink-0">
                    <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs sm:text-sm font-semibold tracking-tight text-white">
                        Autonomous Telemetry Radar
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-[10px] font-mono border border-emerald-500/30">
                        {isValuationCalibrated ? "Calibrated" : "Live Processing"}
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-400">
                      Target: <span className="text-white font-medium">{inputQuery}</span>
                    </p>
                  </div>
                </div>

                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-[11px] text-zinc-300">
                  <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>Complete analysis takes <strong>~2–4 minutes</strong></span>
                </div>
              </div>

              {/* Reassuring Process Description */}
              <div className="text-xs text-zinc-300 leading-relaxed flex items-start gap-2 bg-zinc-900/60 p-3 rounded-xl border border-zinc-800/60">
                <Clock className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <p>
                  Our autonomous radar performs live cross-platform entity resolution &amp; neural LLM indexing. Complete analysis takes ~2–4 minutes depending on channel velocity. Rates and intelligence dossier calibrate automatically below.
                </p>
              </div>

              {/* Dynamic Island Ticker */}
              <DynamicCommandIslandTicker
                platforms={platforms}
                igStepIdx={igStepIdx}
                ytStepIdx={ytStepIdx}
                ttStepIdx={ttStepIdx}
                verifiedChannelsCount={verifiedChannelsCount}
                onOpenMissingModal={() => setIsMissingModalOpen(true)}
                selectedRegion={selectedRegion}
                completeIntelligence={completeIntelligence}
                isSynthesizing={isSynthesizing}
                isValuationCalibrated={isValuationCalibrated}
              />
            </div>
          </div>

          {/* ========================================================= */}
          {/* SECTION 3+: FULL VALUATION DASHBOARD (MOUNTS ON CALIBRATION) */}
          {/* ========================================================= */}
          {isValuationCalibrated && (
            <div
              ref={valuationDashboardRef}
              className="space-y-8 scroll-mt-24 transition-all duration-500 animate-fadeIn"
            >
              {/* SECTION 3: CREATOR UNIFIED IDENTITY & COMBINED REACH */}
              {creatorMeta && (
                <div className="p-4 sm:p-5 rounded-2xl bg-white border border-zinc-200/90 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fadeIn">
                  <div className="flex items-center gap-3.5">
                    {creatorMeta.avatarUrl ? (
                      <img
                        src={creatorMeta.avatarUrl}
                        alt={creatorMeta.displayName}
                        className="w-12 h-12 rounded-full object-cover border border-zinc-200 shadow-2xs shrink-0"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-zinc-950 text-white font-semibold text-sm flex items-center justify-center shrink-0">
                        {creatorMeta.displayName.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-sm sm:text-base font-semibold text-zinc-950">{creatorMeta.displayName}</h2>
                        <span className="px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-700 text-[10px] font-medium flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Multi-Channel Profile
                        </span>
                      </div>
                      <div className="text-xs text-zinc-400 font-mono">@{creatorMeta.primaryUsername}</div>
                    </div>
                  </div>

                  {/* Combined Audience Badge */}
                  <div className="flex items-center gap-4 text-xs bg-zinc-50 p-2.5 rounded-xl border border-zinc-200/70 shrink-0">
                    <div>
                      <div className="text-[10px] text-zinc-400 font-medium uppercase">Combined Reach</div>
                      <div className="text-sm font-semibold font-mono text-zinc-950">
                        {formatShortNumber(totalAudienceCount)}
                      </div>
                    </div>
                    <div className="w-px h-6 bg-zinc-200" />
                    <div>
                      <div className="text-[10px] text-zinc-400 font-medium uppercase">Active Channels</div>
                      <div className="text-sm font-semibold font-mono text-zinc-950">
                        {verifiedChannelsCount} Platforms
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* COUNTRY & GDP PPP CALIBRATION CONTROLLER */}
              {verifiedChannelsCount > 0 && (
                <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200 text-xs animate-fadeIn">
                  <div className="flex items-center gap-3 flex-wrap">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wide flex items-center gap-1.5">
                        <Globe className="w-3.5 h-3.5 text-zinc-700" />
                        Country:
                      </span>
                      <select
                        value={selectedRegion}
                        onChange={(e) => {
                          const newReg = e.target.value as RegionCode;
                          hasUserManuallySelectedRegion.current = true;
                          setSelectedRegion(newReg);
                          recomputeAllPlatformRates(newReg, activeNicheId, activeSubNicheId);
                        }}
                        className="bg-white border border-zinc-300 rounded-lg px-2.5 py-1 font-semibold text-zinc-900 focus:outline-none focus:border-zinc-900 cursor-pointer text-xs shadow-2xs"
                      >
                        <option value="PK">Pakistan (PKR · 0.18x PPP)</option>
                        <option value="US">United States (USD · 1.00x)</option>
                        <option value="GB">United Kingdom (GBP · 0.85x PPP)</option>
                        <option value="IN">India (INR · 0.24x PPP)</option>
                        <option value="CA">Canada (CAD · 0.90x PPP)</option>
                        <option value="AU">Australia (AUD · 0.88x PPP)</option>
                        <option value="AE">United Arab Emirates (AED · 0.68x PPP)</option>
                        <option value="SA">Saudi Arabia (SAR · 0.62x PPP)</option>
                        <option value="DE">Germany (EUR · 0.85x PPP)</option>
                        <option value="FR">France (EUR · 0.84x PPP)</option>
                        <option value="SG">Singapore (SGD · 0.82x PPP)</option>
                        <option value="BR">Brazil (BRL · 0.36x PPP)</option>
                        <option value="BD">Bangladesh (BDT · 0.20x PPP)</option>
                        <option value="NG">Nigeria (NGN · 0.16x PPP)</option>
                        <option value="EG">Egypt (EGP · 0.17x PPP)</option>
                        <option value="TR">Turkey (TRY · 0.32x PPP)</option>
                        <option value="ZA">South Africa (ZAR · 0.38x PPP)</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wide">
                        Sector:
                      </span>
                      <select
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
                            {n.name} ({n.multiplier}x)
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wide">
                        Sub-Niche:
                      </span>
                      <select
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
                            {s.name} ({s.multiplier}x)
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="text-[11px] text-zinc-500 font-medium">
                    Applied: <span className="font-semibold text-zinc-950">{REGIONAL_CONFIG[selectedRegion]?.name || selectedRegion}</span> ({REGIONAL_CONFIG[selectedRegion]?.pppIndex}x GDP PPP · {REGIONAL_CONFIG[selectedRegion]?.currency})
                  </div>
                </div>
              )}

              {/* SECTION 3.5: COMPLETE 19-POINT CREATOR INTELLIGENCE DOSSIER */}
              {completeIntelligence ? (
                <div className="p-5 sm:p-6 rounded-2xl bg-white border border-zinc-200 shadow-sm space-y-4 animate-fadeIn">
                  {/* Header with Positioning & Refresh */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-100 pb-3.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-semibold uppercase tracking-wider bg-zinc-950 text-white px-3 py-1 rounded-lg">
                        {completeIntelligence.profile?.creatorType || "Creator"}
                      </span>
                      {(() => {
                        const activePrimary = PRIMARY_NICHES.find((p) => p.id === activeNicheId) || completeIntelligence.profile?.primaryNiche;
                        return activePrimary ? (
                          <span className="text-xs font-medium text-zinc-900 bg-zinc-100 px-3 py-1 rounded-lg border border-zinc-200">
                            {activePrimary.name} ({activePrimary.multiplier}x)
                          </span>
                        ) : null;
                      })()}
                      {(() => {
                        const activeSub = (activeSubNicheId ? SUB_NICHES.find((s) => s.id === activeSubNicheId) : undefined) || completeIntelligence.profile?.subNiche;
                        return activeSub ? (
                          <span className="text-xs font-medium text-indigo-950 bg-indigo-50/90 px-3 py-1 rounded-lg border border-indigo-200/90">
                            {activeSub.name} ({activeSub.multiplier}x)
                          </span>
                        ) : null;
                      })()}
                      {completeIntelligence.geography?.countryCode && (
                        <span className="text-xs font-medium text-zinc-800 bg-zinc-50 border border-zinc-200 px-2.5 py-1 rounded-lg flex items-center gap-1.5">
                          <Globe className="w-3 h-3 text-zinc-500" />
                          <span>{completeIntelligence.geography.countryName || completeIntelligence.geography.countryCode} {completeIntelligence.geography.city ? `(${completeIntelligence.geography.city})` : ""}</span>
                        </span>
                      )}
                      {completeIntelligence.brandSafety?.overallRisk && (
                        <span className="text-xs font-medium text-zinc-800 bg-zinc-50 border border-zinc-200 px-2.5 py-1 rounded-lg flex items-center gap-1.5">
                          <span className={`w-2 h-2 rounded-full ${completeIntelligence.brandSafety.overallRisk === "Low" ? "bg-emerald-500" : "bg-amber-500"}`} />
                          <span>Safety: {completeIntelligence.brandSafety.overallRisk} Risk</span>
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-zinc-500 font-medium flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> 24h Verified Cache
                      </span>
                      <button
                        type="button"
                        onClick={() => triggerOmnichannelSynthesis(true)}
                        disabled={isSynthesizing}
                        className="px-3 py-1 text-xs font-medium bg-zinc-100 hover:bg-zinc-200 text-zinc-900 rounded-lg transition-all border border-zinc-200 cursor-pointer inline-flex items-center gap-1.5"
                      >
                        <RefreshCw className={`w-3 h-3 ${isSynthesizing ? "animate-spin" : ""}`} />
                        <span>{isSynthesizing ? "Analyzing..." : "Refresh AI"}</span>
                      </button>
                    </div>
                  </div>

                  {/* Brand Summary */}
                  {(completeIntelligence.summary?.brandSummary || completeIntelligence.summary?.oneLine) && (
                    <p className="text-xs sm:text-sm text-zinc-800 leading-relaxed font-normal bg-zinc-50/50 p-3.5 rounded-xl border border-zinc-100">
                      &ldquo;{completeIntelligence.summary.brandSummary || completeIntelligence.summary.oneLine}&rdquo;
                    </p>
                  )}

                  {/* Micro-Niches Tags */}
                  {(completeIntelligence.profile?.microNiches?.length ?? 0) > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                      <span className="text-[11px] text-zinc-400 font-medium uppercase tracking-wider">Micro-Niches:</span>
                      {completeIntelligence.profile.microNiches.map((mn, i) => (
                        <span key={i} className="text-xs font-medium bg-zinc-50 text-zinc-800 px-2.5 py-1 rounded-lg border border-zinc-200">
                          {mn}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* 2x2 High-End Intelligence Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-1">
                    {/* Card 1: Inferred Audience */}
                    <div className="p-4 rounded-xl bg-zinc-50/70 border border-zinc-200 space-y-2.5">
                      <div className="text-xs font-semibold uppercase tracking-wider text-zinc-900 flex items-center gap-1.5 pb-1 border-b border-zinc-200/60">
                        <Users className="w-4 h-4 text-zinc-700" />
                        <span>Inferred Audience</span>
                      </div>
                      <div className="space-y-1.5 text-xs">
                        <div className="flex justify-between items-center py-0.5 border-b border-zinc-100">
                          <span className="text-zinc-500">Demographic Profile</span>
                          <span className="font-semibold text-zinc-950">{completeIntelligence.audience?.genderSkew || "Balanced"}, {completeIntelligence.audience?.likelyAgeRange || "18-34"}</span>
                        </div>
                        <div className="flex justify-between items-center py-0.5 border-b border-zinc-100">
                          <span className="text-zinc-500">Commercial Buyer Intent</span>
                          <span className="font-medium text-zinc-900 bg-zinc-200/70 px-2 py-0.5 rounded-md text-[11px]">{completeIntelligence.audience?.purchaseIntent || "Moderate"} Intent</span>
                        </div>
                        <div className={`flex justify-between items-center py-0.5 ${secondaryMarketsList.length > 0 ? "border-b border-zinc-100" : ""}`}>
                          <span className="text-zinc-500">Primary Regional Market</span>
                          <span className="font-semibold text-zinc-950">{cleanPrimaryMarket}</span>
                        </div>
                        {secondaryMarketsList.length > 0 && (
                          <div className="flex justify-between items-start py-0.5 gap-2">
                            <span className="text-zinc-500 shrink-0">Secondary Regional Markets</span>
                            <span className="font-medium text-zinc-800 text-right">{secondaryMarketsList.join(", ")}</span>
                          </div>
                        )}
                      </div>
                      {(completeIntelligence.audience?.interests?.length ?? 0) > 0 && (
                        <div className="pt-2 border-t border-zinc-200/60 space-y-1">
                          <div className="text-[10px] text-zinc-400 font-medium uppercase tracking-wider">Audience Interests</div>
                          <div className="flex flex-wrap gap-1">
                            {completeIntelligence.audience.interests.map((interest, idx) => (
                              <span key={idx} className="text-[11px] bg-white text-zinc-800 px-2 py-0.5 rounded-md border border-zinc-200">
                                {interest}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Card 2: Content DNA */}
                    <div className="p-4 rounded-xl bg-zinc-50/70 border border-zinc-200 space-y-2.5">
                      <div className="text-xs font-semibold uppercase tracking-wider text-zinc-900 flex items-center gap-1.5 pb-1 border-b border-zinc-200/60">
                        <Video className="w-4 h-4 text-zinc-700" />
                        <span>Content DNA &amp; Format</span>
                      </div>
                      <div className="space-y-1.5 text-xs">
                        <div className="flex justify-between items-center py-0.5 border-b border-zinc-100">
                          <span className="text-zinc-500">Dominant Format</span>
                          <span className="font-semibold text-zinc-950">{completeIntelligence.content?.dominantFormat || "Video"}</span>
                        </div>
                        <div className="flex justify-between items-center py-0.5 border-b border-zinc-100">
                          <span className="text-zinc-500">Production Standard</span>
                          <span className="font-semibold text-zinc-950">{completeIntelligence.content?.productionLevel || "High"}</span>
                        </div>
                        <div className="flex justify-between items-center py-0.5">
                          <span className="text-zinc-500">Publishing Consistency</span>
                          <span className="font-semibold text-zinc-950">{completeIntelligence.content?.contentConsistency || "High"}</span>
                        </div>
                      </div>
                      {(completeIntelligence.contentThemes?.length ?? 0) > 0 && (
                        <div className="pt-2 border-t border-zinc-200/60 space-y-1">
                          <div className="text-[10px] text-zinc-400 font-medium uppercase tracking-wider">Top Content Themes</div>
                          <div className="flex flex-wrap gap-1">
                            {completeIntelligence.contentThemes.map((t, idx) => (
                              <span key={idx} className="text-[11px] bg-white text-zinc-800 px-2 py-0.5 rounded-md border border-zinc-200">
                                {t.theme} {t.strength ? `(${Math.round(t.strength * 100)}%)` : ""}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Card 3: Brand Fit & Commercial Profile */}
                    <div className="p-4 rounded-xl bg-zinc-50/70 border border-zinc-200 space-y-2.5">
                      <div className="text-xs font-semibold uppercase tracking-wider text-zinc-900 flex items-center gap-1.5 pb-1 border-b border-zinc-200/60">
                        <ShieldCheck className="w-4 h-4 text-zinc-700" />
                        <span>Brand Fit &amp; Sponsorships</span>
                      </div>
                      <div className="space-y-1.5 text-xs">
                        <div className="flex justify-between items-center py-0.5 border-b border-zinc-100">
                          <span className="text-zinc-500">Commercial Intent</span>
                          <span className="font-semibold text-zinc-950">{completeIntelligence.commercialIntelligence?.commercialIntent || "High"}</span>
                        </div>
                        <div className="flex justify-between items-center py-0.5">
                          <span className="text-zinc-500">Brand Suitability</span>
                          <span className="font-medium text-zinc-900 bg-zinc-200/70 px-2 py-0.5 rounded-md text-[11px]">{completeIntelligence.brandFit?.brandSuitability || "High"}</span>
                        </div>
                      </div>
                      {(completeIntelligence.brandFit?.bestFitCategories?.length ?? 0) > 0 && (
                        <div className="pt-2 border-t border-zinc-200/60 space-y-1">
                          <div className="text-[10px] text-zinc-400 font-medium uppercase tracking-wider">Best Fit Categories</div>
                          <div className="flex flex-wrap gap-1">
                            {completeIntelligence.brandFit.bestFitCategories.map((cat, idx) => (
                              <span key={idx} className="text-[11px] bg-white text-zinc-800 px-2 py-0.5 rounded-md border border-zinc-200">
                                {cat}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Card 4: Key Strategic Strengths */}
                    <div className="p-4 rounded-xl bg-zinc-50/70 border border-zinc-200 space-y-2.5">
                      <div className="text-xs font-semibold uppercase tracking-wider text-zinc-900 flex items-center gap-1.5 pb-1 border-b border-zinc-200/60">
                        <Zap className="w-4 h-4 text-zinc-700" />
                        <span>Key Strategic Strengths</span>
                      </div>
                      <div className="space-y-2 text-xs">
                        {(completeIntelligence.strengths?.length ?? 0) > 0 ? (
                          completeIntelligence.strengths.map((s, i) => (
                            <div key={i} className="space-y-0.5">
                              <div className="font-semibold text-zinc-950">• {s.area}</div>
                              <div className="text-zinc-600 text-[11px] leading-relaxed pl-3">{s.description}</div>
                            </div>
                          ))
                        ) : (
                          <div className="text-zinc-500 text-xs">High organic retention and consistent performance.</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ) : isSynthesizing ? (
                <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 animate-pulse flex items-center justify-center gap-2 text-xs font-semibold text-zinc-600">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-zinc-900" />
                  <span>SignCollab LLM Engine: Synthesizing 19-point Creator Intelligence Dossier...</span>
                </div>
              ) : null}

              {/* SECTION 4: THE 3-PLATFORM EMPIRICAL RATE SHEETS */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch">
                {/* 1. Instagram Card */}
                <PlatformRateCardItem
                  platform="instagram"
                  platformName="Instagram"
                  icon={<Camera className="w-4 h-4 text-pink-500" />}
                  data={platforms.instagram}
                  metricLabel="Followers"
                  onManualSearch={(handle) => scrapePlatform(handle, "instagram")}
                  isValuationCalibrated={isValuationCalibrated}
                />

                {/* 2. YouTube Card */}
                <PlatformRateCardItem
                  platform="youtube"
                  platformName="YouTube"
                  icon={<Video className="w-4 h-4 text-red-500" />}
                  data={platforms.youtube}
                  metricLabel="Subscribers"
                  onManualSearch={(handle) => scrapePlatform(handle, "youtube")}
                  isValuationCalibrated={isValuationCalibrated}
                />

                {/* 3. TikTok Card */}
                <PlatformRateCardItem
                  platform="tiktok"
                  platformName="TikTok"
                  icon={<Music2 className="w-3.5 h-3.5 text-cyan-500" />}
                  data={platforms.tiktok}
                  metricLabel="Followers"
                  onManualSearch={(handle) => scrapePlatform(handle, "tiktok")}
                  isValuationCalibrated={isValuationCalibrated}
                />
              </div>

              {/* SECTION 5: OMNICHANNEL BUNDLE OPTIMIZER */}
              {bundleOffers && (
                <div className="p-4 sm:p-5 rounded-2xl bg-zinc-950 text-white shadow-xl space-y-4 animate-fadeIn">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <h3 className="text-xs sm:text-sm font-semibold tracking-tight text-white">
                        Automated Omnichannel Package Discounts
                      </h3>
                    </div>
                    <div className="text-[11px] font-mono text-zinc-400">
                      Target: {creatorMeta?.displayName || "Creator"}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {/* 2-Platform Starter Pack */}
                    <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                            <Flame className="w-3.5 h-3.5 text-amber-400" />
                            <span>{bundleOffers.starter.title}</span>
                          </div>
                          <div className="text-[11px] text-zinc-400 font-mono">{bundleOffers.starter.subtitle}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-semibold font-mono text-white">
                            {bundleOffers.starter.typicalFormatted}
                          </div>
                          <div className="text-[10px] text-emerald-400 font-mono">
                            Save {bundleOffers.starter.savings}
                          </div>
                        </div>
                      </div>
                      <div className="text-[10px] text-zinc-500 font-mono">
                        Range: {bundleOffers.starter.lowFormatted} – {bundleOffers.starter.highFormatted}
                      </div>
                    </div>

                    {/* 360 Authority Pack */}
                    <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                            <Crown className="w-3.5 h-3.5 text-yellow-400" />
                            <span>{bundleOffers.authority.title}</span>
                          </div>
                          <div className="text-[11px] text-zinc-400 font-mono">{bundleOffers.authority.subtitle}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-semibold font-mono text-white">
                            {bundleOffers.authority.typicalFormatted}
                          </div>
                          <div className="text-[10px] text-emerald-400 font-mono">
                            Save {bundleOffers.authority.savings}
                          </div>
                        </div>
                      </div>
                      <div className="text-[10px] text-zinc-500 font-mono">
                        Range: {bundleOffers.authority.lowFormatted} – {bundleOffers.authority.highFormatted}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION 5.5: INSTANT SPONSORSHIP CONTRACT WORKFLOW CTA */}
              <div className="p-4 sm:p-5 rounded-2xl bg-white border border-zinc-200/90 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 animate-fadeIn">
                <div className="space-y-1 text-left">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <h3 className="text-xs sm:text-sm font-semibold text-zinc-950">
                      Lock in this valuation with a legal sponsorship agreement
                    </h3>
                  </div>
                  <p className="text-[11px] text-zinc-500 max-w-xl">
                    Generate an Instant Creator Sponsorship Agreement pre-filled with verified deliverables, usage rights, and calibrated pricing.
                  </p>
                </div>

                <Link
                  href={buildContractHref()}
                  className="px-4 py-2.5 bg-zinc-900 hover:bg-black text-white text-xs font-semibold rounded-xl transition-all shadow-md shrink-0 flex items-center gap-1.5 cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Generate Instant Contract</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* SECTION 6: RECENT MEDIA & EMPIRICAL POST AUDITS */}
              <RecentMediaAuditFeed platforms={platforms} />
            </div>
          )}
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
                    We verified <strong className="text-zinc-900 font-semibold">{verifiedChannelsCount} channel(s)</strong> for @{creatorMeta?.displayName || "Creator"}, but couldn&apos;t automatically discover all 3 channels in the bio. Add unfound handles to calculate multi-platform bundle rates &amp; full intelligence.
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
                              <div className="text-[10px] font-mono text-zinc-500 truncate">@{platforms.youtube.username?.replace(/^@/, "")}</div>
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
                              <div className="text-[10px] font-mono text-zinc-500 truncate">@{platforms.instagram.username?.replace(/^@/, "")}</div>
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
                              <div className="text-[10px] font-mono text-zinc-500 truncate">@{platforms.tiktok.username?.replace(/^@/, "")}</div>
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

// ----------------------------------------------------------------------
// Sub-Component: Platform Rate Card Item
// ----------------------------------------------------------------------
function PlatformRateCardItem({
  platform,
  platformName,
  icon,
  data,
  metricLabel,
  onManualSearch,
  isValuationCalibrated,
}: {
  platform: Platform;
  platformName: string;
  icon: React.ReactNode;
  data: DiscoveredPlatformData;
  metricLabel: string;
  onManualSearch?: (handle: string) => void;
  isValuationCalibrated?: boolean;
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
          {platform === "youtube" ? (
            <div className="grid grid-cols-3 gap-2 text-xs bg-gray-50 p-2.5 rounded-xl border border-gray-100 text-center">
              <div className="text-left">
                <div className="text-[10px] text-gray-400 uppercase font-medium">Subscribers</div>
                <div className="font-bold font-mono text-gray-950 truncate">
                  {formatShortNumber(data.followerCount)}
                </div>
              </div>
              <div>
                <div className="text-[10px] text-gray-400 uppercase font-medium">LF ER</div>
                <div className="font-bold font-mono text-gray-950">
                  {data.longEngagementRate !== undefined
                    ? `${data.longEngagementRate}%`
                    : data.engagementRate !== undefined
                    ? `${data.engagementRate}%`
                    : "—"}
                </div>
              </div>
              <div className="text-right">
                <div className="text-[10px] text-gray-400 uppercase font-medium">SF ER</div>
                <div className="font-bold font-mono text-gray-950">
                  {data.shortEngagementRate !== undefined ? `${data.shortEngagementRate}%` : "—"}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between text-xs bg-gray-50 p-2.5 rounded-xl border border-gray-100">
              <div>
                <div className="text-[10px] text-gray-400 uppercase font-medium">{metricLabel}</div>
                <div className="font-bold font-mono text-gray-950">
                  {formatShortNumber(data.followerCount)}
                </div>
              </div>
              <div className="text-right">
                <div className="text-[10px] text-gray-400 uppercase font-medium">Observed ER</div>
                <div className="font-bold font-mono text-gray-950">
                  {data.engagementRate !== undefined ? `${data.engagementRate}%` : "—"}
                </div>
              </div>
            </div>
          )}

          {/* Itemized Deliverables Rate Card */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
              <span>Itemized Defended Pricing</span>
              {!isValuationCalibrated && (
                <span className="inline-flex items-center gap-1 text-[10px] text-cyan-600 font-mono font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
                  Calibrating AI Dossier
                </span>
              )}
            </div>

            {!isValuationCalibrated ? (
              <div className="space-y-1.5 animate-pulse pt-1">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-2 rounded-lg border border-gray-100 bg-gray-50/70"
                  >
                    <div className="space-y-1 w-2/3">
                      <div className="h-3 bg-gray-200 rounded w-28" />
                      <div className="h-2 bg-gray-150 rounded w-16" />
                    </div>
                    <div className="h-4 bg-gray-200 rounded w-14" />
                  </div>
                ))}
              </div>
            ) : (
              data.rateCardItems?.map((item) => {
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
                    <div className="text-right shrink-0">
                      <div className="font-bold font-mono text-gray-950">
                        {item.formattedAmount}
                      </div>
                      {item.usdEquivalentFormatted && (
                        <div className="text-[10px] text-gray-400 font-mono">
                          {item.usdEquivalentFormatted}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ----------------------------------------------------------------------
// Sub-Component: Recent Media & Empirical Post Audits Feed
// ----------------------------------------------------------------------
function RecentMediaAuditFeed({
  platforms,
}: {
  platforms: Record<Platform, DiscoveredPlatformData>;
}) {
  const availableTabs = useMemo(() => {
    const list: Array<{ platform: Platform; label: string; count: number }> = [];
    if (platforms.instagram.status === "ready" && (platforms.instagram.posts?.length || 0) > 0) {
      list.push({ platform: "instagram", label: "Instagram", count: platforms.instagram.posts!.length });
    }
    if (platforms.youtube.status === "ready" && (platforms.youtube.videos?.length || 0) > 0) {
      list.push({ platform: "youtube", label: "YouTube", count: platforms.youtube.videos!.length });
    }
    if (platforms.tiktok.status === "ready" && (platforms.tiktok.videos?.length || 0) > 0) {
      list.push({ platform: "tiktok", label: "TikTok", count: platforms.tiktok.videos!.length });
    }
    return list;
  }, [platforms]);

  const [activeTab, setActiveTab] = useState<Platform>("instagram");

  // Keep active tab synced with available platforms
  useEffect(() => {
    if (availableTabs.length > 0 && !availableTabs.some((t) => t.platform === activeTab)) {
      setActiveTab(availableTabs[0].platform);
    }
  }, [availableTabs, activeTab]);

  if (availableTabs.length === 0) return null;

  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-white border border-gray-200/90 shadow-sm space-y-4 animate-fadeIn">
      {/* Header & Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-gray-950" />
            <h3 className="text-xs sm:text-sm font-bold tracking-tight text-gray-950">
              Recent Media &amp; Empirical Content Audits
            </h3>
          </div>
          <p className="text-[11px] text-gray-500 mt-0.5">
            Audit feed of recent uploads analyzed for median interaction baselines, unpinned engagement, and pricing defense.
          </p>
        </div>

        {availableTabs.length > 1 && (
          <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl border border-gray-200 shrink-0">
            {availableTabs.map((tab) => (
              <button
                key={tab.platform}
                type="button"
                onClick={() => setActiveTab(tab.platform)}
                className={`px-3 py-1 text-[11px] font-semibold rounded-lg transition-all cursor-pointer ${
                  activeTab === tab.platform
                    ? "bg-white text-gray-950 shadow-2xs"
                    : "text-gray-600 hover:text-gray-950"
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 1. Instagram Posts Grid */}
      {activeTab === "instagram" && platforms.instagram.posts && (
        <InstagramPostsGrid
          posts={platforms.instagram.posts}
          username={platforms.instagram.username || ""}
        />
      )}

      {/* 2. YouTube Videos Grid */}
      {activeTab === "youtube" && platforms.youtube.videos && (
        <YouTubeVideosGrid
          videos={platforms.youtube.videos as unknown as YouTubeVideoItem[]}
        />
      )}

      {/* 3. TikTok Videos Grid */}
      {activeTab === "tiktok" && platforms.tiktok.videos && (
        <TikTokVideosGrid
          videos={platforms.tiktok.videos as unknown as TikTokVideoItem[]}
          username={platforms.tiktok.username || ""}
        />
      )}
    </div>
  );
}

// ----------------------------------------------------------------------
// Sub-Component: Instagram 12 Recent Posts + 4 Enriched Unpinned Grid
// ----------------------------------------------------------------------
function InstagramPostsGrid({
  posts,
  username,
}: {
  posts: InstagramPostItem[];
  username: string;
}) {
  // Show up to 12 posts, with the 4 trimmed-mean ER sample posts appearing first
  const sortedPosts = useMemo(() => {
    const validPosts = posts.slice(0, 12);
    const erSamples = validPosts.filter((p) => p.isEnrichedSample);
    const otherPosts = validPosts.filter((p) => !p.isEnrichedSample);
    return [...erSamples, ...otherPosts];
  }, [posts]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
      {sortedPosts.map((post, idx) => {
        return (
          <div
            key={post.id || post.url || idx}
            className="group rounded-xl border border-gray-200/90 bg-gray-50/40 hover:bg-white hover:border-gray-300 hover:shadow-2xs transition-all flex flex-col justify-between p-3 space-y-2.5"
          >
            {/* Top Media & Badges */}
            <div className="relative aspect-[4/3] w-full rounded-lg overflow-hidden bg-gray-100 border border-gray-200/60">
              {post.imageUrl ? (
                <img
                  src={post.imageUrl}
                  alt={post.caption || "Instagram post"}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs font-mono">
                  No Thumbnail
                </div>
              )}

              {/* Floating Badges Overlay */}
              <div className="absolute top-2 left-2 right-2 flex items-center justify-between pointer-events-none">
                <div className="flex flex-wrap gap-1">
                  {post.isPinned ? (
                    <span className="px-2 py-0.5 rounded-md bg-amber-600/90 text-white font-bold text-[10px] shadow-2xs backdrop-blur-xs flex items-center gap-1">
                      <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                      </svg>
                      Pinned Post
                    </span>
                  ) : post.isEnrichedSample ? (
                    <span className="px-2 py-0.5 rounded-md bg-emerald-600/90 text-white font-bold text-[10px] shadow-2xs backdrop-blur-xs flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                      ER Sample
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-md bg-gray-900/80 text-white font-medium text-[10px] shadow-2xs backdrop-blur-xs">
                      Recent #{idx + 1}
                    </span>
                  )}
                </div>

                <span className="px-1.5 py-0.5 rounded-md bg-black/60 text-white text-[10px] font-mono uppercase backdrop-blur-xs">
                  {post.contentType || "Post"}
                </span>
              </div>
            </div>

            {/* Metrics Row (Likes & Comments) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between bg-white px-2.5 py-1.5 rounded-lg border border-gray-200/80 text-xs font-mono">
                <div className="flex items-center gap-1.5 text-gray-700">
                  <svg className="w-3.5 h-3.5 text-rose-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                  </svg>
                  <span className="font-bold">{formatShortNumber(post.likes)}</span>
                </div>
                <div className="flex items-center gap-1.5 text-gray-700">
                  <svg className="w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <span className="font-bold">{formatShortNumber(post.commentsCount)}</span>
                </div>
              </div>

              {/* Caption */}
              {post.caption && (
                <p className="text-[11px] text-gray-600 line-clamp-2 leading-relaxed">
                  {post.caption}
                </p>
              )}
            </div>

            {/* Link Footer */}
            <div className="pt-1.5 border-t border-gray-100 flex items-center justify-between text-[10px] font-mono text-gray-400">
              <span>{post.datetime ? new Date(post.datetime).toLocaleDateString() : `@${username}`}</span>
              <a
                href={post.url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-gray-900 hover:text-black flex items-center gap-0.5 hover:underline cursor-pointer"
              >
                <span>View Post</span>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ----------------------------------------------------------------------
// Sub-Component: YouTube Videos Grid
// ----------------------------------------------------------------------
function YouTubeVideosGrid({ videos }: { videos: YouTubeVideoItem[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
      {videos.slice(0, 9).map((vid, idx) => {
        return (
          <div
            key={vid.id || vid.url || idx}
            className="group rounded-xl border border-gray-200/90 bg-gray-50/40 hover:bg-white hover:border-gray-300 hover:shadow-2xs transition-all flex flex-col justify-between p-3 space-y-2.5"
          >
            <div className="relative aspect-video w-full rounded-lg overflow-hidden bg-gray-100 border border-gray-200/60">
              {vid.thumbnailUrl ? (
                <img
                  src={vid.thumbnailUrl}
                  alt={vid.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs font-mono">
                  No Thumbnail
                </div>
              )}

              <div className="absolute top-2 left-2 flex gap-1">
                {vid.isShort ? (
                  <span className="px-2 py-0.5 rounded-md bg-red-600/90 text-white font-bold text-[10px] shadow-2xs backdrop-blur-xs">
                    Short
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-md bg-gray-900/80 text-white font-medium text-[10px] shadow-2xs backdrop-blur-xs">
                    Long Video
                  </span>
                )}
              </div>

              {vid.durationFormatted && (
                <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded-md bg-black/80 text-white text-[10px] font-mono backdrop-blur-xs">
                  {vid.durationFormatted}
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <h4 className="text-xs font-bold text-gray-950 line-clamp-2 leading-snug">
                {vid.title}
              </h4>
              <div className="flex items-center justify-between bg-white px-2.5 py-1.5 rounded-lg border border-gray-200/80 text-xs font-mono text-gray-700">
                <div className="flex items-center gap-1">
                  <svg className="w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <span className="font-bold">{formatShortNumber(vid.viewCount)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <svg className="w-3.5 h-3.5 text-rose-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                  </svg>
                  <span className="font-bold">{formatShortNumber(vid.likeCount)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <svg className="w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <span className="font-bold">{formatShortNumber(vid.commentCount)}</span>
                </div>
              </div>
            </div>

            <div className="pt-1.5 border-t border-gray-100 flex items-center justify-between text-[10px] font-mono text-gray-400">
              <span>{vid.publishedAt ? new Date(vid.publishedAt).toLocaleDateString() : ""}</span>
              <a
                href={vid.url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-gray-900 hover:text-black flex items-center gap-0.5 hover:underline cursor-pointer"
              >
                <span>Watch</span>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ----------------------------------------------------------------------
// Sub-Component: TikTok Videos Grid
// ----------------------------------------------------------------------
function TikTokVideosGrid({
  videos,
  username,
}: {
  videos: TikTokVideoItem[];
  username: string;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
      {videos.slice(0, 9).map((vid, idx) => {
        return (
          <div
            key={vid.id || vid.url || idx}
            className="group rounded-xl border border-gray-200/90 bg-gray-50/40 hover:bg-white hover:border-gray-300 hover:shadow-2xs transition-all flex flex-col justify-between p-3 space-y-2.5"
          >
            <div className="relative aspect-[9/12] w-full rounded-lg overflow-hidden bg-gray-100 border border-gray-200/60">
              {vid.coverImage ? (
                <img
                  src={vid.coverImage}
                  alt={vid.description || "TikTok Video"}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs font-mono">
                  No Cover
                </div>
              )}

              <div className="absolute top-2 left-2 flex gap-1">
                {vid.isPinned ? (
                  <span className="px-2 py-0.5 rounded-md bg-gray-950 text-white font-bold text-[10px] shadow-2xs backdrop-blur-xs flex items-center gap-1">
                    <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                    </svg>
                    Pinned
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-md bg-gray-900/80 text-white font-medium text-[10px] shadow-2xs backdrop-blur-xs">
                    Video #{idx + 1}
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              {vid.description && (
                <p className="text-xs font-medium text-gray-950 line-clamp-2 leading-snug">
                  {vid.description}
                </p>
              )}
              <div className="flex items-center justify-between bg-white px-2.5 py-1.5 rounded-lg border border-gray-200/80 text-xs font-mono text-gray-700">
                <div className="flex items-center gap-1">
                  <svg className="w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <span className="font-bold">{formatShortNumber(vid.playCount)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <svg className="w-3.5 h-3.5 text-rose-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                  </svg>
                  <span className="font-bold">{formatShortNumber(vid.diggCount)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <svg className="w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <span className="font-bold">{formatShortNumber(vid.commentCount)}</span>
                </div>
              </div>
            </div>

            <div className="pt-1.5 border-t border-gray-100 flex items-center justify-between text-[10px] font-mono text-gray-400">
              <span>@{username}</span>
              <a
                href={vid.url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-gray-900 hover:text-black flex items-center gap-0.5 hover:underline cursor-pointer"
              >
                <span>View Video</span>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ----------------------------------------------------------------------
// Sub-Component: Dynamic Command Island (1-Line Telemetry Ticker)
// ----------------------------------------------------------------------
function DynamicCommandIslandTicker({
  platforms,
  igStepIdx,
  ytStepIdx,
  ttStepIdx,
  verifiedChannelsCount,
  onOpenMissingModal,
  selectedRegion,
  completeIntelligence,
  isSynthesizing,
  isValuationCalibrated,
}: {
  platforms: {
    instagram: DiscoveredPlatformData;
    youtube: DiscoveredPlatformData;
    tiktok: DiscoveredPlatformData;
  };
  igStepIdx: number;
  ytStepIdx: number;
  ttStepIdx: number;
  verifiedChannelsCount: number;
  onOpenMissingModal: () => void;
  selectedRegion: RegionCode;
  completeIntelligence: CompleteCreatorIntelligence | null;
  isSynthesizing?: boolean;
  isValuationCalibrated?: boolean;
}) {
  const syncPercentage = Math.round((verifiedChannelsCount / 3) * 100);

  // Check if any platform is currently scraping or synthesizing
  const isAnyLoading =
    platforms.youtube.status === "loading" ||
    platforms.instagram.status === "loading" ||
    platforms.tiktok.status === "loading" ||
    Boolean(isSynthesizing) ||
    (!isValuationCalibrated && verifiedChannelsCount > 0);

  // Determine current active loading text
  let activeProcessText = "";
  if (platforms.youtube.status === "loading") {
    const step = YOUTUBE_TICKER_STEPS[Math.min(ytStepIdx, YOUTUBE_TICKER_STEPS.length - 1)] || YOUTUBE_TICKER_STEPS[0];
    activeProcessText = `YouTube: ${step.text} (${step.percent}%)`;
  } else if (platforms.instagram.status === "loading") {
    const step = INSTAGRAM_TICKER_STEPS[Math.min(igStepIdx, INSTAGRAM_TICKER_STEPS.length - 1)] || INSTAGRAM_TICKER_STEPS[0];
    activeProcessText = `Instagram: ${step.text} (${step.percent}%)`;
  } else if (platforms.tiktok.status === "loading") {
    const step = TIKTOK_TICKER_STEPS[Math.min(ttStepIdx, TIKTOK_TICKER_STEPS.length - 1)] || TIKTOK_TICKER_STEPS[0];
    activeProcessText = `TikTok: ${step.text} (${step.percent}%)`;
  } else if (isSynthesizing || (!isValuationCalibrated && verifiedChannelsCount > 0)) {
    activeProcessText = "SignCollab LLM Engine: Synthesizing 19-point Creator Intelligence & Calibrating Rates...";
  } else {
    // All in-flight requests finished: show glanceable 1-line verified telemetry
    const parts: string[] = [];
    if (platforms.youtube.status === "ready") {
      parts.push(`YouTube (@${platforms.youtube.username?.replace(/^@/, "")} · ${formatShortNumber(platforms.youtube.followerCount)} Subs)`);
    }
    if (platforms.instagram.status === "ready") {
      parts.push(`Instagram (@${platforms.instagram.username?.replace(/^@/, "")} · ${formatShortNumber(platforms.instagram.followerCount)} Reach)`);
    }
    if (platforms.tiktok.status === "ready") {
      parts.push(`TikTok (@${platforms.tiktok.username?.replace(/^@/, "")} · ${formatShortNumber(platforms.tiktok.followerCount)})`);
    }

    if (parts.length > 0) {
      activeProcessText = `${parts.join(" · ")} Verified`;
      if (verifiedChannelsCount < 3) {
        activeProcessText += ` · ${3 - verifiedChannelsCount} in Standby`;
      }
    } else {
      activeProcessText = "Awaiting channel discovery or direct input";
    }
  }

  // Icons array for left dynamic island stack
  const platformIcons = [
    {
      key: "youtube",
      name: "YouTube",
      status: platforms.youtube.status,
      icon: (
        <svg className="w-3.5 h-3.5 text-red-500" viewBox="0 0 24 24" fill="currentColor">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
        </svg>
      ),
    },
    {
      key: "instagram",
      name: "Instagram",
      status: platforms.instagram.status,
      icon: (
        <svg className="w-3.5 h-3.5 text-pink-500" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
        </svg>
      ),
    },
    {
      key: "tiktok",
      name: "TikTok",
      status: platforms.tiktok.status,
      icon: (
        <svg className="w-3 h-3 text-cyan-400" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="w-full bg-gray-950 text-white rounded-2xl border border-gray-800/90 shadow-md px-3 sm:px-4 py-2 sm:py-2.5 flex items-center justify-between gap-2.5 sm:gap-4 overflow-hidden animate-fadeIn">
      {/* Left: 3 Brand Icons Stack with Status Rings */}
      <div className="flex items-center gap-1.5 shrink-0">
        {platformIcons.map((p) => {
          const isReady = p.status === "ready";
          const isLoading = p.status === "loading";

          return (
            <div
              key={p.key}
              title={`${p.name}: ${isReady ? "Verified" : isLoading ? "Scanning" : "Standby"}`}
              onClick={!isReady ? onOpenMissingModal : undefined}
              className={`relative p-1.5 rounded-lg flex items-center justify-center transition-all ${
                !isReady ? "cursor-pointer hover:bg-gray-800" : ""
              } ${
                isReady
                  ? "bg-gray-900 border border-emerald-500/40 shadow-[0_0_8px_rgba(16,185,129,0.2)]"
                  : isLoading
                  ? "bg-gray-900 border border-cyan-500/40 animate-pulse"
                  : "bg-gray-900/60 border border-gray-800 opacity-60 hover:opacity-100"
              }`}
            >
              {p.icon}
              {/* Mini Status Dot */}
              <span
                className={`absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full ${
                  isReady
                    ? "bg-emerald-400 shadow-[0_0_4px_#34d399]"
                    : isLoading
                    ? "bg-cyan-400 animate-ping"
                    : "bg-gray-600"
                }`}
              />
            </div>
          );
        })}
      </div>

      {/* Middle: Single-Line Live Telemetry Process Ticker */}
      <div className="flex-1 min-w-0 flex items-center gap-2">
        {isAnyLoading ? (
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shrink-0" />
        ) : (
          <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
        )}
        <div className="text-[11px] sm:text-xs font-mono truncate text-gray-200">
          <span className={isAnyLoading ? "text-cyan-300 font-semibold" : "text-gray-300"}>
            {activeProcessText}
          </span>
        </div>
      </div>

      {/* Right: Compact Sync Pill / Link CTA */}
      <div className="flex items-center gap-2 shrink-0">
        {verifiedChannelsCount < 3 && (
          <button
            type="button"
            onClick={onOpenMissingModal}
            className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gray-900 hover:bg-gray-800 border border-gray-700 text-gray-300 hover:text-white text-[10px] font-bold font-mono transition-all cursor-pointer shadow-2xs"
          >
            <span>+ Link</span>
          </button>
        )}

        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-900/90 border border-gray-800 text-[10px] sm:text-[11px] font-mono text-gray-300">
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              verifiedChannelsCount === 3
                ? "bg-emerald-400"
                : verifiedChannelsCount > 0
                ? "bg-cyan-400"
                : "bg-gray-500"
            }`}
          />
          <span className="font-bold text-white">{verifiedChannelsCount}/3</span>
          <span className="text-gray-500 hidden sm:inline">({syncPercentage}%)</span>
        </div>
      </div>
    </div>
  );
}
