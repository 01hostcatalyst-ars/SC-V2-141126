"use client";

import React from "react";
import Link from "next/link";
import {
  ArrowRight,
  Search,
  TrendingUp,
  FileText,
  Clock,
  Check,
  CheckCheck,
  CreditCard,
  Play,
  Users,
} from "lucide-react";
import {
  YouTubeIcon,
  InstagramIcon,
  TikTokIcon,
} from "@/components/icons/PlatformIcons";

export function ProblemStatementSection() {
  return (
    <section className="py-16 md:py-24 bg-white border-t border-zinc-200/80 text-left overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column (7 cols): The Tangled Workflow Visual Collage */}
          <div className="lg:col-span-7 relative">
            <div className="relative w-full h-[580px] sm:h-[620px] rounded-3xl bg-gradient-to-b from-purple-50/40 via-slate-50/50 to-white border border-purple-100/70 p-4 sm:p-6 shadow-sm overflow-hidden select-none">
              {/* Soft Ambient Radial Blur */}
              <div className="absolute top-1/3 left-1/3 w-80 h-80 bg-purple-200/30 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-indigo-200/20 rounded-full blur-3xl pointer-events-none" />

              {/* Tangled Connective Lines SVG */}
              <svg
                className="absolute inset-0 w-full h-full pointer-events-none z-0"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Node 1 to Node 2 */}
                <path
                  d="M 120 90 C 180 60, 200 120, 240 90"
                  fill="none"
                  stroke="#c4b5fd"
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                  opacity="0.6"
                />
                {/* Node 2 to Node 3 */}
                <path
                  d="M 280 90 C 340 70, 360 130, 420 90"
                  fill="none"
                  stroke="#c4b5fd"
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                  opacity="0.6"
                />
                {/* Node 1 down to Inboxes */}
                <path
                  d="M 100 140 C 90 220, 160 200, 190 240"
                  fill="none"
                  stroke="#c4b5fd"
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                  opacity="0.5"
                />
                {/* Node 2 down to Spreadsheet */}
                <path
                  d="M 250 140 C 270 200, 310 210, 340 260"
                  fill="none"
                  stroke="#c4b5fd"
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                  opacity="0.5"
                />
                {/* Inboxes to Brief */}
                <path
                  d="M 140 320 C 120 380, 130 420, 110 460"
                  fill="none"
                  stroke="#c4b5fd"
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                  opacity="0.5"
                />
                {/* Spreadsheet to Sticky Note */}
                <path
                  d="M 380 370 C 400 420, 420 440, 410 490"
                  fill="none"
                  stroke="#c4b5fd"
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                  opacity="0.5"
                />
                {/* Brief to Video Approval */}
                <path
                  d="M 160 510 C 200 520, 210 540, 240 550"
                  fill="none"
                  stroke="#c4b5fd"
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                  opacity="0.5"
                />
                {/* Complex tangled loops */}
                <path
                  d="M 200 180 Q 250 250, 180 320 T 300 380"
                  fill="none"
                  stroke="#ddd6fe"
                  strokeWidth="1"
                  opacity="0.4"
                />
                <path
                  d="M 320 160 Q 220 280, 360 300 T 260 480"
                  fill="none"
                  stroke="#ddd6fe"
                  strokeWidth="1"
                  opacity="0.4"
                />
              </svg>

              {/* Node 1: YouTube Creator (Top Left) */}
              <div className="absolute top-4 left-3 sm:top-5 sm:left-5 z-10 bg-white p-2 sm:p-2.5 rounded-2xl shadow-md border border-zinc-200/80 transition-transform hover:-translate-y-0.5">
                <div className="relative w-20 h-22 sm:w-24 sm:h-26 rounded-xl overflow-hidden bg-zinc-100">
                  <img
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=300&fit=crop"
                    alt="YouTube Creator"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-1.5 left-1.5 w-5 h-5 rounded-md bg-red-600 flex items-center justify-center shadow-xs">
                    <YouTubeIcon className="w-3.5 h-3.5" color="monochrome" fill="#ffffff" />
                  </div>
                </div>
                <div className="mt-2 flex items-center justify-center gap-1 px-2 py-0.5 rounded-full bg-zinc-50 border border-zinc-200 text-[10px] font-bold text-zinc-900 font-mono">
                  <TrendingUp className="w-3 h-3 text-indigo-600" />
                  <span>1.2M Subs</span>
                </div>
              </div>

              {/* Node 2: Instagram Creator (Top Center) */}
              <div className="absolute top-5 left-[37%] sm:left-[36%] z-10 bg-white p-2 sm:p-2.5 rounded-2xl shadow-md border border-zinc-200/80 transition-transform hover:-translate-y-0.5">
                <div className="relative w-18 h-20 sm:w-22 sm:h-24 rounded-xl overflow-hidden bg-zinc-100">
                  <img
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop"
                    alt="Instagram Creator"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-1.5 left-1.5 w-5 h-5 rounded-md bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 flex items-center justify-center shadow-xs">
                    <InstagramIcon className="w-3.5 h-3.5 text-white" color="monochrome" fill="#ffffff" />
                  </div>
                </div>
                <div className="mt-2 flex items-center justify-center gap-1 px-2 py-0.5 rounded-full bg-zinc-50 border border-zinc-200 text-[10px] font-bold text-zinc-900 font-mono">
                  <Users className="w-3 h-3 text-pink-600" />
                  <span>580K Followers</span>
                </div>
              </div>

              {/* Node 3: TikTok Creator (Top Right) */}
              <div className="absolute top-6 right-3 sm:top-6 sm:right-5 z-10 bg-white p-2 sm:p-2.5 rounded-2xl shadow-md border border-zinc-200/80 transition-transform hover:-translate-y-0.5">
                <div className="relative w-18 h-20 sm:w-22 sm:h-24 rounded-xl overflow-hidden bg-zinc-100">
                  <img
                    src="https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&h=300&fit=crop"
                    alt="TikTok Creator"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-1.5 left-1.5 w-5 h-5 rounded-md bg-black flex items-center justify-center shadow-xs">
                    <TikTokIcon className="w-3.5 h-3.5 text-white" color="monochrome" fill="#ffffff" />
                  </div>
                </div>
                <div className="mt-2 flex items-center justify-center gap-1 px-2 py-0.5 rounded-full bg-zinc-50 border border-zinc-200 text-[10px] font-bold text-zinc-900 font-mono">
                  <Users className="w-3 h-3 text-cyan-600" />
                  <span>2.4M Followers</span>
                </div>
              </div>

              {/* WhatsApp Bubble (Mid-Left Floating) */}
              <div className="absolute top-36 left-[38%] sm:top-40 sm:left-[36%] z-20 w-8 h-8 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-md shadow-emerald-500/20">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.694.067-2.072-.507-1.765-.733-2.909-2.518-2.997-2.635-.088-.116-.708-.941-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.007c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.861.174.086.275.072.376-.044.101-.116.433-.506.549-.68.116-.173.231-.145.39-.086.159.058 1.011.477 1.184.564.173.087.289.13.332.203.043.072.043.419-.101.824z" />
                </svg>
              </div>

              {/* Gmail Bubble (Mid-Left Floating) */}
              <div className="absolute top-44 left-[46%] sm:top-48 sm:left-[44%] z-20 w-8 h-8 rounded-full bg-white border border-zinc-200 shadow-md flex items-center justify-center">
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#EA4335" d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2z" />
                  <path fill="#FBBC05" d="M12 13L2 6.5V6l10 6.5L22 6v.5L12 13z" />
                </svg>
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-600 text-[9px] font-bold text-white flex items-center justify-center">
                  3
                </span>
              </div>

              {/* DM Bubble 1 */}
              <div className="absolute top-36 left-3 sm:top-40 sm:left-4 z-20 p-2 sm:p-2.5 rounded-2xl bg-white shadow-md border border-zinc-200/90 max-w-[190px] sm:max-w-[210px] space-y-1">
                <div className="flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-bold flex items-center justify-center">
                    B
                  </div>
                  <span className="text-[11px] font-bold text-zinc-900 leading-tight">
                    Can you share your rate card?
                  </span>
                </div>
                <div className="flex items-center justify-between text-[9px] text-zinc-400 pl-6">
                  <span>10:24 AM</span>
                  <CheckCheck className="w-3 h-3 text-blue-500" />
                </div>
              </div>

              {/* DM Bubble 2 */}
              <div className="absolute top-50 left-5 sm:top-54 sm:left-6 z-20 p-2 sm:p-2.5 rounded-2xl bg-white shadow-md border border-zinc-200/90 max-w-[190px] sm:max-w-[210px] space-y-1">
                <div className="flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded-full bg-purple-100 text-purple-700 text-[10px] font-bold flex items-center justify-center">
                    C
                  </div>
                  <span className="text-[11px] font-bold text-zinc-900 leading-tight">
                    Are you available next month?
                  </span>
                </div>
                <div className="flex items-center justify-between text-[9px] text-zinc-400 pl-6">
                  <span>11:03 AM</span>
                  <CheckCheck className="w-3 h-3 text-blue-500" />
                </div>
              </div>

              {/* Google Sheets Spreadsheet Card (Center Right) */}
              <div className="absolute top-38 right-3 sm:top-42 sm:right-6 z-20 bg-white p-3 sm:p-3.5 rounded-2xl shadow-xl border border-zinc-200/90 w-[210px] sm:w-[240px] text-xs font-sans">
                <div className="flex items-center gap-2 pb-2 border-b border-zinc-100">
                  <div className="w-4 h-4 rounded bg-emerald-600 flex items-center justify-center text-white text-[9px] font-bold font-mono">
                    #
                  </div>
                  <span className="text-[11px] font-bold text-zinc-800">Q4 Rate Card.xlsx</span>
                </div>
                <div className="pt-2 space-y-1.5 font-mono text-[10px]">
                  <div className="grid grid-cols-3 text-zinc-400 font-bold pb-1 border-b border-zinc-100">
                    <span>Creator</span>
                    <span>Rate</span>
                    <span className="text-right">Status</span>
                  </div>
                  <div className="grid grid-cols-3 text-zinc-700 items-center">
                    <span className="truncate">@creator1</span>
                    <span>$2,000</span>
                    <span className="text-right text-amber-600 font-semibold">Pending</span>
                  </div>
                  <div className="grid grid-cols-3 text-zinc-700 items-center">
                    <span className="truncate">@creator2</span>
                    <span>$5,000</span>
                    <span className="text-right text-zinc-500">TBD</span>
                  </div>
                  <div className="grid grid-cols-3 text-zinc-700 items-center">
                    <span className="truncate">@creator3</span>
                    <span>$8,500</span>
                    <span className="text-right text-indigo-600 font-semibold">Follow up</span>
                  </div>
                </div>
              </div>

              {/* Campaign Brief Document (Lower Left) */}
              <div className="absolute bottom-16 left-3 sm:bottom-20 sm:left-5 z-20 bg-white p-3 rounded-2xl shadow-md border border-zinc-200/90 w-[150px] sm:w-[165px] text-xs">
                <div className="flex items-center gap-1.5 font-bold text-zinc-900 pb-1.5 border-b border-zinc-100">
                  <FileText className="w-3.5 h-3.5 text-indigo-600" />
                  <span className="text-[11px]">Campaign Brief</span>
                </div>
                <ul className="pt-1.5 space-y-1 text-[10px] text-zinc-500">
                  <li>• Deliverables</li>
                  <li>• Usage Rights</li>
                  <li>• Timelines</li>
                  <li>• Budget</li>
                </ul>
              </div>

              {/* Contract PDF Pill (Floating) */}
              <div className="absolute bottom-18 left-[38%] sm:bottom-22 sm:left-[36%] z-20 bg-white px-3 py-1.5 rounded-xl shadow-md border border-zinc-200/90 flex items-center gap-2 text-xs font-mono font-bold text-zinc-800">
                <div className="w-5 h-5 rounded bg-red-100 text-red-600 flex items-center justify-center text-[9px] font-black">
                  PDF
                </div>
                <span className="text-[11px]">Contract_v2.pdf</span>
              </div>

              {/* Video Content Approval (Bottom Left/Center) */}
              <div className="absolute bottom-3 left-4 sm:bottom-4 sm:left-6 z-20 flex items-center gap-2">
                <div className="relative w-14 h-10 rounded-xl overflow-hidden bg-zinc-800 shadow border border-white shrink-0">
                  <img
                    src="https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=200&h=150&fit=crop"
                    alt="Video Footage"
                    className="w-full h-full object-cover opacity-80"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-5 h-5 rounded-full bg-white/90 text-zinc-900 flex items-center justify-center shadow-xs">
                      <Play className="w-2.5 h-2.5 fill-current ml-0.5" />
                    </div>
                  </div>
                </div>
                <div className="bg-white/95 backdrop-blur px-2.5 py-1 rounded-xl border border-zinc-200 shadow-xs text-[10px] font-semibold text-zinc-700 flex items-center gap-1.5">
                  <Clock className="w-3 h-3 text-amber-500" />
                  <span>Content Pending Approval</span>
                </div>
              </div>

              {/* Payment Delay Card (Mid-Bottom Right) */}
              <div className="absolute bottom-24 right-5 sm:bottom-28 sm:right-8 z-20 bg-white px-3 py-2 rounded-xl border border-zinc-200/90 shadow-md flex items-center gap-2.5 text-xs text-zinc-800 font-semibold">
                <CreditCard className="w-4 h-4 text-zinc-600" />
                <span className="text-[11px]">Payment</span>
                <span className="text-[10px] font-mono bg-zinc-100 px-2 py-0.5 rounded text-zinc-700 font-bold">
                  Net 30
                </span>
                <Clock className="w-3.5 h-3.5 text-zinc-400" />
              </div>

              {/* Friction Sticky Note (Bottom Right) */}
              <div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-5 z-30 bg-[#fef08a] text-zinc-900 p-3 sm:p-3.5 rounded-xl shadow-lg border border-yellow-300 -rotate-2 w-[145px] sm:w-[160px] font-sans text-xs space-y-1">
                <div className="text-[11px] font-bold text-zinc-800 leading-tight">
                  Usage rights?
                  <br />
                  More revisions?
                  <br />
                  Late payment?
                </div>
              </div>
            </div>
          </div>

          {/* Right Column (5 cols): The Clean Commercial Story */}
          <div className="lg:col-span-5 space-y-6">
            {/* Section Eyebrow */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-purple-100/80 text-purple-700 text-xs font-bold uppercase tracking-wider font-mono">
              <span>THE CREATOR ECONOMY DILEMMA</span>
            </div>

            {/* Main Headline */}
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-zinc-950 font-display tracking-tight leading-[1.12]">
              The Creator Economy is Booming.
              <br />
              <span className="text-zinc-400 font-semibold">
                The Commercial Infrastructure Hasn&apos;t Caught Up.
              </span>
            </h2>

            {/* Problem Paragraph */}
            <p className="text-base sm:text-lg text-zinc-600 font-normal leading-relaxed">
              Creator partnerships have become a major commercial channel. But finding the right creators, understanding what they&apos;re worth, and structuring the deal still happens across disconnected platforms, DMs, spreadsheets, and email.
            </p>

            {/* 3 Pillar Features */}
            <div className="grid grid-cols-3 gap-3 sm:gap-4 pt-4 border-t border-zinc-100">
              <div className="space-y-1.5">
                <div className="w-9 h-9 rounded-full bg-purple-100/70 text-purple-600 flex items-center justify-center">
                  <Search className="w-4 h-4" />
                </div>
                <div className="text-sm font-bold text-zinc-950">Discover</div>
                <div className="text-xs text-zinc-500 leading-snug">
                  Find the right creators.
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="w-9 h-9 rounded-full bg-purple-100/70 text-purple-600 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div className="text-sm font-bold text-zinc-950">Value</div>
                <div className="text-xs text-zinc-500 leading-snug">
                  Understand what they&apos;re worth.
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="w-9 h-9 rounded-full bg-purple-100/70 text-purple-600 flex items-center justify-center">
                  <FileText className="w-4 h-4" />
                </div>
                <div className="text-sm font-bold text-zinc-950">Deal</div>
                <div className="text-xs text-zinc-500 leading-snug">
                  Turn conversations into clear agreements.
                </div>
              </div>
            </div>

            {/* Punchline & CTA Button */}
            <div className="pt-4 border-t border-zinc-100 space-y-4">
              <div className="text-base font-bold text-zinc-950">
                SignCollab connects the commercial layer.
              </div>
              <Link
                href="#commercial-lifecycle"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm transition-all shadow-md shadow-indigo-600/25 shrink-0 cursor-pointer"
              >
                <span>Explore the 4-Stage System</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
