import { NextRequest, NextResponse } from 'next/server';
import { scrapeYouTube, saveAndFetchYouTubeScrape, getSavedYouTubeScrape } from '@/lib/scrapers/youtube';
import { ScraperResponse, YouTubeScraperData } from '@/lib/scrapers/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const url = body?.url;

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

    // 1. Fetch live data from YouTube
    const liveData: YouTubeScraperData = await scrapeYouTube(trimmedUrl);

    // 2. Save into Database (table: youtube_scrapes) and read back the stored record
    const databaseSavedData: YouTubeScraperData = await saveAndFetchYouTubeScrape(liveData);

    // 3. Return the verified database data to frontend
    return NextResponse.json<ScraperResponse<YouTubeScraperData>>({
      success: true,
      data: databaseSavedData,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    console.error('YouTube Scraper Route Error:', error);

    // Fallback: Check if we have this channel saved in database
    try {
      const body = await req.json().catch(() => ({}));
      if (body?.url) {
        const cached = await getSavedYouTubeScrape(body.url);
        if (cached) {
          console.log('[YouTube Route] Serving cached database record as fallback');
          return NextResponse.json<ScraperResponse<YouTubeScraperData>>({
            success: true,
            data: cached,
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
    // 1. Fetch live data
    const liveData = await scrapeYouTube(url);

    // 2. Save into Database and fetch back
    const databaseSavedData = await saveAndFetchYouTubeScrape(liveData);

    // 3. Return data from database
    return NextResponse.json<ScraperResponse<YouTubeScraperData>>({
      success: true,
      data: databaseSavedData,
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
