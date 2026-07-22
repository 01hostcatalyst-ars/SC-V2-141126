"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { getCompanyConfig } from "@/lib/config";

export default function SigningSuccessPage() {
  const company = getCompanyConfig();
  const params = useParams();
  const token = params?.token as string;

  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [downloadingCert, setDownloadingCert] = useState(false);

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
    <div className="min-h-screen bg-theme-gradient flex items-center justify-center p-6 text-center relative overflow-hidden font-sans">
      {/* Background gradients */}
      <div className="absolute top-[10%] left-[-5%] w-[80%] h-[50%] rounded-full ambient-glow-purple pointer-events-none z-0" />
      <div className="absolute bottom-[10%] right-[-5%] w-[80%] h-[50%] rounded-full ambient-glow-blue pointer-events-none z-0" />

      {/* Success Card */}
      <div className="relative bg-white border border-gray-200 rounded-2xl shadow-xl p-8 max-w-lg w-full z-10 space-y-6 text-center animate-slide-in">
        {/* Success Icon */}
        <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 font-bold text-2xl mx-auto">
          ✓
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-black text-black">Signature Completed!</h2>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-emerald-50 border border-emerald-200 text-emerald-800 uppercase mx-auto">
            Executed Under ETO 2002
          </span>
        </div>

        <p className="text-xs text-gray-500 leading-relaxed max-w-sm mx-auto">
          Your electronic signature has been logged and locked. 
          A fully executed campaign agreement PDF and Audit Certificate have been emailed to you. You can also download them directly below:
        </p>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <button
            type="button"
            onClick={handleDownloadPdf}
            disabled={downloadingPdf}
            className="w-full py-3 px-4 rounded-xl bg-black text-white font-bold text-xs uppercase hover:bg-black/90 transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {downloadingPdf ? "Retrieving..." : "📥 Download Contract PDF"}
          </button>

          <button
            type="button"
            onClick={handleDownloadCertificate}
            disabled={downloadingCert}
            className="w-full py-3 px-4 rounded-xl bg-blue-600 text-white font-bold text-xs uppercase hover:bg-blue-700 transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {downloadingCert ? "Retrieving..." : "📜 Download Audit Certificate"}
          </button>
        </div>

        <div className="border-t border-gray-100 pt-6 space-y-4">
          <p className="text-[11px] text-gray-400 font-semibold leading-relaxed">
            Need to negotiate, manage, or bilaterally sign other campaign partnerships yourself?
          </p>
          <Link href="/">
            <button className="w-full bg-gray-100 hover:bg-gray-200 text-black font-bold text-xs uppercase py-3 rounded-xl transition-all border border-gray-200">
              Create Free {company.name} Account
            </button>
          </Link>
        </div>

        <div className="text-[10px] text-gray-400 font-bold">
          Powered by {company.name}
        </div>
      </div>
    </div>
  );
}
