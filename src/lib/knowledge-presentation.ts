/** Decode heading text for display, without interpreting it as markup. */
export function knowledgeHeadingText(value: string): string {
  const named: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', pound: '£', euro: '€', yen: '¥', cent: '¢', copy: '©', reg: '®', trade: '™', ndash: '–', mdash: '—', lsquo: '‘', rsquo: '’', ldquo: '“', rdquo: '”', hellip: '…', bull: '•', middot: '·', times: '×' };
  return value.replace(/&(#x[0-9a-f]+|#\d+|[a-z][a-z0-9]*);/gi, (entity, name: string) => {
    if (name[0] !== '#') return named[name.toLowerCase()] || entity;
    const point = name[1]?.toLowerCase() === 'x' ? parseInt(name.slice(2), 16) : parseInt(name.slice(1), 10);
    return point > 0 && point <= 0x10ffff && !(point >= 0xd800 && point <= 0xdfff) ? String.fromCodePoint(point) : entity;
  });
}

/** The page already presents the document title; omit only an identical opening H1. */
export function knowledgeBodyHtml(html: string, title: string): string {
  const normalize = (value: string) => knowledgeHeadingText(value.replace(/<[^>]*>/g, '')).replace(/\s+/g, ' ').trim().toLowerCase();
  return html.replace(/^\s*<h1\b[^>]*>([\s\S]*?)<\/h1>/i, (heading, text: string) => normalize(text) === normalize(title) ? '' : heading);
}
