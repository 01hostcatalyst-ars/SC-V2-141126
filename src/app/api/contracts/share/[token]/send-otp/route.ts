import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmailNotification } from "@/lib/notifications";
import { getCompanyConfig } from "@/lib/config";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { email, phone, name, company: respondentCompany, address, designation, collabDetails } = await req.json();

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

    const company = getCompanyConfig();

    // 3. Send actual email notification via Resend
    await sendEmailNotification({
      to: email,
      subject: `Your ${company.name} E-Sign Verification Code`,
      template: "otp",
      data: {
        code,
        email,
        phone: phone || "N/A",
        name: name || "N/A",
        company: respondentCompany || "N/A",
        address: address || "N/A",
        designation: designation || "N/A",
        collabDetails: collabDetails || "N/A",
      },
    });

    console.log(`[DEV OTP ALERT] Respondent verification code for ${email} is: ${code}`);

    return NextResponse.json({
      success: true,
      message: "Verification code dispatched successfully.",
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
