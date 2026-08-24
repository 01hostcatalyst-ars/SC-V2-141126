# SignCollab Scraper & Calculator Data Architecture Report

This report provides an exhaustive, code-level analysis of what data is scraped, how many posts/videos and comments are extracted, and how data flows across both the **Calculator** (`/calculator`) and the **Dedicated Scrapers** (`/scrapers/instagram`, `/scrapers/tiktok`, `/scrapers/youtube`).

---

## 1. Quick Summary Table

| Platform | Scraper Engine | Posts / Videos Count | Comments Scraped | 24h DB Cache? |
| :--- | :--- | :--- | :--- | :--- |
| **YouTube** | Official Google YouTube Data API v3 | **20 Videos** (10 Long-Form + 10 Shorts) | **Top 30 Comments** (5 comments × 3 Long + 5 comments × 3 Shorts) | ✅ Yes (`youtube_scrapes`) |
| **Instagram (Calculator)** | Bright Data Profile Dataset (`fastMode`) | **12 Recent Unpinned Posts** | **Total Comments Count** (Numerical sum & averages) | ✅ Yes (`instagram_scrapes`) |
| **Instagram (Dedicated Scraper)** | Bright Data 2-Process Deep Pipeline | **12 Posts + Deep Media/Tagged Users/Coauthors** | **Total Comments Count** + Detailed post metrics | ✅ Yes (`instagram_scrapes`) |
| **TikTok** | Bright Data TikTok Dataset | **Up to 15 Recent/Top Videos** | **Total Comments Count** per video | ✅ Yes (`tiktok_scrapes`) |

---

## 2. Platform-by-Platform Detailed Breakdown

### A. YouTube Scraper

* **Code Location**: [`src/lib/scrapers/youtube/client.ts`](file:///d:/BrandBridge%20v1/src/lib/scrapers/youtube/client.ts) & [`src/lib/scrapers/youtube/storage.ts`](file:///d:/BrandBridge%20v1/src/lib/scrapers/youtube/storage.ts)
* **API Used**: YouTube Data API v3 (`https://www.googleapis.com/youtube/v3`)

#### 1. Profile Data Extracted:
* Channel Title, Custom Handle (`@username`), Channel ID.
* Full Description & Extracted Business Inquiries Email.
* Country Code, Channel Creation Date (`publishedAt`).
* High-res Avatar & Channel Banner Art.
* Total Lifetime Subscriber Count.
* Total Lifetime Channel Video Count.
* Total Lifetime Channel Views Count.
* Average Views per Video (Calculated across channel lifetime).
* Topic Categories (Freebase topics) & Channel Keywords/Tags.
* Official Header External Social Links (Instagram, TikTok, Twitter, Website).

#### 2. Video Posts Count:
* Paginates through channel uploads (up to 200 items max) to strictly collect:
  * **10 Long-Form Videos** (Duration > 60 seconds)
  * **10 YouTube Shorts** (Duration ≤ 60 seconds)
  * **Total: 20 Videos**
* For each video: Title, Description, Published Date, Duration (ISO & Seconds), View Count, Like Count, Comment Count, Tags, High-res Thumbnails.

#### 3. Comments Scraped:
* **YES, full text comments with authors are scraped:**
  * Fetches the **top 5 most recent comments** for the **3 most recent Long videos** (up to 15 comments).
  * Fetches the **top 5 most recent comments** for the **3 most recent Shorts** (up to 15 comments).
  * **Total Comments Scraped: Up to 30 individual comment objects** containing:
    * `authorDisplayName`, `authorProfileImageUrl`, `authorChannelUrl`, `textDisplay`, `likeCount`, `publishedAt`.

#### 4. Derived Analytics:
* `avgLongVideoViews`, `avgShortVideoViews`
* `avgLongEngagementRate`, `avgShortEngagementRate`

---

### B. Instagram Scraper

* **Code Location**: [`src/lib/scrapers/instagram/client.ts`](file:///d:/BrandBridge%20v1/src/lib/scrapers/instagram/client.ts) & [`src/lib/scrapers/instagram/storage.ts`](file:///d:/BrandBridge%20v1/src/lib/scrapers/instagram/storage.ts)
* **API Used**: Bright Data Enterprise Dataset (`gd_l1vikfch901nx3by4` & `gd_lk5ns7kz21pck8jpis`)

#### 1. Profile Data Extracted:
* Username, Full Name, User ID (`id` / `fbid`).
* Full Biography, Extracted Emails from Bio.
* HD Avatar URL (`profile_pic_url_hd`).
* Verification Status (`isVerified`), Business Account flag (`isBusinessAccount`), Private status.
* Total Followers Count, Total Following Count, Total Posts Count.
* External Bio URLs (Website, Linktree, YouTube/TikTok links).
* Bio Hashtags & Business Category Name.

#### 2. Posts Scraped (12 Unpinned Posts):
* Analyzes the profile's post grid and automatically **filters out pinned posts** to ensure only the **12 most recent chronological posts** are analyzed.
* For each post: Shortcode, Post URL, Image/Video URLs, Caption, Content Type (`Image`, `Video`, `Sidecar/Carousel`), Datetime, Like Count, Comment Count, Post Hashtags.

#### 3. Comments Scraped:
* **Numerical Metrics Scraped**: Extracts the exact comment count for all 12 posts (`commentsCount`).
* Calculates the creator's true **Average Comments per Post** and **Average Engagement Rate**.
* *(Individual comment text threads are not scraped on Instagram to avoid rate limits and optimize speed).*

#### 4. Difference between Calculator vs. Dedicated Scraper:
* **In Calculator (`/api/calculator/import`)**: Runs in **Fast Mode** (`fastMode: true`) to respond in < 5 seconds for instant valuation calculations.
* **In Dedicated Scraper (`/scrapers/instagram`)**: Runs **Full Process 2 Deep Enrichment**, batch-querying each post URL to additionally extract:
  * High-res carousel photo arrays (`photos[]`)
  * Full video stream URLs (`videos[]`)
  * Tagged users with IDs and profile pictures (`taggedUsers[]`)
  * Co-author producers (`coauthors[]`)
  * Exact location metadata (`location`)
  * Accessibility Alt Text (`altText`)

---

### C. TikTok Scraper

* **Code Location**: [`src/lib/scrapers/tiktok/client.ts`](file:///d:/BrandBridge%20v1/src/lib/scrapers/tiktok/client.ts) & [`src/lib/scrapers/tiktok/storage.ts`](file:///d:/BrandBridge%20v1/src/lib/scrapers/tiktok/storage.ts)
* **API Used**: Bright Data TikTok Dataset (`gd_l1villgoiiidt09ci`)

#### 1. Profile Data Extracted:
* Username (`account_id`), Display Nickname.
* Full Biography (`signature`), Bio Link (Website, Linktree, Socials).
* HD Profile Avatar (`profile_pic_url_hd`).
* Verification status (`is_verified`), Commerce user flag (`is_commerce_user`).
* Total Followers Count, Total Following Count.
* Total Lifetime Likes/Hearts Count (`heartCount`).
* Total Lifetime Video Uploads Count (`videoCount`).

#### 2. Video Posts Count:
* Scrapes **up to 15 recent / top videos**.
* For each video: Video ID, Direct Video URL, Cover Image / Thumbnail, Play Count (Views), Digg Count (Likes), Comment Count, Share Count, Favorites/Saves Count, Video Description, Creation Date.

#### 3. Comments Scraped:
* Scrapes the exact **Comment Count per video** (`commentCount`).
* Used to compute the creator's true **Average Comments per Video** and **Share Rate**.

#### 4. Derived Analytics:
* `avgViewsPerVideo`, `avgLikesPerVideo`, `avgCommentsPerVideo`, `avgSharesPerVideo`.
* Total Engagement Rate: `((likes + comments + shares) / views) * 100`.

---

## 3. How the Calculator Consumes this Scraped Data

When a creator is imported into the **SignCollab Rate Calculator** ([`src/app/api/calculator/import/route.ts`](file:///d:/BrandBridge%20v1/src/app/api/calculator/import/route.ts)):

1. **Scraper Extraction**:
   * Follower Count
   * 3-Post/Video Average Likes, Comments, Views, and Shares
   * 15 Recent Titles / Captions
   * Bio, Bio Link, Language, Country Hint
2. **Gemini 3.7 Flash AI Enrichment**:
   * Reads the 15 titles, bio, and hashtags.
   * Classifies creator into **1 Primary Niche** + **2 Secondary Niches**.
   * Generates a **2-sentence Executive Summary**.
   * Identifies Country Code (ISO-2).
3. **16-Knot Valuation Engine**:
   * Evaluates the follower count against platform-native 16 piecewise knots.
   * Compares the creator's actual ER against the platform benchmark ER.
   * Calculates rate cards across Instagram Reels, TikTok Videos, and YouTube Long/Short deliverables.
4. **Database Persistence**:
   * The new snapshot row is stored in PostgreSQL (`youtube_scrapes`, `instagram_scrapes`, or `tiktok_scrapes`) with a timestamp.
   * Past historical records are **never deleted**.
