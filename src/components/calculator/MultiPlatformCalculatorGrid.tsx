"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { PlatformRateCard, PlatformDataState } from "./PlatformRateCard";
import { OmnichannelBundleCard } from "./OmnichannelBundleCard";
import { Platform, RegionCode, DeliverableFormat } from "@/lib/calculator/types";
import { useRouter } from "next/navigation";
import { FORMAT_LABELS } from "@/lib/calculator/constants";

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

  // Helper to trigger single platform scrape progressively
  const scrapeSinglePlatform = useCallback(async (
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
      const res = await fetch("/api/calculator/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          input: targetInput,
          requestedPlatform: targetPlatform,
          regionCode,
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

      // Cascade discovery: check if this newly resolved platform reveals other linked platforms!
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
              if (current[discoveredPlatform].status === "idle" || current[discoveredPlatform].status === "not_found") {
                // Launch progressive parallel fetch for discovered platform
                setTimeout(() => {
                  scrapeSinglePlatform(
                    link.url,
                    discoveredPlatform,
                    `Discovered via @${creator.username}'s bio! Syncing metrics...`
                  );
                }, 100);
              }
              return current;
            });
          }
        }
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
  }, [regionCode]);

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

    // Trigger progressive parallel scraping for any discovered accounts in bio
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
    <div className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <div>
          <h2 className="text-base font-black text-gray-950 uppercase tracking-tight">
            Omnichannel Valuation Matrix
          </h2>
          <p className="text-xs text-gray-500 font-medium">
            Progressive multi-platform rate cards &amp; cross-channel bundle packages
          </p>
        </div>
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
          primaryNicheId={primaryNicheId}
          regionCode={regionCode}
        />
      </div>
    </div>
  );
}
