import { NextRequest, NextResponse } from 'next/server';
import { scrapeTikTok, getRecentTikTokSnapshot, insertNewTikTokSnapshot } from '@/lib/scrapers/tiktok';
import { ScraperResponse, TikTokScraperData } from '@/lib/scrapers/types';

export const maxDuration = 60; // Allow up to 60s execution

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { input, forceRefresh } = body;

    if (!input || typeof input !== 'string') {
      return NextResponse.json<ScraperResponse>(
        {
          success: false,
          error: 'Missing or invalid input. Please provide a TikTok username or URL (e.g. @mrbeast).',
        },
        { status: 400 }
      );
    }

    console.log(`[API /api/scrapers/tiktok] Request for: "${input}" (ForceRefresh: ${Boolean(forceRefresh)})`);

    // 1. Check 24-hour PostgreSQL Cache First (if forceRefresh is not requested)
    if (!forceRefresh) {
      const cachedData = await getRecentTikTokSnapshot(input);
      if (cachedData) {
        console.log(`[API /api/scrapers/tiktok] Returning 24h cached snapshot for "${input}"`);
        return NextResponse.json<ScraperResponse<TikTokScraperData>>({
          success: true,
          data: cachedData,
        });
      }
    }

    // 2. Perform Fresh Scrape via Bright Data
    const freshData = await scrapeTikTok(input);

    // 3. Save to PostgreSQL as a new snapshot row
    let savedData: TikTokScraperData = freshData;
    try {
      savedData = await insertNewTikTokSnapshot(freshData);
    } catch (dbErr) {
      console.error('[API /api/scrapers/tiktok] Database save error (returning raw data):', dbErr);
    }

    return NextResponse.json<ScraperResponse<TikTokScraperData>>({
      success: true,
      data: savedData,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'An unexpected error occurred while scraping TikTok data.';
    console.error('[API /api/scrapers/tiktok] Error:', err);

    return NextResponse.json<ScraperResponse>(
      {
        success: false,
        error: message,
      },
      { status: 500 }
    );
  }
}
