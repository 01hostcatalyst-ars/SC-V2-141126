"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Search,
  TrendingUp,
  FileText,
} from "lucide-react";

export function ProblemStatementSection() {
  return (
    <section className="py-16 md:py-24 bg-white border-t border-zinc-200/80 text-left overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-12 items-center">
          {/* Left Column (7 cols): The Tangled Workflow Visual Illustration */}
          <div className="lg:col-span-7 flex items-center justify-center">
            <div className="relative w-full max-w-lg lg:max-w-none flex items-center justify-center">
              <Image
                src="/images/creator_economy_dilemma_workflow.png"
                alt="The fragmented creator economy commercial workflow illustrating scattered DMs, spreadsheets, and contract disputes"
                width={491}
                height={572}
                priority
                className="w-full max-w-[500px] lg:max-w-[540px] h-auto object-contain select-none"
              />
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
