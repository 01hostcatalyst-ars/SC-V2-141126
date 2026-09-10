"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { getCompanyConfig } from "@/lib/config";
import { getJurisdiction } from "@/lib/config/jurisdictions";
import { SuiteHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";
import {
  CheckCircle2,
  ShieldCheck,
  Download,
  ArrowRight,
  FileCheck,
} from "lucide-react";

export default function SigningSuccessPage() {
  const company = getCompanyConfig();
  const params = useParams();
  const token = params?.token as string;

  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [downloadingCert, setDownloadingCert] = useState(false);
  const [jurisdictionCode, setJurisdictionCode] = useState("US");

  useEffect(() => {
    if (!token) return;
    fetch(`/api/contracts/share/${token}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.contract?.jurisdictionCountryCode) {
          setJurisdictionCode(data.contract.jurisdictionCountryCode);
        }
      })
      .catch(() => {});
  }, [token]);

  const jur = getJurisdiction(jurisdictionCode);

  const handleDownloadPdf = async () => {
    if (!token) return;
    setDownloadingPdf(true);
    try {
      const res = await fetch(`/api/contracts/share/${token}/pdf`);
      const data = await res.json();
      if (res.ok && data.success && data.url) {
        window.open(data.url, "_blank");
      } else {
        alert(data.error || "Failed to retrieve Contract PDF download link.");
      }
    } catch (_) {
      alert("Error retrieving Contract PDF.");
    } finally {
      setDownloadingPdf(false);
    }
  };

  const handleDownloadCertificate = async () => {
    if (!token) return;
    setDownloadingCert(true);
    try {
      const res = await fetch(`/api/contracts/share/${token}/certificate`);
      const data = await res.json();
      if (res.ok && data.success && data.url) {
        window.open(data.url, "_blank");
      } else {
        alert(data.error || "Failed to retrieve Audit Certificate download link.");
      }
    } catch (_) {
      alert("Error retrieving Audit Certificate.");
    } finally {
      setDownloadingCert(false);
    }
  };

  return (
    <div className="min-h-screen bg-theme-gradient flex flex-col relative overflow-hidden font-sans text-zinc-900 antialiased selection:bg-emerald-500 selection:text-white">
      {/* Background ambient spotlight */}
      <div className="absolute top-[10%] left-1/2 -translate-x-1/2 w-[850px] h-[450px] rounded-full ambient-spotlight-emerald pointer-events-none z-0" />

      {/* Global Suite Header */}
      <SuiteHeader
        activeRoute="/c"
        rightBadge={
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200/80">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Fully Executed</span>
          </span>
        }
      />

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-6 sm:p-10 z-10">
        <div className="surface-card border border-zinc-200/90 rounded-2xl sm:rounded-3xl shadow-xl p-8 sm:p-10 max-w-lg w-full space-y-6 text-center animate-slide-in">
          {/* Success Icon */}
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-emerald-600 mx-auto shadow-sm">
            <CheckCircle2 className="w-8 h-8 text-emerald-600" strokeWidth={2.25} />
          </div>

          {/* Heading & Badge */}
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-semibold text-zinc-900 font-display tracking-tight">
              Contract Successfully Executed
            </h1>
            <div className="flex items-center justify-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium bg-emerald-50 border border-emerald-200/80 text-emerald-800 uppercase tracking-wide">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Executed Under {jur.lawAbbreviation}
              </span>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-zinc-500 leading-relaxed max-w-md mx-auto">
            Your electronic signature has been registered and locked on the bilateral audit trail. A signed copy and Audit Certificate have been emailed to both parties. You can also download them directly below:
          </p>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={downloadingPdf}
              className="w-full py-3.5 px-4 rounded-xl bg-zinc-900 text-white font-medium text-xs hover:bg-zinc-800 transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 min-h-[44px]"
            >
              {downloadingPdf ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin shrink-0" />
                  <span>Retrieving...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 text-zinc-300 shrink-0" />
                  <span>Download Agreement</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleDownloadCertificate}
              disabled={downloadingCert}
              className="w-full py-3.5 px-4 rounded-xl bg-white border border-zinc-200 text-zinc-800 font-medium text-xs hover:bg-zinc-50 hover:border-zinc-300 transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 min-h-[44px]"
            >
              {downloadingCert ? (
                <>
                  <span className="w-4 h-4 border-2 border-zinc-400 border-t-zinc-800 rounded-full animate-spin shrink-0" />
                  <span>Retrieving...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Audit Certificate</span>
                </>
              )}
            </button>
          </div>

          {/* Cross-Sell / Exploration */}
          <div className="border-t border-zinc-100 pt-6 space-y-4">
            <div className="space-y-1">
              <p className="text-xs font-medium text-zinc-700">
                Need to negotiate, manage, or bilaterally sign other campaign partnerships?
              </p>
              <p className="text-[11px] text-zinc-400">
                Create commercial agreements in under 60 seconds with automated compliance.
              </p>
            </div>
            <Link href="/" className="block">
              <button className="w-full bg-zinc-100 hover:bg-zinc-200/80 text-zinc-800 font-medium text-xs py-3 rounded-xl transition-all border border-zinc-200/70 flex items-center justify-center gap-2 min-h-[42px] cursor-pointer">
                <span>Explore {company.name} Suite</span>
                <ArrowRight className="w-3.5 h-3.5 text-zinc-500" />
              </button>
            </Link>
          </div>

          <div className="flex items-center justify-center gap-1.5 text-[11px] text-zinc-400 font-medium pt-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Cryptographically Secured by {company.name} Vault</span>
          </div>
        </div>
      </main>

      {/* Global Public Footer */}
      <PublicFooter />
    </div>
  );
}
