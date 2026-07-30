"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  PILLARS,
  BLUEPRINT_TYPES,
  AUDIENCE_TAGS,
  getClusterById,
  getPillarForCluster,
  Pillar,
} from "@/lib/academy-data";
import { ArticleSummary } from "@/lib/gdocs";

interface AcademyClientPageProps {
  initialArticles: ArticleSummary[];
  companyName: string;
}

export default function AcademyClientPage({
  initialArticles,
  companyName,
}: AcademyClientPageProps) {
  const [selectedPillar, setSelectedPillar] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Filter Pillars to ONLY those that have at least 1 published article currently available
  const availablePillars = useMemo(() => {
    const pillarIdsWithArticles = new Set<string>();
    initialArticles.forEach((article) => {
      const pillar = getPillarForCluster(article.clusterId);
      if (pillar) {
        pillarIdsWithArticles.add(pillar.id);
      }
    });
    return PILLARS.filter((p) => pillarIdsWithArticles.has(p.id));
  }, [initialArticles]);

  // Filter articles based on pillar and search query
  const filteredArticles = useMemo(() => {
    return initialArticles.filter((article) => {
      // Search Query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const cluster = getClusterById(article.clusterId);
        const matchesTitle = article.title.toLowerCase().includes(q);
        const matchesExcerpt = article.excerpt.toLowerCase().includes(q);
        const matchesCluster = cluster?.name.toLowerCase().includes(q) || false;
        const matchesAudience = article.audience.toLowerCase().includes(q);
        if (!matchesTitle && !matchesExcerpt && !matchesCluster && !matchesAudience) {
          return false;
        }
      }

      // Pillar Filter
      if (selectedPillar !== "all") {
        const pillar = getPillarForCluster(article.clusterId);
        if (pillar?.id !== selectedPillar) {
          return false;
        }
      }

      return true;
    });
  }, [initialArticles, selectedPillar, searchQuery]);

  return (
    <div className="min-h-screen bg-theme-gradient flex flex-col relative overflow-hidden text-left">
      {/* Background ambient glow shapes */}
      <div className="absolute top-[5%] left-[-5%] w-[70%] h-[45%] rounded-full ambient-glow-purple pointer-events-none z-0" />
      <div className="absolute bottom-[10%] right-[-5%] w-[70%] h-[45%] rounded-full ambient-glow-blue pointer-events-none z-0" />

      {/* Header */}
      <header className="w-full h-16 border-b border-gray-200/60 bg-white/80 backdrop-blur-md flex items-center justify-between px-4 sm:px-8 z-20 sticky top-0">
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <span className="w-8 h-8 rounded-xl bg-black flex items-center justify-center font-black text-white text-base shadow-sm">
            {companyName[0]}
          </span>
          <div className="flex flex-col">
            <span className="font-black text-sm sm:text-base text-black tracking-tight uppercase leading-none">
              {companyName}
            </span>
            <span className="text-[10px] font-extrabold text-blue-600 tracking-wider uppercase leading-none mt-0.5">
              Academy
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-2.5">
          <Link
            href="/instant"
            className="hidden sm:inline-flex text-xs font-extrabold px-4 py-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white transition-colors shadow-sm items-center gap-1.5 whitespace-nowrap"
          >
            <span>Instant Contract</span>
          </Link>
          <Link
            href="/"
            className="text-xs font-bold px-3.5 py-2 rounded-full border border-gray-300 bg-white hover:bg-gray-50 text-black transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </header>

      {/* Academy Hero */}
      <section className="academy-hero z-10">
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="academy-hero-badge">
            <span>Domain Authority &amp; Legal Resource Engine</span>
          </div>
          <h1>SignCollab Academy</h1>
          <p>
            The definitive operational, business, and legal authority for brand-creator partnerships.
            Explore active guides, legal frameworks, and agreement compliance resources.
          </p>

          {/* Metrics Bar */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4 text-xs font-bold text-indigo-200">
            <div className="flex items-center bg-white/10 backdrop-blur px-3.5 py-1.5 rounded-full border border-white/10">
              <span>{initialArticles.length} Active Articles</span>
            </div>
            <div className="flex items-center bg-white/10 backdrop-blur px-3.5 py-1.5 rounded-full border border-white/10">
              <span>20,000+ Contract Dataset</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-8 py-8 sm:py-12 z-10 space-y-12">
        {/* ============================================================ */}
        {/* SECTION: SEARCH & TAXONOMY PILLAR FILTER TABS                */}
        {/* ============================================================ */}
        <section className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="academy-section-title">Master Content Architecture</div>
              <h2 className="text-xl sm:text-2xl font-black text-black tracking-tight">
                Knowledge Directory
              </h2>
            </div>

            {/* Real-Time Search Bar */}
            <div className="academy-search">
              <input
                type="text"
                placeholder="Search by topic, keyword, or legal clause..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="academy-search-input !pl-4"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="academy-search-clear"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Taxonomy Pillar Filter Tabs */}
          <div className="academy-pillars">
            <button
              onClick={() => setSelectedPillar("all")}
              className={`academy-pillar-tab ${
                selectedPillar === "all" ? "active" : ""
              }`}
            >
              All Pillars ({initialArticles.length})
            </button>
            {availablePillars.map((pillar) => {
              const count = initialArticles.filter(
                (a) => getPillarForCluster(a.clusterId)?.id === pillar.id
              ).length;
              return (
                <button
                  key={pillar.id}
                  onClick={() => setSelectedPillar(pillar.id)}
                  className={`academy-pillar-tab ${
                    selectedPillar === pillar.id ? "active" : ""
                  }`}
                >
                  <span className="font-semibold">{pillar.name}</span>
                  <span className="ml-1.5 opacity-60">({count})</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* ============================================================ */}
        {/* SECTION: PUBLISHED ARTICLES GRID                             */}
        {/* ============================================================ */}
        <section className="space-y-6">
          {filteredArticles.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-3xl p-12 text-center space-y-3 shadow-sm">
              <h3 className="text-lg font-bold text-black">No Articles Found</h3>
              <p className="text-xs text-gray-500 max-w-md mx-auto">
                No published guides match your search criteria or selected pillar filter. Try searching for broader terms or clearing your filters.
              </p>
              <button
                onClick={() => {
                  setSelectedPillar("all");
                  setSearchQuery("");
                }}
                className="px-4 py-2 bg-black hover:bg-gray-800 text-white rounded-xl text-xs font-bold transition-colors"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredArticles.map((article) => {
                const cluster = getClusterById(article.clusterId);
                const pillar = getPillarForCluster(article.clusterId);
                const blueprintType = BLUEPRINT_TYPES[article.blueprintType];
                const audience = AUDIENCE_TAGS[article.audience];

                return (
                  <article key={article.id} className="academy-card group">
                    <div className="academy-card-header">
                      {pillar && (
                        <span className="academy-pill-pillar">
                          {pillar.name}
                        </span>
                      )}
                      {blueprintType && (
                        <span className="academy-pill-blueprint">
                          {blueprintType.label}
                        </span>
                      )}
                    </div>

                    <div className="space-y-2 flex-1">
                      <h3 className="academy-card-title">
                        <Link href={`/knowledge/${article.slug}`}>
                          {article.title}
                        </Link>
                      </h3>
                      <p className="academy-card-excerpt">{article.excerpt}</p>
                    </div>

                    <div className="academy-card-footer">
                      <div className="flex items-center gap-2">
                        {cluster && (
                          <span className="academy-cluster-tag">
                            {cluster.name}
                          </span>
                        )}
                        {audience && (
                          <span className="text-[10px] font-bold text-gray-400">
                            • {audience.label}
                          </span>
                        )}
                      </div>

                      <Link
                        href={`/knowledge/${article.slug}`}
                        className="academy-read-link"
                      >
                        <span>Read Guide</span>
                        <span>→</span>
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-gray-200/60 bg-white/70 backdrop-blur-md py-6 flex flex-col md:flex-row items-center justify-between px-6 gap-4 z-10">
        <span className="text-xs text-gray-500 font-semibold">
          © {new Date().getFullYear()} {companyName}. All rights reserved.
        </span>
        <div className="flex gap-4 items-center flex-wrap justify-center">
          <Link
            href="/knowledge"
            className="text-xs text-black font-bold hover:underline"
          >
            Knowledge Base
          </Link>
          <span className="text-gray-300">|</span>
          <Link
            href="/features"
            className="text-xs text-gray-600 hover:text-black font-semibold transition-colors"
          >
            Features
          </Link>
          <span className="text-gray-300">|</span>
          <Link
            href="/verify"
            className="text-xs text-gray-600 hover:text-black font-semibold transition-colors"
          >
            Verify Document
          </Link>
          <span className="text-gray-300">|</span>
          <Link
            href="/terms"
            className="text-xs text-gray-600 hover:text-black font-semibold transition-colors"
          >
            Terms &amp; Privacy
          </Link>
          <span className="text-gray-300">|</span>
          <Link
            href="/contact"
            className="text-xs text-gray-600 hover:text-black font-semibold transition-colors"
          >
            Contact &amp; Support
          </Link>
        </div>
      </footer>
    </div>
  );
}
