import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { stripTypeScriptTypes } from 'node:module';
import vm from 'node:vm';

// Exercise the real edge handler with isolated database/auth doubles. No
// accounts are created and no messages are sent to production.
const shared = stripTypeScriptTypes(readFileSync(new URL('../supabase/functions/_shared/onlineExperience.ts', import.meta.url), 'utf8')).replace(/^export /gm, '');
const source = shared + '\n' + stripTypeScriptTypes(readFileSync(new URL('../supabase/functions/create-event-registration/index.ts', import.meta.url), 'utf8')
  .replace(/^import .*?;\r?\n/gm, ''));

function setup({ duplicate = false, profileId = null, linkError = false, profileError = false, profileUpdateError = false, sendEmail = false, online = false, providerStatus = 200 } = {}) {
  let handler;
  const writes = [];
  let rpcPayload;
  let generatedLink;
  let emailPayload;
  const admin = {
    auth: { admin: {
      createUser: async () => { throw new Error('Unexpected account creation'); },
      generateLink: async payload => {
        generatedLink = payload;
        return { data: { properties: { action_link: 'https://example.test/one-time-test-link' } } };
      },
    } },
    from(table) {
      let updating = false;
      const chain = {
        select() { return chain; }, eq() { return chain; }, or() { return chain; },
        update(data) { updating = true; writes.push({ table, data }); return chain; },
        then(resolve) { return Promise.resolve({ error: updating && table === 'profiles' && profileUpdateError ? { message: 'Write failed' } : null }).then(resolve); },
        async single() {
          if (table === 'events') return { data: { id: 'event-id', name: 'Test Event', start_date: '2026-10-20', workshop_selection_limit: null, ...(online ? {event_format:'virtual', attendee_settings:{onlineExperience:{version:1,enabled:true,linkVisibility:'public',provider:'Meet',meetingUrl:'https://example.test/room',instructions:'Welcome',supportEmail:'help@example.test',startsAt:'2026-11-18T15:00:00Z',endsAt:'2026-11-18T16:00:00Z',timeZone:'Africa/Tunis',joinMinutes:10,recording:true}}} : {}) } };
          if (updating) return linkError ? { error: { message: 'Write failed' } } : { data: { id: 'attendee-id' } };
          return { data: { id: 'attendee-id', profile_id: profileId, meta: { confirmation_code: 'ORIGINAL', note: 'keep' } } };
        },
        async maybeSingle() {
          return profileError ? { error: { message: 'Database unavailable' } } : {
            data: { id: 'user-id', full_name: profileUpdateError ? null : 'Guest', industry: 'IT', phone_number: '123', company: 'Company', company_description: 'About', sector: 'IT', social_url: 'https://example.test' }
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
    createClient: () => admin, Response, Request, URL, URLSearchParams, TextEncoder, console, setTimeout,
    fetch: async (_url, options) => { emailPayload = JSON.parse(options.body); return new Response('{}',{status:providerStatus}); },
    Deno: { env: { get: key => sendEmail && key === 'EVENTRA_APP_ORIGIN' ? undefined : 'test' }, serve: fn => { handler = fn; } }
  });
  return {
    writes, get rpcPayload() { return rpcPayload; },
    get generatedLink() { return generatedLink; }, get emailPayload() { return emailPayload; },
    request: (overrides = {}) => handler(new Request('https://example.test/register', {
      method: 'POST', body: JSON.stringify({ event_id: 'event-id', email: '  GUEST@Example.test ', b2b_opt_in: true, ...overrides })
    }))
  };
}

test('B2B registration normalizes email and returns a linked account without exposing a login token', async () => {
  const app = setup();
  const res = await app.request();
  const result = await res.json();
  assert.equal(res.status, 200);
  assert.equal(result.user_id, 'user-id');
  assert.equal(Object.hasOwn(result, 'magic_link'), false);
  assert.equal(app.rpcPayload.p_attendee.email, 'guest@example.test');
});

test('B2B access email defaults to the approved production callback and does not expose its token', async () => {
  const app = setup({ sendEmail: true });
  const response = await app.request({ full_name: 'Guest' });
  const result = await response.json();
  assert.equal(response.status, 200);
  assert.equal(result.access_email_sent, true);
  const callback = new URL(app.generatedLink.options.redirectTo);
  assert.equal(callback.origin, 'https://eventra.cloud');
  assert.equal(callback.pathname, '/auth/callback');
  assert.equal(callback.searchParams.get('next'), 'https://eventra.cloud/event/event-id/networking');
  assert.deepEqual(app.emailPayload.to, ['guest@example.test']);
  assert.ok(app.emailPayload.html.includes('https://example.test/one-time-test-link'));
  assert.equal(JSON.stringify(result).includes('one-time-test-link'), false);
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

test('failed profile enrichment cannot report a fully prepared registration', async () => {
  const app = setup({ profileUpdateError: true });
  const response = await app.request({ full_name: 'Guest' });
  assert.equal(response.status, 503);
  assert.equal(app.rpcPayload, undefined);
  assert.equal(app.writes[0].table, 'profiles');
});

test('enabled virtual event email keeps secure B2B access and omits the physical pass', async () => {
  for (const duplicate of [false,true]) {
    const app = setup({sendEmail:true,online:true,duplicate});
    const response = await app.request({full_name:'Guest'});
    const body = await response.json();
    assert.equal(response.status,200);
    assert.equal(body.access_email_sent,true);
    assert.ok(app.emailPayload.html.includes('/event/event-id/access'));
    assert.ok(app.emailPayload.html.includes('https://example.test/one-time-test-link'));
    assert.equal(app.emailPayload.html.includes('qrserver.com'),false);
    assert.equal(JSON.stringify(body).includes('one-time-test-link'),false);
  }
});

test('provider rejection preserves registration and truthfully reports email failure', async () => {
 const app=setup({sendEmail:true,online:true,providerStatus:403});
 const response=await app.request({full_name:'Guest'});
 const result=await response.json();
 assert.equal(response.status,200);
 assert.equal(result.success,true);
 assert.equal(result.access_email_sent,false);
 assert.equal(JSON.stringify(result).includes('one-time-test-link'),false);
});
