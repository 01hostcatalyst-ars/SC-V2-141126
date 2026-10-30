import type { MultiPlatformCreatorInput } from "@/lib/ai/gemini";
import { REGIONAL_CONFIG } from "@/lib/calculator/constants";
import type { RegionCode } from "@/lib/calculator/types";
import type { YouTubeScraperData, InstagramScraperData, TikTokScraperData } from "@/lib/scrapers/types";

export interface RefreshPlatformData { youtube?: YouTubeScraperData; instagram?: InstagramScraperData; tiktok?: TikTokScraperData }

/** Matches the active Rate Radar synthesis payload, including its sample/comment limits. */
export function buildRefreshInput(name: string, data: RefreshPlatformData, fallbackRegion: RegionCode): MultiPlatformCreatorInput {
 const ytCountry = data.youtube?.channel.country?.toUpperCase() as RegionCode | undefined;
 const region = ytCountry && REGIONAL_CONFIG[ytCountry] ? ytCountry : fallbackRegion;
 const input: MultiPlatformCreatorInput = {
  creatorName: name,
  primaryPlatform: data.youtube ? "youtube" : data.instagram ? "instagram" : "tiktok",
  reportedCountry: REGIONAL_CONFIG[region]?.name || region,
  youtubeScrapeId: data.youtube?.snapshotId,
  instagramScrapeId: data.instagram?.snapshotId,
  tiktokScrapeId: data.tiktok?.snapshotId,
 };
 if (data.youtube) {
  const { channel, longVideos, shortVideos, stats } = data.youtube;
  const videos = [...longVideos, ...shortVideos];
  const sample = longVideos.filter(video => video.isErSample);
  const target = sample.length ? sample : longVideos;
  const avg = (key: "likeCount" | "commentCount" | "viewCount") => target.length ? Math.round(target.reduce((sum, video) => sum + (video[key] || 0), 0) / target.length) : 0;
  const views = target.length ? (stats.avgLongVideoViews || avg("viewCount")) : 0;
  let longEr = stats.avgLongEngagementRate || 0;
  if (!longEr && views > 0 && (avg("likeCount") > 0 || avg("commentCount") > 0)) longEr = Number((((avg("likeCount") + avg("commentCount")) / views) * 100).toFixed(2));
  const shortSample = shortVideos.filter(video => video.isErSample);
  const shortTarget = shortSample.length ? shortSample : shortVideos;
  const shortAvg = (key: "likeCount" | "commentCount" | "viewCount") => shortTarget.length ? Math.round(shortTarget.reduce((sum, video) => sum + (video[key] || 0), 0) / shortTarget.length) : 0;
  const shortViews = stats.avgShortVideoViews || shortAvg("viewCount");
  let shortEr = stats.avgShortEngagementRate || 0;
  if (!shortEr && shortViews > 0 && (shortAvg("likeCount") > 0 || shortAvg("commentCount") > 0)) shortEr = Number((((shortAvg("likeCount") + shortAvg("commentCount")) / shortViews) * 100).toFixed(2));
  const er = longEr || shortEr || 0;
  input.youtube = { handle: (channel.handle || channel.title || "").replace(/^@+/, ""), title: channel.title, subscriberCount: channel.subscriberCount,
   avgViews: views, country: channel.country, observedEr: er,
   recentTitles: videos.map(video => video.title).filter((value): value is string => typeof value === "string" && value.length > 0).slice(0, 15),
   topComments: videos.slice(0, 5).flatMap(video => (video.comments || []).slice(0, 5).map(comment => comment.textDisplay).filter((value): value is string => typeof value === "string" && value.length > 0)) };
 }
 if (data.instagram) {
  const { profile, posts, stats } = data.instagram;
  const er = stats.avgEngagementRate || (profile.followerCount > 0 ? Number((((stats.avgLikesPerPost + stats.avgCommentsPerPost) / profile.followerCount) * 100).toFixed(2)) : 0);
  input.instagram = { username: profile.username.replace(/^@+/, ""), fullName: profile.fullName, city: profile.city,
   followerCount: profile.followerCount, avgLikes: stats.avgLikesPerPost, observedEr: er,
   recentCaptions: posts.map(post => post.caption).filter((value): value is string => typeof value === "string" && value.length > 0).slice(0, 12),
   topComments: posts.slice(0, 4).flatMap(post => (post.comments || []).slice(0, 5).map(comment => comment.text).filter((value): value is string => typeof value === "string" && value.length > 0)) };
 }
 if (data.tiktok) {
  const { profile, videos, stats } = data.tiktok;
  const er = stats.avgEngagementRate || (stats.avgViewsPerVideo > 0 ? Number((((stats.avgLikesPerVideo + stats.avgCommentsPerVideo + stats.avgSharesPerVideo) / stats.avgViewsPerVideo) * 100).toFixed(2)) : 0);
  input.tiktok = { username: profile.username.replace(/^@+/, ""), nickname: profile.nickname,
   followerCount: profile.followerCount, avgViews: stats.avgViewsPerVideo, observedEr: er,
   recentDescriptions: videos.map(video => video.description).filter((value): value is string => typeof value === "string" && value.length > 0).slice(0, 12),
   topComments: videos.slice(0, 5).flatMap(video => (video.comments || []).slice(0, 5).map(comment => comment.text).filter((value): value is string => typeof value === "string" && value.length > 0)) };
 }
 return input;
}
