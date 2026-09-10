"use client";

import React from "react";
import { Check, ChevronRight } from "lucide-react";

export interface StepDef {
  id: number;
  label: string;
  shortLabel: string;
  description: string;
}

export const WIZARD_STEPS: StepDef[] = [
  { id: 1, label: "Relationship & Law", shortLabel: "Relationship", description: "Deal parties & jurisdiction" },
  { id: 2, label: "Campaign Deliverables", shortLabel: "Deliverables", description: "Scope & asset guidelines" },
  { id: 3, label: "Usage & Protection", shortLabel: "Rights & Terms", description: "Channels, ads & 48h approval" },
  { id: 4, label: "Financials & Payout", shortLabel: "Financials", description: "Fee, advance & penalties" },
  { id: 5, label: "Party A Identity", shortLabel: "Your Identity", description: "Legal details & capacity" },
  { id: 6, label: "Review & e-Sign", shortLabel: "Review & Sign", description: "OTP authentication & seal" },
];

interface InstantWizardNavProps {
  currentStep: number;
  onSelectStep: (step: number) => void;
  completedSteps?: number[];
}

export function InstantWizardNav({
  currentStep,
  onSelectStep,
  completedSteps,
}: InstantWizardNavProps) {
  const activeCompleted =
    completedSteps || Array.from({ length: currentStep - 1 }, (_, i) => i + 1);
  const currentStepDef = WIZARD_STEPS.find((s) => s.id === currentStep) || WIZARD_STEPS[0];
  const progressPercent = Math.round(((currentStep - 1) / (WIZARD_STEPS.length - 1)) * 100);

  return (
    <div className="w-full bg-white border border-zinc-200/90 rounded-2xl p-3 sm:p-4 shadow-xs surface-card">
      {/* Mobile Top Step Tracker */}
      <div className="md:hidden space-y-2 mb-2">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 font-bold text-zinc-950">
            <span className="w-5 h-5 rounded-full bg-zinc-950 text-white text-[10px] flex items-center justify-center font-mono">
              {currentStep}
            </span>
            <span>{currentStepDef.label}</span>
          </div>
          <span className="font-mono text-[11px] text-zinc-500 font-semibold">
            {currentStep} / {WIZARD_STEPS.length}
          </span>
        </div>
        <div className="w-full h-1.5 bg-zinc-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-zinc-950 transition-all duration-300 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Desktop & Tablet Stepper List */}
      <nav aria-label="Wizard Steps" className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-1.5 sm:gap-2">
        {WIZARD_STEPS.map((step) => {
          const isCurrent = step.id === currentStep;
          const isCompleted = activeCompleted.includes(step.id);
          const isAccessible = isCompleted || step.id <= currentStep;

          return (
            <button
              key={step.id}
              type="button"
              disabled={!isAccessible}
              onClick={() => isAccessible && onSelectStep(step.id)}
              className={`p-2.5 sm:p-3 rounded-xl border text-left transition-all min-h-[44px] cursor-pointer flex flex-col justify-between ${
                isCurrent
                  ? "bg-zinc-950 text-white border-zinc-950 shadow-sm"
                  : isCompleted
                  ? "bg-zinc-50/80 text-zinc-900 border-zinc-200/80 hover:bg-zinc-100/90"
                  : "bg-white text-zinc-400 border-zinc-100 opacity-60 cursor-not-allowed"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono font-bold ${
                    isCurrent
                      ? "bg-white text-zinc-950"
                      : isCompleted
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-zinc-100 text-zinc-400"
                  }`}
                >
                  {isCompleted && !isCurrent ? (
                    <Check className="w-3 h-3 text-emerald-700" strokeWidth={3} />
                  ) : (
                    step.id
                  )}
                </span>
                <span
                  className={`text-[9px] font-bold uppercase tracking-wider ${
                    isCurrent ? "text-zinc-300" : "text-zinc-400"
                  }`}
                >
                  Step {step.id}
                </span>
              </div>

              <div>
                <div
                  className={`text-xs font-bold truncate leading-tight ${
                    isCurrent ? "text-white" : "text-zinc-900"
                  }`}
                >
                  {step.shortLabel}
                </div>
                <div
                  className={`text-[10px] truncate mt-0.5 hidden xl:block ${
                    isCurrent ? "text-zinc-400" : "text-zinc-500"
                  }`}
                >
                  {step.description}
                </div>
              </div>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
