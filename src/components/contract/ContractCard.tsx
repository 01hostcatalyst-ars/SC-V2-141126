"use client";

import React from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

interface ContractCardProps {
  contract: any;
}

export const ContractCard: React.FC<ContractCardProps> = ({ contract }) => {
  const getBadgeVariant = (status: string) => {
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

  const getTargetName = () => {
    return contract.respondentName || contract.respondentCompany || "Pending Invitee";
  };

  return (
    <div className="glass-card p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-left">
      <div className="flex flex-col gap-1 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-bold text-sm text-white">{contract.contractNumber}</span>
          <Badge variant={getBadgeVariant(contract.status)}>
            {contract.status.replace(/_/g, " ")}
          </Badge>
          <Badge variant="default">
            {contract.contractType.replace(/_/g, " ")}
          </Badge>
        </div>
        <div className="text-xs text-slate-400 font-semibold mt-1">
          Counterparty: <span className="text-slate-200">{getTargetName()}</span>
        </div>
        <div className="text-[10px] text-slate-500 font-semibold mt-0.5">
          Created: {new Date(contract.createdAt).toLocaleDateString()}
        </div>
      </div>

      <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 border-slate-900/60 pt-3 sm:pt-0">
        <div className="flex flex-col text-left sm:text-right">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Amount</span>
          <span className="text-sm font-extrabold text-white">
            PKR {Number(contract.totalAmount).toLocaleString()}
          </span>
        </div>
        <Link href={`/contracts/${contract.id}`}>
          <Button variant="secondary">
            View Agreement
          </Button>
        </Link>
      </div>
    </div>
  );
};
