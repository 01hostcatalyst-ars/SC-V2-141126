import { NextRequest, NextResponse } from 'next/server';
import { getArticleBySlug } from '@/lib/gdocs';
import { embeddedKnowledgeImage, knowledgeImageUrl } from '@/lib/knowledge-images';

export const runtime = 'nodejs';

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string; imageId: string }> }) {
  const { slug, imageId } = await params;
  const missing = () => new NextResponse(null, { status: 404, headers: { 'Cache-Control': 'no-store' } });
  if (!/^[a-z0-9_-]{1,250}$/.test(slug) || !/^(?:hero|(?:article|diagram|square)\d+)(?:-\d+)?$/.test(imageId)) return missing();
  try {
    const article = await getArticleBySlug(slug);
    const image = article?.images?.find(item => item.id === imageId);
    if (!article || !image) return missing();
    const data = embeddedKnowledgeImage(image.dataUri);
    if (!data) return missing();
    // Do not cache a newer image under an older article revision's URL.
    if (req.nextUrl.searchParams.get('v') !== article.modifiedTime) {
      return NextResponse.redirect(new URL(knowledgeImageUrl(article.slug, image.id, article.modifiedTime), req.url), { status: 307, headers: { 'Cache-Control': 'no-store' } });
    }
    return new NextResponse(new Uint8Array(data.bytes), { headers: {
      'Content-Type': data.mime,
      'Content-Length': String(data.bytes.length),
      'X-Content-Type-Options': 'nosniff',
      'Cache-Control': 'public, max-age=2592000, s-maxage=2592000, stale-while-revalidate=604800',
    } });
  } catch {
    return new NextResponse(null, { status: 503, headers: { 'Cache-Control': 'no-store', 'Retry-After': '60' } });
  }
}
