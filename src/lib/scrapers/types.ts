// ==========================================
// YOUTUBE TYPES
// ==========================================

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

// ==========================================
// INSTAGRAM TYPES (PROCESS 1 & PROCESS 2)
// ==========================================

export interface InstagramTaggedUser {
  id?: string;
  username?: string;
  fullName?: string;
  isVerified?: boolean;
  profilePicUrl?: string;
}

export interface InstagramExternalUrl {
  title?: string;
  url: string;
}

export interface InstagramPostItem {
  id: string;
  shortcode?: string;
  url: string;
  caption?: string;
  contentType: 'Image' | 'Video' | 'Carousel' | 'Reel' | string;
  datetime?: string;
  imageUrl: string;
  videoUrl?: string;
  likes: number;
  likesFormatted: string;
  commentsCount: number;
  commentsCountFormatted: string;
  isPinned: boolean;
  postHashtags?: string[];
  taggedUsers?: InstagramTaggedUser[];
  coauthors?: string[];
  photos?: string[];
  videos?: string[];
  altText?: string;
  location?: string;
}

export interface InstagramProfile {
  username: string;
  fullName: string;
  userId?: string;
  fbid?: string;
  biography: string;
  avatarUrl: string;
  isVerified: boolean;
  isBusinessAccount: boolean;
  isPrivate: boolean;
  isJoinedRecently: boolean;
  followerCount: number;
  followerCountFormatted: string;
  followingCount: number;
  followingCountFormatted: string;
  postsCount: number;
  postsCountFormatted: string;
  externalUrls: InstagramExternalUrl[];
  bioHashtags?: string[];
  extractedEmail?: string;
  categoryName?: string;
}

export interface InstagramScraperData {
  profile: InstagramProfile;
  posts: InstagramPostItem[];       // Chronological uploads (12 posts)
  stats: {
    totalPostsFetched: number;
    avgLikesPerPost: number;
    avgLikesFormatted: string;
    avgCommentsPerPost: number;
    avgCommentsFormatted: string;
    avgEngagementRate: number;
  };
  scrapedAt: string;
  isCached?: boolean;
  cacheAgeHours?: number;
}

// ==========================================
// GENERIC SCRAPER RESPONSE WRAPPER
// ==========================================

export interface ScraperResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  details?: string;
}
