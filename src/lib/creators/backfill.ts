import { prisma } from '@/lib/prisma';
import { generateCreatorSlug, isExcludedBrand } from './identity';

export async function backfillCreatorIdentityClusters(): Promise<{
  processed: number;
  created: number;
  updated: number;
}> {
  console.log('[Backfill] Starting Creator Identity Clusters backfill...');
  let created = 0;
  let updated = 0;

  // 1. Process YouTube snapshots to seed identity clusters
  const yts = await prisma.youTubeScrape.findMany({
    orderBy: { createdAt: 'desc' },
    distinct: ['handle'],
  });

  for (const yt of yts) {
    if (!yt.handle) continue;
    if (Number(yt.subscriberCount || 0) < 5000) continue;
    const cleanYt = yt.handle.toLowerCase().trim().replace(/^@+/, '');
    if (isExcludedBrand(cleanYt) || isExcludedBrand(yt.title)) continue;

    const existing = await prisma.creatorIdentityCluster.findFirst({
      where: {
        OR: [
          { youtubeHandle: cleanYt },
          { slug: cleanYt },
        ],
      },
    });

    const displayName = yt.title || cleanYt;
    const slug = existing?.slug || generateCreatorSlug(displayName, cleanYt);
    const followers = BigInt(yt.subscriberCount || 0);

    if (existing) {
      await prisma.creatorIdentityCluster.update({
        where: { id: existing.id },
        data: {
          slug: existing.slug || slug,
          brandName: existing.brandName || displayName,
          canonicalName: existing.canonicalName || displayName,
          youtubeHandle: existing.youtubeHandle || cleanYt,
          countryCode: existing.countryCode || yt.country || undefined,
          avatarUrl: existing.avatarUrl || yt.avatarUrl || undefined,
          combinedFollowers: existing.combinedFollowers > BigInt(0) ? existing.combinedFollowers : followers,
          verifiedEmail: existing.verifiedEmail || yt.extractedEmail || undefined,
        },
      });
      updated++;
    } else {
      await prisma.creatorIdentityCluster.create({
        data: {
          slug,
          canonicalName: displayName,
          brandName: displayName,
          youtubeHandle: cleanYt,
          countryCode: yt.country || undefined,
          combinedFollowers: followers,
          primaryPlatform: 'youtube',
          avatarUrl: yt.avatarUrl || undefined,
          verifiedEmail: yt.extractedEmail || undefined,
        },
      });
      created++;
    }
  }

  // 2. Process Instagram snapshots
  const igs = await prisma.instagramScrape.findMany({
    orderBy: { createdAt: 'desc' },
    distinct: ['instagramUsername'],
  });

  for (const ig of igs) {
    if (!ig.instagramUsername) continue;
    if (Number(ig.followerCount || 0) < 5000) continue;
    const cleanIg = ig.instagramUsername.toLowerCase().trim().replace(/^@+/, '');
    if (isExcludedBrand(cleanIg) || isExcludedBrand(ig.fullName)) continue;

    const existing = await prisma.creatorIdentityCluster.findFirst({
      where: {
        OR: [
          { instagramUsername: cleanIg },
          { slug: cleanIg },
        ],
      },
    });

    const displayName = ig.fullName || cleanIg;
    const slug = existing?.slug || generateCreatorSlug(displayName, cleanIg);
    const followers = BigInt(ig.followerCount || 0);

    if (existing) {
      await prisma.creatorIdentityCluster.update({
        where: { id: existing.id },
        data: {
          slug: existing.slug || slug,
          brandName: existing.brandName || displayName,
          instagramUsername: existing.instagramUsername || cleanIg,
          avatarUrl: existing.avatarUrl || ig.avatarUrl || undefined,
          combinedFollowers: existing.combinedFollowers > BigInt(0) ? existing.combinedFollowers : followers,
        },
      });
      updated++;
    } else {
      await prisma.creatorIdentityCluster.create({
        data: {
          slug,
          canonicalName: displayName,
          brandName: displayName,
          instagramUsername: cleanIg,
          combinedFollowers: followers,
          primaryPlatform: 'instagram',
          avatarUrl: ig.avatarUrl || undefined,
        },
      });
      created++;
    }
  }

  console.log(`[Backfill] Finished! Created: ${created}, Updated: ${updated}`);
  return { processed: yts.length + igs.length, created, updated };
}
