import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { ContractType, Role, ContractStatus, SignerRole, CurrencyCode, TaxTreatmentType, PaymentMethod } from "@prisma/client";
import { computeContentHash } from "@/lib/utils";
import { calculateContractTax } from "@/lib/tax";

export async function POST(req: Request) {
  try {
    const {
      contractType,
      jurisdictionCountryCode = "US",
      currency = "USD",
      taxTreatment = "INCLUSIVE",
      taxRatePct = 0,
      initiatorName,
      initiatorEmail,
      initiatorPhone,
      initiatorRole,
      initiatorDesignation,
      initiatorNtn,
      initiatorCnic,
      initiatorTaxId,
      initiatorNationalId,
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
      paymentRoutingDetails,
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
          agencyName: initiatorCompanyName || undefined,
          agencyAddress: initiatorCompanyAddress || undefined,
        },
      });
    }


    // 3. Generate unique contract number
    const contractNumber = `BB-GUEST-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`;
    const remainingAmount = Number(totalAmount) - (Number(advancePayment) || 0);
    const isInitiatorPayee = contractType.startsWith("CREATOR_") || contractType === "AGENCY_TO_BRAND";

    const taxCalc = calculateContractTax({
      totalValuation: Number(totalAmount || 0),
      taxTreatment: (taxTreatment as any) || "INCLUSIVE",
      taxRatePct: Number(taxRatePct || 0),
    }, currency || "USD");

    // 4. Create Contract with deliverables and ContractParty snapshot
    const contract = await prisma.contract.create({
      data: {
        contractNumber,
        contractType: contractType as ContractType,
        jurisdictionCountryCode: jurisdictionCountryCode || "US",
        currency: (currency as CurrencyCode) || CurrencyCode.USD,
        taxTreatment: (taxTreatment as TaxTreatmentType) || TaxTreatmentType.INCLUSIVE,
        taxRatePct: taxRatePct ? Number(taxRatePct) : 0,
        taxAmount: taxCalc.taxAmount,
        isReverseCharge: taxTreatment === "REVERSE_CHARGE",
        initiatorId: dbUser.id,
        status: ContractStatus.PENDING_RESPONDENT,
        brandName: [ContractType.AGENCY_TO_CREATOR, ContractType.CREATOR_TO_BRAND, ContractType.CREATOR_TO_AGENCY].includes(contractType) ? brandName : undefined,
        brandHandle: [ContractType.AGENCY_TO_CREATOR, ContractType.CREATOR_TO_BRAND, ContractType.CREATOR_TO_AGENCY].includes(contractType) ? brandHandle : undefined,
        campaignName: [ContractType.AGENCY_TO_CREATOR, ContractType.CREATOR_TO_AGENCY, ContractType.BRAND_TO_AGENCY].includes(contractType) ? campaignName : undefined,
        creatorName: ([ContractType.AGENCY_TO_BRAND, ContractType.BRAND_TO_CREATOR, ContractType.BRAND_TO_AGENCY, ContractType.CREATOR_TO_BRAND, ContractType.CREATOR_TO_AGENCY] as string[]).includes(contractType) ? creatorName : undefined,
        creatorHandle: ([ContractType.AGENCY_TO_BRAND, ContractType.BRAND_TO_CREATOR, ContractType.BRAND_TO_AGENCY, ContractType.CREATOR_TO_BRAND, ContractType.CREATOR_TO_AGENCY] as string[]).includes(contractType) ? creatorHandle : undefined,
        initiatorDesignation: initiatorDesignation || undefined,
        initiatorPhone: initiatorPhone || undefined,
        initiatorCompanyName: initiatorCompanyName || undefined,
        initiatorCompanyAddress: initiatorCompanyAddress || undefined,
        initiatorNtn: initiatorNtn || initiatorTaxId || undefined,
        initiatorCnic: initiatorCnic || initiatorNationalId || undefined,
        initiatorTaxId: initiatorTaxId || initiatorNtn || undefined,
        initiatorNationalId: initiatorNationalId || initiatorCnic || undefined,
        totalAmount,
        advancePayment,
        advancePaymentDate: advancePaymentDate ? new Date(advancePaymentDate) : undefined,
        remainingAmount,
        remainingPaymentDate: remainingPaymentDate ? new Date(remainingPaymentDate) : undefined,
        paymentMethod: paymentMethod as PaymentMethod,
        paymentRoutingDetails: paymentRoutingDetails || undefined,
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
        parties: {
          create: [
            {
              partyType: "INITIATOR",
              userId: dbUser.id,
              name: initiatorName,
              email: cleanEmail,
              phone: initiatorPhone || undefined,
              role: (initiatorRole as Role) || (contractType.startsWith("CREATOR_") ? Role.CREATOR : contractType.startsWith("BRAND_") ? Role.BRAND : Role.AGENCY),
              designation: initiatorDesignation || undefined,
              companyName: (initiatorRole === "AGENCY" || initiatorRole === "BRAND") ? initiatorCompanyName : undefined,
              companyAddress: initiatorCompanyAddress || undefined,
              ntn: (initiatorRole === "AGENCY" || initiatorRole === "BRAND") ? initiatorNtn : undefined,
              cnic: initiatorRole === "CREATOR" ? initiatorCnic : undefined,
              taxIdType: (initiatorRole === "AGENCY" || initiatorRole === "BRAND") ? "NTN" : undefined,
              taxId: (initiatorRole === "AGENCY" || initiatorRole === "BRAND") ? initiatorNtn : undefined,
              nationalId: initiatorRole === "CREATOR" ? initiatorCnic : undefined,
              paymentMethod: isInitiatorPayee ? paymentMethod : undefined,
              bankAccountIban: isInitiatorPayee && paymentMethod === "BANK_IBAN" ? bankAccountIban : undefined,
              mobileWalletNumber: isInitiatorPayee && paymentMethod !== "BANK_IBAN" ? mobileWalletNumber : undefined,
            }
          ]
        }
      },
    });

    const fullContract = await prisma.contract.findUnique({
      where: { id: contract.id },
      include: { deliverables: true, initiator: true },
    });

    const contentHash = computeContentHash(fullContract);

    await prisma.contract.update({
      where: { id: contract.id },
      data: {
        contentHash,
        documentHash: contentHash,
      },
    });

    const origin = req.headers.get("origin") || `https://${process.env.NEXT_PUBLIC_COMPANY_DOMAIN || "www.signcollab.com"}`;
    const shareUrl = `${origin}/c/${contract.shareToken}`;

    // Record Party 1 (Initiator) verified digital signature log
    const ipAddress = req.headers.get("x-forwarded-for") || "127.0.0.1";
    const userAgent = req.headers.get("user-agent") || "Browser/GuestMode";

    const signingEventObj = {
      contentHash,
      email: cleanEmail,
      ipAddress,
      userAgent,
      deviceFingerprint: fingerprint || "",
    };
    const signingEventHash = crypto.createHash("sha256")
      .update(JSON.stringify(signingEventObj))
      .digest("hex");

    const initiatorParty = await prisma.contractParty.findFirst({
      where: { contractId: contract.id, partyType: "INITIATOR" },
    });

    await prisma.signature.create({
      data: {
        contractId: contract.id,
        signerId: dbUser.id,
        signerPartyId: initiatorParty?.id,
        signerRole: (initiatorRole as SignerRole) || (contractType.startsWith("CREATOR_") ? SignerRole.CREATOR : contractType.startsWith("BRAND_") ? SignerRole.BRAND : SignerRole.AGENCY),
        signatureImageUrl: signatureB64 || "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='50'><text x='10' y='30' font-family='Arial' font-size='18' font-weight='bold'>Initiator OTP Verified</text></svg>",
        ipAddress,
        userAgent,
        deviceFingerprint: fingerprint || undefined,
        documentHash: contentHash,
        signingEventHash,
        otpVerified: true,
        otpEmail: cleanEmail,
        consentRecorded: true,
      },
    });

    // Create AuditLog records for CONTRACT_CREATED and INITIATOR_SIGNED
    await prisma.auditLog.createMany({
      data: [
        {
          contractId: contract.id,
          userId: dbUser.id,
          action: "CONTRACT_CREATED",
          details: {
            contractNumber: contract.contractNumber,
            contractType,
            initiatorEmail: cleanEmail,
            initiatorName,
            ipAddress,
          },
          ipAddress,
          userAgent,
        },
        {
          contractId: contract.id,
          userId: dbUser.id,
          action: "INITIATOR_SIGNED",
          details: {
            email: cleanEmail,
            signerRole: (initiatorRole as SignerRole) || (contractType.startsWith("CREATOR_") ? SignerRole.CREATOR : contractType.startsWith("BRAND_") ? SignerRole.BRAND : SignerRole.AGENCY),
            ipAddress,
            fingerprint,
            initiatorId: dbUser.id,
            otpVerified: true,
          },
          ipAddress,
          userAgent,
        },
      ],
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
