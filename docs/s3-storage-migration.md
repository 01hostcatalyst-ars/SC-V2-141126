# Private S3 storage

The frontend and API routes can stay on Vercel. PostgreSQL stays on AWS/Coolify.
Contract PDFs, audit certificates, and CNIC images use the private S3 bucket configured by:

```dotenv
AWS_REGION="your-region"
S3_BUCKET_NAME="your-bucket"
AWS_ACCESS_KEY_ID="your-access-key"
AWS_SECRET_ACCESS_KEY="your-secret-key"
```

Use ignored local environment files and Vercel Production environment variables. Never prefix AWS credentials with `NEXT_PUBLIC_`. The AWS SDK default provider also supports IAM roles if hosting changes later.

Keep all S3 public access blocked. Use S3 Standard, ACLs disabled, SSE-S3 encryption, and bucket versioning. The application needs ListBucket/GetBucketLocation on the bucket and GetObject/PutObject on objects. It does not need deletion permissions or CORS for the current server-side uploads and ordinary download links.

## Application behavior

- Uploads retain `agreements/<contractId>.pdf`, `certificates/<contractId>_certificate.pdf`, and `cnic/<userId>-<uniqueId>.<extension>` object keys. Existing migrated CNIC keys remain valid even if their historical filename contains a Supabase auth ID.
- Database fields store object keys, never expiring URLs or credentials.
- Private contract routes require a participant session. Share routes require an existing share token and an ACTIVE or COMPLETED agreement.
- Downloads expire in 60 seconds for signed-in users and 300 seconds for share links. API responses and S3 downloads use no-store caching.
- Viewing an existing executed PDF or certificate reuses stored bytes instead of overwriting them. Draft PDF previews still regenerate to reflect edits. Contracts without a saved PDF path and missing certificates can be generated through the existing rendering code. An executed contract with a saved path but missing object returns 503 for recovery instead of silently replacing archived evidence. S3 access failures are surfaced rather than treated as missing files.
- CNIC uploads accept JPEG, PNG, or WebP signatures, up to 4 MiB. The server chooses the extension and key. `GET /api/profile/cnic` gives only the signed-in user's own image link.

## Choose whether to retain old files

The owner has chosen to start with S3 without migrating old Supabase files. Leave existing database records unchanged. Old executed PDFs whose saved object is absent from S3 return an unavailable response; new documents and uploads go to S3. No Supabase download access is needed for this choice. The optional migration instructions below remain available if that decision changes.

## Optional: copy existing files before production deployment

Keep `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` locally for the migration tool. These are not used by the new application storage code.

1. Inventory the source without making changes:

   ```sh
   npm run storage:migrate
   ```

2. Copy files and verify every destination by SHA-256:

   ```sh
   npm run storage:migrate -- --apply
   ```

   The tool recursively paginates the `profiles` bucket, preserves every object key, never deletes source files, and refuses to overwrite different destination contents. Already-identical files are verified and skipped. It is safe to rerun after an interrupted copy. Run while old uploads/signing are paused, or perform a final pass during the switch, so writes cannot be missed.

3. If retaining historical files, require a successful migration result before switching the production application. Verify existing contracts and CNIC images as well as new uploads. If intentionally starting fresh, skip the copy and expect old file downloads to be unavailable.
4. Deploy with all four AWS settings present in Vercel Production. Check signed-in downloads, share downloads, unauthorized access, and private bucket access.
5. Keep the original files as a recovery copy until verification is complete. Legacy Supabase client/server helpers and old unused login code still exist and can be removed in a separate cleanup. The one-time migration tool still requires the Supabase SDK.

If retaining historical files and the source reports HTTP 402 / `exceed_egress_quota`, the source project owner must restore access or provide an existing export. AWS configuration cannot bypass a source-provider restriction. Deploy with uncopied historical files only when their unavailability has been explicitly accepted.

## Checks

```sh
npm run test:storage
node --test tests/google-onboarding.test.cjs
npm run build
```
