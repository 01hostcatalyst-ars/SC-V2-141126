/**
 * SignCollab Link Aggregator Unroller
 *
 * Resolves bio-link hubs (Linktree, Beacons, Bento, Taplink, Bio.link) to extract
 * official destination social channels (YouTube, Instagram, TikTok) with 100% determinism.
 */

export interface UnrolledSocialLinks {
  youtubeUrl?: string;
  instagramUrl?: string;
  tiktokUrl?: string;
}

const KNOWN_AGGREGATOR_DOMAINS = [
  'linktr.ee',
  'beacons.ai',
  'taplink.cc',
  'bento.me',
  'bio.link',
  'campsite.bio',
  'linkin.bio',
  'hoo.be',
  'direct.me',
];

/**
 * Checks whether a given URL is a known link aggregator service
 */
export function isLinkAggregatorUrl(rawUrl: string): boolean {
  if (!rawUrl || typeof rawUrl !== 'string') return false;
  const lower = rawUrl.toLowerCase();
  return KNOWN_AGGREGATOR_DOMAINS.some((domain) => lower.includes(domain));
}

/**
 * Unrolls an aggregator URL by fetching its HTML and extracting destination social links.
 * Timeout is capped at 4000ms to guarantee fast pipeline turnaround.
 */
export async function unrollAggregatorLinks(aggregatorUrl: string): Promise<UnrolledSocialLinks> {
  const result: UnrolledSocialLinks = {};
  if (!isLinkAggregatorUrl(aggregatorUrl)) {
    return result;
  }

  let normalizedUrl = aggregatorUrl.trim();
  if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
    normalizedUrl = `https://${normalizedUrl}`;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 4000);

  try {
    const res = await fetch(normalizedUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      signal: controller.signal,
      redirect: 'follow',
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      return result;
    }

    const html = await res.text();

    // 1. YouTube discovery
    const ytMatch = html.match(/https?:\/\/(?:www\.)?(?:youtube\.com\/(?:@|c\/|channel\/|user\/)?|youtu\.be\/)[a-zA-Z0-9_\-\.]{3,50}/i);
    if (ytMatch) {
      result.youtubeUrl = ytMatch[0].replace(/["'<>]/g, '');
    }

    // 2. Instagram discovery
    const igMatch = html.match(/https?:\/\/(?:www\.)?instagram\.com\/([a-zA-Z0-9_\.]{2,30})/i);
    if (igMatch) {
      const igHandle = igMatch[1].toLowerCase();
      // Ignore static Instagram system paths
      if (!['p', 'reel', 'reels', 'stories', 'explore', 'direct', 'accounts', 'developer'].includes(igHandle)) {
        result.instagramUrl = `https://www.instagram.com/${igHandle}`;
      }
    }

    // 3. TikTok discovery
    const ttMatch = html.match(/https?:\/\/(?:www\.)?tiktok\.com\/@?([a-zA-Z0-9_\.]{2,30})/i);
    if (ttMatch) {
      const ttHandle = ttMatch[1].toLowerCase();
      if (!['discover', 'live', 'tag', 'music', 'video'].includes(ttHandle)) {
        result.tiktokUrl = `https://www.tiktok.com/@${ttHandle}`;
      }
    }

    return result;
  } catch {
    clearTimeout(timeoutId);
    return result;
  }
}
