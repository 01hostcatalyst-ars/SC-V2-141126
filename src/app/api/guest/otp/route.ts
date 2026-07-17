import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmailNotification } from "@/lib/notifications";
import { getCompanyConfig } from "@/lib/config";

export async function POST(req: Request) {
  try {
    const {
      action,
      email,
      name,
      phone,
      designation,
      companyName,
      companyAddress,
      ntn,
      cnic,
      role,
      contractType,
      brandName,
      brandHandle,
      campaignName,
      creatorName,
      creatorHandle,
      signatureB64,
      code,
    } = await req.json();

    if (!email || !email.trim()) {
      return NextResponse.json({ error: "Initiator email is required before requesting OTP." }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();

    if (action === "send") {
      if (!name || !name.trim()) {
        return NextResponse.json({ error: "Your Full Name is required before requesting OTP." }, { status: 400 });
      }

      if (!designation || !designation.trim()) {
        return NextResponse.json({ error: "Job Title / Capacity is required before requesting OTP." }, { status: 400 });
      }

      if (!signatureB64) {
        return NextResponse.json({ error: "Please draw and apply your Digital Signature before requesting OTP." }, { status: 400 });
      }

      // Generate 6-digit random verification code
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      await prisma.otpVerification.create({
        data: {
          email: cleanEmail,
          code: otpCode,
          expiresAt,
        },
      });

      const company = getCompanyConfig();

      // Send actual email notification with full initiator payload + signature
      await sendEmailNotification({
        to: cleanEmail,
        subject: `Your ${company.name} Initiator E-Sign Verification Code`,
        template: "otp",
        data: {
          code: otpCode,
          email: cleanEmail,
          phone: phone?.trim() || "N/A",
          name: name.trim(),
          designation: designation.trim(),
          companyName: companyName?.trim() || "N/A",
          companyAddress: companyAddress?.trim() || "N/A",
          ntn: ntn?.trim() || "N/A",
          cnic: cnic?.trim() || "N/A",
          role: role || "N/A",
          contractType: contractType || "N/A",
          brandName: brandName?.trim() || "N/A",
          brandHandle: brandHandle?.trim() || "N/A",
          campaignName: campaignName?.trim() || "N/A",
          creatorName: creatorName?.trim() || "N/A",
          creatorHandle: creatorHandle?.trim() || "N/A",
          signatureB64: signatureB64 || "",
        },
      });

      console.log(`[GUEST OTP ALERT] Initiator verification code for ${cleanEmail} is: ${otpCode}`);

      return NextResponse.json({
        success: true,
        message: `Verification code sent to ${cleanEmail}`,
      });
    }

    if (action === "verify") {
      if (!code || code.length !== 6) {
        return NextResponse.json({ error: "Please enter a valid 6-digit verification code" }, { status: 400 });
      }

      const verification = await prisma.otpVerification.findFirst({
        where: {
          email: cleanEmail,
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
        message: "Initiator identity successfully verified!",
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
