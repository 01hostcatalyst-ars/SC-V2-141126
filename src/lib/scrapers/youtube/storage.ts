import { prisma } from '@/lib/prisma';
import { YouTubeScraperData } from '../types';

/**
 * Saves or updates full scraped YouTube channel data into the single `youtube_scrapes` database table.
 */
export async function saveYouTubeScrape(data: YouTubeScraperData): Promise<void> {
  if (!data?.channel?.id) {
    console.warn('[YouTube Storage] Cannot save scrape: missing channel ID');
    return;
  }

  try {
    const channel = data.channel;

    await prisma.youTubeScrape.upsert({
      where: {
        youtubeChannelId: channel.id,
      },
      update: {
        handle: channel.handle || null,
        title: channel.title,
        customUrl: channel.customUrl || null,
        description: channel.description || null,
        country: channel.country || null,
        avatarUrl: channel.avatarUrl,
        extractedEmail: channel.extractedEmail || null,
        subscriberCount: BigInt(channel.subscriberCount || 0),
        lifetimeViewCount: BigInt(channel.lifetimeViewCount || 0),
        videoCount: channel.videoCount || 0,
        avgViewsPerVideo: BigInt(channel.avgViewsPerVideo || 0),
        externalLinks: JSON.parse(JSON.stringify(channel.externalLinks || [])),
        longVideos: JSON.parse(JSON.stringify(data.longVideos || [])),
        shortVideos: JSON.parse(JSON.stringify(data.shortVideos || [])),
        stats: JSON.parse(JSON.stringify(data.stats || {})),
        keywords: channel.keywords || [],
        topicCategories: channel.topicCategories || [],
        uploadsPlaylistId: channel.uploadsPlaylistId || null,
        rawMetadata: JSON.parse(JSON.stringify(data)),
        lastScrapedAt: new Date(),
      },
      create: {
        youtubeChannelId: channel.id,
        handle: channel.handle || null,
        title: channel.title,
        customUrl: channel.customUrl || null,
        description: channel.description || null,
        country: channel.country || null,
        avatarUrl: channel.avatarUrl,
        extractedEmail: channel.extractedEmail || null,
        subscriberCount: BigInt(channel.subscriberCount || 0),
        lifetimeViewCount: BigInt(channel.lifetimeViewCount || 0),
        videoCount: channel.videoCount || 0,
        avgViewsPerVideo: BigInt(channel.avgViewsPerVideo || 0),
        externalLinks: JSON.parse(JSON.stringify(channel.externalLinks || [])),
        longVideos: JSON.parse(JSON.stringify(data.longVideos || [])),
        shortVideos: JSON.parse(JSON.stringify(data.shortVideos || [])),
        stats: JSON.parse(JSON.stringify(data.stats || {})),
        keywords: channel.keywords || [],
        topicCategories: channel.topicCategories || [],
        uploadsPlaylistId: channel.uploadsPlaylistId || null,
        rawMetadata: JSON.parse(JSON.stringify(data)),
        lastScrapedAt: new Date(),
      },
    });

    console.log(`[YouTube Storage] Successfully saved scrape for "${channel.title}" (${channel.id}) to database.`);
  } catch (error) {
    // Log error but do not throw to prevent crashing the user-facing response
    console.error('[YouTube Storage] Error saving to database:', error);
  }
}

/**
 * Retrieves cached scrape data from database if available
 */
export async function getSavedYouTubeScrape(identifier: string) {
  const cleanId = identifier.trim().replace(/^@/, '');

  return prisma.youTubeScrape.findFirst({
    where: {
      OR: [
        { youtubeChannelId: cleanId },
        { handle: `@${cleanId}` },
        { handle: cleanId },
        { customUrl: `@${cleanId}` },
      ],
    },
  });
}
