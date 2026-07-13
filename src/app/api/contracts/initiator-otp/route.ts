import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/supabase/server";
import { sendEmailNotification } from "@/lib/notifications";
import { getCompanyConfig } from "@/lib/config";

export async function POST(req: Request) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { supabaseAuthId: authUser.id },
    });

    if (!dbUser) {
      return NextResponse.json({ error: "Initiator profile not found" }, { status: 404 });
    }

    const { action, designation, ntn, code } = await req.json();
    const email = dbUser.email;

    if (action === "send") {
      if (!designation) {
        return NextResponse.json({ error: "Signing capacity / job title is required before requesting OTP." }, { status: 400 });
      }

      // Generate 6-digit random verification code
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      await prisma.otpVerification.create({
        data: {
          email,
          code: otpCode,
          expiresAt,
        },
      });

      const company = getCompanyConfig();

      // Send actual email notification
      await sendEmailNotification({
        to: email,
        subject: `Your ${company.name} Initiator E-Sign Verification Code`,
        template: "otp",
        data: {
          code: otpCode,
          email,
          phone: dbUser.phone || "N/A",
          name: dbUser.name || "Initiator",
          company: dbUser.agencyName || "N/A",
          address: dbUser.agencyAddress || "N/A",
          designation: designation || "N/A",
        },
      });

      console.log(`[DEV OTP ALERT] Initiator verification code for ${email} is: ${otpCode}`);

      return NextResponse.json({
        success: true,
        message: `Verification code sent to ${email}`,
      });
    }

    if (action === "verify") {
      if (!code || code.length !== 6) {
        return NextResponse.json({ error: "Please enter a valid 6-digit verification code" }, { status: 400 });
      }

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

      await prisma.otpVerification.update({
        where: { id: verification.id },
        data: { verified: true },
      });

      return NextResponse.json({
        success: true,
        message: "Initiator identity successfully verified",
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
