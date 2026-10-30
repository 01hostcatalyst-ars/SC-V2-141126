"use client";

import React, { useId } from "react";
import { Info } from "lucide-react";

export interface PriceRangeRate {
  recommendedAmount: number;
  formattedRecommended: string;
  lowAmount: number;
  formattedLow: string;
  highAmount: number;
  formattedHigh: string;
  symbol: string;
}

// Display formatting only; the calculator's numeric outputs are preserved.
export function formatCardEstimate(rate: PriceRangeRate): string {
  const amount = rate.recommendedAmount;
  if (!Number.isFinite(amount) || Math.abs(amount) < 1000) return rate.formattedRecommended;
  const unit = Math.abs(amount) >= 1000000 ? "M" : "K";
  const divisor = unit === "M" ? 1000000 : 1000;
  return `${rate.symbol}${(amount / divisor).toFixed(1)}${unit}`;
}

// This percentage only positions the visual marker; it never feeds pricing.
export function getRangeMarkerPosition(low: number, typical: number, high: number): number {
  if (![low, typical, high].every(Number.isFinite) || high <= low) return 50;
  return Math.max(0, Math.min(100, ((typical - low) / (high - low)) * 100));
}

export function CreatorPriceRange({ rate, label }: { rate: PriceRangeRate; label: string }) {
  const tooltipId = useId();
  const displayLabel = ({ "TikTok Video": "TikTok", "Instagram Reel": "Reel", "YouTube long-form": "Long Form", "YouTube Shorts": "Shorts" } as Record<string, string>)[label] || label;
  const position = getRangeMarkerPosition(rate.lowAmount, rate.recommendedAmount, rate.highAmount);
  const low = formatCardEstimate({ ...rate, recommendedAmount: rate.lowAmount, formattedRecommended: rate.formattedLow });
  const high = formatCardEstimate({ ...rate, recommendedAmount: rate.highAmount, formattedRecommended: rate.formattedHigh });
  return (
    <figure className="creator-price-range" aria-label={`${label}. Typical estimate ${rate.formattedRecommended}. Estimated range ${rate.formattedLow} to ${rate.formattedHigh}.`}>
      <figcaption className="price-range-heading">
        <p className="price-range-format">{displayLabel}</p>
          <span className="price-estimate-info">
            <button type="button" className="price-estimate-pill" aria-describedby={tooltipId}>
              Typical estimate <Info aria-hidden="true" className="h-3 w-3 shrink-0" strokeWidth={1.75} />
            </button>
            <span id={tooltipId} role="tooltip" className="price-estimate-tooltip">
              Calculated by SignCollab’s pricing engine using creator performance, content format, market, and commercial factors. The model is calibrated using creator surveys, direct pricing research, case studies, agency deal history, and contract data. AI does not calculate these prices. The range is a negotiation benchmark; the creator’s final quote may differ.
            </span>
          </span>
        <strong className="price-range-value" title={rate.formattedRecommended}>{formatCardEstimate(rate)}</strong>
      </figcaption>
      <div className="price-range-track" aria-hidden="true">
        <div className="price-range-band" />
        <span className="price-range-marker" style={{ left: `${position}%` }} />
      </div>
      <div className="price-range-endpoints">
        <span title={rate.formattedLow}><span className="price-range-caption">Low</span><strong>{low}</strong></span>
        <span title={rate.formattedHigh}><span className="price-range-caption">High</span><strong>{high}</strong></span>
      </div>
    </figure>
  );
}

