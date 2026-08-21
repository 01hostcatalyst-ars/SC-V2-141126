import { YouTubeExternalLink } from '../types';

export interface ParsedYouTubeInput {
  type: 'handle' | 'channelId' | 'videoId' | 'username' | 'unknown';
  value: string;
}

/**
 * Extracts channel handle, channel ID, or video ID from any YouTube URL or raw handle string.
 */
export function extractYouTubeIdentifier(input: string): ParsedYouTubeInput {
  const trimmed = input.trim();
  if (!trimmed) {
    return { type: 'unknown', value: '' };
  }

  // 1. Raw handle e.g. @VideoWaliSarkar1 or VideoWaliSarkar1
  if (/^@?[\w.-]{3,30}$/.test(trimmed) && !trimmed.startsWith('UC') && !trimmed.includes('http')) {
    return {
      type: 'handle',
      value: trimmed.startsWith('@') ? trimmed.slice(1) : trimmed,
    };
  }

  // 2. Direct Channel ID e.g. UC...
  if (/^UC[\w-]{21,23}$/.test(trimmed)) {
    return { type: 'channelId', value: trimmed };
  }

  try {
    const urlObj = new URL(trimmed.startsWith('http') ? trimmed : `https://${trimmed}`);
    const pathname = urlObj.pathname;

    // Handle @handle in URL e.g. /@VideoWaliSarkar1 or /@VideoWaliSarkar1/videos
    const handleMatch = pathname.match(/\/@([\w.-]+)/);
    if (handleMatch) {
      return { type: 'handle', value: handleMatch[1] };
    }

    // Channel ID in URL e.g. /channel/UC...
    const channelMatch = pathname.match(/\/channel\/(UC[\w-]+)/);
    if (channelMatch) {
      return { type: 'channelId', value: channelMatch[1] };
    }

    // Video watch URL e.g. /watch?v=...
    const videoParam = urlObj.searchParams.get('v');
    if (videoParam) {
      return { type: 'videoId', value: videoParam };
    }

    // Shorts URL e.g. /shorts/TS07fIl5EAs
    const shortsMatch = pathname.match(/\/shorts\/([\w-]+)/);
    if (shortsMatch) {
      return { type: 'videoId', value: shortsMatch[1] };
    }

    // youtu.be short URL e.g. youtu.be/TS07fIl5EAs
    if (urlObj.hostname.includes('youtu.be')) {
      const vidId = pathname.replace(/^\//, '').split('/')[0];
      if (vidId) return { type: 'videoId', value: vidId };
    }

    // Custom URL /c/username or /user/username
    const customMatch = pathname.match(/\/(?:c|user)\/([\w.-]+)/);
    if (customMatch) {
      return { type: 'username', value: customMatch[1] };
    }

    // Path without prefix e.g. /username
    const cleanPath = pathname.replace(/^\//, '').split('/')[0];
    if (cleanPath && !['watch', 'feed', 'playlist', 'results'].includes(cleanPath)) {
      return { type: 'handle', value: cleanPath };
    }
  } catch {
    return { type: 'handle', value: trimmed.replace(/^@/, '') };
  }

  return { type: 'unknown', value: trimmed };
}

/**
 * Parses ISO 8601 YouTube duration strings (e.g., 'PT1H14M32S' -> { seconds: 4472, formatted: '1:14:32' })
 */
export function parseYouTubeDuration(isoDuration?: string): { seconds: number; formatted: string } {
  if (!isoDuration) return { seconds: 0, formatted: '0:00' };

  const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return { seconds: 0, formatted: '0:00' };

  const hours = parseInt(match[1] || '0', 10);
  const minutes = parseInt(match[2] || '0', 10);
  const seconds = parseInt(match[3] || '0', 10);
  const totalSeconds = hours * 3600 + minutes * 60 + seconds;

  let formatted = '';
  if (hours > 0) {
    formatted = `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  } else {
    formatted = `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  return { seconds: totalSeconds, formatted };
}

/**
 * Format numbers cleanly (e.g., 3000000 -> 3.00M, 45200 -> 45.2K)
 */
export function formatCompactNumber(num: number): string {
  if (!num || isNaN(num)) return '0';
  if (num >= 1_000_000_000) {
    return `${(num / 1_000_000_000).toFixed(2)}B`;
  }
  if (num >= 1_000_000) {
    return `${(num / 1_000_000).toFixed(2)}M`;
  }
  if (num >= 1_000) {
    return `${(num / 1_000).toFixed(1)}K`;
  }
  return num.toLocaleString();
}

/**
 * Extracts public business email from description string
 */
export function extractEmailFromText(text: string): string | undefined {
  if (!text) return undefined;
  const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi;
  const matches = text.match(emailRegex);
  if (matches && matches.length > 0) {
    const cleanEmail = matches[0].trim();
    if (!cleanEmail.endsWith('.png') && !cleanEmail.endsWith('.jpg')) {
      return cleanEmail;
    }
  }
  return undefined;
}

/**
 * Extracts ONLY true official channel profile & social links from YouTube metadata (exact match to YouTube About modal)
 */
export function extractOfficialProfileLinks(rawPageHtml?: string): YouTubeExternalLink[] {
  if (!rawPageHtml) return [];

  const linksMap = new Map<string, YouTubeExternalLink>();

  const getDomain = (urlStr: string): string => {
    try {
      const u = new URL(urlStr.startsWith('http') ? urlStr : `https://${urlStr}`);
      return u.hostname.replace(/^www\./, '');
    } catch {
      return urlStr;
    }
  };

  const getTitleForDomain = (domain: string): string => {
    const d = domain.toLowerCase();
    if (d.includes('instagram.com')) return 'Instagram';
    if (d.includes('twitter.com') || d.includes('x.com')) return 'X (Twitter)';
    if (d.includes('facebook.com')) return 'Facebook';
    if (d.includes('tiktok.com')) return 'TikTok';
    if (d.includes('linkedin.com')) return 'LinkedIn';
    if (d.includes('discord.') || d.includes('discordapp.')) return 'Discord';
    if (d.includes('reddit.com')) return 'Reddit';
    if (d.includes('patreon.com')) return 'Patreon';
    if (d.includes('github.com')) return 'GitHub';
    if (d.includes('twitch.tv')) return 'Twitch';
    if (d.includes('threads.net')) return 'Threads';
    if (d.includes('t.me') || d.includes('telegram.me')) return 'Telegram';
    if (d.includes('youtube.com')) return 'YouTube';
    return domain;
  };

  try {
    const match = rawPageHtml.match(/ytInitialData\s*=\s*({.+?});<\/script>/);
    if (match) {
      const data = JSON.parse(match[1]);

      // 1. Official schema sameAs links from channelProfileMicroformatDetails
      const sameAsList: unknown[] =
        data.microformat?.microformatDataRenderer?.channelProfileMicroformatDetails?.profilePage?.mainEntity?.sameAs || [];
      for (const rawUrl of sameAsList) {
        if (typeof rawUrl === 'string' && rawUrl.startsWith('http')) {
          const domain = getDomain(rawUrl);
          const key = rawUrl.toLowerCase();
          if (!linksMap.has(key) && !domain.includes('google.com') && !domain.includes('googlevideo.com')) {
            linksMap.set(key, {
              title: getTitleForDomain(domain),
              url: rawUrl,
              domain,
            });
          }
        }
      }

      // 2. Primary Header attribution redirect link
      const headerCommand =
        data.header?.pageHeaderRenderer?.content?.pageHeaderViewModel?.attribution?.attributionViewModel?.text
          ?.commandRuns?.[0]?.onTap?.innertubeCommand?.commandMetadata?.webCommandMetadata?.url;
      if (headerCommand && typeof headerCommand === 'string' && headerCommand.includes('q=')) {
        const qMatch = headerCommand.match(/q=([^&]+)/);
        if (qMatch) {
          const decoded = decodeURIComponent(qMatch[1]);
          const domain = getDomain(decoded);
          const key = decoded.toLowerCase();
          if (!linksMap.has(key) && !domain.includes('google.com') && !domain.includes('googlevideo.com')) {
            linksMap.set(key, {
              title: getTitleForDomain(domain),
              url: decoded,
              domain,
            });
          }
        }
      }
    }
  } catch {
    // If JSON parsing fails, fallback safely
  }

  return Array.from(linksMap.values());
}
