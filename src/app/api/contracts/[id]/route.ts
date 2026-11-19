import { NextResponse } from "next/server";
import { getAuthUser, contractAccessFilter } from "@/lib/auth-user";
import { prisma } from "@/lib/prisma";
import { ContractStatus } from "@prisma/client";

const editableFields = new Set([
  "contractType", "jurisdictionCountryCode", "currency", "totalAmount", "advancePayment",
  "advancePaymentDate", "remainingPaymentDate", "paymentMethod", "paymentRoutingDetails",
  "bankAccountIban", "mobileWalletNumber", "taxTreatment", "taxRatePct", "taxAmount", "isReverseCharge",
  "deliveryTimeframeDays", "platformsAllowed", "usageType", "usageRightsDuration", "revisionRounds",
  "revisionTurnaroundDays", "brandApprovalRequired", "exclusivityClause", "exclusivityDuration",
  "exclusivityCompetitors", "confidentialityRequired", "embargoDate", "earlyDisclosurePenalty",
  "latePaymentPenaltyPct", "lateContentPenaltyPct", "penaltyCapPct", "unauthorizedUsagePenaltyPct",
  "advanceRefundable", "advanceRefundTimeframeDays", "nonDeliveryCutoffDays", "cancellationFeePct",
  "contentOwnership", "taggingRequirements", "additionalNotes", "collabDetails", "brandName",
  "brandHandle", "campaignName", "creatorName", "creatorHandle", "collabProduct", "collabProductProvisionType",
  "collabDeliveryAddress", "collabDeliveryDate", "collabProductReturnDays", "collabProductReturnAddress",
  "collabProductReturnShippingBy", "collabProductNonReturnFee",
]);

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const contract = await prisma.contract.findFirst({
      where: { id, ...contractAccessFilter(authUser.id) },
      include: {
        deliverables: true,
        signatures: true,
        initiator: true,
        respondent: true,
      },
    });

    if (!contract) {
      return NextResponse.json({ error: "Contract not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      contract,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();

    // Verify contract is still in draft state before edits
    const currentContract = await prisma.contract.findUnique({
      where: { id, initiatorId: authUser.id },
    });

    if (!currentContract) {
      return NextResponse.json({ error: "Contract not found" }, { status: 404 });
    }

    if (currentContract.status !== ContractStatus.DRAFT) {
      return NextResponse.json({ error: "Only draft agreements can be updated" }, { status: 400 });
    }

    const { deliverables } = body;
    const updateData = Object.fromEntries(Object.entries(body).filter(([key]) => editableFields.has(key)));

    // Execute update transactions
    const contract = await prisma.contract.update({
      where: { id, initiatorId: authUser.id },
      data: {
        ...updateData,
        advancePaymentDate: typeof updateData.advancePaymentDate === "string" ? new Date(updateData.advancePaymentDate) : undefined,
        remainingPaymentDate: typeof updateData.remainingPaymentDate === "string" ? new Date(updateData.remainingPaymentDate) : undefined,
        collabDeliveryDate: typeof updateData.collabDeliveryDate === "string" ? new Date(updateData.collabDeliveryDate) : undefined,
        collabProductProvisionType: updateData.collabProductProvisionType || undefined,
        remainingAmount: Number(updateData.totalAmount ?? currentContract.totalAmount) - Number(updateData.advancePayment ?? currentContract.advancePayment ?? 0),
        deliverables: deliverables ? {
          deleteMany: {},
          create: deliverables.map((d: any) => ({
            type: d.type,
            quantity: d.quantity,
            duration: d.duration || undefined,
            notes: d.notes || undefined,
          })),
        } : undefined,
      },
      include: {
        deliverables: true,
      },
    });

    return NextResponse.json({
      success: true,
      contract,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const contract = await prisma.contract.findUnique({
      where: { id, initiatorId: authUser.id },
    });

    if (!contract) {
      return NextResponse.json({ error: "Contract not found" }, { status: 404 });
    }

    if (contract.status !== ContractStatus.DRAFT) {
      return NextResponse.json({ error: "Only draft agreements can be cancelled" }, { status: 400 });
    }

    await prisma.contract.update({
      where: { id, initiatorId: authUser.id },
      data: { status: ContractStatus.CANCELLED },
    });

    return NextResponse.json({
      success: true,
      message: "Contract status changed to CANCELLED",
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
