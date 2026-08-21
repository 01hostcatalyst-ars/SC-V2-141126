"use client";

import React, { useMemo } from "react";
import { CreatorMetrics, RegionCode } from "@/lib/calculator/types";
import {
  PRIMARY_NICHES,
  SUB_NICHES,
  REGIONAL_CONFIG,
} from "@/lib/calculator/constants";

interface CreatorProfileFormProps {
  metrics: CreatorMetrics;
  onChange: (updated: Partial<CreatorMetrics>) => void;
}

const FOLLOWER_PRESETS = [
  { label: "5K Nano", value: 5000 },
  { label: "25K Micro", value: 25000 },
  { label: "75K Mid", value: 75000 },
  { label: "250K Macro", value: 250000 },
  { label: "1M Mega", value: 1000000 },
];

export function CreatorProfileForm({ metrics, onChange }: CreatorProfileFormProps) {
  const currentSubNiches = useMemo(() => {
    return SUB_NICHES.filter((s) => s.primaryNicheId === metrics.primaryNicheId);
  }, [metrics.primaryNicheId]);

  const activePrimaryNiche = useMemo(() => {
    return PRIMARY_NICHES.find((p) => p.id === metrics.primaryNicheId);
  }, [metrics.primaryNicheId]);

  const activeSubNiche = useMemo(() => {
    return SUB_NICHES.find((s) => s.id === metrics.subNicheId);
  }, [metrics.subNicheId]);

  return (
    <div className="bg-white rounded-2xl border border-gray-200/90 shadow-sm p-5 sm:p-7 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-black text-white flex items-center justify-center font-bold text-xs shadow-xs tracking-wider">
            01
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-950 uppercase tracking-tight">
              Creator Profile &amp; Reach
            </h2>
            <p className="text-xs text-gray-500 font-medium">Audience scale, engagement velocity, and vertical niche</p>
          </div>
        </div>

        {/* Region & Currency Selector */}
        <div className="flex items-center gap-2 self-start sm:self-auto bg-gray-50/80 p-1 rounded-xl border border-gray-200/80">
          <span className="text-[11px] font-bold text-gray-400 pl-2">Market:</span>
          <select
            value={metrics.regionCode || "US"}
            onChange={(e) => onChange({ regionCode: e.target.value as RegionCode })}
            className="text-xs font-bold bg-white border border-gray-200 rounded-lg px-2.5 py-1 text-gray-900 focus:outline-none focus:ring-1 focus:ring-black cursor-pointer shadow-2xs"
          >
            {Object.entries(REGIONAL_CONFIG).map(([code, conf]) => (
              <option key={code} value={code}>
                {conf.currency} · {conf.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Follower Count */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <label className="text-xs font-bold text-gray-900 tracking-tight">
            Followers / Subscribers
          </label>
          <span className="text-xs font-mono font-bold text-black bg-gray-100 border border-gray-200/80 px-2.5 py-1 rounded-lg">
            {metrics.followerCount.toLocaleString()} followers
          </span>
        </div>

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
              className="w-full px-3.5 py-2.5 text-sm font-semibold rounded-xl border border-gray-300 bg-white text-gray-900 shadow-2xs focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
            />
          </div>

          {/* Quick Presets */}
          <div className="sm:col-span-8 flex flex-wrap items-center gap-1.5">
            {FOLLOWER_PRESETS.map((preset) => (
              <button
                key={preset.value}
                type="button"
                onClick={() => onChange({ followerCount: preset.value })}
                className={`px-3 py-2 text-[11px] font-bold rounded-xl border transition-all cursor-pointer ${
                  metrics.followerCount === preset.value
                    ? "bg-black text-white border-black shadow-xs"
                    : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-white hover:border-gray-300 hover:text-black"
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Performance Metrics (Likes, Comments, Views) */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-gray-900 tracking-tight block">
          Recent Post Metrics <span className="text-gray-400 font-normal">(Last 3–5 posts average)</span>
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-gray-50/70 p-3.5 rounded-xl border border-gray-200/80 focus-within:border-black focus-within:bg-white transition-all">
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-[11px] font-bold text-gray-600">Average Likes</span>
              <span className="text-[10px] text-gray-400 font-medium">Per Post</span>
            </div>
            <input
              type="number"
              min={0}
              value={metrics.last3PostsAvgLikes || ""}
              onChange={(e) => onChange({ last3PostsAvgLikes: Math.max(0, Number(e.target.value)) })}
              placeholder="e.g. 1200"
              className="w-full text-sm font-bold font-mono text-gray-900 bg-transparent focus:outline-none"
            />
          </div>

          <div className="bg-gray-50/70 p-3.5 rounded-xl border border-gray-200/80 focus-within:border-black focus-within:bg-white transition-all">
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-[11px] font-bold text-gray-600">Average Comments</span>
              <span className="text-[10px] text-gray-400 font-medium">Per Post</span>
            </div>
            <input
              type="number"
              min={0}
              value={metrics.last3PostsAvgComments || ""}
              onChange={(e) => onChange({ last3PostsAvgComments: Math.max(0, Number(e.target.value)) })}
              placeholder="e.g. 45"
              className="w-full text-sm font-bold font-mono text-gray-900 bg-transparent focus:outline-none"
            />
          </div>

          <div className="bg-gray-50/70 p-3.5 rounded-xl border border-gray-200/80 focus-within:border-black focus-within:bg-white transition-all">
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-[11px] font-bold text-gray-600">Average Video Views</span>
              <span className="text-[10px] text-gray-400 font-normal">Optional</span>
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
              className="w-full text-sm font-bold font-mono text-gray-900 bg-transparent focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Niche & Sub-Niche Selection */}
      <div className="space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-bold text-gray-900 block mb-1.5">
              Primary Commercial Vertical
            </label>
            <select
              value={metrics.primaryNicheId}
              onChange={(e) => {
                const newId = Number(e.target.value);
                const matchingSubs = SUB_NICHES.filter((s) => s.primaryNicheId === newId);
                onChange({
                  primaryNicheId: newId,
                  subNicheId: matchingSubs[0]?.id || undefined,
                });
              }}
              className="w-full px-3.5 py-2.5 text-xs font-bold rounded-xl border border-gray-300 bg-white text-gray-900 focus:outline-none focus:border-black focus:ring-1 focus:ring-black cursor-pointer shadow-2xs"
            >
              {PRIMARY_NICHES.map((niche) => (
                <option key={niche.id} value={niche.id}>
                  {niche.name} ({niche.multiplier}x)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-900 block mb-1.5">
              Sub-Vertical / Content Category
            </label>
            <select
              value={metrics.subNicheId || ""}
              onChange={(e) => onChange({ subNicheId: e.target.value ? Number(e.target.value) : undefined })}
              className="w-full px-3.5 py-2.5 text-xs font-bold rounded-xl border border-gray-300 bg-white text-gray-900 focus:outline-none focus:border-black focus:ring-1 focus:ring-black cursor-pointer shadow-2xs"
            >
              {currentSubNiches.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.name} ({sub.multiplier}x)
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Niche Metadata Strip */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px] text-gray-500 bg-gray-50 px-3.5 py-2.5 rounded-xl border border-gray-200/70">
          <span>
            <strong className="text-gray-700">Category Dynamics:</strong> {activeSubNiche?.description || activePrimaryNiche?.description}
          </span>
          <span className="font-mono font-bold text-gray-800 shrink-0">
            Multiplier: {activeSubNiche ? `${activeSubNiche.multiplier}x` : `${activePrimaryNiche?.multiplier}x`}
          </span>
        </div>

        {/* Luxury Campaign Toggle */}
        <div className="flex items-center justify-between p-3.5 rounded-xl border border-gray-200 bg-gray-50/50 hover:bg-white transition-all">
          <div>
            <div className="text-xs font-bold text-gray-900">Luxury / High-Production Campaign</div>
            <div className="text-[11px] text-gray-500 font-medium">
              Editorial couture, fine jewelry, luxury travel, or studio 4K staging (+25% premium).
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer ml-3 shrink-0">
            <input
              type="checkbox"
              checked={metrics.isLuxuryOrHighEnd || false}
              onChange={(e) => onChange({ isLuxuryOrHighEnd: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-black"></div>
          </label>
        </div>
      </div>
    </div>
  );
}
