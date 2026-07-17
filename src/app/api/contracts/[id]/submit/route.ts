import { NextResponse } from "next/server";
import crypto from "crypto";
import { getAuthUser } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { ContractStatus, SignerRole } from "@prisma/client";
import { computeContentHash } from "@/lib/utils";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
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

    const { id } = await params;

    let body: any = {};
    try {
      body = await req.json();
    } catch (e) {
      // Body may be empty if called without JSON payload
    }

    const { initiatorDesignation, initiatorNtn, signatureB64, fingerprint } = body;

    const contract = await prisma.contract.findUnique({
      where: { id },
      include: {
        deliverables: true,
        initiator: true,
      },
    });

    if (!contract) {
      return NextResponse.json({ error: "Contract not found" }, { status: 404 });
    }

    if (contract.status !== ContractStatus.DRAFT) {
      return NextResponse.json({ error: "Contract is already published and active for counterparty review." }, { status: 400 });
    }

    const shareToken = contract.shareToken || crypto.randomUUID();
    const verifyToken = contract.verifyToken || `v_${crypto.randomUUID()}`;

    // Update contract metadata first
    const updatedContractData = await prisma.contract.update({
      where: { id },
      data: {
        status: ContractStatus.PENDING_RESPONDENT,
        shareToken,
        verifyToken,
        initiatorDesignation: initiatorDesignation || contract.initiatorDesignation || undefined,
        initiatorNtn: initiatorNtn || contract.initiatorNtn || undefined,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // now + 7 days
      },
      include: {
        deliverables: true,
        initiator: true,
      },
    });

    // Compute initial canonical payload hash
    const contentHash = computeContentHash(updatedContractData);

    const finalContract = await prisma.contract.update({
      where: { id },
      data: {
        contentHash,
        documentHash: contentHash,
      },
      include: {
        deliverables: true,
        initiator: true,
      },
    });

    // Determine initiator signer role from contract type
    let signerRole: SignerRole = SignerRole.AGENCY;
    if (contract.contractType.startsWith("CREATOR_")) {
      signerRole = SignerRole.CREATOR;
    } else if (contract.contractType.startsWith("BRAND_")) {
      signerRole = SignerRole.BRAND;
    }

    const ipAddress = req.headers.get("x-forwarded-for") || "127.0.0.1";
    const userAgent = req.headers.get("user-agent") || "Browser/Dashboard";

    // Record Party 1 (Initiator) verified digital signature log — matching Instant flow
    await prisma.signature.create({
      data: {
        contractId: contract.id,
        signerId: dbUser.id,
        signerRole,
        signatureImageUrl: signatureB64 || "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='50'><text x='10' y='30' font-family='Arial' font-size='18' font-weight='bold'>Initiator OTP Verified</text></svg>",
        ipAddress,
        userAgent,
        deviceFingerprint: fingerprint || undefined,
        documentHash: contentHash,
        otpVerified: true,
        otpEmail: dbUser.email,
        consentRecorded: true,
      },
    });

    // Log audit trail event
    await prisma.auditLog.create({
      data: {
        contractId: id,
        userId: contract.initiatorId,
        action: "CONTRACT_CREATED",
        details: {
          event: "Agreement Draft Published & Share Link Activated",
          shareToken,
          verifyToken,
          contentHash,
          initiatorEmail: contract.initiator.email,
          designation: initiatorDesignation || contract.initiatorDesignation,
          company: (contract.initiator as any)?.agencyName || (contract.initiator as any)?.companyName,
        },
      },
    });

    return NextResponse.json({
      success: true,
      contract: finalContract,
      shareLink: `${process.env.NEXT_PUBLIC_APP_URL || ""}/c/${shareToken}`,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
