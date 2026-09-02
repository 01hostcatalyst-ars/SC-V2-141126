"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { PlatformDataState } from "./PlatformRateCard";
import { calculateInfluencerRate } from "@/lib/calculator/engine";
import { PricingInput, DeliverableItem, RegionCode } from "@/lib/calculator/types";
import { FORMAT_LABELS, REGIONAL_CONFIG } from "@/lib/calculator/constants";

interface OmnichannelBundleCardProps {
  platforms: {
    instagram: PlatformDataState;
    youtube: PlatformDataState;
    tiktok: PlatformDataState;
  };
  primaryNicheId?: number;
  regionCode?: RegionCode;
}

export function OmnichannelBundleCard({
  platforms,
  primaryNicheId = 8, // Lifestyle default
  regionCode = "US",
}: OmnichannelBundleCardProps) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);

  const readyPlatforms = useMemo(() => {
    const list: Array<{ platform: "instagram" | "youtube" | "tiktok"; data: PlatformDataState }> = [];
    if (platforms.instagram.status === "ready") list.push({ platform: "instagram", data: platforms.instagram });
    if (platforms.youtube.status === "ready") list.push({ platform: "youtube", data: platforms.youtube });
    if (platforms.tiktok.status === "ready") list.push({ platform: "tiktok", data: platforms.tiktok });
    return list;
  }, [platforms]);

  const hasMultiplePlatforms = readyPlatforms.length >= 2;

  // 1. Calculate Starter Combo (e.g. 1x Reel + 1x TikTok or 1x YT Short)
  // Per spec: each deliverable uses its OWN platform's native metrics (Steps 1-4)
  const starterCombo = useMemo(() => {
    if (!hasMultiplePlatforms) return null;

    const deliverables: DeliverableItem[] = [];
    if (platforms.instagram.status === "ready") {
      deliverables.push({ id: "starter_1", platform: "instagram", format: "ig_reel", quantity: 1 });
    }
    if (platforms.tiktok.status === "ready") {
      deliverables.push({ id: "starter_2", platform: "tiktok", format: "tiktok_video", quantity: 1 });
    } else if (platforms.youtube.status === "ready") {
      deliverables.push({ id: "starter_2", platform: "youtube", format: "yt_short", quantity: 1 });
    }

    if (deliverables.length < 2) return null;

    // Calculate each deliverable individually using its own platform's native metrics
    let grossTotalUSD = 0;
    for (const item of deliverables) {
      const platData = platforms[item.platform];
      const singleInput: PricingInput = {
        creator: {
          followerCount: platData.followerCount || 25000,
          last3PostsAvgLikes: platData.avgLikes || 500,
          last3PostsAvgComments: platData.avgComments || 25,
          last3PostsAvgViews: platData.avgViews,
          primaryPlatform: item.platform,
          primaryNicheId,
          regionCode,
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

    // Step 6: Starter Combo uses organic_repost/30_days = 0% surcharge
    const totalUSD = netContentFeeUSD;

    // Step 8: PPP & FX localization
    const regConfig = REGIONAL_CONFIG[regionCode] || REGIONAL_CONFIG["US"];
    const localizedMedian = totalUSD * regConfig.pppIndex * regConfig.fxRateToUSD;

    // Step 9: Defended Negotiation Bounds
    const lowP25 = Math.round(localizedMedian * 0.80);
    const typicalMedian = Math.round(localizedMedian);
    const highP75 = Math.round(localizedMedian * 1.25);

    const savingsLocalized = Math.round(bundleDiscountAmountUSD * regConfig.pppIndex * regConfig.fxRateToUSD);

    return {
      title: "Cross-Platform Starter Combo",
      subtitle: `${deliverables.map((d) => FORMAT_LABELS[d.format]?.tag || d.format).join(" + ")}`,
      deliverables,
      formattedTypical: `${regConfig.symbol}${typicalMedian.toLocaleString()}`,
      formattedLow: `${regConfig.symbol}${lowP25.toLocaleString()}`,
      formattedHigh: `${regConfig.symbol}${highP75.toLocaleString()}`,
      savingsFormatted: `${regConfig.currency} ${savingsLocalized.toLocaleString()}`,
      typicalMedian,
      currency: regConfig.currency,
    };
  }, [hasMultiplePlatforms, readyPlatforms, platforms, primaryNicheId, regionCode]);

  // 2. Calculate Full Omnichannel Authority Pack (All available ready platforms)
  // Per spec: each deliverable uses its OWN platform's native metrics (Steps 1-4)
  const authorityPack = useMemo(() => {
    if (!hasMultiplePlatforms) return null;

    const deliverables: DeliverableItem[] = [];
    if (platforms.youtube.status === "ready") {
      deliverables.push({ id: "auth_1", platform: "youtube", format: "yt_dedicated", quantity: 1 });
    }
    if (platforms.instagram.status === "ready") {
      deliverables.push({ id: "auth_2", platform: "instagram", format: "ig_reel", quantity: 1 });
    }
    if (platforms.tiktok.status === "ready") {
      deliverables.push({ id: "auth_3", platform: "tiktok", format: "tiktok_video", quantity: 1 });
    }
    if (platforms.instagram.status === "ready" && deliverables.length < 3) {
      deliverables.push({ id: "auth_4", platform: "instagram", format: "ig_carousel", quantity: 1 });
    }

    // Calculate each deliverable individually using its own platform's native metrics
    let grossTotalUSD = 0;
    for (const item of deliverables) {
      const platData = platforms[item.platform];
      const singleInput: PricingInput = {
        creator: {
          followerCount: platData.followerCount || 25000,
          last3PostsAvgLikes: platData.avgLikes || 500,
          last3PostsAvgComments: platData.avgComments || 25,
          last3PostsAvgViews: platData.avgViews,
          primaryPlatform: item.platform,
          primaryNicheId,
          regionCode,
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

    // Step 6: Authority Pack uses paid_partnership_ads/30_days = +25% surcharge
    const usagePercent = 0.25;
    const commercialRightsFeeUSD = netContentFeeUSD * usagePercent;
    const totalUSD = netContentFeeUSD + commercialRightsFeeUSD;

    // Step 8: PPP & FX localization
    const regConfig = REGIONAL_CONFIG[regionCode] || REGIONAL_CONFIG["US"];
    const localizedMedian = totalUSD * regConfig.pppIndex * regConfig.fxRateToUSD;

    // Step 9: Defended Negotiation Bounds
    const lowP25 = Math.round(localizedMedian * 0.80);
    const typicalMedian = Math.round(localizedMedian);
    const highP75 = Math.round(localizedMedian * 1.25);

    const savingsLocalized = Math.round(bundleDiscountAmountUSD * regConfig.pppIndex * regConfig.fxRateToUSD);

    return {
      title: "Omnichannel 360 Authority Pack",
      subtitle: `${deliverables.map((d) => FORMAT_LABELS[d.format]?.tag || d.format).join(" + ")}`,
      deliverables,
      formattedTypical: `${regConfig.symbol}${typicalMedian.toLocaleString()}`,
      formattedLow: `${regConfig.symbol}${lowP25.toLocaleString()}`,
      formattedHigh: `${regConfig.symbol}${highP75.toLocaleString()}`,
      savingsFormatted: `${regConfig.currency} ${savingsLocalized.toLocaleString()}`,
      typicalMedian,
      currency: regConfig.currency,
    };
  }, [hasMultiplePlatforms, readyPlatforms, platforms, primaryNicheId, regionCode]);

  const handleExportContract = (pack: typeof starterCombo) => {
    if (!pack) return;

    const deliverablesData = pack.deliverables.map((d) => ({
      type: d.format.toUpperCase(),
      quantity: d.quantity,
      duration: "12 Months",
      notes: `${FORMAT_LABELS[d.format]?.label || d.format} (Omnichannel Bundle)`,
    }));

    const queryParams = new URLSearchParams({
      from: "calculator",
      platform: "MULTI_PLATFORM",
      amount: pack.typicalMedian.toString(),
      currency: pack.currency,
      region: regionCode,
      deliverables: JSON.stringify(deliverablesData),
      usageScope: "paid_partnership_ads",
      usageDuration: "30_days",
    });

    router.push(`/instant?${queryParams.toString()}`);
  };

  const handleCopyBundles = () => {
    if (!starterCombo && !authorityPack) return;
    const lines = [
      `--- OMNICHANNEL MULTI-PLATFORM PACKAGES ---`,
      starterCombo
        ? `🔥 ${starterCombo.title} (${starterCombo.subtitle})\n• Valuation: ${starterCombo.formattedTypical} (Save ${starterCombo.savingsFormatted})\n• Range: ${starterCombo.formattedLow} – ${starterCombo.formattedHigh}\n`
        : "",
      authorityPack
        ? `👑 ${authorityPack.title} (${authorityPack.subtitle})\n• Valuation: ${authorityPack.formattedTypical} (Save ${authorityPack.savingsFormatted})\n• Range: ${authorityPack.formattedLow} – ${authorityPack.formattedHigh}\n`
        : "",
      `Calculated via SignCollab 16-Knot Rate Engine (Step 5 Multi-Asset Volume Discount Applied)`,
    ]
      .filter(Boolean)
      .join("\n");

    navigator.clipboard.writeText(lines);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-gradient-to-b from-gray-950 to-gray-900 text-white rounded-3xl border border-gray-800 shadow-xl flex flex-col justify-between overflow-hidden relative">
      {/* Header Banner */}
      <div className="p-5 bg-white/5 border-b border-white/10">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">📦</span>
            <div>
              <h3 className="text-sm font-black text-white tracking-tight">Omnichannel Bundle</h3>
              <p className="text-[11px] text-gray-400 font-medium">Cross-Platform Campaign Deals</p>
            </div>
          </div>
          <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            15% Savings
          </span>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        {!hasMultiplePlatforms ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 text-gray-400 flex items-center justify-center mx-auto text-sm font-bold animate-pulse">
              ⏳
            </div>
            <div>
              <p className="text-xs font-bold text-gray-200">Awaiting Platform Sync</p>
              <p className="text-[11px] text-gray-400 max-w-xs mx-auto">
                {readyPlatforms.length === 1
                  ? "1 platform loaded. Syncing remaining discovered accounts to compute package deals..."
                  : "Search a creator profile to generate dynamic cross-platform bundles."}
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3.5">
            {/* 1. Starter Combo Card */}
            {starterCombo && (
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-all space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="text-xs font-black text-white flex items-center gap-1.5">
                      <span>🔥 {starterCombo.title}</span>
                    </div>
                    <div className="text-[11px] text-emerald-400 font-semibold">{starterCombo.subtitle}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-sm font-black text-white font-mono">{starterCombo.formattedTypical}</div>
                    <div className="text-[10px] text-emerald-400 font-bold">Save {starterCombo.savingsFormatted}</div>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-white/5 text-[10px] text-gray-400">
                  <span>Range: {starterCombo.formattedLow} – {starterCombo.formattedHigh}</span>
                  <button
                    type="button"
                    onClick={() => handleExportContract(starterCombo)}
                    className="text-emerald-400 hover:text-emerald-300 font-bold underline cursor-pointer"
                  >
                    Export Contract →
                  </button>
                </div>
              </div>
            )}

            {/* 2. Omnichannel Authority Pack Card */}
            {authorityPack && (
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-transparent border border-purple-500/30 hover:border-purple-500/50 transition-all space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="text-xs font-black text-white flex items-center gap-1.5">
                      <span>👑 {authorityPack.title}</span>
                    </div>
                    <div className="text-[11px] text-purple-300 font-semibold">{authorityPack.subtitle}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-sm font-black text-white font-mono">{authorityPack.formattedTypical}</div>
                    <div className="text-[10px] text-emerald-400 font-bold">Save {authorityPack.savingsFormatted}</div>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-white/5 text-[10px] text-gray-400">
                  <span>Range: {authorityPack.formattedLow} – {authorityPack.formattedHigh}</span>
                  <button
                    type="button"
                    onClick={() => handleExportContract(authorityPack)}
                    className="text-purple-300 hover:text-purple-200 font-bold underline cursor-pointer"
                  >
                    Export Contract →
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer Action */}
        {hasMultiplePlatforms && (
          <div className="pt-2 border-t border-white/10">
            <button
              type="button"
              onClick={handleCopyBundles}
              className="w-full py-2 px-3 text-xs font-bold rounded-xl bg-white text-gray-950 hover:bg-gray-100 transition-all cursor-pointer shadow-md inline-flex items-center justify-center gap-1.5"
            >
              <svg className="w-3.5 h-3.5 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
              <span>{copied ? "Copied All Packages!" : "Copy Bundle Rate Sheet"}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
