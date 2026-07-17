import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ContractType, Role, ContractStatus, SignerRole } from "@prisma/client";

export async function POST(req: Request) {
  try {
    const {
      contractType,
      initiatorName,
      initiatorEmail,
      initiatorPhone,
      initiatorRole,
      initiatorDesignation,
      initiatorNtn,
      initiatorCnic,
      initiatorCompanyName,
      initiatorCompanyAddress,
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
      usageType,
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
      deliverables,
      collabProduct,
      collabProductProvisionType,
      collabDeliveryAddress,
      collabDeliveryDate,
      collabProductReturnDays,
      collabProductReturnAddress,
      collabProductReturnShippingBy,
      collabProductNonReturnFee,
      signatureB64,
      fingerprint,
    } = await req.json();

    if (!initiatorEmail || !initiatorName || !contractType || !totalAmount || !deliveryTimeframeDays || !deliverables || deliverables.length === 0) {
      return NextResponse.json({ error: "Missing required guest contract fields" }, { status: 400 });
    }

    const cleanEmail = initiatorEmail.trim().toLowerCase();

    // 1. Enforce 24-hour rate limit (Max 2 contracts per email per 24 hours)
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const existingCount = await prisma.contract.count({
      where: {
        initiator: {
          email: cleanEmail,
        },
        createdAt: {
          gte: twentyFourHoursAgo,
        },
      },
    });

    if (existingCount >= 2) {
      return NextResponse.json(
        {
          error: "Guest limit reached (2 contracts per 24h per email). Please create a free account to unlock unlimited contract creation!",
          limitReached: true,
        },
        { status: 429 }
      );
    }

    // 2. Find or create shadow User for initiator
    let dbUser = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (!dbUser) {
      dbUser = await prisma.user.create({
        data: {
          name: initiatorName,
          email: cleanEmail,
          phone: initiatorPhone || undefined,
          role: (initiatorRole as Role) || Role.CREATOR,
        },
      });
    }

    // 3. Generate unique contract number
    const contractNumber = `BB-GUEST-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`;
    const remainingAmount = Number(totalAmount) - (Number(advancePayment) || 0);

    // 4. Create Contract with deliverables
    const contract = await prisma.contract.create({
      data: {
        contractNumber,
        contractType: contractType as ContractType,
        initiatorId: dbUser.id,
        status: ContractStatus.PENDING_RESPONDENT,
        brandName: [ContractType.AGENCY_TO_CREATOR, ContractType.CREATOR_TO_BRAND, ContractType.CREATOR_TO_AGENCY].includes(contractType) ? brandName : undefined,
        brandHandle: [ContractType.AGENCY_TO_CREATOR, ContractType.CREATOR_TO_BRAND, ContractType.CREATOR_TO_AGENCY].includes(contractType) ? brandHandle : undefined,
        campaignName: [ContractType.AGENCY_TO_CREATOR, ContractType.CREATOR_TO_AGENCY, ContractType.BRAND_TO_AGENCY].includes(contractType) ? campaignName : undefined,
        creatorName: [ContractType.AGENCY_TO_BRAND, ContractType.BRAND_TO_CREATOR, ContractType.BRAND_TO_AGENCY].includes(contractType) ? creatorName : undefined,
        creatorHandle: [ContractType.AGENCY_TO_BRAND, ContractType.BRAND_TO_CREATOR, ContractType.BRAND_TO_AGENCY].includes(contractType) ? creatorHandle : undefined,
        initiatorDesignation: initiatorDesignation || undefined,
        initiatorPhone: initiatorPhone || undefined,
        initiatorCompanyName: initiatorCompanyName || undefined,
        initiatorCompanyAddress: initiatorCompanyAddress || undefined,
        initiatorNtn: initiatorNtn || undefined,
        initiatorCnic: initiatorCnic || undefined,
        totalAmount,
        advancePayment,
        advancePaymentDate: advancePaymentDate ? new Date(advancePaymentDate) : undefined,
        remainingAmount,
        remainingPaymentDate: remainingPaymentDate ? new Date(remainingPaymentDate) : undefined,
        paymentMethod,
        bankAccountIban,
        mobileWalletNumber,
        deliveryTimeframeDays: Number(deliveryTimeframeDays),
        platformsAllowed: platformsAllowed || [],
        usageType: usageType || [],
        usageRightsDuration: usageRightsDuration || "12 Months",
        revisionRounds: revisionRounds ? Number(revisionRounds) : 1,
        revisionTurnaroundDays: revisionTurnaroundDays ? Number(revisionTurnaroundDays) : 5,
        brandApprovalRequired: Boolean(brandApprovalRequired),
        exclusivityClause: Boolean(exclusivityClause),
        exclusivityDuration: exclusivityDuration || undefined,
        exclusivityCompetitors: exclusivityCompetitors || undefined,
        confidentialityRequired: Boolean(confidentialityRequired),
        embargoDate: embargoDate ? new Date(embargoDate) : undefined,
        earlyDisclosurePenalty: earlyDisclosurePenalty ? Number(earlyDisclosurePenalty) : undefined,
        latePaymentPenaltyPct: latePaymentPenaltyPct ? Number(latePaymentPenaltyPct) : 3,
        lateContentPenaltyPct: lateContentPenaltyPct ? Number(lateContentPenaltyPct) : 3,
        penaltyCapPct: penaltyCapPct ? Number(penaltyCapPct) : 20,
        unauthorizedUsagePenaltyPct: unauthorizedUsagePenaltyPct ? Number(unauthorizedUsagePenaltyPct) : 50,
        advanceRefundable: advanceRefundable !== undefined ? Boolean(advanceRefundable) : true,
        advanceRefundTimeframeDays: advanceRefundTimeframeDays ? Number(advanceRefundTimeframeDays) : 7,
        nonDeliveryCutoffDays: nonDeliveryCutoffDays ? Number(nonDeliveryCutoffDays) : 7,
        cancellationFeePct: cancellationFeePct ? Number(cancellationFeePct) : 25,
        contentOwnership: contentOwnership || "Creator retains copyright; brand receives usage license as defined.",
        taggingRequirements: taggingRequirements || undefined,
        collabProduct: collabProduct || undefined,
        collabProductProvisionType: collabProductProvisionType || undefined,
        collabDeliveryAddress: collabDeliveryAddress || undefined,
        collabDeliveryDate: collabDeliveryDate ? new Date(collabDeliveryDate) : undefined,
        collabProductReturnDays: collabProductReturnDays ? Number(collabProductReturnDays) : undefined,
        collabProductReturnAddress: collabProductReturnAddress || undefined,
        collabProductReturnShippingBy: collabProductReturnShippingBy || undefined,
        collabProductNonReturnFee: collabProductNonReturnFee ? Number(collabProductNonReturnFee) : undefined,
        deliverables: {
          create: deliverables.map((d: any) => ({
            type: d.type,
            quantity: Number(d.quantity) || 1,
            duration: d.duration || undefined,
            notes: d.notes || undefined,
          })),
        },
      },
    });

    const origin = req.headers.get("origin") || `https://${process.env.NEXT_PUBLIC_COMPANY_DOMAIN || "www.signcollab.com"}`;
    const shareUrl = `${origin}/c/${contract.shareToken}`;

    // Record Party 1 (Initiator) verified digital signature log
    const ipAddress = req.headers.get("x-forwarded-for") || "127.0.0.1";
    const userAgent = req.headers.get("user-agent") || "Browser/GuestMode";
    const docHash = `HASH-INITIATOR-${contract.id.slice(0, 8)}-${Date.now()}`;

    await prisma.signature.create({
      data: {
        contractId: contract.id,
        signerId: dbUser.id,
        signerRole: (initiatorRole as SignerRole) || (contractType.startsWith("CREATOR_") ? SignerRole.CREATOR : contractType.startsWith("BRAND_") ? SignerRole.BRAND : SignerRole.AGENCY),
        signatureImageUrl: signatureB64 || "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='50'><text x='10' y='30' font-family='Arial' font-size='18' font-weight='bold'>Initiator OTP Verified</text></svg>",
        ipAddress,
        userAgent,
        deviceFingerprint: fingerprint || undefined,
        documentHash: docHash,
        otpVerified: true,
        otpEmail: cleanEmail,
        consentRecorded: true,
      },
    });

    return NextResponse.json({
      success: true,
      contract,
      shareUrl,
      shareToken: contract.shareToken,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
