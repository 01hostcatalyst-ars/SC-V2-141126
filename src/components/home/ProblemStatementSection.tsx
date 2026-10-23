"use client";

import React from "react";
import {
  AlertTriangle,
  MessageSquareX,
  FileQuestion,
  ShieldAlert,
  ArrowRight,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

export function ProblemStatementSection() {
  return (
    <section className="py-16 md:py-24 bg-white border-t border-zinc-200/80 text-left">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Header */}
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 text-red-700 text-xs font-bold uppercase tracking-wider border border-red-200">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>The Creator Economy Dilemma</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-zinc-950 font-display tracking-tight leading-tight">
            The Creator Economy is Booming.
            <br />
            <span className="text-zinc-500 font-semibold">
              The Commercial Infrastructure is Broken.
            </span>
          </h2>
          <p className="text-base sm:text-lg text-zinc-600 leading-relaxed font-normal">
            Every year, billions of dollars flow into influencer partnerships, yet deals are still struck over disorganized Instagram DMs, unstandardized pricing spreadsheets, and disputed deliverable terms.
          </p>
        </div>

        {/* 3 Problem vs Solution Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Fragmented Discovery */}
          <div className="p-6 sm:p-8 rounded-3xl bg-zinc-50 border border-zinc-200/80 shadow-xs flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-red-100/80 text-red-700 flex items-center justify-center">
                <MessageSquareX className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-zinc-950">
                Chaotic Outreach &amp; DMs
              </h3>
              <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
                Brand marketers spend days chasing creators across email inboxes and WhatsApp threads without knowing their real engagement quality, responsiveness, or availability.
              </p>
            </div>
            <div className="pt-4 border-t border-zinc-200/60">
              <div className="flex items-start gap-2 text-xs font-semibold text-indigo-700">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-indigo-600 mt-0.5" />
                <span>
                  <strong>SignCollab Solution:</strong> Centralized directory of 3,000+ audited creator profiles with direct rate intelligence.
                </span>
              </div>
            </div>
          </div>

          {/* Card 2: Opaque Pricing */}
          <div className="p-6 sm:p-8 rounded-3xl bg-zinc-50 border border-zinc-200/80 shadow-xs flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-100/80 text-amber-700 flex items-center justify-center">
                <FileQuestion className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-zinc-950">
                Opaque &amp; Arbitrary Pricing
              </h3>
              <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
                Creators struggle to defend their rate cards, while brands fear overpaying based on vanity follower counts that fail to convert into actual commercial reach.
              </p>
            </div>
            <div className="pt-4 border-t border-zinc-200/60">
              <div className="flex items-start gap-2 text-xs font-semibold text-indigo-700">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-indigo-600 mt-0.5" />
                <span>
                  <strong>SignCollab Solution:</strong> 16-Knot empirical valuation model benchmarked against retention, velocity, and PPP.
                </span>
              </div>
            </div>
          </div>

          {/* Card 3: Unprotected Deals */}
          <div className="p-6 sm:p-8 rounded-3xl bg-zinc-50 border border-zinc-200/80 shadow-xs flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-violet-100/80 text-violet-700 flex items-center justify-center">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-zinc-950">
                Unprotected Agreements
              </h3>
              <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
                Handshake deals lead to scope creep, endless revisions, unpaid usage rights, and delayed payments without legal recourse or audit trails.
              </p>
            </div>
            <div className="pt-4 border-t border-zinc-200/60">
              <div className="flex items-start gap-2 text-xs font-semibold text-indigo-700">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-indigo-600 mt-0.5" />
                <span>
                  <strong>SignCollab Solution:</strong> 1-page bilateral contracts with 48h deemed approvals, capped whitelisting, and SHA-256 e-sign.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
