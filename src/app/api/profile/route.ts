import { NextResponse } from "next/server";
import { getAuthUser, getGoogleIdentity } from "@/lib/auth-user";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const identity = await getGoogleIdentity();
    if (!identity) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const dbUser = await prisma.user.findUnique({ where: { betterAuthId: identity.id } });

    if (!dbUser) {
      return NextResponse.json({ error: "User profile not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, profile: dbUser }, { headers: { "Cache-Control": "no-store" } });
  } catch (error: any) {
    console.error("API PROFILE GET ERROR:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, phone, instagramHandle, agencyName, agencyAddress, cnicNumber, countryCode, taxId } = await req.json();

    const dbUser = await prisma.user.update({
      where: { id: authUser.id },
      data: {
        name,
        phone,
        instagramHandle,
        agencyName,
        agencyAddress,
        cnicNumber,
        countryCode,
        taxId,
      },
    });

    return NextResponse.json({ success: true, profile: dbUser });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
