export interface YouTubeCommentItem {
  id: string;
  authorDisplayName: string;
  authorProfileImageUrl?: string;
  authorChannelUrl?: string;
  textDisplay: string;
  likeCount: number;
  publishedAt: string;
}

export interface YouTubeVideoItem {
  id: string;
  title: string;
  description: string;
  publishedAt: string;
  thumbnailUrl: string;
  durationIso: string;
  durationSeconds: number;
  durationFormatted: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  tags?: string[];
  url: string;
  comments: YouTubeCommentItem[];
}

export interface YouTubeExternalLink {
  title: string;
  url: string;
  domain: string;
}

export interface YouTubeChannelProfile {
  id: string;
  title: string;
  customUrl?: string;
  handle?: string;
  description: string;
  publishedAt: string;
  country?: string;
  avatarUrl: string;
  bannerUrl?: string;
  subscriberCount: number;
  subscriberCountFormatted: string;
  lifetimeViewCount: number;
  lifetimeViewCountFormatted: string;
  videoCount: number;
  avgViewsPerVideo: number;
  keywords?: string[];
  topicCategories?: string[];
  extractedEmail?: string;
  externalLinks: YouTubeExternalLink[];
  uploadsPlaylistId: string;
}

export interface YouTubeScraperData {
  channel: YouTubeChannelProfile;
  longVideos: YouTubeVideoItem[];
  shortVideos: YouTubeVideoItem[];
  stats: {
    totalLongVideosFetched: number;
    totalShortVideosFetched: number;
    avgLongVideoViews: number;
    avgShortVideoViews: number;
    avgLongEngagementRate: number;
    avgShortEngagementRate: number;
  };
  scrapedAt: string;
  isCached?: boolean;
  cacheAgeHours?: number;
}

export interface ScraperResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  details?: string;
}
