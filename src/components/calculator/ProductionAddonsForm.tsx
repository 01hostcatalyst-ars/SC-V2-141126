"use client";

import React, { useState } from "react";
import { ProductionAddons, TurnaroundSpeed } from "@/lib/calculator/types";

interface ProductionAddonsFormProps {
  addons?: ProductionAddons;
  onChange: (updated: ProductionAddons) => void;
}

const TURNAROUND_OPTIONS: Array<{ value: TurnaroundSpeed; label: string; surcharge: string }> = [
  { value: "standard", label: "Standard Turnaround (7–10 Business Days)", surcharge: "0%" },
  { value: "expedited_72h", label: "Expedited Delivery (3–5 Days / 72h)", surcharge: "+25%" },
  { value: "rush_48h", label: "Rush Delivery (<48 Hours)", surcharge: "+35%" },
  { value: "ultra_rush_24h", label: "Emergency / Same-Day (<24 Hours)", surcharge: "+50%" },
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
    <div className="bg-white rounded-2xl border border-gray-200/90 shadow-sm p-5 sm:p-7 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-black text-white flex items-center justify-center font-bold text-xs shadow-xs tracking-wider">
            04
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-950 uppercase tracking-tight">
              Production Add-ons &amp; Surcharges
            </h2>
            <p className="text-xs text-gray-500 font-medium">Rush turnaround, raw footage buyouts, extra revisions, and bio links</p>
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
        <div className="space-y-4 animate-fadeIn">
          {/* Turnaround Speed */}
          <div>
            <label className="text-xs font-bold text-gray-900 block mb-1.5">Production Turnaround &amp; Delivery</label>
            <select
              value={activeTurnaround}
              onChange={(e) => handleUpdate({ turnaround: e.target.value as TurnaroundSpeed })}
              className="w-full text-xs font-bold bg-white border border-gray-300 rounded-lg px-3 py-2.5 text-gray-900 focus:outline-none focus:border-black focus:ring-1 focus:ring-black cursor-pointer shadow-2xs"
            >
              {TURNAROUND_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label} ({opt.surcharge})
                </option>
              ))}
            </select>
          </div>

          {/* Grid of Addon Toggles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {/* Raw Footage Buyout */}
            <div className="flex items-center justify-between p-3.5 rounded-xl border border-gray-200 bg-gray-50/50 hover:bg-white transition-all">
              <div>
                <div className="text-xs font-bold text-gray-900">Raw 4K Footage Buyout</div>
                <div className="text-[11px] text-gray-500 font-medium">+30% of deliverable fee</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer ml-3 shrink-0">
                <input
                  type="checkbox"
                  checked={addons?.rawFootageBuyout || false}
                  onChange={(e) => handleUpdate({ rawFootageBuyout: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-black"></div>
              </label>
            </div>

            {/* Extra Revisions */}
            <div className="flex items-center justify-between p-3.5 rounded-xl border border-gray-200 bg-gray-50/50 hover:bg-white transition-all">
              <div>
                <div className="text-xs font-bold text-gray-900">Additional Revision Rounds</div>
                <div className="text-[11px] text-gray-500 font-medium">$150 per extra round</div>
              </div>
              <div className="flex items-center border border-gray-300 rounded-lg bg-white shadow-2xs overflow-hidden">
                <button
                  type="button"
                  onClick={() => handleUpdate({ extraRevisionsCount: Math.max(0, (addons?.extraRevisionsCount || 0) - 1) })}
                  className="px-2.5 py-1 text-xs font-bold text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  -
                </button>
                <span className="w-7 text-center text-xs font-bold font-mono text-gray-900">
                  {addons?.extraRevisionsCount || 0}
                </span>
                <button
                  type="button"
                  onClick={() => handleUpdate({ extraRevisionsCount: (addons?.extraRevisionsCount || 0) + 1 })}
                  className="px-2.5 py-1 text-xs font-bold text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>

            {/* Dedicated Link in Bio */}
            <div className="flex items-center justify-between p-3.5 rounded-xl border border-gray-200 bg-gray-50/50 hover:bg-white transition-all">
              <div>
                <div className="text-xs font-bold text-gray-900">Dedicated Link in Bio</div>
                <div className="text-[11px] text-gray-500 font-medium">$200 per 30-day pin</div>
              </div>
              <div className="flex items-center border border-gray-300 rounded-lg bg-white shadow-2xs overflow-hidden">
                <button
                  type="button"
                  onClick={() => handleUpdate({ linkInBioDays: Math.max(0, (addons?.linkInBioDays || 0) - 30) })}
                  className="px-2.5 py-1 text-xs font-bold text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  -
                </button>
                <span className="w-12 text-center text-xs font-bold font-mono text-gray-900">
                  {addons?.linkInBioDays || 0}d
                </span>
                <button
                  type="button"
                  onClick={() => handleUpdate({ linkInBioDays: (addons?.linkInBioDays || 0) + 30 })}
                  className="px-2.5 py-1 text-xs font-bold text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>

            {/* Travel / Reimbursed Expenses */}
            <div className="flex items-center justify-between p-3.5 rounded-xl border border-gray-200 bg-gray-50/50 hover:bg-white transition-all">
              <div>
                <div className="text-xs font-bold text-gray-900">Reimbursed Travel / Props</div>
                <div className="text-[11px] text-gray-500 font-medium">Direct cost reimbursement</div>
              </div>
              <div className="w-24">
                <input
                  type="number"
                  min={0}
                  step={50}
                  value={addons?.reimbursedExpenses || ""}
                  onChange={(e) => handleUpdate({ reimbursedExpenses: Math.max(0, Number(e.target.value)) })}
                  placeholder="$0"
                  className="w-full px-2.5 py-1 text-xs font-mono font-bold text-right rounded-lg border border-gray-300 bg-white text-gray-900 focus:outline-none focus:border-black focus:ring-1 focus:ring-black"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
