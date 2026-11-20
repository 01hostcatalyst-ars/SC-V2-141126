import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth-user";
import { uploadPrivateFile } from "@/lib/storage";
import { cnicImageType, MAX_CNIC_BYTES } from "@/lib/cnic-file";
import { randomUUID } from "node:crypto";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    if (file.size === 0 || file.size > MAX_CNIC_BYTES) {
      return NextResponse.json({ error: "Upload an image smaller than or equal to 4 MB" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const imageType = cnicImageType(buffer);
    if (!imageType) {
      return NextResponse.json({ error: "Upload a JPEG, PNG, or WebP image" }, { status: 400 });
    }

    const filePath = `cnic/${authUser.id}-${randomUUID()}.${imageType.extension}`;
    await uploadPrivateFile(filePath, buffer, imageType.contentType);

    // Update CNIC image path url in database
    const dbUser = await prisma.user.update({
      where: { id: authUser.id },
      data: { cnicPhotoUrl: filePath },
    });

    return NextResponse.json({
      success: true,
      profile: dbUser,
      path: filePath,
    }, { headers: { "Cache-Control": "no-store" } });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
