import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { ContractStatus, SignerRole, Role, PaymentMethod } from "@prisma/client";
import { computeContentHash } from "@/lib/utils";
import { generateContractPDF } from "@/lib/pdf/generate";
import { generateAuditCertificatePDF } from "@/lib/pdf/generateCertificate";
import { sendEmailNotification } from "@/lib/notifications";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const body = await req.json();
    const {
      signatureB64, documentHash, fingerprint = "browser-fingerprint",
      email, name, phone, company, address, designation, ntn, cnic,
      taxId, nationalId,
      collabDetails,
      paymentMethod, paymentRoutingDetails, bankAccountIban, mobileWalletNumber,
    } = body;

    if (!signatureB64 || !email) {
      return NextResponse.json({ error: "Missing signature or email parameters" }, { status: 400 });
    }

    const { token } = await params;

    const contract = await prisma.contract.findUnique({
      where: { shareToken: token },
      include: { initiator: true, deliverables: true, signatures: true },
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

    const isRespondentPayee = !(contract.contractType.startsWith("CREATOR_") || contract.contractType === "AGENCY_TO_BRAND");

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

    // Extract headers for audit log parameters
    const ipAddress = req.headers.get("x-forwarded-for") || "127.0.0.1";
    const userAgent = req.headers.get("user-agent") || "unknown";

    // Approach A (Immutable Base ContentHash Model):
    // Frozen base content hash established during contract draft/submission
    const baseContentHash = contract.contentHash || computeContentHash(contract);

    const respondentTaxIdVal = taxId || ntn || undefined;
    const respondentNationalIdVal = nationalId || cnic || undefined;

    // Compute Respondent's immutable Signing Event Hash using canonical JSON serialization
    const signingEventObj = {
      baseContentHash,
      email: cleanEmail,
      taxId: respondentTaxIdVal || "",
      nationalId: respondentNationalIdVal || "",
      paymentRoutingDetails: paymentRoutingDetails || {},
      ipAddress,
      userAgent,
      deviceFingerprint: fingerprint || "",
    };
    const signingEventHash = crypto.createHash("sha256")
      .update(JSON.stringify(signingEventObj))
      .digest("hex");

    // Check if Initiator has already signed (e.g. Instant Contract flow)
    const hasInitiatorSigned = contract.signatures?.some(
      (s) => s.signerId === contract.initiatorId || s.signerRole !== signerRole
    );
    const finalStatus = hasInitiatorSigned ? ContractStatus.ACTIVE : ContractStatus.PENDING_INITIATOR;

    // Find Party A (Initiator) signature and signing event hash
    const initiatorSig = contract.signatures?.find((s) => s.signerId === contract.initiatorId);
    const initiatorSigningEventHash = initiatorSig?.signingEventHash || "PENDING_INITIATOR";

    // Compute Final Bilateral Executed Document Hash combining both signing event hashes without mutating base content hash
    const finalDocumentHash = hasInitiatorSigned
      ? crypto.createHash("sha256")
          .update(`${baseContentHash}-${initiatorSigningEventHash}-${signingEventHash}`)
          .digest("hex")
      : undefined;

    const respondentParty = await prisma.contractParty.create({
      data: {
        contractId: contract.id,
        partyType: "RESPONDENT",
        userId: respondentUser.id,
        name: name || contract.respondentName || "Respondent",
        email: email || contract.respondentEmail || "",
        phone: phone || contract.respondentPhone || undefined,
        role: respondentUserRole,
        designation: designation || contract.respondentDesignation || undefined,
        companyName: (respondentUserRole === "AGENCY" || respondentUserRole === "BRAND") ? (company || contract.respondentCompany || undefined) : undefined,
        companyAddress: address || contract.respondentAddress || undefined,
        ntn: (respondentUserRole === "AGENCY" || respondentUserRole === "BRAND") ? (ntn || contract.respondentNtn || undefined) : undefined,
        cnic: respondentUserRole === "CREATOR" ? (cnic || contract.respondentCnic || undefined) : undefined,
        taxIdType: (respondentUserRole === "AGENCY" || respondentUserRole === "BRAND") ? "NTN" : undefined,
        taxId: (respondentUserRole === "AGENCY" || respondentUserRole === "BRAND") ? (ntn || contract.respondentNtn || undefined) : undefined,
        nationalId: respondentUserRole === "CREATOR" ? (cnic || contract.respondentCnic || undefined) : undefined,
        paymentMethod: isRespondentPayee ? (paymentMethod as any) : undefined,
        bankAccountIban: isRespondentPayee && paymentMethod === "BANK_IBAN" ? bankAccountIban : undefined,
        mobileWalletNumber: isRespondentPayee && paymentMethod !== "BANK_IBAN" ? mobileWalletNumber : undefined,
      }
    });

    // 4. Write Signature & metadata in database (Prisma Transaction)
    await prisma.$transaction([
      prisma.signature.create({
        data: {
          contractId: contract.id,
          signerId: respondentUser.id,
          signerPartyId: respondentParty.id,
          signerRole,
          signatureImageUrl: signatureB64,
          ipAddress,
          userAgent,
          deviceFingerprint: fingerprint,
          documentHash: finalDocumentHash || baseContentHash,
          signingEventHash,
          otpVerified: true,
          otpEmail: email,
          consentRecorded: true,
        },
      }),
      prisma.contract.update({
        where: { id: contract.id },
        data: {
          status: finalStatus,
          activatedAt: hasInitiatorSigned ? new Date() : undefined,
          finalDocumentHash: finalDocumentHash || undefined,
          documentHash: finalDocumentHash || baseContentHash,
          respondentId: respondentUser.id,
          respondentName: name || contract.respondentName,
          respondentEmail: email || contract.respondentEmail,
          respondentPhone: phone || contract.respondentPhone,
          respondentCompany: company || contract.respondentCompany,
          respondentAddress: address || contract.respondentAddress,
          respondentDesignation: designation || contract.respondentDesignation,
          respondentNtn: respondentTaxIdVal || contract.respondentNtn,
          respondentCnic: respondentNationalIdVal || contract.respondentCnic,
          respondentTaxId: respondentTaxIdVal || (contract as any).respondentTaxId,
          respondentNationalId: respondentNationalIdVal || (contract as any).respondentNationalId,
          collabDetails: collabDetails || contract.collabDetails,
          respondentPaymentMethod: (paymentMethod as PaymentMethod) || undefined,
          respondentPaymentRoutingDetails: paymentRoutingDetails || undefined,
          respondentBankAccountIban: paymentMethod === "BANK_IBAN" ? bankAccountIban : undefined,
          respondentMobileWalletNumber: paymentMethod !== "BANK_IBAN" ? mobileWalletNumber : undefined,
        },
      }),
      prisma.auditLog.create({
        data: {
          contractId: contract.id,
          userId: respondentUser.id,
          action: hasInitiatorSigned ? "CONTRACT_ACTIVATED" : "RESPONDENT_SIGNED",
          details: {
            email,
            signerRole,
            ipAddress,
            fingerprint,
            respondentId: respondentUser.id,
            finalStatus,
          },
          ipAddress,
          userAgent,
        },
      }),
    ]);

    // 5. If contract is now ACTIVE (both parties signed), generate PDFs and send emails to both Initiator and Respondent
    if (finalStatus === ContractStatus.ACTIVE) {
      try {
        const pdfResult = await generateContractPDF(contract.id);
        let certResult;
        try {
          certResult = await generateAuditCertificatePDF(contract.id);
        } catch (certErr) {
          console.error("Failed to generate audit certificate PDF during share sign:", certErr);
        }

        const attachments = [
          {
            filename: `Contract-${contract.contractNumber}.pdf`,
            content: pdfResult.buffer,
          },
          ...(certResult?.buffer
            ? [
                {
                  filename: `Audit-Certificate-${contract.contractNumber}.pdf`,
                  content: certResult.buffer,
                },
              ]
            : []),
        ];

        // 1. Dispatch active contract with PDF attachments to Initiator
        await sendEmailNotification({
          to: contract.initiator.email,
          subject: `Active Agreement & Audit Certificate - ${contract.contractNumber}`,
          template: "contract_active",
          data: {
            contractNumber: contract.contractNumber,
          },
          attachments,
        });

        // 2. Dispatch active contract with PDF attachments to Respondent
        await sendEmailNotification({
          to: cleanEmail,
          subject: `Active Agreement & Audit Certificate - ${contract.contractNumber}`,
          template: "contract_active",
          data: {
            contractNumber: contract.contractNumber,
          },
          attachments,
        });
      } catch (pdfErr) {
        console.error("PDF generation or email dispatch failed during share sign execution:", pdfErr);
      }
    }

    return NextResponse.json({
      success: true,
      status: finalStatus,
      message: hasInitiatorSigned
        ? "Both signatures verified and contract activated. PDFs sent via email."
        : "Respondent signature logged successfully.",
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
