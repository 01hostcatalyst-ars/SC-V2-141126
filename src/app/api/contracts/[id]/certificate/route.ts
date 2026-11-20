import { NextResponse } from "next/server";
import { getAuthUser, contractAccessFilter } from "@/lib/auth-user";
import { getPrivateDownloadUrl, privateFileExists } from "@/lib/storage";
import { prisma } from "@/lib/prisma";
import { generateAuditCertificatePDF } from "@/lib/pdf/generateCertificate";

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

    const contract = await prisma.contract.findFirst({
      where: { id, ...contractAccessFilter(authUser.id) },
    });

    if (!contract) {
      return NextResponse.json({ error: "Contract not found" }, { status: 404 });
    }

    const certPath = `certificates/${contract.id}_certificate.pdf`;
    if (!(await privateFileExists(certPath))) {
      try {
        await generateAuditCertificatePDF(contract.id);
      } catch (certErr: any) {
        console.error("Failed to generate audit certificate PDF:", certErr);
        return NextResponse.json(
          { error: "Failed to generate audit certificate: " + certErr.message },
          { status: 500 }
        );
      }
    }

    const url = await getPrivateDownloadUrl(certPath, 60);

    return NextResponse.json({
      success: true,
      url,
    }, { headers: { "Cache-Control": "no-store" } });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
