import { NextResponse } from "next/server";
import {
  buildUrlSetXml,
  getStaticSitemapEntries,
  getKnowledgeSitemapEntries,
  getCreatorBatchEntries,
} from "@/lib/seo/sitemaps";

export const revalidate = 3600;

export async function GET(
  _request: Request,
  props: { params: Promise<{ name: string }> }
) {
  const { name } = await props.params;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.signcollab.com";

  const cleanName = (name || "").toLowerCase().replace(/\.xml$/, "");

  if (cleanName === "static") {
    const entries = getStaticSitemapEntries(baseUrl);
    const xml = buildUrlSetXml(entries);
    return new NextResponse(xml, {
      status: 200,
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  }

  if (cleanName === "knowledge") {
    const entries = await getKnowledgeSitemapEntries(baseUrl);
    const xml = buildUrlSetXml(entries);
    return new NextResponse(xml, {
      status: 200,
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  }

  const creatorMatch = cleanName.match(/^creators-(\d+)$/);
  if (creatorMatch) {
    const batchNumber = parseInt(creatorMatch[1], 10);
    if (batchNumber < 1) {
      return new NextResponse("Invalid batch number", { status: 400 });
    }

    const { entries } = await getCreatorBatchEntries(baseUrl, batchNumber);
    if (entries.length === 0 && batchNumber > 1) {
      return new NextResponse("Batch not found", { status: 404 });
    }

    const xml = buildUrlSetXml(entries);
    return new NextResponse(xml, {
      status: 200,
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  }

  return new NextResponse("Sitemap not found", { status: 404 });
}
