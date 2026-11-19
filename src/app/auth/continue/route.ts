import { NextResponse } from "next/server";
import { getAuthUser, getGoogleIdentity } from "@/lib/auth-user";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const identity = await getGoogleIdentity();
  const target = !identity ? "/login" : await getAuthUser() ? "/dashboard" : "/onboarding";
  const response = NextResponse.redirect(new URL(target, process.env.BETTER_AUTH_URL || request.url));
  response.headers.set("Cache-Control", "no-store");
  return response;
}
