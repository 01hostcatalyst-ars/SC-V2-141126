import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    console.log("=== API PROFILE GET START ===");
    
    // Check if cookies exist in the request headers
    const { cookies } = await import("next/headers");
    const cookieStore = await cookies();
    const allCookies = cookieStore.getAll();
    console.log("Cookies found in request:", allCookies.map(c => c.name));

    const authUser = await getAuthUser();
    console.log("Auth user retrieval result:", authUser ? `User found (ID: ${authUser.id})` : "No user found (null)");

    if (!authUser) {
      console.log("Error: Unauthorized - authUser is null");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { supabaseAuthId: authUser.id },
    });
    console.log("Database user lookup result:", dbUser ? `User profile found for ${dbUser.email}` : "No user profile found in database");

    if (!dbUser) {
      console.log(`Error: User profile not found for auth ID ${authUser.id}`);
      return NextResponse.json({ error: "User profile not found" }, { status: 404 });
    }

    console.log("=== API PROFILE GET SUCCESS ===");
    return NextResponse.json({ success: true, profile: dbUser });
  } catch (error: any) {
    console.error("API PROFILE GET ERROR:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, phone, instagramHandle, agencyName, agencyAddress, cnicNumber, countryCode, taxId } = await req.json();

    const dbUser = await prisma.user.update({
      where: { supabaseAuthId: authUser.id },
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
