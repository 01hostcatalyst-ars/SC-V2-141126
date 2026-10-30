import type { FullResolvedCreatorProfile } from "./profile-resolver";

export interface PerformanceSample {
  id?: string;
  title: string;
  thumbnailUrl?: string;
  url?: string;
  publishedAt?: string;
  metric?: number;
  views?: number;
  likes?: number;
  comments?: number;
  shares?: number;
  engagementRate?: number;
}
export interface PerformanceSampleGroup {
  id: string;
  label: string;
  metricLabel: string;
  unit: string;
  items: PerformanceSample[];
}
const rate = (values: Array<number | undefined>, denominator: number | undefined) =>
  denominator && values.every((value) => value !== undefined) ? values.reduce<number>((sum, value) => sum + (value || 0), 0) / denominator * 100 : undefined;
const numeric = (value: unknown): number | undefined => {
  if (value === null || value === undefined || value === "") return undefined;
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 ? number : undefined;
};

/** Only expose parser-selected calculation samples, never an arbitrary latest-N list. */
export function buildPerformanceSamples(
  media: FullResolvedCreatorProfile["recentMedia"],
  platforms: FullResolvedCreatorProfile["platforms"],
): PerformanceSampleGroup[] {
  const groups: PerformanceSampleGroup[] = [];
  const add = (group: PerformanceSampleGroup) => {
    if (group.items.length) groups.push({ ...group, items: group.items.slice().sort((a, b) =>
      (Date.parse(b.publishedAt || "") || 0) - (Date.parse(a.publishedAt || "") || 0)) });
  };
  if (platforms.youtube) {
    for (const short of [false, true]) {
      add({ id: short ? "youtube-short" : "youtube-long", label: short ? "YouTube Shorts" : "YouTube LF", metricLabel: "Views", unit: "video",
        items: media.youtubeVideos.filter((item) => item.isErSample === true && (short ? item.isShort === true : item.isShort !== true)).map((item) => ({
          id: item.id, title: item.title || "Untitled video", thumbnailUrl: item.thumbnailUrl, url: item.url,
          publishedAt: item.publishedAt, metric: numeric(item.viewCount), views: numeric(item.viewCount), likes: numeric(item.likeCount), comments: numeric(item.commentCount), engagementRate: rate([numeric(item.likeCount), numeric(item.commentCount)], numeric(item.viewCount)),
        })),
      });
    }
  }
  if (platforms.instagram) add({ id: "instagram", label: "Instagram", metricLabel: "Likes + comments", unit: "post",
    items: media.instagramPosts.filter((item) => item.isEnrichedSample === true && !item.isPinned).map((item) => {
      const likes = numeric(item.likes);
      const comments = numeric(item.commentsCount);
      return { id: item.id, title: item.caption || "Instagram post", thumbnailUrl: item.imageUrl, url: item.url,
        publishedAt: item.datetime, likes, comments, engagementRate: rate([likes, comments], platforms.instagram?.followerCount), metric: likes === undefined && comments === undefined ? undefined : (likes || 0) + (comments || 0) };
    }),
  });
  if (platforms.tiktok) add({ id: "tiktok", label: "TikTok", metricLabel: "Views", unit: "video",
    items: media.tiktokVideos.filter((item) => item.isEnrichedSample === true && !item.isPinned).map((item) => ({
      id: item.id, title: item.description || "TikTok video", thumbnailUrl: item.coverImage, url: item.url,
      publishedAt: item.createDate, metric: numeric(item.playCount), views: numeric(item.playCount), likes: numeric(item.diggCount), comments: numeric(item.commentCount), shares: numeric(item.shareCount), engagementRate: rate([numeric(item.diggCount), numeric(item.commentCount), numeric(item.shareCount)], numeric(item.playCount)),
    })),
  });
  return groups;
}
