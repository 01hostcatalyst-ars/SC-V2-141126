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
  isShort?: boolean;
  isErSample?: boolean;
  engagementRate?: number;
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

export interface InstagramCommentItem {
  id?: string;
  authorUsername?: string;
  text: string;
  date?: string;
  likes?: number;
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
  isEnrichedSample?: boolean;
  postHashtags?: string[];
  taggedUsers?: InstagramTaggedUser[];
  coauthors?: string[];
  photos?: string[];
  videos?: string[];
  location?: string;
  comments?: InstagramCommentItem[];
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
  businessPhone?: string;
  businessAddress?: string;
  city?: string;
  pronouns?: string[];
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
// TIKTOK TYPES
// ==========================================

export interface TikTokVideoItem {
  id: string;
  url: string;
  description: string;
  coverImage: string;
  playCount: number;
  playCountFormatted: string;
  diggCount: number;
  diggCountFormatted: string;
  commentCount: number;
  commentCountFormatted: string;
  shareCount: number;
  shareCountFormatted: string;
  favoritesCount: number;
  favoritesCountFormatted: string;
  createDate?: string;
  postType?: string;
  isPinned?: boolean;
  isEnrichedSample?: boolean;
}

export interface TikTokProfile {
  username: string;
  nickname: string;
  biography: string;
  avatarUrl: string;
  isVerified: boolean;
  isCommerceUser: boolean;
  isPrivate: boolean;
  bioLink?: string;
  followerCount: number;
  followerCountFormatted: string;
  followingCount: number;
  followingCountFormatted: string;
  heartCount: number;
  heartCountFormatted: string;
  videoCount: number;
  videoCountFormatted: string;
  createTime?: string;
}

export interface TikTokScraperData {
  profile: TikTokProfile;
  videos: TikTokVideoItem[];
  stats: {
    totalVideosFetched: number;
    avgViewsPerVideo: number;
    avgViewsFormatted: string;
    avgLikesPerVideo: number;
    avgLikesFormatted: string;
    avgCommentsPerVideo: number;
    avgCommentsFormatted: string;
    avgSharesPerVideo: number;
    avgSharesFormatted: string;
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

