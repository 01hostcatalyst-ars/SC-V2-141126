"use client";

import React, { useState } from "react";
import { ProductionAddons, TurnaroundSpeed } from "@/lib/calculator/types";
import { ChevronUp, ChevronDown, SlidersHorizontal } from "lucide-react";

interface ProductionAddonsFormProps {
  addons?: ProductionAddons;
  onChange: (updated: ProductionAddons) => void;
}

const TURNAROUND_OPTIONS: Array<{ value: TurnaroundSpeed; label: string; surcharge: string }> = [
  { value: "standard", label: "Standard Delivery (7–10 Business Days)", surcharge: "0%" },
  { value: "expedited_72h", label: "Expedited Turnaround (3–5 Days / 72h)", surcharge: "+25%" },
  { value: "rush_48h", label: "Rush Turnaround (<48 Hours)", surcharge: "+35%" },
  { value: "ultra_rush_24h", label: "Emergency Express (<24 Hours)", surcharge: "+50%" },
];

export function ProductionAddonsForm({ addons, onChange }: ProductionAddonsFormProps) {
  const [isOpen, setIsOpen] = useState(false);

  const activeTurnaround = addons?.turnaround || "standard";

  const handleUpdate = (updates: Partial<ProductionAddons>) => {
    onChange({
      ...addons,
      ...updates,
    });
  };

  return (
    <div className="surface-card p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-zinc-200/90 shadow-sm space-y-4">
      {/* Step Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-700">
            <SlidersHorizontal className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-semibold text-zinc-900 tracking-tight">
              Production Add-ons &amp; Turnaround
            </h2>
            <p className="text-xs text-zinc-500 font-medium">
              Rush turnaround speeds, raw B-roll footage buyout, extra revisions, and link-in-bio
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="text-xs font-medium text-zinc-600 hover:text-zinc-900 self-start sm:self-auto transition-colors cursor-pointer px-3 py-1.5 rounded-xl hover:bg-zinc-100 border border-zinc-200/80 flex items-center gap-1.5"
        >
          <span>{isOpen ? "Collapse" : "Expand"}</span>
          {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {isOpen && (
        <div className="space-y-5 animate-fadeIn">
          {/* Turnaround Speed */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-800 block mb-1.5">
              Production Turnaround &amp; Delivery Timeline
            </label>
            <select
              value={activeTurnaround}
              onChange={(e) => handleUpdate({ turnaround: e.target.value as TurnaroundSpeed })}
              className="w-full text-xs font-bold bg-white border border-zinc-300 rounded-xl px-3.5 py-2.5 text-zinc-900 focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 cursor-pointer shadow-2xs"
            >
              {TURNAROUND_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label} ({opt.surcharge})
                </option>
              ))}
            </select>
          </div>

          {/* Grid of Addon Toggles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
            {/* Raw Footage Buyout */}
            <div className="flex items-center justify-between p-4 rounded-2xl border border-gray-200 bg-gray-50/50 hover:bg-white hover:border-gray-300 transition-all shadow-2xs">
              <div>
                <div className="text-xs font-black text-gray-950 uppercase tracking-tight">
                  Raw 4K Footage Buyout
                </div>
                <div className="text-[11px] text-gray-500 font-medium">+30% of deliverable fee</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer ml-3 shrink-0">
                <input
                  type="checkbox"
                  checked={addons?.rawFootageBuyout || false}
                  onChange={(e) => handleUpdate({ rawFootageBuyout: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-10 h-5.5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4.5 after:w-4.5 after:transition-all peer-checked:bg-black"></div>
              </label>
            </div>

            {/* Extra Revision Rounds */}
            <div className="flex items-center justify-between p-4 rounded-2xl border border-gray-200 bg-gray-50/50 hover:bg-white hover:border-gray-300 transition-all shadow-2xs">
              <div>
                <div className="text-xs font-black text-gray-950 uppercase tracking-tight">
                  Extra Revision Rounds
                </div>
                <div className="text-[11px] text-gray-500 font-medium">$150 flat per extra round</div>
              </div>
              <div className="flex items-center border border-gray-300 rounded-xl bg-white shadow-2xs overflow-hidden">
                <button
                  type="button"
                  onClick={() =>
                    handleUpdate({
                      extraRevisionsCount: Math.max(0, (addons?.extraRevisionsCount || 0) - 1),
                    })
                  }
                  className="px-3 py-1.5 text-xs font-bold text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  -
                </button>
                <span className="w-7 text-center text-xs font-black font-mono text-gray-900">
                  {addons?.extraRevisionsCount || 0}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    handleUpdate({ extraRevisionsCount: (addons?.extraRevisionsCount || 0) + 1 })
                  }
                  className="px-3 py-1.5 text-xs font-bold text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>

            {/* Link in Bio Placement */}
            <div className="flex items-center justify-between p-4 rounded-2xl border border-gray-200 bg-gray-50/50 hover:bg-white hover:border-gray-300 transition-all shadow-2xs">
              <div>
                <div className="text-xs font-black text-gray-950 uppercase tracking-tight">
                  Dedicated Link in Bio
                </div>
                <div className="text-[11px] text-gray-500 font-medium">$200 per 30-day placement</div>
              </div>
              <div className="flex items-center border border-gray-300 rounded-xl bg-white shadow-2xs overflow-hidden">
                <button
                  type="button"
                  onClick={() =>
                    handleUpdate({
                      linkInBioDays: Math.max(0, (addons?.linkInBioDays || 0) - 30),
                    })
                  }
                  className="px-3 py-1.5 text-xs font-bold text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  -
                </button>
                <span className="w-12 text-center text-xs font-black font-mono text-gray-900">
                  {addons?.linkInBioDays || 0}d
                </span>
                <button
                  type="button"
                  onClick={() =>
                    handleUpdate({ linkInBioDays: (addons?.linkInBioDays || 0) + 30 })
                  }
                  className="px-3 py-1.5 text-xs font-bold text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>

            {/* Reimbursed Expenses */}
            <div className="flex items-center justify-between p-4 rounded-2xl border border-gray-200 bg-gray-50/50 hover:bg-white hover:border-gray-300 transition-all shadow-2xs">
              <div>
                <div className="text-xs font-black text-gray-950 uppercase tracking-tight">
                  Reimbursed Travel / Props
                </div>
                <div className="text-[11px] text-gray-500 font-medium">Direct cost reimbursement</div>
              </div>
              <div className="w-24">
                <input
                  type="number"
                  min={0}
                  step={50}
                  value={addons?.reimbursedExpenses || ""}
                  onChange={(e) =>
                    handleUpdate({ reimbursedExpenses: Math.max(0, Number(e.target.value)) })
                  }
                  placeholder="$0"
                  className="w-full px-3 py-1.5 text-xs font-mono font-bold text-right rounded-xl border border-gray-300 bg-white text-gray-900 focus:outline-none focus:border-black focus:ring-1 focus:ring-black shadow-2xs"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
