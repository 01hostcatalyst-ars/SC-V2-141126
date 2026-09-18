"use client";

import React, { useMemo } from "react";
import { CreatorMetrics, RegionCode } from "@/lib/calculator/types";
import {
  PRIMARY_NICHES,
  SUB_NICHES,
  REGIONAL_CONFIG,
  NicheDefinition,
  SubNicheDefinition,
} from "@/lib/calculator/constants";

interface CreatorProfileFormProps {
  metrics: CreatorMetrics;
  onChange: (updated: Partial<CreatorMetrics>) => void;
  availableNiches?: NicheDefinition[];
  availableSubNiches?: SubNicheDefinition[];
  regionalConfigs?: Record<string, { name: string; currency: string; symbol: string }>;
}

const FOLLOWER_PRESETS = [
  { label: "5K Nano", value: 5000 },
  { label: "25K Micro", value: 25000 },
  { label: "75K Mid", value: 75000 },
  { label: "250K Macro", value: 250000 },
  { label: "1M Mega", value: 1000000 },
];

export function CreatorProfileForm({
  metrics,
  onChange,
  availableNiches = PRIMARY_NICHES,
  availableSubNiches = SUB_NICHES,
  regionalConfigs = REGIONAL_CONFIG,
}: CreatorProfileFormProps) {
  const currentSubNiches = useMemo(() => {
    return availableSubNiches.filter((s) => s.primaryNicheId === metrics.primaryNicheId);
  }, [availableSubNiches, metrics.primaryNicheId]);

  const activePrimaryNiche = useMemo(() => {
    return availableNiches.find((p) => p.id === metrics.primaryNicheId) || availableNiches[7];
  }, [availableNiches, metrics.primaryNicheId]);

  const activeSubNiche = useMemo(() => {
    return availableSubNiches.find((s) => s.id === metrics.subNicheId);
  }, [availableSubNiches, metrics.subNicheId]);

  return (
    <div className="bg-white/95 backdrop-blur-xl rounded-3xl border border-gray-200/90 shadow-sm p-6 sm:p-8 space-y-7 transition-all">
      {/* Step Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-5">
        <div className="flex items-center gap-3.5">
          <div className="w-9 h-9 rounded-2xl bg-black text-white flex items-center justify-center font-black text-xs shadow-sm tracking-wider">
            01
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black text-gray-950 uppercase tracking-tight font-display">
              Creator Profile &amp; Reach
            </h2>
            <p className="text-xs text-gray-500 font-medium">
              Audience scale, engagement velocity, and vertical industry baseline
            </p>
          </div>
        </div>

        {/* Region & Currency Selector */}
        <div className="flex items-center gap-2 self-start sm:self-auto bg-gray-50 p-1.5 rounded-2xl border border-gray-200/80 shadow-2xs">
          <span className="text-[11px] font-bold text-gray-400 pl-2">Market:</span>
          <select
            value={metrics.regionCode || "US"}
            onChange={(e) => onChange({ regionCode: e.target.value as RegionCode })}
            className="text-xs font-bold bg-white border border-gray-200/80 rounded-xl px-3 py-1.5 text-gray-900 focus:outline-none focus:ring-1 focus:ring-black cursor-pointer shadow-2xs transition-all"
          >
            {Object.entries(regionalConfigs).map(([code, conf]) => (
              <option key={code} value={code}>
                {conf.currency} · {conf.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Follower Count & Dynamic Slider */}
      <div className="space-y-3.5">
        <div className="flex justify-between items-center">
          <label className="text-xs font-black uppercase tracking-wider text-gray-900">
            Followers / Subscribers
          </label>
          <span className="text-xs font-mono font-black text-black bg-gray-100 border border-gray-200 px-3 py-1 rounded-xl shadow-2xs">
            {metrics.followerCount.toLocaleString()} followers
          </span>
        </div>

        {/* Number Input & Quick Presets */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
          <div className="sm:col-span-4 relative">
            <input
              type="number"
              min={1000}
              max={50000000}
              step={500}
              value={metrics.followerCount || ""}
              onChange={(e) => onChange({ followerCount: Math.max(1000, Number(e.target.value)) })}
              placeholder="e.g. 45000"
              className="w-full px-4 py-2.5 text-sm font-bold font-mono rounded-2xl border border-gray-300 bg-white text-gray-900 shadow-2xs focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
            />
          </div>

          <div className="sm:col-span-8 flex flex-wrap items-center gap-1.5">
            {FOLLOWER_PRESETS.map((preset) => (
              <button
                key={preset.value}
                type="button"
                onClick={() => onChange({ followerCount: preset.value })}
                className={`px-3 py-2 text-[11px] font-bold rounded-xl border transition-all cursor-pointer ${
                  metrics.followerCount === preset.value
                    ? "bg-black text-white border-black shadow-xs font-black"
                    : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-white hover:border-gray-300 hover:text-black shadow-2xs"
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Smooth Slider Bar */}
        <div className="pt-1">
          <input
            type="range"
            min={1000}
            max={1000000}
            step={1000}
            value={Math.min(metrics.followerCount, 1000000)}
            onChange={(e) => onChange({ followerCount: Number(e.target.value) })}
            className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-black"
          />
        </div>
      </div>

      {/* Performance Metrics (Likes, Comments, Views) */}
      <div className="space-y-2.5">
        <label className="text-xs font-black uppercase tracking-wider text-gray-900 block">
          Recent Post Velocity <span className="text-gray-400 font-normal lowercase">(last 3–5 posts average)</span>
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          <div className="bg-gray-50/80 p-4 rounded-2xl border border-gray-200/80 focus-within:border-black focus-within:bg-white transition-all shadow-2xs">
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-[11px] font-bold text-gray-700">Average Likes</span>
              <span className="text-[10px] text-gray-400 font-medium">Per Post</span>
            </div>
            <input
              type="number"
              min={0}
              value={metrics.last3PostsAvgLikes || ""}
              onChange={(e) => onChange({ last3PostsAvgLikes: Math.max(0, Number(e.target.value)) })}
              placeholder="e.g. 1200"
              className="w-full text-base font-black font-mono text-gray-900 bg-transparent focus:outline-none"
            />
          </div>

          <div className="bg-gray-50/80 p-4 rounded-2xl border border-gray-200/80 focus-within:border-black focus-within:bg-white transition-all shadow-2xs">
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-[11px] font-bold text-gray-700">Average Comments</span>
              <span className="text-[10px] text-gray-400 font-medium">Per Post</span>
            </div>
            <input
              type="number"
              min={0}
              value={metrics.last3PostsAvgComments || ""}
              onChange={(e) => onChange({ last3PostsAvgComments: Math.max(0, Number(e.target.value)) })}
              placeholder="e.g. 45"
              className="w-full text-base font-black font-mono text-gray-900 bg-transparent focus:outline-none"
            />
          </div>

          <div className="bg-gray-50/80 p-4 rounded-2xl border border-gray-200/80 focus-within:border-black focus-within:bg-white transition-all shadow-2xs">
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-[11px] font-bold text-gray-700">Average Video Views</span>
              <span className="text-[10px] text-gray-400 font-medium">Optional</span>
            </div>
            <input
              type="number"
              min={0}
              value={metrics.last3PostsAvgViews || ""}
              onChange={(e) =>
                onChange({
                  last3PostsAvgViews: e.target.value === "" ? undefined : Math.max(0, Number(e.target.value)),
                })
              }
              placeholder="e.g. 18000"
              className="w-full text-base font-black font-mono text-gray-900 bg-transparent focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Sourced Niche Multiplier & Category */}
      <div className="space-y-3.5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label className="text-xs font-black uppercase tracking-wider text-gray-900 block mb-1.5">
              Primary Commercial Vertical
            </label>
            <select
              value={metrics.primaryNicheId}
              onChange={(e) => {
                const newId = Number(e.target.value);
                const matchingSubs = availableSubNiches.filter((s) => s.primaryNicheId === newId);
                onChange({
                  primaryNicheId: newId,
                  subNicheId: matchingSubs[0]?.id || undefined,
                });
              }}
              className="w-full px-4 py-2.5 text-xs font-bold rounded-2xl border border-gray-300 bg-white text-gray-900 focus:outline-none focus:border-black focus:ring-1 focus:ring-black cursor-pointer shadow-2xs transition-all"
            >
              {availableNiches.map((niche) => (
                <option key={niche.id} value={niche.id}>
                  {niche.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-black uppercase tracking-wider text-gray-900 block mb-1.5">
              Granular Sub-Vertical / Category
            </label>
            <select
              value={metrics.subNicheId || ""}
              onChange={(e) => onChange({ subNicheId: e.target.value ? Number(e.target.value) : undefined })}
              className="w-full px-4 py-2.5 text-xs font-bold rounded-2xl border border-gray-300 bg-white text-gray-900 focus:outline-none focus:border-black focus:ring-1 focus:ring-black cursor-pointer shadow-2xs transition-all"
            >
              {currentSubNiches.length > 0 ? (
                currentSubNiches.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.name}
                  </option>
                ))
              ) : (
                <option value="">General {activePrimaryNiche.name}</option>
              )}
            </select>
          </div>
        </div>

        {/* Niche Dynamic Metadata Strip */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-gray-600 bg-gradient-to-r from-gray-50 to-white px-4 py-3 rounded-2xl border border-gray-200/80 shadow-2xs">
          <span className="leading-relaxed">
            <strong className="text-gray-900 font-bold">Category Anchor:</strong>{" "}
            {activeSubNiche?.description || activePrimaryNiche.description}
          </span>
          <span className="text-xs font-semibold text-zinc-700 shrink-0 bg-white px-2.5 py-1 rounded-xl border border-gray-200 shadow-2xs">
            {activeSubNiche ? activeSubNiche.name : activePrimaryNiche.name}
          </span>
        </div>

        {/* Luxury / High-End Campaign Premium Toggle */}
        <div className="flex items-center justify-between p-4 rounded-2xl border border-gray-200 bg-gray-50/60 hover:bg-white hover:border-gray-300 transition-all shadow-2xs">
          <div>
            <div className="text-xs font-black uppercase tracking-tight text-gray-950">
              Luxury / High-Production Campaign
            </div>
            <div className="text-[11px] text-gray-500 font-medium">
              Editorial couture, high jewelry, luxury travel, or studio 4K staging (+25% premium).
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer ml-3 shrink-0">
            <input
              type="checkbox"
              checked={metrics.isLuxuryOrHighEnd || false}
              onChange={(e) => onChange({ isLuxuryOrHighEnd: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-10 h-5.5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4.5 after:w-4.5 after:transition-all peer-checked:bg-black"></div>
          </label>
        </div>
      </div>
    </div>
  );
}
