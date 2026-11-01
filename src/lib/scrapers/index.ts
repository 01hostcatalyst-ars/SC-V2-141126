import { parseProfileInput } from '@/lib/calculator/profile-input';
export * from './types';
export * as YouTubeScraper from './youtube';
export * as InstagramScraper from './instagram';
export * as TikTokScraper from './tiktok';

export type SupportedPlatform = 'youtube' | 'instagram' | 'tiktok' | 'unknown';

/**
 * Detects social platform from URL
 */
export function detectPlatform(input: string): SupportedPlatform {
 try { return parseProfileInput(input).platform; } catch { return 'unknown'; }
}
