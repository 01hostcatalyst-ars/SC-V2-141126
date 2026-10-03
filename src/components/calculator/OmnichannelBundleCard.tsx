"use client";

import React, { useMemo, useState } from "react";
import { PlatformDataState } from "./PlatformRateCard";
import { calculateInfluencerRate, roundCommercial } from "@/lib/calculator/engine";
import { PricingInput, DeliverableItem, RegionCode } from "@/lib/calculator/types";
import { FORMAT_LABELS, REGIONAL_CONFIG } from "@/lib/calculator/constants";
import {
  Package,
  Flame,
  Crown,
  Clock,
  Copy,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

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

    const totalAssetCount = deliverables.reduce((sum, d) => sum + d.quantity, 0);
    const bundleDiscountPercent = totalAssetCount >= 4 ? 0.15 : totalAssetCount >= 2 ? 0.10 : 0.00;
    const bundleDiscountAmountUSD = grossTotalUSD * bundleDiscountPercent;
    const netContentFeeUSD = grossTotalUSD - bundleDiscountAmountUSD;

    const totalUSD = netContentFeeUSD;
    const regConfig = REGIONAL_CONFIG[regionCode] || REGIONAL_CONFIG["US"];
    const localizedMedian = totalUSD * regConfig.pppIndex * regConfig.fxRateToUSD;

    const lowP25 = roundCommercial(localizedMedian * 0.80);
    const typicalMedian = roundCommercial(localizedMedian);
    const highP75 = roundCommercial(localizedMedian * 1.25);
    const savingsLocalized = roundCommercial(bundleDiscountAmountUSD * regConfig.pppIndex * regConfig.fxRateToUSD);

    return {
      title: "Cross-Platform Starter Combo",
      subtitle: `${deliverables.map((d) => FORMAT_LABELS[d.format]?.tag || d.format).join(" + ")}`,
      deliverables,
      formattedTypical: `${regConfig.symbol}${typicalMedian.toLocaleString()}`,
      typicalRaw: typicalMedian,
      formattedLow: `${regConfig.symbol}${lowP25.toLocaleString()}`,
      formattedHigh: `${regConfig.symbol}${highP75.toLocaleString()}`,
      savingsFormatted: `${regConfig.symbol}${savingsLocalized.toLocaleString()}`,
      currency: regConfig.currency,
    };
  }, [hasMultiplePlatforms, platforms, primaryNicheId, regionCode]);

  // 2. Calculate Authority Pack (Full omnichannel portfolio)
  const authorityPack = useMemo(() => {
    if (!hasMultiplePlatforms || readyPlatforms.length < 2) return null;

    const deliverables: DeliverableItem[] = [];
    if (platforms.youtube.status === "ready") {
      deliverables.push({ id: "auth_1", platform: "youtube", format: "yt_integrated", quantity: 1 });
      deliverables.push({ id: "auth_2", platform: "youtube", format: "yt_short", quantity: 1 });
    }
    if (platforms.instagram.status === "ready") {
      deliverables.push({ id: "auth_3", platform: "instagram", format: "ig_reel", quantity: 1 });
      deliverables.push({ id: "auth_4", platform: "instagram", format: "ig_story", quantity: 1 });
    }
    if (platforms.tiktok.status === "ready") {
      deliverables.push({ id: "auth_5", platform: "tiktok", format: "tiktok_video", quantity: 1 });
    }

    if (deliverables.length < 3) return null;

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
        commercialTerms: { usageRights: { scope: "paid_partnership_ads", duration: "30_days" } },
      };
      const res = calculateInfluencerRate(singleInput);
      grossTotalUSD += res.lineItems.grossTotalUSD;
    }

    const totalAssetCount = deliverables.reduce((sum, d) => sum + d.quantity, 0);
    const bundleDiscountPercent = totalAssetCount >= 4 ? 0.15 : 0.10;
    const bundleDiscountAmountUSD = grossTotalUSD * bundleDiscountPercent;
    const netContentFeeUSD = grossTotalUSD - bundleDiscountAmountUSD;

    const regConfig = REGIONAL_CONFIG[regionCode] || REGIONAL_CONFIG["US"];
    const localizedMedian = netContentFeeUSD * regConfig.pppIndex * regConfig.fxRateToUSD;

    const lowP25 = roundCommercial(localizedMedian * 0.80);
    const typicalMedian = roundCommercial(localizedMedian);
    const highP75 = roundCommercial(localizedMedian * 1.25);
    const savingsLocalized = roundCommercial(bundleDiscountAmountUSD * regConfig.pppIndex * regConfig.fxRateToUSD);

    return {
      title: "360° Omnichannel Authority Pack",
      subtitle: `${deliverables.length} Assets Across ${readyPlatforms.length} Synced Networks`,
      deliverables,
      formattedTypical: `${regConfig.symbol}${typicalMedian.toLocaleString()}`,
      typicalRaw: typicalMedian,
      formattedLow: `${regConfig.symbol}${lowP25.toLocaleString()}`,
      formattedHigh: `${regConfig.symbol}${highP75.toLocaleString()}`,
      savingsFormatted: `${regConfig.symbol}${savingsLocalized.toLocaleString()}`,
      currency: regConfig.currency,
    };
  }, [hasMultiplePlatforms, readyPlatforms, platforms, primaryNicheId, regionCode]);



  const handleCopyBundles = () => {
    if (!starterCombo && !authorityPack) return;
    const lines = [
      `--- OMNICHANNEL MULTI-PLATFORM PACKAGES ---`,
      starterCombo
        ? `[Starter Pack] ${starterCombo.title} (${starterCombo.subtitle})\n• Valuation: ${starterCombo.formattedTypical} (Save ${starterCombo.savingsFormatted})\n• Range: ${starterCombo.formattedLow} – ${starterCombo.formattedHigh}\n`
        : "",
      authorityPack
        ? `[Authority Pack] ${authorityPack.title} (${authorityPack.subtitle})\n• Valuation: ${authorityPack.formattedTypical} (Save ${authorityPack.savingsFormatted})\n• Range: ${authorityPack.formattedLow} – ${authorityPack.formattedHigh}\n`
        : "",
      `Calculated via SignCollab 16-Knot Rate Engine (Multi-Asset Volume Discount Applied)`,
    ]
      .filter(Boolean)
      .join("\n");

    navigator.clipboard.writeText(lines);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-gradient-to-b from-zinc-950 to-zinc-900 text-white rounded-2xl sm:rounded-3xl border border-zinc-800/90 shadow-xl flex flex-col justify-between overflow-hidden relative">
      {/* Header Banner */}
      <div className="p-4 sm:p-5 bg-white/5 border-b border-white/10">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-zinc-300">
              <Package className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-semibold text-white tracking-tight">Omnichannel Bundles</h3>
              <p className="text-[11px] text-zinc-400 font-medium">Cross-Platform Campaign Deals</p>
            </div>
          </div>
          <span className="text-[10px] font-medium uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            15% Savings
          </span>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-4">
        {!hasMultiplePlatforms ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 text-zinc-400 flex items-center justify-center mx-auto text-sm font-semibold animate-pulse">
              <Clock className="w-5 h-5 text-zinc-400" />
            </div>
            <div>
              <p className="text-xs font-semibold text-zinc-200">Awaiting Platform Sync</p>
              <p className="text-[11px] text-zinc-400 max-w-xs mx-auto leading-relaxed mt-1">
                {readyPlatforms.length === 1
                  ? "1 platform loaded. Syncing remaining discovered accounts to compute package deals..."
                  : "Search a creator profile to generate dynamic cross-platform bundles."}
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {/* 1. Starter Combo Card */}
            {starterCombo && (
              <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-all space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                      <Flame className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>{starterCombo.title}</span>
                    </div>
                    <div className="text-[11px] text-emerald-400 font-medium">{starterCombo.subtitle}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-sm font-semibold text-white font-mono">{starterCombo.formattedTypical}</div>
                    <div className="text-[10px] text-emerald-400 font-medium">Save {starterCombo.savingsFormatted}</div>
                  </div>
                </div>
                <div className="pt-1.5 border-t border-white/5 text-[10px] text-zinc-400">
                  <span>Range: {starterCombo.formattedLow} – {starterCombo.formattedHigh}</span>
                </div>
              </div>
            )}

            {/* 2. Omnichannel Authority Pack Card */}
            {authorityPack && (
              <div className="p-3.5 rounded-xl bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-transparent border border-purple-500/30 hover:border-purple-500/50 transition-all space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                      <Crown className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                      <span>{authorityPack.title}</span>
                    </div>
                    <div className="text-[11px] text-purple-300 font-medium">{authorityPack.subtitle}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-sm font-semibold text-white font-mono">{authorityPack.formattedTypical}</div>
                    <div className="text-[10px] text-emerald-400 font-medium">Save {authorityPack.savingsFormatted}</div>
                  </div>
                </div>
                <div className="pt-1.5 border-t border-white/5 text-[10px] text-zinc-400">
                  <span>Range: {authorityPack.formattedLow} – {authorityPack.formattedHigh}</span>
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
              className="w-full py-2.5 px-3 text-xs font-medium rounded-xl bg-white text-zinc-950 hover:bg-zinc-100 transition-all cursor-pointer shadow-sm inline-flex items-center justify-center gap-1.5"
            >
              {copied ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Copied All Packages!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-zinc-700" />
                  <span>Copy Bundle Rate Sheet</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
