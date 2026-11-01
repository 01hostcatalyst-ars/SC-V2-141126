import type { Platform } from './types';

export class ProfileInputError extends Error {}
const hosts: Record<string, Platform> = {
  'instagram.com': 'instagram', 'www.instagram.com': 'instagram',
  'tiktok.com': 'tiktok', 'www.tiktok.com': 'tiktok', 'm.tiktok.com': 'tiktok',
  'youtube.com': 'youtube', 'www.youtube.com': 'youtube', 'm.youtube.com': 'youtube',
  'youtu.be': 'youtube',
};
export function isPlatform(value: unknown): value is Platform {
  return value === 'youtube' || value === 'instagram' || value === 'tiktok';
}
export function parseProfileInput(value: unknown, selected?: Platform) {
  const fail = (): never => { throw new ProfileInputError('Enter a valid YouTube, Instagram or TikTok profile link, or select a platform and enter its @handle.'); };
  if (typeof value !== 'string' || !value.trim() || value.length > 512 || /[\s\\\u0000-\u001f\u007f]/u.test(value.trim())) return fail();
  const text = value.trim();
  // A dotted username is valid; a URL must have a scheme, slash, or known hostname.
  const urlLike = /[:/]/.test(text) || /^(?:www\.|(?:m\.)?(?:youtube|instagram|tiktok)\.com|youtu\.be)/i.test(text);
  let platform = selected;
  let identifier = text.replace(/^@/, '');
  let kind: 'handle' | 'channelId' | 'username' | 'videoId' = 'handle';
  if (urlLike) {
    let url: URL;
    try { url = new URL(/^https?:\/\//i.test(text) ? text : `https://${text}`); } catch { return fail(); }
    if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || url.port || !hosts[url.hostname.toLowerCase()]) return fail();
    platform = hosts[url.hostname.toLowerCase()];
    if (selected && platform !== selected) return fail();
    let parts: string[];
    try { parts = decodeURIComponent(url.pathname).replace(/\/$/, '').split('/').slice(1); } catch { return fail(); }
    if (platform === 'instagram') {
      if (parts.length !== 1 || /^(p|reel|reels|stories|explore|accounts|direct|about|developer|legal)$/i.test(parts[0])) return fail();
      identifier = parts[0];
    } else if (platform === 'tiktok') {
      if (parts.length !== 1 || !parts[0].startsWith('@')) return fail();
      identifier = parts[0].slice(1);
    } else {
      if (url.hostname === 'youtu.be') { if (parts.length !== 1) return fail(); kind = 'videoId'; identifier = parts[0]; }
      else if (parts[0] === 'watch' && parts.length === 1) { kind = 'videoId'; identifier = url.searchParams.get('v') || ''; }
      else if (parts[0] === 'shorts' && parts.length === 2) { kind = 'videoId'; identifier = parts[1]; }
      else if (['channel', 'c', 'user'].includes(parts[0]) && parts.length === 2) { kind = parts[0] === 'channel' ? 'channelId' : 'username'; identifier = parts[1]; }
      else if (parts[0]?.startsWith('@') && (parts.length === 1 || (parts.length === 2 && ['videos', 'shorts', 'featured', 'about', 'streams'].includes(parts[1])))) identifier = parts[0].slice(1);
      else return fail();
    }
  }
  if (!isPlatform(platform)) return fail();
  if (platform === 'instagram' && !/^[a-zA-Z0-9_](?:[a-zA-Z0-9_.]{0,28}[a-zA-Z0-9_])?$/.test(identifier)) return fail();
  if (platform === 'instagram' && identifier.includes('..')) return fail();
  if (platform === 'tiktok' && !/^[a-zA-Z0-9_][a-zA-Z0-9_.]{0,22}[a-zA-Z0-9_]$/.test(identifier)) return fail();
  if (platform === 'youtube') {
    if (/^UC[A-Za-z0-9_-]{22}$/.test(identifier) && kind === 'handle' && !text.startsWith('@')) kind = 'channelId';
    if (kind === 'channelId' ? !/^UC[A-Za-z0-9_-]{22}$/.test(identifier) : kind === 'videoId' ? !/^[A-Za-z0-9_-]{11}$/.test(identifier) : !/^[\p{L}\p{M}\p{N}_.\-·]{1,100}$/u.test(identifier)) return fail();
  } else identifier = identifier.toLowerCase();
  const canonical = platform === 'instagram' ? `https://www.instagram.com/${identifier}/` : platform === 'tiktok' ? `https://www.tiktok.com/@${identifier}` : kind === 'videoId' ? `https://www.youtube.com/watch?v=${identifier}` : kind === 'channelId' ? `https://www.youtube.com/channel/${identifier}` : kind === 'username' ? `https://www.youtube.com/user/${identifier}` : `https://www.youtube.com/@${identifier}`;
  return { platform, identifier, kind, canonical, key: `${platform}:${kind}:${identifier.toLowerCase()}` };
}
