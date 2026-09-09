"use client";

import React, { useState } from "react";

export interface ChannelShareItem {
  id: string;
  name: string;
  count: number;
  percentage: number;
  color: string;
  dotColor: string;
}

export interface SegmentedReachBarProps {
  items: ChannelShareItem[];
  totalReach: number;
  className?: string;
  onSelectChannel?: (id: string) => void;
  selectedChannelId?: string;
}

/**
 * High-craft Segmented Reach Bar.
 * Clean, tactile, responsive audience distribution bar with hover tooltips and interactive platform chips.
 */
export function SegmentedReachBar({
  items,
  totalReach,
  className = "",
  onSelectChannel,
  selectedChannelId,
}: SegmentedReachBarProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <div className={`space-y-3 text-left ${className}`}>
      {/* The Multi-Segment Bar */}
      <div className="h-3 w-full bg-zinc-100 rounded-full overflow-hidden flex gap-0.5 p-0.5 border border-zinc-200/80 shadow-inner">
        {items.map((item) => (
          <div
            key={item.id}
            onClick={() => onSelectChannel?.(item.id)}
            onMouseEnter={() => setHoveredId(item.id)}
            onMouseLeave={() => setHoveredId(null)}
            style={{ width: `${Math.max(item.percentage, 2)}%` }}
            className={`h-full rounded-full transition-all duration-200 cursor-pointer ${
              hoveredId && hoveredId !== item.id ? "opacity-40" : "opacity-100"
            } ${selectedChannelId === item.id ? "ring-2 ring-zinc-950 ring-offset-1" : ""}`}
          >
            <div className={`w-full h-full rounded-full ${item.color}`} />
          </div>
        ))}
      </div>

      {/* Legend & Stat Chips */}
      <div className="flex flex-wrap items-center gap-2 pt-1">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelectChannel?.(item.id)}
            onMouseEnter={() => setHoveredId(item.id)}
            onMouseLeave={() => setHoveredId(null)}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all border cursor-pointer ${
              selectedChannelId === item.id || hoveredId === item.id
                ? "bg-zinc-950 text-white border-zinc-950 shadow-sm"
                : "bg-white text-zinc-700 border-zinc-200/80 hover:border-zinc-400 hover:bg-zinc-50"
            }`}
          >
            <span className={`w-2 h-2 rounded-full shrink-0 ${item.dotColor}`} />
            <span>{item.name}</span>
            <span className="font-mono text-[11px] opacity-75">
              {item.percentage.toFixed(0)}%
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
