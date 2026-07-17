import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { ContractStatus, SignerRole, Role } from "@prisma/client";
import { computeContentHash } from "@/lib/utils";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const body = await req.json();
    const {
      signatureB64, documentHash, fingerprint = "browser-fingerprint",
      email, name, phone, company, address, designation, ntn, cnic,
      collabDetails,
      paymentMethod, bankAccountIban, mobileWalletNumber,
    } = body;

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
    let respondentUserRole: Role = Role.BRAND;
    if (contract.contractType === "BRAND_TO_CREATOR" || contract.contractType === "AGENCY_TO_CREATOR") {
      signerRole = SignerRole.CREATOR;
      respondentUserRole = Role.CREATOR;
    } else if (contract.contractType === "BRAND_TO_AGENCY" || contract.contractType === "CREATOR_TO_AGENCY") {
      signerRole = SignerRole.AGENCY;
      respondentUserRole = Role.AGENCY;
    }

    // 3. Find or create respondent User record and link to contract
    const cleanEmail = email.trim().toLowerCase();
    let respondentUser = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (!respondentUser) {
      respondentUser = await prisma.user.create({
        data: {
          name: name || "Respondent",
          email: cleanEmail,
          phone: phone || undefined,
          role: respondentUserRole,
          agencyName: (signerRole === SignerRole.AGENCY || signerRole === SignerRole.BRAND) ? company : undefined,
          agencyAddress: (signerRole === SignerRole.AGENCY || signerRole === SignerRole.BRAND) ? address : undefined,
        },
      });
    }

    // Determine if respondent is a business entity (Brand/Agency) or individual (Creator)
    const isRespondentBusiness = signerRole === SignerRole.BRAND || signerRole === SignerRole.AGENCY;

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
      respondentNtn: isRespondentBusiness ? (ntn || contract.respondentNtn) : contract.respondentNtn,
      respondentCnic: !isRespondentBusiness ? (cnic || ntn) : undefined,
    });

    const signingEventHash = crypto.createHash("sha256")
      .update(`${contentHashAtSigning}-${email}-${ipAddress}-${userAgent}-${fingerprint || ""}`)
      .digest("hex");

    // 4. Write Signature & metadata in database (Prisma Transaction)
    // Store respondent payout in SEPARATE fields — never overwrite initiator payment details
    await prisma.$transaction([
      prisma.signature.create({
        data: {
          contractId: contract.id,
          signerId: respondentUser.id,
          signerRole,
          signatureImageUrl: signatureB64,
          ipAddress,
          userAgent,
          deviceFingerprint: fingerprint,
          documentHash: contract.documentHash || documentHash || "SHA256_PENDING_FINAL_PDF",
          signingEventHash,
          otpVerified: true,
          otpEmail: email,
          consentRecorded: true,
        },
      }),
      prisma.contract.update({
        where: { id: contract.id },
        data: {
          status: ContractStatus.PENDING_INITIATOR,
          respondentId: respondentUser.id,
          respondentName: name || contract.respondentName,
          respondentEmail: email || contract.respondentEmail,
          respondentPhone: phone || contract.respondentPhone,
          respondentCompany: company || contract.respondentCompany,
          respondentAddress: address || contract.respondentAddress,
          respondentDesignation: designation || contract.respondentDesignation,
          respondentNtn: isRespondentBusiness ? (ntn || contract.respondentNtn) : contract.respondentNtn,
          respondentCnic: !isRespondentBusiness ? (cnic || ntn) : contract.respondentCnic,
          collabDetails: collabDetails || contract.collabDetails,
          // Store respondent payout details in SEPARATE fields — never overwrite initiator payment
          respondentPaymentMethod: paymentMethod || undefined,
          respondentBankAccountIban: paymentMethod === "BANK_IBAN" ? bankAccountIban : undefined,
          respondentMobileWalletNumber: paymentMethod !== "BANK_IBAN" ? mobileWalletNumber : undefined,
        },
      }),
      prisma.auditLog.create({
        data: {
          contractId: contract.id,
          userId: respondentUser.id,
          action: "RESPONDENT_SIGNED",
          details: {
            email,
            signerRole,
            ipAddress,
            fingerprint,
            respondentId: respondentUser.id,
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
