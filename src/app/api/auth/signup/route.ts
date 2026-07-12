import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { name, email, phone, role, password, instagramHandle, agencyName, agencyAddress } = await req.json();

    if (!name || !email || !role || !password) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Initialize Supabase Server Client to manage registration cookies
    const supabase = await getSupabaseServerClient();
    
    // 1. Register the user profile with Supabase Auth
    // Dynamically retrieve origin to redirect confirmation to /dashboard
    const origin = req.headers.get("origin") || `https://${process.env.NEXT_PUBLIC_COMPANY_DOMAIN || "www.signcollab.com"}`;
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${origin}/dashboard`,
      }
    });

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    if (!authData.user) {
      return NextResponse.json({ error: "Auth user registration failed" }, { status: 500 });
    }

    // 2. Insert user details in database profile table via Prisma
    const dbUser = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        role,
        instagramHandle,
        agencyName,
        agencyAddress,
        supabaseAuthId: authData.user.id,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Sign-up successful! Please check your email to confirm your account.",
      user: {
        id: dbUser.id,
        email: dbUser.email,
        role: dbUser.role,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
