import styles from '../Knowledge.module.css';
import ArticleContents, { MobileArticleContents } from '../ArticleContents';
import { ArrowLeft, ArrowRight, Clock3 } from 'lucide-react';
import { knowledgeBodyHtml, knowledgeHeadingText } from '@/lib/knowledge-presentation';
import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Script from "next/script";
import { getCompanyConfig } from "@/lib/config";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { getKnowledgeArticles, getArticleBySlug } from "@/lib/gdocs";
import {
  getClusterById,
  getPillarForCluster,
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



  const articleUrl = `${baseUrl}/knowledge/${article.slug}`;
  const defaultImage = `${baseUrl}/favicon.ico`;

  // Check if article is legal/compliance/e-sign focused for citation enrichment
  const isLegalArticle =
    ["C15", "C16", "C17"].includes(article.clusterId) ||
    /legal|esign|eidas|eto|law|binding|statute/i.test(article.title);

  // Determine dynamic @type subtyping based on Blueprint Type
  const articleType = article.blueprintType === "A" ? ["Article", "TechArticle"] : "Article";

  // Construct complete @graph multi-schema
  // Note: Organization and WebSite schemas are already provided by the root layout.tsx
  // We only add page-specific entities here to avoid duplication.
  const graphEntities: any[] = [
    // 1. Person (Author E-E-A-T Schema — factual title + sameAs authority + domain knowledge)
    {
      "@type": "Person",
      "@id": `${baseUrl}/#author-arsalan`,
      "name": "Muhammad Arsalan",
      "jobTitle": "Founder & Product Lead",
      "worksFor": { "@id": `${baseUrl}/#organization` },
      "knowsAbout": [
        "Digital E-Signatures",
        "Creator & Influencer Commercial Contracts",
        "US ESIGN Act & UETA Compliance",
        "EU & UK eIDAS Regulations",
        "Commercial Usage Rights & IP Licensing",
        "Cryptographic SHA-256 Audit Trails"
      ],
      "sameAs": [
        "https://www.linkedin.com/in/muhammadarsalanofficial/",
        "https://x.com/ArsalanSignCol"
      ],
      "url": baseUrl,
    },
    // 2. WebPage Schema
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
    // 3. BreadcrumbList Schema
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
          "name": article.title,
          "item": articleUrl,
        },
      ],
    },
    // 4. Article Schema with Topical Entity Graph (about + mentions + speakable + citations)
    {
      "@type": articleType,
      "@id": `${articleUrl}/#article`,
      "headline": article.title,
      "description": article.excerpt,
      "mainEntityOfPage": { "@id": articleUrl },
      "datePublished": article.createdTime,
      "dateModified": article.modifiedTime,
      "author": { "@id": `${baseUrl}/#author-arsalan` },
      "publisher": { "@id": `${baseUrl}/#organization` },
      "about": [
        { "@id": `${baseUrl}/#webapp` },
        {
          "@type": "DefinedTerm",
          "name": cluster?.name || "Creator Contracts",
          "inDefinedTermSet": `${baseUrl}/knowledge`
        },
        {
          "@type": "Thing",
          "name": pillar?.name || "Content Creator Legal Protection"
        }
      ],
      "mentions": [
        { "@type": "Thing", "name": "Creator Commercial Contracts" },
        { "@type": "Thing", "name": "Usage Rights & IP Licensing" },
        { "@type": "Thing", "name": "Bilateral E-Signature Compliance" },
        { "@type": "Thing", "name": "Deemed Approval Protocol" },
        { "@type": "Thing", "name": "SHA-256 Audit Trail Verification" }
      ],
      ...(isLegalArticle
        ? {
            "citation": [
              {
                "@type": "Legislation",
                "name": "US Electronic Signatures in Global and National Commerce Act (15 U.S.C. § 7001)",
                "url": "https://www.ftc.gov/legal-library/browse/statutes/electronic-signatures-global-national-commerce-act"
              },
              {
                "@type": "Legislation",
                "name": "EU eIDAS Regulation (EU) No 910/2014 & eIDAS 2.0 (EU 2024/1183)",
                "url": "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A32014R0910"
              },
              {
                "@type": "Legislation",
                "name": "UK Electronic Communications Act 2000 & UK eIDAS",
                "url": "https://www.legislation.gov.uk/ukpga/2000/7/contents"
              },
              {
                "@type": "Legislation",
                "name": "UAE Federal Decree-Law No. 46 of 2021 on Electronic Transactions & Trust Services",
                "url": "https://elaws.gov.ae/"
              },
              {
                "@type": "Legislation",
                "name": "Saudi Arabia Electronic Transactions Law (Royal Decree No. M/18)",
                "url": "https://mcit.gov.sa/"
              },
              {
                "@type": "Legislation",
                "name": "India Information Technology Act 2000 & Bharatiya Sakshya Adhiniyam 2023 Section 63",
                "url": "https://www.meity.gov.in/content/information-technology-act-2000"
              },
              {
                "@type": "Legislation",
                "name": "Pakistan Electronic Transactions Ordinance (ETO) 2002",
                "url": "https://pakistanlawsite.com/"
              }
            ]
          }
        : {}),
      "speakable": {
        "@type": "SpeakableSpecification",
        "cssSelector": ["h1", ".academy-article-header", "article p"]
      },
      "image": {
        "@type": "ImageObject",
        "url": defaultImage,
        "width": 512,
        "height": 512,
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

  const updated = new Date(article.modifiedTime);
  const updatedLabel = Number.isNaN(updated.getTime()) ? null : updated.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
  const entries = (article.toc || []).map(entry => ({ ...entry, text: knowledgeHeadingText(entry.text) }));
  return <div className={styles.page}>
    <Script id="article-graph-jsonld" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    <PublicHeader activeRoute="/knowledge" />
    <main className={styles.articleShell}>
      <nav className={styles.breadcrumb} aria-label="Breadcrumb"><Link href="/knowledge"><span className="inline-flex items-center gap-2"><ArrowLeft size={14} /> Academy</span></Link><span aria-hidden="true">/</span><span>{pillar?.shortName || 'Guides'}</span></nav>
      <header className={styles.articleHeader}>
        <div className={styles.articleMeta}><span>{cluster?.name || 'Creator partnerships'}</span><span className="inline-flex items-center gap-1.5"><Clock3 size={13} />{article.readingTime || 5} min read</span><span>For {AUDIENCE_TAGS[article.audience]?.label.toLowerCase() || article.audience.toLowerCase()}</span></div>
        <h1>{article.title}</h1>
        <p className={styles.articleIntro}>{article.excerpt}</p>
        <div className={styles.author}><span className={styles.authorAvatar} aria-hidden="true">MA</span><div><strong>Muhammad Arsalan</strong><p>Founder & Product Lead{updatedLabel ? ' · Updated ' + updatedLabel : ''}</p></div></div>
      </header>
      <div className={styles.readingGrid} style={!entries.length ? { gridTemplateColumns: 'minmax(0, 880px)' } : undefined}>
        <MobileArticleContents entries={entries} />
        <article className={styles.articleBody} aria-label={article.title}><div className="gdoc-prose" dangerouslySetInnerHTML={{ __html: knowledgeBodyHtml(article.contentHtml, article.title) }} /></article>
        <ArticleContents entries={entries} />
      </div>
      <div className={styles.articleAfter}><section className={styles.cta}><div><span className={styles.eyebrow}>Your next step</span><h2>Turn a good conversation into a clear agreement.</h2><p>Set out deliverables, usage rights, and payment terms with {company.name}.</p></div><div className={styles.ctaActions}><Link href="/instant" className={styles.pinkButton}>Create a contract <ArrowRight size={16} /></Link><Link href="/knowledge" className={styles.textButton}>Explore more guides <ArrowRight size={16} /></Link></div></section></div>
    </main>
    <PublicFooter />
  </div>;
}
