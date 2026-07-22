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
        parties: true,
      },
    });

    if (!contract) {
      return NextResponse.json({ error: "Campaign agreement not found" }, { status: 404 });
    }

    if (contract.status === ContractStatus.DRAFT) {
      await prisma.contract.update({
        where: { id: contract.id },
        data: { status: ContractStatus.PENDING_RESPONDENT },
      });
      contract.status = ContractStatus.PENDING_RESPONDENT;
    }

    if (contract.status === ContractStatus.ACTIVE || contract.status === ContractStatus.COMPLETED) {
      return NextResponse.json({
        success: true,
        contract,
        isExecuted: true,
      });
    }

    if (contract.status !== ContractStatus.PENDING_RESPONDENT) {
      return NextResponse.json({ error: "This agreement link has expired or is no longer open for counterparty signing." }, { status: 400 });
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
      respondentNtn,
      respondentCnic,
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
        respondentNtn,
        respondentCnic,
        collabDetails,
        collabProduct: body.collabProduct || undefined,
        collabDeliveryAddress: body.collabDeliveryAddress || undefined,
        collabDeliveryDate: body.collabDeliveryDate ? new Date(body.collabDeliveryDate) : undefined,
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
