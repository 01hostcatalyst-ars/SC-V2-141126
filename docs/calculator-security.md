# Calculator input and usage protection

The browser and server share an exact-host URL parser. Supported profile links and YouTube video links are converted to canonical platform URLs. Arbitrary domains, credentials, unusual ports, content links on Instagram/TikTok, control characters and oversized inputs are rejected. Linked-account discovery goes through the same validation. Scraping remains full mode.

POST scraper requests use the existing 24-hour snapshot cache; public `forceRefresh` and `fastMode` flags cannot change that policy. GET scraper requests only read cached data. Synthesis rebuilds its input from recent saved platform snapshots instead of trusting browser-supplied metrics or text. Public `bypassCache` is ignored; the controlled profile-refresh workflow can still request fresh insights internally.

## Setup before deploying

1. Run `npm run db:calculator-guard` with the target database environment loaded. This only adds two protection tables and indexes; existing creator data is untouched.
2. Set `CALCULATOR_GUARD_SECRET` in Vercel to a random value of at least 32 characters. Generate one locally with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`. Keep it private and stable across instances.
3. Set an explicit `ADMIN_BATCH_INGEST_KEY` if using batch ingestion in production. The built-in fallback password has been removed; no configured administrator secret means access is denied.
4. Deploy. No scraper-provider settings or API key changes are required.

## Defaults and overrides

| Environment variable | Default | Meaning |
| --- | --- | --- |
| `CALCULATOR_VISITOR_WORK_PER_HOUR` | 18 | Public fresh-scan/import/insights requests per visitor IP per hour |
| `CALCULATOR_PLATFORM_SCANS_PER_DAY` | 60 | Global fresh platform collections per 24-hour window, including profile refresh and admin ingestion |
| `CALCULATOR_AI_JOBS_PER_DAY` | 30 | Global uncached intelligence jobs per 24-hour window, including profile refresh and admin ingestion |

The windows start at the first reservation, rather than midnight. All calculator API requests also share a 90-request/10-minute visitor limit. Vercel's forwarded visitor address is HMAC hashed; raw addresses are not saved in the protection tables. Outside Vercel, requests conservatively share a visitor bucket, until a trusted proxy integration is configured. Users sharing an IP share limits. Cached scraper reads do not count as fresh collections. Failed provider attempts count because they may still incur costs. One three-platform search can consume three collection reservations. A collection can include multiple provider calls and billable comment records: these are job limits, **not Bright Data credit limits**. Configure provider-side spending limits separately.

Database reservations and account locks are atomic across serverless instances. Duplicate in-flight collections return 409 with `Retry-After`; budget/rate limits return 429. Locks expire after 20 minutes if a process dies. Completed or failed calls keep a 30-second cooldown while snapshots finish saving. Missing protection tables or database errors fail closed before new provider work starts. A rotating-IP attacker can exhaust the global allocation, but cannot exceed it through these workflows. These controls limit abuse; they do not make automated requests impossible. CAPTCHA can be added later if needed.

Expired counters and locks may be deleted periodically with `DELETE FROM calculator_guard_counter WHERE expires_at < now(); DELETE FROM calculator_guard_job WHERE expires_at < now();`. Do not clear active rows to work around a usage limit.

Verify with `npm run test:calculator-security` and `npm run test:profile-refresh`. Security tests mock provider calls and spend no API credits.
