import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const host = req.headers.get("host") || "";
    const isDevLocal =
      process.env.NODE_ENV !== "production" &&
      (host.includes("localhost") || host.includes("127.0.0.1"));

    const body = await req.json().catch(() => ({}));
    const { passkey } = body;

    const configuredKey =
      process.env.ADMIN_BATCH_INGEST_KEY ||
      process.env.ADMIN_PASSWORD ||
      "signcollab-admin-ingest-2026";

    if (isDevLocal && (!passkey || passkey === "localhost")) {
      return NextResponse.json({
        success: true,
        isLocalhost: true,
        message: "Development localhost auto-authorized.",
      });
    }

    if (passkey && passkey.trim() === configuredKey.trim()) {
      return NextResponse.json({
        success: true,
        isLocalhost: isDevLocal,
        message: "Passkey verified successfully.",
      });
    }

    return NextResponse.json(
      { success: false, error: "Invalid admin passkey." },
      { status: 401 }
    );
  } catch {
    return NextResponse.json(
      { success: false, error: "Internal server error." },
      { status: 500 }
    );
  }
}
