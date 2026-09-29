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
  Download,
} from "lucide-react";
import { Platform, DeliverableFormat, PricingInput, RegionCode } from "@/lib/calculator/types";
import { calculateInfluencerRate, roundCommercial } from "@/lib/calculator/engine";
import { generateOmnichannelPackages, GeneratedPackage, PackageId } from "@/lib/calculator/packages";
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

const LLM_SYNTHESIS_STEPS: PlatformTickerStep[] = [
  { step: 1, percent: 82, text: "SignCollab Profile LLM Engine: Ingesting cross-platform media telemetry & transcripts..." },
  { step: 2, percent: 86, text: "SignCollab Profile LLM Engine: Synthesizing 19-point creator intelligence dossier..." },
  { step: 3, percent: 91, text: "SignCollab Profile LLM Engine: Classifying buyer intent, micro-niche & audience DNA..." },
  { step: 4, percent: 96, text: "SignCollab Profile LLM Engine: Calibrating 16-knot defended rate sheets & package tiers..." },
  { step: 5, percent: 100, text: "SignCollab Profile LLM Engine: Intelligence verified · Mounting institutional rate dashboard" },
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
  const forceNextSynthesisBypassCache = useRef(false);

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
  const completeIntelligenceRef = useRef<CompleteCreatorIntelligence | null>(null);
  useEffect(() => {
    completeIntelligenceRef.current = completeIntelligence;
  }, [completeIntelligence]);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const synthesizedHash = useRef<string>("");

  // Valuation Calibration Pipeline State (atomic reveal after AI country/niche synthesis)
  const [isValuationCalibrated, setIsValuationCalibrated] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [activePackageId, setActivePackageId] = useState<PackageId>("conversion");
  const [copiedPackageId, setCopiedPackageId] = useState<string | null>(null);
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

  // SignCollab Profile LLM Engine Ticker Step Progression (80% - 100%)
  const [llmStepIdx, setLlmStepIdx] = useState(0);
  useEffect(() => {
    if (isSynthesizing) {
      setLlmStepIdx(0);
      const interval = setInterval(() => {
        setLlmStepIdx((prev) => (prev < LLM_SYNTHESIS_STEPS.length - 2 ? prev + 1 : prev));
      }, 2200);
      return () => clearInterval(interval);
    } else if (isValuationCalibrated) {
      setLlmStepIdx(LLM_SYNTHESIS_STEPS.length - 1);
    }
  }, [isSynthesizing, isValuationCalibrated]);

  // Unified 80/20 Overall Progress Calculation:
  // 0% - 80%: Multi-Platform Scraper Pipeline
  // 80% - 100%: SignCollab Profile LLM Engine Synthesis & Valuation Calibration
  const overallProgress = useMemo(() => {
    if (isValuationCalibrated) {
      return 100;
    }
    if (isSynthesizing) {
      const step = LLM_SYNTHESIS_STEPS[Math.min(llmStepIdx, LLM_SYNTHESIS_STEPS.length - 1)] || LLM_SYNTHESIS_STEPS[0];
      return step.percent;
    }

    const isYtLoading = platforms.youtube.status === "loading";
    const isIgLoading = platforms.instagram.status === "loading";
    const isTtLoading = platforms.tiktok.status === "loading";

    let maxScraperPercent = 10;
    if (isYtLoading) {
      const ytPct = YOUTUBE_TICKER_STEPS[Math.min(ytStepIdx, YOUTUBE_TICKER_STEPS.length - 1)]?.percent || 15;
      maxScraperPercent = Math.max(maxScraperPercent, ytPct);
    }
    if (isIgLoading) {
      const igPct = INSTAGRAM_TICKER_STEPS[Math.min(igStepIdx, INSTAGRAM_TICKER_STEPS.length - 1)]?.percent || 12;
      maxScraperPercent = Math.max(maxScraperPercent, igPct);
    }
    if (isTtLoading) {
      const ttPct = TIKTOK_TICKER_STEPS[Math.min(ttStepIdx, TIKTOK_TICKER_STEPS.length - 1)]?.percent || 15;
      maxScraperPercent = Math.max(maxScraperPercent, ttPct);
    }

    if (!isYtLoading && !isIgLoading && !isTtLoading) {
      const hasAnyReady = platforms.youtube.status === "ready" || platforms.instagram.status === "ready" || platforms.tiktok.status === "ready";
      return hasAnyReady ? 80 : 0;
    }

    return Math.min(Math.round(maxScraperPercent * 0.80), 80);
  }, [isValuationCalibrated, isSynthesizing, llmStepIdx, platforms, ytStepIdx, igStepIdx, ttStepIdx]);

  const activeTickerText = useMemo(() => {
    if (isValuationCalibrated) {
      return "SignCollab Profile LLM Engine: Intelligence verified · Rates calibrated";
    }
    if (isSynthesizing) {
      const step = LLM_SYNTHESIS_STEPS[Math.min(llmStepIdx, LLM_SYNTHESIS_STEPS.length - 1)] || LLM_SYNTHESIS_STEPS[0];
      return `${step.text} (${step.percent}%)`;
    }
    if (platforms.youtube.status === "loading") {
      const step = YOUTUBE_TICKER_STEPS[Math.min(ytStepIdx, YOUTUBE_TICKER_STEPS.length - 1)] || YOUTUBE_TICKER_STEPS[0];
      const scaledPct = Math.round(step.percent * 0.80);
      return `YouTube: ${step.text} (${scaledPct}%)`;
    }
    if (platforms.instagram.status === "loading") {
      const step = INSTAGRAM_TICKER_STEPS[Math.min(igStepIdx, INSTAGRAM_TICKER_STEPS.length - 1)] || INSTAGRAM_TICKER_STEPS[0];
      const scaledPct = Math.round(step.percent * 0.80);
      return `Instagram: ${step.text} (${scaledPct}%)`;
    }
    if (platforms.tiktok.status === "loading") {
      const step = TIKTOK_TICKER_STEPS[Math.min(ttStepIdx, TIKTOK_TICKER_STEPS.length - 1)] || TIKTOK_TICKER_STEPS[0];
      const scaledPct = Math.round(step.percent * 0.80);
      return `TikTok: ${step.text} (${scaledPct}%)`;
    }
    const hasAnyReady = platforms.youtube.status === "ready" || platforms.instagram.status === "ready" || platforms.tiktok.status === "ready";
    if (hasAnyReady) {
      return "SignCollab Profile LLM Engine: Cross-platform data verified · Engaging neural synthesis... (80%)";
    }
    return "Awaiting channel discovery or direct input";
  }, [isValuationCalibrated, isSynthesizing, llmStepIdx, platforms, ytStepIdx, igStepIdx, ttStepIdx]);

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
                avgShortLikes: 0,
                avgShortComments: 0,
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

          username = (profile.username || targetInput).replace(/^@+/, "");
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

          // Prioritize outlier-trimmed core benchmark videos (tagged with isErSample)
          const sampleLongVids = longVids.filter((v: { isErSample?: boolean }) => v.isErSample);
          const targetLongVids = sampleLongVids.length > 0 ? sampleLongVids : longVids;

          const sampleShortVids = shortVids.filter((v: { isErSample?: boolean }) => v.isErSample);
          const targetShortVids = sampleShortVids.length > 0 ? sampleShortVids : shortVids;

          if (targetLongVids.length > 0) {
            avgLikes = Math.round(targetLongVids.reduce((s: number, v: { likeCount?: number }) => s + (v.likeCount || 0), 0) / targetLongVids.length);
            avgComments = Math.round(targetLongVids.reduce((s: number, v: { commentCount?: number }) => s + (v.commentCount || 0), 0) / targetLongVids.length);
            avgViews = avgLongViews || Math.round(targetLongVids.reduce((s: number, v: { viewCount?: number }) => s + (v.viewCount || 0), 0) / targetLongVids.length);
          }

          if (targetShortVids.length > 0) {
            avgShortLikes = Math.round(targetShortVids.reduce((s: number, v: { likeCount?: number }) => s + (v.likeCount || 0), 0) / targetShortVids.length);
            avgShortComments = Math.round(targetShortVids.reduce((s: number, v: { commentCount?: number }) => s + (v.commentCount || 0), 0) / targetShortVids.length);
            avgShortViews = avgShortViews || Math.round(targetShortVids.reduce((s: number, v: { viewCount?: number }) => s + (v.viewCount || 0), 0) / targetShortVids.length);
          }

          engagementRate = avgLongEngagementRate;

          if (engagementRate === 0 && avgViews > 0 && (avgLikes > 0 || avgComments > 0)) {
            engagementRate = Number((((avgLikes + avgComments) / avgViews) * 100).toFixed(2));
          }

          username = (channel.handle || channel.title || targetInput).replace(/^@+/, "");
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

          username = (profile.username || targetInput).replace(/^@+/, "");
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
              primaryUsername: username.replace(/^@+/, ""),
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
      console.warn('[Identity Resolver Pre-check Error]:', e);
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

  // Synchronize active package to recommended package when packages update
  useEffect(() => {
    if (recommendedPackages.length > 0) {
      const rec = recommendedPackages.find((p) => p.isRecommended);
      if (rec) setActivePackageId(rec.id);
      else setActivePackageId(recommendedPackages[0].id);
    }
  }, [recommendedPackages]);

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

  // Executive Valuation Report PDF Export Handler
  const handleExportPDF = useCallback(async () => {
    if (!creatorMeta || isExportingPdf) return;
    setIsExportingPdf(true);

    try {
      const activeNiche = PRIMARY_NICHES.find((n) => n.id === activeNicheId);
      const availableSubs = activeNicheId ? getSubNichesByPrimaryId(activeNicheId) : [];
      const activeSub = availableSubs.find((s) => s.id === activeSubNicheId);

      const payload = {
        creatorMeta: {
          displayName: creatorMeta.displayName,
          primaryUsername: creatorMeta.primaryUsername,
          avatarUrl: creatorMeta.avatarUrl,
        },
        selectedRegion,
        activeNicheName: activeNiche?.name,
        activeSubNicheName: activeSub?.name,
        totalAudienceCount,
        verifiedChannelsCount,
        platforms,
        recommendedPackages,
        completeIntelligence,
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
      a.download = `BrandBridge_RateCard_${safeName}.pdf`;
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
  ]);

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
                  Auditing live engagement velocity, cross-platform bio links, and regional commercial market standards.
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
                          @{creatorMeta.primaryUsername.replace(/^@+/, "")}
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
                    <>
                      <button
                        type="button"
                        onClick={handleExportPDF}
                        disabled={isExportingPdf}
                        className="px-2.5 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-900 text-xs font-medium rounded-xl transition-all border border-zinc-200 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                        title="Download PDF Valuation Report"
                      >
                        {isExportingPdf ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-zinc-600" />
                        ) : (
                          <Download className="w-3.5 h-3.5 text-zinc-700" />
                        )}
                        <span className="hidden md:inline">Download PDF</span>
                      </button>

                      <Link
                        href={buildContractHref()}
                        className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-medium rounded-xl transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Create Contract</span>
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* SECTION 2: RADAR PROGRESS STATION (0–80% CHANNEL ANALYSIS / 80–100% LLM) */}
          {/* ========================================================= */}
          <div
            ref={telemetrySectionRef}
            className="space-y-4 scroll-mt-24 transition-all duration-500 animate-fadeIn"
          >
            <RadarProgressStation
              inputQuery={inputQuery}
              overallProgress={overallProgress}
              activeTickerText={activeTickerText}
              platforms={platforms}
              verifiedChannelsCount={verifiedChannelsCount}
              onOpenMissingModal={() => setIsMissingModalOpen(true)}
              isSynthesizing={isSynthesizing}
              isValuationCalibrated={isValuationCalibrated}
            />
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
                      <div className="text-xs text-zinc-400 font-mono">@{creatorMeta.primaryUsername.replace(/^@+/, "")}</div>
                    </div>
                  </div>

                  {/* Combined Audience Badge & PDF Export */}
                  <div className="flex flex-wrap items-center gap-3 shrink-0">
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

                    <button
                      type="button"
                      onClick={handleExportPDF}
                      disabled={isExportingPdf}
                      className="px-3.5 py-2.5 text-xs font-semibold bg-zinc-950 hover:bg-zinc-800 text-white rounded-xl transition-all shadow-xs inline-flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                      title="Download Official Valuation Dossier (PDF)"
                    >
                      {isExportingPdf ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-zinc-400" />
                          <span>Generating PDF...</span>
                        </>
                      ) : (
                        <>
                          <Download className="w-3.5 h-3.5 text-zinc-300" />
                          <span>Download PDF Report</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* COUNTRY & REGIONAL CALIBRATION CONTROLLER */}
              {isValuationCalibrated && (
                <div className="p-3.5 sm:p-4 rounded-2xl bg-zinc-50 border border-zinc-200 flex flex-wrap items-center justify-between gap-3 animate-fadeIn">
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wide">
                        Market:
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
                            {activePrimary.name}
                          </span>
                        ) : null;
                      })()}
                      {(() => {
                        const activeSub = (activeSubNicheId ? SUB_NICHES.find((s) => s.id === activeSubNicheId) : undefined) || completeIntelligence.profile?.subNiche;
                        return activeSub ? (
                          <span className="text-xs font-medium text-indigo-950 bg-indigo-50/90 px-3 py-1 rounded-lg border border-indigo-200/90">
                            {activeSub.name}
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

              {/* SECTION 5: STRATEGIC OMNICHANNEL PACKAGES (ZERO TABS, FULL FUNNEL STACK) */}
              {recommendedPackages.length > 0 && (
                <div className="space-y-6 animate-fadeIn">
                  {/* Creator Strategic DNA Executive Brief */}
                  {completeIntelligence?.omnichannelStrategySuite?.creatorExecutiveBrief && (
                    <div className="p-5 sm:p-6 rounded-2xl bg-zinc-950 text-white border border-zinc-800 shadow-xl space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                          <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-cyan-400 font-mono">
                            Creator Strategic DNA &amp; Talent Executive Brief
                          </h3>
                        </div>
                        {completeIntelligence.omnichannelStrategySuite.creatorExecutiveBrief.recommendedVoucherPrefix && (
                          <span className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-white/10 text-zinc-300 border border-white/15">
                            Vanity Voucher: <strong className="text-emerald-400">{completeIntelligence.omnichannelStrategySuite.creatorExecutiveBrief.recommendedVoucherPrefix}10</strong>
                          </span>
                        )}
                      </div>

                      <div className="text-sm sm:text-base font-semibold text-zinc-100">
                        {completeIntelligence.omnichannelStrategySuite.creatorExecutiveBrief.whoTheyAre}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                        <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1">
                          <div className="text-[10px] font-mono uppercase text-emerald-400 font-bold tracking-wider">
                            Commercial Superpower
                          </div>
                          <div className="text-xs text-zinc-200 leading-relaxed">
                            {completeIntelligence.omnichannelStrategySuite.creatorExecutiveBrief.theSuperpower}
                          </div>
                        </div>

                        <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1">
                          <div className="text-[10px] font-mono uppercase text-cyan-400 font-bold tracking-wider">
                            Audience Buying Mindset
                          </div>
                          <div className="text-xs text-zinc-200 leading-relaxed">
                            {completeIntelligence.omnichannelStrategySuite.creatorExecutiveBrief.audiencePsychology}
                          </div>
                        </div>
                      </div>

                      {/* The #1 Creative Landmine Callout */}
                      {completeIntelligence.omnichannelStrategySuite.creatorExecutiveBrief.theLandmine && (
                        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-200 text-xs flex items-start gap-2.5">
                          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold text-white uppercase tracking-wider text-[10px] block font-mono">
                              The #1 Creative Landmine to Avoid
                            </span>
                            <span className="text-zinc-200 text-xs leading-relaxed">
                              {completeIntelligence.omnichannelStrategySuite.creatorExecutiveBrief.theLandmine}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Section Title */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2">
                    <div>
                      <h3 className="text-base sm:text-lg font-bold text-zinc-950 flex items-center gap-2">
                        <span>Omnichannel Campaign Strategy Suite</span>
                        <span className="text-xs font-normal text-zinc-500 font-mono">
                          (5 Full-Funnel Packages)
                        </span>
                      </h3>
                      <p className="text-xs text-zinc-500 mt-0.5">
                        Itemized line-item pricing and strategic flighting calibrated in native currency.
                      </p>
                    </div>
                    <div className="text-[11px] font-mono text-zinc-500 bg-zinc-100 px-3 py-1 rounded-xl border border-zinc-200 shrink-0">
                      Market Applied: {REGIONAL_CONFIG[selectedRegion]?.name} ({REGIONAL_CONFIG[selectedRegion]?.currency})
                    </div>
                  </div>

                  {/* Stacked 5-Package Cards (Zero Tabs) */}
                  <div className="space-y-6">
                    {recommendedPackages.map((pkg) => {
                      const isRec = pkg.isRecommended;

                      return (
                        <div
                          key={pkg.id}
                          className={`p-5 sm:p-6 rounded-2xl bg-zinc-950 text-white shadow-xl space-y-5 border transition-all ${
                            isRec ? "border-amber-400/40 ring-1 ring-amber-400/20" : "border-white/10"
                          }`}
                        >
                          {/* Top Header: Identity & Financials */}
                          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 border-b border-white/10 pb-4">
                            <div className="space-y-2 max-w-2xl">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">
                                  {pkg.tag}
                                </span>
                                <h4 className="text-base sm:text-lg font-bold text-white">
                                  {pkg.name}
                                </h4>
                                {isRec && (
                                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-md bg-amber-400/20 text-amber-300 font-bold border border-amber-400/30 flex items-center gap-1">
                                    <Sparkles className="w-3 h-3" />
                                    <span>Top Recommendation</span>
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-zinc-300 leading-relaxed">
                                {pkg.objective}
                              </p>
                              {pkg.strategicRationale && (
                                <div className="text-[11px] text-zinc-400 italic bg-white/5 p-2.5 rounded-lg border border-white/5">
                                  Strategy Angle: {pkg.strategicRationale}
                                </div>
                              )}
                            </div>

                            {/* Financial Summary */}
                            <div className="text-left lg:text-right shrink-0 bg-white/5 p-3.5 rounded-xl border border-white/10 space-y-1">
                              <div className="text-[10px] font-mono uppercase text-zinc-400 tracking-wider">
                                Recommended Bundle Target
                              </div>
                              <div className="text-xl sm:text-2xl font-black font-mono text-white">
                                {pkg.pricing.recommendedBundleFormatted || pkg.pricing.typicalFormatted}
                                {pkg.pricing.usdEquivalentTypical && (
                                  <span className="text-xs font-normal text-zinc-400 ml-1.5 font-mono">
                                    ({pkg.pricing.usdEquivalentTypical})
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] font-mono text-zinc-400">
                                Standalone Benchmark: <span className="line-through text-zinc-500">{pkg.pricing.standaloneBenchmarkFormatted || pkg.pricing.typicalFormatted}</span>
                                {pkg.discountPercentApplied > 0 ? (
                                  <span className="text-emerald-400 font-semibold ml-1.5">(-{pkg.discountPercentApplied}% Efficiency)</span>
                                ) : (
                                  <span className="text-zinc-400 font-medium ml-1.5">(Standard Benchmark)</span>
                                )}
                              </div>
                              <div className="text-[10px] font-mono text-zinc-400 pt-0.5">
                                Defended Range: {pkg.pricing.lowFormatted} – {pkg.pricing.highFormatted}
                              </div>
                              {Boolean(pkg.pricing.commercialRightsFeeLocalized && pkg.pricing.commercialRightsFeeLocalized > 0) && (
                                <div className="text-[10px] font-mono text-zinc-400 pt-1.5 border-t border-white/10 flex flex-wrap items-center justify-start lg:justify-end gap-x-1.5 gap-y-0.5">
                                  <span>Content: <strong className="text-zinc-200">{pkg.pricing.rawContentSumFormatted}</strong></span>
                                  <span className="text-zinc-500">+</span>
                                  <span>Rights: <strong className="text-cyan-400 font-bold">+{pkg.pricing.commercialRightsFeeFormatted}</strong></span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Itemized Deliverables with Line-Item Pricing */}
                          <div className="space-y-2.5">
                            <div className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 font-semibold flex items-center justify-between">
                              <span>Itemized Deliverables &amp; Defended Rates</span>
                              <span className="text-[10px] text-zinc-500">16-Knot Formula Verified</span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                              {(pkg.calibratedDeliverables && pkg.calibratedDeliverables.length > 0
                                ? pkg.calibratedDeliverables
                                : pkg.deliverables.map((d, dIdx) => ({
                                    id: d.id,
                                    phase: d.phase,
                                    platform: d.platform,
                                    formatKey: d.format,
                                    quantity: d.quantity,
                                    title: d.title,
                                    description: d.description,
                                    standaloneUnitFormatted: "",
                                    totalStandaloneFormatted: "",
                                    standaloneUnitLocalized: 0,
                                    totalStandaloneLocalized: 0,
                                  }))
                              ).map((item, dIdx) => (
                                <div
                                  key={item.id || dIdx}
                                  className="p-3.5 rounded-xl bg-black/50 border border-white/10 space-y-2 flex flex-col justify-between"
                                >
                                  <div className="space-y-1.5">
                                    <div className="flex items-center justify-between gap-1.5">
                                      <span className="text-[9px] font-mono uppercase text-emerald-400 font-semibold px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                                        {item.phase}
                                      </span>
                                      <span className="text-[9px] font-mono text-zinc-400 uppercase">
                                        {item.platform}
                                      </span>
                                    </div>
                                    <div className="text-xs font-bold text-white">
                                      {item.quantity}x {item.title.replace(/^\d+x\s*/i, "").trim()}
                                    </div>
                                    <div className="text-[11px] text-zinc-400 leading-snug">
                                      {item.description}
                                    </div>
                                  </div>

                                  {/* Line-Item Price Badge */}
                                  {item.totalStandaloneFormatted && (
                                    <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                                      <span className="text-[10px] font-mono uppercase text-zinc-400">Standalone Rate</span>
                                      <span className="text-xs font-bold font-mono text-emerald-400">
                                        {item.totalStandaloneFormatted}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Verbatim Spoken Ad Hooks (Package 2) */}
                          {pkg.adConcepts && pkg.adConcepts.length > 0 && (
                            <div className="space-y-2.5 pt-2 border-t border-white/10">
                              <div className="text-[11px] font-mono uppercase tracking-wider text-amber-300 font-semibold flex items-center gap-1.5">
                                <span>Verbatim Spoken Ad Hooks (Opening 3–5 Seconds)</span>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {pkg.adConcepts.map((concept, cIdx) => (
                                  <div
                                    key={cIdx}
                                    className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1.5"
                                  >
                                    <div className="flex items-center justify-between">
                                      <span className="text-xs font-bold text-white">{concept.conceptName}</span>
                                      <span className="text-[9px] font-mono uppercase text-cyan-400">{concept.suggestedPlatform}</span>
                                    </div>
                                    <div className="text-xs text-amber-200/90 font-mono italic bg-black/40 p-2.5 rounded-lg border border-white/5 leading-relaxed">
                                      {concept.hookVerbatim}
                                    </div>
                                    <div className="text-[11px] text-zinc-400 leading-snug">
                                      {concept.angleSummary}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Concrete Digital Assets (Package 4) */}
                          {pkg.concreteAssets && pkg.concreteAssets.length > 0 && (
                            <div className="space-y-2 pt-2 border-t border-white/10">
                              <div className="text-[11px] font-mono uppercase tracking-wider text-cyan-400 font-semibold">
                                Concrete Digital Asset Buyout Specifications
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {pkg.concreteAssets.map((asset, aIdx) => (
                                  <div
                                    key={aIdx}
                                    className="p-2.5 rounded-xl bg-white/5 border border-white/5 text-xs text-zinc-300 flex items-center gap-2"
                                  >
                                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0" />
                                    <span>{asset.specification}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Commercial Entitlements */}
                          <div className="space-y-2 pt-2 border-t border-white/10">
                            <div className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 font-semibold flex items-center justify-between">
                              <span>Included Commercial Rights &amp; Contract Entitlements</span>
                              {Boolean(pkg.pricing.commercialRightsFeeLocalized && pkg.pricing.commercialRightsFeeLocalized > 0) && (
                                <span className="text-[10px] font-mono font-bold text-cyan-300 bg-cyan-500/15 border border-cyan-500/30 px-2 py-0.5 rounded">
                                  Included Rights Valuation: +{pkg.pricing.commercialRightsFeeFormatted}
                                </span>
                              )}
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                              {pkg.entitlements.map((ent, idx) => (
                                <div
                                  key={idx}
                                  className="p-2.5 rounded-xl bg-white/5 border border-white/5 text-xs space-y-0.5"
                                >
                                  <div className="font-semibold text-zinc-200 flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                    <span>{ent.label}</span>
                                  </div>
                                  <div className="text-[10px] text-zinc-400 leading-normal pl-3">
                                    {ent.detail}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* 3 Critical Collaboration Guidelines */}
                          {pkg.collaborationGuidelines && pkg.collaborationGuidelines.length > 0 && (
                            <div className="space-y-2 pt-2 border-t border-white/10">
                              <div className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 font-semibold">
                                Critical Collaboration Guidelines (Brand Safety &amp; ROI)
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                                {pkg.collaborationGuidelines.map((rule, rIdx) => (
                                  <div
                                    key={rIdx}
                                    className="p-3 rounded-xl bg-black/40 border border-white/10 space-y-1 text-xs"
                                  >
                                    <div className="font-bold text-white text-[11px] flex items-center gap-1.5">
                                      <span className="text-zinc-500 font-mono">#{rule.ruleNumber}</span>
                                      <span>{rule.ruleTitle}</span>
                                    </div>
                                    <div className="text-[11px] text-zinc-300 leading-snug">
                                      {rule.directive}
                                    </div>
                                    <div className="text-[10px] text-amber-300/80 pt-1 leading-snug">
                                      Risk: {rule.commercialRisk}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Action Row */}
                          <div className="pt-3 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-white/10">
                            <div className="text-[11px] text-zinc-400 font-mono">
                              Institutional proposal defended via SignCollab 16-Knot Empirical Model.
                            </div>
                            <button
                              type="button"
                              onClick={() => handleCopyPackageProposal(pkg)}
                              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-white hover:bg-zinc-100 text-zinc-950 font-bold text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer flex items-center justify-center gap-2 shrink-0"
                            >
                              {copiedPackageId === pkg.id ? (
                                <>
                                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                  <span>Proposal Copied to Clipboard</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-4 h-4" />
                                  <span>Copy Campaign Proposal</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      );
                    })}
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
                    We verified <strong className="text-zinc-900 font-semibold">{verifiedChannelsCount} channel(s)</strong> for {creatorMeta?.displayName || "Creator"}, but couldn&apos;t automatically discover all 3 channels in the bio. Add unfound handles to calculate multi-platform bundle rates &amp; full intelligence.
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
    <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs flex flex-col justify-start p-4 space-y-3.5 h-full">
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
                    className="flex items-center justify-between p-2 rounded-lg border border-gray-100 hover:border-gray-300 bg-white transition-all text-xs gap-2"
                  >
                    <div className="min-w-0 flex-1 pr-1.5">
                      <div className="font-semibold text-gray-900 truncate" title={label}>{label}</div>
                      <div
                        className="text-[9.5px] text-gray-500 font-mono tracking-tight whitespace-nowrap overflow-hidden text-ellipsis"
                        title={`${item.formattedLow} – ${item.formattedHigh}`}
                      >
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
// Sub-Component: Recent Media & Empirical Content Audits (Compact Cards)
// ----------------------------------------------------------------------

type AuditTab = "all" | "youtube" | "instagram" | "tiktok";

function YouTubeLogoIcon({ className = "w-3.5 h-3.5 text-red-600 shrink-0" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

function InstagramLogoIcon({ className = "w-3.5 h-3.5 text-pink-600 shrink-0" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  );
}

function TikTokLogoIcon({ className = "w-3.5 h-3.5 text-gray-950 shrink-0" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.298 0 .594.045.87.134V9.41a6.33 6.33 0 0 0-1-.08A6.34 6.34 0 0 0 3 15.66a6.34 6.34 0 0 0 10.82 4.49 6.28 6.28 0 0 0 1.87-4.48V8.71a8.31 8.31 0 0 0 3.9 1.02V6.69z" />
    </svg>
  );
}

function calcEngagementRate(likes: number, comments: number, views: number): string {
  if (!views || views <= 0) return "—";
  const rate = ((likes + comments) / views) * 100;
  return `${rate.toFixed(2)}%`;
}

function calcFollowerEr(likes: number, comments: number, followers?: number): string {
  if (!followers || followers <= 0) return "—";
  const rate = ((likes + comments) / followers) * 100;
  return `${rate.toFixed(2)}%`;
}

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "";
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  } catch {
    return "";
  }
}

function getInstagramContentType(rawType?: string): { label: string; badgeClass: string } {
  const t = (rawType || "").toLowerCase();
  if (t === "reel" || t.includes("reel") || t.includes("clip")) {
    return {
      label: "Reel",
      badgeClass: "bg-purple-50 text-purple-700 border-purple-200/80",
    };
  }
  if (t === "carousel" || t === "sidecar" || t.includes("carousel") || t.includes("album")) {
    return {
      label: "Carousel",
      badgeClass: "bg-indigo-50 text-indigo-700 border-indigo-200/80",
    };
  }
  if (t === "video") {
    return {
      label: "Video",
      badgeClass: "bg-sky-50 text-sky-700 border-sky-200/80",
    };
  }
  return {
    label: "Image",
    badgeClass: "bg-slate-100 text-slate-700 border-slate-200",
  };
}

// 1. YouTube Audit Card (No Thumbnail)
function YouTubeAuditCard({
  video,
  username,
}: {
  video: YouTubeVideoItem;
  username?: string;
}) {
  const formattedDate = formatDate(video.publishedAt);
  const cleanUsername = username?.replace(/^@+/, "");

  return (
    <div
      className={`rounded-xl border bg-white hover:border-gray-300 hover:shadow-xs transition-all flex flex-col justify-between p-3.5 sm:p-4 space-y-3 ${
        video.isErSample ? "border-emerald-200/90 shadow-2xs" : "border-gray-200/90"
      }`}
    >
      {/* Top Header: Platform Logo + Name + Format Pill | Outlier Status */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <YouTubeLogoIcon className="w-3.5 h-3.5 text-red-600 shrink-0" />
          <span className="text-[11px] font-bold text-gray-900 shrink-0">YouTube</span>
          <span
            className={`px-2 py-0.5 rounded-md border text-[10px] font-semibold truncate ${
              video.isShort
                ? "bg-rose-50 text-rose-700 border-rose-200/80"
                : "bg-slate-100 text-slate-700 border-slate-200"
            }`}
          >
            {video.isShort ? "Shorts" : "Long Video"}
          </span>
        </div>

        <div className="shrink-0">
          {video.isErSample ? (
            <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200/80 font-semibold text-[10px] flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Core Benchmark
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded-md bg-gray-100 text-gray-500 border border-gray-200 font-medium text-[10px]">
              Trimmed Outlier
            </span>
          )}
        </div>
      </div>

      {/* Content Title & Runtime Metadata */}
      <div className="space-y-1">
        <h4 className="text-xs font-semibold text-gray-950 line-clamp-2 leading-snug">
          {video.title}
        </h4>
        <div className="flex items-center gap-2 text-[10px] text-gray-500 font-mono">
          {formattedDate && <span>{formattedDate}</span>}
          {video.durationFormatted && (
            <>
              <span>•</span>
              <span className="flex items-center gap-0.5">
                <svg className="w-2.5 h-2.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {video.durationFormatted}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Metrics Row: 4 High-Density Columns */}
      <div className="bg-gray-50/80 rounded-lg p-2.5 border border-gray-200/70 grid grid-cols-4 gap-1.5 text-center">
        <div>
          <div className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Views</div>
          <div className="text-xs font-bold text-gray-900 font-mono mt-0.5">
            {formatShortNumber(video.viewCount)}
          </div>
        </div>
        <div>
          <div className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Likes</div>
          <div className="text-xs font-bold text-gray-900 font-mono mt-0.5">
            {formatShortNumber(video.likeCount)}
          </div>
        </div>
        <div>
          <div className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Comments</div>
          <div className="text-xs font-bold text-gray-900 font-mono mt-0.5">
            {formatShortNumber(video.commentCount)}
          </div>
        </div>
        <div>
          <div className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">ER %</div>
          <div className="text-xs font-bold text-gray-900 font-mono mt-0.5">
            {calcEngagementRate(video.likeCount, video.commentCount, video.viewCount)}
          </div>
        </div>
      </div>

      {/* Footer Row */}
      <div className="pt-1 border-t border-gray-100 flex items-center justify-between text-[11px]">
        <span className="font-mono text-gray-400 text-[10px]">@{cleanUsername || "channel"}</span>
        <a
          href={video.url}
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-gray-800 hover:text-black flex items-center gap-1 hover:underline cursor-pointer"
        >
          <span>Watch</span>
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      </div>
    </div>
  );
}

// 2. Instagram Audit Card (No Thumbnail)
function InstagramAuditCard({
  post,
  followers,
  username,
}: {
  post: InstagramPostItem;
  followers?: number;
  username?: string;
}) {
  const typeInfo = getInstagramContentType(post.contentType);
  const formattedDate = formatDate(post.datetime);
  const cleanUsername = username?.replace(/^@+/, "");

  return (
    <div className="rounded-xl border border-gray-200/90 bg-white hover:border-gray-300 hover:shadow-xs transition-all flex flex-col justify-between p-3.5 sm:p-4 space-y-3">
      {/* Top Header: Platform Logo + Name + Format Pill | Sample Status */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <InstagramLogoIcon className="w-3.5 h-3.5 text-pink-600 shrink-0" />
          <span className="text-[11px] font-bold text-gray-900 shrink-0">Instagram</span>
          <span className={`px-2 py-0.5 rounded-md border text-[10px] font-semibold truncate ${typeInfo.badgeClass}`}>
            {typeInfo.label}
          </span>
        </div>

        <div className="shrink-0">
          {post.isPinned ? (
            <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200/80 font-semibold text-[10px] flex items-center gap-1">
              <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
              Pinned
            </span>
          ) : post.isEnrichedSample ? (
            <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200/80 font-semibold text-[10px] flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Core Sample
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded-md bg-gray-100 text-gray-500 border border-gray-200 font-medium text-[10px]">
              Recent
            </span>
          )}
        </div>
      </div>

      {/* Caption & Metadata */}
      <div className="space-y-1">
        <p className="text-xs font-semibold text-gray-950 line-clamp-2 leading-snug">
          {post.caption || "Instagram upload"}
        </p>
        <div className="flex items-center gap-2 text-[10px] text-gray-500 font-mono">
          {formattedDate && <span>{formattedDate}</span>}
          <span>•</span>
          <span title="Instagram hides public view counts on individual posts and reels">Views: — (Private on IG)</span>
        </div>
      </div>

      {/* Metrics Row: 3 High-Density Columns (Follower ER Benchmarked) */}
      <div className="bg-gray-50/80 rounded-lg p-2.5 border border-gray-200/70 grid grid-cols-3 gap-2 text-center">
        <div>
          <div className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Likes</div>
          <div className="text-xs font-bold text-gray-900 font-mono mt-0.5">
            {formatShortNumber(post.likes)}
          </div>
        </div>
        <div>
          <div className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Comments</div>
          <div className="text-xs font-bold text-gray-900 font-mono mt-0.5">
            {formatShortNumber(post.commentsCount)}
          </div>
        </div>
        <div>
          <div className="text-[9px] font-bold text-gray-400 uppercase tracking-wider" title="Follower Benchmarked ER">
            Follower ER
          </div>
          <div className="text-xs font-bold text-gray-900 font-mono mt-0.5">
            {calcFollowerEr(post.likes, post.commentsCount, followers)}
          </div>
        </div>
      </div>

      {/* Footer Row */}
      <div className="pt-1 border-t border-gray-100 flex items-center justify-between text-[11px]">
        <span className="font-mono text-gray-400 text-[10px]">@{cleanUsername || "creator"}</span>
        <a
          href={post.url}
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-gray-800 hover:text-black flex items-center gap-1 hover:underline cursor-pointer"
        >
          <span>View Post</span>
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      </div>
    </div>
  );
}

// 3. TikTok Audit Card (No Thumbnail)
function TikTokAuditCard({
  video,
  username,
}: {
  video: TikTokVideoItem;
  username?: string;
}) {
  const formattedDate = formatDate(video.createDate);
  const cleanUsername = username?.replace(/^@+/, "");

  return (
    <div className="rounded-xl border border-gray-200/90 bg-white hover:border-gray-300 hover:shadow-xs transition-all flex flex-col justify-between p-3.5 sm:p-4 space-y-3">
      {/* Top Header: Platform Logo + Name + Format Pill | Status */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <TikTokLogoIcon className="w-3.5 h-3.5 text-gray-950 shrink-0" />
          <span className="text-[11px] font-bold text-gray-900 shrink-0">TikTok</span>
          <span className="px-2 py-0.5 rounded-md border text-[10px] font-semibold truncate bg-gray-100 text-gray-700 border-gray-200">
            TikTok Video
          </span>
        </div>

        <div className="shrink-0">
          {video.isPinned ? (
            <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200/80 font-semibold text-[10px] flex items-center gap-1">
              <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
              Pinned
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded-md bg-gray-100 text-gray-500 border border-gray-200 font-medium text-[10px]">
              Recent
            </span>
          )}
        </div>
      </div>

      {/* Description */}
      <div className="space-y-1">
        <p className="text-xs font-semibold text-gray-950 line-clamp-2 leading-snug">
          {video.description || "TikTok upload"}
        </p>
        <div className="flex items-center gap-2 text-[10px] text-gray-500 font-mono">
          {formattedDate && <span>{formattedDate}</span>}
        </div>
      </div>

      {/* Metrics Row: 4 High-Density Columns */}
      <div className="bg-gray-50/80 rounded-lg p-2.5 border border-gray-200/70 grid grid-cols-4 gap-1.5 text-center">
        <div>
          <div className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Views</div>
          <div className="text-xs font-bold text-gray-900 font-mono mt-0.5">
            {formatShortNumber(video.playCount)}
          </div>
        </div>
        <div>
          <div className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Likes</div>
          <div className="text-xs font-bold text-gray-900 font-mono mt-0.5">
            {formatShortNumber(video.diggCount)}
          </div>
        </div>
        <div>
          <div className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Comments</div>
          <div className="text-xs font-bold text-gray-900 font-mono mt-0.5">
            {formatShortNumber(video.commentCount)}
          </div>
        </div>
        <div>
          <div className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">ER %</div>
          <div className="text-xs font-bold text-gray-900 font-mono mt-0.5">
            {calcEngagementRate(video.diggCount, video.commentCount, video.playCount)}
          </div>
        </div>
      </div>

      {/* Footer Row */}
      <div className="pt-1 border-t border-gray-100 flex items-center justify-between text-[11px]">
        <span className="font-mono text-gray-400 text-[10px]">@{cleanUsername || "creator"}</span>
        <a
          href={video.url}
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-gray-800 hover:text-black flex items-center gap-1 hover:underline cursor-pointer"
        >
          <span>View Video</span>
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// Main Sub-Component: Recent Media & Empirical Post Audits Feed
// ----------------------------------------------------------------------
function RecentMediaAuditFeed({
  platforms,
}: {
  platforms: Record<Platform, DiscoveredPlatformData>;
}) {
  const ytVideos = useMemo(() => {
    return (platforms.youtube.videos as unknown as YouTubeVideoItem[]) || [];
  }, [platforms.youtube.videos]);

  const igPosts = useMemo(() => {
    return platforms.instagram.posts || [];
  }, [platforms.instagram.posts]);

  const ttVideos = useMemo(() => {
    return (platforms.tiktok.videos as unknown as TikTokVideoItem[]) || [];
  }, [platforms.tiktok.videos]);

  const totalCount = ytVideos.length + igPosts.length + ttVideos.length;

  // Separate YouTube Long-Form and Shorts
  const ytLongVideos = useMemo(() => ytVideos.filter((v) => !v.isShort), [ytVideos]);
  const ytShortVideos = useMemo(() => ytVideos.filter((v) => v.isShort), [ytVideos]);

  // Construct tabs dynamically based on available data
  const availableTabs = useMemo(() => {
    const tabs: Array<{ id: AuditTab; label: string; count: number }> = [];

    const platformsWithData = [
      platforms.youtube.status === "ready" && ytVideos.length > 0,
      platforms.instagram.status === "ready" && igPosts.length > 0,
      platforms.tiktok.status === "ready" && ttVideos.length > 0,
    ].filter(Boolean).length;

    if (platformsWithData > 1) {
      tabs.push({ id: "all", label: "All Platforms", count: totalCount });
    }
    if (platforms.youtube.status === "ready" && ytVideos.length > 0) {
      tabs.push({ id: "youtube", label: "YouTube", count: ytVideos.length });
    }
    if (platforms.instagram.status === "ready" && igPosts.length > 0) {
      tabs.push({ id: "instagram", label: "Instagram", count: igPosts.length });
    }
    if (platforms.tiktok.status === "ready" && ttVideos.length > 0) {
      tabs.push({ id: "tiktok", label: "TikTok", count: ttVideos.length });
    }

    return tabs;
  }, [platforms, ytVideos.length, igPosts.length, ttVideos.length, totalCount]);

  const [activeTab, setActiveTab] = useState<AuditTab>(() => {
    return availableTabs[0]?.id || "all";
  });

  useEffect(() => {
    if (availableTabs.length > 0 && !availableTabs.some((t) => t.id === activeTab)) {
      setActiveTab(availableTabs[0].id);
    }
  }, [availableTabs, activeTab]);

  // Unified items for "All Platforms" tab sorted by timestamp
  const allUnifiedCards = useMemo(() => {
    const items: Array<{
      timestamp: number;
      element: React.ReactNode;
    }> = [];

    ytVideos.forEach((vid) => {
      items.push({
        timestamp: vid.publishedAt ? new Date(vid.publishedAt).getTime() : 0,
        element: (
          <YouTubeAuditCard
            key={`all-yt-${vid.id || vid.url}`}
            video={vid}
            username={platforms.youtube.username}
          />
        ),
      });
    });

    igPosts.forEach((post) => {
      items.push({
        timestamp: post.datetime ? new Date(post.datetime).getTime() : 0,
        element: (
          <InstagramAuditCard
            key={`all-ig-${post.id || post.url}`}
            post={post}
            followers={platforms.instagram.followerCount}
            username={platforms.instagram.username}
          />
        ),
      });
    });

    ttVideos.forEach((vid) => {
      items.push({
        timestamp: vid.createDate ? new Date(vid.createDate).getTime() : 0,
        element: (
          <TikTokAuditCard
            key={`all-tt-${vid.id || vid.url}`}
            video={vid}
            username={platforms.tiktok.username}
          />
        ),
      });
    });

    return items.sort((a, b) => b.timestamp - a.timestamp).map((x) => x.element);
  }, [ytVideos, igPosts, ttVideos, platforms]);

  if (totalCount === 0 || availableTabs.length === 0) return null;

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
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1 text-[11px] font-semibold rounded-lg transition-all cursor-pointer ${
                  activeTab === tab.id
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

      {/* 1. All Platforms Tab */}
      {activeTab === "all" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-gray-100 pb-2">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-gray-950" />
              <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                All Audited Media ({allUnifiedCards.length})
              </h4>
            </div>
            <span className="text-[11px] text-gray-500">
              Chronological audit feed across all verified channels
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {allUnifiedCards}
          </div>
        </div>
      )}

      {/* 2. YouTube Tab (LF Separated from SF) */}
      {activeTab === "youtube" && (
        <div className="space-y-6">
          {/* Sub-section 1: Long-Form Videos */}
          {ytLongVideos.length > 0 && (
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-gray-100 pb-2">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
                  <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                    Long-Form Video Audits ({ytLongVideos.length})
                  </h4>
                </div>
                <span className="text-[11px] text-gray-500">
                  6 Core Benchmark uploads defend median baseline rate (top 2 viral outliers and bottom 2 flops trimmed)
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {ytLongVideos.map((vid) => (
                  <YouTubeAuditCard
                    key={`yt-lf-${vid.id || vid.url}`}
                    video={vid}
                    username={platforms.youtube.username}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Sub-section 2: Short-Form / Shorts */}
          {ytShortVideos.length > 0 && (
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-gray-100 pb-2">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
                  <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                    Short-Form / Shorts Audits ({ytShortVideos.length})
                  </h4>
                </div>
                <span className="text-[11px] text-gray-500">
                  6 Core Benchmark shorts defend median baseline rate (top 2 viral outliers and bottom 2 flops trimmed)
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {ytShortVideos.map((vid) => (
                  <YouTubeAuditCard
                    key={`yt-sf-${vid.id || vid.url}`}
                    video={vid}
                    username={platforms.youtube.username}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3. Instagram Tab (Content Type Categorized) */}
      {activeTab === "instagram" && (
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-gray-100 pb-2">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-pink-600" />
              <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                Instagram Content Audits ({igPosts.length})
              </h4>
            </div>
            <span className="text-[11px] text-gray-500">
              Categorized by Reel, Carousel, and Image formats • Follower ER benchmarked
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {igPosts.map((post) => (
              <InstagramAuditCard
                key={`ig-${post.id || post.url}`}
                post={post}
                followers={platforms.instagram.followerCount}
                username={platforms.instagram.username}
              />
            ))}
          </div>
        </div>
      )}

      {/* 4. TikTok Tab */}
      {activeTab === "tiktok" && (
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-gray-100 pb-2">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-gray-950" />
              <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                TikTok Content Audits ({ttVideos.length})
              </h4>
            </div>
            <span className="text-[11px] text-gray-500">
              Recent uploads analyzed for play velocity, shares, and engagement rates
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {ttVideos.map((vid) => (
              <TikTokAuditCard
                key={`tt-${vid.id || vid.url}`}
                video={vid}
                username={platforms.tiktok.username}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ----------------------------------------------------------------------
// Sub-Component: Institutional Radar Progress Station (Light Theme)
// Unifies Channel Analysis (0–80%) and SignCollab Profile LLM Engine (80–100%)
// ----------------------------------------------------------------------
function RadarProgressStation({
  inputQuery,
  overallProgress,
  activeTickerText,
  platforms,
  verifiedChannelsCount,
  onOpenMissingModal,
  isSynthesizing,
  isValuationCalibrated,
}: {
  inputQuery: string;
  overallProgress: number;
  activeTickerText: string;
  platforms: {
    instagram: DiscoveredPlatformData;
    youtube: DiscoveredPlatformData;
    tiktok: DiscoveredPlatformData;
  };
  verifiedChannelsCount: number;
  onOpenMissingModal: () => void;
  isSynthesizing?: boolean;
  isValuationCalibrated?: boolean;
}) {
  const radius = 52;
  const strokeWidth = 7;
  const circumference = 2 * Math.PI * radius; // ~326.73
  const strokeDashoffset = circumference - (circumference * Math.min(overallProgress, 100)) / 100;

  const isAnalysisPhase = overallProgress < 80;
  const isLlmPhase = overallProgress >= 80 && overallProgress < 100;

  // Platform items configuration
  const platformList = [
    {
      key: "youtube" as const,
      name: "YouTube",
      data: platforms.youtube,
      icon: (
        <svg className="w-3.5 h-3.5 text-red-500 shrink-0" viewBox="0 0 24 24" fill="currentColor">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
        </svg>
      ),
    },
    {
      key: "instagram" as const,
      name: "Instagram",
      data: platforms.instagram,
      icon: (
        <svg className="w-3.5 h-3.5 text-pink-500 shrink-0" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
        </svg>
      ),
    },
    {
      key: "tiktok" as const,
      name: "TikTok",
      data: platforms.tiktok,
      icon: (
        <svg className="w-3.5 h-3.5 text-cyan-500 shrink-0" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="relative overflow-hidden rounded-2xl bg-white text-zinc-950 shadow-sm border border-zinc-200/90 p-5 sm:p-6 space-y-5">
      {/* Background ambient subtle light */}
      <div className="absolute top-0 right-1/4 w-80 h-80 bg-cyan-100/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-emerald-100/40 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header Row */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-zinc-100 border border-zinc-200 flex items-center justify-center shrink-0 shadow-2xs">
            <Radio className="w-4 h-4 text-cyan-600 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold tracking-tight text-zinc-950">
                Autonomous Telemetry &amp; Valuation Radar
              </span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-mono border ${
                  isValuationCalibrated
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200/90 font-semibold"
                    : isSynthesizing
                    ? "bg-cyan-50 text-cyan-700 border-cyan-200/90 animate-pulse font-semibold"
                    : "bg-zinc-100 text-zinc-700 border-zinc-200 font-medium"
                }`}
              >
                {isValuationCalibrated ? "Calibrated & Verified" : isSynthesizing ? "Stage 2: LLM Synthesis" : "Stage 1: Channel Analysis"}
              </span>
            </div>
            <p className="text-[11px] text-zinc-500 font-mono mt-0.5">
              Target Creator: <span className="text-zinc-900 font-semibold">@{inputQuery.replace(/^@+/, "")}</span>
            </p>
          </div>
        </div>

        {/* Time expectation callout */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-zinc-50 border border-zinc-200/80 text-xs text-zinc-700 shadow-2xs self-start sm:self-auto">
          <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
          <span>Complete analysis takes <strong className="text-zinc-950 font-semibold">~2–3 minutes</strong></span>
        </div>
      </div>

      {/* Reassurance Callout Box */}
      <div className="relative z-10 text-xs text-zinc-600 leading-relaxed flex items-start gap-2.5 bg-zinc-50/90 p-3.5 rounded-xl border border-zinc-200/80">
        <Clock className="w-4 h-4 text-cyan-600 shrink-0 mt-0.5" />
        <p>
          Analyzing real-time channel velocity, subscriber reach, and audience metrics to benchmark 16 commercial knots via SignCollab Profile LLM Engine. Deep profiling completes in ~2–3 minutes. Please keep this tab active.
        </p>
      </div>

      {/* Centerpiece: Radial Spinner + 2-Stage Progress Architecture */}
      <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 sm:gap-8 pt-1">
        {/* Left: SVG Radial Progress Ring */}
        <div className="relative flex items-center justify-center shrink-0">
          <svg className="w-36 h-36 -rotate-90 transform" viewBox="0 0 128 128">
            <defs>
              <linearGradient id="stationRadialGradientLight" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#0891b2" />
                <stop offset="100%" stopColor="#059669" />
              </linearGradient>
            </defs>
            {/* Background Track Circle */}
            <circle
              cx="64"
              cy="64"
              r={radius}
              stroke="#e4e4e7"
              strokeWidth={strokeWidth}
              fill="transparent"
            />
            {/* Active Progress Circle */}
            <circle
              cx="64"
              cy="64"
              r={radius}
              stroke="url(#stationRadialGradientLight)"
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-700 ease-out"
            />
          </svg>

          {/* Centered Percentage & Stage Label */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
            <span className="text-3xl font-extrabold font-mono text-zinc-950 tracking-tight">
              {overallProgress}%
            </span>
            <span className="text-[10px] font-mono uppercase tracking-wider font-semibold text-zinc-500 mt-0.5">
              {overallProgress < 80 ? "Analyzing" : overallProgress < 100 ? "LLM Engine" : "Verified"}
            </span>
          </div>
        </div>

        {/* Right: 2-Stage Architecture Visual Breakdown */}
        <div className="flex-1 w-full space-y-3">
          {/* Stage 1: 0% - 80% */}
          <div
            className={`p-3 rounded-xl border transition-all ${
              isAnalysisPhase
                ? "bg-cyan-50/70 border-cyan-200 shadow-2xs"
                : overallProgress >= 80
                ? "bg-emerald-50/40 border-emerald-200/90"
                : "bg-zinc-50/80 border-zinc-200/80"
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-md bg-white border border-zinc-200 text-zinc-700 text-[10px] font-mono font-bold flex items-center justify-center shadow-2xs">
                  1
                </span>
                <span className="text-xs font-semibold text-zinc-900">
                  Cross-Platform Channel Analysis (0% – 80%)
                </span>
              </div>
              <span
                className={`text-[10px] font-mono ${
                  overallProgress >= 80 ? "text-emerald-700 font-semibold" : "text-cyan-700 animate-pulse font-semibold"
                }`}
              >
                {overallProgress >= 80 ? "Verified (80%)" : `${Math.min(overallProgress, 80)}% / 80%`}
              </span>
            </div>
            <p className="text-[11px] text-zinc-600 mt-1 pl-7">
              Analyzing live video play velocity, historical uploads, audience reach &amp; engagement rates across YouTube, Instagram &amp; TikTok.
            </p>
            {/* Stage 1 Mini Progress Bar */}
            <div className="w-full h-1.5 bg-zinc-200 rounded-full overflow-hidden mt-2 ml-7 max-w-[calc(100%-1.75rem)]">
              <div
                className="h-full bg-cyan-600 transition-all duration-500 rounded-full"
                style={{ width: `${Math.min((overallProgress / 80) * 100, 100)}%` }}
              />
            </div>
          </div>

          {/* Stage 2: 80% - 100% */}
          <div
            className={`p-3 rounded-xl border transition-all ${
              isLlmPhase
                ? "bg-cyan-50/70 border-cyan-200 shadow-2xs"
                : isValuationCalibrated
                ? "bg-emerald-50/40 border-emerald-200/90"
                : "bg-zinc-50/80 border-zinc-200/80"
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-md bg-white border border-zinc-200 text-zinc-700 text-[10px] font-mono font-bold flex items-center justify-center shadow-2xs">
                  2
                </span>
                <span className="text-xs font-semibold text-zinc-900">
                  SignCollab Profile LLM Engine (80% – 100%)
                </span>
              </div>
              <span
                className={`text-[10px] font-mono ${
                  isValuationCalibrated
                    ? "text-emerald-700 font-semibold"
                    : isLlmPhase
                    ? "text-cyan-700 animate-pulse font-semibold"
                    : "text-zinc-400"
                }`}
              >
                {isValuationCalibrated
                  ? "Calibrated (100%)"
                  : isLlmPhase
                  ? `${overallProgress}% / 100%`
                  : "Standby (Starts at 80%)"}
              </span>
            </div>
            <p className="text-[11px] text-zinc-600 mt-1 pl-7">
              Synthesizing 19-point creator intelligence dossier &amp; calibrating 16 defended knot valuations.
            </p>
            {/* Stage 2 Mini Progress Bar */}
            <div className="w-full h-1.5 bg-zinc-200 rounded-full overflow-hidden mt-2 ml-7 max-w-[calc(100%-1.75rem)]">
              <div
                className="h-full bg-emerald-600 transition-all duration-500 rounded-full"
                style={{
                  width: `${
                    overallProgress <= 80
                      ? 0
                      : Math.min(((overallProgress - 80) / 20) * 100, 100)
                  }%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Linked Platforms Status Bar */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-zinc-100">
        <div className="flex flex-wrap items-center gap-2">
          {platformList.map((p) => {
            const isReady = p.data.status === "ready";
            const isLoading = p.data.status === "loading";

            return (
              <div
                key={p.key}
                onClick={!isReady ? onOpenMissingModal : undefined}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs transition-all ${
                  !isReady ? "cursor-pointer hover:bg-zinc-100" : ""
                } ${
                  isReady
                    ? "bg-white border-emerald-300 text-zinc-900 shadow-2xs"
                    : isLoading
                    ? "bg-cyan-50/70 border-cyan-300 text-cyan-900 animate-pulse"
                    : "bg-zinc-50 border-zinc-200 text-zinc-400"
                }`}
              >
                {p.icon}
                <span className="font-semibold text-zinc-900">{p.name}</span>
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    isReady
                      ? "bg-emerald-500 shadow-[0_0_4px_#10b981]"
                      : isLoading
                      ? "bg-cyan-500 animate-ping"
                      : "bg-zinc-300"
                  }`}
                />
                <span className="font-mono text-[11px] text-zinc-500">
                  {isReady
                    ? `@${p.data.username?.replace(/^@/, "")} (${formatShortNumber(p.data.followerCount)})`
                    : isLoading
                    ? "Auditing..."
                    : "Standby"}
                </span>
              </div>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          {verifiedChannelsCount < 3 && (
            <button
              type="button"
              onClick={onOpenMissingModal}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white hover:bg-zinc-50 border border-zinc-300 text-zinc-800 text-xs font-semibold transition-all cursor-pointer shadow-2xs"
            >
              <span>+ Link Missing Platform</span>
            </button>
          )}

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-100 border border-zinc-200 text-xs font-mono text-zinc-700">
            <span
              className={`w-2 h-2 rounded-full ${
                verifiedChannelsCount === 3
                  ? "bg-emerald-500"
                  : verifiedChannelsCount > 0
                  ? "bg-cyan-500"
                  : "bg-zinc-400"
              }`}
            />
            <span className="font-bold text-zinc-900">{verifiedChannelsCount}/3 Linked</span>
          </div>
        </div>
      </div>

      {/* Animated Live Step Ticker Capsule (Light Theme) */}
      <div className="relative z-10 w-full bg-zinc-50 text-zinc-900 rounded-xl border border-zinc-200/90 px-4 py-3 flex items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <span className="relative flex h-2.5 w-2.5 shrink-0">
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                isValuationCalibrated ? "bg-emerald-400" : "bg-cyan-400"
              }`}
            />
            <span
              className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                isValuationCalibrated ? "bg-emerald-600" : "bg-cyan-600"
              }`}
            />
          </span>
          <div className="font-mono text-xs truncate flex items-center gap-2">
            <span className="text-zinc-400 uppercase font-semibold text-[10px] tracking-wider shrink-0">
              LIVE STEP:
            </span>
            <span className={isValuationCalibrated ? "text-emerald-700 font-semibold" : "text-cyan-800 font-semibold"}>
              {activeTickerText}
            </span>
          </div>
        </div>

        <span className="hidden sm:inline-flex px-2 py-0.5 rounded-md bg-white text-[10px] font-mono text-zinc-600 border border-zinc-200/80 shadow-2xs shrink-0">
          {overallProgress < 80 ? "0–80% Analysis" : overallProgress < 100 ? "80–100% SignCollab LLM" : "Verified 100%"}
        </span>
      </div>
    </div>
  );
}
