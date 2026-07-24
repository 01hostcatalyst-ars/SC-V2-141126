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
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 border border-amber-200 text-amber-800 uppercase tracking-wider">Draft</span>;
      case "PENDING_RESPONDENT":
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-50 border border-blue-200 text-blue-800 uppercase tracking-wider">Awaiting Receiver</span>;
      case "PENDING_INITIATOR":
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-orange-50 border border-orange-200 text-orange-800 uppercase tracking-wider">Awaiting You</span>;
      case "ACTIVE":
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 border border-emerald-200 text-emerald-800 uppercase tracking-wider">Active</span>;
      case "COMPLETED":
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-indigo-50 border border-indigo-200 text-indigo-800 uppercase tracking-wider">Completed</span>;
      case "EXPIRED":
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-50 border border-rose-200 text-rose-800 uppercase tracking-wider">Expired</span>;
      case "CANCELLED":
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-50 border border-rose-200 text-rose-800 uppercase tracking-wider">Cancelled</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-gray-50 border border-gray-200 text-gray-800 uppercase tracking-wider">{status}</span>;
    }
  };

  const getContractTypeBadge = (type: string) => {
    const formatted = (type || "").replace(/_/g, " ");
    return (
      <span className="text-[10px] font-extrabold bg-gray-100 text-gray-700 px-2.5 py-1 rounded border border-gray-200 uppercase tracking-wider">
        {formatted}
      </span>
    );
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4">
      {/* Top Header Row */}
      <div className="flex items-center justify-between gap-2 border-b border-gray-100 pb-3">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[11px] font-bold text-gray-400 uppercase tracking-wider">
            {contract.contractNumber}
          </span>
          <span className="text-[10px] font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-200 uppercase">
            {jur.countryCode} • {currencyCode}
          </span>
        </div>
        {getStatusBadge(contract.status)}
      </div>

      {/* Contract Type Badge */}
      <div>{getContractTypeBadge(contract.contractType)}</div>

      {/* Parties Block */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Party A (Initiator) */}
        <div className="bg-gray-50/80 border border-gray-100 rounded-xl p-3.5 space-y-1">
          <span className="text-[9px] font-extrabold uppercase text-gray-400 tracking-wider block">
            Party A (Initiator)
          </span>
          <div className="text-sm font-black text-black leading-tight break-words">
            {partyAEntity}
          </div>
          {partyARepName && (
            <div className="text-xs text-gray-600 font-medium">
              Representative: <strong className="text-gray-900 font-bold">{partyARepName}</strong>
              {partyARepTitle ? <span className="text-gray-500 text-[11px]"> ({partyARepTitle})</span> : ""}
            </div>
          )}
        </div>

        {/* Party B (Respondent / Counterparty) */}
        <div className="bg-gray-50/80 border border-gray-100 rounded-xl p-3.5 space-y-1">
          <span className="text-[9px] font-extrabold uppercase text-gray-400 tracking-wider block">
            Party B (Counterparty)
          </span>
          <div className="text-sm font-black text-black leading-tight break-words">
            {partyBEntity}
          </div>
          {partyBRepName ? (
            <div className="text-xs text-gray-600 font-medium">
              Representative: <strong className="text-gray-900 font-bold">{partyBRepName}</strong>
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
      <div className="border-t border-gray-100 pt-3 flex items-center justify-between">
        <div>
          <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">Total Campaign Value</span>
          <span className="text-base font-black text-black">
            {formatCurrencyAmount(contract.totalAmount, currencyCode)}
          </span>
        </div>
        <div className="text-right">
          <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">Governing Law</span>
          <span className="text-xs font-bold text-gray-700">
            {jur.lawAbbreviation}
          </span>
        </div>
      </div>

      {/* Action Buttons Footer */}
      <div className="border-t border-gray-100 pt-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap">
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
                className="bg-black text-white hover:bg-black/90 font-bold px-3 py-1.5 rounded-lg text-[10px] uppercase shadow-sm transition-all whitespace-nowrap cursor-pointer disabled:opacity-50"
              >
                {downloadingPdf ? "Retrieving..." : "Contract PDF"}
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
                className="bg-blue-600 text-white hover:bg-blue-700 font-bold px-3 py-1.5 rounded-lg text-[10px] uppercase shadow-sm transition-all whitespace-nowrap cursor-pointer disabled:opacity-50"
              >
                {downloadingCert ? "Retrieving..." : "Audit Certificate"}
              </button>
            </>
          )}
        </div>

        <Link
          href={`/contracts/${contract.id}`}
          className="bg-gray-100 hover:bg-gray-200 text-black font-bold px-4 py-1.5 rounded-lg text-[10px] uppercase transition-all whitespace-nowrap ml-auto"
        >
          View Details
        </Link>
      </div>
    </div>
  );
}
