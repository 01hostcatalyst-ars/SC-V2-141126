require('dotenv/config');
const assert = require('node:assert/strict');
const { randomUUID } = require('node:crypto');
const { Client } = require('pg');
(async () => {
 const connectionString = process.env.DATABASE_URL;
 const db = new Client({ connectionString, connectionTimeoutMillis: 15000, ssl: /supabase|pooler/.test(connectionString || '') ? { rejectUnauthorized: false } : undefined });
 await db.connect();
 const cluster = 'refresh-test-' + randomUUID(), id = randomUUID();
 try {
  await db.query('BEGIN');
  await db.query(`INSERT INTO creator_profile_refreshes (id,cluster_id,token_hash,accounts,steps,baseline_profile,expires_at) VALUES ($1,$2,$3,'{}','{}','{}',CURRENT_TIMESTAMP + INTERVAL '20 minutes')`, [id, cluster, 'test-hash']);
  await db.query('SAVEPOINT duplicate_attempt');
  let rejected = false;
  try { await db.query(`INSERT INTO creator_profile_refreshes (id,cluster_id,token_hash,accounts,steps,baseline_profile,expires_at) VALUES ($1,$2,$3,'{}','{}','{}',CURRENT_TIMESTAMP + INTERVAL '20 minutes')`, [randomUUID(), cluster, 'test-hash']); }
  catch (error) { assert.equal(error.code, '23505'); rejected = true; }
  assert(rejected, 'database must reject a second simultaneous refresh');
  await db.query('ROLLBACK TO SAVEPOINT duplicate_attempt');
  await db.query(`UPDATE creator_profile_refreshes SET status='failed' WHERE id=$1`, [id]);
  await db.query(`INSERT INTO creator_profile_refreshes (id,cluster_id,token_hash,accounts,steps,baseline_profile,expires_at) VALUES ($1,$2,$3,'{}','{}','{}',CURRENT_TIMESTAMP + INTERVAL '20 minutes')`, [randomUUID(), cluster, 'test-hash']);
  await db.query('ROLLBACK');
  assert.equal((await db.query('SELECT count(*)::int AS count FROM creator_profile_refreshes WHERE cluster_id=$1', [cluster])).rows[0].count, 0);
  console.log('Passed real database uniqueness and retry checks. All test rows rolled back; creator history untouched.');
 } finally { await db.query('ROLLBACK').catch(() => {}); await db.end(); }
})().catch(error => { console.error(error.code || error.message); process.exitCode=1; });
