"use client";

import React from "react";
import { DeliverableItem, DeliverableFormat, Platform } from "@/lib/calculator/types";
import { FORMAT_LABELS } from "@/lib/calculator/constants";

interface DeliverablesBuilderProps {
  deliverables: DeliverableItem[];
  onChange: (items: DeliverableItem[]) => void;
}

export function DeliverablesBuilder({ deliverables, onChange }: DeliverablesBuilderProps) {
  const totalQuantity = deliverables.reduce((sum, item) => sum + item.quantity, 0);

  const handleAddDeliverable = (format: DeliverableFormat) => {
    const platform: Platform = format.startsWith("ig_")
      ? "instagram"
      : format.startsWith("tiktok_")
      ? "tiktok"
      : "youtube";

    const newItem: DeliverableItem = {
      id: `deliv_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      platform,
      format,
      quantity: 1,
    };
    onChange([...deliverables, newItem]);
  };

  const handleUpdateItem = (id: string, updates: Partial<DeliverableItem>) => {
    onChange(
      deliverables.map((item) => {
        if (item.id === id) {
          const updated = { ...item, ...updates };
          if (updates.format) {
            updated.platform = updates.format.startsWith("ig_")
              ? "instagram"
              : updates.format.startsWith("tiktok_")
              ? "tiktok"
              : "youtube";
          }
          return updated;
        }
        return item;
      })
    );
  };

  const handleRemoveItem = (id: string) => {
    if (deliverables.length <= 1) return;
    onChange(deliverables.filter((item) => item.id !== id));
  };

  return (
    <div className="bg-white/95 backdrop-blur-xl rounded-3xl border border-gray-200/90 shadow-sm p-6 sm:p-8 space-y-7 transition-all">
      {/* Step Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-5">
        <div className="flex items-center gap-3.5">
          <div className="w-9 h-9 rounded-2xl bg-black text-white flex items-center justify-center font-black text-xs shadow-sm tracking-wider">
            02
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black text-gray-950 uppercase tracking-tight font-display">
              Campaign Deliverables &amp; Formats
            </h2>
            <p className="text-xs text-gray-500 font-medium">
              Select deliverable assets, package volumes, and cross-platform channels
            </p>
          </div>
        </div>

        {/* Dynamic Multi-Asset Volume Discount Badge */}
        <div>
          {totalQuantity >= 4 ? (
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-emerald-200 animate-pulse" />
              15% Multi-Asset Discount Applied
            </span>
          ) : totalQuantity >= 2 ? (
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-50 text-blue-800 border border-blue-200 text-xs font-bold shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-blue-500 ring-2 ring-blue-200 animate-pulse" />
              10% Multi-Asset Discount Applied
            </span>
          ) : (
            <span className="text-[11px] font-bold text-gray-400 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-200/70">
              Add 2+ items for volume discount (10% - 15%)
            </span>
          )}
        </div>
      </div>

      {/* Deliverables List */}
      <div className="space-y-3.5">
        {deliverables.map((item, index) => (
          <div
            key={item.id}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 p-4 sm:p-5 rounded-2xl border border-gray-200 bg-gray-50/50 hover:bg-white hover:border-gray-300 transition-all shadow-2xs"
          >
            {/* Format Selection */}
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">
                  Deliverable #{index + 1}
                </span>
                <span className="text-[10px] font-black uppercase tracking-wider text-gray-500 sm:hidden">
                  {FORMAT_LABELS[item.format]?.platform}
                </span>
              </div>
              <select
                value={item.format}
                onChange={(e) => handleUpdateItem(item.id, { format: e.target.value as DeliverableFormat })}
                className="w-full text-xs font-bold bg-white border border-gray-300 rounded-xl px-3.5 py-2.5 text-gray-900 focus:outline-none focus:border-black focus:ring-1 focus:ring-black cursor-pointer shadow-2xs"
              >
                {Object.entries(FORMAT_LABELS).map(([formatKey, meta]) => (
                  <option key={formatKey} value={formatKey}>
                    {meta.label} · {meta.platform}
                  </option>
                ))}
              </select>
            </div>

            {/* Quantity Stepper */}
            <div className="flex items-center gap-2">
              <label className="text-xs font-bold text-gray-600 sm:hidden">Quantity:</label>
              <div className="flex items-center border border-gray-300 rounded-xl bg-white shadow-2xs overflow-hidden">
                <button
                  type="button"
                  onClick={() => handleUpdateItem(item.id, { quantity: Math.max(1, item.quantity - 1) })}
                  className="px-3.5 py-2 text-xs font-bold text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  -
                </button>
                <span className="w-8 text-center text-xs font-black font-mono text-gray-900">
                  {item.quantity}
                </span>
                <button
                  type="button"
                  onClick={() => handleUpdateItem(item.id, { quantity: item.quantity + 1 })}
                  className="px-3.5 py-2 text-xs font-bold text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>

            {/* Cross-Post Discount Checkbox */}
            <div className="flex items-center">
              <label className="flex items-center gap-2 text-xs font-bold text-gray-700 cursor-pointer select-none bg-white px-3 py-2 rounded-xl border border-gray-200 shadow-2xs hover:border-gray-300 transition-all">
                <input
                  type="checkbox"
                  checked={item.isCrossPost || false}
                  onChange={(e) => handleUpdateItem(item.id, { isCrossPost: e.target.checked })}
                  className="rounded border-gray-300 text-black focus:ring-black cursor-pointer"
                />
                <span>Cross-Post (-50%)</span>
              </label>
            </div>

            {/* Delete Item */}
            <div>
              <button
                type="button"
                disabled={deliverables.length <= 1}
                onClick={() => handleRemoveItem(item.id)}
                className={`p-2.5 rounded-xl text-xs font-bold transition-all ${
                  deliverables.length <= 1
                    ? "text-gray-300 cursor-not-allowed"
                    : "text-gray-400 hover:text-red-600 hover:bg-red-50 cursor-pointer"
                }`}
                title="Remove deliverable"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Add Chips */}
      <div className="pt-2 border-t border-gray-100">
        <label className="text-[11px] font-black uppercase tracking-wider text-gray-400 block mb-2.5">
          Quick Add Deliverable Format:
        </label>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => handleAddDeliverable("ig_reel")}
            className="px-3.5 py-2 text-xs font-bold bg-gray-50 hover:bg-black hover:text-white text-gray-800 rounded-xl transition-all border border-gray-200 cursor-pointer shadow-2xs"
          >
            + IG Reel
          </button>
          <button
            type="button"
            onClick={() => handleAddDeliverable("ig_story")}
            className="px-3.5 py-2 text-xs font-bold bg-gray-50 hover:bg-black hover:text-white text-gray-800 rounded-xl transition-all border border-gray-200 cursor-pointer shadow-2xs"
          >
            + IG Story Set
          </button>
          <button
            type="button"
            onClick={() => handleAddDeliverable("ig_carousel")}
            className="px-3.5 py-2 text-xs font-bold bg-gray-50 hover:bg-black hover:text-white text-gray-800 rounded-xl transition-all border border-gray-200 cursor-pointer shadow-2xs"
          >
            + IG Carousel
          </button>
          <button
            type="button"
            onClick={() => handleAddDeliverable("tiktok_video")}
            className="px-3.5 py-2 text-xs font-bold bg-gray-50 hover:bg-black hover:text-white text-gray-800 rounded-xl transition-all border border-gray-200 cursor-pointer shadow-2xs"
          >
            + TikTok Video
          </button>
          <button
            type="button"
            onClick={() => handleAddDeliverable("yt_dedicated")}
            className="px-3.5 py-2 text-xs font-bold bg-gray-50 hover:bg-black hover:text-white text-gray-800 rounded-xl transition-all border border-gray-200 cursor-pointer shadow-2xs"
          >
            + YouTube Dedicated
          </button>
          <button
            type="button"
            onClick={() => handleAddDeliverable("yt_short")}
            className="px-3.5 py-2 text-xs font-bold bg-gray-50 hover:bg-black hover:text-white text-gray-800 rounded-xl transition-all border border-gray-200 cursor-pointer shadow-2xs"
          >
            + YouTube Short
          </button>
        </div>
      </div>
    </div>
  );
}
