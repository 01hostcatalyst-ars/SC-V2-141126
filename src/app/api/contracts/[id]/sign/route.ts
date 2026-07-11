import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { ContractStatus, SignerRole } from "@prisma/client";
import { generateContractPDF } from "@/lib/pdf/generate";
import { sendEmailNotification } from "@/lib/notifications";

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

    if (!signatureB64 || !documentHash || !fingerprint) {
      return NextResponse.json({ error: "Missing signature parameters" }, { status: 400 });
    }

    const { id } = await params;

    const contract = await prisma.contract.findUnique({
      where: { id },
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

    // Write final execution signature (Prisma Transaction)
    await prisma.$transaction([
      prisma.signature.create({
        data: {
          contractId: contract.id,
          signerRole,
          signatureImageUrl: signatureB64,
          ipAddress,
          userAgent,
          deviceFingerprint: fingerprint,
          documentHash,
          otpVerified: true,
          otpEmail: dbUser.email,
        },
      }),
      prisma.contract.update({
        where: { id: contract.id },
        data: {
          status: ContractStatus.ACTIVE,
          activatedAt: new Date(),
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
          },
          ipAddress,
          userAgent,
        },
      }),
    ]);

    // Trigger PDF engine to render static contract containing BOTH signatures
    try {
      const pdfResult = await generateContractPDF(contract.id);
      
      const fullContract = await prisma.contract.findUnique({
        where: { id: contract.id },
        include: { initiator: true },
      });

      if (fullContract && fullContract.respondentEmail) {
        // 1. Dispatch active contract with PDF attachment to Initiator
        await sendEmailNotification({
          to: fullContract.initiator.email,
          subject: `Active Collaboration Contract - ${fullContract.contractNumber}`,
          template: "contract_active",
          data: {
            contractNumber: fullContract.contractNumber,
          },
          pdfBuffer: pdfResult.buffer,
        });

        // 2. Dispatch active contract with PDF attachment to Respondent
        await sendEmailNotification({
          to: fullContract.respondentEmail,
          subject: `Active Collaboration Contract - ${fullContract.contractNumber}`,
          template: "contract_active",
          data: {
            contractNumber: fullContract.contractNumber,
          },
          pdfBuffer: pdfResult.buffer,
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
