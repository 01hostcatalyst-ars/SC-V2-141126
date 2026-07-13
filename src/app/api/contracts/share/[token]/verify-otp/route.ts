import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const body = await req.json();
    const email = body.email || body.respondentEmail;
    const code = body.code || body.otpCode;

    if (!email || !code) {
      return NextResponse.json({ error: "Email and verification code are required" }, { status: 400 });
    }

    const { token } = await params;

    const verification = await prisma.otpVerification.findFirst({
      where: {
        email,
        code,
        verified: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!verification) {
      return NextResponse.json({ error: "Invalid or expired verification code" }, { status: 400 });
    }

    // Mark code as verified
    await prisma.otpVerification.update({
      where: { id: verification.id },
      data: { verified: true },
    });

    return NextResponse.json({
      success: true,
      message: "Email identity successfully verified",
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
