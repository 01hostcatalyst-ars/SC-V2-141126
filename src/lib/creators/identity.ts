import { prisma } from '@/lib/prisma';
import { Platform } from '@/lib/calculator/types';

export interface CreatorIdentityClusterRecord {
  id: string;
  canonicalName: string;
  primaryNicheId?: number | null;
  countryCode?: string | null;
  accounts: {
    youtube?: string;
    instagram?: string;
    tiktok?: string;
  };
}

/**
 * Normalizes any URL, channel path, or handle into a clean, lowercase identifier
 */
export function normalizePlatformHandle(rawInput: string): string {
  if (!rawInput) return '';
  let clean = rawInput.trim().toLowerCase();

  // Strip query strings and hashes
  clean = clean.split('?')[0].split('#')[0];

  // Strip YouTube URLs
  clean = clean.replace(/^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:@|c\/|user\/|channel\/)?|youtu\.be\/)/i, '');
  
  // Strip Instagram URLs
  clean = clean.replace(/^(?:https?:\/\/)?(?:www\.)?(?:instagram\.com\/)/i, '');

  // Strip TikTok URLs
  clean = clean.replace(/^(?:https?:\/\/)?(?:www\.)?(?:tiktok\.com\/@?)/i, '');

  // Strip leading '@' and trailing slashes
  clean = clean.replace(/^@+/, '').replace(/\/+$/, '').trim();

  return clean;
}

/**
 * Resolves a creator identity cluster across YouTube, Instagram, and TikTok
 */
export async function resolveCreatorIdentity(
  rawQuery: string,
  platformHint?: Platform
): Promise<CreatorIdentityClusterRecord | null> {
  const clean = normalizePlatformHandle(rawQuery);
  if (!clean) return null;

  try {
    // 1. Direct query on CreatorIdentityCluster table
    const cluster = await prisma.creatorIdentityCluster.findFirst({
      where: {
        OR: [
          { youtubeHandle: clean },
          { instagramUsername: clean },
          { tiktokUsername: clean },
        ],
      },
    });

    if (cluster) {
      return {
        id: cluster.id,
        canonicalName: cluster.canonicalName,
        primaryNicheId: cluster.primaryNicheId,
        countryCode: cluster.countryCode,
        accounts: {
          youtube: cluster.youtubeHandle || undefined,
          instagram: cluster.instagramUsername || undefined,
          tiktok: cluster.tiktokUsername || undefined,
        },
      };
    }

    // 2. Fallback heuristic: Check recent CreatorIntelligence records
    const recentIntel = await prisma.creatorIntelligence.findFirst({
      where: {
        OR: [
          { creatorHandle: clean },
          { creatorHandle: `@${clean}` },
        ],
      },
      orderBy: { createdAt: 'desc' },
    });

    if (recentIntel) {
      const raw: any = recentIntel.rawLlmResponse;
      const ytHandle = normalizePlatformHandle(raw?.youtube?.handle || '');
      const igHandle = normalizePlatformHandle(raw?.instagram?.username || '');
      const ttHandle = normalizePlatformHandle(raw?.tiktok?.username || '');

      if (ytHandle || igHandle || ttHandle) {
        // Auto-heal by creating the cluster
        const saved = await upsertCreatorIdentityCluster({
          canonicalName: recentIntel.creatorName || clean,
          youtubeHandle: ytHandle || (platformHint === 'youtube' ? clean : undefined),
          instagramUsername: igHandle || (platformHint === 'instagram' ? clean : undefined),
          tiktokUsername: ttHandle || (platformHint === 'tiktok' ? clean : undefined),
          countryCode: recentIntel.countryCode || undefined,
          primaryNicheId: recentIntel.primaryNicheId || undefined,
        });
        return saved;
      }
    }

    // 3. Fallback heuristic: Check YouTubeScrape external links for Instagram/TikTok
    const ytScrape = await prisma.youTubeScrape.findFirst({
      where: {
        OR: [
          { handle: clean },
          { handle: `@${clean}` },
        ],
      },
      orderBy: { createdAt: 'desc' },
    });

    if (ytScrape) {
      let igHandle: string | undefined;
      let ttHandle: string | undefined;

      const links = Array.isArray(ytScrape.externalLinks) ? (ytScrape.externalLinks as any[]) : [];
      for (const l of links) {
        const u = String(l?.url || '');
        if (u.includes('instagram.com')) {
          igHandle = normalizePlatformHandle(u);
        } else if (u.includes('tiktok.com')) {
          ttHandle = normalizePlatformHandle(u);
        }
      }

      if (igHandle || ttHandle) {
        const saved = await upsertCreatorIdentityCluster({
          canonicalName: ytScrape.title || clean,
          youtubeHandle: clean,
          instagramUsername: igHandle,
          tiktokUsername: ttHandle,
          countryCode: ytScrape.country || undefined,
        });
        return saved;
      }
    }
  } catch (err) {
    console.warn('[CreatorIdentity Resolution Error]:', err);
  }

  return null;
}

/**
 * Generates a clean URL slug from creator name, brand, or handle
 */
export function generateCreatorSlug(nameOrBrand: string, fallbackHandle?: string): string {
  const input = (nameOrBrand || fallbackHandle || 'creator').toLowerCase().trim();
  const clean = input
    .replace(/^@+/, '')
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');

  return clean || 'creator';
}

export const EXCLUDED_CORPORATE_BRANDS = new Set([
  'realmadrid',
  'real-madrid',
  'adidas',
  'lamborghini',
  'lamborghani',
  'redbullracing',
  'oracle-red-bull-racing',
  'bugatti',
  'netflixjr',
  'netflix-jr',
  'spotify',
]);

export function isExcludedBrand(handleOrName?: string | null): boolean {
  if (!handleOrName) return false;
  const clean = handleOrName.toLowerCase().replace(/^@+/, '').replace(/\s+/g, '-').trim();
  const raw = handleOrName.toLowerCase().replace(/^@+/, '').replace(/[\s-_.]/g, '').trim();
  return EXCLUDED_CORPORATE_BRANDS.has(clean) || EXCLUDED_CORPORATE_BRANDS.has(raw);
}

/**
 * Upserts a CreatorIdentityCluster, seamlessly merging handles if any already exist
 */
export async function upsertCreatorIdentityCluster(params: {
  canonicalName?: string;
  brandName?: string;
  slug?: string;
  youtubeHandle?: string;
  instagramUsername?: string;
  tiktokUsername?: string;
  primaryNicheId?: number;
  primaryNicheName?: string;
  countryCode?: string;
  combinedFollowers?: bigint | number;
  primaryPlatform?: string;
  avatarUrl?: string;
  verifiedEmail?: string;
  typicalRateMinUsd?: number;
  typicalRateMaxUsd?: number;
  avgEngagementRate?: number;
}): Promise<CreatorIdentityClusterRecord> {
  const yt = params.youtubeHandle ? normalizePlatformHandle(params.youtubeHandle) : undefined;
  const ig = params.instagramUsername ? normalizePlatformHandle(params.instagramUsername) : undefined;
  const tt = params.tiktokUsername ? normalizePlatformHandle(params.tiktokUsername) : undefined;

  // Prevent corporate brands/companies from being saved as individual creators
  if (
    isExcludedBrand(params.canonicalName) ||
    isExcludedBrand(params.brandName) ||
    isExcludedBrand(yt) ||
    isExcludedBrand(ig) ||
    isExcludedBrand(tt) ||
    isExcludedBrand(params.slug)
  ) {
    return null as any;
  }

  const conditions: Array<Record<string, string>> = [];
  if (yt) conditions.push({ youtubeHandle: yt });
  if (ig) conditions.push({ instagramUsername: ig });
  if (tt) conditions.push({ tiktokUsername: tt });

  let existing = null;
  if (conditions.length > 0) {
    existing = await prisma.creatorIdentityCluster.findFirst({
      where: { OR: conditions },
    });
  }

  const finalName = params.canonicalName?.trim() || existing?.canonicalName || yt || ig || tt || 'Creator';
  const finalBrand = params.brandName?.trim() || existing?.brandName || finalName;
  const targetSlug = params.slug || existing?.slug || generateCreatorSlug(finalBrand, yt || ig || tt);

  // Ensure slug uniqueness if creating or if slug changed
  let uniqueSlug = targetSlug;
  if (!existing || !existing.slug) {
    const slugCollision = await prisma.creatorIdentityCluster.findFirst({
      where: { slug: uniqueSlug },
    });
    if (slugCollision && slugCollision.id !== existing?.id) {
      const suffix = yt || ig || tt || params.countryCode?.toLowerCase() || Math.floor(Math.random() * 1000).toString();
      uniqueSlug = `${targetSlug}-${suffix}`;
    }
  }

  const combinedFollowersBigInt = params.combinedFollowers !== undefined
    ? BigInt(params.combinedFollowers)
    : existing?.combinedFollowers || BigInt(0);

  if (existing) {
    const updated = await prisma.creatorIdentityCluster.update({
      where: { id: existing.id },
      data: {
        canonicalName: finalName,
        brandName: finalBrand,
        slug: existing.slug || uniqueSlug,
        youtubeHandle: yt || existing.youtubeHandle,
        instagramUsername: ig || existing.instagramUsername,
        tiktokUsername: tt || existing.tiktokUsername,
        primaryNicheId: params.primaryNicheId || existing.primaryNicheId,
        primaryNicheName: params.primaryNicheName || existing.primaryNicheName,
        countryCode: params.countryCode || existing.countryCode,
        combinedFollowers: combinedFollowersBigInt,
        primaryPlatform: params.primaryPlatform || existing.primaryPlatform,
        avatarUrl: params.avatarUrl || existing.avatarUrl,
        verifiedEmail: params.verifiedEmail || existing.verifiedEmail,
        typicalRateMinUsd: params.typicalRateMinUsd !== undefined ? params.typicalRateMinUsd : existing.typicalRateMinUsd,
        typicalRateMaxUsd: params.typicalRateMaxUsd !== undefined ? params.typicalRateMaxUsd : existing.typicalRateMaxUsd,
        avgEngagementRate: params.avgEngagementRate !== undefined ? params.avgEngagementRate : existing.avgEngagementRate,
      },
    });

    return {
      id: updated.id,
      canonicalName: updated.canonicalName,
      primaryNicheId: updated.primaryNicheId,
      countryCode: updated.countryCode,
      accounts: {
        youtube: updated.youtubeHandle || undefined,
        instagram: updated.instagramUsername || undefined,
        tiktok: updated.tiktokUsername || undefined,
      },
    };
  }

  const created = await prisma.creatorIdentityCluster.create({
    data: {
      canonicalName: finalName,
      brandName: finalBrand,
      slug: uniqueSlug,
      youtubeHandle: yt,
      instagramUsername: ig,
      tiktokUsername: tt,
      primaryNicheId: params.primaryNicheId,
      primaryNicheName: params.primaryNicheName,
      countryCode: params.countryCode,
      combinedFollowers: combinedFollowersBigInt,
      primaryPlatform: params.primaryPlatform || 'youtube',
      avatarUrl: params.avatarUrl,
      verifiedEmail: params.verifiedEmail,
      typicalRateMinUsd: params.typicalRateMinUsd,
      typicalRateMaxUsd: params.typicalRateMaxUsd,
      avgEngagementRate: params.avgEngagementRate,
    },
  });

  return {
    id: created.id,
    canonicalName: created.canonicalName,
    primaryNicheId: created.primaryNicheId,
    countryCode: created.countryCode,
    accounts: {
      youtube: created.youtubeHandle || undefined,
      instagram: created.instagramUsername || undefined,
      tiktok: created.tiktokUsername || undefined,
    },
  };
}
