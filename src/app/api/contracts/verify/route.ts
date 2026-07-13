import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { token, fileHash } = body;

    if (!token && !fileHash) {
      return NextResponse.json(
        { error: "Please provide a verifyToken or fileHash." },
        { status: 400 }
      );
    }

    let contract = null;

    // Path A: File Hash Search
    if (fileHash) {
      const matchByHash = await prisma.contract.findFirst({
        where: { pdfBinaryHash: fileHash.toLowerCase() },
        include: { initiator: true, respondent: true },
      });

      if (matchByHash) {
        contract = matchByHash;
      }
    }

    // Path B: Token Search
    if (!contract && token) {
      const cleanToken = token.trim();
      contract = await prisma.contract.findFirst({
        where: {
          OR: [
            { verifyToken: cleanToken },
            { contractNumber: cleanToken },
          ],
        },
        include: { initiator: true, respondent: true },
      });
    }

    // State 4: TOKEN_NOT_FOUND (if query by token yielded no record and file hash didn't match)
    if (!contract) {
      if (fileHash && token) {
        // Token was provided, but file hash didn't match -> State 3
        return NextResponse.json({
          state: "CHECKSUM_MISMATCH",
          message: "This file does not match SignCollab's stored record for this token. This does not necessarily indicate fraud (e.g. the PDF was re-saved or edited). Please verify you have the original, un-edited PDF downloaded directly from SignCollab.",
        });
      }

      if (fileHash) {
        return NextResponse.json({
          state: "CHECKSUM_MISMATCH",
          message: "No document matching this file's checksum was found in SignCollab Vault.",
        });
      }

      return NextResponse.json({
        state: "TOKEN_NOT_FOUND",
        message: "No verification record was found for this link or token. Please check that the URL or QR code is correct, or contact the issuing party.",
      });
    }

    // State 3 Check: Token found, but file hash was sent and didn't match pdfBinaryHash
    if (fileHash && contract.pdfBinaryHash && contract.pdfBinaryHash.toLowerCase() !== fileHash.toLowerCase()) {
      return NextResponse.json({
        state: "CHECKSUM_MISMATCH",
        message: "This file does not match SignCollab's stored record for this token. This does not necessarily indicate fraud (e.g. the PDF was re-saved or edited). Please verify you have the original, un-edited PDF downloaded directly from SignCollab.",
        contractNumber: contract.contractNumber,
      });
    }

    // State 2: IN_PROGRESS (If contract is not yet fully executed)
    if (
      contract.status === "DRAFT" ||
      contract.status === "PENDING_RESPONDENT" ||
      contract.status === "PENDING_INITIATOR"
    ) {
      return NextResponse.json({
        state: "IN_PROGRESS",
        message: "This agreement is currently awaiting countersignature. Final bilateral checksum will be locked upon complete execution.",
        contractNumber: contract.contractNumber,
        verifyToken: contract.verifyToken,
        createdAt: contract.createdAt,
        dealLifecycle: contract.status,
      });
    }

    // State 1: EXECUTED_VERIFIED
    // Dynamic NDA / Product Embargo Masking
    const now = new Date();
    const isEmbargoActive = contract.embargoDate && now < new Date(contract.embargoDate);

    const partyAName = isEmbargoActive
      ? "[Confidential — Under NDA]"
      : contract.initiator.agencyName || contract.initiator.name;

    const partyBName = isEmbargoActive
      ? `[Confidential — Product Embargo active until ${new Date(contract.embargoDate!).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}]`
      : contract.respondentCompany || contract.respondentName || contract.respondent?.name || "Counterparty";

    const formatHashTruncated = (hashStr: string | null) => {
      if (!hashStr) return "N/A";
      if (hashStr.length <= 16) return hashStr;
      return `${hashStr.substring(0, 10)}...${hashStr.substring(hashStr.length - 8)}`;
    };

    const getTitle = (type: string) => {
      switch (type) {
        case "AGENCY_TO_BRAND": return "Agency to Brand Influencer Marketing Agreement";
        case "AGENCY_TO_CREATOR": return "Agency to Creator Content Service Agreement";
        case "BRAND_TO_CREATOR": return "Brand to Creator Direct Sponsorship Agreement";
        case "CREATOR_TO_BRAND": return "Creator to Brand Engagement Agreement";
        default: return "Mutual Collaboration & Licensing Agreement";
      }
    };

    // PRIVACY FIREWALL: Retain ONLY public safe metadata
    return NextResponse.json({
      state: "EXECUTED_VERIFIED",
      message: "This agreement has been bilaterally executed and verified in SignCollab Vault.",
      contractNumber: contract.contractNumber,
      verifyToken: contract.verifyToken,
      title: getTitle(contract.contractType),
      contractType: contract.contractType,
      dealLifecycle: contract.status, // ACTIVE, COMPLETED, CANCELLED
      executedAt: contract.activatedAt || contract.updatedAt,
      createdAt: contract.createdAt,
      
      // Dynamic NDA Protected Names
      partyA: partyAName,
      partyB: partyBName,
      isEmbargoActive,
      embargoDate: contract.embargoDate,

      // Truncated Hashes & Integrity Proof
      finalDocumentHashTruncated: formatHashTruncated(contract.finalDocumentHash),
      pdfBinaryHash: contract.pdfBinaryHash,
      complianceStandard: "Pakistan ETO 2002 Ordinance Framework",
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
