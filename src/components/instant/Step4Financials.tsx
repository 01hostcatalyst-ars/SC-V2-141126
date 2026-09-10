"use client";

import React, { useState } from "react";
import {
  DollarSign,
  ArrowRight,
  ArrowLeft,
  Lock,
  Percent,
  CreditCard,
  AlertTriangle,
  Package,
  Shield,
  Calendar,
} from "lucide-react";
import { ModernSelect } from "@/components/ui/ModernSelect";
import { AutocompleteInput } from "@/components/ui/AutocompleteInput";
import { EXCLUSIVITY_COMPETITOR_SUGGESTIONS } from "./constants";
import { getJurisdiction } from "@/lib/config/jurisdictions";
import { InstantContractFormState } from "./types";

interface Step4Props {
  form: InstantContractFormState;
  onChange: (updates: Partial<InstantContractFormState>) => void;
  onNext: () => void;
  onBack: () => void;
}

const ADVANCE_OPTIONS = [
  { value: 0, label: "0% (Post-Delivery)" },
  { value: 25, label: "25% Deposit" },
  { value: 50, label: "50% Upfront (Standard)" },
  { value: 100, label: "100% Full Prepayment" },
];

const TAX_OPTIONS = [
  { value: "EXCLUSIVE", label: "Exclusive of Tax (Tax added on top)" },
  { value: "INCLUSIVE", label: "Inclusive of Tax (Included in total fee)" },
  { value: "REVERSE_CHARGE", label: "Reverse Charge / Non-Taxable B2B" },
];

const PRODUCT_PROVISION_OPTIONS = [
  { value: "None", label: "None (Digital / Service only)" },
  { value: "Free Gift", label: "Free Gift (Retained by Creator)" },
  { value: "Product Loan", label: "Product Loan (Must be returned post-campaign)" },
];

export function Step4Financials({ form, onChange, onNext, onBack }: Step4Props) {
  const jur = getJurisdiction(form.jurisdictionCountryCode);
  const total = parseFloat(form.totalAmount) || 0;
  const advanceAmount = Math.round((total * form.advancePercent) / 100);
  const balanceAmount = total - advanceAmount;

  const paymentMethodOptions = jur.allowedPaymentMethods.map((m) => ({
    value: m,
    label: m.replace(/_/g, " "),
  }));

  return (
    <div className="space-y-6 text-left">
      {/* Step Header */}
      <div className="border-b border-zinc-100 pb-4">
        <div className="flex items-center gap-2 text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider">
          <DollarSign className="w-4 h-4 text-zinc-950" strokeWidth={2} />
          <span>Step 4 • Commercial Terms</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-black text-zinc-950 font-display tracking-tight mt-1">
          Financial Compensation &amp; Bilateral Protection
        </h2>
        <p className="text-xs sm:text-sm text-zinc-500 mt-1 font-medium leading-relaxed">
          Lock payment milestones, tax treatment, payout routing, and bilateral delay/cancellation penalties.
        </p>
      </div>

      {/* Primary Compensation Card */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white border border-zinc-200/90 shadow-xs space-y-5 surface-card">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-zinc-950 uppercase tracking-wider flex items-center justify-between">
              <span>Total Contract Fee *</span>
              <span className="font-mono text-zinc-500">{form.currency}</span>
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3.5 text-zinc-400 font-mono text-sm font-bold pointer-events-none">
                {form.currency}
              </span>
              <input
                type="number"
                min={0}
                placeholder="0.00"
                value={form.totalAmount}
                onChange={(e) => onChange({ totalAmount: e.target.value })}
                className="w-full pl-14 pr-4 py-3 rounded-xl border border-zinc-300 bg-white text-base font-bold font-mono text-zinc-950 focus:border-zinc-950 focus:outline-none shadow-2xs"
              />
            </div>
          </div>

          <ModernSelect
            label="Tax Treatment *"
            value={form.taxTreatment}
            onChange={(val) => onChange({ taxTreatment: val })}
            options={TAX_OPTIONS}
          />
        </div>

        {/* Advance Payment Breakdown */}
        <div className="space-y-2 pt-2 border-t border-zinc-100">
          <label className="text-xs font-bold text-zinc-950 uppercase tracking-wider block">
            Upfront Advance Deposit Milestone
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {ADVANCE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => onChange({ advancePercent: opt.value })}
                className={`p-2.5 rounded-xl border text-center text-xs font-bold transition-all min-h-[44px] cursor-pointer ${
                  form.advancePercent === opt.value
                    ? "bg-zinc-950 text-white border-zinc-950 shadow-2xs"
                    : "bg-zinc-50/80 border-zinc-200 text-zinc-700 hover:bg-zinc-100"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Milestone Display */}
          <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-zinc-50 border border-zinc-200/70 text-xs mt-2">
            <div>
              <span className="text-[10px] uppercase font-bold text-zinc-400 block">Upfront Deposit</span>
              <span className="text-sm font-mono font-bold text-emerald-700">
                {form.currency} {advanceAmount.toLocaleString()}
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-zinc-400 block">Balance on Approval</span>
              <span className="text-sm font-mono font-bold text-zinc-950">
                {form.currency} {balanceAmount.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Payout Routing Information */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white border border-zinc-200/90 shadow-xs space-y-4 surface-card">
        <div className="flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-zinc-950" strokeWidth={2} />
          <span className="text-xs font-bold text-zinc-950 uppercase tracking-wide">
            Payment Method &amp; Routing Details
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <ModernSelect
            label="Authorized Payment Method *"
            value={form.paymentMethod}
            onChange={(val) => onChange({ paymentMethod: val })}
            options={paymentMethodOptions}
          />

          {form.paymentMethod.includes("IBAN") || form.paymentMethod.includes("WIRE") ? (
            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-800">Bank IBAN / Account Number</label>
              <input
                type="text"
                placeholder={jur.countryCode === "US" ? "Routing & Account No" : "IBAN format"}
                value={form.bankAccountIban}
                onChange={(e) => onChange({ bankAccountIban: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-lg border border-zinc-300 bg-white text-xs font-mono font-semibold text-zinc-950 focus:border-zinc-950 focus:outline-none"
              />
            </div>
          ) : (
            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-800">Wallet / PayPal ID</label>
              <input
                type="text"
                placeholder="username@paypal.com or wallet number"
                value={form.mobileWalletNumber}
                onChange={(e) => onChange({ mobileWalletNumber: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-lg border border-zinc-300 bg-white text-xs font-semibold text-zinc-950 focus:border-zinc-950 focus:outline-none"
              />
            </div>
          )}
        </div>
      </div>

      {/* Product Provision & Non-Return Fees */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white border border-zinc-200/90 shadow-xs space-y-4 surface-card">
        <div className="flex items-center gap-2">
          <Package className="w-4 h-4 text-zinc-950" strokeWidth={2} />
          <span className="text-xs font-bold text-zinc-950 uppercase tracking-wide">
            Product Provisioning &amp; Loan Terms
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <ModernSelect
            label="Product Provision Status"
            value={form.collabProductProvisionType}
            onChange={(val) => onChange({ collabProductProvisionType: val })}
            options={PRODUCT_PROVISION_OPTIONS}
          />

          {form.collabProductProvisionType === "Product Loan" && (
            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-800">
                Non-Return Replacement Fee ({form.currency})
              </label>
              <input
                type="number"
                min={0}
                placeholder="e.g. 1200"
                value={form.collabProductNonReturnFee}
                onChange={(e) => onChange({ collabProductNonReturnFee: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-lg border border-zinc-300 bg-white text-xs font-bold font-mono text-zinc-950 focus:border-zinc-950 focus:outline-none"
              />
            </div>
          )}
        </div>
      </div>

      {/* Bilateral Protection Clauses (Exclusivity & Confidentiality) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Exclusivity Clause */}
        <div
          onClick={() => onChange({ exclusivityClause: !form.exclusivityClause })}
          className={`p-4 rounded-xl border transition-all cursor-pointer select-none surface-subtle ${
            form.exclusivityClause ? "bg-amber-50/60 border-amber-300" : "bg-zinc-50 border-zinc-200/80 opacity-70"
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-zinc-950">Competitor Exclusivity Embargo</span>
            <span
              className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded border ${
                form.exclusivityClause
                  ? "bg-amber-100 text-amber-900 border-amber-300"
                  : "bg-zinc-200 text-zinc-600 border-zinc-300"
              }`}
            >
              {form.exclusivityClause ? "Active" : "Off"}
            </span>
          </div>
          <p className="text-[11px] text-zinc-600 leading-snug">
            Restricts creator from promoting direct competing brands during the campaign window.
          </p>
        </div>

        {/* Confidentiality & Embargo Date */}
        <div
          onClick={() => onChange({ confidentialityRequired: !form.confidentialityRequired })}
          className={`p-4 rounded-xl border transition-all cursor-pointer select-none surface-subtle ${
            form.confidentialityRequired ? "bg-emerald-50/60 border-emerald-300" : "bg-zinc-50 border-zinc-200/80 opacity-70"
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-zinc-950">Non-Disclosure &amp; Embargo</span>
            <span
              className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded border ${
                form.confidentialityRequired
                  ? "bg-emerald-100 text-emerald-900 border-emerald-300"
                  : "bg-zinc-200 text-zinc-600 border-zinc-300"
              }`}
            >
              {form.confidentialityRequired ? "Active" : "Off"}
            </span>
          </div>
          <p className="text-[11px] text-zinc-600 leading-snug">
            Requires strict secrecy regarding unannounced products until the agreed launch date.
          </p>
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="pt-4 border-t border-zinc-100 flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="px-4 py-2.5 rounded-xl border border-zinc-200 text-zinc-700 hover:bg-zinc-100 font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer min-h-[44px]"
        >
          <ArrowLeft className="w-4 h-4 text-zinc-500" strokeWidth={2} />
          <span>Back</span>
        </button>

        <button
          type="button"
          onClick={onNext}
          className="px-6 py-3 rounded-xl bg-zinc-950 text-white hover:bg-zinc-900 font-bold text-xs transition-all shadow-sm flex items-center gap-2 cursor-pointer min-h-[44px]"
        >
          <span>Continue to Identity</span>
          <ArrowRight className="w-4 h-4 text-zinc-400" strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}
