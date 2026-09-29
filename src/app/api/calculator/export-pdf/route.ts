import { NextRequest, NextResponse } from "next/server";
import { generateRateCardPDF, RateCardPdfPayload } from "@/lib/pdf/generateRateCardPdf";

export const maxDuration = 60; // Allow sufficient time for Puppeteer PDF render

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as RateCardPdfPayload;

    if (!body || !body.creatorMeta?.displayName) {
      return NextResponse.json(
        { error: "Invalid payload: creator metadata is required." },
        { status: 400 }
      );
    }

    const pdfBuffer = await generateRateCardPDF(body);

    const safeName = (body.creatorMeta.displayName || body.creatorMeta.primaryUsername || "Creator")
      .replace(/[^a-zA-Z0-9_-]/g, "_");
    const filename = `BrandBridge_RateCard_${safeName}.pdf`;

    return new NextResponse(pdfBuffer as unknown as BodyInit, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": pdfBuffer.length.toString(),
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    });
  } catch (err: any) {
    console.error("[Export PDF Error]:", err);
    return NextResponse.json(
      { error: err.message || "Failed to generate rate card PDF dossier." },
      { status: 500 }
    );
  }
}
