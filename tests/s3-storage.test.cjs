const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const ts = require('typescript');
const originalLoad = Module._load;
const originalResolve = Module._resolveFilename;
Module._resolveFilename = function(spec, ...args) {
  return originalResolve.call(this, spec.startsWith('@/') ? path.join(process.cwd(), 'src', spec.slice(2)) : spec, ...args);
};
require.extensions['.ts'] = (module, file) => module._compile(ts.transpileModule(fs.readFileSync(file, 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
}).outputText, file);

process.env.AWS_REGION = 'us-east-1';
process.env.S3_BUCKET_NAME = 'unit-test-private-bucket';
process.env.AWS_ACCESS_KEY_ID = 'test-access-key';
process.env.AWS_SECRET_ACCESS_KEY = 'test-secret-key';
delete process.env.AWS_SESSION_TOKEN;
const storage = require('../src/lib/storage.ts');
const { S3Client } = require('@aws-sdk/client-s3');
const originalSend = S3Client.prototype.send;
let awsFailure;
let commands = [];
S3Client.prototype.send = async function(command) {
  commands.push(command);
  if (awsFailure) throw awsFailure;
  return {};
};

let identity;
let contract;
let profile;
let exists;
let storageFailure;
let calls;
const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aV1sAAAAASUVORK5CYII=', 'base64');
Module._load = function(spec, ...args) {
  if (spec === '@/lib/auth-user') return {
    getAuthUser: async () => identity,
    contractAccessFilter: id => ({ OR: [{ initiatorId: id }, { respondentId: id }] }),
  };
  if (spec === '@/lib/prisma') return { prisma: {
    contract: {
      findFirst: async ({ where }) => contract && where.id === contract.id && where.OR.some(r => r.initiatorId === contract.initiatorId || r.respondentId === contract.respondentId) ? contract : null,
      findUnique: async ({ where }) => contract && (where.shareToken === contract.shareToken || where.id === contract.id) ? contract : null,
    },
    user: {
      findUnique: async ({ where }) => profile?.id === where.id ? profile : null,
      update: async ({ where, data }) => { calls.push(['db-update', where.id]); return { id: where.id, ...data }; },
    },
  }};
  if (spec === '@/lib/storage') return {
    privateFileExists: async key => { calls.push(['head', key]); if (storageFailure) throw storageFailure; return exists; },
    getPrivateDownloadUrl: async (key, ttl) => { calls.push(['sign', key, ttl]); return 'https://private.example.invalid/download'; },
    uploadPrivateFile: async (key, body, type) => { calls.push(['upload', key, body, type]); return key; },
  };
  if (spec === '@/lib/pdf/generate') return { generateContractPDF: async id => { calls.push(['generate', id]); contract.pdfUrl = `agreements/${id}.pdf`; } };
  if (spec === '@/lib/pdf/generateCertificate') return { generateAuditCertificatePDF: async id => { calls.push(['certificate', id]); } };
  return originalLoad.call(this, spec, ...args);
};
const pdf = require('../src/app/api/contracts/[id]/pdf/route.ts');
const certificate = require('../src/app/api/contracts/[id]/certificate/route.ts');
const sharedPdf = require('../src/app/api/contracts/share/[token]/pdf/route.ts');
const sharedCertificate = require('../src/app/api/contracts/share/[token]/certificate/route.ts');
const upload = require('../src/app/api/profile/upload-cnic/route.ts');
const cnic = require('../src/app/api/profile/cnic/route.ts');
const request = () => new Request('http://localhost:3000/api/test');
const params = () => ({ params: Promise.resolve({ id: 'contract-1', token: 'share-1' }) });
function uploadRequest(file) {
  const form = new FormData();
  if (file !== undefined) form.set('file', file);
  return new Request('http://localhost:3000/api/profile/upload-cnic', { method: 'POST', body: form });
}
test.beforeEach(() => {
  identity = { id: 'owner' };
  contract = { id: 'contract-1', initiatorId: 'owner', respondentId: 'recipient', status: 'ACTIVE', shareToken: 'share-1', pdfUrl: 'agreements/contract-1.pdf' };
  profile = { id: 'owner', cnicPhotoUrl: 'cnic/old-supabase-auth-id.png' };
  exists = true;
  storageFailure = undefined;
  awsFailure = undefined;
  calls = [];
  commands = [];
});
test.after(() => { S3Client.prototype.send = originalSend; });

test('S3 signing keeps credentials server-side and limits lifetime/cache', async () => {
  const signed = new URL(await storage.getPrivateDownloadUrl('cnic/owner.png', 60));
  assert.equal(signed.hostname, 'unit-test-private-bucket.s3.us-east-1.amazonaws.com');
  assert.equal(signed.searchParams.get('X-Amz-Expires'), '60');
  assert.equal(signed.searchParams.get('response-cache-control'), 'private, no-store');
  assert(!signed.href.includes('test-secret-key'));
  await assert.rejects(storage.getPrivateDownloadUrl('cnic/owner.png', 301));
});
test('private storage rejects URL inputs and traversal paths before AWS access', async () => {
  for (const key of ['https://other.example/file', 'cnic/../other', 'cnic//file', 'public/file']) {
    await assert.rejects(storage.uploadPrivateFile(key, png, 'image/png'));
    await assert.rejects(storage.getPrivateDownloadUrl(key));
  }
  assert.equal(commands.length, 0);
});
test('only a missing object is treated as absent; permissions failures propagate', async () => {
  awsFailure = { $metadata: { httpStatusCode: 404 } };
  assert.equal(await storage.privateFileExists('agreements/missing.pdf'), false);
  awsFailure = Object.assign(new Error('Denied'), { $metadata: { httpStatusCode: 403 } });
  await assert.rejects(storage.privateFileExists('agreements/private.pdf'), /Denied/);
});
test('S3 uploads use encryption and private cache settings without public ACLs', async () => {
  await storage.uploadPrivateFile('cnic/owner.png', png, 'image/png');
  assert.equal(commands[0].input.ServerSideEncryption, 'AES256');
  assert.equal(commands[0].input.CacheControl, 'private, no-store');
  assert.equal(commands[0].input.ACL, undefined);
});
test('anonymous users cannot access private downloads or upload identity images', async () => {
  identity = null;
  for (const route of [pdf, certificate, cnic]) assert.equal((await route.GET(request(), params())).status, 401);
  assert.equal((await upload.POST(uploadRequest(new File([png], 'id.png')))).status, 401);
  assert.deepEqual(calls, []);
});
test('unrelated users cannot download another contract', async () => {
  identity = { id: 'stranger' };
  assert.equal((await pdf.GET(request(), params())).status, 404);
  assert.equal((await certificate.GET(request(), params())).status, 404);
  assert.deepEqual(calls, []);
});
test('owner and respondent receive a private link without regenerating saved evidence', async () => {
  for (const id of ['owner', 'recipient']) {
    identity = { id };
    const res = await pdf.GET(request(), params());
    assert.equal(res.status, 200);
    assert.equal(res.headers.get('cache-control'), 'no-store');
    assert.equal((await res.json()).url, 'https://private.example.invalid/download');
  }
  assert(!calls.some(([operation]) => operation === 'generate'));
  assert(calls.some(([operation, key, ttl]) => operation === 'sign' && key === contract.pdfUrl && ttl === 60));
});
test('missing PDF generates once and receives a signed link', async () => {
  exists = false;
  contract.pdfUrl = null;
  assert.equal((await pdf.GET(request(), params())).status, 200);
  assert.equal(calls.filter(([operation]) => operation === 'generate').length, 1);
});
test('draft previews regenerate so edits cannot serve stale PDFs', async () => {
  contract.status = 'DRAFT';
  assert.equal((await pdf.GET(request(), params())).status, 200);
  assert.equal(calls.filter(([operation]) => operation === 'generate').length, 1);
});
test('missing archived PDFs are not silently regenerated during an incomplete migration', async () => {
  exists = false;
  for (const route of [pdf, sharedPdf]) assert.equal((await route.GET(request(), params())).status, 503);
  assert(!calls.some(([operation]) => operation === 'generate'));
});
test('storage outages do not overwrite saved PDFs', async () => {
  storageFailure = new Error('Storage unavailable');
  const previous = console.error;
  console.error = () => {};
  try { assert.equal((await pdf.GET(request(), params())).status, 500); }
  finally { console.error = previous; }
  assert(!calls.some(([operation]) => operation === 'generate'));
});
test('share links reject unknown tokens and unexecuted contracts', async () => {
  for (const route of [sharedPdf, sharedCertificate]) {
    assert.equal((await route.GET(request(), { params: Promise.resolve({ token: 'wrong' }) })).status, 404);
    contract.status = 'DRAFT';
    assert.equal((await route.GET(request(), params())).status, 400);
  }
  assert.deepEqual(calls, []);
});
test('executed share links sign existing PDFs and certificates for five minutes', async () => {
  for (const route of [sharedPdf, sharedCertificate]) {
    const res = await route.GET(request(), params());
    assert.equal(res.status, 200);
    assert.equal(res.headers.get('cache-control'), 'no-store');
  }
  assert.equal(calls.filter(([operation, , ttl]) => operation === 'sign' && ttl === 300).length, 2);
  assert(!calls.some(([operation]) => ['generate', 'certificate'].includes(operation)));
});
test('CNIC download uses the signed-in user database path, including migrated legacy keys', async () => {
  const res = await cnic.GET(new Request('http://localhost:3000/api/profile/cnic?userId=someone-else'));
  assert.equal(res.status, 200);
  assert.deepEqual(calls, [['sign', 'cnic/old-supabase-auth-id.png', 60]]);
});
test('CNIC upload rejects text fields, empty files, oversized images and disguised HTML', async () => {
  for (const file of ['not a file', new File([], 'empty.png'), new File([Buffer.alloc(4 * 1024 * 1024 + 1)], 'large.png'), new File(['<script>alert(1)</script>'], 'id.png', { type: 'image/png' })]) {
    assert.equal((await upload.POST(uploadRequest(file))).status, 400);
  }
  assert.deepEqual(calls, []);
});
test('valid CNIC image uses detected content type, generated key and stores only the path', async () => {
  const res = await upload.POST(uploadRequest(new File([png], 'unsafe.html', { type: 'text/html' })));
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.match(data.path, /^cnic\/owner-[\da-f-]+\.png$/);
  assert.equal(data.profile.cnicPhotoUrl, data.path);
  assert.equal(calls[0][3], 'image/png');
  assert.deepEqual(calls[1], ['db-update', 'owner']);
});
