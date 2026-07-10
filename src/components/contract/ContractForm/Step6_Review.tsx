"use client";

import React from "react";
import { ContractType } from "@prisma/client";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

interface Step6Props {
  formData: any;
  isLoading: boolean;
  onSubmit: () => void;
  onBack: () => void;
}

export const Step6_Review: React.FC<Step6Props> = ({
  formData,
  isLoading,
  onSubmit,
  onBack,
}) => {
  const getContractLabel = (type: ContractType) => {
    return type.replace(/_/g, " ");
  };

  const getRemainingAmount = () => {
    return Number(formData.totalAmount || 0) - Number(formData.advancePayment || 0);
  };

  return (
    <div className="flex flex-col gap-6 text-left">
      <div>
        <h3 className="text-xl font-bold text-white mb-1">Review & Sign Setup</h3>
        <p className="text-xs text-slate-500">Confirm terms and details before generating the signature link.</p>
      </div>

      <div className="flex flex-col gap-5 border border-slate-900 bg-slate-900/10 p-6 rounded-xl text-sm max-h-[50vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-900 pb-3">
          <span className="font-bold text-slate-400">Contract Category</span>
          <Badge variant="accent">{getContractLabel(formData.contractType)}</Badge>
        </div>

        {/* Deliverables summary */}
        <div className="flex flex-col gap-2">
          <span className="font-bold text-slate-400">Deliverables Brief</span>
          <div className="flex flex-col gap-1.5 pl-3 border-l-2 border-slate-800">
            {formData.deliverables.map((d: any, idx: number) => (
              <div key={idx} className="text-slate-300">
                • {d.quantity}x {d.type.replace(/_/g, " ")} {d.duration ? `(${d.duration})` : ""}
              </div>
            ))}
          </div>
        </div>

        {/* Rights Scope */}
        <div className="grid grid-cols-2 gap-4 border-t border-slate-900 pt-3">
          <div>
            <span className="block font-bold text-slate-400 text-xs uppercase tracking-wider mb-1">
              Platforms Allowed
            </span>
            <span className="text-slate-300 text-xs font-semibold">
              {formData.platformsAllowed.join(", ")}
            </span>
          </div>
          <div>
            <span className="block font-bold text-slate-400 text-xs uppercase tracking-wider mb-1">
              Usage Duration
            </span>
            <span className="text-slate-300 text-xs font-semibold">
              {formData.usageRightsDuration.replace(/_/g, " ")}
            </span>
          </div>
        </div>

        {/* Financial info */}
        <div className="grid grid-cols-3 gap-4 border-t border-slate-900 pt-3">
          <div>
            <span className="block font-bold text-slate-400 text-xs uppercase tracking-wider mb-1">
              Total Campaign Value
            </span>
            <span className="text-white font-bold text-sm">
              PKR {Number(formData.totalAmount).toLocaleString()}
            </span>
          </div>
          <div>
            <span className="block font-bold text-slate-400 text-xs uppercase tracking-wider mb-1">
              Advance Payout
            </span>
            <span className="text-white font-bold text-sm">
              PKR {Number(formData.advancePayment || 0).toLocaleString()}
            </span>
          </div>
          <div>
            <span className="block font-bold text-slate-400 text-xs uppercase tracking-wider mb-1">
              Remaining balance
            </span>
            <span className="text-slate-300 font-bold text-sm">
              PKR {getRemainingAmount().toLocaleString()}
            </span>
          </div>
        </div>

        {/* Deadlines */}
        <div className="grid grid-cols-2 gap-4 border-t border-slate-900 pt-3">
          <div>
            <span className="block font-bold text-slate-400 text-xs uppercase tracking-wider mb-1">
              Delivery Frame
            </span>
            <span className="text-slate-300 text-xs font-semibold">
              {formData.deliveryTimeframeDays} Days after signing
            </span>
          </div>
          <div>
            <span className="block font-bold text-slate-400 text-xs uppercase tracking-wider mb-1">
              Exclusivity Required?
            </span>
            <span className="text-slate-300 text-xs font-semibold">
              {formData.exclusivityClause ? "Yes" : "No"}
            </span>
          </div>
        </div>

        {/* Penalties */}
        <div className="grid grid-cols-2 gap-4 border-t border-slate-900 pt-3">
          <div>
            <span className="block font-bold text-slate-400 text-xs uppercase tracking-wider mb-1">
              Late Payment Penalty
            </span>
            <span className="text-slate-300 text-xs font-semibold">
              {formData.latePaymentPenaltyPct}% per day delay
            </span>
          </div>
          <div>
            <span className="block font-bold text-slate-400 text-xs uppercase tracking-wider mb-1">
              Late Delivery Penalty
            </span>
            <span className="text-slate-300 text-xs font-semibold">
              {formData.lateContentPenaltyPct}% per day delay
            </span>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center mt-4">
        <Button variant="secondary" type="button" onClick={onBack} disabled={isLoading}>
          Back
        </Button>
        <Button type="button" onClick={onSubmit} isLoading={isLoading}>
          Submit & Generate Link
        </Button>
      </div>
    </div>
  );
};
