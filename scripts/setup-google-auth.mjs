import "dotenv/config";
import { getMigrations } from "better-auth/db/migration";

// Node 22: node --experimental-strip-types scripts/setup-google-auth.mjs [--apply]
const { authOptions, googleAuthPool } = await import("../src/lib/auth-config.ts");
try {
  const migration = await getMigrations(authOptions);
  const allowed = new Set(["google_auth_users", "google_auth_sessions", "google_auth_accounts", "google_auth_verifications"]);
  if (migration.toBeAdded.length || migration.toBeCreated.some(table => !allowed.has(table.table)) || migration.toBeAddedIndexes.some(index => !allowed.has(index.table)) || migration.unsafeChanges.length || migration.schemaProblems.length) {
    throw new Error("Unexpected schema changes; refusing to modify existing tables.");
  }
  console.log(JSON.stringify({ newTables: migration.toBeCreated.map(table => table.table), existingTablesChanged: 0 }));
  console.log(await migration.compileMigrations());
  if (process.argv.includes("--apply")) {
    await migration.runMigrations();
    console.log("Google login tables ready. Existing application records were not changed.");
  } else {
    console.log("Preview only. Add --apply to create these authentication tables.");
  }
} finally {
  await googleAuthPool.end();
}
