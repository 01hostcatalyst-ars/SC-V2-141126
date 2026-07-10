"use client";

import React from "react";
import { Badge, BadgeVariant } from "@/components/ui/Badge";

interface StatusTimelineProps {
  status: string;
}

export const StatusTimeline: React.FC<StatusTimelineProps> = ({ status }) => {
  const steps = [
    { label: "Draft", activeStatuses: ["DRAFT", "PENDING_RESPONDENT", "PENDING_INITIATOR", "ACTIVE", "COMPLETED"] },
    { label: "Awaiting Respondent", activeStatuses: ["PENDING_RESPONDENT", "PENDING_INITIATOR", "ACTIVE", "COMPLETED"] },
    { label: "Awaiting Initiator", activeStatuses: ["PENDING_INITIATOR", "ACTIVE", "COMPLETED"] },
    { label: "Active Campaign", activeStatuses: ["ACTIVE", "COMPLETED"] },
    { label: "Fulfilled", activeStatuses: ["COMPLETED"] },
  ];

  const getBadgeVariant = (): BadgeVariant => {
    switch (status) {
      case "ACTIVE":
        return "success";
      case "PENDING_RESPONDENT":
      case "PENDING_INITIATOR":
        return "warning";
      case "CANCELLED":
      case "EXPIRED":
        return "danger";
      case "COMPLETED":
        return "primary";
      default:
        return "default";
    }
  };

  if (status === "CANCELLED" || status === "EXPIRED") {
    return (
      <div className="flex items-center gap-3">
        <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Campaign State:</span>
        <Badge variant={getBadgeVariant()}>{status.replace(/_/g, " ")}</Badge>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 w-full border-b border-slate-900 pb-6 mb-2">
      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Progress Timeline</span>
        <Badge variant={getBadgeVariant()}>{status.replace(/_/g, " ")}</Badge>
      </div>

      <div className="flex items-center justify-between gap-1 w-full mt-2 relative">
        {/* Connecting progress line */}
        <div className="absolute top-4 left-0 w-full h-[2px] bg-slate-900 -z-10" />

        {steps.map((step, idx) => {
          const isCompleted = step.activeStatuses.includes(status);
          const isCurrent = step.activeStatuses[step.activeStatuses.length - 1] === status;

          return (
            <div key={idx} className="flex flex-col items-center gap-1.5 flex-1">
              <div
                className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold text-xs bg-slate-950 transition-all ${
                  isCompleted
                    ? "border-blue-600 text-blue-400"
                    : "border-slate-800 text-slate-600"
                } ${isCurrent ? "shadow-md shadow-blue-500/10 border-blue-500" : ""}`}
              >
                {isCompleted ? "✓" : idx + 1}
              </div>
              <span className={`text-[9px] font-bold uppercase tracking-wider text-center hidden sm:block ${
                isCompleted ? "text-slate-200" : "text-slate-600"
              }`}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
