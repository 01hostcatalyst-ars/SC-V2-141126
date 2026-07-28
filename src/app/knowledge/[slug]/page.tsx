import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Script from "next/script";
import { getCompanyConfig } from "@/lib/config";
import { getKnowledgeArticles, getArticleBySlug } from "@/lib/gdocs";
import {
  getClusterById,
  getPillarForCluster,
  BLUEPRINT_TYPES,
  AUDIENCE_TAGS,
} from "@/lib/academy-data";

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.signcollab.com";

export const revalidate = 60; // ISR revalidation

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

/**
 * Generate static params at build time for existing articles
 */
export async function generateStaticParams() {
  const articles = await getKnowledgeArticles();
  return articles.map((article) => ({
    slug: article.slug,
  }));
}

/**
 * Generate metadata dynamically for Academy article pages
 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article) {
    return {
      title: "Article Not Found — SignCollab Academy",
    };
  }

  return {
    title: `${article.title} — SignCollab Academy`,
    description: article.excerpt,
    alternates: {
      canonical: `/knowledge/${article.slug}`,
    },
    openGraph: {
      title: `${article.title} — SignCollab Academy`,
      description: article.excerpt,
      url: `${baseUrl}/knowledge/${article.slug}`,
      type: "article",
      publishedTime: article.createdTime,
      modifiedTime: article.modifiedTime,
      authors: ["Muhammad Arsalan"],
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.excerpt,
    },
  };
}

export default async function KnowledgeArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const company = getCompanyConfig();
  const article = await getArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  const cluster = getClusterById(article.clusterId);
  const pillar = getPillarForCluster(article.clusterId);
  const blueprint = BLUEPRINT_TYPES[article.blueprintType] || BLUEPRINT_TYPES.A;
  const audience = AUDIENCE_TAGS[article.audience] || AUDIENCE_TAGS.All;

  const articleUrl = `${baseUrl}/knowledge/${article.slug}`;
  const defaultImage = `${baseUrl}/favicon.ico`;

  // Construct complete @graph multi-schema
  const graphEntities: any[] = [
    // 1. Organization Schema
    {
      "@type": "Organization",
      "@id": `${baseUrl}/#organization`,
      "name": company.name,
      "url": baseUrl,
      "logo": {
        "@type": "ImageObject",
        "url": defaultImage,
      },
      "email": company.supportEmail,
    },
    // 2. WebSite Schema
    {
      "@type": "WebSite",
      "@id": `${baseUrl}/#website`,
      "name": company.name,
      "url": baseUrl,
      "publisher": { "@id": `${baseUrl}/#organization` },
    },
    // 3. Person (Author E-E-A-T Schema)
    {
      "@type": "Person",
      "@id": `${baseUrl}/#author-arsalan`,
      "name": "Muhammad Arsalan",
      "jobTitle": "Founder & Creator Agreement Architect",
      "worksFor": { "@id": `${baseUrl}/#organization` },
      "url": baseUrl,
    },
    // 4. WebPage Schema
    {
      "@type": "WebPage",
      "@id": articleUrl,
      "url": articleUrl,
      "name": article.title,
      "description": article.excerpt,
      "isPartOf": { "@id": `${baseUrl}/#website` },
      "breadcrumb": { "@id": `${articleUrl}/#breadcrumb` },
      "inLanguage": "en-US",
    },
    // 5. BreadcrumbList Schema
    {
      "@type": "BreadcrumbList",
      "@id": `${articleUrl}/#breadcrumb`,
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": baseUrl,
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "Academy",
          "item": `${baseUrl}/knowledge`,
        },
        {
          "@type": "ListItem",
          "position": 3,
          "name": pillar?.shortName || "Knowledge",
          "item": `${baseUrl}/knowledge`,
        },
        {
          "@type": "ListItem",
          "position": 4,
          "name": article.title,
          "item": articleUrl,
        },
      ],
    },
    // 6. Article Schema
    {
      "@type": "Article",
      "@id": `${articleUrl}/#article`,
      "headline": article.title,
      "description": article.excerpt,
      "mainEntityOfPage": { "@id": articleUrl },
      "datePublished": article.createdTime,
      "dateModified": article.modifiedTime,
      "author": { "@id": `${baseUrl}/#author-arsalan` },
      "publisher": { "@id": `${baseUrl}/#organization` },
      "image": {
        "@type": "ImageObject",
        "url": defaultImage,
      },
      "inLanguage": "en-US",
    },
  ];

  // 7. FAQPage Schema (Only added IF genuine FAQs exist)
  if (article.faqs && article.faqs.length > 0) {
    graphEntities.push({
      "@type": "FAQPage",
      "@id": `${articleUrl}/#faqpage`,
      "mainEntity": article.faqs.map((faq) => ({
        "@type": "Question",
        "name": faq.question,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": faq.answer,
        },
      })),
    });
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": graphEntities,
  };

  return (
    <div className="min-h-screen bg-theme-gradient flex flex-col relative overflow-hidden text-left">
      <Script
        id="article-graph-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Background ambient glow shapes */}
      <div className="absolute top-[10%] left-[-5%] w-[80%] h-[50%] rounded-full ambient-glow-purple pointer-events-none z-0" />
      <div className="absolute bottom-[10%] right-[-5%] w-[80%] h-[50%] rounded-full ambient-glow-blue pointer-events-none z-0" />

      {/* Header */}
      <header className="w-full h-16 border-b border-gray-200/60 bg-white/80 backdrop-blur-md flex items-center justify-between px-4 sm:px-8 z-20 sticky top-0">
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <span className="w-8 h-8 rounded-xl bg-black flex items-center justify-center font-black text-white text-base shadow-sm">
            {company.name[0]}
          </span>
          <div className="flex flex-col">
            <span className="font-black text-sm sm:text-base text-black tracking-tight uppercase leading-none">
              {company.name}
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
            href="/knowledge"
            className="text-xs font-bold px-3.5 py-2 rounded-full border border-gray-300 bg-white hover:bg-gray-50 text-black transition-colors"
          >
            Back to Academy
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-8 py-8 sm:py-12 z-10 space-y-8">
        {/* Breadcrumb UI */}
        <nav className="flex flex-wrap items-center gap-2 text-xs text-gray-500 font-semibold">
          <Link href="/" className="hover:text-black transition-colors">Home</Link>
          <span>/</span>
          <Link href="/knowledge" className="hover:text-black transition-colors">Academy</Link>
          {pillar && (
            <>
              <span>/</span>
              <span className="text-gray-700 font-bold">{pillar.shortName}</span>
            </>
          )}
          {cluster && (
            <>
              <span>/</span>
              <span className="text-blue-600 font-bold">{cluster.id}</span>
            </>
          )}
          <span>/</span>
          <span className="text-black font-bold truncate max-w-[200px] sm:max-w-xs">{article.title}</span>
        </nav>

        {/* Enhanced Article Header without emojis */}
        <div className="academy-article-header space-y-4">
          <div className="academy-article-meta">
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
              <span>Blueprint {blueprint.type}: {blueprint.label}</span>
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
            <span className="academy-reading-time">
              {article.readingTime || 5} min read
            </span>
          </div>

          <h1>{article.title}</h1>

          {/* Author & Editorial Metadata */}
          <div className="academy-article-author">
            <div className="academy-author-avatar">MA</div>
            <div className="academy-author-info">
              <span className="academy-author-name">
                Muhammad Arsalan <span className="text-gray-400 font-normal">• Founder &amp; Creator Agreement Architect</span>
              </span>
              <span className="academy-author-date">
                Published in SignCollab Academy • Last Verified {new Date(article.modifiedTime).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              </span>
            </div>
          </div>
        </div>

        {/* Article Layout with Sidebar Table of Contents */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Table of Contents Sidebar */}
          {article.toc && article.toc.length > 0 && (
            <aside className="lg:col-span-1 order-2 lg:order-1">
              <div className="sticky top-24 p-5 bg-white border border-gray-200 rounded-2xl shadow-sm space-y-3 text-xs">
                <div className="font-extrabold uppercase tracking-wider text-black text-[11px] pb-2 border-b border-gray-100">
                  Table of Contents
                </div>
                <ul className="space-y-2 font-medium text-gray-600">
                  {article.toc.map((item) => (
                    <li
                      key={item.id}
                      style={{ paddingLeft: item.level === 3 ? "0.75rem" : "0" }}
                    >
                      <a
                        href={`#${item.id}`}
                        className="hover:text-blue-600 hover:underline block leading-snug line-clamp-2 transition-colors"
                      >
                        {item.text}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </aside>
          )}

          {/* Article Main Prose Body */}
          <article className={`${article.toc && article.toc.length > 0 ? "lg:col-span-3" : "lg:col-span-4"} order-1 lg:order-2`}>
            <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-10 shadow-sm">
              <div
                className="gdoc-prose"
                dangerouslySetInnerHTML={{ __html: article.contentHtml }}
              />
            </div>
          </article>
        </div>

        {/* Product Integration CTA Box (90/10 Rule) */}
        <div className="academy-article-cta mt-10">
          <div>
            <h3>Formalize Your Partnerships with SignCollab</h3>
            <p>
              Automate bilateral agreement execution with OTP verification, custom usage rights parameters, and tamper-evident audit logs.
            </p>
          </div>
          <Link
            href="/instant"
            className="academy-article-cta-btn"
          >
            <span>Create Instant Agreement &rarr;</span>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-gray-200/60 bg-white/80 backdrop-blur-md py-6 flex flex-col md:flex-row items-center justify-between px-6 gap-4 z-20">
        <span className="text-xs text-gray-500 font-semibold">
          © {new Date().getFullYear()} {company.name}. All rights reserved.
        </span>
        <div className="flex gap-4 items-center flex-wrap justify-center text-xs font-bold text-gray-600">
          <Link href="/knowledge" className="hover:text-black transition-colors">
            Academy Home
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
