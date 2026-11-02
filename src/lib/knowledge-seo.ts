import type { Metadata } from 'next';
import { knowledgeHeadingText } from './knowledge-presentation';
import { knowledgeImageUrl } from './knowledge-images';

export interface KnowledgeSeoFields { metaTitle?: string; metaDescription?: string }

/** Read the shortcode before the visible article renderer removes it. */
export function extractKnowledgeSeo(html: string): KnowledgeSeoFields {
  const plain = knowledgeHeadingText(html
    .replace(/<\/(?:p|div|li|h[1-6])\s*>|<br\b[^>]*>/gi, '\n')
    .replace(/<[^>]*>/g, ''));
  const result: KnowledgeSeoFields = {};
  for (const block of plain.matchAll(/\[seo-metadata\]([\s\S]*?)\[\/seo-metadata\]/gi)) {
    for (const field of block[1].matchAll(/\bMeta\s+(Title|Description)\s*:\s*([\s\S]*?)(?=\bMeta\s+(?:Title|Description)\s*:|$)/gi)) {
      const value = field[2].replace(/\s+/g, ' ').trim();
      if (!value) continue;
      if (field[1].toLowerCase() === 'title') result.metaTitle ||= value;
      else result.metaDescription ||= value;
    }
  }
  return result;
}

type SeoArticle = KnowledgeSeoFields & {
  title: string; excerpt: string; slug: string; createdTime?: string; modifiedTime: string;
  heroImage?: { id: string; alt: string; width: number; height: number };
};

export function knowledgeArticleMetadata(article: SeoArticle, baseUrl: string): Metadata {
  const title = article.metaTitle?.trim();
  const description = article.metaDescription?.trim() || article.excerpt;
  const hero = article.heroImage;
  const images = hero ? [{ url: `${baseUrl}${knowledgeImageUrl(article.slug, hero.id, article.modifiedTime)}`, alt: hero.alt, width: hero.width, height: hero.height }] : undefined;
  return {
    // An authored SEO title is complete; avoid adding another layout suffix.
    title: title ? { absolute: title } : `${article.title} — SignCollab Academy`,
    description,
    alternates: { canonical: `/knowledge/${article.slug}` },
    openGraph: {
      title: title || `${article.title} — SignCollab Academy`,
      description,
      url: `${baseUrl}/knowledge/${article.slug}`,
      type: 'article',
      publishedTime: article.createdTime,
      modifiedTime: article.modifiedTime,
      authors: ['Muhammad Arsalan'],
      images,
    },
    twitter: { card: 'summary_large_image', title: title || article.title, description, images },
  };
}
