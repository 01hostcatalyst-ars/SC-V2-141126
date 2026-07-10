import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { ContractStatus } from "@prisma/client";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const contract = await prisma.contract.findUnique({
      where: { id },
    });

    if (!contract) {
      return NextResponse.json({ error: "Contract not found" }, { status: 404 });
    }

    if (contract.status !== ContractStatus.DRAFT) {
      return NextResponse.json({ error: "Contract is already submitted" }, { status: 400 });
    }

    // Update status to PENDING_RESPONDENT and set 7 days expiration date
    const updatedContract = await prisma.contract.update({
      where: { id },
      data: {
        status: ContractStatus.PENDING_RESPONDENT,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // now + 7 days
      },
    });

    // TODO: Trigger Email notification dispatch in Phase 6

    return NextResponse.json({
      success: true,
      contract: updatedContract,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
