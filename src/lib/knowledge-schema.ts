import type { ArticleDetail, ArticleSummary } from './gdocs';
import { knowledgeImageUrl } from './knowledge-images';
import { breadcrumbs, founderId, founderNode, graph, organizationId, pageNode, schemaUrl, faqNode } from './structured-data';

export function knowledgeListSchema(articles: ArticleSummary[]) {
  return graph([
    {...pageNode('/knowledge', 'SignCollab Academy — Guides for Creator Partnerships', 'Practical guides to creator pricing, contracts, usage rights, and the business of working together.', 'CollectionPage'), mainEntity: {'@id': schemaUrl('/knowledge#articles')}},
    breadcrumbs('/knowledge', 'Academy'),
    {'@type': 'ItemList', '@id': schemaUrl('/knowledge#articles'), name: 'Creator partnership guides', numberOfItems: articles.length, itemListElement: articles.map((article,index)=>({'@type':'ListItem',position:index+1,url:schemaUrl(`/knowledge/${article.slug}`),name:article.title,description:article.excerpt}))},
  ]);
}

const validDate = (value?: string) => value && Number.isFinite(Date.parse(value)) ? new Date(value).toISOString() : undefined;
export function knowledgeArticleSchema(article: ArticleDetail, section?: string) {
  const path = `/knowledge/${article.slug}`;
  const url = schemaUrl(path);
  const hero = article.heroImage;
  const image = hero ? {'@type': 'ImageObject', '@id': `${url}#hero-image`, contentUrl: schemaUrl(knowledgeImageUrl(article.slug, hero.id, article.modifiedTime)), url: schemaUrl(knowledgeImageUrl(article.slug, hero.id, article.modifiedTime)), ...(hero.width > 0 ? {width: hero.width} : {}), ...(hero.height > 0 ? {height: hero.height} : {}), ...(hero.alt ? {caption: hero.alt} : {})} : undefined;
  return graph([
    {...pageNode(path, article.title, article.metaDescription?.trim() || article.excerpt), mainEntity: {'@id': `${url}#article`}, ...(image ? {primaryImageOfPage: {'@id': image['@id']}} : {})},
    breadcrumbs(path, article.title, [{path:'/knowledge',name:'Academy'}]),
    founderNode,
    {'@type': 'Article', '@id': `${url}#article`, url, headline: article.title, description: article.metaDescription?.trim() || article.excerpt,
      mainEntityOfPage: {'@id': url}, isPartOf: {'@id': schemaUrl('/knowledge')}, author: {'@id': founderId}, publisher: {'@id': organizationId}, inLanguage: 'en', isAccessibleForFree: true,
      ...(article.readingTime && article.readingTime > 0 ? {timeRequired: `PT${article.readingTime}M`} : {}),
      ...(section ? {articleSection: section} : {}),
      ...(!article.id.startsWith('seed-') && validDate(article.createdTime) ? {datePublished: validDate(article.createdTime)} : {}),
      ...(!article.id.startsWith('seed-') && validDate(article.modifiedTime) ? {dateModified: validDate(article.modifiedTime)} : {}),
      ...(image ? {image: {'@id': image['@id']}} : {}),
    },
    ...(image ? [image] : []),
    ...(article.faqs?.length ? [faqNode(path, article.faqs)] : []),
  ]);
}
