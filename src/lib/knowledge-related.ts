import { knowledgeHeadingText } from './knowledge-presentation';

type RelatedArticle = { title: string; slug: string };
const escape = (value: string) => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
const textOf = (html: string) => knowledgeHeadingText(html.replace(/<[^>]*>/g, ' ')).replace(/\s+/g, ' ').trim();
const normalize = (value: string) => knowledgeHeadingText(value).normalize('NFKC').toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim();

function linkedArticle(raw: string, articles: RelatedArticle[]) {
  try {
    let url = new URL(knowledgeHeadingText(raw), 'https://www.signcollab.com');
    // Google Docs sometimes exports links through a Google redirect URL.
    if (['www.google.com', 'google.com'].includes(url.hostname) && url.pathname === '/url') {
      url = new URL(url.searchParams.get('q') || url.searchParams.get('url') || '');
    }
    if (!['https:', 'http:'].includes(url.protocol)) return undefined;
    const match = url.pathname.match(/^\/knowledge\/([^/]+)\/?$/);
    if (!match) return undefined;
    return articles.find(article => article.slug === decodeURIComponent(match[1]));
  } catch { return undefined; }
}

/** Resolve the author's title:description bullets against the actual published catalogue. */
export function relatedReadingHtml(html: string, articles: RelatedArticle[], currentSlug?: string): string {
  // The author may put [/related-reading] inside the final bullet, before its exported </li>.
  const listItems = [...html.matchAll(/<li\b[^>]*>([\s\S]*?)(?:<\/li>|(?=<li\b)|$)/gi)].map(match => match[1]);
  const entries = listItems.length ? listItems : html.replace(/<\/(?:p|div)>|<br\s*\/?>/gi, '\n').split(/\n+/).filter(value => textOf(value));
  const available = articles.filter(article => article.slug !== currentSlug);
  const rows = entries.map(entry => {
    const text = textOf(entry).replace(/^(?:[-*•]\s+|\d+\.\s+)/, '');
    if (!text) return '';
    let target: RelatedArticle | undefined;
    let description = '';
    const anchor = entry.match(/<a\b[^>]*href\s*=\s*["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/i);
    if (anchor) {
      target = linkedArticle(anchor[1], available);
      if (target) description = textOf(entry.slice((anchor.index || 0) + anchor[0].length)).replace(/^\s*[:–—-]\s*/, '');
    }
    if (!target && /^https?:\/\//i.test(text)) target = linkedArticle(text, available);
    if (!target) {
      // Check every colon boundary: a published title can itself contain colons.
      const candidates = available.flatMap(article => {
        if (normalize(text) === normalize(article.title)) return [{ article, description: '' }];
        const positions = [...text.matchAll(/:/g)].map(match => match.index!);
        return positions.filter(index => normalize(text.slice(0, index)) === normalize(article.title)).map(index => ({ article, description: text.slice(index + 1).trim() }));
      }).sort((a, b) => b.article.title.length - a.article.title.length);
      if (candidates.length && !candidates.slice(1).some(candidate => normalize(candidate.article.title) === normalize(candidates[0].article.title))) {
        target = candidates[0].article;
        description = candidates[0].description;
      }
    }
    // An unpublished, ambiguous or renamed title stays readable instead of becoming a guessed 404.
    return target ? `<li><a href="/knowledge/${escape(encodeURIComponent(target.slug))}">${escape(target.title)}</a>${description ? `<p>${escape(description)}</p>` : ''}</li>` : `<li>${escape(text)}</li>`;
  }).filter(Boolean);
  return `<ul class="academy-related-list">${rows.join('')}</ul>`;
}
