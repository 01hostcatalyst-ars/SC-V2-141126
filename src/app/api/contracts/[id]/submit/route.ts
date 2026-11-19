import { NextResponse } from "next/server";
import crypto from "crypto";
import { getAuthUser } from "@/lib/auth-user";
import { prisma } from "@/lib/prisma";
import { ContractStatus, SignerRole } from "@prisma/client";
import { computeContentHash } from "@/lib/utils";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: authUser.id },
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

    const {
      initiatorDesignation,
      initiatorNtn,
      initiatorCnic,
      initiatorTaxIdType,
      initiatorTaxId,
      initiatorNationalId,
      paymentRoutingDetails,
      signatureB64,
      fingerprint,
    } = body;

    const contract = await prisma.contract.findUnique({
      where: { id, initiatorId: authUser.id },
      include: {
        deliverables: true,
        initiator: true,
        parties: true,
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
      where: { id, initiatorId: authUser.id },
      data: {
        status: ContractStatus.PENDING_RESPONDENT,
        shareToken,
        verifyToken,
        initiatorDesignation: initiatorDesignation || contract.initiatorDesignation || undefined,
        initiatorNtn: initiatorNtn || initiatorTaxId || contract.initiatorNtn || undefined,
        initiatorCnic: initiatorCnic || initiatorNationalId || contract.initiatorCnic || undefined,
        initiatorTaxIdType: initiatorTaxIdType || (contract as any).initiatorTaxIdType || undefined,
        initiatorTaxId: initiatorTaxId || initiatorNtn || (contract as any).initiatorTaxId || undefined,
        initiatorNationalId: initiatorNationalId || initiatorCnic || (contract as any).initiatorNationalId || undefined,
        paymentRoutingDetails: paymentRoutingDetails || (contract as any).paymentRoutingDetails || undefined,
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
      where: { id, initiatorId: authUser.id },
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

    // Compute Party 1 (Initiator) signing event hash
    const signingEventHash = crypto.createHash("sha256")
      .update(`${contentHash}-${dbUser.email}-${ipAddress}-${userAgent}-${fingerprint || ""}`)
      .digest("hex");

    // Find or update initiator ContractParty with submit-time data
    let initiatorParty = contract.parties?.find((p: any) => p.partyType === "INITIATOR");
    if (initiatorParty) {
      initiatorParty = await prisma.contractParty.update({
        where: { id: initiatorParty.id },
        data: {
          designation: initiatorDesignation || initiatorParty.designation || undefined,
          ntn: initiatorNtn || initiatorTaxId || initiatorParty.ntn || undefined,
          cnic: initiatorCnic || initiatorNationalId || initiatorParty.cnic || undefined,
          taxId: initiatorTaxId || initiatorNtn || initiatorParty.taxId || undefined,
          nationalId: initiatorNationalId || initiatorCnic || initiatorParty.nationalId || undefined,
          taxIdType: initiatorTaxIdType || initiatorParty.taxIdType || undefined,
        }
      });
    }

    // Record Party 1 (Initiator) verified digital signature log — matching Instant flow
    await prisma.signature.create({
      data: {
        contractId: contract.id,
        signerId: dbUser.id,
        signerPartyId: initiatorParty?.id || undefined,
        signerRole,
        signatureImageUrl: signatureB64 || "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='50'><text x='10' y='30' font-family='Arial' font-size='18' font-weight='bold'>Initiator OTP Verified</text></svg>",
        ipAddress,
        userAgent,
        deviceFingerprint: fingerprint || undefined,
        documentHash: contentHash,
        signingEventHash,
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
          company: initiatorParty?.companyName || (contract.initiator as any)?.agencyName || (contract.initiator as any)?.companyName,
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
