import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth-user";
import { prisma } from "@/lib/prisma";
import { ContractStatus } from "@prisma/client";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
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

    // Update the contract status to COMPLETED
    const updatedContract = await prisma.contract.update({
      where: { id, initiatorId: authUser.id },
      data: {
        status: ContractStatus.COMPLETED,
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
