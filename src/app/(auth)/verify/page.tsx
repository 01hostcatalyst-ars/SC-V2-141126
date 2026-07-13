"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { getCompanyConfig } from "@/lib/config";

function VerifyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const company = getCompanyConfig();

  const emailParam = searchParams.get("email");
  const tokenParam = searchParams.get("token") || searchParams.get("ref");

  // Email OTP Mode states
  const [email, setEmail] = useState("");
  const [otpToken, setOtpToken] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [otpSuccess, setOtpSuccess] = useState(false);

  // Contract Verification Mode states
  const [activeTab, setActiveTab] = useState<"upload" | "lookup">("lookup");
  const [lookupToken, setLookupToken] = useState("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [computingHash, setComputingHash] = useState(false);
  const [computedHash, setComputedHash] = useState("");
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [verifyResult, setVerifyResult] = useState<any>(null);
  const [verifyError, setVerifyError] = useState("");

  useEffect(() => {
    if (emailParam) {
      setEmail(emailParam);
    }
    if (tokenParam) {
      setLookupToken(tokenParam);
      setActiveTab("lookup");
      performVerification({ token: tokenParam.trim() });
    }
  }, [emailParam, tokenParam]);

  // Handle Email OTP Submission
  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpToken || otpToken.length !== 6) {
      setOtpError("Please enter a valid 6-digit code.");
      return;
    }

    setOtpLoading(true);
    setOtpError("");

    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, token: otpToken }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "OTP verification failed.");
      }

      if (data.session) {
        const { supabase } = await import("@/lib/supabase/client");
        await supabase.auth.setSession({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
        });
      }

      setOtpSuccess(true);
      setTimeout(() => {
        router.push("/dashboard");
      }, 1000);
    } catch (err: any) {
      setOtpError(err.message || "Invalid or expired verification code.");
    } finally {
      setOtpLoading(false);
    }
  };

  // Compute Client-Side SHA-256 Binary Hash over uploaded PDF file
  const computeFileHash = async (file: File): Promise<string> => {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  };

  // Handle File Upload & Drag & Drop
  const handleFileUpload = async (file: File) => {
    if (file.type !== "application/pdf" && !file.name.endsWith(".pdf")) {
      setVerifyError("Please upload a valid PDF document (.pdf).");
      return;
    }

    setUploadedFile(file);
    setComputingHash(true);
    setVerifyError("");
    setVerifyResult(null);

    try {
      const fileHash = await computeFileHash(file);
      setComputedHash(fileHash);
      setComputingHash(false);

      // Perform Verification request
      await performVerification({ fileHash, token: lookupToken || undefined });
    } catch (err: any) {
      setComputingHash(false);
      setVerifyError("Failed to calculate PDF file hash: " + err.message);
    }
  };

  // Handle Token Lookup
  const handleTokenLookup = async (tokenToUse?: string) => {
    const tokenVal = tokenToUse !== undefined ? tokenToUse : lookupToken;
    if (!tokenVal.trim()) {
      setVerifyError("Please enter a valid verification token or contract number.");
      return;
    }

    setVerifyError("");
    setVerifyResult(null);
    await performVerification({ token: tokenVal.trim() });
  };

  // Common Verification Dispatcher
  const performVerification = async (payload: { token?: string; fileHash?: string }) => {
    setVerifyLoading(true);
    try {
      const res = await fetch("/api/contracts/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok && !data.state) {
        throw new Error(data.error || "Verification query failed.");
      }

      setVerifyResult(data);
    } catch (err: any) {
      setVerifyError(err.message || "Unable to reach verification vault.");
    } finally {
      setVerifyLoading(false);
    }
  };

  // If emailParam exists, render Email Verification OTP form
  if (emailParam) {
    return (
      <div className="w-full max-w-md bg-white border border-gray-200 rounded-2xl shadow-xl p-8 text-center">
        <Link href="/" className="inline-flex items-center gap-2 outline-none mb-6">
          <span className="w-8 h-8 rounded-lg bg-black flex items-center justify-center font-bold text-white text-base">
            {company.name[0]}
          </span>
          <span className="font-bold text-lg text-black uppercase tracking-tight">
            {company.name}
          </span>
        </Link>

        <h2 className="text-2xl font-black text-black mb-2">Verify Your Email</h2>
        <p className="text-xs text-gray-500 mb-6">
          We sent a 6-digit OTP code to <strong className="text-black">{email}</strong>.
        </p>

        {otpSuccess ? (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-sm text-emerald-800 font-bold">
            ✓ Verification successful! Redirecting...
          </div>
        ) : (
          <form onSubmit={handleOtpSubmit} className="space-y-5">
            <div className="flex flex-col text-left gap-1">
              <label className="text-xs font-bold text-black uppercase tracking-wider text-center mb-1">
                Enter 6-Digit OTP Code
              </label>
              <input
                type="text"
                required
                maxLength={6}
                placeholder="123456"
                value={otpToken}
                onChange={(e) => setOtpToken(e.target.value.replace(/\D/g, ""))}
                disabled={otpLoading}
                className="input-field text-center text-xl font-bold tracking-widest py-3"
              />
            </div>

            {otpError && (
              <div className="p-3 text-xs bg-rose-50 border border-rose-200 text-rose-800 rounded-lg font-medium text-left">
                ⚠ {otpError}
              </div>
            )}

            <button
              type="submit"
              disabled={otpLoading}
              className="w-full bg-black text-white hover:bg-black/90 font-bold py-3 px-4 rounded-xl transition-all shadow-md mt-6"
            >
              {otpLoading ? "Verifying..." : "Verify & Continue"}
            </button>
          </form>
        )}
      </div>
    );
  }

  // Otherwise, render Public Contract Verification Engine
  return (
    <div className="w-full max-w-2xl bg-white border border-gray-200 rounded-3xl shadow-2xl p-6 md:p-10">
      {/* Header */}
      <div className="text-center mb-8">
        <Link href="/" className="inline-flex items-center gap-2 outline-none mb-4">
          <span className="w-9 h-9 rounded-xl bg-black flex items-center justify-center font-bold text-white text-lg shadow-sm">
            {company.name[0]}
          </span>
          <span className="font-black text-xl text-black uppercase tracking-tight">
            {company.name} Legal Vault
          </span>
        </Link>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          Public Contract Verification Portal
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Cryptographically verify agreement authenticity and tamper-evident audit records under ETO 2002 framework.
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex bg-slate-100 p-1.5 rounded-2xl mb-8">
        <button
          onClick={() => {
            setActiveTab("lookup");
            setVerifyError("");
          }}
          className={`flex-1 py-2.5 px-4 text-xs font-bold rounded-xl transition-all ${
            activeTab === "lookup"
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-500 hover:text-slate-900"
          }`}
        >
          🔍 Verification Token Lookup
        </button>
        <button
          onClick={() => {
            setActiveTab("upload");
            setVerifyError("");
          }}
          className={`flex-1 py-2.5 px-4 text-xs font-bold rounded-xl transition-all ${
            activeTab === "upload"
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-500 hover:text-slate-900"
          }`}
        >
          📄 Drag & Drop PDF Check
        </button>
      </div>

      {/* Tab 1: Token Lookup Form */}
      {activeTab === "lookup" && (
        <div className="space-y-4 mb-8">
          <div className="flex flex-col text-left gap-1">
            <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">
              Enter Verification Token or Contract Ref No
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. v_7f9a2b8e... or BB-770712-7804"
                value={lookupToken}
                onChange={(e) => setLookupToken(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleTokenLookup()}
                className="input-field flex-1 font-mono text-sm"
              />
              <button
                onClick={() => handleTokenLookup()}
                disabled={verifyLoading}
                className="bg-black hover:bg-slate-800 text-white font-bold py-2.5 px-6 rounded-xl transition-all shadow-md text-xs"
              >
                {verifyLoading ? "Checking Vault..." : "Verify"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Drag & Drop PDF Form */}
      {activeTab === "upload" && (
        <div className="mb-8">
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                handleFileUpload(e.dataTransfer.files[0]);
              }
            }}
            className="border-2 border-dashed border-slate-300 hover:border-slate-800 rounded-2xl p-8 text-center bg-slate-50 hover:bg-slate-100/50 transition-all cursor-pointer"
          >
            <input
              type="file"
              accept=".pdf,application/pdf"
              id="pdf-upload-input"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileUpload(e.target.files[0]);
                }
              }}
            />
            <label htmlFor="pdf-upload-input" className="cursor-pointer space-y-2 block">
              <div className="w-12 h-12 bg-slate-200 text-slate-700 rounded-full flex items-center justify-center mx-auto text-xl font-bold">
                ↓
              </div>
              <div className="text-sm font-extrabold text-slate-800">
                {uploadedFile ? uploadedFile.name : "Drop contract PDF here or click to browse"}
              </div>
              <div className="text-xs text-slate-500">
                Binary SHA-256 checksum calculated locally in your browser. File contents are never stored on server during verification.
              </div>
            </label>
          </div>

          {computingHash && (
            <div className="mt-3 text-xs text-center font-bold text-blue-600 animate-pulse">
              ⚙ Computing client-side Web Crypto binary SHA-256 hash...
            </div>
          )}

          {computedHash && (
            <div className="mt-3 p-3 bg-slate-100 rounded-xl text-center">
              <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                Client Calculated Binary SHA-256
              </div>
              <code className="text-xs font-mono text-slate-800 break-all font-bold">
                {computedHash}
              </code>
            </div>
          )}
        </div>
      )}

      {/* Error Message */}
      {verifyError && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs font-semibold mb-6">
          ⚠ {verifyError}
        </div>
      )}

      {/* Result Display Cards (Handling the 4 States) */}
      {verifyResult && (
        <div className="space-y-6">
          {/* State 1: EXECUTED_VERIFIED */}
          {verifyResult.state === "EXECUTED_VERIFIED" && (
            <div className="border border-emerald-200 bg-emerald-50/50 rounded-2xl p-6 text-left space-y-4">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-600 text-white rounded-full text-xs font-black uppercase tracking-wider">
                  ✓ EXECUTED &amp; CRYPTOGRAPHICALLY VERIFIED
                </span>
                <span className={`text-xs font-black uppercase px-2.5 py-1 rounded-md border ${
                  verifyResult.dealLifecycle === "COMPLETED" ? "bg-blue-100 text-blue-800 border-blue-200" :
                  verifyResult.dealLifecycle === "CANCELLED" ? "bg-rose-100 text-rose-800 border-rose-200" :
                  "bg-emerald-100 text-emerald-800 border-emerald-200"
                }`}>
                  Deal Status: {verifyResult.dealLifecycle}
                </span>
              </div>

              <div className="text-xs text-emerald-950 font-medium">
                {verifyResult.message}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 text-xs">
                <div className="bg-white p-3 rounded-xl border border-emerald-100">
                  <div className="font-bold text-slate-400 uppercase text-[10px]">Reference Code</div>
                  <div className="font-extrabold text-slate-900">{verifyResult.contractNumber}</div>
                </div>
                <div className="bg-white p-3 rounded-xl border border-emerald-100">
                  <div className="font-bold text-slate-400 uppercase text-[10px]">Execution Timestamp</div>
                  <div className="font-extrabold text-slate-900">
                    {new Date(verifyResult.executedAt).toLocaleString()}
                  </div>
                </div>
                <div className="bg-white p-3 rounded-xl border border-emerald-100">
                  <div className="font-bold text-slate-400 uppercase text-[10px]">Party A (Initiator)</div>
                  <div className="font-bold text-slate-800">{verifyResult.partyA}</div>
                </div>
                <div className="bg-white p-3 rounded-xl border border-emerald-100">
                  <div className="font-bold text-slate-400 uppercase text-[10px]">Party B (Respondent)</div>
                  <div className="font-bold text-slate-800">{verifyResult.partyB}</div>
                </div>
              </div>

              {verifyResult.isEmbargoActive && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-900 font-semibold">
                  🔒 <strong>Dynamic NDA Protection Active:</strong> Party names are concealed under Section 7 product embargo terms until {new Date(verifyResult.embargoDate).toLocaleDateString()}.
                </div>
              )}

              <div className="bg-white p-3.5 rounded-xl border border-emerald-100 space-y-1 font-mono text-[11px]">
                <div className="text-slate-500 font-bold">STRUCTURAL DATA HASH: <span className="text-slate-900">{verifyResult.finalDocumentHashTruncated}</span></div>
                <div className="text-slate-500 font-bold">PDF BINARY SHA-256: <span className="text-blue-600 break-all">{verifyResult.pdfBinaryHash || "Verified"}</span></div>
              </div>

              <div className="text-[10px] text-slate-400 font-medium text-center">
                Verified under {verifyResult.complianceStandard}
              </div>
            </div>
          )}

          {/* State 2: IN_PROGRESS */}
          {verifyResult.state === "IN_PROGRESS" && (
            <div className="border border-amber-200 bg-amber-50/50 rounded-2xl p-6 text-left space-y-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500 text-white rounded-full text-xs font-black uppercase tracking-wider">
                ⏳ IN PROGRESS / AWAITING COUNTERSIGNATURE
              </span>
              <p className="text-xs text-amber-950 font-semibold">
                {verifyResult.message}
              </p>
              <div className="text-xs font-mono bg-white p-3 rounded-xl border border-amber-100">
                Ref Code: <strong>{verifyResult.contractNumber}</strong> | Created: {new Date(verifyResult.createdAt).toLocaleDateString()}
              </div>
            </div>
          )}

          {/* State 3: CHECKSUM_MISMATCH */}
          {verifyResult.state === "CHECKSUM_MISMATCH" && (
            <div className="border border-orange-200 bg-orange-50/50 rounded-2xl p-6 text-left space-y-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-orange-600 text-white rounded-full text-xs font-black uppercase tracking-wider">
                ⚠ FILE CHECKSUM MISMATCH
              </span>
              <p className="text-xs text-orange-950 font-medium leading-relaxed">
                {verifyResult.message}
              </p>
            </div>
          )}

          {/* State 4: TOKEN_NOT_FOUND */}
          {verifyResult.state === "TOKEN_NOT_FOUND" && (
            <div className="border border-rose-200 bg-rose-50/50 rounded-2xl p-6 text-left space-y-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-600 text-white rounded-full text-xs font-black uppercase tracking-wider">
                ❌ UNRECOGNIZED VERIFICATION TOKEN
              </span>
              <p className="text-xs text-rose-950 font-medium">
                {verifyResult.message}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-theme-gradient flex items-center justify-center flex-col gap-3">
          <div className="w-10 h-10 border-4 border-black border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-bold uppercase tracking-wider text-black">
            Loading Verification Portal...
          </span>
        </div>
      }
    >
      <div className="min-h-screen bg-theme-gradient flex items-center justify-center p-4 md:p-8">
        <VerifyContent />
      </div>
    </Suspense>
  );
}
