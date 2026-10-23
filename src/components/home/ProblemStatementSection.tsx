"use client";

import React from "react";
import {
  AlertTriangle,
  Search,
  HelpCircle,
  FileText,
  CheckCircle2,
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
          {/* Card 1: Finding the Right Creators Takes Too Long */}
          <div className="p-6 sm:p-8 rounded-3xl bg-zinc-50 border border-zinc-200/80 shadow-xs flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-red-100/80 text-red-700 flex items-center justify-center">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-zinc-950">
                Finding the Right Creators Takes Too Long
              </h3>
              <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
                Brands waste hours searching across social platforms, chasing replies, and trying to figure out which creators are right for their campaigns.
              </p>
            </div>
            <div className="pt-4 border-t border-zinc-200/60">
              <div className="flex items-start gap-2 text-xs font-semibold text-indigo-700">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-indigo-600 mt-0.5" />
                <span>
                  <strong>How SignCollab Helps:</strong> Discover creators in one place. Explore thousands of creator profiles with audience insights, platform data, and estimated rates.
                </span>
              </div>
            </div>
          </div>

          {/* Card 2: What Is a Creator Really Worth? */}
          <div className="p-6 sm:p-8 rounded-3xl bg-zinc-50 border border-zinc-200/80 shadow-xs flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-100/80 text-amber-700 flex items-center justify-center">
                <HelpCircle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-zinc-950">
                What Is a Creator Really Worth?
              </h3>
              <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
                Creators struggle to justify their prices. Brands struggle to know whether they&apos;re paying a fair rate. Follower counts alone don&apos;t tell the full story.
              </p>
            </div>
            <div className="pt-4 border-t border-zinc-200/60">
              <div className="flex items-start gap-2 text-xs font-semibold text-indigo-700">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-indigo-600 mt-0.5" />
                <span>
                  <strong>How SignCollab Helps:</strong> Make better pricing decisions. Get data-informed rate estimates based on audience, engagement, views, and market conditions.
                </span>
              </div>
            </div>
          </div>

          {/* Card 3: Deals Shouldn't Depend on DMs */}
          <div className="p-6 sm:p-8 rounded-3xl bg-zinc-50 border border-zinc-200/80 shadow-xs flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-violet-100/80 text-violet-700 flex items-center justify-center">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-zinc-950">
                Deals Shouldn&apos;t Depend on DMs
              </h3>
              <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
                Unclear deliverables, endless revisions, unexpected usage demands, and late payments can turn a promising partnership into a frustrating experience.
              </p>
            </div>
            <div className="pt-4 border-t border-zinc-200/60">
              <div className="flex items-start gap-2 text-xs font-semibold text-indigo-700">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-indigo-600 mt-0.5" />
                <span>
                  <strong>How SignCollab Helps:</strong> Put the agreement in writing. Define deliverables, payment terms, approval deadlines, and content usage rights in a clear agreement with an electronic signing and verification trail.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
