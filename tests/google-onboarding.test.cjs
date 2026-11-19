const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const ts = require('typescript');

process.env.BETTER_AUTH_URL = 'http://localhost:3000';
const originalResolve = Module._resolveFilename;
const originalLoad = Module._load;
Module._resolveFilename = function(spec, ...args) {
  return originalResolve.call(this, spec.startsWith('@/') ? path.join(process.cwd(), 'src', spec.slice(2)) : spec, ...args);
};
require.extensions['.ts'] = (module, file) => module._compile(ts.transpileModule(fs.readFileSync(file, 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
}).outputText, file);

let identity = null;
let users = [];
let contractUpdates = [];
const record = { id: 'private-contract', initiatorId: 'owner', respondentId: null, status: 'DRAFT', totalAmount: 100, advancePayment: 0 };
function lookupContract({ where }) {
  if (where.id !== record.id) return null;
  if (where.initiatorId && where.initiatorId !== record.initiatorId) return null;
  if (where.OR && !where.OR.some(rule => rule.initiatorId === record.initiatorId || (rule.respondentId && rule.respondentId === record.respondentId))) return null;
  return record;
}
const prisma = {
  user: {
    findUnique: async ({ where }) => users.find(user => where.betterAuthId ? user.betterAuthId === where.betterAuthId : user.id === where.id) || null,
    findMany: async ({ where }) => users.filter(user => user.email.toLowerCase() === where.email.equals.toLowerCase()),
    create: async ({ data }) => { const user = { id: `app-${users.length + 1}`, ...data }; users.push(user); return user; },
    update: async ({ where, data }) => {
      const user = users.find(user => user.id === where.id);
      assert(user);
      if (where.AND) assert.equal(user.betterAuthId, null);
      Object.assign(user, data);
      return user;
    },
  },
  contract: {
    findUnique: async args => lookupContract(args),
    findFirst: async args => lookupContract(args),
    update: async args => { contractUpdates.push(args); return { ...record, ...args.data }; },
  },
  $transaction: async callback => callback(prisma),
};
Module._load = function(spec, ...args) {
  if (spec === '@/lib/prisma') return { prisma };
  if (spec === '@/lib/auth') return { auth: { api: { getSession: async () => identity ? { user: identity } : null } } };
  if (spec === 'next/headers') return { headers: async () => new Headers() };
  return originalLoad.call(this, spec, ...args);
};

const onboarding = require('../src/app/api/onboarding/route.ts');
const continuation = require('../src/app/auth/continue/route.ts');
const authUser = require('../src/lib/auth-user.ts');
const contractRoute = require('../src/app/api/contracts/[id]/route.ts');
const complete = require('../src/app/api/contracts/[id]/complete/route.ts');
const advance = require('../src/app/api/contracts/[id]/advance-received/route.ts');
const valid = { name: 'Test Creator', role: 'CREATOR', countryCode: 'US', instagramHandle: '@test.creator' };
function request(body, origin = 'http://localhost:3000', method = 'POST', route = '/api/onboarding') {
  return new Request(`http://localhost:3000${route}`, { method, headers: { Origin: origin, 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
}
function reset() {
  identity = { id: 'google-identity', name: 'Test Creator', email: 'test@example.invalid', emailVerified: true };
  users = [];
  contractUpdates = [];
}
const params = { params: Promise.resolve({ id: record.id }) };

test('anonymous and unverified identities cannot onboard', async () => {
  reset(); identity = null;
  assert.equal((await onboarding.POST(request(valid))).status, 401);
  identity = { id: 'unverified', email: 'test@example.invalid', emailVerified: false };
  assert.equal((await onboarding.POST(request(valid))).status, 401);
  assert.equal(users.length, 0);
});
test('cross-origin signup is blocked before account creation', async () => {
  reset();
  assert.equal((await onboarding.POST(request(valid, 'https://untrusted.example'))).status, 403);
  assert.equal(users.length, 0);
});
test('role, country, organization and social handle are validated', async () => {
  reset();
  for (const input of [{ ...valid, role: 'ADMIN' }, { ...valid, countryCode: 'ZZ' }, { ...valid, role: 'AGENCY' }, { ...valid, instagramHandle: 'https://instagram.com/test' }, { ...valid, name: ['Test'] }]) {
    assert.equal((await onboarding.POST(request(input))).status, 400);
  }
  assert.equal(users.length, 0);
});
test('Google identity supplies email and ID; submitted identity and verification are ignored', async () => {
  reset();
  const response = await onboarding.POST(request({ ...valid, email: 'victim@example.invalid', betterAuthId: 'victim-id', isVerified: true }));
  assert.equal(response.status, 200);
  assert.equal(users[0].email, identity.email);
  assert.equal(users[0].betterAuthId, identity.id);
  assert.equal(users[0].instagramHandle, 'test.creator');
  assert.equal(users[0].isVerified, undefined);
});
test('brand and agency organization names are required and saved', async () => {
  for (const role of ['BRAND', 'AGENCY']) {
    reset();
    assert.equal((await onboarding.POST(request({ ...valid, role, organizationName: 'Test Organization' }))).status, 200);
    assert.equal(users[0].agencyName, 'Test Organization');
    assert.equal(users[0].instagramHandle, null);
  }
});
test('repeat onboarding is idempotent and cannot replace an established role', async () => {
  reset();
  await onboarding.POST(request(valid));
  await onboarding.POST(request({ ...valid, role: 'AGENCY', organizationName: 'Replacement' }));
  assert.equal(users.length, 1);
  assert.equal(users[0].role, 'CREATOR');
});
test('verified email can complete an old profile while preserving its application ID', async () => {
  reset();
  users.push({ id: 'existing-profile', email: 'TEST@example.invalid', betterAuthId: null });
  assert.equal((await onboarding.POST(request(valid))).status, 200);
  assert.equal(users.length, 1);
  assert.equal(users[0].id, 'existing-profile');
  assert.equal(users[0].betterAuthId, identity.id);
});
test('a profile linked to a different Google identity cannot be reassigned', async () => {
  reset();
  users.push({ id: 'other-profile', email: identity.email, betterAuthId: 'different-identity' });
  assert.equal((await onboarding.POST(request(valid))).status, 400);
  assert.equal(users[0].betterAuthId, 'different-identity');
});
test('continuation sends signed-out, new, and returning users to the correct page', async () => {
  reset(); identity = null;
  assert.equal(new URL((await continuation.GET(new Request('http://localhost:3000/auth/continue'))).headers.get('location')).pathname, '/login');
  reset();
  assert.equal(new URL((await continuation.GET(new Request('http://localhost:3000/auth/continue'))).headers.get('location')).pathname, '/onboarding');
  await onboarding.POST(request(valid));
  assert.equal(new URL((await continuation.GET(new Request('http://localhost:3000/auth/continue'))).headers.get('location')).pathname, '/dashboard');
});
test('application authentication requires the stable identity link and blocks cross-origin mutations', async () => {
  reset();
  users.push({ id: 'old-unlinked', email: identity.email, betterAuthId: null });
  assert.equal(await authUser.getAuthUser(), null);
  users[0].betterAuthId = identity.id;
  assert.equal((await authUser.getAuthUser()).id, 'old-unlinked');
  assert.equal(await authUser.getAuthUser(request({}, 'https://untrusted.example')), null);
});
test('signed-in users cannot read or mutate another user’s contract', async () => {
  reset(); users.push({ id: 'outsider', email: identity.email, betterAuthId: identity.id });
  assert.equal((await contractRoute.GET(new Request('http://localhost:3000/api/contracts/private-contract'), params)).status, 404);
  assert.equal((await contractRoute.PUT(request({ totalAmount: 999 }, undefined, 'PUT'), params)).status, 404);
  assert.equal((await contractRoute.DELETE(request({}, undefined, 'DELETE'), params)).status, 404);
  assert.equal((await complete.POST(request({}), params)).status, 404);
  assert.equal((await advance.POST(request({}), params)).status, 404);
  assert.equal(contractUpdates.length, 0);
});
test('draft edits cannot transfer ownership or inject contract status', async () => {
  reset(); users.push({ id: 'owner', email: identity.email, betterAuthId: identity.id });
  assert.equal((await contractRoute.PUT(request({ totalAmount: 150, initiatorId: 'attacker', status: 'ACTIVE', verifyToken: 'fake' }, undefined, 'PUT'), params)).status, 200);
  const data = contractUpdates[0].data;
  assert.equal(data.totalAmount, 150);
  assert.equal(data.remainingAmount, 150);
  assert.equal(data.initiatorId, undefined);
  assert.equal(data.status, undefined);
  assert.equal(data.verifyToken, undefined);
});
