"use client";

import React from "react";
import {
  Share2,
  Clock,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { ModernSelect } from "@/components/ui/ModernSelect";
import {
  PLATFORM_OPTIONS,
  USAGE_TYPE_OPTIONS,
  BOOSTING_DURATION_OPTIONS,
} from "./constants";
import { InstantContractFormState } from "./types";

interface Step3Props {
  form: InstantContractFormState;
  onChange: (updates: Partial<InstantContractFormState>) => void;
  onNext: () => void;
  onBack: () => void;
}

const REVISION_OPTIONS = [
  { value: "1", label: "1 Round of Revisions Included" },
  { value: "2", label: "2 Rounds of Revisions (Standard)" },
  { value: "3", label: "3 Rounds of Revisions" },
];

export function Step3UsageRights({ form, onChange, onNext, onBack }: Step3Props) {
  const togglePlatform = (id: string) => {
    const exists = form.platforms.includes(id);
    const updated = exists
      ? form.platforms.filter((p) => p !== id)
      : [...form.platforms, id];
    onChange({ platforms: updated.length ? updated : [id] });
  };

  return (
    <div className="space-y-6 text-left">
      {/* Step Header */}
      <div className="border-b border-zinc-100 pb-4">
        <div className="flex items-center gap-2 text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider">
          <Share2 className="w-4 h-4 text-zinc-950" strokeWidth={2} />
          <span>Step 3 • Licensing &amp; Approvals</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-black text-zinc-950 font-display tracking-tight mt-1">
          Platform Distribution &amp; Usage Rights Licensing
        </h2>
        <p className="text-xs sm:text-sm text-zinc-500 mt-1 font-medium leading-relaxed">
          Govern where content can be posted, spark ad boosting permissions, and approval SLAs.
        </p>
      </div>

      {/* Platform Multi-Select Cards */}
      <div className="space-y-2.5">
        <label className="text-xs font-bold text-zinc-950 uppercase tracking-wide block">
          Authorized Platforms *
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {PLATFORM_OPTIONS.map((plat) => {
            const isSelected = form.platforms.includes(plat.id);
            return (
              <button
                key={plat.id}
                type="button"
                onClick={() => togglePlatform(plat.id)}
                className={`p-3 rounded-xl border text-center text-xs font-bold transition-all min-h-[44px] cursor-pointer flex items-center justify-center gap-1.5 ${
                  isSelected
                    ? "bg-zinc-950 text-white border-zinc-950 shadow-2xs"
                    : "bg-zinc-50/70 border-zinc-200 text-zinc-700 hover:bg-zinc-100"
                }`}
              >
                {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" strokeWidth={2.5} />}
                <span>{plat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Usage Scope & Paid Boosting Duration */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <ModernSelect
          label="Commercial Usage Scope *"
          value={form.usageType}
          onChange={(val) => onChange({ usageType: val })}
          options={USAGE_TYPE_OPTIONS}
        />

        <ModernSelect
          label="Paid Boosting / Spark Ads Duration *"
          value={form.paidBoostingDuration}
          onChange={(val) => onChange({ paidBoostingDuration: val })}
          options={BOOSTING_DURATION_OPTIONS}
        />
      </div>

      {/* 48-Hour Deemed Approval Protection Clause */}
      <div
        onClick={() => onChange({ deemedApproval48h: !form.deemedApproval48h })}
        className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer select-none surface-card ${
          form.deemedApproval48h
            ? "bg-emerald-50/60 border-emerald-300 shadow-xs"
            : "bg-zinc-50 border-zinc-200/80 opacity-70"
        }`}
      >
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-700" strokeWidth={2} />
            <span className="text-xs font-bold text-zinc-950 uppercase tracking-wide">
              48-Hour Deemed Approval Clause (SLA Protection)
            </span>
          </div>
          <span
            className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${
              form.deemedApproval48h
                ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                : "bg-zinc-200 text-zinc-600 border-zinc-300"
            }`}
          >
            {form.deemedApproval48h ? "Active Clause" : "Disabled"}
          </span>
        </div>
        <p className="text-xs text-zinc-600 leading-relaxed font-medium">
          If the Client does not provide written revision feedback within 48 business hours of receiving a content draft, the deliverable is legally deemed approved. Prevents indefinite client ghosting and project stagnation.
        </p>
      </div>

      {/* Revision Limits */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white border border-zinc-200/90 space-y-2 surface-card">
        <div className="flex items-center gap-2 mb-1">
          <ShieldCheck className="w-4 h-4 text-zinc-950" strokeWidth={2} />
          <span className="text-xs font-bold text-zinc-950 uppercase tracking-wide">
            Creative Revision Threshold
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {REVISION_OPTIONS.map((opt) => {
            const valNum = parseInt(opt.value);
            const isSelected = form.revisionLimit === valNum;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => onChange({ revisionLimit: valNum })}
                className={`p-3 rounded-xl border text-left text-xs font-semibold transition-all min-h-[44px] cursor-pointer ${
                  isSelected
                    ? "bg-zinc-950 text-white border-zinc-950 shadow-xs"
                    : "bg-zinc-50 border-zinc-200 text-zinc-700 hover:bg-zinc-100"
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
        <p className="text-[11px] text-zinc-500 font-medium pt-1">
          Any revisions requested beyond this threshold are billable at standard hourly or creative addendum rates.
        </p>
      </div>

      {/* Navigation Footer */}
      <div className="pt-4 border-t border-zinc-100 flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="px-4 py-2.5 rounded-xl border border-zinc-200 text-zinc-700 hover:bg-zinc-100 font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer min-h-[44px]"
        >
          <ArrowLeft className="w-4 h-4 text-zinc-500" strokeWidth={2} />
          <span>Back</span>
        </button>

        <button
          type="button"
          onClick={onNext}
          className="px-6 py-3 rounded-xl bg-zinc-950 text-white hover:bg-zinc-900 font-bold text-xs transition-all shadow-sm flex items-center gap-2 cursor-pointer min-h-[44px]"
        >
          <span>Continue to Compensation</span>
          <ArrowRight className="w-4 h-4 text-zinc-400" strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}
