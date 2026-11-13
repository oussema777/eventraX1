import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { stripTypeScriptTypes } from 'node:module';
import vm from 'node:vm';
const brandSource=readFileSync(new URL('../supabase/functions/_shared/emailBrand.mjs',import.meta.url),'utf8').replace(/^export /gm,'');

// Exercise the real edge handler with isolated database/auth doubles. No
// accounts are created and no messages are sent to production.
const shared = stripTypeScriptTypes(readFileSync(new URL('../supabase/functions/_shared/onlineExperience.ts', import.meta.url), 'utf8')).replace(/^export /gm, '');
const receipts = stripTypeScriptTypes(readFileSync(new URL('../supabase/functions/_shared/registrationReceipt.ts', import.meta.url), 'utf8').replace(/^import .*?;\r?\n/gm, '')).replace(/^export /gm, '');
const accessSource = stripTypeScriptTypes(readFileSync(new URL('../supabase/functions/_shared/registrationAccess.ts', import.meta.url), 'utf8')).replace(/^export /gm, '');
const source = accessSource + '\n' + brandSource + '\n' + shared + '\n' + receipts + '\n' + stripTypeScriptTypes(readFileSync(new URL('../supabase/functions/create-event-registration/index.ts', import.meta.url), 'utf8')
  .replace(/^import .*?;\r?\n/gm, ''));

function setup({ duplicate = false, profileId = null, linkError = false, profileError = false, profileUpdateError = false, accountError = false, accountMismatch = false, authLookupError = false, newAccount = false, sendEmail = false, online = false, providerStatus = 200 } = {}) {
  let handler;
  const writes = [];
  const accountChecks = [];
  let rpcPayload;
  let generatedLink;
  let emailPayload;
  let attendeeUpdate;
  const admin = {
    auth: { admin: {
      getUserById: async (id) => authLookupError ? {error:{message:'Database error loading user'}} : ({data:{user:{id,email:'guest@example.test',identities:[{provider:'email'}]}}}),
      createUser: async () => { if (!newAccount) throw new Error('Unexpected account creation'); return {data:{user:{id:'new-user-id'}}}; },
      generateLink: async payload => {
        generatedLink = payload;
        return { data: { properties: { action_link: 'https://example.test/one-time-test-link' } } };
      },
    } },
    from(table) {
      let updating = false;
      const chain = {
        select() { return chain; }, eq() { return chain; }, or() { return chain; }, in() { return chain; },
        update(data) { if (table === 'event_attendees') attendeeUpdate = data; updating = true; writes.push({ table, data }); return chain; },
        upsert(data) { writes.push({ table, data }); return chain; },
        then(resolve) { return Promise.resolve({ data:[], error: updating && table === 'profiles' && profileUpdateError ? { message: 'Write failed' } : null }).then(resolve); },
        async single() {
          if (table === 'events') return { data: { id: 'event-id', name: 'Test Event', start_date: '2026-10-20', workshop_selection_limit: null, ...(online ? {event_format:'virtual', attendee_settings:{onlineExperience:{version:1,enabled:true,linkVisibility:'public',provider:'Meet',meetingUrl:'https://example.test/room',instructions:'Welcome',supportEmail:'help@example.test',startsAt:'2026-11-18T15:00:00Z',endsAt:'2026-11-18T16:00:00Z',timeZone:'Africa/Tunis',joinMinutes:10,recording:true}}} : {}) } };
          if (updating) return linkError ? { error: { message: 'Write failed' } } : { data: { id: 'attendee-id' } };
          return { data: { id: 'attendee-id', profile_id: attendeeUpdate?.profile_id ?? (duplicate ? profileId : rpcPayload?.p_attendee?.profile_id), email:'guest@example.test', name:'Guest', status:'registered', meta: attendeeUpdate?.meta || (duplicate ? { b2bOptIn:true, confirmation_code:'ORIGINAL', note:'keep' } : rpcPayload?.p_attendee?.meta) } };
        },
        async maybeSingle() {
          if (table !== 'profiles') return {data:null,error:null};
          if (newAccount) return {data:null,error:null};
          return profileError ? { error: { message: 'Database unavailable' } } : {
            data: { id: 'user-id', full_name: profileUpdateError ? null : 'Guest', industry: 'IT', phone_number: '123', company: 'Company', company_description: 'About', sector: 'IT', social_url: 'https://example.test' }
          };
        }
      };
      return chain;
    },
    async rpc(_name, payload) {
      if (_name === 'ensure_registration_auth_account') {
        accountChecks.push(payload);
        return accountError ? {error:{code:'P0001',message:typeof accountError === 'string' ? accountError : 'temporary'}} : {data:accountMismatch ? 'wrong-id' : payload.p_user_id};
      }
      if (_name === 'claim_registration_preparation') return {data:true};
      if (_name === 'claim_platform_mail') return {data:{id:'delivery',token:'lease',mail:payload.p_mail}};
      if (_name === 'finish_platform_mail') return {data:true};
      rpcPayload = payload;
      return duplicate ? { error: { code: '23505' } } : { data: { id: 'attendee-id' } };
    }
  };
  vm.runInNewContext(source, {
    createClient: () => admin, Response, Request, URL, URLSearchParams, TextEncoder, crypto, AbortSignal, console, setTimeout,
    fetch: async (_url, options) => { emailPayload = JSON.parse(options.body); return new Response('{"id":"provider-receipt"}',{status:providerStatus}); },
    Deno: { env: { get: key => key === 'EVENTRA_APP_ORIGIN' ? (sendEmail ? 'https://eventra.cloud' : undefined) : 'test' }, serve: fn => { handler = fn; } }
  });
  return {
    writes, accountChecks, get rpcPayload() { return rpcPayload; },
    get generatedLink() { return generatedLink; }, get emailPayload() { return emailPayload; },
    request: (overrides = {}) => handler(new Request('https://example.test/register', {
      method: 'POST', body: JSON.stringify({ event_id: 'event-id', email: '  GUEST@Example.test ', b2b_opt_in: true, allow_pending_networking:true, ...overrides })
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
  assert.equal(app.accountChecks[0].p_email, 'guest@example.test');
  assert.equal(app.accountChecks[0].p_user_id, 'user-id');
});

test('failed auth repair saves registration with pending networking and no false access link', async () => {
  for (const newAccount of [false, true]) for (const accountMismatch of [false, true]) {
    const app = setup({newAccount, accountMismatch, accountError:!accountMismatch, sendEmail:true});
    const response = await app.request();
    assert.equal(response.status, 200);
    assert.equal((await response.json()).b2b_access_status, 'pending');
    assert.equal(app.rpcPayload.p_attendee.profile_id, null);
    assert.equal(app.writes.length, 0);
    assert.equal(app.generatedLink, undefined);
    assert.ok(!app.emailPayload?.html?.includes('one-time-test-link'));
  }
});

test('new B2B account is verified before saving its registration', async () => {
  const app = setup({newAccount:true});
  const response = await app.request();
  assert.equal(response.status, 200);
  assert.equal(app.accountChecks[0].p_user_id, 'new-user-id');
  assert.equal(app.rpcPayload.p_attendee.profile_id, 'new-user-id');
});

test('actual auth API failure preserves admission but does not claim ready networking', async () => {
  for (const newAccount of [false, true]) {
    const app = setup({newAccount,authLookupError:true,sendEmail:true});
    const response=await app.request();
    assert.equal(response.status,200);
    assert.equal((await response.json()).b2b_access_status,'pending');
    assert.equal(app.rpcPayload.p_attendee.profile_id,null);
    assert.equal(app.writes.length,0);
    assert.ok(!app.emailPayload?.html?.includes('one-time-test-link'));
  }
});

test('returning participant can use the same account for a different event next year', async () => {
  const app = setup();
  for (const event_id of ['event-2026','event-2027']) {
    const response = await app.request({event_id});
    assert.equal(response.status,200);
    assert.equal((await response.json()).user_id,'user-id');
    assert.equal(app.rpcPayload.p_attendee.event_id,event_id);
    assert.equal(app.rpcPayload.p_attendee.email,'guest@example.test');
  }
  assert.equal(app.accountChecks.length,2);
});

test('account review gets a safe actionable code instead of private auth details', async () => {
  const app = setup({accountError:'REGISTRATION_AUTH_IDENTITY_CONFLICT'});
  const response = await app.request();
  assert.equal(response.status,200);
  const body=await response.json();
  assert.equal(body.b2b_access_status,'review');
  assert.equal(JSON.stringify(body).includes('IDENTITY_CONFLICT'),false);
  assert.equal(app.rpcPayload.p_attendee.profile_id,null);
});

test('old browsers cannot mistake pending networking for successful immediate access',async()=>{
 const app=setup({accountError:true});
 assert.equal((await app.request({allow_pending_networking:false})).status,503);
 assert.equal(app.rpcPayload,undefined);
});

test('B2B access email uses the configured callback and does not expose its token', async () => {
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
  const response=await app.request();
  assert.equal(response.status,200);
  assert.equal((await response.json()).b2b_access_status,'review');
  assert.equal(app.writes[0].data.profile_id,undefined);
});

test('failed profile repair cannot report successful B2B access', async () => {
  const app = setup({ duplicate: true, linkError: true });
  assert.equal((await app.request()).status, 503);
});

test('failed identity lookup saves admission without creating an unrelated account', async () => {
  const app = setup({ profileError: true });
  assert.equal((await app.request()).status, 200);
  assert.equal(app.rpcPayload.p_attendee.profile_id, null);
});

test('failed profile enrichment cannot report a fully prepared registration', async () => {
  const app = setup({ profileUpdateError: true });
  const response = await app.request({ full_name: 'Guest' });
  assert.equal(response.status, 200);
  assert.equal((await response.json()).b2b_access_status,'pending');
  assert.equal(app.rpcPayload.p_attendee.profile_id, null);
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
