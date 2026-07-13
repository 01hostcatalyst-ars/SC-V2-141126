import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { prisma } from "@/lib/prisma";
import { generateAuditCertificatePDF } from "@/lib/pdf/generateCertificate";

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

    const contract = await prisma.contract.findUnique({
      where: { id },
    });

    if (!contract) {
      return NextResponse.json({ error: "Contract not found" }, { status: 404 });
    }

    let certResult;
    try {
      certResult = await generateAuditCertificatePDF(contract.id);
    } catch (certErr: any) {
      console.error("Failed to generate audit certificate PDF:", certErr);
      return NextResponse.json(
        { error: "Failed to generate audit certificate: " + certErr.message },
        { status: 500 }
      );
    }

    const { data, error } = await supabaseAdmin.storage
      .from("profiles")
      .createSignedUrl(certResult.path, 60);

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
