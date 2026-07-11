import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { prisma } from "@/lib/prisma";
import { generateContractPDF } from "@/lib/pdf/generate";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    let contract = await prisma.contract.findUnique({
      where: { id },
    });

    if (!contract) {
      return NextResponse.json({ error: "Contract not found" }, { status: 404 });
    }

    // Generate PDF on the fly if not generated previously and contract is active/completed
    if (!contract.pdfUrl && (contract.status === "ACTIVE" || contract.status === "COMPLETED")) {
      try {
        await generateContractPDF(contract.id);
        contract = await prisma.contract.findUnique({
          where: { id },
        });
      } catch (pdfErr: any) {
        console.error("Failed to generate PDF on the fly:", pdfErr);
        return NextResponse.json({ error: "Failed to generate PDF on the fly: " + pdfErr.message }, { status: 500 });
      }
    }

    if (!contract || !contract.pdfUrl) {
      return NextResponse.json({ error: "PDF document not generated or found" }, { status: 404 });
    }

    // Retrieve temporary signed download URL from Supabase Storage
    const { data, error } = await supabaseAdmin.storage
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
