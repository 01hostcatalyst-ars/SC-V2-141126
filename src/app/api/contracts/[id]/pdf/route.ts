import { NextResponse } from "next/server";
import { getAuthUser, contractAccessFilter } from "@/lib/auth-user";
import { getPrivateDownloadUrl, privateFileExists } from "@/lib/storage";
import { prisma } from "@/lib/prisma";
import { generateContractPDF } from "@/lib/pdf/generate";
import { ContractStatus } from "@prisma/client";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    let contract = await prisma.contract.findFirst({
      where: { id, ...contractAccessFilter(authUser.id) },
    });

    if (!contract) {
      return NextResponse.json({ error: "Contract not found" }, { status: 404 });
    }

    // Preserve executed evidence, while draft previews still reflect the latest edits.
    const executed = contract.status === ContractStatus.ACTIVE || contract.status === ContractStatus.COMPLETED;
    if (executed && contract.pdfUrl && !(await privateFileExists(contract.pdfUrl))) {
      return NextResponse.json({ error: "The saved PDF is unavailable. Please contact support." }, { status: 503 });
    }
    if (!executed || !contract.pdfUrl) {
      try {
        await generateContractPDF(contract.id);
        contract = await prisma.contract.findFirst({
          where: { id, ...contractAccessFilter(authUser.id) },
        });
      } catch (pdfErr: any) {
        console.error("Failed to generate PDF on-demand:", pdfErr);
        return NextResponse.json({ error: "Failed to generate PDF document: " + pdfErr.message }, { status: 500 });
      }
    }

    if (!contract || !contract.pdfUrl) {
      return NextResponse.json({ error: "PDF document not generated or found" }, { status: 404 });
    }

    const url = await getPrivateDownloadUrl(contract.pdfUrl, 60);

    return NextResponse.json({
      success: true,
      url,
    }, { headers: { "Cache-Control": "no-store" } });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
