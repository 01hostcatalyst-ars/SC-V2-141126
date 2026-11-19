import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function getGoogleIdentity() {
  const session = await auth.api.getSession({ headers: await headers() });
  return session?.user.emailVerified ? session.user : null;
}

// Authentication IDs are never substituted for application user IDs.
export async function getAuthUser(request?: Request) {
  if (request && !["GET", "HEAD", "OPTIONS"].includes(request.method)) {
    const expectedOrigin = new URL(process.env.BETTER_AUTH_URL || request.url).origin;
    if (request.headers.get("origin") !== expectedOrigin) return null;
  }
  const identity = await getGoogleIdentity();
  if (!identity) return null;
  return prisma.user.findUnique({ where: { betterAuthId: identity.id } });
}

export function contractAccessFilter(userId: string) {
  return {
    OR: [
      { initiatorId: userId },
      { respondentId: userId },
      { parties: { some: { userId } } },
    ],
  };
}
