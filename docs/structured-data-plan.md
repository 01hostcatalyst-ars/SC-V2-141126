# Public structured data: page plan and maintenance

Goal: describe SignCollab and its content accurately so search engines and answer systems can connect entities, tools, creators, and articles. Schema supports understanding; it does not guarantee rankings, rich results, citations, or inclusion in AI answers.

## Shared rules

- Production HTTPS URLs and stable entity IDs; Organization, WebSite, platform WebApplication defined by root layout. Page-specific entities reference them.
- Founder identity uses the LinkedIn already linked on About. No invented staff identities, headcount, credentials, countries, social accounts, reviews, or ratings.
- Serialize every JSON-LD script safely. Dynamic fields come from the same snapshot used by the visible page.
- Publish JSON-LD as native script elements in server-rendered HTML. Client-side lists and billing toggles update that markup together with the visible results.
- Only genuine content dates, separate platform followers, and explicitly estimated pricing. No estimated creator Offer/Product or combined unique reach.
- FAQs mirror visible expandable answers. FAQPage is semantic markup, not a promise of a Google FAQ enhancement.
- Never describe planned features as working applications, a survey as a published licensed dataset, or legal articles as legal certification.

## Implementation by page

| Page | Entities and content source | Maintenance / exclusions |
| --- | --- | --- |
| Home | WebPage; ItemList of the same eight spotlight profiles; FAQPage from shared visible answers; references to directory, calculator, contracts | No extra DB reads, scraper calls, offers, or combined audiences. Existing three-day cache retained. |
| Directory | CollectionPage, BreadcrumbList, ItemList from exact displayed API results in displayed order | Up to ten per page; filtered state drives schema; individual platform counters; no inferred nationality or verification claims. |
| Creator profile | WebPage mainEntity Person/Organization; BreadcrumbList; SignCollab-authored CreativeWork with audience/content/strategy and estimated rate/package lists | Separate platform counters, observed collection dates, evidence-informed descriptions. No default low-risk endorsement, unique reach, creator offers, or render-time freshness. Editorial third-party profiles remain WebPage rather than claiming Google ProfilePage eligibility. |
| Calculator | WebPage, dedicated WebApplication, BreadcrumbList, visible FAQPage | Calculator engine vs AI insights clearly distinguished. Do not turn transient visitor searches into canonical creator entities or price offers. |
| Academy | CollectionPage, BreadcrumbList, ItemList from visible filtered guides | List and count update with client filtering; server renders initial list; links point to canonical articles. |
| Article | WebPage, Article, BreadcrumbList, shared founder author identity, real hero ImageObject, actual dates, visible article topic and conditional FAQs | No generic legislation citations or irrelevant fixed mentions; no favicon masquerading as article hero. Article headline follows H1; description uses authored metadata when supplied. |
| About | AboutPage, BreadcrumbList, shared founder Person, Organization reference | International team described in visible copy; no fabricated member entities. |
| Vision | WebPage, BreadcrumbList, Organization reference | Describes purpose without claiming planned functionality is available. |
| Contact | ContactPage, BreadcrumbList, support ContactPoint, visible FAQs | Real configured support address; no geographic office claims. |
| Features | CollectionPage, BreadcrumbList, available-tools ItemList, visible FAQs | Same six available links as UI; roadmap excluded from available tool entities. |
| Instant contracts | WebPage, dedicated WebApplication, BreadcrumbList | Actual drafting and signing features; remove blanket enforceability promises and schema-only FAQs/HowTo. |
| Verify | WebPage, dedicated WebApplication, BreadcrumbList | Reference lookup and browser hash comparison; no assumed URL action parameters. |
| Survey | WebPage, BreadcrumbList, Organization publisher | Research participation page; no fabricated downloadable Dataset, license, or results. |
| Pricing | WebPage, BreadcrumbList, displayed OfferCatalog/FAQs | Actual subscription offers only; custom quote has no numeric price; no invented validity dates. |

## Verification and release

Run focused schema regression tests, TypeScript, lint on changed files, and browser checks of JSON parsing, production URLs, shared IDs, FAQ parity, filtered lists, injection escaping, dates, and no paid API calls. Inspect representative live URLs in Search Console / Rich Results Test after deployment; Schema.org Validator covers types beyond Google's supported enhancements. Deployment/indexing and external citations are separate from code validation.

References: https://developers.google.com/search/docs/appearance/structured-data/sd-policies ; https://developers.google.com/search/docs/appearance/structured-data/article ; https://developers.google.com/search/docs/appearance/ai-features

## Local validation record

- Ten regression tests cover script injection escaping, stable entity IDs, breadcrumbs, article author/date/image/FAQ/reading-time fields, filtered/empty lists, separate platform counters, exact core sample selection, missing dates, group profiles, and monthly/annual subscription prices.
- Browser checks passed on Home, Features, About, Vision, Contact, Calculator, Instant, Verify, Survey, Pricing, and Academy: parsing, production URLs, one root Organization definition, page entities, and visible FAQ parity.
- Saved Sydnee Zora profile, WhatsApp/Instagram-DM article, ten-record directory results, and annual pricing passed the dynamic browser checks. No scraper, AI-generation, email, or payment POST requests were made.
- TypeScript, targeted lint, and the isolated production build passed (79 generated pages). The first attempt hit the local Node worker's 2 GB heap; the successful retry used a task-local 4 GB heap without changing deployment settings. The only build lint warning is the pre-existing admin batch-ingest hook dependency warning.
- Generated production HTML for all eleven main static public routes contains both site-wide and page-specific parseable JSON-LD before JavaScript executes. Generated Academy article HTML was also checked for Article markup and production URLs.
- Google Search Console inspection and external rich-result validation remain post-deployment checks; local tests do not establish ranking or indexing outcomes.
