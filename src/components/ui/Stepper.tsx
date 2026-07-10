"use client";

import React from "react";

interface StepperProps {
  steps: string[];
  currentStep: number; // 0-indexed
}

export const Stepper: React.FC<StepperProps> = ({ steps, currentStep }) => {
  return (
    <div className="w-full py-4">
      <div className="flex items-center justify-between gap-2 max-w-3xl mx-auto">
        {steps.map((step, idx) => (
          <React.Fragment key={idx}>
            {/* Step circle & label */}
            <div className="flex flex-col items-center gap-2 flex-1 relative">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 font-bold text-sm transition-all duration-300 z-10 ${
                  idx < currentStep
                    ? "bg-blue-600 border-blue-600 text-white"
                    : idx === currentStep
                    ? "bg-slate-900 border-blue-500 text-blue-400 shadow-md shadow-blue-500/20"
                    : "bg-slate-950 border-slate-800 text-slate-500"
                }`}
              >
                {idx < currentStep ? (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  idx + 1
                )}
              </div>
              <span
                className={`text-[11px] font-bold uppercase tracking-wider text-center max-w-[100px] hidden sm:block ${
                  idx <= currentStep ? "text-slate-200" : "text-slate-600"
                }`}
              >
                {step}
              </span>
            </div>

            {/* Connecting line */}
            {idx < steps.length - 1 && (
              <div className="flex-1 h-0.5 bg-slate-800 relative -top-4 sm:-top-8">
                <div
                  className="absolute top-0 left-0 h-full bg-blue-600 transition-all duration-500"
                  style={{ width: idx < currentStep ? "100%" : "0%" }}
                />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};
