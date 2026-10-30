import { NextRequest, NextResponse } from "next/server";
import { completeProfileRefresh, failProfileRefresh, profileRefreshStatus, ProfileRefreshError, refreshPlatform, startProfileRefresh } from "@/lib/creators/refresh-service";
import { refreshSchemaMissing } from "@/lib/creators/refresh-records";
import { PLATFORMS } from "@/lib/creators/refresh-policy";
import type { Platform } from "@/lib/calculator/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// Each platform and synthesis is a separate request, as on Rate Radar.
export const maxDuration = 300;
type Context = { params: Promise<{ slug: string }> };
const reply = (body: unknown, status = 200) => NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });
function errorResponse(error: unknown) {
 if (error instanceof ProfileRefreshError) return reply({ success: false, code: error.code, error: error.message }, error.status);
 if (refreshSchemaMissing(error)) return reply({ success: false, code: "NOT_CONFIGURED", error: "Profile refresh is not configured yet." }, 503);
 console.error("[Profile refresh]", error instanceof Error ? error.message : "Unexpected failure");
 return reply({ success: false, code: "REFRESH_FAILED", error: "The refresh could not finish. Please try again." }, 503);
}
export async function GET(_request: NextRequest, context: Context) {
 try { return reply({ success: true, ...await profileRefreshStatus((await context.params).slug) }); }
 catch (error) { return errorResponse(error); }
}
export async function POST(request: NextRequest, context: Context) {
 const slug = (await context.params).slug;
 let id = "", token = "", action = "";
 try {
  const origin = request.headers.get("origin");
  if (!origin || origin !== request.nextUrl.origin) return reply({ success: false, error: "Refresh requests must come from this site." }, 403);
  if (Number(request.headers.get("content-length") || 0) > 4096) return reply({ success: false, error: "Request too large." }, 413);
  const body = await request.json();
  action = body.action;
  if (action === "start") return reply({ success: true, ...await startProfileRefresh(slug) });
  id = typeof body.id === "string" ? body.id : "";
  token = typeof body.token === "string" ? body.token : "";
  if (!id || id.length > 100 || !/^[a-f0-9]{64}$/.test(token)) return reply({ success: false, error: "Invalid refresh session." }, 400);
  if (action === "platform" && PLATFORMS.includes(body.platform)) return reply({ success: true, ...await refreshPlatform(slug, id, token, body.platform as Platform) });
  if (action === "complete") return reply(await completeProfileRefresh(slug, id, token));
  if (action === "fail") return reply(await failProfileRefresh(slug, id, token));
  return reply({ success: false, error: "Invalid refresh action." }, 400);
 } catch (error) {
  if (action === "complete" && id && token && !(error instanceof ProfileRefreshError && ["ANALYZING", "INVALID_TOKEN", "NOT_FOUND"].includes(error.code))) {
   await failProfileRefresh(slug, id, token).catch(() => undefined);
  }
  return errorResponse(error);
 }
}
