import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Script from "next/script";
import { getCompanyConfig } from "@/lib/config";
import { getKnowledgeArticles, getArticleBySlug } from "@/lib/gdocs";

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.signcollab.com";

export const revalidate = 60; // ISR revalidation

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

/**
 * Generate static params at build time for all existing Google Docs
 */
export async function generateStaticParams() {
  const articles = await getKnowledgeArticles();
  return articles.map((article) => ({
    slug: article.slug,
  }));
}

/**
 * Generate metadata dynamically for Google Doc article pages
 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article) {
    return {
      title: "Article Not Found — SignCollab Knowledge Center",
    };
  }

  return {
    title: `${article.title} — SignCollab Knowledge Base`,
    description: article.excerpt,
    alternates: {
      canonical: `/knowledge/${article.slug}`,
    },
    openGraph: {
      title: `${article.title} — SignCollab`,
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
          "name": "Knowledge Base",
          "item": `${baseUrl}/knowledge`,
        },
        {
          "@type": "ListItem",
          "position": 3,
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

  // 7. FAQPage Schema (Only added IF genuine FAQs exist in the Google Doc)
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
      <header className="w-full h-16 border-b border-gray-200/60 bg-white/70 backdrop-blur-md flex items-center justify-between px-4 sm:px-6 z-10 sticky top-0">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <span className="hidden sm:flex w-8 h-8 rounded-lg bg-black items-center justify-center font-bold text-white text-base shrink-0">
            {company.name[0]}
          </span>
          <span className="font-bold text-base sm:text-lg text-black tracking-tight uppercase">
            {company.name}
          </span>
        </Link>
        <Link
          href="/knowledge"
          className="text-xs font-semibold px-4 py-2 rounded-full border border-gray-300 bg-white hover:bg-gray-50 text-black transition-colors"
        >
          ← All Articles
        </Link>
      </header>

      {/* Main Body */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-6 md:p-12 z-10 space-y-8">
        {/* Article Breadcrumb UI */}
        <div className="flex items-center gap-2 text-xs text-gray-500 font-semibold">
          <Link href="/" className="hover:text-black">Home</Link>
          <span>/</span>
          <Link href="/knowledge" className="hover:text-black">Knowledge Base</Link>
          <span>/</span>
          <span className="text-black font-bold truncate max-w-[200px] sm:max-w-xs">{article.title}</span>
        </div>

        {/* Article Header */}
        <div className="space-y-4 border-b border-gray-200/80 pb-6">
          <div className="flex flex-wrap items-center gap-3">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-900 border border-blue-200">
              Knowledge Article
            </span>
            <span className="text-xs text-gray-500 font-semibold">
              By <strong>Muhammad Arsalan</strong> • Updated {new Date(article.modifiedTime).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </span>
          </div>

          <h1 className="text-3xl md:text-5xl font-black text-black leading-tight tracking-tight">
            {article.title}
          </h1>
        </div>

        {/* Article Body HTML from Google Doc */}
        <article className="bg-white border border-gray-200 rounded-3xl p-6 md:p-10 shadow-sm">
          <div
            className="gdoc-prose"
            dangerouslySetInnerHTML={{ __html: article.contentHtml }}
          />
        </article>

        {/* Back link & CTA box */}
        <div className="p-6 bg-gradient-to-r from-emerald-900 to-teal-900 text-white rounded-3xl shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold">Ready to formalize your creator agreements?</h3>
            <p className="text-xs text-emerald-100 mt-1">Create 1-page bilateral contracts with OTP verification and tamper-proof audit trails.</p>
          </div>
          <Link
            href="/instant"
            className="px-5 py-3 bg-emerald-500 hover:bg-emerald-400 text-white font-extrabold text-xs rounded-2xl transition-all whitespace-nowrap shadow-md"
          >
            Create Instant Agreement ➔
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-gray-200/60 bg-white/70 backdrop-blur-md py-6 flex flex-col md:flex-row items-center justify-between px-6 gap-4 z-10">
        <span className="text-xs text-gray-500 font-semibold">
          © {new Date().getFullYear()} {company.name}. All rights reserved.
        </span>
        <div className="flex gap-4 items-center flex-wrap justify-center">
          <Link href="/knowledge" className="text-xs text-gray-600 hover:text-black font-semibold transition-colors">
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
