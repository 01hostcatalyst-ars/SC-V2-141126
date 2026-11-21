import { NextResponse } from "next/server";
import { buildSitemapIndexXml, getCreatorBatchCount } from "@/lib/seo/sitemaps";

export const dynamic = "force-dynamic";

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.signcollab.com";
  const now = new Date();

  const creatorBatches = await getCreatorBatchCount();

  const subSitemaps = [
    {
      loc: `${baseUrl}/sitemaps/static.xml`,
      lastmod: now,
    },
    {
      loc: `${baseUrl}/sitemaps/knowledge.xml`,
      lastmod: now,
    },
  ];

  for (let i = 1; i <= creatorBatches; i++) {
    subSitemaps.push({
      loc: `${baseUrl}/sitemaps/creators-${i}.xml`,
      lastmod: now,
    });
  }

  const xml = buildSitemapIndexXml(subSitemaps);

  return new NextResponse(xml, {
    status: 200,
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
