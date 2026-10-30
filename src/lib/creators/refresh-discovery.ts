import type { Platform } from "@/lib/calculator/types";
import type { RefreshAccounts } from "./refresh-policy";

const RESERVED = new Set(["watch", "playlist", "shorts", "reel", "reels", "p", "explore", "stories", "accounts", "share", "login", "search", "embed"]);
export function accountHandle(platform: Platform, input: string): string | null {
 let value = input.trim();
 if (!value) return null;
 if (/https?:|\.com\//i.test(value)) {
  try {
   const url = new URL(/^https?:/i.test(value) ? value : `https://${value}`);
   const hostname = url.hostname.toLowerCase().replace(/^www\./, "");
   const domain = platform === "youtube" ? "youtube.com" : `${platform}.com`;
   if (hostname !== domain && hostname !== `m.${domain}`) return null;
   const parts = url.pathname.split("/").filter(Boolean);
   if (platform === "youtube" && ["channel", "c", "user"].includes(parts[0])) value = parts[1] || "";
   else value = parts[0] || "";
  } catch { return null; }
 }
 value = value.replace(/^@+/, "").replace(/\/+$/, "");
 // YouTube channel IDs are case-sensitive; handles are normalized separately.
 if (platform === "youtube" && /^UC[a-zA-Z0-9_-]{22}$/.test(value)) return value;
 value = value.toLowerCase();
 if (RESERVED.has(value) || !/^[a-z0-9._-]{1,100}$/i.test(value)) return null;
 return value;
}

/** Direct platform links only; existing relationships always win. */
export function discoverRefreshAccounts(texts: string[], existing: RefreshAccounts): RefreshAccounts {
 const found: RefreshAccounts = {};
 for (const text of texts) {
  const matches = text.match(/(?:https?:\/\/)?(?:www\.|m\.)?(?:youtube\.com|instagram\.com|tiktok\.com)\/[^\s<>"'\[\]{}]+/gi) || [];
  for (let url of matches) {
   url = url.replace(/[),;.!]+$/, "");
   if (!/^https?:/i.test(url)) url = `https://${url}`;
   let hostname: string;
   try { hostname = new URL(url).hostname.toLowerCase().replace(/^(www|m)\./, ""); } catch { continue; }
   const platform: Platform | undefined = hostname === "youtube.com" ? "youtube" : hostname === "instagram.com" ? "instagram" : hostname === "tiktok.com" ? "tiktok" : undefined;
   if (!platform || existing[platform] || found[platform]) continue;
   const handle = accountHandle(platform, url);
   if (handle) found[platform] = handle;
  }
 }
 return found;
}
