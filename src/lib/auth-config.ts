import type { BetterAuthOptions } from "better-auth";
import pg from "pg";

const authGlobal = globalThis as unknown as { googleAuthPool?: pg.Pool };

export const googleAuthPool = authGlobal.googleAuthPool ?? new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  max: 3,
  connectionTimeoutMillis: 10_000,
  idleTimeoutMillis: 30_000,
});

if (process.env.NODE_ENV !== "production") authGlobal.googleAuthPool = googleAuthPool;

// Authentication tables hold Google identities; users.better_auth_id links each
// completed application profile without changing contract ownership IDs.
export const authOptions = {
  appName: "SignCollab",
  baseURL: process.env.BETTER_AUTH_URL,
  secret: process.env.BETTER_AUTH_SECRET,
  database: googleAuthPool,
  user: { modelName: "google_auth_users" },
  session: { modelName: "google_auth_sessions" },
  account: {
    modelName: "google_auth_accounts",
    encryptOAuthTokens: true,
    accountLinking: { enabled: false },
  },
  verification: { modelName: "google_auth_verifications" },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    },
  },
  rateLimit: { enabled: true },
} satisfies BetterAuthOptions;
