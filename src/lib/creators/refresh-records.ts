import { prisma } from "@/lib/prisma";

export function refreshSchemaMissing(error: unknown): boolean {
 return typeof error === "object" && error !== null && "code" in error && ["P2021", "P2022"].includes(String(error.code));
}

export async function latestProfileRefresh(clusterId: string) {
 try {
  return await prisma.creatorProfileRefresh.findFirst({ where: { clusterId }, orderBy: { createdAt: "desc" } });
 } catch (error) {
  // Deploying application code before the additive schema must not break existing profiles.
  if (refreshSchemaMissing(error)) return null;
  throw error;
 }
}
