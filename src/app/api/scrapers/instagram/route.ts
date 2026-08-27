import { NextRequest, NextResponse } from 'next/server';
import {
  scrapeInstagram,
  getRecentInstagramSnapshot,
  insertNewInstagramSnapshot,
} from '@/lib/scrapers/instagram';
import { ScraperResponse, InstagramScraperData } from '@/lib/scrapers/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const url = body?.url;
    const forceRefresh = Boolean(body?.forceRefresh);
    const fastMode = Boolean(body?.fastMode);

    if (!url || typeof url !== 'string' || !url.trim()) {
      return NextResponse.json<ScraperResponse>(
        {
          success: false,
          error: 'Missing required "url" parameter. Please provide an Instagram username or profile link (e.g. @mkbhd).',
        },
        { status: 400 }
      );
    }

    const trimmedUrl = url.trim();

    // 1. Check 24-Hour Smart Cache in Database
    if (!forceRefresh) {
      const cachedSnapshot = await getRecentInstagramSnapshot(trimmedUrl);
      if (cachedSnapshot) {
        console.log(`[Instagram API Route] ⚡ 24h Cache Hit for "${trimmedUrl}" (Age: ${cachedSnapshot.cacheAgeHours}h) - 0 credits spent`);
        return NextResponse.json<ScraperResponse<InstagramScraperData>>({
          success: true,
          data: cachedSnapshot,
        });
      }
    }

    // 2. Fetch fresh live data via Bright Data
    if (fastMode) {
      console.log(`[Instagram API Route] 📡 Fetching Stage 1 (Profile & Posts fastMode) for "${trimmedUrl}"...`);
      const stage1Data = await scrapeInstagram(trimmedUrl, { fastMode: true });
      return NextResponse.json<ScraperResponse<InstagramScraperData>>({
        success: true,
        data: stage1Data,
      });
    }

    console.log(`[Instagram API Route] 📡 Cache expired or not found. Fetching full live Instagram data for "${trimmedUrl}"...`);
    const liveData = await scrapeInstagram(trimmedUrl);

    // 3. Store Brand New Snapshot Row into PostgreSQL Table (Preserving historical rows)
    const savedSnapshot = await insertNewInstagramSnapshot(liveData);

    return NextResponse.json<ScraperResponse<InstagramScraperData>>({
      success: true,
      data: savedSnapshot,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred while scraping Instagram.';
    console.error('Instagram Scraper Route Error:', error);

    // Fallback: Check if we have an older snapshot in database
    try {
      const body = await req.json().catch(() => ({}));
      if (body?.url) {
        const fallback = await getRecentInstagramSnapshot(body.url, 999999);
        if (fallback) {
          console.log('[Instagram Route] Serving older database record as fallback');
          return NextResponse.json<ScraperResponse<InstagramScraperData>>({
            success: true,
            data: fallback,
          });
        }
      }
    } catch {
      // Ignore fallback error
    }

    return NextResponse.json<ScraperResponse>(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get('url') || searchParams.get('username') || searchParams.get('handle');
  const forceRefresh = searchParams.get('refresh') === 'true';

  if (!url) {
    return NextResponse.json<ScraperResponse>(
      {
        success: false,
        error: 'Missing "url" or "username" query parameter. Example: /api/scrapers/instagram?username=mkbhd',
      },
      { status: 400 }
    );
  }

  try {
    if (!forceRefresh) {
      const cached = await getRecentInstagramSnapshot(url);
      if (cached) {
        return NextResponse.json<ScraperResponse<InstagramScraperData>>({
          success: true,
          data: cached,
        });
      }
    }

    const liveData = await scrapeInstagram(url);
    const savedSnapshot = await insertNewInstagramSnapshot(liveData);

    return NextResponse.json<ScraperResponse<InstagramScraperData>>({
      success: true,
      data: savedSnapshot,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    return NextResponse.json<ScraperResponse>(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}
