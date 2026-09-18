"use client";

import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { PlatformRateCard, PlatformDataState } from "./PlatformRateCard";
import { OmnichannelBundleCard } from "./OmnichannelBundleCard";
import { Platform, RegionCode, DeliverableFormat } from "@/lib/calculator/types";
import { FORMAT_LABELS } from "@/lib/calculator/constants";
import { useRouter } from "next/navigation";
import { CreatorAIClassification, MultiPlatformCreatorInput } from "@/lib/ai/gemini";
import {
  Users,
  Film,
  Handshake,
  Star,
  MapPin,
  RefreshCw,
  CheckCircle2,
  Video,
  Camera,
  Music2,
  Sparkles,
  Loader2,
} from "lucide-react";

interface MultiPlatformCalculatorGridProps {
  initialPlatform?: Platform;
  initialCreator?: {
    username: string;
    displayName: string;
    avatarUrl?: string;
    followerCount: number;
    avgLikes: number;
    avgComments: number;
    avgViews: number;
    platform: Platform;
    externalLinks?: Array<{ platform: string; url: string }>;
  };
  initialRateCardItems?: Array<{
    format: DeliverableFormat;
    amount: number;
    formattedAmount: string;
    lowAmount: number;
    formattedLow: string;
    highAmount: number;
    formattedHigh: string;
    currency: string;
  }>;
  primaryNicheId?: number;
  regionCode?: RegionCode;
}

export function MultiPlatformCalculatorGrid({
  initialPlatform = "instagram",
  initialCreator,
  initialRateCardItems,
  primaryNicheId = 8,
  regionCode = "US",
}: MultiPlatformCalculatorGridProps) {
  const router = useRouter();

  // In-flight tracker ref to prevent duplicate scrapes across cascading triggers
  const inFlightScrapes = useRef<Set<string>>(new Set());

  // 3-Platform State Management
  const [platformStates, setPlatformStates] = useState<{
    instagram: PlatformDataState;
    youtube: PlatformDataState;
    tiktok: PlatformDataState;
  }>({
    instagram: { status: "idle" },
    youtube: { status: "idle" },
    tiktok: { status: "idle" },
  });

  // Cross-Platform Unified AI Intelligence State
  const [aiSynthesis, setAiSynthesis] = useState<CreatorAIClassification | null>(null);
  const [completeIntelligence, setCompleteIntelligence] = useState<import("@/lib/ai/types").CompleteCreatorIntelligence | null>(null);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const synthesizedPlatformsHash = useRef<string>("");

  // Count active in-flight scrapes (to enforce zero-interruption while cascading)
  const isAnyScrapeInFlight = useMemo(() => {
    return (
      platformStates.instagram.status === "loading" ||
      platformStates.youtube.status === "loading" ||
      platformStates.tiktok.status === "loading"
    );
  }, [platformStates]);

  const readyPlatformsCount = useMemo(() => {
    let count = 0;
    if (platformStates.instagram.status === "ready") count++;
    if (platformStates.youtube.status === "ready") count++;
    if (platformStates.tiktok.status === "ready") count++;
    return count;
  }, [platformStates]);

  // Unified Omnichannel AI Synthesis Function
  const triggerOmnichannelSynthesis = useCallback(async (bypassCache = false) => {
    const readyList: Platform[] = [];
    if (platformStates.youtube.status === "ready") readyList.push("youtube");
    if (platformStates.instagram.status === "ready") readyList.push("instagram");
    if (platformStates.tiktok.status === "ready") readyList.push("tiktok");

    if (readyList.length === 0) return;

    const currentHash = readyList.map((p) => `${p}:${platformStates[p].username || ""}`).sort().join("|");
    if (currentHash === synthesizedPlatformsHash.current && !bypassCache) return;

    setIsSynthesizing(true);

    try {
      const multiInput: MultiPlatformCreatorInput = {
        creatorName:
          platformStates.youtube.displayName ||
          platformStates.instagram.displayName ||
          platformStates.tiktok.displayName ||
          platformStates.youtube.username ||
          platformStates.instagram.username ||
          platformStates.tiktok.username ||
          "Creator",
        primaryPlatform: readyList[0],
        reportedCountry: regionCode,
      };

      if (platformStates.youtube.status === "ready") {
        multiInput.youtube = {
          handle: platformStates.youtube.username,
          title: platformStates.youtube.displayName,
          subscriberCount: platformStates.youtube.followerCount,
          avgViews: platformStates.youtube.avgViews,
          observedEr: platformStates.youtube.engagementRate,
        };
      }

      if (platformStates.instagram.status === "ready") {
        multiInput.instagram = {
          username: platformStates.instagram.username || "",
          fullName: platformStates.instagram.displayName,
          followerCount: platformStates.instagram.followerCount,
          avgLikes: platformStates.instagram.avgLikes,
          observedEr: platformStates.instagram.engagementRate,
        };
      }

      if (platformStates.tiktok.status === "ready") {
        multiInput.tiktok = {
          username: platformStates.tiktok.username || "",
          nickname: platformStates.tiktok.displayName,
          followerCount: platformStates.tiktok.followerCount,
          avgViews: platformStates.tiktok.avgViews,
          observedEr: platformStates.tiktok.engagementRate,
        };
      }

      const res = await fetch("/api/calculator/synthesize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ multiInput, regionCode, bypassCache }),
      });

      const json = await res.json();
      if (json.success) {
        if (json.aiEnrichment) setAiSynthesis(json.aiEnrichment);
        if (json.intelligence) setCompleteIntelligence(json.intelligence);
        synthesizedPlatformsHash.current = currentHash;
      }
    } catch (e) {
      console.warn("[Omnichannel Synthesis Warning]:", e);
    } finally {
      setIsSynthesizing(false);
    }
  }, [platformStates, regionCode]);

  // Trigger synthesis automatically once all active in-flight scrapes settle
  useEffect(() => {
    if (!isAnyScrapeInFlight && readyPlatformsCount > 0) {
      const timer = setTimeout(() => {
        triggerOmnichannelSynthesis();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isAnyScrapeInFlight, readyPlatformsCount, triggerOmnichannelSynthesis]);

  // Helper to trigger single platform scrape progressively with cascading discovery
  const scrapeSinglePlatform = useCallback(
    async (
      targetInput: string,
      targetPlatform: Platform,
      customStatusMessage?: string
    ) => {
      const scrapeKey = `${targetPlatform}:${targetInput.toLowerCase().trim()}`;
      if (inFlightScrapes.current.has(scrapeKey)) return;
      inFlightScrapes.current.add(scrapeKey);

      setPlatformStates((prev) => ({
        ...prev,
        [targetPlatform]: {
          ...prev[targetPlatform],
          status: "loading",
          statusMessage: customStatusMessage || `Connecting to ${targetPlatform} live metrics...`,
        },
      }));

      try {
        const isInstagram = targetPlatform === "instagram";

        // 1. Stage 1 Fetch (fastMode for Instagram to return Process 1 in ~2s)
        const res = await fetch("/api/calculator/import", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            input: targetInput,
            requestedPlatform: targetPlatform,
            regionCode,
            fastMode: isInstagram,
          }),
        });

        const data = await res.json();
        if (!res.ok || !data.success || !data.creator) {
          throw new Error(data.error || `Failed to fetch ${targetPlatform} profile.`);
        }

        const creator = data.creator;
        const rateCards = data.rateCardItems || [];
        const er = data.calculationResult?.metrics?.observedER;

        setPlatformStates((prev) => ({
          ...prev,
          [targetPlatform]: {
            status: "ready",
            username: creator.username,
            displayName: creator.displayName,
            avatarUrl: creator.avatarUrl,
            followerCount: creator.followerCount,
            avgLikes: creator.avgLikes,
            avgComments: creator.avgComments,
            avgViews: creator.avgViews,
            engagementRate: er,
            rateCardItems: rateCards,
          },
        }));

        // Cascading Discovery: Check if this newly resolved platform reveals other linked platforms!
        if (Array.isArray(creator.externalLinks)) {
          for (const link of creator.externalLinks) {
            const discoveredPlatform = link.platform as Platform;
            if (
              (discoveredPlatform === "instagram" ||
                discoveredPlatform === "youtube" ||
                discoveredPlatform === "tiktok") &&
              link.url
            ) {
              setPlatformStates((current) => {
                // Only trigger if not already loaded or currently loading
                if (
                  current[discoveredPlatform].status === "idle" ||
                  current[discoveredPlatform].status === "not_found"
                ) {
                  setTimeout(() => {
                    scrapeSinglePlatform(
                      link.url,
                      discoveredPlatform,
                      `Discovered via @${creator.username}'s bio! Syncing metrics...`
                    );
                  }, 150);
                }
                return current;
              });
            }
          }
        }

        // 2. Stage 2 Background Enrichment for Instagram
        if (isInstagram) {
          fetch("/api/calculator/import", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              input: targetInput,
              requestedPlatform: "instagram",
              regionCode,
              fastMode: false,
            }),
          })
            .then((r) => r.json())
            .then((fullData) => {
              if (fullData.success && fullData.creator) {
                const fullCreator = fullData.creator;
                const fullRateCards = fullData.rateCardItems || [];
                const fullEr = fullData.calculationResult?.metrics?.observedER;

                setPlatformStates((prev) => ({
                  ...prev,
                  instagram: {
                    ...prev.instagram,
                    status: "ready",
                    followerCount: fullCreator.followerCount,
                    avgLikes: fullCreator.avgLikes,
                    avgComments: fullCreator.avgComments,
                    avgViews: fullCreator.avgViews,
                    engagementRate: fullEr,
                    rateCardItems: fullRateCards,
                  },
                }));
              }
            })
            .catch((e) => {
              console.warn("Background Instagram Process 2 enrichment failed:", e);
            });
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Error fetching platform.";
        setPlatformStates((prev) => ({
          ...prev,
          [targetPlatform]: {
            status: "error",
            error: msg,
          },
        }));
      } finally {
        inFlightScrapes.current.delete(scrapeKey);
      }
    },
    [regionCode]
  );

  // Initial load hydration when initialCreator arrives from parent
  useEffect(() => {
    if (!initialCreator) return;

    const primaryPlat = initialCreator.platform || initialPlatform;
    setPlatformStates((prev) => ({
      ...prev,
      [primaryPlat]: {
        status: "ready",
        username: initialCreator.username,
        displayName: initialCreator.displayName,
        avatarUrl: initialCreator.avatarUrl,
        followerCount: initialCreator.followerCount,
        avgLikes: initialCreator.avgLikes,
        avgComments: initialCreator.avgComments,
        avgViews: initialCreator.avgViews,
        rateCardItems: initialRateCardItems,
      },
    }));

    // Trigger cascading parallel discovery for any discovered accounts in bio
    if (Array.isArray(initialCreator.externalLinks) && initialCreator.externalLinks.length > 0) {
      for (const link of initialCreator.externalLinks) {
        const discoveredPlatform = link.platform as Platform;
        if (
          discoveredPlatform &&
          discoveredPlatform !== primaryPlat &&
          (discoveredPlatform === "instagram" ||
            discoveredPlatform === "youtube" ||
            discoveredPlatform === "tiktok") &&
          link.url
        ) {
          scrapeSinglePlatform(
            link.url,
            discoveredPlatform,
            `Discovered via @${initialCreator.username}'s bio! Syncing metrics...`
          );
        }
      }
    }
  }, [initialCreator, initialPlatform, initialRateCardItems, scrapeSinglePlatform]);

  const handleDeliverableContract = (platform: Platform, format: DeliverableFormat, amount: number) => {
    const label = FORMAT_LABELS[format]?.label || format;
    const deliverablesData = [
      {
        type: format.toUpperCase(),
        quantity: 1,
        duration: "12 Months",
        notes: label,
      },
    ];

    const queryParams = new URLSearchParams({
      from: "calculator",
      platform: platform.toUpperCase(),
      amount: amount.toString(),
      currency: "USD",
      region: regionCode,
      deliverables: JSON.stringify(deliverablesData),
      usageScope: "organic_repost",
      usageDuration: "30_days",
    });

    router.push(`/instant?${queryParams.toString()}`);
  };

  return (
    <div className="space-y-5">
      {/* 360° Omnichannel AI Readiness & Discovery Header */}
      <div className="bg-gradient-to-r from-gray-900 via-gray-950 to-black rounded-3xl p-5 sm:p-6 text-white shadow-md border border-gray-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/30 px-2 py-0.5 rounded-md">
                360° Omnichannel Valuation Matrix
              </span>
              {isAnyScrapeInFlight ? (
                <span className="text-xs text-amber-400 font-semibold flex items-center gap-1.5 animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  Auto-Discovering Linked Accounts...
                </span>
              ) : isSynthesizing ? (
                <span className="text-xs text-cyan-400 font-semibold flex items-center gap-1.5 animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-cyan-400" />
                  Gemini 3.7 Flash Synthesizing Omnichannel Dossier...
                </span>
              ) : (
                <span className="text-xs text-emerald-400 font-medium flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{readyPlatformsCount} Platform{readyPlatformsCount !== 1 ? "s" : ""} Synced</span>
                </span>
              )}
            </div>
            <h2 className="text-base sm:text-lg font-semibold tracking-tight text-white mt-1">
              Cross-Platform Rate Cards &amp; Omnichannel Packages
            </h2>
          </div>

          {/* Platform Connection Status Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: "youtube", label: "YouTube", state: platformStates.youtube, icon: Video },
              { id: "instagram", label: "Instagram", state: platformStates.instagram, icon: Camera },
              { id: "tiktok", label: "TikTok", state: platformStates.tiktok, icon: Music2 },
            ].map((p) => {
              const isReady = p.state.status === "ready";
              const isLoading = p.state.status === "loading";
              const IconComp = p.icon;

              return (
                <div
                  key={p.id}
                  className={`px-2.5 py-1 rounded-xl text-xs font-medium flex items-center gap-1.5 border transition-all ${
                    isReady
                      ? "bg-emerald-950/70 border-emerald-500/40 text-emerald-300 shadow-2xs"
                      : isLoading
                      ? "bg-amber-950/70 border-amber-500/40 text-amber-300 animate-pulse"
                      : "bg-zinc-900/80 border-zinc-800 text-zinc-400"
                  }`}
                >
                  <IconComp className="w-3.5 h-3.5" />
                  <span>{p.label}</span>
                  <span className="text-[10px]">
                    {isReady ? (
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    ) : isLoading ? (
                      <Loader2 className="w-3 h-3 animate-spin text-amber-400" />
                    ) : (
                      "—"
                    )}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Complete 19-Point Creator Intelligence Dossier (When Generated) */}
        {completeIntelligence ? (
          <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-xs space-y-4 animate-fadeIn">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/10">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 font-semibold text-xs border border-emerald-500/30">
                  {completeIntelligence.profile.creatorType}
                </span>
                <span className="font-semibold text-white bg-white/10 px-2.5 py-1 rounded-lg text-xs">
                  {completeIntelligence.profile.primaryNiche.name}
                </span>
                {completeIntelligence.profile.subNiche && (
                  <span className="font-medium text-zinc-300 bg-white/5 px-2.5 py-1 rounded-lg text-xs border border-white/5">
                    {completeIntelligence.profile.subNiche.name}
                  </span>
                )}
                {completeIntelligence.geography?.countryCode && (
                  <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/10 text-white font-medium text-xs">
                    <MapPin className="w-3 h-3 text-emerald-400" />
                    <span>{completeIntelligence.geography.countryName || completeIntelligence.geography.countryCode} {completeIntelligence.geography.city ? `(${completeIntelligence.geography.city})` : ""}</span>
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={() => triggerOmnichannelSynthesis(true)}
                disabled={isSynthesizing}
                className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-zinc-300 hover:text-white text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isSynthesizing ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin text-zinc-300" />
                    <span>Refreshing...</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-3 h-3 text-zinc-300" />
                    <span>Refresh AI</span>
                  </>
                )}
              </button>
            </div>

            {/* AI Summaries */}
            <div className="space-y-1.5">
              <p className="text-white font-medium text-xs sm:text-sm leading-relaxed">
                &ldquo;{completeIntelligence.summary?.brandSummary || completeIntelligence.summary?.oneLine}&rdquo;
              </p>
              {completeIntelligence.summary?.detailedSummary && (
                <p className="text-zinc-400 text-xs leading-relaxed line-clamp-2">
                  {completeIntelligence.summary.detailedSummary}
                </p>
              )}
            </div>

            {/* 4-Pillar Intelligence Sub-Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              {/* Pillar 1: Inferred Audience */}
              <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-rose-300 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-rose-300" />
                  <span>Inferred Audience</span>
                </div>
                <div className="space-y-1 text-zinc-300 text-[11px]">
                  <div className="flex justify-between"><span className="text-zinc-400">Demographic:</span> <span className="font-semibold text-white">{completeIntelligence.audience.genderSkew || "Balanced"}, {completeIntelligence.audience.likelyAgeRange}</span></div>
                  <div className="flex justify-between"><span className="text-zinc-400">Buyer Intent:</span> <span className="font-semibold text-emerald-400">{completeIntelligence.audience.purchaseIntent || "Moderate"}</span></div>
                  <div className="flex justify-between"><span className="text-zinc-400">Primary Market:</span> <span className="font-semibold text-white">{completeIntelligence.audience.primaryMarket && completeIntelligence.audience.primaryMarket.toLowerCase() !== "global" ? completeIntelligence.audience.primaryMarket : (completeIntelligence.geography?.countryName && completeIntelligence.geography.countryName.toLowerCase() !== "global" ? completeIntelligence.geography.countryName : "United States")}</span></div>
                  {completeIntelligence.audience.secondaryMarkets && completeIntelligence.audience.secondaryMarkets.length > 0 && (
                    <div className="flex justify-between gap-1 text-[10px]"><span className="text-zinc-400 shrink-0">Secondary Markets:</span> <span className="font-medium text-zinc-300 text-right">{completeIntelligence.audience.secondaryMarkets.join(", ")}</span></div>
                  )}
                </div>
                {completeIntelligence.audience.interests?.length > 0 && (
                  <div className="text-[10px] text-zinc-400 pt-1 line-clamp-1">
                    Interests: {completeIntelligence.audience.interests.slice(0, 3).join(", ")}
                  </div>
                )}
              </div>

              {/* Pillar 2: Content DNA & Themes */}
              <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                  <Film className="w-3.5 h-3.5 text-amber-300" />
                  <span>Content DNA</span>
                </div>
                <div className="space-y-1 text-zinc-300 text-[11px]">
                  <div className="flex justify-between"><span className="text-zinc-400">Primary Format:</span> <span className="font-semibold text-white">{completeIntelligence.content.dominantFormat || "Video"}</span></div>
                  <div className="flex justify-between"><span className="text-zinc-400">Production:</span> <span className="font-semibold text-white">{completeIntelligence.content.productionLevel || "High"}</span></div>
                  <div className="flex justify-between"><span className="text-zinc-400">Consistency:</span> <span className="font-semibold text-white">{completeIntelligence.content.contentConsistency || "High"}</span></div>
                </div>
                {completeIntelligence.contentThemes?.length > 0 && (
                  <div className="text-[10px] text-zinc-400 pt-1 line-clamp-1">
                    Themes: {completeIntelligence.contentThemes.slice(0, 3).map((t) => t.theme).join(", ")}
                  </div>
                )}
              </div>

              {/* Pillar 3: Commercial & Brand Fit */}
              <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-cyan-300 flex items-center gap-1.5">
                  <Handshake className="w-3.5 h-3.5 text-cyan-300" />
                  <span>Brand Fit</span>
                </div>
                <div className="space-y-1 text-zinc-300 text-[11px]">
                  <div className="flex justify-between"><span className="text-zinc-400">Commercial Intent:</span> <span className="font-semibold text-white">{completeIntelligence.commercialIntelligence.commercialIntent || "High"}</span></div>
                  <div className="flex justify-between"><span className="text-zinc-400">Suitability:</span> <span className="font-semibold text-emerald-400">{completeIntelligence.brandFit.brandSuitability || "High"}</span></div>
                </div>
                {completeIntelligence.brandFit.bestFitCategories?.length > 0 && (
                  <div className="text-[10px] text-zinc-400 pt-1 line-clamp-1">
                    Categories: {completeIntelligence.brandFit.bestFitCategories.slice(0, 3).join(", ")}
                  </div>
                )}
              </div>

              {/* Pillar 4: Top Strengths */}
              <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-emerald-300 flex items-center gap-1.5">
                  <Star className="w-3.5 h-3.5 text-emerald-300" />
                  <span>Key Strengths</span>
                </div>
                <div className="space-y-1 text-zinc-300 text-[11px]">
                  {completeIntelligence.strengths?.slice(0, 2).map((s, i) => (
                    <div key={i} className="line-clamp-1">
                      <span className="font-semibold text-white">• {s.area}:</span> <span className="text-zinc-400">{s.description}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : aiSynthesis ? (
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs space-y-2 text-xs">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="font-medium text-zinc-300">Omnichannel Niche:</span>
                <span className="font-semibold text-white bg-white/10 px-2.5 py-0.5 rounded-lg">
                  {aiSynthesis.primaryNiche.name}
                </span>
                {aiSynthesis.detectedCountry && (
                  <span className="font-medium text-zinc-400 uppercase tracking-wider bg-zinc-800 px-2 py-0.5 rounded-md flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-zinc-400" />
                    <span>{aiSynthesis.detectedCountry}</span>
                  </span>
                )}
              </div>
              <span className="text-[11px] text-zinc-400 font-medium">
                Synthesized across {readyPlatformsCount} verified platform{readyPlatformsCount !== 1 ? "s" : ""}
              </span>
            </div>
            {aiSynthesis.creatorSummary && (
              <p className="text-zinc-300 leading-relaxed text-[11px] sm:text-xs">
                &ldquo;{aiSynthesis.creatorSummary}&rdquo;
              </p>
            )}
          </div>
        ) : null}
      </div>

      {/* 4-Card Responsive Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 items-stretch">
        {/* Card 1: Instagram */}
        <PlatformRateCard
          platform="instagram"
          data={platformStates.instagram}
          onManualSearch={(handle) => scrapeSinglePlatform(handle, "instagram")}
          onSelectDeliverableForContract={(fmt, amt) => handleDeliverableContract("instagram", fmt, amt)}
        />

        {/* Card 2: TikTok */}
        <PlatformRateCard
          platform="tiktok"
          data={platformStates.tiktok}
          onManualSearch={(handle) => scrapeSinglePlatform(handle, "tiktok")}
          onSelectDeliverableForContract={(fmt, amt) => handleDeliverableContract("tiktok", fmt, amt)}
        />

        {/* Card 3: YouTube */}
        <PlatformRateCard
          platform="youtube"
          data={platformStates.youtube}
          onManualSearch={(handle) => scrapeSinglePlatform(handle, "youtube")}
          onSelectDeliverableForContract={(fmt, amt) => handleDeliverableContract("youtube", fmt, amt)}
        />

        {/* Card 4: Omnichannel Bundle */}
        <OmnichannelBundleCard
          platforms={platformStates}
          primaryNicheId={aiSynthesis?.primaryNiche.id || primaryNicheId}
          regionCode={regionCode}
        />
      </div>
    </div>
  );
}

