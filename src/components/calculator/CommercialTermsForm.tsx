"use client";

import React, { useState } from "react";
import {
  CommercialTerms,
  PlacementScope,
  RightsDuration,
  ExclusivityScope,
  ExclusivityDuration,
} from "@/lib/calculator/types";
import { USAGE_RATES, EXCLUSIVITY_RATES } from "@/lib/calculator/constants";

interface CommercialTermsFormProps {
  terms?: CommercialTerms;
  onChange: (updated: CommercialTerms) => void;
  usageRates?: Record<string, Record<string, number>>;
  exclusivityRates?: Record<string, Record<string, number>>;
}

const SCOPE_OPTIONS: Array<{ value: PlacementScope; label: string; desc: string }> = [
  { value: "organic_repost", label: "Organic Social Reposting Only", desc: "Brand reposts content natively on owned brand social feeds without paid ad boost" },
  { value: "paid_partnership_ads", label: "Paid Partnership Ads / Spark Ads", desc: "Run as boosted/dark ads through Meta Ads Manager, TikTok Spark, or YouTube Paid Ads" },
  { value: "whitelisting", label: "Creator Whitelisting / Handle Access", desc: "Brand runs ads directly through the creator's verified social handle profile" },
  { value: "website_pdp", label: "E-Commerce Website & Product Pages", desc: "Embed assets on product detail pages (PDP), promotional landing pages, and storefronts" },
  { value: "email_crm", label: "Email Marketing & CRM Newsletters", desc: "Feature visuals in customer acquisition emails, retention drips, and brand newsletters" },
  { value: "tv_streaming", label: "TV / CTV & Broadcast Streaming", desc: "Commercial television broadcasts, OTT streaming platforms, and connected TV ads" },
  { value: "ooh_print", label: "Out-of-Home (OOH) & Print Media", desc: "In-store retail displays, print catalogs, billboards, and trade show banners" },
  { value: "perpetual_buyout", label: "Full Perpetual IP Ownership Buyout", desc: "Brand retains unlimited global perpetual usage rights across all commercial mediums" },
];

const DURATION_OPTIONS: Array<{ value: RightsDuration; label: string }> = [
  { value: "30_days", label: "30 Days (1 Month)" },
  { value: "60_days", label: "60 Days (2 Months)" },
  { value: "90_days", label: "90 Days (Quarterly Campaign)" },
  { value: "6_months", label: "6 Months (Semi-Annual)" },
  { value: "12_months", label: "12 Months (1 Year)" },
  { value: "perpetual", label: "Perpetual (Unlimited)" },
];

const EXCLUSIVITY_SCOPE_OPTIONS: Array<{ value: ExclusivityScope; label: string; desc: string }> = [
  { value: "none", label: "No Exclusivity (Non-Exclusive)", desc: "Creator remains free to collaborate with any other brand immediately" },
  { value: "direct_competitors", label: "Direct Competitors (3–5 Named Brands)", desc: "Restricts partnering with specified direct competitive brands in the exact niche" },
  { value: "full_category", label: "Full Category Lockout", desc: "Complete lockout from partnering with any brand in this entire vertical category" },
];

const EXCLUSIVITY_DURATION_OPTIONS: Array<{ value: ExclusivityDuration; label: string }> = [
  { value: "14_days", label: "14 Days (Campaign Buffer)" },
  { value: "30_days", label: "30 Days (1 Month)" },
  { value: "60_days", label: "60 Days (2 Months)" },
  { value: "90_days", label: "90 Days (Quarterly)" },
  { value: "6_months", label: "6 Months" },
  { value: "12_months", label: "12 Months (Annual)" },
];

export function CommercialTermsForm({
  terms,
  onChange,
  usageRates = USAGE_RATES as unknown as Record<string, Record<string, number>>,
  exclusivityRates = EXCLUSIVITY_RATES as unknown as Record<string, Record<string, number>>,
}: CommercialTermsFormProps) {
  const [isOpen, setIsOpen] = useState(true);

  const activeUsageScope = terms?.usageRights?.scope || "organic_repost";
  const activeUsageDuration = terms?.usageRights?.duration || "30_days";
  const activeExclScope = terms?.exclusivity?.scope || "none";
  const activeExclDuration = terms?.exclusivity?.duration || "14_days";

  const currentUsagePercent = usageRates[activeUsageScope]?.[activeUsageDuration] || 0;
  const currentExclPercent = exclusivityRates[activeExclScope]?.[activeExclDuration] || 0;

  const handleUpdateUsage = (scope: PlacementScope, duration: RightsDuration) => {
    onChange({
      ...terms,
      usageRights: { scope, duration },
    });
  };

  const handleUpdateExclusivity = (scope: ExclusivityScope, duration: ExclusivityDuration) => {
    onChange({
      ...terms,
      exclusivity: { scope, duration },
    });
  };

  return (
    <div className="bg-white/95 backdrop-blur-xl rounded-3xl border border-gray-200/90 shadow-sm p-6 sm:p-8 space-y-7 transition-all">
      {/* Step Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-5">
        <div className="flex items-center gap-3.5">
          <div className="w-9 h-9 rounded-2xl bg-black text-white flex items-center justify-center font-black text-xs shadow-sm tracking-wider">
            03
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black text-gray-950 uppercase tracking-tight font-display">
              Commercial Licensing &amp; Exclusivity
            </h2>
            <p className="text-xs text-gray-500 font-medium">
              Digital paid rights, advertising duration windows, and competitor restrictions
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="text-xs font-bold text-gray-600 hover:text-black self-start sm:self-auto transition-colors cursor-pointer px-3 py-1.5 rounded-xl hover:bg-gray-100 border border-gray-200/70"
        >
          {isOpen ? "Collapse ▲" : "Expand ▼"}
        </button>
      </div>

      {isOpen && (
        <div className="space-y-6 animate-fadeIn">
          {/* Usage Rights Section */}
          <div className="space-y-3.5 bg-gray-50/70 p-5 rounded-2xl border border-gray-200/80 shadow-2xs">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black uppercase tracking-wider text-gray-900 flex items-center gap-2">
                <span>Paid Digital Advertising &amp; Usage Rights</span>
              </label>
              <span className="px-3 py-1 rounded-xl bg-gray-950 text-white text-[11px] font-mono font-bold shadow-2xs">
                {currentUsagePercent > 0 ? `+${Math.round(currentUsagePercent * 100)}% Surcharge` : "Included (0%)"}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="text-[11px] font-bold text-gray-600 block mb-1.5">Distribution Scope</label>
                <select
                  value={activeUsageScope}
                  onChange={(e) => handleUpdateUsage(e.target.value as PlacementScope, activeUsageDuration)}
                  className="w-full text-xs font-bold bg-white border border-gray-300 rounded-xl px-3.5 py-2.5 text-gray-900 focus:outline-none focus:border-black focus:ring-1 focus:ring-black cursor-pointer shadow-2xs"
                >
                  {SCOPE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-gray-600 block mb-1.5">License Duration Window</label>
                <select
                  value={activeUsageDuration}
                  onChange={(e) => handleUpdateUsage(activeUsageScope, e.target.value as RightsDuration)}
                  className="w-full text-xs font-bold bg-white border border-gray-300 rounded-xl px-3.5 py-2.5 text-gray-900 focus:outline-none focus:border-black focus:ring-1 focus:ring-black cursor-pointer shadow-2xs"
                >
                  {DURATION_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <p className="text-[11px] text-gray-600 font-medium leading-relaxed bg-white/70 p-2.5 rounded-xl border border-gray-200/60">
              {SCOPE_OPTIONS.find((s) => s.value === activeUsageScope)?.desc}
            </p>
          </div>

          {/* Exclusivity Section */}
          <div className="space-y-3.5 bg-gray-50/70 p-5 rounded-2xl border border-gray-200/80 shadow-2xs">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black uppercase tracking-wider text-gray-900 flex items-center gap-2">
                <span>Category Exclusivity Clause</span>
              </label>
              <span className="px-3 py-1 rounded-xl bg-gray-950 text-white text-[11px] font-mono font-bold shadow-2xs">
                {currentExclPercent > 0 ? `+${Math.round(currentExclPercent * 100)}% Surcharge` : "Non-Exclusive (0%)"}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="text-[11px] font-bold text-gray-600 block mb-1.5">Exclusivity Restriction</label>
                <select
                  value={activeExclScope}
                  onChange={(e) => handleUpdateExclusivity(e.target.value as ExclusivityScope, activeExclDuration)}
                  className="w-full text-xs font-bold bg-white border border-gray-300 rounded-xl px-3.5 py-2.5 text-gray-900 focus:outline-none focus:border-black focus:ring-1 focus:ring-black cursor-pointer shadow-2xs"
                >
                  {EXCLUSIVITY_SCOPE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-gray-600 block mb-1.5">Exclusivity Lockout Window</label>
                <select
                  disabled={activeExclScope === "none"}
                  value={activeExclDuration}
                  onChange={(e) => handleUpdateExclusivity(activeExclScope, e.target.value as ExclusivityDuration)}
                  className={`w-full text-xs font-bold rounded-xl px-3.5 py-2.5 shadow-2xs transition-all ${
                    activeExclScope === "none"
                      ? "bg-gray-100 border border-gray-200 text-gray-400 cursor-not-allowed"
                      : "bg-white border border-gray-300 text-gray-900 focus:outline-none focus:border-black focus:ring-1 focus:ring-black cursor-pointer"
                  }`}
                >
                  {EXCLUSIVITY_DURATION_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <p className="text-[11px] text-gray-600 font-medium leading-relaxed bg-white/70 p-2.5 rounded-xl border border-gray-200/60">
              {EXCLUSIVITY_SCOPE_OPTIONS.find((s) => s.value === activeExclScope)?.desc}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
