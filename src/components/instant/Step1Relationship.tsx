"use client";

import React from "react";
import { Scale, ArrowRight, ShieldCheck, Globe, HelpCircle } from "lucide-react";
import { ModernSelect } from "@/components/ui/ModernSelect";
import { WORKFLOW_OPTIONS } from "./constants";
import { JURISDICTIONS, getJurisdiction } from "@/lib/config/jurisdictions";
import { InstantContractFormState } from "./types";

interface Step1Props {
  form: InstantContractFormState;
  onChange: (updates: Partial<InstantContractFormState>) => void;
  onNext: () => void;
}

export function Step1Relationship({ form, onChange, onNext }: Step1Props) {
  const currentJur = getJurisdiction(form.jurisdictionCountryCode);

  const jurisdictionOptions = Object.values(JURISDICTIONS).map((j) => ({
    value: j.countryCode,
    label: `${j.countryName} (${j.lawAbbreviation})`,
    sublabel: `Governing Law: ${j.governingLawName} • Currency: ${j.defaultCurrency}`,
  }));

  const handleJurisdictionChange = (code: string) => {
    const jur = getJurisdiction(code);
    onChange({
      jurisdictionCountryCode: code,
      currency: jur.defaultCurrency,
    });
  };

  return (
    <div className="space-y-6 text-left">
      {/* Step Header */}
      <div className="border-b border-zinc-100 pb-4">
        <div className="flex items-center gap-2 text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider">
          <Scale className="w-4 h-4 text-zinc-950" strokeWidth={2} />
          <span>Step 1 • Legal Framework</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-black text-zinc-950 font-display tracking-tight mt-1">
          Commercial Relationship &amp; Governing Jurisdiction
        </h2>
        <p className="text-xs sm:text-sm text-zinc-500 mt-1 font-medium leading-relaxed">
          Define the legal roles of the contracting parties and select the governing national legal statute.
        </p>
      </div>

      {/* Selectors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Workflow Selector */}
        <div className="space-y-2">
          <ModernSelect
            label="Commercial Deal Flow *"
            value={form.contractType}
            onChange={(val) => onChange({ contractType: val })}
            options={WORKFLOW_OPTIONS}
          />
          <p className="text-[11px] text-zinc-500 font-medium">
            Determines who acts as Initiator (Party A) and who receives counter-signature (Party B).
          </p>
        </div>

        {/* Jurisdiction Selector */}
        <div className="space-y-2">
          <ModernSelect
            label="Governing Country Jurisdiction *"
            value={form.jurisdictionCountryCode}
            onChange={handleJurisdictionChange}
            options={jurisdictionOptions}
          />
          <p className="text-[11px] text-zinc-500 font-medium">
            Auto-binds arbitration rules, currency ({currentJur.defaultCurrency}), and tax identifier formats.
          </p>
        </div>
      </div>

      {/* Legal Statute Defensibility Card */}
      <div className="p-4 sm:p-5 rounded-xl bg-zinc-50 border border-zinc-200/80 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" strokeWidth={2} />
            <span className="text-xs font-bold text-zinc-950 uppercase tracking-wide">
              {currentJur.countryName} Statutory Compliance
            </span>
          </div>
          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-white text-zinc-800 border border-zinc-200">
            {currentJur.lawAbbreviation}
          </span>
        </div>

        <p className="text-xs text-zinc-600 leading-relaxed font-medium">
          {currentJur.governingLawName}. Any dispute shall be settled under the rules of{" "}
          <strong className="text-zinc-950 font-semibold">{currentJur.arbitrationAct}</strong>.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 border-t border-zinc-200/60 text-xs">
          <div>
            <span className="text-[10px] uppercase font-bold text-zinc-400 block">Currency</span>
            <span className="font-mono font-bold text-zinc-950">{currentJur.defaultCurrency}</span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-zinc-400 block">Tax Label</span>
            <span className="font-medium text-zinc-950">{currentJur.taxIdLabel}</span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-zinc-400 block">Timezone Standard</span>
            <span className="font-mono text-zinc-950">{currentJur.tzAbbr}</span>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="pt-4 border-t border-zinc-100 flex items-center justify-end">
        <button
          type="button"
          onClick={onNext}
          className="px-6 py-3 rounded-xl bg-zinc-950 text-white hover:bg-zinc-900 font-bold text-xs transition-all shadow-sm flex items-center gap-2 cursor-pointer min-h-[44px]"
        >
          <span>Continue to Deliverables</span>
          <ArrowRight className="w-4 h-4 text-zinc-400" strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}
