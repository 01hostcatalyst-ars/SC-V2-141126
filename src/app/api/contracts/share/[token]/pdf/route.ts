import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getPrivateDownloadUrl, privateFileExists } from "@/lib/storage";
import { generateContractPDF } from "@/lib/pdf/generate";
import { ContractStatus } from "@prisma/client";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    let contract = await prisma.contract.findUnique({
      where: { shareToken: token },
    });

    if (!contract) {
      return NextResponse.json({ error: "Agreement not found" }, { status: 404 });
    }

    if (contract.status !== ContractStatus.ACTIVE && contract.status !== ContractStatus.COMPLETED) {
      return NextResponse.json({ error: "PDF download is available only for bilaterally executed active agreements" }, { status: 400 });
    }

    // A missing archived document must be recovered, not silently replaced with new bytes.
    if (contract.pdfUrl && !(await privateFileExists(contract.pdfUrl))) {
      return NextResponse.json({ error: "The saved PDF is unavailable. Please contact support." }, { status: 503 });
    }
    if (!contract.pdfUrl) {
      try {
        await generateContractPDF(contract.id);
        contract = await prisma.contract.findUnique({
          where: { id: contract.id },
        });
      } catch (pdfErr: any) {
        console.error("Failed to generate contract PDF on-demand for share token:", pdfErr);
        return NextResponse.json({ error: "Failed to generate PDF document: " + pdfErr.message }, { status: 500 });
      }
    }

    if (!contract || !contract.pdfUrl) {
      return NextResponse.json({ error: "PDF document not generated or found" }, { status: 404 });
    }

    const url = await getPrivateDownloadUrl(contract.pdfUrl, 300);

    return NextResponse.json({
      success: true,
      url,
      contractNumber: contract.contractNumber,
    }, { headers: { "Cache-Control": "no-store" } });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
