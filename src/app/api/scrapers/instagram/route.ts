import { NextRequest, NextResponse } from 'next/server';
import { scrapeInstagram, getRecentInstagramSnapshot, insertNewInstagramSnapshot } from '@/lib/scrapers/instagram';
import { parseProfileInput } from '@/lib/calculator/profile-input';
import { calculatorBody, guardCalculatorRequest, calculatorError } from '@/lib/calculator/request-guard';

export async function POST(req: NextRequest) {
 try {
  const body = await calculatorBody(req);
  const target = parseProfileInput(body.url || body.input, 'instagram');
  await guardCalculatorRequest(req);
  // Public requests always use the 24-hour cache and full scraping. Refresh is a separate controlled workflow.
  const cached = await getRecentInstagramSnapshot(target.canonical);
  if (cached) return NextResponse.json({ success: true, data: cached });
  await guardCalculatorRequest(req, true);
  const live = await scrapeInstagram(target.canonical);
  const saved = await insertNewInstagramSnapshot(live);
  return NextResponse.json({ success: true, data: saved });
 } catch (error) { return calculatorError(error); }
}

// GET is read-only: links and crawlers cannot launch paid collections.
export async function GET(req: NextRequest) {
 try {
  const params = req.nextUrl.searchParams;
  const target = parseProfileInput(params.get('url') || params.get('handle') || params.get('username') || params.get('input'), 'instagram');
  await guardCalculatorRequest(req);
  const data = await getRecentInstagramSnapshot(target.canonical);
  return NextResponse.json(data ? { success: true, data } : { success: false, error: 'No recent cached profile. Use the calculator to collect it.' }, { status: data ? 200 : 404 });
 } catch (error) { return calculatorError(error); }
}
