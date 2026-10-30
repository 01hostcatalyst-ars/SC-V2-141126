import type { Platform } from "@/lib/calculator/types";

export const PROFILE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;
export const REFRESH_LIFETIME_MS = 20 * 60 * 1000;
export const PLATFORMS: Platform[] = ["youtube", "instagram", "tiktok"];
export type RefreshAccounts = Partial<Record<Platform, string>>;
export type ProfileSources = Partial<Record<Platform | "intelligence", string>>;
export type RefreshSteps = Partial<Record<Platform, { status: "running" | "done" | "error"; snapshotId?: string; handle?: string }>>;
export interface ProfileFreshness { oldestSourceAt: string | null; sources: ProfileSources }
export interface RefreshStatus { available: boolean; eligible: boolean; active: boolean; oldestSourceAt: string | null; stage?: string }

export function refreshIsDue(value: string | Date | null | undefined, now = Date.now()): boolean {
 if (!value) return true;
 const timestamp = new Date(value).getTime();
 return !Number.isFinite(timestamp) || timestamp > now || now - timestamp > PROFILE_MAX_AGE_MS;
}

export function oldestSourceDate(values: Array<Date | null | undefined>): string | null {
 if (!values.length || values.some(value => !value || !Number.isFinite(value.getTime()))) return null;
 return new Date(Math.min(...values.map(value => value!.getTime()))).toISOString();
}

export function sourcesFromSteps(steps: RefreshSteps, intelligence?: string | null): ProfileSources {
 const sources: ProfileSources = {};
 for (const platform of PLATFORMS) if (steps[platform]?.snapshotId) sources[platform] = steps[platform]!.snapshotId;
 if (intelligence) sources.intelligence = intelligence;
 return sources;
}
