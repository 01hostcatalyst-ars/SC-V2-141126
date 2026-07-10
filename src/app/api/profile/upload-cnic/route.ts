import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/supabase/server";
import { supabase } from "@/lib/supabase/client";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Convert file to buffer for Supabase Storage uploads
    const buffer = Buffer.from(await file.arrayBuffer());
    const fileExtension = file.name.split(".").pop();
    const filePath = `cnic/${authUser.id}-${Date.now()}.${fileExtension}`;

    // Upload to private CNIC storage bucket
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("profiles")
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    // Update CNIC image path url in database
    const dbUser = await prisma.user.update({
      where: { supabaseAuthId: authUser.id },
      data: { cnicPhotoUrl: uploadData.path },
    });

    return NextResponse.json({
      success: true,
      profile: dbUser,
      path: uploadData.path,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
