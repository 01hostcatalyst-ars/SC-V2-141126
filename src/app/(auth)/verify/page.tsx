"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { getCompanyConfig } from "@/lib/config";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";

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
  const [activeTab, setActiveTab] = useState<"lookup" | "upload">("lookup");
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
      setOtpError("Please enter a valid 6-digit verification code.");
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
      setVerifyError("Please enter a valid verification token or contract reference number.");
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
      <div className="w-full max-w-lg bg-white border border-gray-200/80 rounded-3xl shadow-2xl p-8 sm:p-12 text-center space-y-8">
        <div className="flex flex-col items-center gap-3">
          <Link href="/" className="inline-flex items-center gap-2.5 outline-none mb-2">
            <span className="w-10 h-10 rounded-xl bg-black flex items-center justify-center font-black text-white text-xl shadow-md">
              {company.name[0]}
            </span>
            <span className="font-black text-xl text-black uppercase tracking-tight">
              {company.name}
            </span>
          </Link>
          <span className="px-3.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 tracking-wide uppercase border border-slate-200">
            Account Security
          </span>
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl sm:text-3xl font-black text-black tracking-tight">
            Verify Your Email
          </h2>
          <p className="text-sm text-gray-600 leading-relaxed max-w-sm mx-auto">
            We sent a 6-digit security code to <strong className="text-black font-bold">{email}</strong>.
          </p>
        </div>

        {otpSuccess ? (
          <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center gap-3 text-sm text-emerald-900 font-bold">
            <svg className="w-5 h-5 text-emerald-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            <span>Verification successful! Redirecting to dashboard...</span>
          </div>
        ) : (
          <form onSubmit={handleOtpSubmit} className="space-y-6 text-left">
            <div className="space-y-2">
              <label className="text-xs font-bold text-black uppercase tracking-wider block text-center">
                Enter 6-Digit Verification Code
              </label>
              <input
                type="text"
                required
                maxLength={6}
                placeholder="123456"
                value={otpToken}
                onChange={(e) => setOtpToken(e.target.value.replace(/\D/g, ""))}
                disabled={otpLoading}
                className="w-full bg-slate-50 border border-slate-300 focus:border-black focus:ring-1 focus:ring-black text-center text-2xl font-bold tracking-widest py-4 rounded-2xl outline-none transition-all"
              />
            </div>

            {otpError && (
              <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs font-semibold flex items-start gap-3">
                <svg className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span>{otpError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={otpLoading}
              className="w-full bg-black hover:bg-slate-900 text-white font-bold py-4 px-6 rounded-2xl transition-all shadow-lg text-sm tracking-wide"
            >
              {otpLoading ? "Verifying Code..." : "Verify & Continue"}
            </button>
          </form>
        )}
      </div>
    );
  }

  // Otherwise, render Public Contract Verification Engine
  return (
    <div className="w-full max-w-3xl bg-white border border-gray-200/80 rounded-3xl shadow-2xl p-8 sm:p-12 space-y-10">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold bg-slate-100 text-slate-800 border border-slate-200/80">
            <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span>Cryptographic Proof &amp; Audit Layer</span>
          </span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Contract Verification Vault
        </h1>

        <p className="text-sm text-slate-600 max-w-xl mx-auto leading-relaxed">
          Instantly verify agreement authenticity, SHA-256 document checksums, and bilateral execution audit trails under global electronic signature standards.
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex bg-slate-100/80 p-2 rounded-2xl border border-slate-200/60">
        <button
          onClick={() => {
            setActiveTab("lookup");
            setVerifyError("");
            setVerifyResult(null);
          }}
          className={`flex-1 py-3 px-5 text-xs sm:text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
            activeTab === "lookup"
              ? "bg-white text-slate-900 shadow-md"
              : "text-slate-500 hover:text-slate-900"
          }`}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <span>Token / Reference Lookup</span>
        </button>

        <button
          onClick={() => {
            setActiveTab("upload");
            setVerifyError("");
            setVerifyResult(null);
          }}
          className={`flex-1 py-3 px-5 text-xs sm:text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
            activeTab === "upload"
              ? "bg-white text-slate-900 shadow-md"
              : "text-slate-500 hover:text-slate-900"
          }`}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span>PDF File Checksum</span>
        </button>
      </div>

      {/* Tab 1: Token Lookup Form */}
      {activeTab === "lookup" && (
        <div className="space-y-6">
          <div className="space-y-3 text-left">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Enter Verification Token or Contract Reference Number
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                placeholder="e.g. v_7f9a2b8e... or BB-770712-7804"
                value={lookupToken}
                onChange={(e) => setLookupToken(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleTokenLookup()}
                className="flex-1 bg-slate-50 border border-slate-300 focus:border-black focus:ring-1 focus:ring-black px-5 py-4 rounded-2xl text-sm font-bold text-slate-900 placeholder:text-slate-400 placeholder:font-normal outline-none transition-all"
              />
              <button
                onClick={() => handleTokenLookup()}
                disabled={verifyLoading}
                className="bg-black hover:bg-slate-900 text-white font-bold py-4 px-8 rounded-2xl transition-all shadow-lg text-sm shrink-0 flex items-center justify-center gap-2"
              >
                {verifyLoading ? (
                  <span>Checking Vault...</span>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <span>Verify Agreement</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 text-left">
            <div className="text-xs font-bold text-slate-800 flex items-center gap-2">
              <svg className="w-4 h-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Where to find your reference code</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Your verification token is printed at the footer of any executed SignCollab agreement PDF and included in your execution confirmation email.
            </p>
          </div>
        </div>
      )}

      {/* Tab 2: Drag & Drop PDF Form */}
      {activeTab === "upload" && (
        <div className="space-y-6">
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                handleFileUpload(e.dataTransfer.files[0]);
              }
            }}
            className="border-2 border-dashed border-slate-300 hover:border-black rounded-3xl p-10 sm:p-14 text-center bg-slate-50/60 hover:bg-slate-100/50 transition-all cursor-pointer space-y-4"
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
            <label htmlFor="pdf-upload-input" className="cursor-pointer block space-y-4">
              <div className="w-16 h-16 bg-slate-200/80 text-slate-700 rounded-2xl flex items-center justify-center mx-auto transition-transform hover:scale-105">
                <svg className="w-8 h-8 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>

              <div className="space-y-1">
                <div className="text-base font-extrabold text-slate-900">
                  {uploadedFile ? uploadedFile.name : "Drop contract PDF here, or browse files"}
                </div>
                <div className="text-xs text-slate-500">
                  Supports executed contract PDFs (.pdf)
                </div>
              </div>
            </label>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-3 text-left">
            <svg className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <div className="space-y-1">
              <div className="text-xs font-bold text-slate-900">Privacy Preserving Local Analysis</div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Binary SHA-256 hash calculation is performed 100% locally inside your web browser using Web Crypto API. File contents are never uploaded to our servers.
              </p>
            </div>
          </div>

          {computingHash && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl text-xs font-bold text-blue-900 text-center flex items-center justify-center gap-2 animate-pulse">
              <svg className="w-4 h-4 animate-spin text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
                <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" className="opacity-75" />
              </svg>
              <span>Computing Web Crypto binary SHA-256 hash...</span>
            </div>
          )}

          {computedHash && (
            <div className="p-5 bg-slate-100 rounded-2xl text-left space-y-2 border border-slate-200">
              <div className="text-xs uppercase font-bold text-slate-500 tracking-wider">
                Calculated Binary SHA-256 Checksum
              </div>
              <div className="text-xs font-bold text-slate-900 break-all tracking-wider">
                {computedHash}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Error Message */}
      {verifyError && (
        <div className="p-5 bg-rose-50 border border-rose-200 text-rose-900 rounded-2xl text-xs sm:text-sm font-semibold flex items-start gap-3 text-left">
          <svg className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span className="leading-relaxed">{verifyError}</span>
        </div>
      )}

      {/* Result Display Cards (Handling 4 States) */}
      {verifyResult && (
        <div className="space-y-8 text-left">
          {/* State 1: EXECUTED_VERIFIED */}
          {verifyResult.state === "EXECUTED_VERIFIED" && (
            <div className="border border-emerald-200/90 bg-emerald-50/50 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-emerald-200/60">
                <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-600 text-white rounded-full text-xs font-black uppercase tracking-wider w-fit">
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Cryptographically Verified &amp; Executed</span>
                </span>
                <span className={`text-xs font-extrabold uppercase px-3 py-1.5 rounded-xl border w-fit ${
                  verifyResult.dealLifecycle === "COMPLETED" ? "bg-blue-100 text-blue-900 border-blue-200" :
                  verifyResult.dealLifecycle === "CANCELLED" ? "bg-rose-100 text-rose-900 border-rose-200" :
                  "bg-emerald-100 text-emerald-900 border-emerald-200"
                }`}>
                  Lifecycle: {verifyResult.dealLifecycle}
                </span>
              </div>

              <p className="text-sm text-emerald-950 font-semibold leading-relaxed">
                {verifyResult.message}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-emerald-100 shadow-sm space-y-1">
                  <div className="font-bold text-slate-400 uppercase text-xs tracking-wider">Contract Ref No.</div>
                  <div className="font-extrabold text-slate-900 text-base">{verifyResult.contractNumber}</div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-emerald-100 shadow-sm space-y-1">
                  <div className="font-bold text-slate-400 uppercase text-xs tracking-wider">Execution Timestamp</div>
                  <div className="font-extrabold text-slate-900 text-base">
                    {new Date(verifyResult.executedAt).toLocaleString()}
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-emerald-100 shadow-sm space-y-1">
                  <div className="font-bold text-slate-400 uppercase text-xs tracking-wider">Party A (Initiator)</div>
                  <div className="font-bold text-slate-900 text-sm">{verifyResult.partyA}</div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-emerald-100 shadow-sm space-y-1">
                  <div className="font-bold text-slate-400 uppercase text-xs tracking-wider">Party B (Respondent)</div>
                  <div className="font-bold text-slate-900 text-sm">{verifyResult.partyB}</div>
                </div>
              </div>

              {verifyResult.isEmbargoActive && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-950 font-semibold leading-relaxed flex items-start gap-2.5">
                  <svg className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <span>
                    <strong>Dynamic NDA Protection Active:</strong> Party names are concealed under Section 7 product embargo terms until {new Date(verifyResult.embargoDate).toLocaleDateString()}.
                  </span>
                </div>
              )}

              <div className="bg-white p-5 rounded-2xl border border-emerald-100 space-y-2 text-xs">
                <div className="text-slate-500 font-bold tracking-wider">
                  STRUCTURAL HASH: <span className="text-slate-900 font-extrabold">{verifyResult.finalDocumentHashTruncated}</span>
                </div>
                <div className="text-slate-500 font-bold tracking-wider">
                  PDF SHA-256: <span className="text-blue-700 font-extrabold break-all">{verifyResult.pdfBinaryHash || "Verified"}</span>
                </div>
              </div>

              <div className="text-xs text-slate-500 font-medium text-center pt-2">
                Verified under {verifyResult.complianceStandard}
              </div>
            </div>
          )}

          {/* State 2: IN_PROGRESS */}
          {verifyResult.state === "IN_PROGRESS" && (
            <div className="border border-amber-200 bg-amber-50/50 rounded-3xl p-6 sm:p-8 space-y-4">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-amber-600 text-white rounded-full text-xs font-black uppercase tracking-wider w-fit">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Awaiting Countersignature</span>
              </span>

              <p className="text-sm text-amber-950 font-semibold leading-relaxed">
                {verifyResult.message}
              </p>

              <div className="text-xs bg-white p-4 rounded-2xl border border-amber-200 text-slate-800 font-semibold">
                Reference Code: <strong className="text-black font-bold">{verifyResult.contractNumber}</strong> | Created: {new Date(verifyResult.createdAt).toLocaleDateString()}
              </div>
            </div>
          )}

          {/* State 3: CHECKSUM_MISMATCH */}
          {verifyResult.state === "CHECKSUM_MISMATCH" && (
            <div className="border border-orange-200 bg-orange-50/50 rounded-3xl p-6 sm:p-8 space-y-4">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-orange-600 text-white rounded-full text-xs font-black uppercase tracking-wider w-fit">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span>Checksum Mismatch</span>
              </span>

              <p className="text-sm text-orange-950 font-semibold leading-relaxed">
                {verifyResult.message}
              </p>
            </div>
          )}

          {/* State 4: TOKEN_NOT_FOUND */}
          {verifyResult.state === "TOKEN_NOT_FOUND" && (
            <div className="border border-rose-200 bg-rose-50/50 rounded-3xl p-6 sm:p-8 space-y-4">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-rose-600 text-white rounded-full text-xs font-black uppercase tracking-wider w-fit">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span>Token Not Found</span>
              </span>

              <p className="text-sm text-rose-950 font-semibold leading-relaxed">
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
  const company = getCompanyConfig();

  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-theme-gradient flex items-center justify-center flex-col gap-3">
          <div className="w-10 h-10 border-4 border-black border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-bold uppercase tracking-wider text-black">
            Loading Verification Vault...
          </span>
        </div>
      }
    >
      <div className="min-h-screen bg-theme-gradient flex flex-col relative overflow-hidden text-left">
        {/* Background ambient glow shapes */}
        <div className="absolute top-[10%] left-[-5%] w-[80%] h-[50%] rounded-full ambient-glow-purple pointer-events-none z-0" />
        <div className="absolute bottom-[10%] right-[-5%] w-[80%] h-[50%] rounded-full ambient-glow-blue pointer-events-none z-0" />

        {/* Header */}
        <PublicHeader activeRoute="/verify" />

        {/* Main Body */}
        <main className="flex-1 flex items-center justify-center p-6 sm:p-10 md:p-16 z-10">
          <VerifyContent />
        </main>

        {/* Footer */}
        <PublicFooter />
      </div>
    </Suspense>
  );
}
