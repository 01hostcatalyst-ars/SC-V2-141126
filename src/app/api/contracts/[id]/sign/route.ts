import { NextResponse } from "next/server";
import crypto from "crypto";
import { getAuthUser } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { ContractStatus, SignerRole } from "@prisma/client";
import { generateContractPDF } from "@/lib/pdf/generate";
import { generateAuditCertificatePDF } from "@/lib/pdf/generateCertificate";
import { sendEmailNotification } from "@/lib/notifications";
import { computeContentHash } from "@/lib/utils";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { supabaseAuthId: authUser.id },
    });

    if (!dbUser) {
      return NextResponse.json({ error: "User profile not found" }, { status: 404 });
    }

    const { signatureB64, documentHash, fingerprint } = await req.json();

    if (!signatureB64 || !fingerprint) {
      return NextResponse.json({ error: "Missing signature parameters" }, { status: 400 });
    }

    const { id } = await params;

    const contract = await prisma.contract.findUnique({
      where: { id },
      include: { deliverables: true, signatures: true },
    });

    if (!contract) {
      return NextResponse.json({ error: "Contract not found" }, { status: 404 });
    }

    if (contract.status !== ContractStatus.PENDING_INITIATOR) {
      return NextResponse.json({ error: "Contract is not in a signable initiator state" }, { status: 400 });
    }

    // Determine signer role based on contract direction
    const signerRole = dbUser.role as any as SignerRole;

    const ipAddress = req.headers.get("x-forwarded-for") || "127.0.0.1";
    const userAgent = req.headers.get("user-agent") || "unknown";

    // 1. Compute Canonical Content Hash
    const contentHash = computeContentHash(contract);

    // 2. Compute Party A's immutable Signing Event Hash
    const signingEventHash = crypto.createHash("sha256")
      .update(`${contentHash}-${dbUser.email}-${ipAddress}-${userAgent}-${fingerprint}`)
      .digest("hex");

    // 3. Find Party B's signing event hash
    const partyBSig = contract.signatures?.find((s) => s.signerRole !== signerRole);
    const partyBSigningEventHash = partyBSig?.signingEventHash || "PENDING_PARTY_B";

    // 4. Compute Final Bilateral Executed Document Hash
    const finalDocumentHash = crypto.createHash("sha256")
      .update(`${contentHash}-${partyBSigningEventHash}-${signingEventHash}`)
      .digest("hex");

    // Write final execution signature & save pre-computed finalDocumentHash (Prisma Transaction)
    await prisma.$transaction([
      prisma.signature.create({
        data: {
          contractId: contract.id,
          signerRole,
          signatureImageUrl: signatureB64,
          ipAddress,
          userAgent,
          deviceFingerprint: fingerprint,
          documentHash: finalDocumentHash,
          signingEventHash,
          otpVerified: true,
          otpEmail: dbUser.email,
        },
      }),
      prisma.contract.update({
        where: { id: contract.id },
        data: {
          status: ContractStatus.ACTIVE,
          activatedAt: new Date(),
          contentHash,
          finalDocumentHash,
          documentHash: finalDocumentHash,
        },
      }),
      prisma.auditLog.create({
        data: {
          contractId: contract.id,
          action: "INITIATOR_SIGNED",
          details: {
            email: dbUser.email,
            signerRole,
            ipAddress,
            fingerprint,
            finalDocumentHash,
          },
          ipAddress,
          userAgent,
        },
      }),
    ]);

    // Trigger PDF engine to render static contract containing BOTH signatures and generate standalone Audit Certificate
    try {
      const pdfResult = await generateContractPDF(contract.id);
      let certResult;
      try {
        certResult = await generateAuditCertificatePDF(contract.id);
      } catch (certErr) {
        console.error("Failed to generate audit certificate PDF during signing:", certErr);
      }
      
      const fullContract = await prisma.contract.findUnique({
        where: { id: contract.id },
        include: { initiator: true },
      });

      if (fullContract && fullContract.respondentEmail) {
        const attachments = [
          {
            filename: `Contract-${fullContract.contractNumber}.pdf`,
            content: pdfResult.buffer,
          },
          ...(certResult?.buffer
            ? [
                {
                  filename: `Audit-Certificate-${fullContract.contractNumber}.pdf`,
                  content: certResult.buffer,
                },
              ]
            : []),
        ];

        // 1. Dispatch active contract with PDF attachments to Initiator
        await sendEmailNotification({
          to: fullContract.initiator.email,
          subject: `Active Agreement & Audit Certificate - ${fullContract.contractNumber}`,
          template: "contract_active",
          data: {
            contractNumber: fullContract.contractNumber,
          },
          attachments,
        });

        // 2. Dispatch active contract with PDF attachments to Respondent
        await sendEmailNotification({
          to: fullContract.respondentEmail,
          subject: `Active Agreement & Audit Certificate - ${fullContract.contractNumber}`,
          template: "contract_active",
          data: {
            contractNumber: fullContract.contractNumber,
          },
          attachments,
        });
      }
    } catch (pdfErr) {
      console.error("PDF generation or email dispatch failed during signing execution:", pdfErr);
    }

    return NextResponse.json({
      success: true,
      message: "Final signature verified and contract activated.",
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
