import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth-user";
import { prisma } from "@/lib/prisma";
import { getPrivateDownloadUrl } from "@/lib/storage";

export async function GET(req: Request) {
  try {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const profile = await prisma.user.findUnique({ where: { id: user.id }, select: { cnicPhotoUrl: true } });
    if (!profile?.cnicPhotoUrl || !profile.cnicPhotoUrl.startsWith("cnic/")) {
      return NextResponse.json({ error: "Identity image not found" }, { status: 404 });
    }
    const url = await getPrivateDownloadUrl(profile.cnicPhotoUrl, 60);
    return NextResponse.json({ success: true, url }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Failed to access identity image", error);
    return NextResponse.json({ error: "Unable to access identity image" }, { status: 500 });
  }
}
