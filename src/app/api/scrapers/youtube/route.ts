import { NextRequest, NextResponse } from 'next/server';
import { scrapeYouTube, saveYouTubeScrape } from '@/lib/scrapers/youtube';
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

    const data: YouTubeScraperData = await scrapeYouTube(url.trim());

    // Auto-save to database (upsert to youtube_scrapes table)
    await saveYouTubeScrape(data);

    return NextResponse.json<ScraperResponse<YouTubeScraperData>>({
      success: true,
      data,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    console.error('YouTube Scraper Route Error:', error);

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
    const data = await scrapeYouTube(url);
    await saveYouTubeScrape(data);
    return NextResponse.json<ScraperResponse<YouTubeScraperData>>({
      success: true,
      data,
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
