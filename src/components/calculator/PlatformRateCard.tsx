"use client";

import React, { useState } from "react";
import { Platform, DeliverableFormat } from "@/lib/calculator/types";
import { FORMAT_LABELS } from "@/lib/calculator/constants";

export interface RateCardDeliverableItem {
  format: DeliverableFormat;
  amount: number;
  formattedAmount: string;
  lowAmount: number;
  formattedLow: string;
  highAmount: number;
  formattedHigh: string;
  currency: string;
}

export interface PlatformDataState {
  status: "idle" | "loading" | "ready" | "not_found" | "error";
  statusMessage?: string;
  username?: string;
  displayName?: string;
  avatarUrl?: string;
  followerCount?: number;
  avgLikes?: number;
  avgComments?: number;
  avgViews?: number;
  engagementRate?: number;
  rateCardItems?: RateCardDeliverableItem[];
  error?: string;
}

interface PlatformRateCardProps {
  platform: Platform;
  data: PlatformDataState;
  onManualSearch?: (handle: string) => void;
  onSelectDeliverableForContract?: (format: DeliverableFormat, amount: number) => void;
}

const PLATFORM_CONFIG: Record<
  Platform,
  {
    title: string;
    tagline: string;
    icon: string;
    badgeBg: string;
    accentBorder: string;
    headerBg: string;
    metricLabel: string;
  }
> = {
  instagram: {
    title: "Instagram",
    tagline: "Visual & Short-Form Feed",
    icon: "📸",
    badgeBg: "bg-pink-50 text-pink-700 border-pink-200",
    accentBorder: "border-pink-500/20 hover:border-pink-500/40",
    headerBg: "from-pink-500/10 via-rose-500/5 to-transparent",
    metricLabel: "Followers",
  },
  youtube: {
    title: "YouTube",
    tagline: "Long-Form & Shorts Hub",
    icon: "🎥",
    badgeBg: "bg-red-50 text-red-700 border-red-200",
    accentBorder: "border-red-500/20 hover:border-red-500/40",
    headerBg: "from-red-500/10 via-rose-500/5 to-transparent",
    metricLabel: "Subscribers",
  },
  tiktok: {
    title: "TikTok",
    tagline: "Viral Short-Form Velocity",
    icon: "🎵",
    badgeBg: "bg-cyan-50 text-cyan-800 border-cyan-200",
    accentBorder: "border-cyan-500/20 hover:border-cyan-500/40",
    headerBg: "from-cyan-500/10 via-teal-500/5 to-transparent",
    metricLabel: "Followers",
  },
};

export function PlatformRateCard({
  platform,
  data,
  onManualSearch,
  onSelectDeliverableForContract,
}: PlatformRateCardProps) {
  const config = PLATFORM_CONFIG[platform];
  const [manualInput, setManualInput] = useState("");
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!data.rateCardItems || data.rateCardItems.length === 0) return;
    const lines = [
      `--- ${config.title.toUpperCase()} RATE SHEET ---`,
      `Creator: @${data.username || "creator"}`,
      `${config.metricLabel}: ${(data.followerCount || 0).toLocaleString()}`,
      data.engagementRate ? `Observed ER: ${data.engagementRate}%` : null,
      data.avgViews ? `Avg Views: ${data.avgViews.toLocaleString()}` : null,
      ``,
      `Deliverable Pricing (Defended Market Medians):`,
      ...data.rateCardItems.map(
        (item) =>
          `• ${FORMAT_LABELS[item.format]?.label || item.format}: ${item.formattedAmount} (Range: ${item.formattedLow} - ${item.formattedHigh})`
      ),
      ``,
      `Calculated via SignCollab 16-Knot Rate Engine`,
    ]
      .filter(Boolean)
      .join("\n");

    navigator.clipboard.writeText(lines);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={`bg-white rounded-3xl border border-gray-200/90 shadow-sm transition-all duration-300 flex flex-col justify-between overflow-hidden relative ${config.accentBorder}`}
    >
      {/* Header Banner */}
      <div className={`p-5 bg-gradient-to-b ${config.headerBg} border-b border-gray-100`}>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">{config.icon}</span>
            <div>
              <h3 className="text-sm font-black text-gray-950 tracking-tight">{config.title}</h3>
              <p className="text-[11px] text-gray-500 font-medium">{config.tagline}</p>
            </div>
          </div>
          <span
            className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${config.badgeBg}`}
          >
            {data.status === "ready" ? "Verified" : data.status}
          </span>
        </div>
      </div>

      {/* Card Body by State */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        {/* 1. LOADING STATE */}
        {data.status === "loading" && (
          <div className="space-y-4 py-6 animate-pulse">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-200" />
              <div className="space-y-1.5 flex-1">
                <div className="h-3.5 bg-gray-200 rounded w-28" />
                <div className="h-2.5 bg-gray-100 rounded w-20" />
              </div>
            </div>
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-center space-y-1">
              <div className="inline-block w-4 h-4 border-2 border-gray-400 border-t-black rounded-full animate-spin" />
              <p className="text-xs font-semibold text-gray-600">
                {data.statusMessage || `Scraping ${config.title} live metrics...`}
              </p>
            </div>
            <div className="space-y-2">
              <div className="h-9 bg-gray-100 rounded-xl" />
              <div className="h-9 bg-gray-100 rounded-xl" />
              <div className="h-9 bg-gray-100 rounded-xl" />
            </div>
          </div>
        )}

        {/* 2. NOT FOUND / IDLE STATE */}
        {(data.status === "not_found" || data.status === "idle") && (
          <div className="py-6 text-center space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-gray-100 text-gray-400 flex items-center justify-center mx-auto text-sm font-bold">
              ?
            </div>
            <div>
              <p className="text-xs font-bold text-gray-800">No {config.title} Linked</p>
              <p className="text-[11px] text-gray-400">Enter handle to scrape and price</p>
            </div>
            <div className="flex items-center gap-1.5 max-w-xs mx-auto">
              <input
                type="text"
                placeholder={`@${platform}_handle`}
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && manualInput && onManualSearch?.(manualInput)}
                className="flex-1 px-3 py-1.5 text-xs font-semibold rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:border-black"
              />
              <button
                type="button"
                onClick={() => manualInput && onManualSearch?.(manualInput)}
                className="px-3 py-1.5 text-xs font-bold bg-black text-white rounded-xl hover:bg-gray-800 cursor-pointer shadow-2xs"
              >
                Scan
              </button>
            </div>
          </div>
        )}

        {/* 3. ERROR STATE */}
        {data.status === "error" && (
          <div className="py-6 text-center space-y-3">
            <div className="p-3 bg-red-50 text-red-700 rounded-xl border border-red-200 text-xs font-medium">
              {data.error || `Failed to fetch ${config.title} metrics.`}
            </div>
            <button
              type="button"
              onClick={() => data.username && onManualSearch?.(data.username)}
              className="text-xs font-bold text-gray-700 underline hover:text-black cursor-pointer"
            >
              Retry Scrape
            </button>
          </div>
        )}

        {/* 4. READY / LOADED STATE */}
        {data.status === "ready" && (
          <div className="space-y-4">
            {/* Creator Mini Profile Header */}
            <div className="flex items-center justify-between gap-2 border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2.5 min-w-0">
                {data.avatarUrl ? (
                  <img
                    src={data.avatarUrl}
                    alt={data.displayName || data.username}
                    className="w-9 h-9 rounded-full object-cover border border-gray-200 shadow-2xs shrink-0"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-gray-900 text-white font-bold text-xs flex items-center justify-center shrink-0">
                    {(data.username || "C").slice(0, 2).toUpperCase()}
                  </div>
                )}
                <div className="min-w-0">
                  <div className="text-xs font-bold text-gray-950 truncate">
                    {data.displayName || data.username}
                  </div>
                  <div className="text-[11px] text-gray-400 font-mono truncate">@{data.username}</div>
                </div>
              </div>

              {/* Follower Badge */}
              <div className="text-right shrink-0">
                <div className="text-xs font-black text-gray-950 font-mono">
                  {(data.followerCount || 0).toLocaleString()}
                </div>
                <div className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">
                  {config.metricLabel}
                </div>
              </div>
            </div>

            {/* Engagement & View Metrics */}
            <div className="grid grid-cols-2 gap-2 bg-gray-50/80 p-2.5 rounded-2xl border border-gray-100 text-center">
              <div>
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  {platform === "youtube" ? "Avg Views" : "Avg Likes"}
                </div>
                <div className="text-xs font-black text-gray-900 font-mono">
                  {platform === "youtube"
                    ? (data.avgViews || 0).toLocaleString()
                    : (data.avgLikes || 0).toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  {data.engagementRate !== undefined ? "Observed ER" : "Avg Comments"}
                </div>
                <div className="text-xs font-black text-gray-900 font-mono">
                  {data.engagementRate !== undefined
                    ? `${data.engagementRate}%`
                    : (data.avgComments || 0).toLocaleString()}
                </div>
              </div>
            </div>

            {/* Itemized Deliverables Pricing List */}
            <div className="space-y-1.5 pt-1">
              <div className="text-[10px] font-black text-gray-400 uppercase tracking-wider px-1">
                Deliverable Valuations (Defended Medians)
              </div>
              {data.rateCardItems?.map((item) => {
                const labelInfo = FORMAT_LABELS[item.format] || { label: item.format, tag: "Item" };
                return (
                  <div
                    key={item.format}
                    className="flex items-center justify-between p-2.5 rounded-xl border border-gray-100 hover:border-gray-300 bg-white hover:bg-gray-50/60 transition-all group"
                  >
                    <div className="min-w-0 pr-2">
                      <div className="text-xs font-bold text-gray-900 truncate">{labelInfo.label}</div>
                      <div className="text-[10px] text-gray-400 font-mono">
                        Range: {item.formattedLow} – {item.formattedHigh}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-xs font-black text-gray-950 font-mono group-hover:text-black">
                        {item.formattedAmount}
                      </div>
                      {onSelectDeliverableForContract && (
                        <button
                          type="button"
                          onClick={() => onSelectDeliverableForContract(item.format, item.amount)}
                          className="text-[10px] font-bold text-blue-600 hover:text-blue-800 underline cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          + Contract
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Footer Actions */}
        {data.status === "ready" && (
          <div className="pt-2 border-t border-gray-100 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className="w-full py-2 px-3 text-xs font-bold rounded-xl border border-gray-200 hover:border-gray-400 bg-gray-50 hover:bg-white text-gray-700 hover:text-black transition-all cursor-pointer shadow-2xs inline-flex items-center justify-center gap-1.5"
            >
              <svg className="w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
              <span>{copied ? "Copied!" : `Copy ${config.title} Rates`}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
