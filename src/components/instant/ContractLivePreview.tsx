"use client";

import React from "react";
import {
  FileText,
  ShieldCheck,
  Scale,
  Clock,
  DollarSign,
  Globe,
  Building2,
  User,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Lock,
  Layers,
  Calendar,
  Tag,
  Share2,
  Maximize2,
  X,
} from "lucide-react";
import { InstantContractFormState } from "./types";
import { getJurisdiction } from "@/lib/config/jurisdictions";
import { CURRENCY_MAP } from "@/lib/currency";

interface ContractLivePreviewProps {
  form: InstantContractFormState;
  isMobileDrawer?: boolean;
  onCloseMobileDrawer?: () => void;
}

export function ContractLivePreview({
  form,
  isMobileDrawer = false,
  onCloseMobileDrawer,
}: ContractLivePreviewProps) {
  const jur = getJurisdiction(form.jurisdictionCountryCode);
  const currencySymbol = CURRENCY_MAP[form.currency]?.symbol || "$";
  const total = parseFloat(form.totalAmount) || 0;
  const advanceAmount = Math.round((total * form.advancePercent) / 100);
  const balanceAmount = total - advanceAmount;

  // Format contract title based on workflow
  const getWorkflowTitle = () => {
    switch (form.contractType) {
      case "CREATOR_TO_BRAND":
        return "Creator-to-Brand Commercial Influencer Agreement";
      case "BRAND_TO_CREATOR":
        return "Brand Sponsorship & Content Creation Master Agreement";
      case "AGENCY_TO_CREATOR":
        return "Agency Campaign Delegation & Talent Representation Agreement";
      case "AGENCY_TO_BRAND":
        return "Agency-Brand Influencer Campaign Services Agreement";
      case "BRAND_TO_AGENCY":
        return "Brand-Agency Influencer Marketing Retainer";
      case "CREATOR_TO_AGENCY":
        return "Creator Talent Representation & Campaign Mandate";
      default:
        return "Commercial Influencer Collaboration Agreement";
    }
  };

  return (
    <div
      className={`flex flex-col h-full bg-zinc-900/5 rounded-3xl border border-zinc-200/80 overflow-hidden shadow-xs backdrop-blur-xs ${
        isMobileDrawer ? "p-3 sm:p-5" : "p-4 xl:p-6"
      }`}
    >
      {/* Document Top Bar */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-zinc-200/80 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-zinc-950 text-white flex items-center justify-center">
            <FileText className="w-3.5 h-3.5" strokeWidth={2.2} />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-zinc-950 tracking-tight">
                Live Document Preview
              </span>
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-emerald-100 text-emerald-800 border border-emerald-300/60">
                A4 Statutory
              </span>
            </div>
            <p className="text-[10px] text-zinc-600 font-mono">
              Ref: SC-{form.jurisdictionCountryCode}-{(total || 1000).toString().slice(0, 3)}-PREVIEW
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="hidden sm:inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-mono font-medium bg-white border border-zinc-200 text-zinc-600">
            <Globe className="w-3 h-3 text-zinc-400" />
            {jur.governingLawName}
          </span>
          {isMobileDrawer && onCloseMobileDrawer && (
            <button
              type="button"
              onClick={onCloseMobileDrawer}
              className="p-2 rounded-lg bg-white border border-zinc-200 text-zinc-700 hover:text-zinc-950 hover:bg-zinc-100 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
              aria-label="Close Preview"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Document Scrollable Canvas (Styled as Paper Sheet) */}
      <div className="flex-1 overflow-y-auto pr-1 space-y-4 text-left font-sans text-xs text-zinc-800">
        <div className="bg-white p-5 sm:p-7 rounded-2xl border border-zinc-200/90 shadow-sm relative space-y-5">
          {/* Subtle Watermark */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03] select-none">
            <span className="text-7xl font-black rotate-[-30deg] tracking-widest text-zinc-950">
              SIGNCOLLAB
            </span>
          </div>

          {/* Legal Header Block */}
          <div className="border-b border-zinc-200 pb-4 text-center space-y-1">
            <p className="text-[10px] font-mono font-bold text-zinc-600 uppercase tracking-widest">
              Standard Commercial Instrument • SignCollab Protocol
            </p>
            <h1 className="text-base sm:text-lg font-black text-zinc-950 tracking-tight font-display">
              {getWorkflowTitle()}
            </h1>
            <div className="flex flex-wrap items-center justify-center gap-2 pt-1 text-[11px] text-zinc-600">
              <span className="font-semibold text-zinc-800">Governing Statute:</span>
              <span className="font-mono bg-zinc-100 px-2 py-0.5 rounded text-zinc-700 font-semibold border border-zinc-200">
                {jur.countryName} ({jur.lawAbbreviation})
              </span>
              <span>•</span>
              <span className="text-zinc-600 font-mono">
                Date: {new Date().toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}
              </span>
            </div>
          </div>

          {/* Recitals / Parties */}
          <div className="space-y-2">
            <h3 className="text-[11px] font-bold text-zinc-950 uppercase tracking-wider flex items-center gap-1.5 border-b border-zinc-100 pb-1">
              <User className="w-3.5 h-3.5 text-zinc-600" />
              <span>Section 1 • Contracting Parties</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px] pt-1">
              {/* Party A (Initiator) */}
              <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200/80 space-y-1">
                <span className="text-[9px] font-mono font-bold text-zinc-600 uppercase block">
                  Party A (Initiator / Executing Party)
                </span>
                <p className="font-bold text-zinc-950 text-xs">
                  {form.initiatorName || "Legal Name Pending"}
                </p>
                {form.initiatorCompany && (
                  <p className="text-zinc-600 font-medium">
                    {form.initiatorCompany} {form.initiatorDesignation ? `(${form.initiatorDesignation})` : ""}
                  </p>
                )}
                <p className="text-zinc-600 font-mono text-[10px]">
                  {form.initiatorEmail || "email@domain.com"}
                </p>
                <p className="text-zinc-600 text-[10px]">
                  Capacity:{" "}
                  <span className="font-semibold text-zinc-800">
                    {form.creatorRepresentationCapacity === "CREATOR_SELF"
                      ? "Individual Creator (Self)"
                      : "Authorized Talent Manager / Agent"}
                  </span>
                </p>
                {(form.initiatorTaxId || form.initiatorNationalId) && (
                  <p className="text-zinc-600 font-mono text-[9px]">
                    ID/Tax: {form.initiatorTaxId || form.initiatorNationalId}
                  </p>
                )}
              </div>

              {/* Party B (Counterparty) */}
              <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200/80 space-y-1">
                <span className="text-[9px] font-mono font-bold text-zinc-600 uppercase block">
                  Party B (Counterparty Signer)
                </span>
                <p className="font-bold text-zinc-950 text-xs">
                  {form.brandName || form.creatorName || "Designated Counterparty"}
                </p>
                <p className="text-zinc-600 font-medium">
                  {form.brandHandle || form.creatorHandle ? `@${(form.brandHandle || form.creatorHandle)?.replace("@", "")}` : "Social Handle Pending"}
                </p>
                <p className="text-zinc-600 text-[10px]">
                  Status:{" "}
                  <span className="inline-flex items-center gap-1 font-semibold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                    Counter-Signature Pending Link Access
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Section 2: Deliverables Schedule */}
          <div className="space-y-2">
            <h3 className="text-[11px] font-bold text-zinc-950 uppercase tracking-wider flex items-center gap-1.5 border-b border-zinc-100 pb-1">
              <Layers className="w-3.5 h-3.5 text-zinc-600" />
              <span>Section 2 • Deliverables Schedule &amp; Scope</span>
            </h3>

            <div className="overflow-hidden rounded-xl border border-zinc-200">
              <table className="w-full text-left text-[11px]">
                <thead className="bg-zinc-100/80 border-b border-zinc-200 font-bold text-zinc-700">
                  <tr>
                    <th className="p-2.5">Deliverable Format</th>
                    <th className="p-2.5 text-center">Qty</th>
                    <th className="p-2.5">Retention</th>
                    <th className="p-2.5">Production Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200">
                  {form.deliverables.map((item, idx) => (
                    <tr key={idx} className="hover:bg-zinc-50/50">
                      <td className="p-2.5 font-bold text-zinc-950">
                        {item.type.replace(/_/g, " ")}
                      </td>
                      <td className="p-2.5 text-center font-mono font-bold">
                        {item.quantity}
                      </td>
                      <td className="p-2.5 font-mono text-zinc-600 text-[10px]">
                        {item.duration}
                      </td>
                      <td className="p-2.5 text-zinc-600 text-[10px] leading-relaxed">
                        {item.notes || "Standard specifications as mutually agreed."}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {form.taggingRequirements && (
              <div className="p-2.5 rounded-lg bg-zinc-50 border border-zinc-200/80 text-[10px] space-y-1">
                <span className="font-bold text-zinc-800 uppercase tracking-wide flex items-center gap-1">
                  <Tag className="w-3 h-3 text-zinc-600" />
                  Mandatory Tags &amp; Disclosures:
                </span>
                <p className="text-zinc-600 font-medium">{form.taggingRequirements}</p>
              </div>
            )}

            {form.contentOwnership && (
              <div className="p-2.5 rounded-lg bg-zinc-50 border border-zinc-200/80 text-[10px] space-y-1">
                <span className="font-bold text-zinc-800 uppercase tracking-wide flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-zinc-600" />
                  Intellectual Property Standard:
                </span>
                <p className="text-zinc-600 font-medium">{form.contentOwnership}</p>
              </div>
            )}
          </div>

          {/* Section 3: Distribution & Usage Rights */}
          <div className="space-y-2">
            <h3 className="text-[11px] font-bold text-zinc-950 uppercase tracking-wider flex items-center gap-1.5 border-b border-zinc-100 pb-1">
              <Share2 className="w-3.5 h-3.5 text-zinc-600" />
              <span>Section 3 • Distribution, Usage Rights &amp; SLAs</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-[11px]">
              <div className="p-2.5 rounded-lg bg-zinc-50 border border-zinc-200/80">
                <span className="text-[9px] font-mono text-zinc-600 block uppercase font-bold">
                  Authorized Platforms
                </span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {form.platforms.map((p) => (
                    <span
                      key={p}
                      className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-white border border-zinc-200 text-zinc-800"
                    >
                      {p}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-zinc-50 border border-zinc-200/80">
                <span className="text-[9px] font-mono text-zinc-600 block uppercase font-bold">
                  Usage Scope &amp; Spark Ads
                </span>
                <p className="font-bold text-zinc-950 mt-1">
                  {form.usageType.replace(/_/g, " ")} • Paid Boosting: {form.paidBoostingDuration}
                </p>
              </div>
            </div>

            {/* Statutory SLA Clauses */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px]">
              <div className="p-2.5 rounded-lg bg-emerald-50/70 border border-emerald-200/80 text-emerald-950 flex items-start gap-2">
                <Clock className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block">48-Hour Deemed Approval Clause</span>
                  <p className="text-emerald-800 leading-snug">
                    {form.deemedApproval48h
                      ? "Active: Counterparty has 48 business hours to request revisions. Absence of review constitutes statutory sign-off."
                      : "Standard revision turnaround applies without automated deemed approval."}
                  </p>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-zinc-50 border border-zinc-200 text-zinc-800 flex items-start gap-2">
                <Sparkles className="w-3.5 h-3.5 text-zinc-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block">Revision Scope</span>
                  <p className="text-zinc-600 leading-snug">
                    Includes up to {form.revisionLimit || form.revisionRounds || 2} round(s) of edits within original script parameters.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Consideration & Financial Terms */}
          <div className="space-y-2">
            <h3 className="text-[11px] font-bold text-zinc-950 uppercase tracking-wider flex items-center gap-1.5 border-b border-zinc-100 pb-1">
              <DollarSign className="w-3.5 h-3.5 text-zinc-600" />
              <span>Section 4 • Consideration &amp; Payment Schedule</span>
            </h3>

            <div className="p-3.5 rounded-xl bg-zinc-950 text-white space-y-2.5">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono uppercase text-zinc-400 block font-bold">
                    Total Campaign Consideration
                  </span>
                  <span className="text-lg sm:text-xl font-mono font-black tracking-tight text-white">
                    {currencySymbol}
                    {total ? total.toLocaleString(undefined, { minimumFractionDigits: 2 }) : "0.00"}{" "}
                    <span className="text-xs font-normal text-zinc-400">{form.currency}</span>
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-mono uppercase text-zinc-400 block font-bold">
                    Tax Treatment
                  </span>
                  <span className="text-xs font-bold text-zinc-200">
                    {form.taxTreatment.replace(/_/g, " ")}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-zinc-800 text-[10px] font-mono">
                <div className="bg-zinc-900 p-2 rounded-lg border border-zinc-800">
                  <span className="text-zinc-400 block">Upfront Milestone ({form.advancePercent}%)</span>
                  <span className="font-bold text-emerald-400 text-xs">
                    {currencySymbol}{advanceAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                  <span className="text-[9px] text-zinc-400 block">Due prior to production</span>
                </div>
                <div className="bg-zinc-900 p-2 rounded-lg border border-zinc-800">
                  <span className="text-zinc-400 block">Balance Milestone ({100 - form.advancePercent}%)</span>
                  <span className="font-bold text-zinc-100 text-xs">
                    {currencySymbol}{balanceAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                  <span className="text-[9px] text-zinc-400 block">Due upon final delivery</span>
                </div>
              </div>

              <div className="text-[10px] text-zinc-400 flex items-center justify-between pt-1">
                <span>Payment Routing: {form.paymentMethod.replace(/_/g, " ")}</span>
                {form.bankAccountIban && <span>IBAN: {form.bankAccountIban}</span>}
                {form.mobileWalletNumber && <span>Wallet: {form.mobileWalletNumber}</span>}
              </div>
            </div>
          </div>

          {/* Section 5: Statutory Protections & Restraints */}
          <div className="space-y-2">
            <h3 className="text-[11px] font-bold text-zinc-950 uppercase tracking-wider flex items-center gap-1.5 border-b border-zinc-100 pb-1">
              <Scale className="w-3.5 h-3.5 text-zinc-600" />
              <span>Section 5 • Protections, Penalties &amp; Covenants</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px]">
              <div className="p-2.5 rounded-lg bg-zinc-50 border border-zinc-200">
                <span className="font-bold text-zinc-950 block">Late Performance Penalties</span>
                <p className="text-zinc-600">
                  Late Delivery: {form.lateContentPenaltyPct}% / day • Late Remittance: {form.latePaymentPenaltyPct}% / day
                  (Aggregate cap: {form.penaltyCapPct}%)
                </p>
              </div>

              <div className="p-2.5 rounded-lg bg-zinc-50 border border-zinc-200">
                <span className="font-bold text-zinc-950 block">Category Exclusivity</span>
                <p className="text-zinc-600">
                  {form.exclusivityClause
                    ? `Active for ${form.exclusivityDuration}. Restricted: ${form.exclusivityCompetitors || "Direct category competitors"}`
                    : "Non-exclusive engagement."}
                </p>
              </div>

              {form.confidentialityRequired && (
                <div className="p-2.5 rounded-lg bg-zinc-50 border border-zinc-200 sm:col-span-2">
                  <span className="font-bold text-zinc-950 block flex items-center gap-1">
                    <Lock className="w-3 h-3 text-zinc-600" />
                    Confidentiality &amp; Public Embargo
                  </span>
                  <p className="text-zinc-600">
                    No disclosure prior to: {form.embargoDate || "Campaign Launch"}. Early disclosure penalty:{" "}
                    {currencySymbol}{form.earlyDisclosurePenalty || "Standard damages"}.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Section 6: Execution & Bilateral E-Signatures */}
          <div className="space-y-2 pt-2 border-t border-zinc-200">
            <h3 className="text-[11px] font-bold text-zinc-950 uppercase tracking-wider flex items-center gap-1.5 border-b border-zinc-100 pb-1">
              <ShieldCheck className="w-3.5 h-3.5 text-zinc-600" />
              <span>Section 6 • Execution &amp; Electronic Signatures</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px] pt-1">
              {/* Party A Signature Box */}
              <div className="p-3 rounded-xl border border-zinc-300 bg-zinc-50/50 space-y-2">
                <span className="text-[9px] font-mono uppercase font-bold text-zinc-600 block">
                  Party A Execution
                </span>
                {form.initiatorSignatureB64 ? (
                  <div className="space-y-1.5">
                    <div className="h-14 bg-white border border-zinc-200 rounded-lg p-1 flex items-center justify-center overflow-hidden">
                      <img
                        src={form.initiatorSignatureB64}
                        alt="Party A Signature"
                        className="max-h-full object-contain"
                      />
                    </div>
                    <div className="flex items-center gap-1 text-[9px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3 shrink-0" />
                      <span>Executed via SHA-256 E-Sign</span>
                    </div>
                  </div>
                ) : (
                  <div className="h-14 border border-dashed border-zinc-300 rounded-lg flex items-center justify-center text-zinc-600 text-[10px] font-mono bg-white">
                    Signature Pending in Step 6
                  </div>
                )}
                <div className="text-[9px] text-zinc-600 font-mono">
                  Signer: {form.initiatorName || "Pending Name"}
                </div>
              </div>

              {/* Party B Signature Box */}
              <div className="p-3 rounded-xl border border-dashed border-zinc-300 bg-zinc-50/30 space-y-2">
                <span className="text-[9px] font-mono uppercase font-bold text-zinc-600 block">
                  Party B Execution
                </span>
                <div className="h-14 border border-dashed border-zinc-200 rounded-lg flex flex-col items-center justify-center text-zinc-600 text-[10px] font-mono bg-white px-2 text-center">
                  <span>Awaiting Counter-Signature</span>
                  <span className="text-[9px] text-zinc-600">Access link dispatched post Step 6</span>
                </div>
                <div className="text-[9px] text-zinc-600 font-mono">
                  Signer: {form.brandName || form.creatorName || "Designated Recipient"}
                </div>
              </div>
            </div>

            <div className="text-[9px] text-zinc-600 font-mono text-center pt-2 leading-tight">
              Enforceable under {jur.governingLawName}. Digital audit log and SHA-256 telemetry generated upon bilateral completion.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
