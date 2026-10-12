import assert from 'node:assert/strict';
import test from 'node:test';
import { eventAuthReturnUrl, safeAuthPath, loginReturnPath } from '../src/utils/authRedirect.ts';
const origin = 'https://eventra.cloud';
test('login destinations reject external links and authentication loops', () => {
  for (const path of ['https://evil.test', '//evil.test', '/login?next=/my-networking', '/register', '/auth/callback', '/event-auth']) {
    assert.equal(loginReturnPath(path, origin), null);
  }
  assert.equal(loginReturnPath('/my-networking?meetingId=123#matches', origin), '/my-networking?meetingId=123#matches');
});
test('auth return URLs stay on the platform and preserve the event destination', () => {
  for (const value of ['//evil.test', '/\\evil.test', 'javascript:alert(1)', 'https://evil.test/event', '/\nevil', 'https://eventra.cloud.evil.test/x']) {
    assert.equal(safeAuthPath(value, origin), null);
  }
  assert.equal(safeAuthPath(`${origin}/event/forum/networking?meeting=123`, origin), '/event/forum/networking?meeting=123');
  const callback = new URL(eventAuthReturnUrl('/event/forum/networking?meeting=123', origin));
  assert.equal(callback.origin, origin);
  assert.equal(callback.pathname, '/event-auth');
  assert.equal(callback.searchParams.get('redirect'), '/event/forum/networking?meeting=123');
});
