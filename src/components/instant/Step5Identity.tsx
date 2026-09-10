"use client";

import React from "react";
import {
  User,
  Building,
  Mail,
  Phone,
  MapPin,
  FileCheck,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Shield,
} from "lucide-react";
import { AutocompleteInput } from "@/components/ui/AutocompleteInput";
import { JOB_TITLE_SUGGESTIONS } from "./constants";
import { getJurisdiction } from "@/lib/config/jurisdictions";
import { InstantContractFormState } from "./types";

interface Step5Props {
  form: InstantContractFormState;
  onChange: (updates: Partial<InstantContractFormState>) => void;
  onNext: () => void;
  onBack: () => void;
}

export function Step5Identity({ form, onChange, onNext, onBack }: Step5Props) {
  const jur = getJurisdiction(form.jurisdictionCountryCode);

  return (
    <div className="space-y-6 text-left">
      {/* Step Header */}
      <div className="border-b border-zinc-100 pb-4">
        <div className="flex items-center gap-2 text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider">
          <User className="w-4 h-4 text-zinc-950" strokeWidth={2} />
          <span>Step 5 • Party A Information</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-black text-zinc-950 font-display tracking-tight mt-1">
          Initiator Legal Identity &amp; Representation
        </h2>
        <p className="text-xs sm:text-sm text-zinc-500 mt-1 font-medium leading-relaxed">
          Enter your legal credentials for binding contract execution under {jur.countryName} law.
        </p>
      </div>

      {/* Representation Capacity Selector */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white border border-zinc-200/90 shadow-xs space-y-3 surface-card">
        <label className="text-xs font-bold text-zinc-950 uppercase tracking-wider block">
          Signing Capacity *
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => onChange({ creatorRepresentationCapacity: "CREATOR_SELF" })}
            className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
              form.creatorRepresentationCapacity === "CREATOR_SELF"
                ? "bg-zinc-950 text-white border-zinc-950 shadow-xs"
                : "bg-zinc-50 border-zinc-200 text-zinc-700 hover:bg-zinc-100"
            }`}
          >
            <div className="text-xs font-bold flex items-center justify-between">
              <span>Direct Principal / Creator</span>
              {form.creatorRepresentationCapacity === "CREATOR_SELF" && (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" strokeWidth={2.5} />
              )}
            </div>
            <p
              className={`text-[11px] mt-1 ${
                form.creatorRepresentationCapacity === "CREATOR_SELF"
                  ? "text-zinc-300"
                  : "text-zinc-500"
              }`}
            >
              Signing directly as the principal creator, brand executive, or contractor.
            </p>
          </button>

          <button
            type="button"
            onClick={() => onChange({ creatorRepresentationCapacity: "TALENT_MANAGER" })}
            className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
              form.creatorRepresentationCapacity === "TALENT_MANAGER"
                ? "bg-zinc-950 text-white border-zinc-950 shadow-xs"
                : "bg-zinc-50 border-zinc-200 text-zinc-700 hover:bg-zinc-100"
            }`}
          >
            <div className="text-xs font-bold flex items-center justify-between">
              <span>Authorized Manager / Agency</span>
              {form.creatorRepresentationCapacity === "TALENT_MANAGER" && (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" strokeWidth={2.5} />
              )}
            </div>
            <p
              className={`text-[11px] mt-1 ${
                form.creatorRepresentationCapacity === "TALENT_MANAGER"
                  ? "text-zinc-300"
                  : "text-zinc-500"
              }`}
            >
              Signing as a talent agent, legal counsel, or manager on creator&apos;s behalf.
            </p>
          </button>
        </div>

        {form.creatorRepresentationCapacity === "TALENT_MANAGER" && (
          <div className="pt-2">
            <label className="text-xs font-bold text-zinc-800">
              Legal Name of Represented Creator / Talent *
            </label>
            <input
              type="text"
              placeholder="e.g. Alex Rivera"
              value={form.creatorLegalName}
              onChange={(e) => onChange({ creatorLegalName: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-lg border border-zinc-300 bg-white text-xs font-semibold text-zinc-950 focus:border-zinc-950 focus:outline-none mt-1"
            />
          </div>
        )}
      </div>

      {/* Primary Identity Fields */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white border border-zinc-200/90 shadow-xs space-y-4 surface-card">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-zinc-800">Your Full Legal Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Marcus Vance"
              value={form.initiatorName}
              onChange={(e) => onChange({ initiatorName: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-lg border border-zinc-300 bg-white text-xs font-semibold text-zinc-950 focus:border-zinc-950 focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-zinc-800">Official Work Email *</label>
            <input
              type="email"
              required
              placeholder="name@company.com"
              value={form.initiatorEmail}
              onChange={(e) => onChange({ initiatorEmail: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-lg border border-zinc-300 bg-white text-xs font-semibold text-zinc-950 focus:border-zinc-950 focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-zinc-800">Contact Phone Number *</label>
            <input
              type="tel"
              placeholder={jur.phonePlaceholder}
              value={form.initiatorPhone}
              onChange={(e) => onChange({ initiatorPhone: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-lg border border-zinc-300 bg-white text-xs font-mono font-semibold text-zinc-950 focus:border-zinc-950 focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-zinc-800">Company / Studio / Agency Name</label>
            <input
              type="text"
              placeholder="e.g. Vance Media Ltd"
              value={form.initiatorCompany}
              onChange={(e) => onChange({ initiatorCompany: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-lg border border-zinc-300 bg-white text-xs font-semibold text-zinc-950 focus:border-zinc-950 focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <AutocompleteInput
              label="Designation / Official Title *"
              value={form.initiatorDesignation}
              onChange={(val) => onChange({ initiatorDesignation: val })}
              placeholder="e.g. Creative Director, Founder..."
              suggestions={JOB_TITLE_SUGGESTIONS}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-zinc-800">Physical Business Address *</label>
            <input
              type="text"
              placeholder="City, State, Country"
              value={form.initiatorAddress}
              onChange={(e) => onChange({ initiatorAddress: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-lg border border-zinc-300 bg-white text-xs font-semibold text-zinc-950 focus:border-zinc-950 focus:outline-none"
            />
          </div>
        </div>

        {/* National Legal Identifiers */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-zinc-100">
          <div className="space-y-1">
            <label className="text-xs font-bold text-zinc-800">
              {jur.taxIdLabel} (Tax Identification)
            </label>
            <input
              type="text"
              placeholder="Tax ID number"
              value={form.initiatorTaxId}
              onChange={(e) => onChange({ initiatorTaxId: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-lg border border-zinc-300 bg-white text-xs font-mono font-semibold text-zinc-950 focus:border-zinc-950 focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-zinc-800">
              {jur.nationalIdLabel}
            </label>
            <input
              type="text"
              placeholder="Government ID number"
              value={form.initiatorNationalId}
              onChange={(e) => onChange({ initiatorNationalId: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-lg border border-zinc-300 bg-white text-xs font-mono font-semibold text-zinc-950 focus:border-zinc-950 focus:outline-none"
            />
          </div>
        </div>
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
          <span>Continue to e-Sign &amp; Review</span>
          <ArrowRight className="w-4 h-4 text-zinc-400" strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}
