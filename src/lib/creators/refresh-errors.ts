import type { Platform } from "@/lib/calculator/types";

export const PROFILE_RETAINED_MESSAGE = "Your previous completed profile is still available.";

export function refreshFailureMessage(message: string): string {
 const clean = message.split(PROFILE_RETAINED_MESSAGE).join("").replace(/\s+/g, " ").trim();
 return `${clean || "The refresh could not finish. Please try again."} ${PROFILE_RETAINED_MESSAGE}`;
}

export function inactiveScraperMessage(error: unknown, platform: Platform): string | null {
 const message = error instanceof Error ? error.message : String(error);
 if (!/bright\s*data/i.test(message) || !/customer is not active/i.test(message)) return null;
 const name = platform === "instagram" ? "Instagram" : platform === "tiktok" ? "TikTok" : "YouTube";
 return `${name} data refresh is temporarily unavailable. Please try again later.`;
}
