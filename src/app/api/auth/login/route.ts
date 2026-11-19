import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({ error: "Continue with Google to sign in or create your account.", loginUrl: "/login" }, { status: 410 });
}
