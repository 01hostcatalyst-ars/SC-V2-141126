"use client";

import React from "react";
import Link from "next/link";
import { getCompanyConfig } from "@/lib/config";

export default function SigningSuccessPage() {
  const company = getCompanyConfig();

  return (
    <div className="min-h-screen bg-theme-gradient flex items-center justify-center p-6 text-center relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute top-[10%] left-[-5%] w-[80%] h-[50%] rounded-full ambient-glow-purple pointer-events-none z-0" />
      <div className="absolute bottom-[10%] right-[-5%] w-[80%] h-[50%] rounded-full ambient-glow-blue pointer-events-none z-0" />

      {/* Success Card */}
      <div className="relative bg-white border border-gray-200 rounded-2xl shadow-xl p-8 max-w-md w-full z-10 space-y-6 text-center animate-slide-in">
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

        <p className="text-xs text-gray-500 leading-relaxed max-w-xs mx-auto">
          Your electronic signature has been logged and locked. 
          A fully executed campaign agreement PDF will be emailed to you shortly as a persistent transaction record.
        </p>

        <div className="border-t border-gray-100 pt-6 space-y-4">
          <p className="text-[11px] text-gray-400 font-semibold leading-relaxed">
            Need to negotiate, manage, or bilaterally sign other campaign partnerships yourself?
          </p>
          <Link href="/">
            <button className="w-full bg-black text-white hover:bg-black/90 font-bold text-xs uppercase py-3 rounded-xl transition-all shadow-md mt-2">
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
