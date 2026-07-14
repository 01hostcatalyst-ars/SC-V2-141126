import { NextResponse } from "next/server";
import crypto from "crypto";
import { getAuthUser } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { ContractStatus } from "@prisma/client";
import { computeContentHash } from "@/lib/utils";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    let body: any = {};
    try {
      body = await req.json();
    } catch (e) {
      // Body may be empty if called without JSON payload
    }

    const { initiatorDesignation, initiatorNtn } = body;

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
