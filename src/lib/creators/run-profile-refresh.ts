import { PLATFORMS, RefreshAccounts } from "./refresh-policy";
import type { Platform } from "@/lib/calculator/types";

type RefreshReply = { success: boolean; error?: string; id?: string; token?: string; accounts?: RefreshAccounts };
export type RefreshTransport = (body: Record<string, unknown>) => Promise<RefreshReply>;
export type RefreshProgress = { stage: "starting" | "collecting" | "analyzing" | "done"; platform?: Platform };

/** Browser coordinator: the same separate-request sequence as the working calculator. */
export async function runProfileRefresh(request: RefreshTransport, progress: (value: RefreshProgress) => void) {
 progress({ stage: "starting" });
 const start = await request({ action: "start" });
 if (!start.success || !start.id || !start.token || !start.accounts) throw new Error(start.error || "Could not start the refresh.");
 const session = { id: start.id, token: start.token };
 const visited = new Set<Platform>();
 const accounts = { ...start.accounts };
 try {
  // New discoveries start immediately, even while another original scan is still running.
  const tasks = new Map<Platform, Promise<void>>();
  let failure: Error | undefined;
  const schedule = () => {
   if (failure) return;
   for (const platform of PLATFORMS) {
    if (!accounts[platform] || visited.has(platform)) continue;
    visited.add(platform);
    const task = (async () => {
     progress({ stage: "collecting", platform });
     try {
      const result = await request({ action: "platform", platform, ...session });
      if (!result.success) throw new Error(result.error || `Could not refresh ${platform}.`);
      for (const discovered of PLATFORMS) if (!accounts[discovered] && result.accounts?.[discovered]) accounts[discovered] = result.accounts[discovered];
      schedule();
     } catch (error) { failure = error instanceof Error ? error : new Error(`Could not refresh ${platform}.`); }
    })();
    tasks.set(platform, task);
   }
  };
  schedule();
  let count = 0;
  while (count !== tasks.size) {
   count = tasks.size;
   await Promise.all([...tasks.values()]);
  }
  if (failure) throw failure;
  progress({ stage: "analyzing" });
  const result = await request({ action: "complete", ...session });
  if (!result.success) throw new Error(result.error || "Could not save the refreshed profile.");
  progress({ stage: "done" });
 } catch (error) {
  await request({ action: "fail", ...session }).catch(() => undefined);
  throw error;
 }
}
