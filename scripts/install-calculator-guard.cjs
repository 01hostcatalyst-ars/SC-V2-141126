require('dotenv/config');
const fs = require('node:fs');
const { Client } = require('pg');
(async () => {
 const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
 const client = new Client({ connectionString, connectionTimeoutMillis: 15000,
   ssl: /supabase|pooler/.test(connectionString || '') ? { rejectUnauthorized: false } : undefined });
 await client.connect();
 try {
  await client.query('BEGIN');
  await client.query(fs.readFileSync('prisma/calculator-guard.sql', 'utf8'));
  await client.query('COMMIT');
  console.log('Calculator protection table installed. Existing creator data was not modified.');
 } catch (error) { await client.query('ROLLBACK'); throw error; }
 finally { await client.end(); }
})().catch(error => { console.error('Calculator protection schema installation failed:', error.code || error.message); process.exitCode = 1; });
