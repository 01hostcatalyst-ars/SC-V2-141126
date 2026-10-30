# Creator profile refresh

The profile-only Refresh profile data control is available after any required source is more than seven days old (strictly greater than seven days). Sources are the known platform snapshots plus intelligence, not the identity row's updated timestamp. Missing platforms are optional; failed known/discovered platforms are errors.

## Deployment

1. Install normal application dependencies and generate Prisma: `npx prisma generate`.
2. Run `npm run db:profile-refresh` against the intended database before deploying. This adds only creator_profile_refreshes and its indexes; it never edits historical creator records. It uses DIRECT_URL when available, otherwise DATABASE_URL. No Prisma migration baseline exists in this repository, so this is an explicit idempotent additive setup script.
3. Deploy the application. The profile endpoint uses the Node runtime and requests a 300-second maximum for each separate scraper/synthesis request. Confirm the serverless host/account supports the requested duration. There is no persistent worker or queue service.
4. The existing YouTube, Bright Data, Google Cloud, and database configuration is reused. No new paid service or runtime package is required.

## Execution and persistence

The browser starts the refresh, fans out saved account scans, follows fresh direct platform links into missing platforms, waits for all discovered scans, and submits synthesis. Accounts are deduplicated by platform; saved relationships win. Instagram uses full mode. Each scraper is called directly with no cache lookup. The existing full-intelligence generator is called with bypassCache=true and the exact new snapshot IDs. Calling the generator directly avoids the historical scrape updateMany writes in the existing calculator synthesis route; that route and calculator behavior are unchanged.

A refresh row saves the previous complete profile, session token hash, discovered accounts, step state, and completed source references. The token is generated server-side and held only in page memory. The database enforces one active refresh per creator. Repeated calls cannot execute a platform or synthesis twice. Success requires actual persisted scraper and intelligence IDs.

The profile and directory display the previous complete profile until publication. Completion links the saved sources atomically and adds only newly discovered identity handles. Historical scrape and intelligence records are never updated by the refresh path. Current claim/verification state is read live. A later normal calculator analysis can supersede a completed refresh; that existing calculator pathway is not frozen by this feature.

The visitor must keep the page open. Closing/reloading can leave a partial run; the old profile remains available and a new attempt can start after its 20-minute expiration. No claim is made that work continues after navigation or request termination.

## Verification

- `npm run test:profile-refresh`: isolated tests, simulated scraper/LLM providers, no paid calls.
- `node tests/profile-refresh-db.cjs`: real database unique-active-run/retry checks inside a transaction that is rolled back; no creator/history records are modified.
- `npx tsc --noEmit --incremental false`.

Tests cover strict freshness boundaries, 1/2/3 platforms, parallel recursive discovery, deduplication, token tampering, duplicate starts, failure retention, saved-source pinning, and all eight per-format prices compared to the original Rate Radar function, including separate YouTube long/Shorts inputs.
