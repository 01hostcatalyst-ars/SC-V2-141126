require('dotenv/config');
const fs = require('node:fs');
const path = require('node:path');
const { Client } = require('pg');

(async () => {
  const sql = fs.readFileSync(path.join(__dirname, '../prisma/google-onboarding.sql'), 'utf8');
  if (!process.argv.includes('--apply')) {
    console.log(sql);
    console.log('Preview only. Use --apply to add the Google identity link column.');
    return;
  }
  const client = new Client({ connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL, connectionTimeoutMillis: 10000 });
  try {
    await client.connect();
    await client.query(sql);
    console.log('Google identity link column ready; existing accounts and contracts preserved.');
  } finally {
    await client.end();
  }
})().catch(error => {
  console.error('Google onboarding setup failed:', error.code || error.name);
  process.exitCode = 1;
});
