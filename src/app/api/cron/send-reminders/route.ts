import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ContractStatus } from "@prisma/client";
import { sendEmailNotification } from "@/lib/notifications";

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Query all contracts expiring in less than 2 days that haven't been completed/notified yet
    const twoDaysFromNow = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);
    const contractsToRemind = await prisma.contract.findMany({
      where: {
        status: ContractStatus.PENDING_RESPONDENT,
        expiresAt: { lt: twoDaysFromNow, gt: new Date() },
        reminders: {
          none: {
            type: "RESPONDENT_SIGN_REMINDER",
            status: "sent",
          },
        },
      },
      include: {
        initiator: true,
      },
    });

    let sentCount = 0;

    for (const contract of contractsToRemind) {
      if (!contract.respondentEmail) continue;

      const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/c/${contract.shareToken}`;

      // Dispatch reminder email
      const emailResult = await sendEmailNotification({
        to: contract.respondentEmail,
        subject: `Reminder: Collaboration Agreement #${contract.contractNumber} is expiring soon`,
        template: "reminder",
        data: {
          contractNumber: contract.contractNumber,
          initiatorName: contract.initiator.name,
          link: shareUrl,
        },
      });

      if (emailResult.success) {
        await prisma.reminder.create({
          data: {
            contractId: contract.id,
            type: "RESPONDENT_SIGN_REMINDER",
            scheduledAt: new Date(),
            sentAt: new Date(),
            status: "sent",
          },
        });
        sentCount++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Sent ${sentCount} expiration reminders.`,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
