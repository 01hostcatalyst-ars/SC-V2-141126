"use client";

import React, { useState } from "react";
import {
  ShieldCheck,
  PenTool,
  Mail,
  KeyRound,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  RefreshCw,
  Lock,
} from "lucide-react";
import { SignaturePadModal } from "@/components/ui/SignaturePadModal";
import { InstantContractFormState } from "./types";
import { getJurisdiction } from "@/lib/config/jurisdictions";

interface Step6Props {
  form: InstantContractFormState;
  onChange: (updates: Partial<InstantContractFormState>) => void;
  onSubmit: () => Promise<void>;
  onBack: () => void;
  loading: boolean;
  errorMsg: string;
}

export function Step6SignOtp({
  form,
  onChange,
  onSubmit,
  onBack,
  loading,
  errorMsg,
}: Step6Props) {
  const [isSigModalOpen, setIsSigModalOpen] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);

  const jur = getJurisdiction(form.jurisdictionCountryCode);

  const handleSendOtp = async () => {
    if (!form.initiatorEmail) {
      setOtpError("Please provide an email in Step 5 before requesting verification.");
      return;
    }

    setOtpLoading(true);
    setOtpError("");

    try {
      const res = await fetch("/api/guest/otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "send",
          email: form.initiatorEmail,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        onChange({ initiatorOtpDispatched: true });
        setResendCooldown(45);
        const timer = setInterval(() => {
          setResendCooldown((prev) => {
            if (prev <= 1) {
              clearInterval(timer);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } else {
        setOtpError(data.error || "Failed to dispatch verification email.");
      }
    } catch (err: any) {
      setOtpError("Network error while dispatching verification code.");
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!form.initiatorOtpCode || form.initiatorOtpCode.length !== 6) {
      setOtpError("Please enter the 6-digit OTP code sent to your email.");
      return;
    }

    setOtpLoading(true);
    setOtpError("");

    try {
      const res = await fetch("/api/guest/otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "verify",
          email: form.initiatorEmail,
          code: form.initiatorOtpCode,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        onChange({ initiatorOtpVerified: true });
      } else {
        setOtpError(data.error || "Invalid or expired OTP code.");
      }
    } catch (err: any) {
      setOtpError("Network error while validating code.");
    } finally {
      setOtpLoading(false);
    }
  };

  const handleSaveSignature = (sigDataUrl: string, fingerprint: string) => {
    onChange({
      initiatorSignatureB64: sigDataUrl,
      initiatorFingerprint: fingerprint,
    });
    setIsSigModalOpen(false);
  };

  const isReadyToSeal =
    Boolean(form.initiatorSignatureB64) && form.initiatorOtpVerified;

  return (
    <div className="space-y-6 text-left">
      {/* Step Header */}
      <div className="border-b border-zinc-100 pb-4">
        <div className="flex items-center gap-2 text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider">
          <PenTool className="w-4 h-4 text-zinc-950" strokeWidth={2} />
          <span>Step 6 • Authentication &amp; Execution</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-black text-zinc-950 font-display tracking-tight mt-1">
          Review, Authenticate &amp; Mint Agreement
        </h2>
        <p className="text-xs sm:text-sm text-zinc-500 mt-1 font-medium leading-relaxed">
          Affix your electronic signature and verify identity via 6-digit OTP to generate the counterparty link.
        </p>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" strokeWidth={2} />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Verification Matrix Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Sub-Card 1: Digital Signature */}
        <div className="p-5 rounded-2xl bg-white border border-zinc-200/90 space-y-4 surface-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-zinc-950 uppercase tracking-wide">
                1. Electronic Signature *
              </span>
              {form.initiatorSignatureB64 ? (
                <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Signature Captured
                </span>
              ) : (
                <span className="text-[10px] font-mono font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  Required
                </span>
              )}
            </div>
            <p className="text-xs text-zinc-500 font-medium">
              Draw your handwritten signature. It will be bound to your device fingerprint and embedded in the bilateral contract PDF.
            </p>
          </div>

          <div className="pt-2">
            {form.initiatorSignatureB64 ? (
              <div className="space-y-3">
                <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200 flex items-center justify-center h-24">
                  <img
                    src={form.initiatorSignatureB64}
                    alt="Party A Signature"
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setIsSigModalOpen(true)}
                  className="w-full py-2.5 rounded-lg border border-zinc-200 hover:bg-zinc-100 text-zinc-800 text-xs font-bold transition-colors cursor-pointer"
                >
                  Redraw Signature
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsSigModalOpen(true)}
                className="w-full py-4 rounded-xl bg-zinc-950 text-white hover:bg-zinc-900 text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer min-h-[44px]"
              >
                <PenTool className="w-4 h-4 text-zinc-400" strokeWidth={2} />
                <span>Draw Digital Signature</span>
              </button>
            )}
          </div>
        </div>

        {/* Sub-Card 2: Email OTP Authentication */}
        <div className="p-5 rounded-2xl bg-white border border-zinc-200/90 space-y-4 surface-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-zinc-950 uppercase tracking-wide">
                2. Identity OTP Verification *
              </span>
              {form.initiatorOtpVerified ? (
                <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Verified
                </span>
              ) : (
                <span className="text-[10px] font-mono font-bold text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded border border-zinc-200">
                  Pending OTP
                </span>
              )}
            </div>
            <p className="text-xs text-zinc-500 font-medium">
              We send a 6-digit code to <strong className="text-zinc-950 font-semibold">{form.initiatorEmail || "your email"}</strong> to certify initiator authentication.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            {otpError && (
              <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
                {otpError}
              </div>
            )}

            {form.initiatorOtpVerified ? (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2.5 text-xs text-emerald-800 font-semibold">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" strokeWidth={2} />
                <span>Identity certified. Ready to lock contract payload.</span>
              </div>
            ) : form.initiatorOtpDispatched ? (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="Enter 6-Digit OTP"
                    value={form.initiatorOtpCode}
                    onChange={(e) => onChange({ initiatorOtpCode: e.target.value.replace(/\D/g, "") })}
                    className="flex-1 px-3 py-2.5 rounded-lg border border-zinc-300 text-xs font-mono font-bold text-zinc-950 text-center tracking-widest focus:border-zinc-950 focus:outline-none"
                  />
                  <button
                    type="button"
                    disabled={otpLoading || form.initiatorOtpCode.length !== 6}
                    onClick={handleVerifyOtp}
                    className="px-4 py-2.5 rounded-lg bg-zinc-950 text-white hover:bg-zinc-900 text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {otpLoading ? "Checking..." : "Verify Code"}
                  </button>
                </div>
                <div className="text-center">
                  <button
                    type="button"
                    disabled={resendCooldown > 0 || otpLoading}
                    onClick={handleSendOtp}
                    className="text-[11px] text-zinc-500 hover:text-zinc-950 font-medium disabled:opacity-50 cursor-pointer"
                  >
                    {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : "Resend 6-Digit OTP"}
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                disabled={otpLoading || !form.initiatorEmail}
                onClick={handleSendOtp}
                className="w-full py-4 rounded-xl bg-zinc-100 hover:bg-zinc-200/80 border border-zinc-200 text-zinc-900 text-xs font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer min-h-[44px]"
              >
                <Mail className="w-4 h-4 text-zinc-600" strokeWidth={2} />
                <span>{otpLoading ? "Sending Code..." : "Dispatch 6-Digit OTP Code"}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Statutory Consent & ESIGN Disclaimer */}
      <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200/70 text-xs text-zinc-600 leading-relaxed font-medium space-y-1">
        <div className="flex items-center gap-1.5 font-bold text-zinc-950">
          <ShieldCheck className="w-4 h-4 text-emerald-600" strokeWidth={2} />
          <span>Statutory Electronic Signature Compliance</span>
        </div>
        <p>
          By generating this agreement, you consent to electronic contract execution pursuant to the {jur.governingLawName}. Both parties agree that digital signatures rendered herein have the identical legal force of handwritten wet-ink signatures.
        </p>
      </div>

      {/* Final Action Submission Bar */}
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
          disabled={!isReadyToSeal || loading}
          onClick={onSubmit}
          className="px-8 py-3.5 rounded-xl bg-zinc-950 text-white hover:bg-zinc-900 font-bold text-xs transition-all shadow-md flex items-center gap-2 cursor-pointer min-h-[44px] disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <FileCheck className="w-4 h-4 text-emerald-400" strokeWidth={2} />
          <span>{loading ? "Minting Instant Agreement..." : "Generate Counterparty Signing Link"}</span>
        </button>
      </div>

      {/* Signature Modal */}
      {isSigModalOpen && (
        <SignaturePadModal
          isOpen={isSigModalOpen}
          onClose={() => setIsSigModalOpen(false)}
          onConfirm={handleSaveSignature}
          countryCode={form.jurisdictionCountryCode}
        />
      )}
    </div>
  );
}
