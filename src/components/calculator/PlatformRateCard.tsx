"use client";

import React, { useState } from "react";
import { Platform, DeliverableFormat } from "@/lib/calculator/types";
import { FORMAT_LABELS } from "@/lib/calculator/constants";
import {
  Camera,
  Video,
  Music2,
  Copy,
  CheckCircle2,
  Search,
  ArrowRight,
  TrendingUp,
} from "lucide-react";

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
    icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
    badgeBg: string;
    accentBorder: string;
    headerBg: string;
    metricLabel: string;
  }
> = {
  instagram: {
    title: "Instagram",
    tagline: "Visual & Short-Form Feed",
    icon: Camera,
    badgeBg: "bg-pink-50 text-pink-700 border-pink-200",
    accentBorder: "border-pink-500/20 hover:border-pink-500/40",
    headerBg: "from-pink-500/10 via-rose-500/5 to-transparent",
    metricLabel: "Followers",
  },
  youtube: {
    title: "YouTube",
    tagline: "Long-Form & Shorts Hub",
    icon: Video,
    badgeBg: "bg-red-50 text-red-700 border-red-200",
    accentBorder: "border-red-500/20 hover:border-red-500/40",
    headerBg: "from-red-500/10 via-rose-500/5 to-transparent",
    metricLabel: "Subscribers",
  },
  tiktok: {
    title: "TikTok",
    tagline: "Viral Short-Form Velocity",
    icon: Music2,
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
  const [manualInput, setManualInput] = useState("");
  const [copied, setCopied] = useState(false);
  const config = PLATFORM_CONFIG[platform];
  const IconComponent = config.icon;

  const handleCopy = () => {
    if (!data.rateCardItems || data.rateCardItems.length === 0) return;
    const lines = [
      `--- ${config.title.toUpperCase()} INFLUENCER RATE CARD ---`,
      `Account: @${data.username || "creator"} (${(data.followerCount || 0).toLocaleString()} ${config.metricLabel})`,
      data.engagementRate !== undefined ? `Observed ER: ${data.engagementRate}%` : "",
      "",
      "Defended Deliverable Rates:",
      ...data.rateCardItems.map(
        (item) =>
          `• ${FORMAT_LABELS[item.format]?.label || item.format}: ${item.formattedAmount} (Range: ${item.formattedLow} - ${item.formattedHigh})`
      ),
      "",
      "Calculated via SignCollab 16-Knot Valuation Engine",
    ]
      .filter(Boolean)
      .join("\n");

    navigator.clipboard.writeText(lines);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={`surface-card rounded-2xl sm:rounded-3xl border border-zinc-200/90 shadow-sm transition-all duration-300 flex flex-col justify-between overflow-hidden relative ${config.accentBorder}`}
    >
      {/* Platform Header with subtle gradient */}
      <div className={`p-4 sm:p-5 bg-gradient-to-r ${config.headerBg} border-b border-zinc-100`}>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white border border-zinc-200/80 shadow-2xs flex items-center justify-center text-zinc-700">
              <IconComponent className="w-4 h-4" strokeWidth={2} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-zinc-900 tracking-tight">{config.title}</h3>
              <p className="text-[11px] text-zinc-500 font-medium">{config.tagline}</p>
            </div>
          </div>
          <span
            className={`text-[10px] font-medium uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${config.badgeBg}`}
          >
            {data.status === "ready"
              ? "Active"
              : data.status === "loading"
              ? "Scanning"
              : data.status === "not_found"
              ? "Not Found"
              : "Idle"}
          </span>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-4">
        {/* Loading State */}
        {data.status === "loading" && (
          <div className="py-8 text-center space-y-3">
            <div className="w-8 h-8 border-2 border-zinc-800 border-t-transparent rounded-full animate-spin mx-auto" />
            <div>
              <p className="text-xs font-semibold text-zinc-800">
                {data.statusMessage || `Scanning ${config.title}...`}
              </p>
              <p className="text-[11px] text-zinc-500">Auditing uploads &amp; computing rate curve...</p>
            </div>
          </div>
        )}

        {/* Not Found / Idle State */}
        {(data.status === "idle" || data.status === "not_found") && (
          <div className="py-6 text-center space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-zinc-100 text-zinc-400 flex items-center justify-center mx-auto">
              <IconComponent className="w-5 h-5 text-zinc-400" />
            </div>
            <div className="space-y-1">
              <p className="text-xs font-semibold text-zinc-700">
                {data.status === "not_found" ? `${config.title} Account Not Linked` : `No ${config.title} Data`}
              </p>
              <p className="text-[11px] text-zinc-500 max-w-xs mx-auto leading-relaxed">
                {data.status === "not_found"
                  ? `Could not discover ${config.title} from bio links. Enter handle manually below:`
                  : `Enter a ${config.title} handle to compute deliverable valuations:`}
              </p>
            </div>

            {onManualSearch && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (manualInput.trim()) onManualSearch(manualInput.trim());
                }}
                className="flex items-center gap-1.5 max-w-xs mx-auto pt-1"
              >
                <input
                  type="text"
                  placeholder={`@username on ${config.title}`}
                  value={manualInput}
                  onChange={(e) => setManualInput(e.target.value)}
                  className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-zinc-300 focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 outline-none font-medium bg-zinc-50/50"
                />
                <button
                  type="submit"
                  disabled={!manualInput.trim()}
                  className="px-3 py-1.5 text-xs font-medium rounded-xl bg-zinc-900 hover:bg-zinc-800 disabled:opacity-40 text-white transition-all shadow-2xs shrink-0 cursor-pointer"
                >
                  Scan
                </button>
              </form>
            )}
          </div>
        )}

        {/* Error State */}
        {data.status === "error" && (
          <div className="py-6 text-center space-y-2">
            <div className="w-8 h-8 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto text-xs font-semibold">
              !
            </div>
            <p className="text-xs font-semibold text-rose-800">Scan Failed</p>
            <p className="text-[11px] text-zinc-500 max-w-xs mx-auto">{data.error || "Unable to reach platform API."}</p>
          </div>
        )}

        {/* Ready / Data Active State */}
        {data.status === "ready" && (
          <div className="space-y-4">
            {/* Account Profile Header */}
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <div className="flex items-center gap-2.5 min-w-0">
                {data.avatarUrl ? (
                  <img
                    src={data.avatarUrl}
                    alt={data.displayName || data.username || config.title}
                    className="w-9 h-9 rounded-full object-cover border border-zinc-200 shrink-0"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-zinc-900 text-white font-semibold text-xs flex items-center justify-center shrink-0">
                    {(data.displayName || data.username || "C").slice(0, 2).toUpperCase()}
                  </div>
                )}
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-zinc-900 truncate">
                    {data.displayName || `@${data.username?.replace(/^@+/, "")}`}
                  </div>
                  <div className="text-[10px] text-zinc-500 font-mono truncate">@{data.username?.replace(/^@+/, "")}</div>
                </div>
              </div>

              <div className="text-right shrink-0">
                <div className="text-sm font-semibold text-zinc-900 font-mono">
                  {(data.followerCount || 0).toLocaleString()}
                </div>
                <div className="text-[10px] text-zinc-500 uppercase tracking-wider">{config.metricLabel}</div>
              </div>
            </div>

            {/* Performance KPIs */}
            <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-zinc-50/80 border border-zinc-100 text-center">
              <div>
                <div className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider">
                  {platform === "youtube" ? "Avg Views" : "Avg Likes"}
                </div>
                <div className="text-xs font-semibold text-zinc-900 font-mono">
                  {platform === "youtube"
                    ? (data.avgViews || 0).toLocaleString()
                    : (data.avgLikes || 0).toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider">
                  {data.engagementRate !== undefined ? "Observed ER" : "Avg Comments"}
                </div>
                <div className="text-xs font-semibold text-zinc-900 font-mono">
                  {data.engagementRate !== undefined
                    ? `${data.engagementRate}%`
                    : (data.avgComments || 0).toLocaleString()}
                </div>
              </div>
            </div>

            {/* Itemized Deliverables Pricing List */}
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between px-1 text-[10px] text-zinc-500">
                <span className="font-medium uppercase tracking-wider">Deliverable Valuations</span>
                <span className="text-[9px] text-zinc-400 font-normal">Defended Median • Range = Negotiation Band</span>
              </div>
              {data.rateCardItems?.map((item) => {
                const labelInfo = FORMAT_LABELS[item.format] || { label: item.format, tag: "Item" };
                return (
                  <div
                    key={item.format}
                    className="flex items-center justify-between p-2.5 rounded-xl border border-zinc-100 hover:border-zinc-300 bg-white hover:bg-zinc-50/70 transition-all group"
                  >
                    <div className="min-w-0 pr-2">
                      <div className="text-xs font-semibold text-zinc-900 truncate">{labelInfo.label}</div>
                      <div className="text-[10px] text-zinc-500 font-mono">
                        Range: {item.formattedLow} – {item.formattedHigh}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-xs font-semibold text-zinc-900 font-mono group-hover:text-zinc-950">
                        {item.formattedAmount}
                      </div>
                      {onSelectDeliverableForContract && (
                        <button
                          type="button"
                          onClick={() => onSelectDeliverableForContract(item.format, item.amount)}
                          className="text-[10px] font-medium text-emerald-600 hover:text-emerald-800 underline cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
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
          <div className="pt-2 border-t border-zinc-100 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className="w-full py-2 px-3 text-xs font-medium rounded-xl border border-zinc-200 hover:border-zinc-300 bg-zinc-50 hover:bg-white text-zinc-700 hover:text-zinc-950 transition-all cursor-pointer shadow-2xs inline-flex items-center justify-center gap-1.5"
            >
              {copied ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-zinc-500" />
                  <span>Copy {config.title} Rates</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
