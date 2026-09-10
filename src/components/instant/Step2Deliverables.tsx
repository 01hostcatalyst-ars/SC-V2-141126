"use client";

import React from "react";
import {
  FileText,
  Plus,
  Trash2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Tag,
  ShieldAlert,
} from "lucide-react";
import { ModernSelect } from "@/components/ui/ModernSelect";
import { AutocompleteInput } from "@/components/ui/AutocompleteInput";
import {
  getDeliverableNoteSuggestions,
  TAGGING_REQUIREMENTS_SUGGESTIONS,
  IP_OWNERSHIP_SUGGESTIONS,
} from "./constants";
import { InstantContractFormState, DeliverableItem } from "./types";

interface Step2Props {
  form: InstantContractFormState;
  onChange: (updates: Partial<InstantContractFormState>) => void;
  onNext: () => void;
  onBack: () => void;
}

const FORMAT_OPTIONS = [
  { value: "REEL", label: "Instagram / Facebook Reel" },
  { value: "TIKTOK", label: "TikTok Video" },
  { value: "YOUTUBE_INTEGRATED", label: "YouTube Dedicated / Integrated Video" },
  { value: "YOUTUBE_SHORTS", label: "YouTube Shorts" },
  { value: "STORY", label: "Story Post (24h / Highlight)" },
  { value: "CAROUSEL", label: "Multi-Image Carousel / Grid Post" },
  { value: "X_POST", label: "X (Twitter) Thread / Post" },
  { value: "CUSTOM", label: "Custom Specialized Deliverable" },
];

const DURATION_OPTIONS = [
  { value: "1 Month", label: "1 Month Archive / Active" },
  { value: "2 Months", label: "2 Months Retention" },
  { value: "3 Months", label: "3 Months Retention" },
  { value: "6 Months", label: "6 Months Retention" },
  { value: "1 Year", label: "1 Year Retention" },
  { value: "Permanent", label: "Permanent / In Perpetuity" },
];

export function Step2Deliverables({ form, onChange, onNext, onBack }: Step2Props) {
  const handleAddDeliverable = () => {
    const updated = [
      ...form.deliverables,
      { type: "REEL", quantity: 1, duration: "2 Months", notes: "" },
    ];
    onChange({ deliverables: updated });
  };

  const handleRemoveDeliverable = (index: number) => {
    if (form.deliverables.length <= 1) return;
    const updated = form.deliverables.filter((_, i) => i !== index);
    onChange({ deliverables: updated });
  };

  const handleUpdateDeliverable = (
    index: number,
    field: keyof DeliverableItem,
    value: any
  ) => {
    const updated = form.deliverables.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    );
    onChange({ deliverables: updated });
  };

  return (
    <div className="space-y-6 text-left">
      {/* Step Header */}
      <div className="border-b border-zinc-100 pb-4">
        <div className="flex items-center gap-2 text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider">
          <FileText className="w-4 h-4 text-zinc-950" strokeWidth={2} />
          <span>Step 2 • Scope of Work</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-black text-zinc-950 font-display tracking-tight mt-1">
          Campaign Deliverables &amp; Content Guidelines
        </h2>
        <p className="text-xs sm:text-sm text-zinc-500 mt-1 font-medium leading-relaxed">
          Specify exact content formats, quantity, archive retention terms, and tagging requirements.
        </p>
      </div>

      {/* Deliverables List Repeater */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-zinc-950 uppercase tracking-wider">
            Deliverables Schedule ({form.deliverables.length})
          </span>
          <button
            type="button"
            onClick={handleAddDeliverable}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-950 hover:text-emerald-700 bg-zinc-100 hover:bg-zinc-200/80 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" strokeWidth={2.5} />
            <span>Add Deliverable</span>
          </button>
        </div>

        {form.deliverables.map((item, idx) => {
          const suggestions = getDeliverableNoteSuggestions(item.type);

          return (
            <div
              key={idx}
              className="p-4 sm:p-5 rounded-2xl bg-zinc-50/70 border border-zinc-200/90 space-y-4 relative surface-subtle"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-zinc-500 uppercase tracking-wider">
                  Deliverable #{idx + 1}
                </span>
                {form.deliverables.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveDeliverable(idx)}
                    className="text-xs text-rose-600 hover:text-rose-800 font-bold inline-flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" strokeWidth={2} />
                    <span>Remove</span>
                  </button>
                )}
              </div>

              {/* Grid: Format, Quantity, Stay Published Duration */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <ModernSelect
                  label="Content Format *"
                  value={item.type}
                  onChange={(val) => handleUpdateDeliverable(idx, "type", val)}
                  options={FORMAT_OPTIONS}
                />

                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-800">Quantity *</label>
                  <input
                    type="number"
                    min={1}
                    max={50}
                    value={item.quantity}
                    onChange={(e) =>
                      handleUpdateDeliverable(idx, "quantity", parseInt(e.target.value) || 1)
                    }
                    className="w-full px-3.5 py-2.5 rounded-lg border border-zinc-300 bg-white text-xs font-bold text-zinc-950 focus:border-zinc-950 focus:outline-none"
                  />
                </div>

                <ModernSelect
                  label="Archive Retention *"
                  value={item.duration}
                  onChange={(val) => handleUpdateDeliverable(idx, "duration", val)}
                  options={DURATION_OPTIONS}
                />
              </div>

              {/* Specific Notes & Smart Suggestions */}
              <div className="space-y-2">
                <AutocompleteInput
                  label="Technical Specifications & Creative Notes"
                  value={item.notes}
                  onChange={(val) => handleUpdateDeliverable(idx, "notes", val)}
                  placeholder="e.g. 4K 60fps, product unboxing in first 5s, custom discount code..."
                  suggestions={suggestions}
                />
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[10px] uppercase font-bold text-zinc-400 mr-1 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-500" strokeWidth={2} />
                    Suggestions:
                  </span>
                  {suggestions.slice(0, 3).map((sug, sIdx) => (
                    <button
                      key={sIdx}
                      type="button"
                      onClick={() => handleUpdateDeliverable(idx, "notes", sug)}
                      className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-white border border-zinc-200 text-zinc-600 hover:text-zinc-950 hover:border-zinc-400 transition-colors truncate max-w-xs cursor-pointer"
                    >
                      {sug}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Campaign Tagging Requirements */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white border border-zinc-200/90 space-y-3 surface-card">
        <div className="flex items-center gap-2">
          <Tag className="w-4 h-4 text-zinc-950" strokeWidth={2} />
          <span className="text-xs font-bold text-zinc-950 uppercase tracking-wide">
            Campaign Tagging &amp; Attribution Guidelines
          </span>
        </div>

        <AutocompleteInput
          label="Mandatory Handles, Hashtags & Promo Codes"
          value={form.taggingRequirements}
          onChange={(val) => onChange({ taggingRequirements: val })}
          placeholder="e.g. Tag @brand_official in caption & first 3s. Include #ad #collab..."
          suggestions={TAGGING_REQUIREMENTS_SUGGESTIONS}
        />

        <div className="flex flex-wrap gap-1.5 pt-1">
          {TAGGING_REQUIREMENTS_SUGGESTIONS.map((tag, tIdx) => (
            <button
              key={tIdx}
              type="button"
              onClick={() => onChange({ taggingRequirements: tag })}
              className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-zinc-100 border border-zinc-200 text-zinc-700 hover:text-zinc-950 hover:bg-zinc-200/80 transition-colors cursor-pointer"
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Intellectual Property Ownership Standard */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white border border-zinc-200/90 space-y-3 surface-card">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-zinc-950" strokeWidth={2} />
          <span className="text-xs font-bold text-zinc-950 uppercase tracking-wide">
            Underlying IP Copyright Clause
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {IP_OWNERSHIP_SUGGESTIONS.map((ip, iIdx) => (
            <button
              key={iIdx}
              type="button"
              onClick={() => onChange({ contentOwnership: ip })}
              className={`p-2.5 rounded-xl border text-left text-xs font-semibold transition-all cursor-pointer ${
                form.contentOwnership === ip
                  ? "bg-zinc-950 text-white border-zinc-950 shadow-xs"
                  : "bg-zinc-50/70 border-zinc-200 text-zinc-700 hover:bg-zinc-100"
              }`}
            >
              {ip}
            </button>
          ))}
        </div>

        <textarea
          rows={2}
          value={form.contentOwnership}
          onChange={(e) => onChange({ contentOwnership: e.target.value })}
          className="w-full p-3 rounded-lg border border-zinc-300 bg-white text-xs font-medium text-zinc-950 focus:border-zinc-950 focus:outline-none"
        />
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
          <span>Continue to Usage Rights</span>
          <ArrowRight className="w-4 h-4 text-zinc-400" strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}
