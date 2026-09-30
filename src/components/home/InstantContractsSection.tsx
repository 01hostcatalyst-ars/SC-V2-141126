"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  FileText,
  ShieldCheck,
  CheckCircle2,
  Lock,
  ArrowRight,
  Sparkles,
  Zap,
  Sliders,
  Award,
} from "lucide-react";

export function InstantContractsSection() {
  const [approval48h, setApproval48h] = useState(true);
  const [whitelistingCapped, setWhitelistingCapped] = useState(true);
  const [exclusivityWindow, setExclusivityWindow] = useState(true);
  const [latePaymentFee, setLatePaymentFee] = useState(true);

  return (
    <section className="py-16 md:py-24 max-w-7xl mx-auto px-4 sm:px-6 text-left">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-100 text-zinc-800 text-[11px] font-bold uppercase tracking-wider border border-zinc-200">
            <FileText className="w-3.5 h-3.5 text-zinc-950" />
            <span>Tool 02 • Legal Execution Infrastructure</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-semibold text-zinc-950 font-display tracking-tight">
            Stop Sealing Deals in DMs. Start Signing Them.
          </h2>
          <p className="text-sm sm:text-base text-zinc-600 font-medium leading-relaxed">
            Turn informal WhatsApp chats and Instagram DMs into binding, 1-page bilateral agreements with global e-sign compliance, protective commercial clauses, and tamper-proof SHA-256 audit trails in under 60 seconds.
          </p>
        </div>

        <Link
          href="/instant"
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-bold transition-all shadow-sm shrink-0 cursor-pointer"
        >
          <FileText className="w-4 h-4 text-emerald-400" />
          <span>Draft Free 1-Page Contract</span>
          <ArrowRight className="w-4 h-4 text-zinc-400" />
        </Link>
      </div>

      {/* Main Interactive Showcase Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left: Interactive Clause Configurator (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-5 rounded-2xl bg-zinc-50 border border-zinc-200/90 space-y-4 surface-card">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 font-mono block">
                Interactive Clause Configurator
              </span>
              <h3 className="text-sm font-bold text-zinc-950 mt-0.5">
                Toggle Protective Commercial Safeguards
              </h3>
              <p className="text-xs text-zinc-500 mt-1">
                Click clauses below to see how SignCollab automatically hardens your agreement against scope creep, client ghosting, and delayed payouts:
              </p>
            </div>

            <div className="space-y-2.5">
              {/* Clause 1 */}
              <div
                onClick={() => setApproval48h(!approval48h)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer select-none ${
                  approval48h
                    ? "bg-white border-emerald-300 shadow-2xs"
                    : "bg-zinc-100/70 border-zinc-200 opacity-60"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-zinc-950 flex items-center gap-2">
                    <CheckCircle2
                      className={`w-4 h-4 ${approval48h ? "text-emerald-600" : "text-zinc-400"}`}
                    />
                    48-Hour Deemed Approval
                  </span>
                  <span className="text-[9px] font-bold uppercase font-mono px-2 py-0.5 rounded bg-zinc-100 text-zinc-700">
                    {approval48h ? "Active" : "Disabled"}
                  </span>
                </div>
                <p className="text-[11px] text-zinc-500 leading-normal pl-6">
                  If the brand partner does not provide revisions within 48h of submission, deliverables are legally deemed accepted.
                </p>
              </div>

              {/* Clause 2 */}
              <div
                onClick={() => setWhitelistingCapped(!whitelistingCapped)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer select-none ${
                  whitelistingCapped
                    ? "bg-white border-emerald-300 shadow-2xs"
                    : "bg-zinc-100/70 border-zinc-200 opacity-60"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-zinc-950 flex items-center gap-2">
                    <CheckCircle2
                      className={`w-4 h-4 ${whitelistingCapped ? "text-emerald-600" : "text-zinc-400"}`}
                    />
                    Paid Whitelisting Usage Cap
                  </span>
                  <span className="text-[9px] font-bold uppercase font-mono px-2 py-0.5 rounded bg-zinc-100 text-zinc-700">
                    {whitelistingCapped ? "Active" : "Disabled"}
                  </span>
                </div>
                <p className="text-[11px] text-zinc-500 leading-normal pl-6">
                  Restricts advertiser ad spend permissions strictly to a 30-day window; prohibits dark posting and permanent handle piggybacking.
                </p>
              </div>

              {/* Clause 3 */}
              <div
                onClick={() => setExclusivityWindow(!exclusivityWindow)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer select-none ${
                  exclusivityWindow
                    ? "bg-white border-emerald-300 shadow-2xs"
                    : "bg-zinc-100/70 border-zinc-200 opacity-60"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-zinc-950 flex items-center gap-2">
                    <CheckCircle2
                      className={`w-4 h-4 ${exclusivityWindow ? "text-emerald-600" : "text-zinc-400"}`}
                    />
                    Category Exclusivity Blackout
                  </span>
                  <span className="text-[9px] font-bold uppercase font-mono px-2 py-0.5 rounded bg-zinc-100 text-zinc-700">
                    {exclusivityWindow ? "Active" : "Disabled"}
                  </span>
                </div>
                <p className="text-[11px] text-zinc-500 leading-normal pl-6">
                  Restricts direct competitor partnerships for the duration of the campaign flight while preventing unpaid indefinite category lockouts.
                </p>
              </div>

              {/* Clause 4 */}
              <div
                onClick={() => setLatePaymentFee(!latePaymentFee)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer select-none ${
                  latePaymentFee
                    ? "bg-white border-emerald-300 shadow-2xs"
                    : "bg-zinc-100/70 border-zinc-200 opacity-60"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-zinc-950 flex items-center gap-2">
                    <CheckCircle2
                      className={`w-4 h-4 ${latePaymentFee ? "text-emerald-600" : "text-zinc-400"}`}
                    />
                    Late Payment Statutory Interest (5%)
                  </span>
                  <span className="text-[9px] font-bold uppercase font-mono px-2 py-0.5 rounded bg-zinc-100 text-zinc-700">
                    {latePaymentFee ? "Active" : "Disabled"}
                  </span>
                </div>
                <p className="text-[11px] text-zinc-500 leading-normal pl-6">
                  Applies automatic statutory compounding interest for disbursements delayed past the mandatory net-14 payment window.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Live 1-Page Contract View (7 cols) */}
        <div className="lg:col-span-7 bg-white border border-zinc-200/90 rounded-2xl p-6 sm:p-8 shadow-sm surface-card space-y-6">
          
          {/* Document Header */}
          <div className="flex items-start justify-between border-b border-zinc-100 pb-5 gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono text-xs font-bold text-zinc-950">
                  SC-2026-INSTANT-0842
                </span>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                  Bilateral 1-Page Term Sheet
                </span>
              </div>
              <h3 className="text-sm sm:text-base font-bold text-zinc-950">
                Commercial Sponsorship &amp; Content Licensing Agreement
              </h3>
            </div>

            <div className="text-right shrink-0">
              <span className="text-[10px] uppercase font-bold text-zinc-400 block font-mono">Status</span>
              <span className="text-xs font-bold text-emerald-600 font-mono flex items-center gap-1 justify-end">
                <Lock className="w-3 h-3 text-emerald-600" /> Ready to Execute
              </span>
            </div>
          </div>

          {/* Parties & Deliverables Summary */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-100 space-y-1">
              <span className="text-[10px] uppercase font-bold text-zinc-400 block font-mono">Party A: Creator</span>
              <div className="font-bold text-zinc-950">Irfan Junejo</div>
              <div className="text-[11px] text-zinc-500 font-mono">@irfanjunejo (YouTube / IG)</div>
            </div>

            <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-100 space-y-1">
              <span className="text-[10px] uppercase font-bold text-zinc-400 block font-mono">Party B: Brand Partner</span>
              <div className="font-bold text-zinc-950">Apex Gear International</div>
              <div className="text-[11px] text-zinc-500 font-mono">Verified Brand Sponsor</div>
            </div>
          </div>

          {/* Agreed Scope & Compensation */}
          <div className="p-4 rounded-xl bg-zinc-50/70 border border-zinc-100 space-y-2 text-xs">
            <div className="flex items-center justify-between border-b border-zinc-200/60 pb-2">
              <span className="font-bold text-zinc-900">Agreed Deliverables (2 Items):</span>
              <span className="font-bold font-mono text-zinc-950">$8,025 USD Total</span>
            </div>
            <div className="space-y-1 text-[11px] text-zinc-600">
              <div className="flex justify-between">
                <span>• 1x YouTube Dedicated 4K Feature (8-12 min)</span>
                <span className="font-mono font-medium">$5,600 USD</span>
              </div>
              <div className="flex justify-between">
                <span>• 1x Instagram Cinematic Reel (9:16)</span>
                <span className="font-mono font-medium">$2,425 USD</span>
              </div>
            </div>
          </div>

          {/* Active Protective Clauses Box */}
          <div className="space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 font-mono block">
              Active Enforceable Provisions
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
              <div
                className={`p-2.5 rounded-lg border flex items-center justify-between transition-all ${
                  approval48h
                    ? "bg-emerald-50/70 border-emerald-200 text-emerald-950"
                    : "bg-zinc-50 border-zinc-200 text-zinc-400 line-through"
                }`}
              >
                <span>48h Deemed Approval</span>
                <span className="text-[9px] font-bold">{approval48h ? "ENFORCED" : "OFF"}</span>
              </div>

              <div
                className={`p-2.5 rounded-lg border flex items-center justify-between transition-all ${
                  whitelistingCapped
                    ? "bg-emerald-50/70 border-emerald-200 text-emerald-950"
                    : "bg-zinc-50 border-zinc-200 text-zinc-400 line-through"
                }`}
              >
                <span>Whitelisting (30d Cap)</span>
                <span className="text-[9px] font-bold">{whitelistingCapped ? "ENFORCED" : "OFF"}</span>
              </div>

              <div
                className={`p-2.5 rounded-lg border flex items-center justify-between transition-all ${
                  exclusivityWindow
                    ? "bg-emerald-50/70 border-emerald-200 text-emerald-950"
                    : "bg-zinc-50 border-zinc-200 text-zinc-400 line-through"
                }`}
              >
                <span>Category Exclusivity (30d)</span>
                <span className="text-[9px] font-bold">{exclusivityWindow ? "ENFORCED" : "OFF"}</span>
              </div>

              <div
                className={`p-2.5 rounded-lg border flex items-center justify-between transition-all ${
                  latePaymentFee
                    ? "bg-emerald-50/70 border-emerald-200 text-emerald-950"
                    : "bg-zinc-50 border-zinc-200 text-zinc-400 line-through"
                }`}
              >
                <span>Late Fee (5% Net-14)</span>
                <span className="text-[9px] font-bold">{latePaymentFee ? "ENFORCED" : "OFF"}</span>
              </div>
            </div>
          </div>

          {/* Cryptographic Execution Footer */}
          <div className="p-3.5 rounded-xl bg-zinc-950 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5 font-bold text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>SHA-256 Digital Certificate Active</span>
              </div>
              <div className="text-[10px] text-zinc-400 font-mono truncate max-w-xs">
                Hash: 8f4a1c9e...d7e2b34a (Microsecond UTC Timestamp)
              </div>
            </div>

            <Link
              href="/instant"
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold rounded-lg text-xs transition-all text-center shrink-0 cursor-pointer"
            >
              Sign Contract in 60s
            </Link>
          </div>
        </div>

      </div>

      {/* 3-Step Workflow Summary Strip */}
      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 pt-10 border-t border-zinc-200/80">
        <div className="space-y-1.5">
          <span className="font-mono text-xs font-bold text-zinc-400 block">STEP 01</span>
          <h4 className="text-sm font-bold text-zinc-950">Auto-Populate from Valuation</h4>
          <p className="text-xs text-zinc-500 leading-relaxed">
            One click imports negotiated rate card deliverables and defended pricing directly into your 1-page agreement without retyping terms.
          </p>
        </div>

        <div className="space-y-1.5">
          <span className="font-mono text-xs font-bold text-zinc-400 block">STEP 02</span>
          <h4 className="text-sm font-bold text-zinc-950">Bilateral E-Sign in Guest Mode</h4>
          <p className="text-xs text-zinc-500 leading-relaxed">
            Both parties sign on any device with one-time verification. Zero account friction, zero credit card prompts, zero legal gatekeeping.
          </p>
        </div>

        <div className="space-y-1.5">
          <span className="font-mono text-xs font-bold text-zinc-400 block">STEP 03</span>
          <h4 className="text-sm font-bold text-zinc-950">Cryptographic Legal Audit Trail</h4>
          <p className="text-xs text-zinc-500 leading-relaxed">
            A permanent SHA-256 tamper-proof PDF audit certificate is minted with microsecond UTC timestamps and verifiable signature hashes.
          </p>
        </div>
      </div>
    </section>
  );
}
