import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { ContractStatus, SignerRole } from "@prisma/client";
import { computeContentHash } from "@/lib/utils";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const body = await req.json();
    const { signatureB64, documentHash, fingerprint = "browser-fingerprint", email, name, phone, company, address, designation, ntn, paymentMethod, bankAccountIban, mobileWalletNumber } = body;

    if (!signatureB64 || !email) {
      return NextResponse.json({ error: "Missing signature or email parameters" }, { status: 400 });
    }

    const { token } = await params;

    const contract = await prisma.contract.findUnique({
      where: { shareToken: token },
      include: { initiator: true, deliverables: true },
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
    } else if (contract.contractType === "BRAND_TO_AGENCY" || contract.contractType === "CREATOR_TO_AGENCY") {
      signerRole = SignerRole.AGENCY;
    }

    // Extract headers for audit log parameters
    const ipAddress = req.headers.get("x-forwarded-for") || "127.0.0.1";
    const userAgent = req.headers.get("user-agent") || "unknown";

    // Compute immutable Signing Event Hash at the exact instant of signing
    const contentHashAtSigning = computeContentHash({
      ...contract,
      respondentName: name || contract.respondentName,
      respondentEmail: email || contract.respondentEmail,
      respondentCompany: company || contract.respondentCompany,
      respondentAddress: address || contract.respondentAddress,
      respondentDesignation: designation || contract.respondentDesignation,
      respondentNtn: ntn || contract.respondentNtn,
      paymentMethod: paymentMethod || contract.paymentMethod,
      bankAccountIban: bankAccountIban || contract.bankAccountIban,
      mobileWalletNumber: mobileWalletNumber || contract.mobileWalletNumber,
    });

    const signingEventHash = crypto.createHash("sha256")
      .update(`${contentHashAtSigning}-${email}-${ipAddress}-${userAgent}-${fingerprint || ""}`)
      .digest("hex");

    // 3. Write Signature & metadata in database (Prisma Transaction)
    await prisma.$transaction([
      prisma.signature.create({
        data: {
          contractId: contract.id,
          signerRole,
          signatureImageUrl: signatureB64,
          ipAddress,
          userAgent,
          deviceFingerprint: fingerprint,
          documentHash: contract.documentHash || documentHash || "SHA256_PENDING_FINAL_PDF",
          signingEventHash,
          otpVerified: true,
          otpEmail: email,
        },
      }),
      prisma.contract.update({
        where: { id: contract.id },
        data: {
          status: ContractStatus.PENDING_INITIATOR,
          respondentName: name || contract.respondentName,
          respondentEmail: email || contract.respondentEmail,
          respondentPhone: phone || contract.respondentPhone,
          respondentCompany: company || contract.respondentCompany,
          respondentAddress: address || contract.respondentAddress,
          respondentDesignation: designation || contract.respondentDesignation,
          respondentNtn: ntn || contract.respondentNtn,
          paymentMethod: paymentMethod || contract.paymentMethod,
          bankAccountIban: bankAccountIban || contract.bankAccountIban,
          mobileWalletNumber: mobileWalletNumber || contract.mobileWalletNumber,
        },
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
