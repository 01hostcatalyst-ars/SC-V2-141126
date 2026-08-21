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
    // If URL parsing fails, fallback to simple clean string
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
    // Filter out obvious false positives like file extensions or dummy domains
    const cleanEmail = matches[0].trim();
    if (!cleanEmail.endsWith('.png') && !cleanEmail.endsWith('.jpg')) {
      return cleanEmail;
    }
  }
  return undefined;
}
