import { knowledgeArticleSchema } from '@/lib/knowledge-schema';
import { serializeJsonLd } from '@/lib/structured-data';
import styles from '../Knowledge.module.css';
import ArticleContents, { MobileArticleContents } from '../ArticleContents';
import { ArrowLeft, ArrowRight, Clock3 } from 'lucide-react';
import { knowledgeBodyHtml, knowledgeHeadingText } from '@/lib/knowledge-presentation';
import { knowledgeArticleMetadata } from '@/lib/knowledge-seo';
import { knowledgeImageUrl } from '@/lib/knowledge-images';
import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getCompanyConfig } from "@/lib/config";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { getKnowledgeArticles, getArticleBySlug } from "@/lib/gdocs";
import {
  getClusterById,
  getPillarForCluster,
  AUDIENCE_TAGS,
} from "@/lib/academy-data";

const baseUrl = 'https://www.signcollab.com';

export const revalidate = 2592000; // Revalidate article pages after 30 days.

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

  return knowledgeArticleMetadata(article, baseUrl);
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



  const jsonLd = knowledgeArticleSchema(article, cluster?.name);

  const updated = new Date(article.modifiedTime);
  const updatedLabel = Number.isNaN(updated.getTime()) ? null : updated.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
  const entries = (article.toc || []).map(entry => ({ ...entry, text: knowledgeHeadingText(entry.text) }));
  return <div className={styles.page}>
    <script id="article-graph-jsonld" type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }} />
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
        <article className={styles.articleBody} aria-label={article.title}>
          {article.heroImage && <figure className={styles.articleHero} data-image-id={article.heroImage.id}>
            <img src={knowledgeImageUrl(article.slug, article.heroImage.id, article.modifiedTime)} alt={article.heroImage.alt} width={article.heroImage.width} height={article.heroImage.height} loading="eager" fetchPriority="high" decoding="async" />
          </figure>}
          <div className="gdoc-prose" dangerouslySetInnerHTML={{ __html: knowledgeBodyHtml(article.contentHtml, article.title) }} />
        </article>
        <ArticleContents entries={entries} />
      </div>
      <div className={styles.articleAfter}><section className={styles.cta}><div><span className={styles.eyebrow}>Your next step</span><h2>Turn a good conversation into a clear agreement.</h2><p>Set out deliverables, usage rights, and payment terms with {company.name}.</p></div><div className={styles.ctaActions}><Link href="/instant" className={styles.pinkButton}>Create a contract <ArrowRight size={16} /></Link><Link href="/knowledge" className={styles.textButton}>Explore more guides <ArrowRight size={16} /></Link></div></section></div>
    </main>
    <PublicFooter />
  </div>;
}
