import { NextResponse } from "next/server";
import { getAuthUser, contractAccessFilter } from "@/lib/auth-user";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { prisma } from "@/lib/prisma";
import { generateContractPDF } from "@/lib/pdf/generate";

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

    // Always regenerate PDF on-demand to guarantee the latest 11-section legal design is served
    try {
      await generateContractPDF(contract.id);
      contract = await prisma.contract.findFirst({
        where: { id, ...contractAccessFilter(authUser.id) },
      });
    } catch (pdfErr: any) {
      console.error("Failed to generate PDF on-demand:", pdfErr);
      return NextResponse.json({ error: "Failed to generate PDF document: " + pdfErr.message }, { status: 500 });
    }

    if (!contract || !contract.pdfUrl) {
      return NextResponse.json({ error: "PDF document not generated or found" }, { status: 404 });
    }

    // Retrieve temporary signed download URL from Supabase Storage
    const { data, error } = await getSupabaseAdmin().storage
      .from("profiles")
      .createSignedUrl(contract.pdfUrl, 60); // valid for 60 seconds

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      url: data.signedUrl,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
