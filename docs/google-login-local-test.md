# Google login and profile setup

SignCollab uses Google login through Better Auth. Authentication records stay in
`google_auth_*` tables on AWS PostgreSQL. Completed application profiles use
`users.better_auth_id` to link to the Google identity. Application user IDs and
contract ownership IDs are preserved.

## Flow

1. Header, mobile menu, footer, and `/login` offer **Continue with Google**.
2. Google returns to `/api/auth/callback/google`, then `/auth/continue`.
3. A verified identity with no completed profile goes to `/onboarding`.
4. The person chooses Creator, Brand, or Agency, confirms name and country, and
   enters relevant details. Phone and creator handles are optional. Organization
   name is required for brands and agencies. No ID documents are collected here.
5. The server saves the profile using the session's verified email and identity,
   never identity fields supplied by the browser. Repeat submits are idempotent.
6. Returning users go directly to `/dashboard`.
7. Dashboard and contract APIs check Better Auth and the application identity link.
   Contract reads require participant access; edits, submission, signing, and
   status actions require initiator ownership.

An existing email match can be claimed only after a verified Google login. Its
application ID is retained. Profiles linked to a different identity are refused.
No old users are deleted by this feature. Entering a creator handle does not
claim or verify a public creator profile.

## Environment and Google Console

Local `.env`:

```dotenv
BETTER_AUTH_URL=http://localhost:3000
BETTER_AUTH_SECRET=<secure random secret>
GOOGLE_CLIENT_ID=<web client ID>
GOOGLE_CLIENT_SECRET=<web client secret>
DATABASE_URL=<AWS PostgreSQL connection>
DIRECT_URL=<AWS direct PostgreSQL connection>
```

Register `http://localhost:3000/api/auth/callback/google` as an authorized redirect
URI in the Google Web client. Use localhost consistently. While the Google app is
in Testing mode, add the intended Google accounts as test users where required.

## Database setup

```powershell
node --experimental-strip-types scripts/setup-google-auth.mjs
node --experimental-strip-types scripts/setup-google-auth.mjs --apply
node scripts/setup-google-onboarding.cjs
node scripts/setup-google-onboarding.cjs --apply
npx prisma generate
```

Each setup command previews changes unless `--apply` is supplied. The first
creates separate auth tables; the second adds a nullable unique identity link
column. Neither deletes accounts or contracts. Restart an already running dev
server after regenerating Prisma.

## Vercel deployment

The frontend and API routes currently run on Vercel. The database runs on
AWS/Coolify. Keep the Node.js runtime for Better Auth and the onboarding API.

In Vercel production, set `BETTER_AUTH_URL=https://www.signcollab.com`, both Google
client credentials, `BETTER_AUTH_SECRET`, and the database variables. Keep secrets
server-only. Register `https://www.signcollab.com/api/auth/callback/google` with
Google. Redeploy after changing environment variables. A preview deployment needs
its own matching callback/base URL configuration. Cookie-authenticated mutations
require the matching Origin header.

## Verification

```powershell
node --test tests/google-onboarding.test.cjs
```

The tests cover signed-out and unverified identities, hostile origins, field
validation, identity injection, duplicate submits, existing-profile handling,
new/returning-user routing, and cross-account contract access.

The local browser flow was verified with a synthetic disposable identity:
role-specific fields, Creator signup, persisted database profile, dashboard,
returning-user redirect, reload, logout, and signed-out dashboard protection.
The synthetic identity/profile were removed afterwards. Real accounts were not
changed. The real Google OAuth redirect/login had already been tested separately.

Legacy password/OTP signup endpoints return 410 and direct users to Google login.
Supabase Storage remains responsible for documents until its separate migration.
