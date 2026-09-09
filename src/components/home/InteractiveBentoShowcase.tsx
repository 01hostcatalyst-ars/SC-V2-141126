"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  FileText,
  Activity,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  QrCode,
  Lock,
  Eye,
  Sliders,
} from "lucide-react";
import { SplineAreaChart, DataPoint } from "@/components/ui/charts/SplineAreaChart";

const SAMPLE_CHART_DATA: DataPoint[] = [
  { label: "Story (24h)", value: 450, lowValue: 380, highValue: 550 },
  { label: "IG Reel", value: 1450, lowValue: 1200, highValue: 1800 },
  { label: "TikTok Video", value: 1650, lowValue: 1350, highValue: 2100 },
  { label: "YT Integrated", value: 3800, lowValue: 3200, highValue: 4600 },
  { label: "YT Dedicated", value: 7200, lowValue: 6000, highValue: 8800 },
];

export function InteractiveBentoShowcase() {
  const [activeTab, setActiveTab] = useState<"radar" | "contract">("radar");
  const [whitelistingEnabled, setWhitelistingEnabled] = useState(true);
  const [approval48hEnabled, setApproval48hEnabled] = useState(true);

  return (
    <section className="py-16 md:py-24 max-w-7xl mx-auto px-4 sm:px-6 text-left">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-100 text-zinc-800 text-[11px] font-bold uppercase tracking-wider border border-zinc-200/80">
            <Sparkles className="w-3 h-3 text-zinc-950" strokeWidth={2.5} />
            <span>Interactive Tool Suite</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-zinc-950 font-display tracking-tight">
            Intelligence Meets Legal Settlement.
          </h2>
          <p className="text-sm sm:text-base text-zinc-600 font-medium">
            From empirical multi-platform valuation to bilaterally executed agreements with global legal compliance.
          </p>
        </div>

        {/* View Switcher Pills */}
        <div className="inline-flex p-1 rounded-xl bg-zinc-100 border border-zinc-200/80 shrink-0 self-start md:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab("radar")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "radar"
                ? "bg-white text-zinc-950 shadow-sm border border-zinc-200"
                : "text-zinc-600 hover:text-zinc-950"
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-amber-600" strokeWidth={2} />
            <span>Valuation Radar</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("contract")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "contract"
                ? "bg-white text-zinc-950 shadow-sm border border-zinc-200"
                : "text-zinc-600 hover:text-zinc-950"
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-emerald-600" strokeWidth={2} />
            <span>Instant Contract</span>
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 3-TILE BENTO GRID                                         */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* TILE 1: THE PRIMARY LIVE SHOWCASE (8 COLUMNS) */}
        <div className="lg:col-span-8 bg-white border border-zinc-200 rounded-2xl p-6 sm:p-8 shadow-sm surface-card flex flex-col justify-between relative overflow-hidden">
          {activeTab === "radar" ? (
            /* Valuation Radar Live View */
            <div className="space-y-6 animate-fadeIn">
              {/* Top Creator Header Strip */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 pb-5">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-xl bg-zinc-950 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                    MJ
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-base text-zinc-950">Irfan Junejo</span>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-zinc-100 text-zinc-700 border border-zinc-200">
                        Multi-Channel Profile
                      </span>
                    </div>
                    <div className="text-xs font-mono text-zinc-400">@irfanjunejo • Tech &amp; Filmmaking</div>
                  </div>
                </div>

                <div className="flex items-center gap-4 bg-zinc-50 border border-zinc-200/80 px-3.5 py-2 rounded-xl text-xs shrink-0">
                  <div>
                    <div className="text-[10px] text-zinc-400 uppercase font-bold">Total Reach</div>
                    <div className="text-sm font-bold font-mono text-zinc-950">2.14M</div>
                  </div>
                  <div className="w-px h-6 bg-zinc-200" />
                  <div>
                    <div className="text-[10px] text-zinc-400 uppercase font-bold">Median Engagement</div>
                    <div className="text-sm font-bold font-mono text-emerald-600">5.82%</div>
                  </div>
                </div>
              </div>

              {/* Spline Area Chart Component (From Step 1) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-800 uppercase tracking-wide">
                    Empirical 16-Knot Valuation Curve
                  </span>
                  <span className="text-[11px] font-mono text-zinc-500 font-semibold">
                    Confidence Range (Low • Median • High)
                  </span>
                </div>
                <div className="p-3 bg-zinc-50/60 border border-zinc-100 rounded-xl">
                  <SplineAreaChart
                    data={SAMPLE_CHART_DATA}
                    height={160}
                    strokeColor="#d97706"
                    gradientFrom="rgba(217, 119, 6, 0.18)"
                    gradientTo="rgba(217, 119, 6, 0.0)"
                    showConfidenceBand={true}
                  />
                </div>
              </div>

              {/* Bottom Quick Bridge Action */}
              <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-zinc-100">
                <span className="text-xs text-zinc-500 font-medium">
                  Audited across unpinned Reels, YouTube retention, and country GDP PPP calibration.
                </span>
                <Link
                  href="/influencer-rate-calculator?handle=irfanjunejo&platform=instagram"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-zinc-950 text-white hover:bg-zinc-900 text-xs font-bold transition-all shadow-sm shrink-0 cursor-pointer pressable"
                >
                  <span>Launch Live Radar</span>
                  <ArrowRight className="w-3.5 h-3.5 text-zinc-400" strokeWidth={2} />
                </Link>
              </div>
            </div>
          ) : (
            /* Instant Contract Live View */
            <div className="space-y-6 animate-fadeIn">
              {/* Contract Header Strip */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 pb-5">
                <div>
                  <span className="font-mono text-xs font-bold text-zinc-950 block">SC-2026-INSTANT-0842</span>
                  <span className="text-xs text-zinc-500 font-medium">Commercial Partnership &amp; Content Licensing</span>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 uppercase tracking-wider shrink-0">
                  Ready to Sign
                </span>
              </div>

              {/* Clause Configurator Preview */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div
                  onClick={() => setApproval48hEnabled(!approval48hEnabled)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer select-none ${
                    approval48hEnabled
                      ? "bg-emerald-50/60 border-emerald-300/80"
                      : "bg-zinc-50 border-zinc-200/80 opacity-60"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-zinc-950">48h Deemed Approval</span>
                    <CheckCircle2
                      className={`w-4 h-4 ${approval48hEnabled ? "text-emerald-600" : "text-zinc-300"}`}
                      strokeWidth={2}
                    />
                  </div>
                  <p className="text-[11px] text-zinc-600 leading-snug">
                    Protects creators from endless revision delays; draft is automatically approved after 48h.
                  </p>
                </div>

                <div
                  onClick={() => setWhitelistingEnabled(!whitelistingEnabled)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer select-none ${
                    whitelistingEnabled
                      ? "bg-emerald-50/60 border-emerald-300/80"
                      : "bg-zinc-50 border-zinc-200/80 opacity-60"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-zinc-950">Ad Whitelisting Rights</span>
                    <CheckCircle2
                      className={`w-4 h-4 ${whitelistingEnabled ? "text-emerald-600" : "text-zinc-300"}`}
                      strokeWidth={2}
                    />
                  </div>
                  <p className="text-[11px] text-zinc-600 leading-snug">
                    Governs Meta/TikTok spark ads and paid boosting windows with defined license limits.
                  </p>
                </div>
              </div>

              {/* Bilateral Signature Pad Preview */}
              <div className="p-4 bg-zinc-50/80 border border-zinc-200/80 rounded-xl space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-zinc-700">
                  <span>Bilateral Execution Status</span>
                  <span className="font-mono text-emerald-700 font-bold">2 / 2 Parties Certified</span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-[11px] text-zinc-500 font-mono">
                  <div className="p-2 bg-white rounded-lg border border-zinc-200">
                    <span className="font-bold text-zinc-950 block">Party A (Brand):</span>
                    <span>Signed • OTP Verified</span>
                  </div>
                  <div className="p-2 bg-white rounded-lg border border-zinc-200">
                    <span className="font-bold text-zinc-950 block">Party B (Creator):</span>
                    <span>Signed • OTP Verified</span>
                  </div>
                </div>
              </div>

              {/* Bottom Quick Bridge Action */}
              <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-zinc-100">
                <span className="text-xs text-zinc-500 font-medium">
                  Compliant with US ESIGN, UK/EU eIDAS, UAE Decree 46, and 20+ national acts.
                </span>
                <Link
                  href="/instant"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-zinc-950 text-white hover:bg-zinc-900 text-xs font-bold transition-all shadow-sm shrink-0 cursor-pointer pressable"
                >
                  <span>Draft 1-Page Contract</span>
                  <ArrowRight className="w-3.5 h-3.5 text-zinc-400" strokeWidth={2} />
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* TILE 2: CRYPTOGRAPHIC AUDIT LAYER (4 COLUMNS) */}
        <div className="lg:col-span-4 bg-zinc-950 text-white rounded-2xl p-6 sm:p-7 shadow-xl border border-zinc-800 flex flex-col justify-between relative overflow-hidden">
          {/* Subtle glow accent */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="space-y-5 relative z-10">
            {/* Header Badge */}
            <div className="flex items-center justify-between">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" strokeWidth={2} />
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-zinc-900 border border-zinc-800 text-emerald-400 uppercase">
                Tamper-Proof
              </span>
            </div>

            <div>
              <h3 className="text-lg font-bold font-display text-white">SHA-256 Audit Certificate</h3>
              <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                Every executed agreement generates a mathematical cryptographic proof layer verifying integrity without storing contract secrets.
              </p>
            </div>

            {/* Hash String Visualizer */}
            <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 space-y-1.5">
              <div className="text-[10px] text-zinc-500 uppercase font-mono font-bold">Document SHA-256 Digest</div>
              <div className="text-[11px] font-mono text-emerald-400 break-all leading-tight">
                e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
              </div>
            </div>

            {/* Audit Metadata Points */}
            <div className="space-y-2 text-xs text-zinc-300 font-medium">
              <div className="flex items-center justify-between border-b border-zinc-900 pb-1.5">
                <span className="text-zinc-500">UTC Microsecond Timestamp</span>
                <span className="font-mono text-zinc-200">ISO-8601 Verified</span>
              </div>
              <div className="flex items-center justify-between border-b border-zinc-900 pb-1.5">
                <span className="text-zinc-500">Email Verification</span>
                <span className="font-mono text-emerald-400">6-Digit OTP Lock</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-500">Browser Hash Check</span>
                <span className="font-mono text-zinc-200">Local Web Crypto API</span>
              </div>
            </div>
          </div>

          <div className="pt-6 relative z-10 border-t border-zinc-900 mt-4">
            <Link
              href="/verify"
              className="w-full py-2.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-bold text-center text-white transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Test Document at /verify</span>
              <ArrowRight className="w-3.5 h-3.5 text-zinc-400" strokeWidth={2} />
            </Link>
          </div>
        </div>

      </div>
    </section>
  );
}
