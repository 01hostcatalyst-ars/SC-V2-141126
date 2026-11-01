import { NextResponse } from "next/server";
import { getHomeSpotlightCreators } from "@/lib/home/spotlight-creators";

export async function GET() {
  try {
    const creators = await getHomeSpotlightCreators();
    return NextResponse.json({ success: true, creators }, {
      headers: { "Cache-Control": "public, max-age=60, s-maxage=259200, stale-while-revalidate=86400" },
    });
  } catch {
    return NextResponse.json({ success: false, creators: [] }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
