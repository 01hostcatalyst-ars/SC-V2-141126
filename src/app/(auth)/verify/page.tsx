"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { getCompanyConfig } from "@/lib/config";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  Search,
  UploadCloud,
  FileText,
  Lock,
  ArrowRight,
  Fingerprint,
  Info,
  Loader2,
  FileCheck,
  Sparkles,
} from "lucide-react";

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
      <div className="w-full max-w-lg surface-card border border-zinc-200/90 rounded-2xl sm:rounded-3xl shadow-xl p-8 sm:p-12 text-center space-y-8">
        <div className="flex flex-col items-center gap-3">
          <Link href="/" className="inline-flex items-center gap-2.5 outline-none mb-1">
            <span className="w-10 h-10 rounded-xl bg-zinc-900 flex items-center justify-center font-semibold text-white text-lg shadow-sm">
              {company.name[0]}
            </span>
            <span className="font-semibold text-xl text-zinc-900 tracking-tight font-display">
              {company.name}
            </span>
          </Link>
          <span className="px-3.5 py-1 rounded-full text-xs font-medium bg-zinc-100 text-zinc-700 tracking-wide uppercase border border-zinc-200/80">
            Account Security
          </span>
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl sm:text-3xl font-semibold text-zinc-900 tracking-tight font-display">
            Verify Your Email
          </h2>
          <p className="text-sm text-zinc-500 leading-relaxed max-w-sm mx-auto">
            We sent a 6-digit security code to <strong className="text-zinc-800 font-semibold">{email}</strong>.
          </p>
        </div>

        {otpSuccess ? (
          <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center gap-3 text-sm text-emerald-900 font-medium">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>Verification successful! Redirecting to workspace...</span>
          </div>
        ) : (
          <form onSubmit={handleOtpSubmit} className="space-y-6 text-left">
            <div className="space-y-2">
              <label className="text-xs font-medium text-zinc-600 uppercase tracking-wider block text-center">
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
                className="w-full bg-zinc-50 border border-zinc-300 focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 text-center text-2xl font-semibold tracking-widest py-4 rounded-xl outline-none transition-all"
              />
            </div>

            {otpError && (
              <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-medium flex items-start gap-3">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{otpError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={otpLoading}
              className="w-full bg-zinc-900 hover:bg-zinc-800 text-white font-medium py-3.5 px-6 rounded-xl transition-all shadow-sm text-sm tracking-wide flex items-center justify-center gap-2 cursor-pointer min-h-[44px]"
            >
              {otpLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white/70" />
                  <span>Verifying Code...</span>
                </>
              ) : (
                <>
                  <span>Verify &amp; Continue</span>
                  <ArrowRight className="w-4 h-4 text-zinc-400" />
                </>
              )}
            </button>
          </form>
        )}
      </div>
    );
  }

  // Otherwise, render Public Contract Verification Engine
  return (
    <div className="w-full max-w-3xl surface-card border border-zinc-200/90 rounded-2xl sm:rounded-3xl shadow-xl p-8 sm:p-12 space-y-10">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-200/80">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Cryptographic Proof &amp; Audit Layer</span>
          </span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-semibold text-zinc-900 tracking-tight font-display">
          Contract Verification Vault
        </h1>

        <p className="text-sm text-zinc-500 max-w-xl mx-auto leading-relaxed">
          Instantly verify agreement authenticity, SHA-256 document checksums, and bilateral execution audit trails under global electronic signature standards.
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex bg-zinc-100/90 p-1.5 rounded-xl border border-zinc-200/70">
        <button
          onClick={() => {
            setActiveTab("lookup");
            setVerifyError("");
            setVerifyResult(null);
          }}
          className={`flex-1 py-2.5 px-4 text-xs sm:text-sm font-medium rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === "lookup"
              ? "bg-white text-zinc-900 shadow-sm border border-zinc-200/60"
              : "text-zinc-600 hover:text-zinc-900"
          }`}
        >
          <Search className="w-4 h-4 text-zinc-500" />
          <span>Token / Reference Lookup</span>
        </button>

        <button
          onClick={() => {
            setActiveTab("upload");
            setVerifyError("");
            setVerifyResult(null);
          }}
          className={`flex-1 py-2.5 px-4 text-xs sm:text-sm font-medium rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === "upload"
              ? "bg-white text-zinc-900 shadow-sm border border-zinc-200/60"
              : "text-zinc-600 hover:text-zinc-900"
          }`}
        >
          <FileCheck className="w-4 h-4 text-zinc-500" />
          <span>PDF File Checksum</span>
        </button>
      </div>

      {/* Tab 1: Token Lookup Form */}
      {activeTab === "lookup" && (
        <div className="space-y-6">
          <div className="space-y-3 text-left">
            <label className="text-xs font-medium text-zinc-700 uppercase tracking-wider block">
              Enter Verification Token or Contract Reference Number
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                placeholder="e.g. v_7f9a2b8e... or SC-770712-7804"
                value={lookupToken}
                onChange={(e) => setLookupToken(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleTokenLookup()}
                className="flex-1 bg-zinc-50 border border-zinc-300 focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 px-4 py-3.5 rounded-xl text-sm font-medium text-zinc-900 placeholder:text-zinc-400 placeholder:font-normal outline-none transition-all"
              />
              <button
                onClick={() => handleTokenLookup()}
                disabled={verifyLoading}
                className="bg-zinc-900 hover:bg-zinc-800 text-white font-medium py-3.5 px-6 rounded-xl transition-all shadow-sm text-sm shrink-0 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 min-h-[44px]"
              >
                {verifyLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white/70" />
                    <span>Checking Vault...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4 text-zinc-300" />
                    <span>Verify Agreement</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200/80 space-y-1.5 text-left">
            <div className="text-xs font-medium text-zinc-800 flex items-center gap-2">
              <Info className="w-4 h-4 text-zinc-500" />
              <span>Where to find your reference code</span>
            </div>
            <p className="text-xs text-zinc-500 leading-relaxed pl-6">
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
            className="border-2 border-dashed border-zinc-300 hover:border-zinc-900 rounded-2xl p-10 sm:p-14 text-center bg-zinc-50/70 hover:bg-zinc-100/50 transition-all cursor-pointer space-y-4"
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
              <div className="w-14 h-14 bg-zinc-200/80 text-zinc-700 rounded-2xl flex items-center justify-center mx-auto transition-transform hover:scale-105">
                <UploadCloud className="w-7 h-7 text-zinc-700" strokeWidth={1.75} />
              </div>

              <div className="space-y-1">
                <div className="text-sm font-semibold text-zinc-900">
                  {uploadedFile ? uploadedFile.name : "Drop contract PDF here, or browse files"}
                </div>
                <div className="text-xs text-zinc-500">
                  Supports executed contract PDFs (.pdf)
                </div>
              </div>
            </label>
          </div>

          <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200/80 flex items-start gap-3 text-left">
            <Lock className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="text-xs font-medium text-zinc-900">Privacy Preserving Local Analysis</div>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Binary SHA-256 hash calculation is performed 100% locally inside your web browser using Web Crypto API. File contents are never uploaded to our servers.
              </p>
            </div>
          </div>

          {computingHash && (
            <div className="p-4 bg-emerald-50 border border-emerald-200/80 rounded-xl text-xs font-medium text-emerald-900 text-center flex items-center justify-center gap-2 animate-pulse">
              <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
              <span>Computing Web Crypto binary SHA-256 hash...</span>
            </div>
          )}

          {computedHash && (
            <div className="p-4 bg-zinc-50 rounded-xl text-left space-y-1.5 border border-zinc-200/80">
              <div className="text-[11px] uppercase font-medium text-zinc-500 tracking-wider flex items-center gap-1.5">
                <Fingerprint className="w-3.5 h-3.5 text-zinc-500" />
                <span>Calculated Binary SHA-256 Checksum</span>
              </div>
              <div className="text-xs font-mono font-medium text-zinc-800 break-all">
                {computedHash}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Error Message */}
      {verifyError && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-900 rounded-xl text-xs sm:text-sm font-medium flex items-start gap-3 text-left">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <span className="leading-relaxed">{verifyError}</span>
        </div>
      )}

      {/* Result Display Cards (Handling 4 States) */}
      {verifyResult && (
        <div className="space-y-6 text-left">
          {/* State 1: EXECUTED_VERIFIED */}
          {verifyResult.state === "EXECUTED_VERIFIED" && (
            <div className="border border-emerald-200/90 bg-emerald-50/40 rounded-2xl sm:rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-emerald-200/60">
                <span className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-emerald-600 text-white rounded-full text-xs font-semibold uppercase tracking-wider w-fit">
                  <CheckCircle2 className="w-4 h-4 text-white" />
                  <span>Cryptographically Verified &amp; Executed</span>
                </span>
                <span className={`text-xs font-semibold uppercase px-3 py-1.5 rounded-xl border w-fit ${
                  verifyResult.dealLifecycle === "COMPLETED" ? "bg-blue-100 text-blue-900 border-blue-200" :
                  verifyResult.dealLifecycle === "CANCELLED" ? "bg-rose-100 text-rose-900 border-rose-200" :
                  "bg-emerald-100 text-emerald-900 border-emerald-200"
                }`}>
                  Lifecycle: {verifyResult.dealLifecycle}
                </span>
              </div>

              <p className="text-sm text-emerald-950 font-medium leading-relaxed">
                {verifyResult.message}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white p-4 sm:p-5 rounded-xl border border-emerald-100 shadow-sm space-y-1">
                  <div className="font-medium text-zinc-400 uppercase text-[11px] tracking-wider">Contract Ref No.</div>
                  <div className="font-semibold text-zinc-900 text-base">{verifyResult.contractNumber}</div>
                </div>

                <div className="bg-white p-4 sm:p-5 rounded-xl border border-emerald-100 shadow-sm space-y-1">
                  <div className="font-medium text-zinc-400 uppercase text-[11px] tracking-wider">Execution Timestamp</div>
                  <div className="font-semibold text-zinc-900 text-base">
                    {new Date(verifyResult.executedAt).toLocaleString()}
                  </div>
                </div>

                <div className="bg-white p-4 sm:p-5 rounded-xl border border-emerald-100 shadow-sm space-y-1">
                  <div className="font-medium text-zinc-400 uppercase text-[11px] tracking-wider">Party A (Initiator)</div>
                  <div className="font-medium text-zinc-900 text-sm">{verifyResult.partyA}</div>
                </div>

                <div className="bg-white p-4 sm:p-5 rounded-xl border border-emerald-100 shadow-sm space-y-1">
                  <div className="font-medium text-zinc-400 uppercase text-[11px] tracking-wider">Party B (Respondent)</div>
                  <div className="font-medium text-zinc-900 text-sm">{verifyResult.partyB}</div>
                </div>
              </div>

              {verifyResult.isEmbargoActive && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-950 font-medium leading-relaxed flex items-start gap-2.5">
                  <Lock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Dynamic NDA Protection Active:</strong> Party names are concealed under Section 7 product embargo terms until {new Date(verifyResult.embargoDate).toLocaleDateString()}.
                  </span>
                </div>
              )}

              <div className="bg-white p-4 sm:p-5 rounded-xl border border-emerald-100 space-y-2 text-xs">
                <div className="text-zinc-500 font-medium tracking-wider">
                  STRUCTURAL HASH: <span className="text-zinc-900 font-semibold">{verifyResult.finalDocumentHashTruncated}</span>
                </div>
                <div className="text-zinc-500 font-medium tracking-wider">
                  PDF SHA-256: <span className="text-emerald-700 font-mono font-medium break-all">{verifyResult.pdfBinaryHash || "Verified"}</span>
                </div>
              </div>

              <div className="text-xs text-zinc-500 font-medium text-center pt-2">
                Verified under {verifyResult.complianceStandard}
              </div>
            </div>
          )}

          {/* State 2: IN_PROGRESS */}
          {verifyResult.state === "IN_PROGRESS" && (
            <div className="border border-amber-200 bg-amber-50/50 rounded-2xl sm:rounded-3xl p-6 sm:p-8 space-y-4">
              <span className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-amber-600 text-white rounded-full text-xs font-semibold uppercase tracking-wider w-fit">
                <Clock className="w-4 h-4 text-white" />
                <span>Awaiting Countersignature</span>
              </span>

              <p className="text-sm text-amber-950 font-medium leading-relaxed">
                {verifyResult.message}
              </p>

              <div className="text-xs bg-white p-4 rounded-xl border border-amber-200 text-zinc-800 font-medium">
                Reference Code: <strong className="text-zinc-900 font-semibold">{verifyResult.contractNumber}</strong> | Created: {new Date(verifyResult.createdAt).toLocaleDateString()}
              </div>
            </div>
          )}

          {/* State 3: CHECKSUM_MISMATCH */}
          {verifyResult.state === "CHECKSUM_MISMATCH" && (
            <div className="border border-orange-200 bg-orange-50/50 rounded-2xl sm:rounded-3xl p-6 sm:p-8 space-y-4">
              <span className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-orange-600 text-white rounded-full text-xs font-semibold uppercase tracking-wider w-fit">
                <AlertTriangle className="w-4 h-4 text-white" />
                <span>Checksum Mismatch</span>
              </span>

              <p className="text-sm text-orange-950 font-medium leading-relaxed">
                {verifyResult.message}
              </p>
            </div>
          )}

          {/* State 4: TOKEN_NOT_FOUND */}
          {verifyResult.state === "TOKEN_NOT_FOUND" && (
            <div className="border border-rose-200 bg-rose-50/50 rounded-2xl sm:rounded-3xl p-6 sm:p-8 space-y-4">
              <span className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-rose-600 text-white rounded-full text-xs font-semibold uppercase tracking-wider w-fit">
                <XCircle className="w-4 h-4 text-white" />
                <span>Token Not Found</span>
              </span>

              <p className="text-sm text-rose-950 font-medium leading-relaxed">
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
          <div className="w-10 h-10 border-3 border-zinc-800 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-medium uppercase tracking-wider text-zinc-700">
            Loading Verification Vault...
          </span>
        </div>
      }
    >
      <div className="min-h-screen bg-theme-gradient flex flex-col relative overflow-hidden text-left font-sans text-zinc-900 antialiased selection:bg-emerald-500 selection:text-white">
        {/* Background ambient spotlight */}
        <div className="absolute top-[10%] left-1/2 -translate-x-1/2 w-[850px] h-[450px] rounded-full ambient-spotlight-emerald pointer-events-none z-0" />

        {/* Global Public Header */}
        <PublicHeader activeRoute="/verify" />

        {/* Main Body */}
        <main className="flex-1 flex items-center justify-center p-6 sm:p-10 md:p-16 z-10">
          <VerifyContent />
        </main>

        {/* Global Public Footer */}
        <PublicFooter />
      </div>
    </Suspense>
  );
}
