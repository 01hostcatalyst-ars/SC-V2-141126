import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { generateAuditCertificatePDF } from "@/lib/pdf/generateCertificate";
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
      return NextResponse.json({ error: "Audit Certificate is available only for bilaterally executed active agreements" }, { status: 400 });
    }

    const certPath = `certificates/${contract.id}_certificate.pdf`;

    // Ensure rendered certificate PDF exists or generate on-demand
    let fileExists = false;
    try {
      const { data } = await supabaseAdmin.storage.from("profiles").list("certificates", {
        search: `${contract.id}_certificate.pdf`,
      });
      fileExists = Array.isArray(data) && data.length > 0;
    } catch (_) {}

    if (!fileExists) {
      try {
        await generateAuditCertificatePDF(contract.id);
      } catch (certErr: any) {
        console.error("Failed to generate Audit Certificate PDF on-demand for share token:", certErr);
        return NextResponse.json({ error: "Failed to generate Audit Certificate PDF: " + certErr.message }, { status: 500 });
      }
    }

    // Generate signed URL from Supabase Storage valid for 300 seconds (5 mins)
    const { data, error } = await supabaseAdmin.storage
      .from("profiles")
      .createSignedUrl(certPath, 300);

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
