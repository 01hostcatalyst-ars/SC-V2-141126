import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { ContractStatus } from "@prisma/client";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const contract = await prisma.contract.findUnique({
      where: { id },
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
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();

    // Verify contract is still in draft state before edits
    const currentContract = await prisma.contract.findUnique({
      where: { id },
    });

    if (!currentContract) {
      return NextResponse.json({ error: "Contract not found" }, { status: 404 });
    }

    if (currentContract.status !== ContractStatus.DRAFT) {
      return NextResponse.json({ error: "Only draft agreements can be updated" }, { status: 400 });
    }

    const { deliverables, ...updateData } = body;

    // Execute update transactions
    const contract = await prisma.contract.update({
      where: { id },
      data: {
        ...updateData,
        advancePaymentDate: updateData.advancePaymentDate ? new Date(updateData.advancePaymentDate) : undefined,
        remainingPaymentDate: updateData.remainingPaymentDate ? new Date(updateData.remainingPaymentDate) : undefined,
        collabDeliveryDate: updateData.collabDeliveryDate ? new Date(updateData.collabDeliveryDate) : undefined,
        collabProductProvisionType: updateData.collabProductProvisionType || undefined,
        remainingAmount: Number(updateData.totalAmount) - (Number(updateData.advancePayment) || 0),
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
      return NextResponse.json({ error: "Only draft agreements can be cancelled" }, { status: 400 });
    }

    await prisma.contract.update({
      where: { id },
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
