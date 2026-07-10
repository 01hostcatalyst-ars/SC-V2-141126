import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const { token } = await params;

    const contract = await prisma.contract.findUnique({
      where: { shareToken: token },
    });

    if (!contract) {
      return NextResponse.json({ error: "Campaign contract not found" }, { status: 404 });
    }

    // 1. Generate 6-digit random code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    // 2. Write OTP record in Database
    await prisma.otpVerification.create({
      data: {
        email,
        code,
        expiresAt,
      },
    });

    // TODO: Connect Resend dispatch helper in Phase 6. Print to console for local developers.
    console.log(`[DEV OTP ALERT] Respondent verification code for ${email} is: ${code}`);

    return NextResponse.json({
      success: true,
      message: "Verification code dispatched successfully.",
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
