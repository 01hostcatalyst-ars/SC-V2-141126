"use client";

import React from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

interface Step5Props {
  latePaymentPenaltyPct: string;
  setLatePaymentPenaltyPct: (val: string) => void;
  lateContentPenaltyPct: string;
  setLateContentPenaltyPct: (val: string) => void;
  onNext: () => void;
  onBack: () => void;
}

export const Step5_Penalties: React.FC<Step5Props> = ({
  latePaymentPenaltyPct,
  setLatePaymentPenaltyPct,
  lateContentPenaltyPct,
  setLateContentPenaltyPct,
  onNext,
  onBack,
}) => {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="text-xl font-bold text-white mb-1">Bilateral Penalties</h3>
        <p className="text-xs text-slate-500">Secure both parties by setting late-action performance penalties (default 3% per day).</p>
      </div>

      <div className="flex flex-col gap-5 border border-slate-900 bg-slate-900/10 p-6 rounded-xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="flex flex-col gap-2">
            <Input
              label="Late Payment Penalty (% per day delay)"
              type="number"
              min={0}
              placeholder="3"
              value={latePaymentPenaltyPct}
              onChange={(e) => setLatePaymentPenaltyPct(e.target.value)}
            />
            <span className="text-[10px] text-slate-500 leading-relaxed">
              Charged to the brand if payment is delayed after deliverable approval.
            </span>
          </div>

          <div className="flex flex-col gap-2">
            <Input
              label="Late Content Penalty (% per day delay)"
              type="number"
              min={0}
              placeholder="3"
              value={lateContentPenaltyPct}
              onChange={(e) => setLateContentPenaltyPct(e.target.value)}
            />
            <span className="text-[10px] text-slate-500 leading-relaxed">
              Charged to the creator if content delivery passes the deadline.
            </span>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center mt-4">
        <Button variant="secondary" type="button" onClick={onBack}>
          Back
        </Button>
        <Button type="button" onClick={onNext}>
          Next Step
        </Button>
      </div>
    </div>
  );
};
