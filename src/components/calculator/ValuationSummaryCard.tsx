"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { CalculationResult, PricingInput } from "@/lib/calculator/types";
import { FORMAT_LABELS } from "@/lib/calculator/constants";

interface ValuationSummaryCardProps {
  result: CalculationResult;
  input: PricingInput;
}

export function ValuationSummaryCard({ result, input }: ValuationSummaryCardProps) {
  const router = useRouter();
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [copied, setCopied] = useState(false);

  const { metrics, lineItems, valuationRange } = result;

  const erPerformanceDiff = metrics.performanceMultiplier - 1.0;
  const isPerformanceBoost = erPerformanceDiff > 0.02;
  const isPerformancePenalty = erPerformanceDiff < -0.02;

  const handleExportToContract = () => {
    const primaryDeliverable = input.deliverables[0];
    const platformParam = primaryDeliverable?.platform ? primaryDeliverable.platform.toUpperCase() : "INSTAGRAM";
    const amountParam = valuationRange.typicalMedian.toString();
    const currencyParam = metrics.currency;
    const regionParam = metrics.regionApplied;

    const deliverablesData = input.deliverables.map((d) => ({
      type: d.format.toUpperCase(),
      quantity: d.quantity,
      duration: "12 Months",
      notes: `${FORMAT_LABELS[d.format]?.label || d.format}${d.isCrossPost ? " (Cross-posted asset)" : ""}`,
    }));

    const queryParams = new URLSearchParams({
      from: "calculator",
      platform: platformParam,
      amount: amountParam,
      currency: currencyParam,
      region: regionParam,
      deliverables: JSON.stringify(deliverablesData),
      usageScope: input.commercialTerms?.usageRights?.scope || "organic_repost",
      usageDuration: input.commercialTerms?.usageRights?.duration || "30_days",
      exclusivityScope: input.commercialTerms?.exclusivity?.scope || "none",
      exclusivityDuration: input.commercialTerms?.exclusivity?.duration || "14_days",
    });

    router.push(`/instant?${queryParams.toString()}`);
  };

  const handleCopyRateCard = () => {
    const summaryText = `--- SIGNCOLLAB INFLUENCER ESTIMATE ---
Audience: ${metrics.followerCount.toLocaleString()} Followers
Observed ER: ${metrics.observedER}% (Benchmark: ${metrics.benchmarkER}%)
Market Valuation Range:
- 25th Percentile (Low): ${valuationRange.formatted.low}
- Typical Market Rate (Median): ${valuationRange.formatted.typical}
- 75th Percentile (High / Agency): ${valuationRange.formatted.high}
Deliverables: ${input.deliverables.map((d) => `${d.quantity}x ${FORMAT_LABELS[d.format]?.label || d.format}`).join(", ")}
Currency: ${metrics.currency}
Generated via SignCollab Rate Engine`;

    navigator.clipboard.writeText(summaryText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-lg shadow-gray-100 border border-gray-200/90 sticky top-24 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-100 pb-4">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 ring-4 ring-emerald-50" />
          <span className="text-[11px] font-black uppercase tracking-wider text-gray-900">
            Market Benchmark
          </span>
        </div>
        <button
          type="button"
          onClick={handleCopyRateCard}
          className="text-xs font-bold text-gray-600 hover:text-black px-2.5 py-1 rounded-lg border border-gray-200 hover:border-gray-400 bg-gray-50 hover:bg-white transition-all cursor-pointer shadow-2xs inline-flex items-center gap-1.5"
        >
          <svg className="w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          <span>{copied ? "Copied!" : "Copy Summary"}</span>
        </button>
      </div>

      {/* Main Typical Price Box */}
      <div className="text-center py-5 bg-gradient-to-b from-gray-50/90 to-gray-50/30 rounded-2xl border border-gray-200/80 p-5 space-y-1">
        <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
          Typical Market Rate (Median)
        </div>
        <div className="text-4xl sm:text-5xl font-black tracking-tight text-gray-950 font-mono">
          {valuationRange.formatted.typical}
        </div>
        <div className="text-[11px] text-gray-500 font-semibold pt-1">
          Calibrated in {metrics.currency} ({metrics.regionApplied} Market)
        </div>
      </div>

      {/* 25th to 75th Percentile Range Grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gray-50/80 border border-gray-200/80 p-3.5 rounded-xl text-center">
          <div className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
            Low (25th Pct)
          </div>
          <div className="text-sm sm:text-base font-bold font-mono text-gray-900 mt-0.5">
            {valuationRange.formatted.low}
          </div>
          <div className="text-[10px] text-gray-400 font-medium mt-0.5">High supply / entry</div>
        </div>

        <div className="bg-gray-50/80 border border-gray-200/80 p-3.5 rounded-xl text-center">
          <div className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
            High (75th Pct)
          </div>
          <div className="text-sm sm:text-base font-bold font-mono text-gray-900 mt-0.5">
            {valuationRange.formatted.high}
          </div>
          <div className="text-[10px] text-gray-400 font-medium mt-0.5">Agency represented</div>
        </div>
      </div>

      {/* Organic Performance Breakdown Strip */}
      <div className="p-4 rounded-xl bg-gray-50/70 border border-gray-200/80 space-y-2 text-xs">
        <div className="flex items-center justify-between">
          <span className="text-gray-600 font-medium">Observed Engagement Rate:</span>
          <span className="font-bold font-mono text-gray-900">{metrics.observedER}%</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-600 font-medium">Tier Benchmark ER:</span>
          <span className="font-mono text-gray-700">{metrics.benchmarkER}%</span>
        </div>
        <div className="pt-2 border-t border-gray-200/70 flex items-center justify-between">
          <span className="text-gray-600 font-medium">Performance Factor:</span>
          <span
            className={`font-bold font-mono px-2 py-0.5 rounded-md text-[11px] ${
              isPerformanceBoost
                ? "bg-emerald-100 text-emerald-800"
                : isPerformancePenalty
                ? "bg-amber-100 text-amber-800"
                : "bg-gray-200 text-gray-800"
            }`}
          >
            {metrics.performanceMultiplier}x ({isPerformanceBoost ? `+${Math.round((metrics.performanceMultiplier - 1) * 100)}%` : isPerformancePenalty ? `${Math.round((metrics.performanceMultiplier - 1) * 100)}%` : "Baseline"})
          </span>
        </div>
      </div>

      {/* Itemized Fee Breakdown Accordion */}
      <div className="border border-gray-200/80 rounded-xl overflow-hidden bg-white">
        <button
          type="button"
          onClick={() => setShowBreakdown(!showBreakdown)}
          className="w-full px-4 py-3 text-xs font-bold text-gray-800 hover:text-black flex items-center justify-between transition-colors cursor-pointer bg-gray-50/50 hover:bg-gray-100/60"
        >
          <span>Itemized Calculation Breakdown</span>
          <span className="text-gray-500 text-xs">{showBreakdown ? "Hide ▲" : "View ▼"}</span>
        </button>

        {showBreakdown && (
          <div className="p-4 space-y-2.5 text-xs border-t border-gray-200/80 text-gray-700 animate-fadeIn font-mono">
            {lineItems.deliverables.map((item, idx) => (
              <div key={idx} className="flex justify-between text-[11px] text-gray-600">
                <span>
                  {item.quantity}x {FORMAT_LABELS[item.format]?.label || item.format}
                </span>
                <span>${item.finalDeliverableFeeUSD} USD</span>
              </div>
            ))}

            {lineItems.bundleDiscountAmountUSD > 0 && (
              <div className="flex justify-between text-emerald-700 text-[11px] font-semibold">
                <span>Bundle Discount ({lineItems.bundleDiscountApplied})</span>
                <span>-${lineItems.bundleDiscountAmountUSD} USD</span>
              </div>
            )}

            {lineItems.commercialRightsFeeUSD > 0 && (
              <div className="flex justify-between text-blue-700 text-[11px] font-semibold">
                <span>Commercial Rights &amp; Exclusivity</span>
                <span>+${lineItems.commercialRightsFeeUSD} USD</span>
              </div>
            )}

            {lineItems.productionAddonsFeeUSD > 0 && (
              <div className="flex justify-between text-purple-700 text-[11px] font-semibold">
                <span>Production Add-ons</span>
                <span>+${lineItems.productionAddonsFeeUSD} USD</span>
              </div>
            )}

            <div className="pt-2.5 border-t border-gray-200 flex justify-between font-bold text-gray-950">
              <span>Total USD Benchmark</span>
              <span>${lineItems.totalUSD} USD</span>
            </div>
          </div>
        )}
      </div>

      {/* Primary Action Button: Bridge into Instant Contract */}
      <div className="space-y-2.5 pt-1">
        <button
          type="button"
          onClick={handleExportToContract}
          className="w-full py-4 px-4 rounded-xl bg-black text-white font-black text-xs sm:text-sm uppercase tracking-wide hover:bg-gray-800 transition-all shadow-md hover:shadow-lg cursor-pointer flex items-center justify-center gap-2 group"
        >
          <span>Create Contract with this Estimate</span>
          <svg
            className="w-4 h-4 transition-transform group-hover:translate-x-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </button>

        <p className="text-[10px] text-gray-500 text-center leading-tight font-medium">
          Transfers deliverables, duration, rights, and compensation into SignCollab bilateral contract wizard.
        </p>
      </div>
    </div>
  );
}
