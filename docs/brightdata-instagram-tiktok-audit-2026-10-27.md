# Instagram and TikTok: Bright Data collection, storage, usage, and cost audit

Audit date: October 27, 2026, America/Los_Angeles. Some provider test timestamps are October 28 in UTC.

This describes the current implementation, not a proposed replacement. No application source, pricing formula, database schema, stored creator record, or identity relationship was changed for this audit. Live scraper outputs were captured in local diagnostic files; they were not saved to the application database. No live LLM call was made. Browser replay used captured scraper results and previously saved AI intelligence, intercepting write/provider requests.

## 1. Main findings

- **Instagram full collection normally means five delivered records:** one profile and up to four separately enriched posts. TikTok normally means **one delivered profile record**, including nested videos.
- At Bright Data's published pay-as-you-go rate of $1.50 per 1,000 records, these are **$0.0075 per full Instagram profile** and **$0.0015 per TikTok profile**. These are public-rate estimates, not verified invoice debits. Your plan, credits, discounts, and extra runs can change the actual bill.
- Instagram's current profile dataset does not provide usable nested post likes/comments in the live test. Its metadata explicitly marks those nested fields unsupported. The second dataset is necessary for the existing metrics pipeline.
- **The Instagram profile test timed out in the app.** Bright Data completed the same job after 133.735 seconds, outside the two-minute polling budget. Its completed result was retrieved without another profile scrape; enrichment was then tested separately.
- Instagram enrichment returned **60 latest-comment objects, including 42 usable comment texts**. Our parser preserved **zero texts** because it looks for `comments`, while the provider returns `latest_comments`.
- TikTok's selected profile dataset returned no actual comment texts. A comment count is not the comments themselves. Across all latest saved profiles inspected, neither platform had usable stored comment text.
- **`raw_metadata` is not the original Bright Data response.** It is a copy of the application's normalized result. Fields discarded by the parser are not preserved there.
- The active AI caller omits collected biographies and several supported performance/business fields. The prompt has slots for them, but that does not mean they are populated.
- TikTok shares are collected and included in scraper ER and current profile sample-card ER. Final calibrated pricing passes zero shares or omits them. The calculator's individual TikTok audit-card ER also excludes shares. These are existing, different treatments; no formula was changed.
- Instagram's current live sample measured only four posts. All four became core samples. It did **not** trim outliers from twelve fully measured posts.

## 2. What was tested

### Code paths

The mounted rate calculator uses `InfluencerRadarDashboard`, the dedicated `/api/scrapers/instagram` and `/api/scrapers/tiktok` routes, and `/api/calculator/synthesize`. Its main search does not use the older calculator import flow.

The calculator first resolves saved linked accounts and requests them in parallel. Direct platform links discovered in fresh biographies/external URLs can trigger missing platforms. Each ordinary scraper route checks the latest database snapshot against a 24-hour cache before making a paid collection. The mounted calculator does not request Instagram `fastMode`.

Full creator-profile refresh directly invokes the same scraper clients, bypasses platform cache, inserts new snapshots, generates new intelligence, and publishes the completed source bundle. Directory/profile viewing reads saved data and does not itself collect fresh platform data.

### Live results

| Test | Account | Result |
|---|---|---|
| Instagram profile | `glitch_prod` | One profile record, 12 posts, 2,737,034 followers. Application failed at 123.058 seconds. Provider later completed the same job in 133.735 seconds. |
| Instagram enrichment | Four posts from that same profile result | Four post records; client enrichment completed in 22.015 seconds; sample ER 3.14%. The completed profile response was replayed into the unmodified client, so no second profile collection was purchased. |
| TikTok profile | `glitch_productions` | One profile record containing 24 videos and 24 description entries. Application retained 12 videos and selected four. Total client time 142.672 seconds; sample ER 17.80%. |

This was **not a successful uninterrupted ordinary Instagram app run**. Stage one failed its timeout; the follow-up established that its existing job completed and its post enrichment could be parsed. TikTok succeeded normally, after roughly 61 seconds in the synchronous request and another 81 seconds polling its returned snapshot.

Provider snapshot IDs:

- Instagram profile: `sd_mvrobhqjgraheeumt`.
- Instagram posts: `sd_mvrooihu2at1ut7g3y`.
- TikTok profile: `sd_mvrobhq11wsj9z35em`.

### Database evidence

The audit examined table aggregates and the latest snapshot for every stored handle, plus representative GLITCH, Druski, and TWICE records.

| Observation | Instagram | TikTok |
|---|---:|---:|
| Snapshot rows | 1,779 | 894 |
| Distinct stored handles / latest records examined | 1,770 | 889 |
| Latest records with zero ER | 86 | 19 |
| Latest records with no content | 49 | 18 |
| Latest records with exactly four saved core flags | 1,650 | 867 |
| Latest records with usable stored comment text | **0** | **0** |
| Latest records with positive shares | Not collected | 865 |
| Latest records with positive saves | Not collected | 869 |
| Latest records with positive video views | Not collected | 871 |

Zero ER is not proof of a failed request: empty/private profiles, missing/hidden metrics, and historical parser behavior also matter. Some legacy Instagram records have more than four core flags; when no usable engagement metrics exist, the fallback can tag all unpinned posts. Four is not a universal guarantee.

Average stored JSONB value sizes were about 6,157 bytes for Instagram `posts`, plus 7,221 for its `raw_metadata`; TikTok averaged 3,975 for `videos`, plus 4,760 for `raw_metadata`. These are PostgreSQL value-size measurements, not total table/index size or billable cloud-storage usage. Database dollar cost cannot be calculated from these figures alone.

## 3. Instagram: actual requests

### Stage one: profile and initial posts

Dataset: `gd_l1vikfch901nx3by4`.

```http
POST https://api.brightdata.com/datasets/v3/trigger?dataset_id=gd_l1vikfch901nx3by4&include_errors=true&format=json
Authorization: Bearer [environment key]
Content-Type: application/json

[{"url":"https://www.instagram.com/glitch_prod/"}]
```

The client polls `/datasets/v3/progress/{snapshot_id}`, then downloads `/datasets/v3/snapshot/{snapshot_id}?format=json`. Inputs do not specify a number of posts, date range, comment count, discovery search, media download, or custom output-field filter. We use the provider's default returned profile content; this test returned 12 posts.

### Stage two: post metrics

Dataset: `gd_lk5ns7kz21pck8jpis`, also using `/trigger` with polling/download.

The application:

1. Marks explicit/inferred pinned posts.
2. Considers the first twelve unpinned posts.
3. Prioritizes `Video`/`Reel` posts or those with video URLs.
4. Backfills with images/carousels if needed.
5. Sends up to four post URLs in one batch.

Four URLs producing four post records are still four delivered records, even though the request is batched.

The provider's profile metadata marks nested post `likes`, `comments`, `video_url`, and `is_pinned` unsupported. All twelve live initial posts lacked usable likes/comments. Pin status therefore partly depends on a heuristic: a post near the top that is more than a day older than a later post can be marked pinned. This is not authoritative platform pin metadata.

## 4. Instagram field-by-field inventory

| Data | Parsing and storage | Active use / limitation |
|---|---|---|
| Username, full name/profile name | `instagram_username`, `full_name`, normalized profile | Identity, calculator, profile/directory names, AI account identification. |
| Account ID | `instagram_user_id` and normalized profile | Reference/identity data, not a direct pricing input. |
| FBID | Normalized `raw_metadata.profile.fbid` | Stored reference; not a pricing input. |
| Biography | Column plus normalized profile | Email regex, linked-platform discovery. **Not sent by the main AI caller.** |
| Avatar URL | Column and normalized profile | Account/profile presentation. Image bytes are not stored. |
| Followers | BigInt column, normalized profile | UI, follower-tier interpolation, Instagram ER denominator, package ranking and exported creator context. |
| Following count | Column and normalized profile | Reference/profile facts; no direct 16-knot input. |
| Lifetime post count | Column and normalized profile | Cache/completeness checks and reference; no direct price input. |
| Verified/business flags | Columns and normalized profile | Stored reference flags; not direct multipliers in the audited engine. |
| Private/recently joined flags | Normalized profile | Private flag checked by fresh profile refresh; additional stored context. |
| External URLs/titles | JSONB column and normalized profile | Linked-platform discovery and account context. Direct platform URLs are used; the app does not crawl every arbitrary external website. |
| Email | `email_address` or regex from biography, then dedicated column | Public-contact context in calculator/export paths. No message was sent. |
| Category | Optional normalized field and column | Reference/potential context; provider metadata currently marks category inactive. Active caller does not supply it to the AI prompt. |
| Phone/address/city/pronouns/bio hashtags | Optional normalized profile fields | Mostly reference or restoration by database formatter; not direct price inputs. Availability varies. |
| Post ID/URL/shortcode | `posts` JSONB | Mapping enrichment, original-post links, sample identity. |
| Caption | Initial profile caption, optionally replaced by post description | Content cards and AI captions. |
| Content type | Initial profile value retained | Enrichment prioritization and UI labels. Enrichment's richer type/product type is not merged. |
| Posted date | Initial datetime, optionally replaced by `date_posted` | UI dates, ordering, pin heuristic. |
| Image/video URL | Initial profile values only | Stored text; current profile sample UI does not display thumbnails. |
| Likes | Initial count/default zero, overwritten by enrichment | Sample selection, chart, card ER, aggregate ER, pricing. |
| Comment count | Initial count/default zero, overwritten by enrichment `num_comments` | Same numeric uses as likes. Count is not comment text. |
| Location/hashtags | Enrichment can update location/hashtags | Stored post context; separate hashtag arrays are not forwarded by the active AI caller. |
| Sample flag | Computed `isEnrichedSample` | Selects calculation-sample UI. |
| Average likes/comments/ER | Computed `stats`, plus separate ER column | Calculator/profile/directory pricing and performance. AI receives average likes and ER, but main caller omits average comments. |
| Scrape/creation timestamps | Snapshot columns and normalized metadata | Cache age, profile refresh eligibility, collection dates. |

Optional profile support needs care. Current metadata marks `business_email`, `phone_number`, `business_address`, and `category_name` inactive. `email_address` is active and mapped. The parser also does not recognize every metadata alias, such as `phone_number`. A field declared in our TypeScript interface is not evidence that we are reliably collecting it.

The schema has a `highlights` column, but current insertion leaves it at default `[]`. Provider highlight/count fields, related accounts, provider aggregate engagement, original input/timestamp, and other unmapped profile fields are not saved as original provider data.

### Enrichment fields received but discarded

The live post responses contained `latest_comments`, `videos`, thumbnails/thumbnail arrays, `images`, content/product type, audio metadata, durations, alt text, post-content metadata, partner details, and—in some posts—coauthors, tagged users, and location details. These are not generally merged into our stored post objects.

The client reads `item.comments` for textual comments, but current responses use **`latest_comments`**. The four posts returned 15 comment objects each; 42 objects had meaningful text. None reached `post.comments`, storage, or the AI payload. Fixing this mapping would preserve text already included in the paid post records; it does not inherently require another comment scrape.

The dataset schema exposes `video_view_count` and `video_play_count`, but our client does not map them, and neither appeared in these four live results. This audit therefore does **not** establish that Instagram views can currently be obtained reliably. `is_paid_partnership` is inactive in the retrieved schema. Do not treat every advertised metadata field as a field we actually receive.

## 5. Instagram sampling and pricing

`calculateInstagramStats` selects unpinned posts with positive likes/comments, sorts them by likes plus comments, and takes the middle four when at least four exist. With fewer, it uses the available candidates. With no usable metrics, a broader unpinned fallback can apply.

Live measured samples:

| Post ID | Likes | Comments |
|---|---:|---:|
| 4017365709532705937 | 64,324 | 715 |
| 4014466993029137153 | 144,959 | 1,665 |
| 4013746780711841741 | 118,643 | 1,494 |
| 4009979172263897307 | 11,531 | 40 |

Only those four posts had usable metrics, so **all four were used**. There was no trimming among twelve measured posts.

```text
Average likes = round(sum of sample likes / sample count)
Average comments = round(sum of sample comments / sample count)
Instagram ER = (average likes + average comments) / followers × 100
```

Live averages were 84,864 likes and 979 comments, with 2,737,034 followers: **3.14% ER**. The profile chart uses likes plus comments. Individual post ER uses that post's likes/comments divided by followers.

The 16-knot Instagram engine uses follower tiers and follower-based interaction rate, plus niche, market, production, format, and commercial inputs. Reels, carousel, static, and story estimates reuse the account-level performance sample. We are **not** collecting independent authenticated story insights or a separate measured sample per priced Instagram format.

When saved metrics are missing or zero, some profile/directory paths substitute default ER/counts. Profile Instagram `avgViews` can be assumed as 12% of followers; it is not a scraped view count. The ordinary directory's missing-ER fallback differs from the profile fallback. These defaults need clear provenance when explaining observed performance.

## 6. TikTok: request and field inventory

Dataset: `gd_l1villgoiiidt09ci`.

```http
POST https://api.brightdata.com/datasets/v3/scrape?dataset_id=gd_l1villgoiiidt09ci&include_errors=true&format=json
Authorization: Bearer [environment key]
Content-Type: application/json

[{"url":"https://www.tiktok.com/@glitch_productions"}]
```

If the synchronous response returns a snapshot ID, the client polls/downloads that job. It does not start another collection to retrieve it. No separate TikTok post-detail or comment dataset is used.

| Provider data | Parsed/stored field | Actual use / limitation |
|---|---|---|
| Account ID/username, nickname | Username/nickname columns, normalized profile | Identity, UI, AI account identification. |
| Biography and bio link | Columns and normalized profile | Linked-platform discovery, public email regex in the calculator. Biography is omitted from the active AI payload. |
| Followers | BigInt column/profile | UI, follower-tier valuation, package ranking. |
| Following | Column/profile | Reference; no direct pricing input. |
| Total likes/hearts | BigInt column/profile | Stored lifetime reference, not the sample likes used by pricing. |
| Lifetime video count | Column/profile | Reference and refresh completeness checks. |
| Avatar URL | Column/profile | UI; URL text only, not image bytes. |
| Verified/commerce flags | Dedicated columns/profile | Stored facts. Active AI caller omits commerce status despite prompt support. |
| Private flag and create time | Normalized metadata profile | Fresh private flag checked by refresh. Database formatter sets private false and does not restore create time. |
| Video ID and URL | `videos[].id/url` | Original-post link and sample identity. |
| Cover image | `coverImage` | Stored URL; not rendered in current profile sample cards. |
| `playcount` | `playCount` | Core selection, charts, cards, aggregate stats, pricing views input. |
| `diggcount` | `diggCount` | Likes in cards, ER, pricing. |
| `commentcount` | `commentCount` | Comment count in cards, ER, pricing. |
| `share_count` | `shareCount` and average shares | Scraper ER and current profile sample cards; final pricing omission described below. |
| `favorites_count` | `favoritesCount` | Saved per retained video. Current profile cards, active AI, and valuation do not use saves. |
| `create_date` | `createDate` | Posted date, ordering/pin heuristic. |
| Description from `top_posts_data` matched by ID | `description` | Cards and AI descriptions. |
| Separate description hashtags | Not mapped separately | Hashtags inside description text survive; separate arrays do not. |
| Provider engagement rates | Not stored as authoritative ER | Application recomputes ER. Reported average is only a client fallback when no videos; database formatting does not preserve that fallback. |
| `pinned_posts` | Not consulted directly | Client instead uses per-video aliases/date-order heuristic. |
| Language/category/account controls/security IDs | Not mapped | Not retained as original provider response or used for pricing. Country/region are inactive in retrieved metadata. |
| Comment texts | Optional parser branches exist | Current profile dataset returned no texts, so there are no texts to forward. |

The live response contained **24 videos** and 24 description records. The client retained the first twelve unpinned candidates and discarded the rest. The provider calls these `top_videos`; we should not promise an exhaustive chronological recent-upload history. The code does not separately crawl full history.

The core sample is the middle four valid retained unpinned videos sorted by views. Averages are rounded to integers:

```text
TikTok scraper ER = (average likes + average comments + average shares)
                   / average views × 100
```

Live average views: 199,575; likes: 33,425; comments: 642; shares: 1,458.

`(33,425 + 642 + 1,458) / 199,575 × 100 = 17.80%` after rounding.

Saves do not enter this ER. If views are missing but followers exist, the parser has a likes/comments-over-followers fallback.

## 7. What reaches AI, and what AI produces

The main calculator and refresh builder pass a subset, not every collected field:

| AI input | Instagram | TikTok |
|---|---|---|
| Identity | Username, full name | Username, nickname |
| Performance | Followers, average likes, observed ER | Followers, average views, observed ER |
| Location | City if available | Not supplied |
| Content | Up to 12 captions; prompt uses first 10 | Up to 12 descriptions; prompt uses first 10 |
| Intended comment sampling | First four posts × up to five texts, prompt caps at 12 | First five videos × up to five texts, prompt caps at 12 |
| Actual usable comments in audited saved data and live normalized results | **None** | **None** |
| Useful collected data omitted by caller | Biography, average comments, category, bio hashtags, business context; enrichment collaborators not preserved | Biography, commerce status, average likes/comments/shares, saves, separate hashtags |

The browser replay captured the actual synthesis request and confirmed these omissions. Comment selection uses array positions, not necessarily every enriched core post; fixing the provider field mapping alone would not guarantee all intended core comments are sent.

The prompt prints missing biography as “None”, missing commerce status as “No”, and missing performance values as zero. It calls arithmetic average inputs “Performance Medians”. Those defaults/labels can misrepresent missing context.

Age/gender, primary audience market, interests, buyer intent, content themes, brand fit, and production/strategy judgments come from the intelligence layer. They are **not measured demographic or purchase-conversion fields returned by these public scrapers**. These APIs do not provide authenticated creator audience-analytics panels.

The AI does not calculate monetary rates. It provides classifications/context that can affect deterministic pricing inputs, such as niche and production. Results are stored in `creator_intelligence` as structured columns/JSON and a normalized `raw_llm_response` copy. Intelligence has a 24-hour cache and platform-coverage checks.

The active ordinary calculator does not forward snapshot IDs into synthesis; the profile refresh builder does. Normal searches therefore lack the same exact-source linkage as completed profile refresh bundles.

Current code does not persist Vertex token-usage accounting from the response. Exact per-profile AI cost cannot be reconstructed from these tables. One synthesis can cover multiple platforms, and model fallback attempts can add cost. No AI charge was generated by this audit.

## 8. Calculation and UI differences

### TikTok shares

| Consumer | Treatment |
|---|---|
| Scraper statistics and saved headline ER | Includes shares. |
| Profile/directory headline ER | Normally displays saved scraper ER, including shares. |
| New profile sample-card ER | Includes individual video shares. |
| Calculator individual TikTok audit-card ER | **Excludes shares**, using likes + comments / views. |
| Final recalibrated calculator standalone rates | **Passes zero shares**. |
| Profile standalone rate engine | **Explicit `avgShares: 0`**. |
| Ordinary directory/package pricing | Shares not carried in supplied inputs, defaulting to zero. |

For the live sample, share-inclusive headline ER is **17.80%**, but likes/comments-only aggregate ER is approximately **17.07%**. This is a real definition/input difference. Whether pricing should include shares is a business/formula decision; this audit does not silently make it.

Package calculations also use platform metrics and intelligence for platform ranking, deliverable combinations, rights, and bundle prices. Avatars, followings, media URLs, and account creation times do not determine the numeric price. Export/PDF and contract-building links consume selected creator/platform/rate data; they are not additional Bright Data collections.

### Browser checks

The existing `/creators/glitch` page returned 200. It rendered six initial YouTube LF samples and LF/SF tabs, four Instagram samples, and four TikTok samples. Instagram cards showed likes/comments/ER; TikTok showed views/likes/comments/shares/ER. Sample areas contained **no thumbnail images**, as intended. Stored Instagram headline ER was 2.60% and TikTok 17.34%, while fresh audit results were 3.14% and 17.80%. That difference is expected: this audit deliberately did not save new results.

The browser also found a **hydration warning in the profile chart's SVG title subtree**. The page recovered by client-rendering. This is a separate UI defect; no repair was made during the audit.

The calculator was replayed using the captured live Instagram/TikTok results and saved intelligence. All scraper/synthesis/write requests were intercepted, so no extra collection, AI call, or DB write occurred. It rendered **eight core cards**, displayed the fresh platform ERs, and sent the verified curated synthesis payload with zero comment texts. No browser errors occurred in that replay.

The directory result was subsequently allowed to finish loading. Its GLITCH card showed the same saved Instagram 2.60% and TikTok 17.34% headline ERs, separate platform follower counts, pricing ranges, and inferred audience fit. The search also matched another creator whose name includes “Glitches”, which is expected for substring search. No refresh or scrape was triggered. This checked the saved result rendering, not every filter/sort interaction.

Legacy detailed scraper profile/post/video components exist but are not mounted by the current calculator/profile pages. Their ability to show fields such as saves/business contacts is not active UI use.

## 9. Cost per profile

Bright Data's current published pay-as-you-go rate is **$1.50 per 1,000 delivered records**, or **$0.0015 per record**. Scale has a monthly commitment and different overage rate. See [official pricing](https://brightdata.com/pricing/web-scraper), checked October 27, 2026.

| Scenario | Normally delivered records | Public PAYG estimate |
|---|---:|---:|
| Instagram profile only / fast mode | 1 | $0.0015 |
| Instagram + one enriched post | 2 | $0.0030 |
| Instagram + two enriched posts | 3 | $0.0045 |
| Instagram + three enriched posts | 4 | $0.0060 |
| Instagram + four enriched posts | **5** | **$0.0075** |
| TikTok profile, with nested videos | **1** | **$0.0015** |
| Full Instagram + TikTok | **6** | **$0.0090** |
| Valid DB-cache hit / saved-profile view | 0 new collections | $0 Bright Data collection cost |

At that rate, 1,000 full Instagram runs are approximately **$7.50**; 1,000 TikTok runs **$1.50**; 1,000 creators with both **$9.00**. This excludes retries, other linked platforms, AI, hosting, and database costs.

The audit triggered one profile job per platform plus one four-post Instagram job: **six successful output records**, equivalent to **$0.0090 at public PAYG rates**. Inspected metadata exposes record counts, not negotiated unit prices, free-credit application, tax, or final invoice. This is not a verified cash debit.

Important distinctions:

- One batched request can deliver several billed records. Conversely, 24 nested TikTok videos did not turn the observed one-profile output into 25 records.
- Polling/downloading an existing snapshot does not start another profile collection. Synchronous-to-asynchronous retrieval continues the same job.
- App timeout does not cancel provider work. A job that later delivers results may still incur cost, and a newly triggered retry can increase it.
- The official FAQ says incorrect-input failures can be billed despite the pricing page's general pay-for-success wording. Do not assume every failed call is free.
- Valid 24-hour database cache hits do not spend Bright Data collection credits. Instagram bypasses certain zero-like cache entries, so repeated incomplete results can cause additional collections.
- `fastMode` saves the enrichment cost but returns without inserting a fresh profile row and lacks the full current metrics. The mounted calculator does not use it.
- No binary image/video downloads are configured. Media URLs are stored as text. Hiding thumbnails does not itself reduce the delivered-record price.
- Mapping already-returned Instagram latest comments should not require another collection for those comments. TikTok texts would require a different data source/request if desired.
- AI-only refresh can incur AI cost without new Bright Data collection. Full profile refresh intentionally collects its known/discovered platforms anew.

Actual total operating cost requires the Bright Data account bill/plan, Vertex usage/price, serverless billing, and database plan. The report does not substitute public list price for your account invoice.

## 10. Storage, history, and failure handling

Both fresh storage functions insert new snapshot rows. However, ordinary synthesis uses `updateMany` to overwrite AI quick-lookup enrichment columns on older matching platform rows. It does not rewrite their original post metrics, but entire rows are not strictly immutable. The newer profile-refresh service bypasses that synthesis-route update and pins exact new source IDs.

`raw_metadata` duplicates normalized profile/content/stats data; it is not full raw provider preservation. Discarded fields and Bright Data job IDs are not durably recorded there. Recovering discarded fields from old rows can require original provider snapshots, subject to retention, or a new paid scrape.

Other observed/code-confirmed limits:

1. Instagram's two-minute profile polling budget failed on the live 133.735-second job.
2. Instagram enrichment also has an outer two-minute `Promise.race` around a helper with its own timer. The losing operation is not canceled and its timer is not cleared. A prior test completed at the provider after the app had already returned zero metrics.
3. Enrichment failure is logged and swallowed. A successful response can contain incomplete metrics and can be saved. Profile refresh checks for posts/private status, but not successful measured enrichment for the full sample.
4. Ordinary scraper routes do not declare the same explicit five-minute duration as profile refresh; actual serverless execution limits depend on deployment.
5. TikTok's ordinary route can return success even when snapshot insertion failed, so UI success is not proof of persistence. Instagram's full route treats save failures differently.
6. Instagram's POST fallback tries reading the request JSON again after it was consumed, making the intended older-record fallback unreliable.
7. Missing numeric fields become zero, which loses the distinction between uncollected and genuinely zero.
8. TikTok database formatting drops/changes some raw profile context, including forcing private false and not restoring create time.
9. If a future/alternate Instagram response supplies `comments` as an array, the current enrichment mapping uses its array length as the comment count before considering `num_comments`. A small returned comment sample could then be mistaken for the full comment total. This was not the shape of the live response, which used `latest_comments` and numeric `num_comments`.

## 11. Recommended priorities — not implemented

1. Make late/incomplete result handling explicit; recover the same provider job instead of blindly paying for retries. Do not publish an incomplete zero-metric result as a completed full refresh.
2. Preserve Instagram `latest_comments`, then forward the intended enriched/core comments into AI.
3. Forward collected biography, measured performance, and commerce facts. Represent omitted fields as unknown rather than “No” or zero.
4. Decide and document TikTok share treatment consistently across headline ER, per-video ER, and pricing.
5. Decide whether four reel-prioritized Instagram candidates meet the intended sample definition. Measuring a wider set to truly trim it can increase delivered-record cost.
6. Retain useful structured provider evidence and job IDs; no media-binary storage is necessary for that.
7. Repair chart hydration and clarify fallback metric provenance/defaults.

## 12. Source locations and evidence

Primary local references:

- [Instagram client and datasets](D:/SignCollab/src/lib/scrapers/instagram/client.ts:16)
- [Instagram candidate selection](D:/SignCollab/src/lib/scrapers/instagram/client.ts:261)
- [Instagram comment mapping](D:/SignCollab/src/lib/scrapers/instagram/client.ts:353)
- [Instagram storage/cache](D:/SignCollab/src/lib/scrapers/instagram/storage.ts:10)
- [Instagram sample/ER calculation](D:/SignCollab/src/lib/scrapers/instagram/parser.ts:76)
- [TikTok client](D:/SignCollab/src/lib/scrapers/tiktok/client.ts:121)
- [TikTok storage formatter](D:/SignCollab/src/lib/scrapers/tiktok/storage.ts:89)
- [TikTok sample/ER calculation](D:/SignCollab/src/lib/scrapers/tiktok/parser.ts:57)
- [Mounted calculator's scrape flow](D:/SignCollab/src/components/calculator/InfluencerRadarDashboard.tsx:580)
- [Calculator synthesis input](D:/SignCollab/src/components/calculator/InfluencerRadarDashboard.tsx:1067)
- [Calculator TikTok audit card](D:/SignCollab/src/components/calculator/InfluencerRadarDashboard.tsx:3364)
- [Profile refresh synthesis input](D:/SignCollab/src/lib/creators/refresh-input.ts:40)
- [AI prompt context](D:/SignCollab/src/lib/ai/gemini.ts:153)
- [Profile rate inputs](D:/SignCollab/src/lib/creators/profile-resolver.ts:663)
- [Pricing engine ER](D:/SignCollab/src/lib/calculator/engine.ts:253)
- [Package pricing inputs](D:/SignCollab/src/lib/calculator/packages.ts:278)
- [Profile sample UI](D:/SignCollab/src/components/creators/CreatorProfileView.tsx:95)
- [Sample mapping](D:/SignCollab/src/lib/creators/performance-samples.ts:32)
- [Synthesis enrichment writes](D:/SignCollab/src/app/api/calculator/synthesize/route.ts:65)
- [Platform table schemas](D:/SignCollab/prisma/schema.prisma:529)

Official external references:

- [Bright Data pricing](https://brightdata.com/pricing/web-scraper).
- [Scraper API FAQ: billing, sync/async, media limitations](https://docs.brightdata.com/products/scrapers/scrapers-library/faqs).
- [Scraper input/output metadata](https://docs.brightdata.com/api-reference/scrapers/management-apis/get-scrapers).
- [Snapshot listings and record counts](https://docs.brightdata.com/api-reference/scrapers/management-apis/get-snapshots).
- [Dataset field metadata](https://docs.brightdata.com/api-reference/marketplace-dataset-api/get-dataset-metadata).

Authenticated schema metadata was retrieved for the exact three configured datasets. Diagnostic raw/normalized results, metadata, DB aggregates, and UI captures are local `scratch/brightdata-audit-*.json` files. API keys were not copied into those evidence files. The provider field schemas, actual returned fields, stored history, and UI/engine consumers are deliberately distinguished throughout this report.
