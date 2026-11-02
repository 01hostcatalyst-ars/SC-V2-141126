import { knowledgeHeadingText } from './knowledge-presentation';

export interface KnowledgeImage {
  id: string;
  kind: 'hero' | 'article' | 'diagram' | 'square';
  alt: string;
  dataUri: string;
  mime: string;
  width: number;
  height: number;
}
const escape = (value: string) => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
const plainText = (value: string) => knowledgeHeadingText(value.replace(/<[^>]*>/g, '')).replace(/\s+/g, ' ').trim();

/** Only raster formats are served; never publish executable SVG/HTML through the image endpoint. */
export function embeddedKnowledgeImage(src: string) {
  const match = src.match(/^data:image\/(jpeg|png|webp);base64,([a-z0-9+/=\r\n]+)$/i);
  if (!match || match[2].length > 7 * 1024 * 1024) return null;
  const bytes = Buffer.from(match[2], 'base64');
  let width = 0, height = 0;
  const format = match[1].toLowerCase();
  try {
    if (format === 'png' && bytes.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10]))) {
      width = bytes.readUInt32BE(16); height = bytes.readUInt32BE(20);
    } else if (format === 'jpeg' && bytes[0] === 255 && bytes[1] === 216) {
      let offset = 2;
      while (offset + 8 < bytes.length) {
        if (bytes[offset++] !== 255) break;
        while (bytes[offset] === 255) offset++;
        const marker = bytes[offset++];
        if (marker === 217 || marker === 218) break;
        if (marker === 1 || (marker >= 208 && marker <= 215)) continue;
        const length = bytes.readUInt16BE(offset);
        if (length < 2 || offset + length > bytes.length) break;
        if ([192,193,194,195,197,198,199,201,202,203,205,206,207].includes(marker)) {
          height = bytes.readUInt16BE(offset + 3); width = bytes.readUInt16BE(offset + 5); break;
        }
        offset += length;
      }
    } else if (format === 'webp' && bytes.toString('ascii', 0, 4) === 'RIFF' && bytes.toString('ascii', 8, 12) === 'WEBP') {
      const chunk = bytes.toString('ascii', 12, 16);
      if (chunk === 'VP8X') { width = bytes.readUIntLE(24, 3) + 1; height = bytes.readUIntLE(27, 3) + 1; }
      if (chunk === 'VP8L' && bytes[20] === 47) { const dimensions = bytes.readUInt32LE(21); width = (dimensions & 16383) + 1; height = ((dimensions >>> 14) & 16383) + 1; }
      if (chunk === 'VP8 ' && bytes.toString('hex', 23, 26) === '9d012a') { width = bytes.readUInt16LE(26) & 16383; height = bytes.readUInt16LE(28) & 16383; }
    }
  } catch { return null; }
  if (!width || !height || width > 16000 || height > 16000 || width * height > 40000000) return null;
  return { bytes, mime: `image/${format}`, width, height };
}

export function knowledgeImageUrl(slug: string, id: string, modifiedTime: string) {
  return `/knowledge/${encodeURIComponent(slug)}/images/${encodeURIComponent(id)}?v=${encodeURIComponent(modifiedTime)}`;
}

export function parseKnowledgeImages(html: string, slug: string, modifiedTime: string) {
  const images: KnowledgeImage[] = [];
  let heroImage: KnowledgeImage | undefined;
  const counts = new Map<string, number>();
  // Decode only our known markers, leaving other escaped article text untouched.
  let contentHtml = html.replace(/&lt;(\/?(?:(?:hero|(?:article|diagram|square)\d+)-image|alt-text))&gt;/gi, '<$1>');
  contentHtml = contentHtml.replace(/<(hero|article\d+|diagram\d+|square\d+)-image>([\s\S]*?)<\/\1-image>/gi, (_block, name: string, body: string) => {
    const tag = body.match(/<img\b[^>]*>/i)?.[0];
    const attribute = (key: string) => tag?.match(new RegExp(`\\b${key}\\s*=\\s*["']([^"']*)["']`, 'i'))?.[1] || '';
    const src = knowledgeHeadingText(attribute('src'));
    const data = embeddedKnowledgeImage(src);
    // Keep a readable placeholder if an author uses an unsupported/missing image.
    const altBlock = body.match(/<alt-text>([\s\S]*?)<\/alt-text>/i);
    const alt = altBlock ? plainText(altBlock[1]) : knowledgeHeadingText(attribute('alt'));
    if (!data) return `<p class="knowledge-image-unavailable">${escape(alt || 'Image unavailable.')}</p>`;
    const normalized = name.toLowerCase();
    const count = (counts.get(normalized) || 0) + 1; counts.set(normalized, count);
    const id = count === 1 ? normalized : `${normalized}-${count}`;
    const kind = normalized.startsWith('diagram') ? 'diagram' : normalized.startsWith('square') ? 'square' : normalized === 'hero' ? 'hero' : 'article';
    const image: KnowledgeImage = { id, kind, alt, dataUri: src, mime: data.mime, width: data.width, height: data.height };
    images.push(image);
    if (kind === 'hero' && !heroImage) { heroImage = image; return ''; }
    return `<figure class="knowledge-image knowledge-image-${kind}" data-image-id="${escape(id)}"><img src="${escape(knowledgeImageUrl(slug, id, modifiedTime))}" alt="${escape(alt)}" width="${data.width}" height="${data.height}" loading="lazy" decoding="async"></figure>`;
  });
  // Google wraps marker blocks in paragraphs; figures must be siblings of paragraphs.
  contentHtml = contentHtml.replace(/<p\b[^>]*>\s*(<figure\b[\s\S]*?<\/figure>)\s*<\/p>/gi, '$1');
  contentHtml = contentHtml.replace(/<p\b[^>]*>(?:\s|&nbsp;)*<\/p>/gi, '');
  return { contentHtml, images, heroImage };
}
