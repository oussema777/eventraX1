import assert from 'node:assert/strict';
import test from 'node:test';
import {readFileSync} from 'node:fs';
import {stripTypeScriptTypes} from 'node:module';
const source=stripTypeScriptTypes(readFileSync(new URL('../supabase/functions/_shared/onlineExperience.ts',import.meta.url),'utf8'));
const {onlineConfig,sessionPhase,renderOnlineEmail,calendarFile,onlineErrors}=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
const config={version:1,enabled:true,linkVisibility:'public',provider:'Meet',meetingUrl:'https://example.test/room',instructions:'Join early',supportEmail:'help@example.test',startsAt:'2026-11-18T15:00:00Z',endsAt:'2026-11-18T16:00:00Z',timeZone:'Asia/Beirut',joinMinutes:10,recording:true};
const event={id:'test',name:'<script>Event</script>',event_format:'virtual',attendee_settings:{onlineExperience:config}};
test('legacy, paid and access-code events are never implicitly activated',()=>{
 for(const input of [{},{...event,attendee_settings:{}},{...event,event_format:'in-person'},{...event,event_status:'paid'},{...event,access_code:'secret'},{...event,attendee_settings:{onlineExperience:{...config,enabled:false}}}])assert.equal(onlineConfig(input),null);
 assert.deepEqual(onlineConfig(event),config);
});
test('joining boundaries are inclusive at open and exclusive at end',()=>{
 assert.equal(sessionPhase(config,Date.parse('2026-11-18T14:49:59Z')),'upcoming');
 assert.equal(sessionPhase(config,Date.parse('2026-11-18T14:50:00Z')),'open');
 assert.equal(sessionPhase(config,Date.parse('2026-11-18T16:00:00Z')),'ended');
 assert.equal(sessionPhase({...config,endsAt:'bad'}),'unavailable');
});
test('unsafe URLs, ambiguous times and invalid zones cannot activate',()=>{
 for(const patch of [{meetingUrl:'javascript:alert(1)'},{meetingUrl:'https://user:pass@example.test'},{startsAt:'2026-11-18T15:00'},{timeZone:'pt'},{joinMinutes:-1},{linkVisibility:'private'},{endsAt:config.startsAt}])assert.ok(onlineErrors({...config,...patch}).length);
 assert.equal(onlineErrors({...config,meetingUrl:''}).length,0);
});
test('virtual email has no entrance QR, escapes content and uses durable access page',()=>{
 const html=renderOnlineEmail(event,'<Guest>','https://example.test/access','https://example.test/secure','https://example.test/qr');
 assert.ok(!html.includes('https://example.test/qr'));
 assert.ok(!html.includes('https://example.test/room'));
 assert.ok(html.includes('https://example.test/access'));
 assert.ok(html.includes('&lt;Guest&gt;'));
 assert.ok(!html.includes('<script>'));
 const hybrid=renderOnlineEmail({...event,event_format:'hybrid'},'Guest','https://example.test/access',null,'https://example.test/qr');
 assert.ok(hybrid.includes('https://example.test/qr'));
});
test('calendar uses absolute UTC times and cannot inject extra properties',()=>{
 const text=calendarFile('Event\nATTENDEE:evil','test',config,'https://example.test/access');
 assert.ok(text.includes('DTSTART:20261118T150000Z'));
 assert.ok(!text.includes('\r\nATTENDEE:'));
 const long=calendarFile('é'.repeat(100),'test',config,'https://example.test/access');
 assert.ok(long.split('\r\n').every(line=>Buffer.byteLength(line)<=75));
});
