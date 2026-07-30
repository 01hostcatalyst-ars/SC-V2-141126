"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  PILLARS,
  LEARNING_JOURNEYS,
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
  const [selectedJourney, setSelectedJourney] = useState<string | null>(null);
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

  // Filter Learning Journeys to ONLY those that have matching articles currently available
  const availableJourneys = useMemo(() => {
    return LEARNING_JOURNEYS.filter((journey) => {
      return journey.steps.some((step) =>
        initialArticles.some(
          (article) =>
            article.title.toLowerCase().includes(step.toLowerCase()) ||
            article.excerpt.toLowerCase().includes(step.toLowerCase())
        )
      );
    });
  }, [initialArticles]);

  // Filter articles based on pillar, journey, search query
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

      // Journey Filter
      if (selectedJourney) {
        const journey = LEARNING_JOURNEYS.find((j) => j.id === selectedJourney);
        if (journey) {
          const matchJourneyStep = journey.steps.some(
            (step) =>
              article.title.toLowerCase().includes(step.toLowerCase()) ||
              article.excerpt.toLowerCase().includes(step.toLowerCase())
          );
          if (!matchJourneyStep && initialArticles.length > 5) {
            return false;
          }
        }
      }

      return true;
    });
  }, [initialArticles, selectedPillar, selectedJourney, searchQuery]);

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

          {/* Metrics Bar without emojis */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4 text-xs font-bold text-indigo-200">
            <div className="flex items-center bg-white/10 backdrop-blur px-3.5 py-1.5 rounded-full border border-white/10">
              <span>{initialArticles.length} Active Articles</span>
            </div>
            {availableJourneys.length > 0 && (
              <div className="flex items-center bg-white/10 backdrop-blur px-3.5 py-1.5 rounded-full border border-white/10">
                <span>{availableJourneys.length} Active Pathways</span>
              </div>
            )}
            <div className="flex items-center bg-white/10 backdrop-blur px-3.5 py-1.5 rounded-full border border-white/10">
              <span>20,000+ Contract Dataset</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-8 py-8 sm:py-12 z-10 space-y-12">
        {/* ============================================================ */}
        {/* SECTION: USER LEARNING JOURNEYS (Only Active Pathways)      */}
        {/* ============================================================ */}
        {availableJourneys.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="academy-section-title">Guided Learning Pathways</div>
                <h2 className="text-xl sm:text-2xl font-black text-black tracking-tight">
                  Select Your Learning Journey
                </h2>
              </div>
              {selectedJourney && (
                <button
                  onClick={() => setSelectedJourney(null)}
                  className="text-xs font-bold text-blue-600 hover:text-blue-800 underline"
                >
                  Clear Pathway Filter
                </button>
              )}
            </div>

            <div className="academy-journeys">
              {availableJourneys.map((journey) => {
                const isSelected = selectedJourney === journey.id;
                return (
                  <div
                    key={journey.id}
                    onClick={() =>
                      setSelectedJourney(isSelected ? null : journey.id)
                    }
                    className={`academy-journey-card ${
                      isSelected ? "ring-2 ring-blue-600 border-transparent bg-blue-50/50" : ""
                    }`}
                  >
                    <div className="academy-journey-card-header">
                      <div>
                        <h3>{journey.name}</h3>
                        <span className="text-[10px] font-bold text-gray-400">
                          {journey.steps.length} Step Sequence
                        </span>
                      </div>
                    </div>
                    <div className="academy-journey-steps">
                      {journey.steps.slice(0, 4).map((step, idx) => (
                        <span key={idx} className="academy-journey-step">
                          {idx + 1}. {step}
                        </span>
                      ))}
                      {journey.steps.length > 4 && (
                        <span className="academy-journey-step font-bold text-blue-600">
                          +{journey.steps.length - 4} more
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

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
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400 hover:text-black"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Active Strategic Pillars Tab Bar (Only show pillars with articles) */}
          {availablePillars.length > 1 && (
            <div className="academy-pillar-tabs">
              <button
                onClick={() => setSelectedPillar("all")}
                className={`academy-pillar-tab ${selectedPillar === "all" ? "active" : ""}`}
              >
                All Available Categories ({initialArticles.length})
              </button>
              {availablePillars.map((pillar) => (
                <button
                  key={pillar.id}
                  onClick={() => setSelectedPillar(pillar.id)}
                  className={`academy-pillar-tab ${selectedPillar === pillar.id ? "active" : ""}`}
                >
                  {pillar.shortName}
                </button>
              ))}
            </div>
          )}

          {/* Active Filter Indicators */}
          {(selectedPillar !== "all" || selectedJourney || searchQuery) && (
            <div className="flex flex-wrap items-center gap-2 pt-2 text-xs text-gray-600 font-semibold">
              <span>Active Filters:</span>
              {selectedPillar !== "all" && (
                <span className="px-2.5 py-1 rounded-full bg-blue-100 text-blue-900 border border-blue-200 flex items-center gap-1 font-bold">
                  Category: {PILLARS.find((p) => p.id === selectedPillar)?.shortName}
                  <button onClick={() => setSelectedPillar("all")} className="ml-1 text-blue-700 hover:text-black">✕</button>
                </span>
              )}
              {selectedJourney && (
                <span className="px-2.5 py-1 rounded-full bg-purple-100 text-purple-900 border border-purple-200 flex items-center gap-1 font-bold">
                  Pathway: {LEARNING_JOURNEYS.find((j) => j.id === selectedJourney)?.name}
                  <button onClick={() => setSelectedJourney(null)} className="ml-1 text-purple-700 hover:text-black">✕</button>
                </span>
              )}
              {searchQuery && (
                <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-200 flex items-center gap-1 font-bold">
                  Search: &quot;{searchQuery}&quot;
                  <button onClick={() => setSearchQuery("")} className="ml-1 text-amber-700 hover:text-black">✕</button>
                </span>
              )}
            </div>
          )}

          {/* Articles Grid */}
          {filteredArticles.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-3xl p-8 sm:p-12 text-center space-y-4 shadow-sm">
              <h3 className="text-lg font-bold text-black">No articles found matching filters</h3>
              <p className="text-xs sm:text-sm text-gray-600 max-w-md mx-auto">
                Try clearing your search query or selecting a different category.
              </p>
              <button
                onClick={() => {
                  setSelectedPillar("all");
                  setSelectedJourney(null);
                  setSearchQuery("");
                }}
                className="px-4 py-2 rounded-full bg-black text-white font-bold text-xs hover:bg-gray-800 transition-colors"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredArticles.map((article) => {
                const cluster = getClusterById(article.clusterId);
                const pillar = getPillarForCluster(article.clusterId);
                const blueprint = BLUEPRINT_TYPES[article.blueprintType] || BLUEPRINT_TYPES.A;
                const audience = AUDIENCE_TAGS[article.audience] || AUDIENCE_TAGS.All;

                return (
                  <Link
                    key={article.id}
                    href={`/knowledge/${article.slug}`}
                    className="academy-article-card group"
                  >
                    <div className="space-y-3">
                      {/* Taxonomy Badges without emojis */}
                      <div className="academy-article-badges">
                        {cluster && (
                          <span
                            className="academy-badge"
                            style={{
                              backgroundColor: pillar?.bgColor || "#eff6ff",
                              color: pillar?.color || "#2563eb",
                              borderColor: pillar?.borderColor || "#bfdbfe",
                            }}
                          >
                            <span>{cluster.id}: {cluster.name}</span>
                          </span>
                        )}
                        <span
                          className="academy-badge"
                          style={{
                            backgroundColor: blueprint.bgColor,
                            color: blueprint.color,
                            borderColor: `${blueprint.color}33`,
                          }}
                        >
                          <span>Blueprint {blueprint.type}</span>
                        </span>
                        <span
                          className="academy-badge"
                          style={{
                            backgroundColor: audience.bgColor,
                            color: audience.color,
                            borderColor: `${audience.color}33`,
                          }}
                        >
                          <span>{audience.label}</span>
                        </span>
                      </div>

                      <h2 className="text-lg font-extrabold text-black group-hover:text-blue-600 transition-colors leading-snug">
                        {article.title}
                      </h2>
                      <p className="academy-excerpt">{article.excerpt}</p>
                    </div>

                    <div className="academy-article-footer">
                      <span className="academy-reading-time">
                        {article.readingTime || 5} min read
                      </span>
                      <span className="academy-read-more">
                        Read Guide &rarr;
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>


      </main>

      {/* Footer */}
      <footer className="w-full border-t border-gray-200/60 bg-white/80 backdrop-blur-md py-6 flex flex-col md:flex-row items-center justify-between px-6 gap-4 z-20 mt-auto">
        <span className="text-xs text-gray-500 font-semibold">
          © {new Date().getFullYear()} {companyName}. All rights reserved.
        </span>
        <div className="flex gap-4 items-center flex-wrap justify-center text-xs font-bold text-gray-600">
          <Link href="/knowledge" className="text-black hover:underline">
            Academy
          </Link>
          <span className="text-gray-300">|</span>
          <Link href="/instant" className="hover:text-black transition-colors">
            Instant Contract
          </Link>
          <span className="text-gray-300">|</span>
          <Link href="/verify" className="hover:text-black transition-colors">
            Verify Document
          </Link>
          <span className="text-gray-300">|</span>
          <Link href="/terms" className="hover:text-black transition-colors">
            Terms &amp; Privacy
          </Link>
        </div>
      </footer>
    </div>
  );
}
