import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ContractStatus, SignerRole } from "@prisma/client";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { signatureB64, documentHash, fingerprint, email } = await req.json();

    if (!signatureB64 || !documentHash || !fingerprint || !email) {
      return NextResponse.json({ error: "Missing signature parameters" }, { status: 400 });
    }

    const { token } = await params;

    const contract = await prisma.contract.findUnique({
      where: { shareToken: token },
      include: { initiator: true },
    });

    if (!contract) {
      return NextResponse.json({ error: "Contract not found" }, { status: 404 });
    }

    if (contract.status !== ContractStatus.PENDING_RESPONDENT) {
      return NextResponse.json({ error: "Contract is not in a signable respondent state" }, { status: 400 });
    }

    // 1. Verify that the respondent has completed email OTP verification
    const verification = await prisma.otpVerification.findFirst({
      where: {
        email,
        verified: true,
      },
      orderBy: { createdAt: "desc" },
    });

    if (!verification) {
      return NextResponse.json({ error: "Email verification is required before signing" }, { status: 400 });
    }

    // 2. Map signer role based on contract direction
    let signerRole: SignerRole = SignerRole.BRAND;
    if (contract.contractType === "BRAND_TO_CREATOR" || contract.contractType === "AGENCY_TO_CREATOR") {
      signerRole = SignerRole.CREATOR;
    }

    // Extract headers for audit log parameters
    const ipAddress = req.headers.get("x-forwarded-for") || "127.0.0.1";
    const userAgent = req.headers.get("user-agent") || "unknown";

    // 3. Write Signature & metadata in database (Prisma Transaction)
    await prisma.$transaction([
      prisma.signature.create({
        data: {
          contractId: contract.id,
          signerRole,
          signatureImageUrl: signatureB64, // base64 PNG stored directly for MVP
          ipAddress,
          userAgent,
          deviceFingerprint: fingerprint,
          documentHash,
          otpVerified: true,
          otpEmail: email,
        },
      }),
      prisma.contract.update({
        where: { id: contract.id },
        data: { status: ContractStatus.PENDING_INITIATOR },
      }),
      prisma.auditLog.create({
        data: {
          contractId: contract.id,
          action: "RESPONDENT_SIGNED",
          details: {
            email,
            signerRole,
            ipAddress,
            fingerprint,
          },
          ipAddress,
          userAgent,
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: "Respondent signature logged successfully",
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
