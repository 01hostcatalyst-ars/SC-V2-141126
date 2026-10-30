import { inactiveScraperMessage } from "./refresh-errors";
import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { Prisma, CreatorProfileRefresh } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { generateCompleteCreatorIntelligence } from "@/lib/ai/gemini";
import { resolveFullCreatorProfile } from "./profile-resolver";
import { latestProfileRefresh } from "./refresh-records";
import { accountHandle, discoverRefreshAccounts } from "./refresh-discovery";
import { buildRefreshInput, RefreshPlatformData } from "./refresh-input";
import { PLATFORMS, REFRESH_LIFETIME_MS, refreshIsDue, sourcesFromSteps, RefreshAccounts, RefreshSteps, RefreshStatus } from "./refresh-policy";
import type { Platform } from "@/lib/calculator/types";
import { scrapeYouTube, insertNewYouTubeSnapshot, formatDbRecordToScraperData } from "@/lib/scrapers/youtube";
import { scrapeInstagram, insertNewInstagramSnapshot, formatDbRecordToInstagramData } from "@/lib/scrapers/instagram";
import { scrapeTikTok, insertNewTikTokSnapshot, formatDbRecordToTikTokData } from "@/lib/scrapers/tiktok";

export class ProfileRefreshError extends Error {
 constructor(public code: string, message: string, public status = 409) { super(message); }
}
const json = (value: unknown) => JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
const tokenDigest = (token: string) => createHash("sha256").update(token).digest("hex");
function checkToken(run: CreatorProfileRefresh, token: string) {
 const actual = Buffer.from(tokenDigest(token));
 const expected = Buffer.from(run.tokenHash);
 if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) throw new ProfileRefreshError("INVALID_TOKEN", "This refresh session is not valid.", 403);
}
function checkActive(run: CreatorProfileRefresh) {
 if (run.expiresAt.getTime() <= Date.now()) throw new ProfileRefreshError("EXPIRED", "This refresh expired. Please try again.");
 if (!["collecting", "analyzing"].includes(run.status)) throw new ProfileRefreshError("CLOSED", "This refresh is already closed.");
}
async function lockedRun<T>(slug: string, id: string, token: string, action: (tx: Prisma.TransactionClient, run: CreatorProfileRefresh) => Promise<T>) {
 return prisma.$transaction(async tx => {
  await tx.$queryRaw`SELECT id FROM creator_profile_refreshes WHERE id = ${id} FOR UPDATE`;
  const run = await tx.creatorProfileRefresh.findUnique({ where: { id } });
  if (!run) throw new ProfileRefreshError("NOT_FOUND", "Refresh not found.", 404);
  const cluster = await tx.creatorIdentityCluster.findUnique({ where: { id: run.clusterId }, select: { slug: true } });
  if (!cluster || cluster.slug !== slug) throw new ProfileRefreshError("NOT_FOUND", "Refresh not found.", 404);
  checkToken(run, token);
  return action(tx, run);
 }, { timeout: 15000 });
}

export async function profileRefreshStatus(slug: string): Promise<RefreshStatus> {
 const profile = await resolveFullCreatorProfile(slug);
 if (!profile) throw new ProfileRefreshError("NOT_FOUND", "Creator not found.", 404);
 // Detect a missing additive schema separately from the legacy profile fallback.
 await prisma.creatorProfileRefresh.count({ where: { clusterId: profile.clusterId } });
 const run = await latestProfileRefresh(profile.clusterId);
 const active = !!run && ["collecting", "analyzing"].includes(run.status) && run.expiresAt.getTime() > Date.now();
 return { available: true, eligible: refreshIsDue(profile.freshness?.oldestSourceAt), active,
  oldestSourceAt: profile.freshness?.oldestSourceAt || null, stage: active ? run!.status : undefined };
}

export async function startProfileRefresh(slug: string) {
 const baseline = await resolveFullCreatorProfile(slug);
 if (!baseline) throw new ProfileRefreshError("NOT_FOUND", "Creator not found.", 404);
 if (!refreshIsDue(baseline.freshness?.oldestSourceAt)) throw new ProfileRefreshError("FRESH", "This profile is already up to date.");
 const checkedAt = new Date();
 const token = randomBytes(32).toString("hex");
 const run = await prisma.$transaction(async tx => {
  // Serializes starts from different tabs/visitors without modifying the identity row.
  await tx.$queryRaw`SELECT id FROM creator_identity_clusters WHERE id = ${baseline.clusterId} FOR UPDATE`;
  const cluster = await tx.creatorIdentityCluster.findUniqueOrThrow({ where: { id: baseline.clusterId } });
  await tx.creatorProfileRefresh.updateMany({ where: { clusterId: cluster.id, status: { in: ["collecting", "analyzing"] }, expiresAt: { lte: new Date() } }, data: { status: "failed" } });
  const previous = await tx.creatorProfileRefresh.findFirst({ where: { clusterId: cluster.id }, orderBy: { createdAt: "desc" } });
  if (previous && ["collecting", "analyzing"].includes(previous.status)) throw new ProfileRefreshError("BUSY", "A refresh is already in progress for this creator.");
  if (previous?.completedAt && previous.completedAt >= checkedAt) throw new ProfileRefreshError("FRESH", "This profile was just refreshed. Reload the page.");
  const accounts: RefreshAccounts = {};
  for (const [platform, value] of [["youtube", cluster.youtubeHandle], ["instagram", cluster.instagramUsername], ["tiktok", cluster.tiktokUsername]] as const) {
   if (value) {
    const handle = accountHandle(platform, value);
    if (!handle) throw new ProfileRefreshError("INVALID_ACCOUNT", `The saved ${platform} account needs review.`);
    accounts[platform] = handle;
   }
  }
  if (!Object.keys(accounts).length) throw new ProfileRefreshError("NO_ACCOUNTS", "No platform accounts are linked to this creator.");
  const sameAccounts = previous && PLATFORMS.every(platform => (previous.accounts as RefreshAccounts)[platform] === accounts[platform]);
  if (previous?.status === "completed" && sameAccounts && !refreshIsDue(previous.oldestSourceAt)) throw new ProfileRefreshError("FRESH", "This profile was just refreshed. Reload the page.");
  return tx.creatorProfileRefresh.create({ data: { clusterId: cluster.id, tokenHash: tokenDigest(token), accounts: json(accounts), steps: {}, baselineProfile: json(baseline), expiresAt: new Date(Date.now() + REFRESH_LIFETIME_MS) } });
 }, { timeout: 15000 });
 return { id: run.id, token, accounts: run.accounts as RefreshAccounts };
}

export async function refreshPlatform(slug: string, id: string, token: string, platform: Platform) {
 const input = await lockedRun(slug, id, token, async (tx, run) => {
  checkActive(run);
  if (run.status !== "collecting") throw new ProfileRefreshError("ANALYZING", "Platform collection has already finished.");
  const accounts = run.accounts as RefreshAccounts;
  const steps = run.steps as RefreshSteps;
  if (!accounts[platform]) throw new ProfileRefreshError("UNKNOWN_ACCOUNT", "This account was not linked or discovered.", 400);
  if (steps[platform]?.status === "done") return null;
  if (steps[platform]?.status === "running") throw new ProfileRefreshError("SCANNING", "This platform is already being fetched.");
  if (steps[platform]?.status === "error") throw new ProfileRefreshError("FAILED", "This platform failed. Start a new refresh.");
  await tx.creatorProfileRefresh.update({ where: { id }, data: { steps: json({ ...steps, [platform]: { status: "running" } }) } });
  return accounts[platform]!;
 });
 if (!input) {
  const run = await prisma.creatorProfileRefresh.findUniqueOrThrow({ where: { id } });
  return { accounts: run.accounts as RefreshAccounts };
 }
 try {
  let snapshotId: string | undefined;
  let handle = "";
  let texts: string[] = [];
  if (platform === "youtube") {
   const live = await scrapeYouTube(input);
   handle = live.channel.handle?.replace(/^@+/, "") || live.channel.id;
   if (accountHandle(platform, handle) !== input && live.channel.id !== input) throw new ProfileRefreshError("ACCOUNT_MISMATCH", "The returned YouTube account did not match the saved identity.");
   const saved = await insertNewYouTubeSnapshot(live);
   snapshotId = saved.snapshotId;
   texts = [saved.channel.description || "", ...saved.channel.externalLinks.map(link => link.url || "")];
  } else if (platform === "instagram") {
   const live = await scrapeInstagram(input, { fastMode: false });
   handle = live.profile.username;
   if (accountHandle(platform, handle) !== input) throw new ProfileRefreshError("ACCOUNT_MISMATCH", "The returned Instagram account did not match the saved identity.");
   if (live.profile.isPrivate || (live.profile.postsCount > 0 && !live.posts.length)) throw new ProfileRefreshError("INCOMPLETE", "Instagram did not return usable public posts.");
   const saved = await insertNewInstagramSnapshot(live);
   snapshotId = saved.snapshotId;
   texts = [saved.profile.biography || "", ...(saved.profile.externalUrls || []).map(link => link.url || "")];
  } else {
   const live = await scrapeTikTok(input);
   handle = live.profile.username;
   if (accountHandle(platform, handle) !== input) throw new ProfileRefreshError("ACCOUNT_MISMATCH", "The returned TikTok account did not match the saved identity.");
   if (live.profile.isPrivate || (live.profile.videoCount > 0 && !live.videos.length)) throw new ProfileRefreshError("INCOMPLETE", "TikTok did not return usable public videos.");
   const saved = await insertNewTikTokSnapshot(live);
   snapshotId = saved.snapshotId;
   texts = [saved.profile.biography || "", saved.profile.bioLink || ""];
  }
  if (!snapshotId) throw new ProfileRefreshError("SAVE_FAILED", "The new platform snapshot was not saved.", 503);
  return await lockedRun(slug, id, token, async (tx, run) => {
   checkActive(run);
   if (run.status !== "collecting") throw new ProfileRefreshError("CLOSED", "This refresh stopped before the platform could be saved.");
   const accounts = run.accounts as RefreshAccounts;
   const steps = run.steps as RefreshSteps;
   const discovered = discoverRefreshAccounts(texts, accounts);
   const updatedAccounts = { ...accounts, ...discovered };
   const cluster = await tx.creatorIdentityCluster.findUniqueOrThrow({ where: { id: run.clusterId } });
   const field = platform === "youtube" ? "youtubeHandle" : platform === "instagram" ? "instagramUsername" : "tiktokUsername";
   // Newly discovered channel-ID URLs can be stored under the canonical returned handle.
   // Never replace an account relationship that was already saved.
   if (!cluster[field]) updatedAccounts[platform] = accountHandle(platform, handle) || accounts[platform];
   await tx.creatorProfileRefresh.update({ where: { id }, data: { accounts: json(updatedAccounts), steps: json({ ...steps, [platform]: { status: "done", snapshotId, handle } }) } });
   return { accounts: updatedAccounts };
  });
 } catch (error) {
  await lockedRun(slug, id, token, async (tx, run) => {
   if (run.status !== "collecting") return;
   const steps = run.steps as RefreshSteps;
   await tx.creatorProfileRefresh.update({ where: { id }, data: { steps: json({ ...steps, [platform]: { status: "error" } }) } });
  }).catch(() => undefined);
  const unavailable = inactiveScraperMessage(error, platform);
  if (unavailable) {
   console.error(`[Profile refresh: ${platform}] Bright Data rejected the request: Customer is not active. Check the provider account associated with BRIGHTDATA_API_KEY.`);
   throw new ProfileRefreshError("PROVIDER_INACTIVE", unavailable, 503);
  }
  throw error;
 }
}

async function loadCollectedData(run: CreatorProfileRefresh): Promise<RefreshPlatformData> {
 const steps = run.steps as RefreshSteps;
 const data: RefreshPlatformData = {};
 if (steps.youtube?.snapshotId) data.youtube = formatDbRecordToScraperData(await prisma.youTubeScrape.findUniqueOrThrow({ where: { id: steps.youtube.snapshotId } }));
 if (steps.instagram?.snapshotId) data.instagram = formatDbRecordToInstagramData(await prisma.instagramScrape.findUniqueOrThrow({ where: { id: steps.instagram.snapshotId } }));
 if (steps.tiktok?.snapshotId) data.tiktok = formatDbRecordToTikTokData(await prisma.tikTokScrape.findUniqueOrThrow({ where: { id: steps.tiktok.snapshotId } }));
 return data;
}

export async function completeProfileRefresh(slug: string, id: string, token: string) {
 const run = await lockedRun(slug, id, token, async (tx, current) => {
  checkActive(current);
  if (current.status !== "collecting") throw new ProfileRefreshError("ANALYZING", "Analysis is already in progress.");
  const accounts = current.accounts as RefreshAccounts;
  const steps = current.steps as RefreshSteps;
  if (!Object.keys(accounts).length || Object.keys(accounts).some(platform => steps[platform as Platform]?.status !== "done")) throw new ProfileRefreshError("INCOMPLETE", "All linked and discovered platforms must finish successfully first.");
  return tx.creatorProfileRefresh.update({ where: { id }, data: { status: "analyzing" } });
 });
 const data = await loadCollectedData(run);
 const baseline = run.baselineProfile as unknown as import("./profile-resolver").FullResolvedCreatorProfile;
 const input = buildRefreshInput(baseline.brandName || baseline.canonicalName, data, baseline.countryCode);
 // Same generator and prompt; bypass cache. It inserts a new intelligence record.
 // Calling it directly avoids synthesis-route updateMany writes to historical scrapes.
 await generateCompleteCreatorIntelligence(input, true);
 const intel = await prisma.creatorIntelligence.findFirst({ where: {
  youtubeScrapeId: data.youtube?.snapshotId || null,
  instagramScrapeId: data.instagram?.snapshotId || null,
  tiktokScrapeId: data.tiktok?.snapshotId || null,
  createdAt: { gte: run.createdAt },
 }, orderBy: { createdAt: "desc" } });
 if (!intel) throw new ProfileRefreshError("SAVE_FAILED", "The new analysis could not be saved. Please try again.", 503);
 // Attach before further work so failed refresh analysis is distinguishable from normal calculator analysis.
 await lockedRun(slug, id, token, async (tx, current) => {
  checkActive(current);
  await tx.creatorProfileRefresh.update({ where: { id }, data: { intelligenceId: intel.id } });
 });
 const sources = sourcesFromSteps(run.steps as RefreshSteps, intel.id);
 const accounts = run.accounts as RefreshAccounts;
 const profile = await resolveFullCreatorProfile(slug, { sources, accounts });
 if (!profile || !profile.freshness?.oldestSourceAt) throw new ProfileRefreshError("INCOMPLETE", "The refreshed profile could not be assembled from its saved sources.");
 await lockedRun(slug, id, token, async (tx, current) => {
  checkActive(current);
  if (current.status !== "analyzing") throw new ProfileRefreshError("CLOSED", "This refresh is no longer active.");
  await tx.$queryRaw`SELECT id FROM creator_identity_clusters WHERE id = ${current.clusterId} FOR UPDATE`;
  const cluster = await tx.creatorIdentityCluster.findUniqueOrThrow({ where: { id: current.clusterId } });
  const additions: { youtubeHandle?: string; instagramUsername?: string; tiktokUsername?: string } = {};
  for (const [platform, field] of [["youtube", "youtubeHandle"], ["instagram", "instagramUsername"], ["tiktok", "tiktokUsername"]] as const) {
   if (!accounts[platform]) continue;
   if (cluster[field] && accountHandle(platform, cluster[field]!) !== accounts[platform]) throw new ProfileRefreshError("IDENTITY_CHANGED", "Linked accounts changed during this refresh. Please reload the profile.");
   if (!cluster[field]) {
    const other = await tx.creatorIdentityCluster.findFirst({ where: { [field]: accounts[platform], id: { not: cluster.id } }, select: { id: true } });
    if (other) throw new ProfileRefreshError("IDENTITY_CONFLICT", "A discovered account belongs to another saved creator and needs review.");
    additions[field] = accounts[platform];
   }
  }
  if (Object.keys(additions).length) await tx.creatorIdentityCluster.update({ where: { id: cluster.id }, data: additions });
  await tx.creatorProfileRefresh.update({ where: { id }, data: { status: "completed", oldestSourceAt: new Date(profile.freshness!.oldestSourceAt!), completedAt: new Date() } });
 });
 return { success: true };
}

export async function failProfileRefresh(slug: string, id: string, token: string) {
 return lockedRun(slug, id, token, async (tx, run) => {
  if (["collecting", "analyzing"].includes(run.status)) await tx.creatorProfileRefresh.update({ where: { id }, data: { status: "failed" } });
  return { success: true };
 });
}
