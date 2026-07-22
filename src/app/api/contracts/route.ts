import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { ContractType, CurrencyCode, TaxTreatmentType, TaxIdType } from "@prisma/client";
import { calculateContractTax } from "@/lib/tax";

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
      jurisdictionCountryCode = "US",
      currency = "USD",
      taxTreatment = "INCLUSIVE",
      taxRatePct = 0,
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
      paymentRoutingDetails,
      bankAccountIban,
      mobileWalletNumber,
      deliveryTimeframeDays,
      platformsAllowed,
      usageType, // Array of UsageType
      usageRightsDuration,
      revisionRounds,
      revisionTurnaroundDays,
      brandApprovalRequired,
      exclusivityClause,
      exclusivityDuration,
      exclusivityCompetitors,
      confidentialityRequired,
      embargoDate,
      earlyDisclosurePenalty,
      latePaymentPenaltyPct,
      lateContentPenaltyPct,
      penaltyCapPct,
      unauthorizedUsagePenaltyPct,
      advanceRefundable,
      advanceRefundTimeframeDays,
      nonDeliveryCutoffDays,
      cancellationFeePct,
      contentOwnership,
      taggingRequirements,
      deliverables, // Array of { type, quantity, duration, notes }
      collabProduct,
      collabProductProvisionType,
      collabDeliveryAddress,
      collabDeliveryDate,
      collabProductReturnDays,
      collabProductReturnAddress,
      collabProductReturnShippingBy,
      collabProductNonReturnFee,
      initiatorName,
      initiatorDesignation,
      initiatorNtn,
      initiatorCnic,
      initiatorTaxIdType,
      initiatorTaxId,
      initiatorNationalId,
      initiatorCompanyName,
      initiatorCompanyAddress,
    } = await req.json();

    if (!contractType || !totalAmount || !deliveryTimeframeDays || !deliverables || deliverables.length === 0) {
      return NextResponse.json({ error: "Missing required contract fields" }, { status: 400 });
    }

    // Generate unique human-readable contract number
    const contractNumber = `BB-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`;

    const remainingAmount = Number(totalAmount) - (Number(advancePayment) || 0);

    const taxCalc = calculateContractTax({
      totalValuation: Number(totalAmount || 0),
      taxTreatment: (taxTreatment as any) || "INCLUSIVE",
      taxRatePct: Number(taxRatePct || 0),
    }, currency || "USD");

    const contract = await prisma.contract.create({
      data: {
        contractNumber,
        contractType,
        jurisdictionCountryCode: jurisdictionCountryCode || "US",
        currency: (currency as CurrencyCode) || CurrencyCode.USD,
        taxTreatment: (taxTreatment as TaxTreatmentType) || TaxTreatmentType.INCLUSIVE,
        taxRatePct: taxRatePct ? Number(taxRatePct) : 0,
        taxAmount: taxCalc.taxAmount,
        isReverseCharge: taxTreatment === "REVERSE_CHARGE",
        initiatorId: dbUser.id,
        linkedContractId: contractType === ContractType.AGENCY_TO_CREATOR && linkedContractId && typeof linkedContractId === "string" && linkedContractId.trim() !== "" ? linkedContractId : undefined,
        brandName: [ContractType.AGENCY_TO_CREATOR, ContractType.CREATOR_TO_BRAND, ContractType.CREATOR_TO_AGENCY].includes(contractType) ? brandName : undefined,
        brandHandle: [ContractType.AGENCY_TO_CREATOR, ContractType.CREATOR_TO_BRAND, ContractType.CREATOR_TO_AGENCY].includes(contractType) ? brandHandle : undefined,
        campaignName: [ContractType.AGENCY_TO_CREATOR, ContractType.CREATOR_TO_AGENCY, ContractType.BRAND_TO_AGENCY].includes(contractType) ? campaignName : undefined,
        creatorName: ([ContractType.AGENCY_TO_BRAND, ContractType.BRAND_TO_CREATOR, ContractType.BRAND_TO_AGENCY, ContractType.CREATOR_TO_BRAND, ContractType.CREATOR_TO_AGENCY] as string[]).includes(contractType) ? creatorName : undefined,
        creatorHandle: ([ContractType.AGENCY_TO_BRAND, ContractType.BRAND_TO_CREATOR, ContractType.BRAND_TO_AGENCY, ContractType.CREATOR_TO_BRAND, ContractType.CREATOR_TO_AGENCY] as string[]).includes(contractType) ? creatorHandle : undefined,
        initiatorDesignation: initiatorDesignation || undefined,
        initiatorNtn: initiatorNtn || initiatorTaxId || undefined,
        initiatorCnic: initiatorCnic || initiatorNationalId || undefined,
        initiatorTaxIdType: (initiatorTaxIdType as TaxIdType) || undefined,
        initiatorTaxId: initiatorTaxId || initiatorNtn || undefined,
        initiatorNationalId: initiatorNationalId || initiatorCnic || undefined,
        initiatorPhone: dbUser.phone || undefined,
        initiatorCompanyName: initiatorCompanyName || dbUser.agencyName || undefined,
        initiatorCompanyAddress: initiatorCompanyAddress || dbUser.agencyAddress || undefined,
        paymentRoutingDetails: paymentRoutingDetails || undefined,
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
        revisionTurnaroundDays: revisionTurnaroundDays ? Number(revisionTurnaroundDays) : 5,
        brandApprovalRequired,
        exclusivityClause,
        exclusivityDuration,
        exclusivityCompetitors,
        confidentialityRequired,
        embargoDate: embargoDate ? new Date(embargoDate) : undefined,
        earlyDisclosurePenalty,
        latePaymentPenaltyPct: latePaymentPenaltyPct ? Number(latePaymentPenaltyPct) : undefined,
        lateContentPenaltyPct: lateContentPenaltyPct ? Number(lateContentPenaltyPct) : undefined,
        penaltyCapPct: penaltyCapPct ? Number(penaltyCapPct) : undefined,
        unauthorizedUsagePenaltyPct: unauthorizedUsagePenaltyPct ? Number(unauthorizedUsagePenaltyPct) : undefined,
        advanceRefundable,
        advanceRefundTimeframeDays: advanceRefundTimeframeDays ? Number(advanceRefundTimeframeDays) : undefined,
        nonDeliveryCutoffDays: nonDeliveryCutoffDays ? Number(nonDeliveryCutoffDays) : undefined,
        cancellationFeePct: cancellationFeePct ? Number(cancellationFeePct) : undefined,
        contentOwnership,
        taggingRequirements,
        collabProduct,
        collabProductProvisionType,
        collabDeliveryAddress,
        collabDeliveryDate: collabDeliveryDate ? new Date(collabDeliveryDate) : undefined,
        collabProductReturnDays: collabProductReturnDays ? Number(collabProductReturnDays) : undefined,
        collabProductReturnAddress: collabProductReturnAddress || undefined,
        collabProductReturnShippingBy: collabProductReturnShippingBy || undefined,
        collabProductNonReturnFee: collabProductNonReturnFee ? Number(collabProductNonReturnFee) : undefined,
        deliverables: {
          create: deliverables.map((d: any) => ({
            type: d.type,
            quantity: d.quantity,
            duration: d.duration || undefined,
            notes: d.notes || undefined,
          })),
        },
        parties: {
          create: [
            {
              partyType: "INITIATOR",
              userId: dbUser.id,
              name: initiatorName || dbUser.name,
              email: dbUser.email,
              phone: dbUser.phone || undefined,
              role: contractType.startsWith("CREATOR_") ? "CREATOR" : contractType.startsWith("BRAND_") ? "BRAND" : "AGENCY",
              designation: initiatorDesignation || undefined,
              companyName: initiatorCompanyName || dbUser.agencyName || undefined,
              companyAddress: initiatorCompanyAddress || dbUser.agencyAddress || undefined,
              ntn: initiatorNtn || initiatorTaxId || undefined,
              cnic: initiatorCnic || initiatorNationalId || undefined,
              taxIdType: (initiatorTaxIdType as TaxIdType) || undefined,
              taxId: initiatorTaxId || initiatorNtn || undefined,
              nationalId: initiatorNationalId || initiatorCnic || undefined,
            }
          ]
        }
      },
    });

    // Create initial CONTRACT_CREATED AuditLog record
    await prisma.auditLog.create({
      data: {
        contractId: contract.id,
        userId: dbUser.id,
        action: "CONTRACT_CREATED",
        details: {
          contractNumber: contract.contractNumber,
          contractType,
          initiatorEmail: dbUser.email,
          initiatorName: dbUser.name,
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

    // Fetch contracts where user is initiator, respondent, or a linked ContractParty
    const contracts = await prisma.contract.findMany({
      where: {
        OR: [
          { initiatorId: dbUser.id },
          { respondentId: dbUser.id },
          { parties: { some: { userId: dbUser.id } } },
        ],
      },
      include: {
        deliverables: true,
        initiator: true,
        parties: true,
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
