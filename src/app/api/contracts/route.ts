import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { ContractType } from "@prisma/client";

export async function POST(req: Request) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { supabaseAuthId: authUser.id },
    });

    if (!dbUser) {
      return NextResponse.json({ error: "Initiator profile not found" }, { status: 404 });
    }

    const {
      contractType,
      linkedContractId,
      brandName,
      brandHandle,
      campaignName,
      creatorName,
      creatorHandle,
      totalAmount,
      advancePayment,
      advancePaymentDate,
      remainingPaymentDate,
      paymentMethod,
      bankAccountIban,
      mobileWalletNumber,
      deliveryTimeframeDays,
      platformsAllowed,
      usageType, // Array of UsageType
      usageRightsDuration,
      revisionRounds,
      brandApprovalRequired,
      exclusivityClause,
      exclusivityDuration,
      latePaymentPenaltyPct,
      lateContentPenaltyPct,
      contentOwnership,
      taggingRequirements,
      deliverables, // Array of { type, quantity, duration, notes }
      collabProduct,
      collabProductProvisionType,
      collabDeliveryAddress,
      collabDeliveryDate,
    } = await req.json();

    if (!contractType || !totalAmount || !deliveryTimeframeDays || !deliverables || deliverables.length === 0) {
      return NextResponse.json({ error: "Missing required contract fields" }, { status: 400 });
    }

    // Generate unique human-readable contract number
    const contractNumber = `BB-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`;

    const remainingAmount = Number(totalAmount) - (Number(advancePayment) || 0);

    const contract = await prisma.contract.create({
      data: {
        contractNumber,
        contractType,
        initiatorId: dbUser.id,
        linkedContractId: contractType === ContractType.AGENCY_TO_CREATOR ? linkedContractId : undefined,
        brandName: contractType === ContractType.AGENCY_TO_CREATOR ? brandName : undefined,
        brandHandle: contractType === ContractType.AGENCY_TO_CREATOR ? brandHandle : undefined,
        campaignName: contractType === ContractType.AGENCY_TO_CREATOR ? campaignName : undefined,
        creatorName: contractType === ContractType.AGENCY_TO_BRAND ? creatorName : undefined,
        creatorHandle: contractType === ContractType.AGENCY_TO_BRAND ? creatorHandle : undefined,
        totalAmount,
        advancePayment,
        advancePaymentDate: advancePaymentDate ? new Date(advancePaymentDate) : undefined,
        remainingAmount,
        remainingPaymentDate: remainingPaymentDate ? new Date(remainingPaymentDate) : undefined,
        paymentMethod,
        bankAccountIban,
        mobileWalletNumber,
        deliveryTimeframeDays,
        platformsAllowed,
        usageType,
        usageRightsDuration,
        revisionRounds,
        brandApprovalRequired,
        exclusivityClause,
        exclusivityDuration,
        latePaymentPenaltyPct,
        lateContentPenaltyPct,
        contentOwnership,
        taggingRequirements,
        collabProduct,
        collabProductProvisionType,
        collabDeliveryAddress,
        collabDeliveryDate: collabDeliveryDate ? new Date(collabDeliveryDate) : undefined,
        deliverables: {
          create: deliverables.map((d: any) => ({
            type: d.type,
            quantity: d.quantity,
            duration: d.duration || undefined,
            notes: d.notes || undefined,
          })),
        },
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

export async function GET() {
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

    // Fetch contracts where user is initiator OR respondent
    const contracts = await prisma.contract.findMany({
      where: {
        OR: [
          { initiatorId: dbUser.id },
          { respondentId: dbUser.id },
        ],
      },
      include: {
        deliverables: true,
        initiator: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      contracts,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
