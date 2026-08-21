import { NextRequest, NextResponse } from 'next/server';
import {
  scrapeYouTube,
  getRecentYouTubeSnapshot,
  insertNewYouTubeSnapshot,
} from '@/lib/scrapers/youtube';
import { ScraperResponse, YouTubeScraperData } from '@/lib/scrapers/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const url = body?.url;
    const forceRefresh = Boolean(body?.forceRefresh);

    if (!url || typeof url !== 'string' || !url.trim()) {
      return NextResponse.json<ScraperResponse>(
        {
          success: false,
          error: 'Missing required "url" parameter. Please provide a YouTube channel handle or link.',
        },
        { status: 400 }
      );
    }

    const trimmedUrl = url.trim();

    // 1. Check 24-Hour Smart Cache in Database (unless forceRefresh is true)
    if (!forceRefresh) {
      const cachedSnapshot = await getRecentYouTubeSnapshot(trimmedUrl);
      if (cachedSnapshot) {
        console.log(`[YouTube API Route] ⚡ 24h Cache Hit for "${trimmedUrl}" (Age: ${cachedSnapshot.cacheAgeHours}h) - 0 quota consumed`);
        return NextResponse.json<ScraperResponse<YouTubeScraperData>>({
          success: true,
          data: cachedSnapshot,
        });
      }
    }

    // 2. Fetch fresh live data from YouTube API
    console.log(`[YouTube API Route] 📡 Cache expired or not found. Fetching fresh data from YouTube for "${trimmedUrl}"...`);
    const liveData: YouTubeScraperData = await scrapeYouTube(trimmedUrl);

    // 3. Insert Brand New Snapshot Row into Database (Preserving all previous historical records)
    const savedSnapshot: YouTubeScraperData = await insertNewYouTubeSnapshot(liveData);

    return NextResponse.json<ScraperResponse<YouTubeScraperData>>({
      success: true,
      data: savedSnapshot,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    console.error('YouTube Scraper Route Error:', error);

    // Fallback: If live API fails, serve whatever latest snapshot we have regardless of age
    try {
      const body = await req.json().catch(() => ({}));
      if (body?.url) {
        const fallback = await getRecentYouTubeSnapshot(body.url, 999999); // Ignore age limit on fallback
        if (fallback) {
          console.log('[YouTube Route] Serving older database record as emergency fallback');
          return NextResponse.json<ScraperResponse<YouTubeScraperData>>({
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
  const url = searchParams.get('url') || searchParams.get('handle');
  const forceRefresh = searchParams.get('refresh') === 'true';

  if (!url) {
    return NextResponse.json<ScraperResponse>(
      {
        success: false,
        error: 'Missing "url" or "handle" query parameter. Example: /api/scrapers/youtube?url=@VideoWaliSarkar1',
      },
      { status: 400 }
    );
  }

  try {
    if (!forceRefresh) {
      const cached = await getRecentYouTubeSnapshot(url);
      if (cached) {
        return NextResponse.json<ScraperResponse<YouTubeScraperData>>({
          success: true,
          data: cached,
        });
      }
    }

    const liveData = await scrapeYouTube(url);
    const savedSnapshot = await insertNewYouTubeSnapshot(liveData);

    return NextResponse.json<ScraperResponse<YouTubeScraperData>>({
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
