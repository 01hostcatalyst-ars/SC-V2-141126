"use client";

import React from "react";
import Link from "next/link";
import { ShieldCheck, ArrowRight } from "lucide-react";
import { PlatformBadge } from "@/components/icons/PlatformIcons";

export interface PlatformMetric {
  handle: string;
  followers: number;
  er?: number;
  lfEr?: number;
  sfEr?: number;
}

export interface FlagshipRateItem {
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

export interface CreatorItem {
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

export function formatFollowerCount(num: number): string {
  if (!num) return "0";
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
  return num.toLocaleString();
}

interface CreatorCardProps {
  creator: CreatorItem;
  className?: string;
}

export function CreatorCard({ creator, className = "" }: CreatorCardProps) {
  const name = creator.brandName || creator.canonicalName;

  return (
    <div
      className={`group relative flex flex-col justify-between p-5 rounded-[9px] bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 shadow-2xs hover:shadow-md hover:border-zinc-300 dark:hover:border-zinc-700 transition duration-200 ${className}`}
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
                <p
                  className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 truncate"
                  title={creator.primaryNicheName}
                >
                  {creator.primaryNicheName}
                </p>
              )}
            </div>
          </div>

          {/* Primary Audience & Sub-Niche (Directly below identity, no divider) */}
          <div className="space-y-1 text-xs pt-0.5">
            {(creator.countryName || creator.countryCode) && (
              <div className="text-zinc-700 dark:text-zinc-300">
                <span className="text-zinc-500 dark:text-zinc-400 font-medium">
                  Primary Audience:{" "}
                </span>
                <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                  {creator.countryName || creator.countryCode}{" "}
                  {creator.countryCode ? `(${creator.countryCode})` : ""}
                </span>
              </div>
            )}
            {creator.subNicheName && (
              <div
                className="text-zinc-600 dark:text-zinc-400 truncate"
                title={creator.subNicheName}
              >
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
                <div key={p.platform} className="py-3 space-y-1">
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
                      <span className="text-zinc-500 dark:text-zinc-400 font-medium">
                        Estimated Range:{" "}
                      </span>
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
}
