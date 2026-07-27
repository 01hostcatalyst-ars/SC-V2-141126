import React from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { getCompanyConfig } from "@/lib/config";
import { getKnowledgeArticles } from "@/lib/gdocs";

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.signcollab.com";

export const revalidate = 60; // Revalidate every 60 seconds (ISR)

export const metadata: Metadata = {
  title: "Knowledge Base & Guides — SignCollab Legal & Contract Insights",
  description:
    "Learn about bilateral contract execution, e-signature compliance (US ESIGN, UK eIDAS, UAE, Pakistan ETO), creator usage rights, and campaign protection.",
  alternates: {
    canonical: "/knowledge",
  },
  openGraph: {
    title: "Knowledge Base & Guides — SignCollab",
    description:
      "Articles, guides, and legal compliance insights for creators, brands, and agencies.",
    url: `${baseUrl}/knowledge`,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Knowledge Base & Guides — SignCollab",
    description:
      "Articles, guides, and legal compliance insights for creators, brands, and agencies.",
  },
};

export default async function KnowledgeIndexPage() {
  const company = getCompanyConfig();
  const articles = await getKnowledgeArticles();

  return (
    <div className="min-h-screen bg-theme-gradient flex flex-col relative overflow-hidden text-left">
      {/* Ambient background glow */}
      <div className="absolute top-[10%] left-[-5%] w-[80%] h-[50%] rounded-full ambient-glow-purple pointer-events-none z-0" />
      <div className="absolute bottom-[10%] right-[-5%] w-[80%] h-[50%] rounded-full ambient-glow-blue pointer-events-none z-0" />

      {/* Header */}
      <header className="w-full h-16 border-b border-gray-200/60 bg-white/70 backdrop-blur-md flex items-center justify-between px-4 sm:px-6 z-10 sticky top-0">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <span className="hidden sm:flex w-8 h-8 rounded-lg bg-black items-center justify-center font-bold text-white text-base shrink-0">
            {company.name[0]}
          </span>
          <span className="font-bold text-base sm:text-lg text-black tracking-tight uppercase">
            {company.name}
          </span>
        </Link>
        <div className="flex items-center gap-3">
          <Link
            href="/instant"
            className="hidden sm:inline-flex text-xs font-bold px-4 py-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white transition-colors shadow-sm items-center gap-1.5 whitespace-nowrap"
          >
            <span>Instant Contract</span>
          </Link>
          <Link
            href="/"
            className="text-xs font-semibold px-4 py-2 rounded-full border border-gray-300 bg-white hover:bg-gray-50 text-black transition-colors"
          >
            ← Back to Home
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-6 md:p-12 z-10 space-y-10">
        {/* Title Header */}
        <div className="space-y-4 text-center sm:text-left">
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold bg-blue-100 text-blue-900 border border-blue-200">
            Knowledge Center &amp; Guides
          </span>
          <h1 className="text-3xl md:text-5xl font-black text-black leading-tight tracking-tight">
            Creator &amp; Brand Legal Insights
          </h1>
          <p className="text-sm md:text-base text-gray-700 leading-relaxed max-w-2xl">
            Everything you need to know about digital e-signatures, campaign protection, bilateral compliance, and creator licensing rights.
          </p>
        </div>

        {/* Articles Grid */}
        {articles.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-3xl p-8 md:p-12 text-center space-y-4 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center mx-auto text-blue-600 text-xl font-bold">
              📝
            </div>
            <h2 className="text-xl font-bold text-black">Connected to Google Drive</h2>
            <p className="text-xs md:text-sm text-gray-600 max-w-md mx-auto leading-relaxed">
              Your Google Drive folder (<strong>signcollab-post</strong>) is successfully linked and listening for new Google Docs!
            </p>
            <p className="text-xs text-gray-400 font-medium">
              Create or drop any Google Doc in your <code className="bg-gray-100 px-2 py-1 rounded text-black">signcollab-post</code> Drive folder and it will appear here automatically.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {articles.map((article) => (
              <Link
                key={article.id}
                href={`/knowledge/${article.slug}`}
                className="premium-card p-6 flex flex-col justify-between space-y-4 group cursor-pointer"
              >
                <div className="space-y-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-md inline-block">
                    Guide / Post
                  </span>
                  <h2 className="text-lg md:text-xl font-bold text-black group-hover:text-blue-600 transition-colors leading-snug">
                    {article.title}
                  </h2>
                  <p className="text-xs text-gray-600 line-clamp-3 leading-relaxed">
                    {article.excerpt}
                  </p>
                </div>

                <div className="flex items-center justify-between border-t border-gray-100 pt-4 text-xs font-semibold text-gray-500">
                  <span>Updated {new Date(article.modifiedTime).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                  <span className="text-black group-hover:translate-x-1 transition-transform font-bold flex items-center gap-1">
                    Read Article ➔
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-gray-200/60 bg-white/70 backdrop-blur-md py-6 flex flex-col md:flex-row items-center justify-between px-6 gap-4 z-10 mt-auto">
        <span className="text-xs text-gray-500 font-semibold">
          © {new Date().getFullYear()} {company.name}. All rights reserved.
        </span>
        <div className="flex gap-4 items-center flex-wrap justify-center">
          <Link href="/knowledge" className="text-xs text-black font-bold hover:underline">
            Knowledge
          </Link>
          <span className="text-gray-300">|</span>
          <Link href="/features" className="text-xs text-gray-600 hover:text-black font-semibold transition-colors">
            Features
          </Link>
          <span className="text-gray-300">|</span>
          <Link href="/verify" className="text-xs text-gray-600 hover:text-black font-semibold transition-colors">
            Verify Document
          </Link>
          <span className="text-gray-300">|</span>
          <Link href="/terms" className="text-xs text-gray-600 hover:text-black font-semibold transition-colors">
            Terms &amp; Privacy
          </Link>
        </div>
      </footer>
    </div>
  );
}
