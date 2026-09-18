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

  const { metrics, lineItems, valuationRange, negotiationRange } = result;

  const erPerformanceDiff = metrics.performanceMultiplier - 1.0;
  const isPerformanceBoost = erPerformanceDiff > 0.02;
  const isPerformancePenalty = erPerformanceDiff < -0.02;

  const handleExportToContract = () => {
    const primaryDeliverable = input.deliverables[0];
    const platformParam = primaryDeliverable?.platform
      ? primaryDeliverable.platform.toUpperCase()
      : "INSTAGRAM";
    const amountParam = valuationRange.typicalMedian.toString();
    const currencyParam = metrics.currency;
    const regionParam = metrics.regionApplied;

    const deliverablesData = input.deliverables.map((d) => ({
      type: d.format.toUpperCase(),
      quantity: d.quantity,
      duration: "12 Months",
      notes: `${FORMAT_LABELS[d.format]?.label || d.format}${
        d.isCrossPost ? " (Cross-posted asset -50%)" : ""
      }`,
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
    const summaryText = `--- SIGNCOLLAB INFLUENCER VALUATION ---
Creator Scale: ${metrics.followerCount.toLocaleString()} Followers / Subscribers
Observed Engagement: ${metrics.observedER}% (Tier Benchmark: ${metrics.benchmarkER}%)
Engagement Performance: ${metrics.performanceMultiplier >= 1 ? '+' : ''}${Math.round((metrics.performanceMultiplier - 1) * 100)}% vs Tier Benchmark
Commercial Vertical: ${metrics.primaryNicheName}

Defended Negotiation Range (${metrics.currency}):
• Budget Offer (25th Pct / Floor): ${valuationRange.formatted.low}
• Typical Market Rate (50th Pct / Defended Median): ${valuationRange.formatted.typical}
• Premium Ask (75th Pct / Agency): ${valuationRange.formatted.high}

Deliverable Scope:
${input.deliverables
  .map(
    (d) =>
      `• ${d.quantity}x ${FORMAT_LABELS[d.format]?.label || d.format}${
        d.isCrossPost ? " (Cross-Post)" : ""
      }`
  )
  .join("\n")}

Net Deliverable Total: $${lineItems.netContentFeeUSD} USD
Commercial Rights: +$${lineItems.commercialRightsFeeUSD} USD
Production Add-ons: +$${lineItems.productionAddonsFeeUSD} USD
Total Global USD: $${lineItems.totalUSD} USD
Localized Currency: ${metrics.currency} (${metrics.regionApplied} Market)

Generated via SignCollab 16-Knot Rate Engine (Zero Mock Data / Database Verified)`;

    navigator.clipboard.writeText(summaryText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-6 sm:p-8 shadow-xl shadow-gray-200/50 border border-gray-200/90 sticky top-24 space-y-6 transition-all">
      {/* Card Header */}
      <div className="flex items-center justify-between border-b border-gray-100 pb-4">
        <div className="flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-100 animate-pulse" />
          <span className="text-[11px] font-black uppercase tracking-wider text-gray-950">
            Defended Market Valuation
          </span>
        </div>
        <button
          type="button"
          onClick={handleCopyRateCard}
          className="text-xs font-bold text-gray-700 hover:text-black px-3 py-1.5 rounded-xl border border-gray-200 hover:border-gray-400 bg-gray-50 hover:bg-white transition-all cursor-pointer shadow-2xs inline-flex items-center gap-1.5"
        >
          <svg className="w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          </svg>
          <span>{copied ? "Copied!" : "Copy Summary"}</span>
        </button>
      </div>

      {/* Hero Pricing Display */}
      <div className="text-center py-6 bg-gradient-to-b from-gray-50 to-white rounded-3xl border border-gray-200/80 p-6 space-y-1.5 shadow-2xs">
        <div className="text-[11px] font-black text-gray-500 uppercase tracking-widest">
          Typical Defended Rate (Median)
        </div>
        <div className="text-4xl sm:text-5xl font-black tracking-tight text-gray-950 font-mono transition-transform">
          {valuationRange.formatted.typical}
        </div>
        <div className="text-xs text-gray-500 font-semibold pt-1">
          Calibrated in <span className="font-bold text-gray-800">{metrics.currency}</span> ({metrics.regionApplied} Market)
        </div>
      </div>

      {/* Defended Negotiation Bounds (25th Pct / 75th Pct) */}
      <div className="grid grid-cols-2 gap-3.5">
        <div className="bg-gray-50/90 border border-gray-200/80 p-4 rounded-2xl text-center space-y-0.5 shadow-2xs">
          <div className="text-[10px] font-black uppercase tracking-wider text-gray-500">
            Budget Offer (25th Pct)
          </div>
          <div className="text-sm sm:text-base font-black font-mono text-gray-900">
            {valuationRange.formatted.low}
          </div>
          <div className="text-[10px] text-gray-400 font-medium">Negotiation Floor</div>
        </div>

        <div className="bg-gray-50/90 border border-gray-200/80 p-4 rounded-2xl text-center space-y-0.5 shadow-2xs">
          <div className="text-[10px] font-black uppercase tracking-wider text-gray-500">
            Premium Ask (75th Pct)
          </div>
          <div className="text-sm sm:text-base font-black font-mono text-gray-900">
            {valuationRange.formatted.high}
          </div>
          <div className="text-[10px] text-gray-400 font-medium">Agency Represented</div>
        </div>
      </div>

      {/* Engagement & Performance Velocity Badge */}
      <div className="p-4 rounded-2xl bg-gray-50/80 border border-gray-200/80 space-y-2.5 text-xs shadow-2xs">
        <div className="flex items-center justify-between">
          <span className="text-gray-600 font-medium">Observed Engagement Rate:</span>
          <span className="font-black font-mono text-gray-900">{metrics.observedER}%</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-600 font-medium">Benchmark Engagement (ER):</span>
          <span className="font-mono font-bold text-gray-700">{metrics.benchmarkER}%</span>
        </div>
        <div className="pt-2 border-t border-gray-200 flex items-center justify-between">
          <span className="text-gray-600 font-medium">Audited Performance:</span>
          <span
            className={`font-black font-mono px-2.5 py-1 rounded-xl text-[11px] shadow-2xs ${
              isPerformanceBoost
                ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                : isPerformancePenalty
                ? "bg-amber-100 text-amber-800 border border-amber-200"
                : "bg-gray-200 text-gray-800 border border-gray-300"
            }`}
          >
            {isPerformanceBoost
              ? `+${Math.round((metrics.performanceMultiplier - 1) * 100)}% (Outperformer)`
              : isPerformancePenalty
              ? `${Math.round((metrics.performanceMultiplier - 1) * 100)}% (Below Tier)`
              : "Baseline (At Benchmark)"}
          </span>
        </div>
      </div>

      {/* Itemized Calculation Breakdown Accordion */}
      <div className="border border-gray-200/90 rounded-2xl overflow-hidden bg-white shadow-2xs">
        <button
          type="button"
          onClick={() => setShowBreakdown(!showBreakdown)}
          className="w-full px-5 py-3.5 text-xs font-black uppercase tracking-wider text-gray-800 hover:text-black flex items-center justify-between transition-colors cursor-pointer bg-gray-50/60 hover:bg-gray-100/70"
        >
          <span>Transparent Math Breakdown</span>
          <span className="text-gray-500 text-xs font-mono">{showBreakdown ? "Hide ▲" : "View ▼"}</span>
        </button>

        {showBreakdown && (
          <div className="p-5 space-y-3 text-xs border-t border-gray-200/80 text-gray-700 animate-fadeIn font-mono bg-gradient-to-b from-gray-50/30 to-white">
            {lineItems.deliverables.map((item, idx) => (
              <div key={idx} className="flex justify-between text-[11px] text-gray-600">
                <span>
                  {item.quantity}x {FORMAT_LABELS[item.format]?.label || item.format}
                </span>
                <span className="font-bold text-gray-800">${item.finalDeliverableFeeUSD} USD</span>
              </div>
            ))}

            {lineItems.bundleDiscountAmountUSD > 0 && (
              <div className="flex justify-between text-emerald-700 text-[11px] font-bold">
                <span>Multi-Asset Discount ({lineItems.bundleDiscountApplied})</span>
                <span>-${lineItems.bundleDiscountAmountUSD} USD</span>
              </div>
            )}

            {lineItems.commercialRightsFeeUSD > 0 && (
              <div className="flex justify-between text-blue-700 text-[11px] font-bold">
                <span>Commercial Rights &amp; Exclusivity</span>
                <span>+${lineItems.commercialRightsFeeUSD} USD</span>
              </div>
            )}

            {lineItems.productionAddonsFeeUSD > 0 && (
              <div className="flex justify-between text-purple-700 text-[11px] font-bold">
                <span>Production Add-ons</span>
                <span>+${lineItems.productionAddonsFeeUSD} USD</span>
              </div>
            )}

            <div className="pt-3 border-t border-gray-200 flex justify-between font-black text-sm text-gray-950">
              <span>Total Global Benchmark</span>
              <span>${lineItems.totalUSD} USD</span>
            </div>
          </div>
        )}
      </div>

      {/* Primary Action Button: 1-Click Instant Contract Export */}
      <div className="space-y-3 pt-2">
        <button
          type="button"
          onClick={handleExportToContract}
          className="w-full py-4 px-5 rounded-2xl bg-black text-white font-black text-xs sm:text-sm uppercase tracking-wider hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl cursor-pointer flex items-center justify-center gap-2.5 group"
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

        <p className="text-[11px] text-gray-500 text-center leading-tight font-medium">
          Transfers deliverables, duration, commercial rights, and compensation into SignCollab bilateral contract wizard.
        </p>
      </div>
    </div>
  );
}
