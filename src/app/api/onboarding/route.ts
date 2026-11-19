import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { getGoogleIdentity } from "@/lib/auth-user";
import { prisma } from "@/lib/prisma";
import { OnboardingInputError, parseOnboardingInput } from "@/lib/onboarding-input";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  const expectedOrigin = new URL(process.env.BETTER_AUTH_URL || request.url).origin;
  if (origin !== expectedOrigin) return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  try {
    const identity = await getGoogleIdentity();
    if (!identity) return NextResponse.json({ error: "Sign in with Google first." }, { status: 401 });
    const profile = parseOnboardingInput(await request.json());
    const email = identity.email.trim().toLowerCase();
    const user = await prisma.$transaction(async tx => {
      const linked = await tx.user.findUnique({ where: { betterAuthId: identity.id } });
      if (linked) return linked; // Repeated submits never change an established role.
      const matches = await tx.user.findMany({ where: { email: { equals: email, mode: "insensitive" } }, take: 2 });
      if (matches.length > 1 || (matches[0]?.betterAuthId && matches[0].betterAuthId !== identity.id)) {
        throw new OnboardingInputError("This email is already connected to another account. Contact support.");
      }
      // Only a Google-verified email may claim an existing profile. Preserve IDs
      // and contract ownership; never trust an email supplied in the form.
      if (matches[0]) {
        return tx.user.update({
          where: { id: matches[0].id, AND: [{ betterAuthId: null }] },
          data: { ...profile, betterAuthId: identity.id },
        });
      }
      return tx.user.create({ data: { ...profile, email, betterAuthId: identity.id } });
    });
    return NextResponse.json({ success: true, userId: user.id, redirectTo: "/dashboard" }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    if (error instanceof OnboardingInputError) return NextResponse.json({ error: error.message }, { status: 400 });
    if (error instanceof SyntaxError) return NextResponse.json({ error: "Invalid profile details." }, { status: 400 });
    if (error instanceof Prisma.PrismaClientKnownRequestError && ["P2002", "P2025"].includes(error.code)) return NextResponse.json({ error: "Your account changed during setup. Reload and try again." }, { status: 409 });
    console.error("Onboarding failed", error instanceof Error ? error.name : "UnknownError");
    return NextResponse.json({ error: "Could not save your profile. Please try again." }, { status: 500 });
  }
}
