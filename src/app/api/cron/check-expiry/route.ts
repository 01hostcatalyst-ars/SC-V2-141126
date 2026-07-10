import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ContractStatus } from "@prisma/client";

export async function POST(req: Request) {
  try {
    // Basic verification token validation check to prevent arbitrary hits
    const authHeader = req.headers.get("authorization");
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Expire PENDING contracts that have surpassed the expiresAt limit
    const expiredContracts = await prisma.contract.updateMany({
      where: {
        status: {
          in: [ContractStatus.PENDING_RESPONDENT, ContractStatus.PENDING_INITIATOR],
        },
        expiresAt: { lt: new Date() },
      },
      data: {
        status: ContractStatus.EXPIRED,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Expired ${expiredContracts.count} contracts.`,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
