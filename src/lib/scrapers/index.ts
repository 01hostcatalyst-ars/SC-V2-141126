export * from './types';
export * as YouTubeScraper from './youtube';
export * as InstagramScraper from './instagram';
export * as TikTokScraper from './tiktok';

export type SupportedPlatform = 'youtube' | 'instagram' | 'tiktok' | 'unknown';

/**
 * Detects social platform from URL
 */
export function detectPlatform(input: string): SupportedPlatform {
  const trimmed = input.trim().toLowerCase();
  if (trimmed.includes('tiktok.com')) {
    return 'tiktok';
  }
  if (trimmed.includes('instagram.com') || trimmed.includes('instagr.am')) {
    return 'instagram';
  }
  if (trimmed.includes('youtube.com') || trimmed.includes('youtu.be')) {
    return 'youtube';
  }
  return 'unknown';
}
