import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { stripTypeScriptTypes } from 'node:module';
import vm from 'node:vm';

// Exercise the real edge handler with isolated database/auth doubles. No
// accounts are created and no messages are sent to production.
const source = stripTypeScriptTypes(readFileSync(new URL('../supabase/functions/create-event-registration/index.ts', import.meta.url), 'utf8')
  .replace(/^import .*?;\r?\n/m, ''));

function setup({ duplicate = false, profileId = null, linkError = false, profileError = false } = {}) {
  let handler;
  const writes = [];
  let rpcPayload;
  const admin = {
    auth: { admin: { createUser: async () => { throw new Error('Unexpected account creation'); } } },
    from(table) {
      let updating = false;
      const chain = {
        select() { return chain; }, eq() { return chain; }, or() { return chain; },
        update(data) { updating = true; writes.push({ table, data }); return chain; },
        async single() {
          if (table === 'events') return { data: { id: 'event-id', start_date: '2026-10-20', workshop_selection_limit: null } };
          if (updating) return linkError ? { error: { message: 'Write failed' } } : { data: { id: 'attendee-id' } };
          return { data: { id: 'attendee-id', profile_id: profileId, meta: { confirmation_code: 'ORIGINAL', note: 'keep' } } };
        },
        async maybeSingle() {
          return profileError ? { error: { message: 'Database unavailable' } } : {
            data: { id: 'user-id', phone_number: '123', company: 'Company', company_description: 'About', sector: 'IT', social_url: 'https://example.test' }
          };
        }
      };
      return chain;
    },
    async rpc(_name, payload) {
      rpcPayload = payload;
      return duplicate ? { error: { code: '23505' } } : { data: { id: 'attendee-id' } };
    }
  };
  vm.runInNewContext(source, {
    createClient: () => admin, Response, Request, console, setTimeout,
    Deno: { env: { get: () => 'test' }, serve: fn => { handler = fn; } }
  });
  return {
    writes, get rpcPayload() { return rpcPayload; },
    request: (overrides = {}) => handler(new Request('https://example.test/register', {
      method: 'POST', body: JSON.stringify({ event_id: 'event-id', email: '  GUEST@Example.test ', b2b_opt_in: true, ...overrides })
    }))
  };
}

test('B2B registration normalizes email and returns a linked account without minting a login token', async () => {
  const app = setup();
  const res = await app.request();
  const result = await res.json();
  assert.equal(res.status, 200);
  assert.equal(result.user_id, 'user-id');
  assert.equal(result.magic_link, null);
  assert.equal(app.rpcPayload.p_attendee.email, 'guest@example.test');
});

test('repeat registration repairs a missing profile link and preserves registration data', async () => {
  const app = setup({ duplicate: true });
  const res = await app.request();
  const result = await res.json();
  assert.equal(res.status, 200);
  assert.equal(result.confirmation_code, 'ORIGINAL');
  assert.equal(result.already_registered, true);
  assert.equal(app.writes[0].data.profile_id, 'user-id');
  assert.equal(app.writes[0].data.meta.note, 'keep');
  assert.equal(app.writes[0].data.meta.b2bOptIn, true);
});

test('repeat registration cannot reassign another account', async () => {
  const app = setup({ duplicate: true, profileId: 'other-user' });
  assert.equal((await app.request()).status, 409);
  assert.equal(app.writes.length, 0);
});

test('failed profile repair cannot report successful B2B access', async () => {
  const app = setup({ duplicate: true, linkError: true });
  assert.equal((await app.request()).status, 503);
});

test('failed identity lookup stops registration instead of creating an unrelated account', async () => {
  const app = setup({ profileError: true });
  assert.equal((await app.request()).status, 503);
  assert.equal(app.rpcPayload, undefined);
});
