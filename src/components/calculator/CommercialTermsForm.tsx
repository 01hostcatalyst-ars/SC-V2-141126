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
}

const SCOPE_OPTIONS: Array<{ value: PlacementScope; label: string; desc: string }> = [
  { value: "organic_repost", label: "Organic Social Reposting Only", desc: "Brand reposts to owned brand feeds without paid amplification" },
  { value: "paid_partnership_ads", label: "Paid Partnership Ads / Dark Posting", desc: "Run as boosted/dark ads through Meta Ads Manager or TikTok Spark Ads" },
  { value: "whitelisting", label: "Creator Whitelisting / Handle Access", desc: "Brand runs ads directly through the creator's verified social handle" },
  { value: "website_pdp", label: "E-Commerce Website & Product Pages", desc: "Embed assets on product landing pages, banners, and storefronts" },
  { value: "email_crm", label: "Email Marketing & CRM Newsletters", desc: "Feature UGC visuals in customer promotional and retention emails" },
  { value: "tv_streaming", label: "TV / CTV & Broadcast Streaming", desc: "Commercial television, streaming platforms, and OTT ads" },
  { value: "ooh_print", label: "Out-of-Home (OOH) & Print Billboards", desc: "In-store displays, print catalogs, billboards, and trade shows" },
  { value: "perpetual_buyout", label: "Full Perpetual IP Ownership Buyout", desc: "Brand owns all rights perpetually across all global distribution channels" },
];

const DURATION_OPTIONS: Array<{ value: RightsDuration; label: string }> = [
  { value: "30_days", label: "30 Days (1 Month)" },
  { value: "60_days", label: "60 Days (2 Months)" },
  { value: "90_days", label: "90 Days (Quarterly)" },
  { value: "6_months", label: "6 Months (Semi-Annual)" },
  { value: "12_months", label: "12 Months (1 Year)" },
  { value: "perpetual", label: "Perpetual (Unlimited)" },
];

const EXCLUSIVITY_SCOPE_OPTIONS: Array<{ value: ExclusivityScope; label: string; desc: string }> = [
  { value: "none", label: "No Exclusivity (Non-Exclusive)", desc: "Creator remains free to collaborate with any other brand immediately" },
  { value: "direct_competitors", label: "Direct Competitors Only (3–5 Named Brands)", desc: "Restricts partnering with named direct competitors in the exact category" },
  { value: "full_category", label: "Full Category Lockout", desc: "Complete lockout from partnering with any brand in this entire vertical" },
];

const EXCLUSIVITY_DURATION_OPTIONS: Array<{ value: ExclusivityDuration; label: string }> = [
  { value: "14_days", label: "14 Days (Campaign Buffer)" },
  { value: "30_days", label: "30 Days (1 Month)" },
  { value: "60_days", label: "60 Days (2 Months)" },
  { value: "90_days", label: "90 Days (Quarterly)" },
  { value: "6_months", label: "6 Months" },
  { value: "12_months", label: "12 Months (Annual)" },
];

export function CommercialTermsForm({ terms, onChange }: CommercialTermsFormProps) {
  const [isOpen, setIsOpen] = useState(true);

  const activeUsageScope = terms?.usageRights?.scope || "organic_repost";
  const activeUsageDuration = terms?.usageRights?.duration || "30_days";
  const activeExclScope = terms?.exclusivity?.scope || "none";
  const activeExclDuration = terms?.exclusivity?.duration || "14_days";

  const currentUsagePercent = USAGE_RATES[activeUsageScope]?.[activeUsageDuration] || 0;
  const currentExclPercent = EXCLUSIVITY_RATES[activeExclScope]?.[activeExclDuration] || 0;

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
    <div className="bg-white rounded-2xl border border-gray-200/90 shadow-sm p-5 sm:p-7 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-black text-white flex items-center justify-center font-bold text-xs shadow-xs tracking-wider">
            03
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-950 uppercase tracking-tight">
              Commercial Licensing &amp; Exclusivity
            </h2>
            <p className="text-xs text-gray-500 font-medium">Digital paid rights, duration windows, and competitor restrictions</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="text-xs font-bold text-gray-600 hover:text-black self-start sm:self-auto transition-colors cursor-pointer px-2.5 py-1 rounded-lg hover:bg-gray-100"
        >
          {isOpen ? "Collapse ▲" : "Expand ▼"}
        </button>
      </div>

      {isOpen && (
        <div className="space-y-5 animate-fadeIn">
          {/* Usage Rights Section */}
          <div className="space-y-3 bg-gray-50/60 p-4 rounded-xl border border-gray-200/70">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-gray-900 flex items-center gap-2">
                <span>Content Usage Rights &amp; Placement</span>
              </label>
              <span className="px-2.5 py-0.5 rounded-md bg-gray-900 text-white text-[10px] font-mono font-bold">
                {currentUsagePercent > 0 ? `+${Math.round(currentUsagePercent * 100)}%` : "Included (0%)"}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-gray-600 block mb-1">Distribution Scope</label>
                <select
                  value={activeUsageScope}
                  onChange={(e) => handleUpdateUsage(e.target.value as PlacementScope, activeUsageDuration)}
                  className="w-full text-xs font-bold bg-white border border-gray-300 rounded-lg px-3 py-2.5 text-gray-900 focus:outline-none focus:border-black focus:ring-1 focus:ring-black cursor-pointer shadow-2xs"
                >
                  {SCOPE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-gray-600 block mb-1">License Duration</label>
                <select
                  value={activeUsageDuration}
                  onChange={(e) => handleUpdateUsage(activeUsageScope, e.target.value as RightsDuration)}
                  className="w-full text-xs font-bold bg-white border border-gray-300 rounded-lg px-3 py-2.5 text-gray-900 focus:outline-none focus:border-black focus:ring-1 focus:ring-black cursor-pointer shadow-2xs"
                >
                  {DURATION_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <p className="text-[11px] text-gray-500 font-medium leading-relaxed">
              {SCOPE_OPTIONS.find((s) => s.value === activeUsageScope)?.desc}
            </p>
          </div>

          {/* Exclusivity Section */}
          <div className="space-y-3 bg-gray-50/60 p-4 rounded-xl border border-gray-200/70">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-gray-900 flex items-center gap-2">
                <span>Category Exclusivity Clause</span>
              </label>
              <span className="px-2.5 py-0.5 rounded-md bg-gray-900 text-white text-[10px] font-mono font-bold">
                {currentExclPercent > 0 ? `+${Math.round(currentExclPercent * 100)}%` : "None (0%)"}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-gray-600 block mb-1">Exclusivity Restriction</label>
                <select
                  value={activeExclScope}
                  onChange={(e) => handleUpdateExclusivity(e.target.value as ExclusivityScope, activeExclDuration)}
                  className="w-full text-xs font-bold bg-white border border-gray-300 rounded-lg px-3 py-2.5 text-gray-900 focus:outline-none focus:border-black focus:ring-1 focus:ring-black cursor-pointer shadow-2xs"
                >
                  {EXCLUSIVITY_SCOPE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-gray-600 block mb-1">Exclusivity Time Window</label>
                <select
                  disabled={activeExclScope === "none"}
                  value={activeExclDuration}
                  onChange={(e) => handleUpdateExclusivity(activeExclScope, e.target.value as ExclusivityDuration)}
                  className={`w-full text-xs font-bold border rounded-lg px-3 py-2.5 focus:outline-none focus:border-black focus:ring-1 focus:ring-black shadow-2xs ${
                    activeExclScope === "none"
                      ? "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed"
                      : "bg-white border-gray-300 text-gray-900 cursor-pointer"
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

            <p className="text-[11px] text-gray-500 font-medium leading-relaxed">
              {EXCLUSIVITY_SCOPE_OPTIONS.find((s) => s.value === activeExclScope)?.desc}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
