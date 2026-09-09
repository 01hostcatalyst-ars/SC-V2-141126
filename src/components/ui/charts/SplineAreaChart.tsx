"use client";

import React, { useState, useMemo, useRef } from "react";

export interface DataPoint {
  label: string;
  value: number;
  secondaryValue?: number;
  lowValue?: number;
  highValue?: number;
}

export interface SplineAreaChartProps {
  data: DataPoint[];
  height?: number;
  strokeColor?: string;
  gradientFrom?: string;
  gradientTo?: string;
  valuePrefix?: string;
  valueSuffix?: string;
  showConfidenceBand?: boolean;
  className?: string;
}

/**
 * High-craft, responsive SVG Spline Area Chart.
 * Computes smooth cubic Bézier curves through data points without external charting libraries.
 * 100% SSR friendly, zero hydration errors, flawless performance on mobile.
 */
export function SplineAreaChart({
  data,
  height = 180,
  strokeColor = "#059669",
  gradientFrom = "rgba(5, 150, 105, 0.18)",
  gradientTo = "rgba(5, 150, 105, 0.0)",
  valuePrefix = "$",
  valueSuffix = "",
  showConfidenceBand = false,
  className = "",
}: SplineAreaChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const padding = { top: 16, right: 16, bottom: 28, left: 16 };
  const viewBoxWidth = 500;
  const viewBoxHeight = height;

  const chartWidth = viewBoxWidth - padding.left - padding.right;
  const chartHeight = viewBoxHeight - padding.top - padding.bottom;

  const { minVal, maxVal, coordinates, bandCoordinates } = useMemo(() => {
    if (!data || data.length === 0) {
      return { minVal: 0, maxVal: 1, coordinates: [], bandCoordinates: [] };
    }

    const allValues = data.flatMap((d) => [
      d.value,
      d.lowValue ?? d.value,
      d.highValue ?? d.value,
    ]);

    const rawMin = Math.min(...allValues);
    const rawMax = Math.max(...allValues);
    const paddingMultiplier = (rawMax - rawMin) * 0.12 || 10;
    const minVal = Math.max(0, rawMin - paddingMultiplier);
    const maxVal = rawMax + paddingMultiplier;
    const valRange = maxVal - minVal || 1;

    const coords = data.map((d, i) => {
      const x = padding.left + (i / (data.length - 1 || 1)) * chartWidth;
      const y = padding.top + chartHeight - ((d.value - minVal) / valRange) * chartHeight;
      return { x, y, data: d };
    });

    const bandCoords = data.map((d, i) => {
      const x = padding.left + (i / (data.length - 1 || 1)) * chartWidth;
      const lowY = padding.top + chartHeight - (((d.lowValue ?? d.value * 0.85) - minVal) / valRange) * chartHeight;
      const highY = padding.top + chartHeight - (((d.highValue ?? d.value * 1.2) - minVal) / valRange) * chartHeight;
      return { x, lowY, highY };
    });

    return { minVal, maxVal, coordinates: coords, bandCoordinates: bandCoords };
  }, [data, chartWidth, chartHeight, padding.left, padding.top]);

  // Generate smooth cubic Bézier SVG path
  const { linePath, areaPath, bandAreaPath } = useMemo(() => {
    if (coordinates.length === 0) return { linePath: "", areaPath: "", bandAreaPath: "" };
    if (coordinates.length === 1) {
      const c = coordinates[0];
      return {
        linePath: `M ${c.x} ${c.y}`,
        areaPath: `M ${c.x} ${c.y} L ${c.x} ${padding.top + chartHeight} Z`,
        bandAreaPath: "",
      };
    }

    // Cubic Bezier curve algorithm
    let d = `M ${coordinates[0].x} ${coordinates[0].y}`;
    for (let i = 0; i < coordinates.length - 1; i++) {
      const p0 = coordinates[i === 0 ? 0 : i - 1];
      const p1 = coordinates[i];
      const p2 = coordinates[i + 1];
      const p3 = coordinates[i + 2] || p2;

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }

    const last = coordinates[coordinates.length - 1];
    const first = coordinates[0];
    const bottom = padding.top + chartHeight;
    const aPath = `${d} L ${last.x} ${bottom} L ${first.x} ${bottom} Z`;

    // Optional confidence band path
    let bPath = "";
    if (showConfidenceBand && bandCoordinates.length > 1) {
      let topCurve = `M ${bandCoordinates[0].x} ${bandCoordinates[0].highY}`;
      for (let i = 0; i < bandCoordinates.length - 1; i++) {
        const p1 = bandCoordinates[i];
        const p2 = bandCoordinates[i + 1];
        topCurve += ` L ${p2.x} ${p2.highY}`;
      }
      let bottomCurve = "";
      for (let i = bandCoordinates.length - 1; i >= 0; i--) {
        bottomCurve += ` L ${bandCoordinates[i].x} ${bandCoordinates[i].lowY}`;
      }
      bPath = `${topCurve} ${bottomCurve} Z`;
    }

    return { linePath: d, areaPath: aPath, bandAreaPath: bPath };
  }, [coordinates, bandCoordinates, showConfidenceBand, padding.top, chartHeight]);

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!containerRef.current || coordinates.length === 0) return;
    const rect = containerRef.current.getBoundingClientRect();
    const relativeX = (e.clientX - rect.left) / rect.width;
    const index = Math.round(relativeX * (coordinates.length - 1));
    const clamped = Math.max(0, Math.min(coordinates.length - 1, index));
    setHoverIndex(clamped);
  };

  const handleMouseLeave = () => setHoverIndex(null);

  const activePoint = hoverIndex !== null ? coordinates[hoverIndex] : null;

  return (
    <div ref={containerRef} className={`relative w-full select-none ${className}`}>
      <svg
        viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
        className="w-full h-auto overflow-visible cursor-crosshair"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <defs>
          <linearGradient id="splineGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={gradientFrom} />
            <stop offset="100%" stopColor={gradientTo} />
          </linearGradient>
          <linearGradient id="bandGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={strokeColor} stopOpacity="0.08" />
            <stop offset="100%" stopColor={strokeColor} stopOpacity="0.02" />
          </linearGradient>
        </defs>

        {/* Confidence Band Area */}
        {showConfidenceBand && bandAreaPath && (
          <path d={bandAreaPath} fill="url(#bandGradient)" />
        )}

        {/* Gradient Fill Under Curve */}
        {areaPath && <path d={areaPath} fill="url(#splineGradient)" />}

        {/* The Smooth Spline Curve Line */}
        {linePath && (
          <path
            d={linePath}
            fill="none"
            stroke={strokeColor}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}

        {/* Data Points */}
        {coordinates.map((c, i) => (
          <circle
            key={i}
            cx={c.x}
            cy={c.y}
            r={hoverIndex === i ? 4.5 : 2}
            fill="#ffffff"
            stroke={strokeColor}
            strokeWidth={hoverIndex === i ? 2.5 : 1.5}
            className="transition-all duration-150"
          />
        ))}

        {/* Active Hover Crosshair Line */}
        {activePoint && (
          <g>
            <line
              x1={activePoint.x}
              y1={padding.top}
              x2={activePoint.x}
              y2={padding.top + chartHeight}
              stroke="rgba(9, 9, 11, 0.2)"
              strokeDasharray="3 3"
              strokeWidth="1"
            />
            <circle
              cx={activePoint.x}
              cy={activePoint.y}
              r="6"
              fill={strokeColor}
              stroke="#ffffff"
              strokeWidth="2"
            />
          </g>
        )}

        {/* X-Axis Labels */}
        {coordinates.map((c, i) => (
          <text
            key={i}
            x={c.x}
            y={viewBoxHeight - 6}
            textAnchor="middle"
            className="text-[9px] font-mono fill-zinc-400 font-semibold uppercase"
          >
            {c.data.label}
          </text>
        ))}
      </svg>

      {/* Floating Interactive Tooltip */}
      {activePoint && (
        <div
          className="absolute pointer-events-none z-20 px-2.5 py-1.5 rounded-lg bg-zinc-950 text-white shadow-xl border border-zinc-800 text-[11px] font-mono whitespace-nowrap -translate-x-1/2 -translate-y-full transition-all duration-75"
          style={{
            left: `${(activePoint.x / viewBoxWidth) * 100}%`,
            top: `${(activePoint.y / viewBoxHeight) * 100 - 8}%`,
          }}
        >
          <div className="text-[9px] text-zinc-400 font-sans uppercase font-bold">{activePoint.data.label}</div>
          <div className="font-bold text-emerald-400">
            {valuePrefix}
            {activePoint.data.value.toLocaleString()}
            {valueSuffix}
          </div>
        </div>
      )}
    </div>
  );
}
