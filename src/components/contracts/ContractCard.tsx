"use client";

import React, { useState } from "react";
import Link from "next/link";
import { getJurisdiction } from "@/lib/config/jurisdictions";
import { formatCurrencyAmount } from "@/lib/currency";

export interface ContractCardProps {
  contract: any;
  currentUserEmail?: string;
  onDownloadPDF: (id: string) => Promise<void> | void;
  onDownloadCertificate: (id: string) => Promise<void> | void;
}

export default function ContractCard({
  contract,
  currentUserEmail,
  onDownloadPDF,
  onDownloadCertificate,
}: ContractCardProps) {
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [downloadingCert, setDownloadingCert] = useState(false);

  const jur = getJurisdiction(contract.jurisdictionCountryCode || "US");
  const currencyCode = contract.currency || jur.defaultCurrency || "USD";

  // Identify parties from contract model or parties array
  const initiatorParty = contract.parties?.find((p: any) => p.partyType === "INITIATOR");
  const respondentParty = contract.parties?.find((p: any) => p.partyType === "RESPONDENT");

  // Party A (Initiator) Details
  const partyAEntity =
    contract.initiatorCompanyName ||
    contract.brandName ||
    initiatorParty?.companyName ||
    contract.initiator?.agencyName ||
    contract.initiator?.name ||
    "Initiator Entity";

  const partyARepName =
    contract.initiatorName ||
    initiatorParty?.name ||
    contract.initiator?.name;

  const partyARepTitle =
    contract.initiatorDesignation ||
    initiatorParty?.designation;

  // Party B (Respondent / Counterparty) Details
  const partyBEntity =
    contract.respondentCompany ||
    contract.creatorName ||
    respondentParty?.companyName ||
    contract.respondentName ||
    (contract.respondentEmail ? contract.respondentEmail : "Awaiting Counterparty");

  const partyBRepName =
    contract.respondentName ||
    respondentParty?.name;

  const partyBRepTitle =
    contract.respondentDesignation ||
    respondentParty?.designation;

  // Status Badge Logic
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "DRAFT":
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 border border-amber-200 text-amber-900 uppercase tracking-wider">Draft</span>;
      case "PENDING_RESPONDENT":
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-50 border border-blue-200 text-blue-900 uppercase tracking-wider">Awaiting Receiver</span>;
      case "PENDING_INITIATOR":
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-orange-50 border border-orange-200 text-orange-900 uppercase tracking-wider">Awaiting You</span>;
      case "ACTIVE":
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 border border-emerald-200 text-emerald-900 uppercase tracking-wider">Active</span>;
      case "COMPLETED":
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-indigo-50 border border-indigo-200 text-indigo-900 uppercase tracking-wider">Completed</span>;
      case "EXPIRED":
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-50 border border-rose-200 text-rose-900 uppercase tracking-wider">Expired</span>;
      case "CANCELLED":
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-50 border border-rose-200 text-rose-900 uppercase tracking-wider">Cancelled</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-gray-50 border border-gray-200 text-gray-900 uppercase tracking-wider">{status}</span>;
    }
  };

  const getContractTypeBadge = (type: string) => {
    const formatted = (type || "").replace(/_/g, " ");
    return (
      <span className="text-[10px] font-bold bg-slate-100 text-slate-800 px-2.5 py-1 rounded border border-slate-200 uppercase tracking-wider">
        {formatted}
      </span>
    );
  };

  // Determine stage progress (1 to 5)
  const getStageStep = (status: string) => {
    switch (status) {
      case "DRAFT": return 1;
      case "PENDING_RESPONDENT":
      case "PENDING_INITIATOR": return 2;
      case "ACTIVE": return 4;
      case "COMPLETED": return 5;
      default: return 3;
    }
  };
  const currentStage = getStageStep(contract.status);

  return (
    <div className="bg-white/85 backdrop-blur-md border border-gray-200/80 rounded-3xl p-6 shadow-sm hover:shadow-xl hover:scale-[1.005] transition-all flex flex-col justify-between space-y-6 text-left">
      {/* Top Header Row */}
      <div className="flex items-center justify-between gap-3 border-b border-gray-100 pb-3.5">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-bold text-black uppercase tracking-wider">
            {contract.contractNumber}
          </span>
          <span className="text-[10px] font-bold bg-blue-50 text-blue-900 px-2 py-0.5 rounded border border-blue-200 uppercase">
            {jur.countryCode} • {currencyCode}
          </span>
        </div>
        {getStatusBadge(contract.status)}
      </div>

      {/* Contract Type & Deemed Approval Countdown */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {getContractTypeBadge(contract.contractType)}
        
        {/* 48-Hour Deemed Approval Timer Badge */}
        {(contract.status === "ACTIVE" || contract.status === "PENDING_RESPONDENT") && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-900 border border-amber-200 shadow-sm">
            <svg className="w-3.5 h-3.5 text-amber-600 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>48h Deemed Approval Active</span>
          </div>
        )}
      </div>

      {/* 5-Stage Execution Progress Timeline */}
      <div className="p-4 bg-gray-50/80 border border-gray-100 rounded-2xl space-y-2.5">
        <div className="flex items-center justify-between text-[10px] font-bold uppercase text-gray-400">
          <span className={currentStage >= 1 ? "text-emerald-700 font-bold" : ""}>Draft</span>
          <span className={currentStage >= 2 ? "text-emerald-700 font-bold" : ""}>Sent</span>
          <span className={currentStage >= 3 ? "text-emerald-700 font-bold" : ""}>OTP Verified</span>
          <span className={currentStage >= 4 ? "text-emerald-700 font-bold" : ""}>Signed</span>
          <span className={currentStage >= 5 ? "text-emerald-700 font-bold" : ""}>Audit Cert</span>
        </div>
        <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden flex">
          <div
            className="h-full bg-emerald-500 rounded-full transition-all duration-500"
            style={{ width: `${(currentStage / 5) * 100}%` }}
          />
        </div>
      </div>

      {/* Parties Block */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Party A (Initiator) */}
        <div className="bg-gray-50/80 border border-gray-100 rounded-2xl p-4 space-y-1.5">
          <span className="text-[10px] font-bold uppercase text-gray-400 tracking-wider block">
            Party A (Initiator)
          </span>
          <div className="text-sm font-bold text-black leading-tight break-words">
            {partyAEntity}
          </div>
          {partyARepName && (
            <div className="text-xs text-gray-600 font-medium">
              Rep: <strong className="text-gray-900 font-semibold">{partyARepName}</strong>
              {partyARepTitle ? <span className="text-gray-500 text-[11px]"> ({partyARepTitle})</span> : ""}
            </div>
          )}
        </div>

        {/* Party B (Respondent / Counterparty) */}
        <div className="bg-gray-50/80 border border-gray-100 rounded-2xl p-4 space-y-1.5">
          <span className="text-[10px] font-bold uppercase text-gray-400 tracking-wider block">
            Party B (Counterparty)
          </span>
          <div className="text-sm font-bold text-black leading-tight break-words">
            {partyBEntity}
          </div>
          {partyBRepName ? (
            <div className="text-xs text-gray-600 font-medium">
              Rep: <strong className="text-gray-900 font-semibold">{partyBRepName}</strong>
              {partyBRepTitle ? <span className="text-gray-500 text-[11px]"> ({partyBRepTitle})</span> : ""}
            </div>
          ) : (
            <div className="text-[11px] text-gray-400 italic font-medium">
              Pending Counterparty Execution
            </div>
          )}
        </div>
      </div>

      {/* Financial & Jurisdiction Summary */}
      <div className="border-t border-gray-100 pt-3.5 flex items-center justify-between">
        <div>
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Total Deal Value</span>
          <span className="text-base font-bold text-black">
            {formatCurrencyAmount(contract.totalAmount, currencyCode)}
          </span>
        </div>
        <div className="text-right">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Governing Law</span>
          <span className="text-xs font-semibold text-gray-700">
            {jur.lawAbbreviation}
          </span>
        </div>
      </div>

      {/* Action Buttons Footer */}
      <div className="border-t border-gray-100 pt-3.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 flex-wrap">
          {(contract.status === "ACTIVE" || contract.status === "COMPLETED") && (
            <>
              <button
                type="button"
                onClick={async (e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setDownloadingPdf(true);
                  try {
                    await onDownloadPDF(contract.id);
                  } finally {
                    setDownloadingPdf(false);
                  }
                }}
                disabled={downloadingPdf}
                className="bg-black hover:bg-gray-900 text-white font-semibold px-3.5 py-2 rounded-xl text-[10px] uppercase shadow-sm transition-all whitespace-nowrap cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
              >
                <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span>{downloadingPdf ? "Retrieving..." : "Master PDF"}</span>
              </button>

              <button
                type="button"
                onClick={async (e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setDownloadingCert(true);
                  try {
                    await onDownloadCertificate(contract.id);
                  } finally {
                    setDownloadingCert(false);
                  }
                }}
                disabled={downloadingCert}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-3.5 py-2 rounded-xl text-[10px] uppercase shadow-sm transition-all whitespace-nowrap cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span>{downloadingCert ? "Retrieving..." : "Audit Cert"}</span>
              </button>
            </>
          )}
        </div>

        <Link
          href={`/contracts/${contract.id}`}
          className="bg-gray-100 hover:bg-gray-200 text-black font-semibold px-4 py-2 rounded-xl text-[10px] uppercase transition-all whitespace-nowrap ml-auto flex items-center gap-1.5"
        >
          <span>View Details</span>
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </div>
  );
}
