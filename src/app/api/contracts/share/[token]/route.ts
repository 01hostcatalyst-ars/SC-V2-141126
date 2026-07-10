import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ContractStatus } from "@prisma/client";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    const contract = await prisma.contract.findUnique({
      where: { shareToken: token },
      include: {
        deliverables: true,
        initiator: true,
      },
    });

    if (!contract) {
      return NextResponse.json({ error: "Campaign agreement not found" }, { status: 404 });
    }

    if (
      contract.status !== ContractStatus.PENDING_RESPONDENT &&
      contract.status !== ContractStatus.PENDING_INITIATOR &&
      contract.status !== ContractStatus.ACTIVE
    ) {
      return NextResponse.json({ error: "This agreement is not active or pending signatures" }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      contract,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    const contract = await prisma.contract.findUnique({
      where: { shareToken: token },
    });

    if (!contract) {
      return NextResponse.json({ error: "Campaign agreement not found" }, { status: 404 });
    }

    if (contract.status !== ContractStatus.PENDING_RESPONDENT) {
      return NextResponse.json({ error: "Agreement is not accepting respondent changes" }, { status: 400 });
    }

    const body = await req.json();
    const {
      respondentName,
      respondentEmail,
      respondentPhone,
      respondentCompany,
      respondentAddress,
      respondentDesignation,
      collabDetails,
      latePaymentPenaltyPct,
      lateContentPenaltyPct,
    } = body;

    const updatedContract = await prisma.contract.update({
      where: { id: contract.id },
      data: {
        respondentName,
        respondentEmail,
        respondentPhone,
        respondentCompany,
        respondentAddress,
        respondentDesignation,
        collabDetails,
        // Allow respondent to accept/adjust late penalties
        latePaymentPenaltyPct: latePaymentPenaltyPct ? parseFloat(latePaymentPenaltyPct) : undefined,
        lateContentPenaltyPct: lateContentPenaltyPct ? parseFloat(lateContentPenaltyPct) : undefined,
      },
    });

    return NextResponse.json({
      success: true,
      contract: updatedContract,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
