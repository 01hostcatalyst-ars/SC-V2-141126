import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ContractStatus, SignerRole } from "@prisma/client";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const body = await req.json();
    const signatureB64 = body.signatureB64;
    const fingerprint = body.fingerprint || "browser-fingerprint";
    const email = body.email || body.respondentEmail;
    const name = body.name || body.respondentName;
    const phone = body.phone || body.respondentPhone;
    const company = body.company || body.respondentCompany;
    const address = body.address || body.respondentAddress;
    const designation = body.designation || body.respondentDesignation;
    const ntn = body.ntn || body.respondentNtn;
    const paymentMethod = body.paymentMethod;
    const bankAccountIban = body.bankAccountIban;
    const mobileWalletNumber = body.mobileWalletNumber;
    const documentHash = body.documentHash || "SHA256_PENDING_FINAL_PDF";

    if (!signatureB64 || !email) {
      return NextResponse.json({ error: "Missing signature or email parameters" }, { status: 400 });
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
          signatureImageUrl: signatureB64,
          ipAddress,
          userAgent,
          deviceFingerprint: fingerprint,
          documentHash: contract.documentHash || documentHash,
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
