import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
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

    // Ensure rendered PDF exists or generate on-demand
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

    // Generate signed URL from Supabase Storage valid for 300 seconds (5 mins)
    const { data, error } = await getSupabaseAdmin().storage
      .from("profiles")
      .createSignedUrl(contract.pdfUrl, 300);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      url: data.signedUrl,
      contractNumber: contract.contractNumber,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
