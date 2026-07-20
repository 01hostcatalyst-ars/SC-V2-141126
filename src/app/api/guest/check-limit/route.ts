import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");

    if (!email || !email.trim()) {
      return NextResponse.json({ count: 0, limit: 2, limitReached: false });
    }

    const cleanEmail = email.trim().toLowerCase();

    // 24-hour rate limit window
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const count = await prisma.contract.count({
      where: {
        initiator: {
          email: cleanEmail,
        },
        createdAt: {
          gte: twentyFourHoursAgo,
        },
      },
    });

    const limitReached = count >= 2;

    return NextResponse.json({
      email: cleanEmail,
      count,
      limit: 2,
      limitReached,
      message: limitReached
        ? "Guest limit reached (2 contracts per 24h for this email). Please change email address or log in for unlimited contracts."
        : undefined,
    });
  } catch (error) {
    console.error("[CHECK GUEST LIMIT API ERROR]", error);
    return NextResponse.json({ count: 0, limit: 2, limitReached: false });
  }
}
