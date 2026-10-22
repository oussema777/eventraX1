import assert from 'node:assert/strict';
import test from 'node:test';
import {readFileSync} from 'node:fs';
import {stripTypeScriptTypes} from 'node:module';
async function load(path){const code=stripTypeScriptTypes(readFileSync(new URL(path,import.meta.url),'utf8'));return import('data:text/javascript;base64,'+Buffer.from(code).toString('base64'))}
const {onlineMeetingPhase,checkedMeetingUrl}=await load('../src/utils/onlineMeeting.ts');
const {renderMeetingEmail}=await load('../src/lib/meetingEmail.ts');
const start=Date.parse('2026-11-18T15:40:00Z'),end=start+300000;
const meeting={status:'confirmed',startAt:new Date(start).toISOString(),endAt:new Date(end).toISOString(),meetingUrl:'https://example.test/private-room'};
const row={event_id:'event',status:'confirmed',start_at:meeting.startAt,end_at:meeting.endAt,meta:{meeting_format:'video',video_url:meeting.meetingUrl}};
test('private meeting opens at appointment time and ends at its end time',()=>{
 assert.equal(onlineMeetingPhase(meeting,start-1),'upcoming');
 assert.equal(onlineMeetingPhase(meeting,start),'open');
 assert.equal(onlineMeetingPhase(meeting,end-1),'open');
 assert.equal(onlineMeetingPhase(meeting,end),'ended');
 for(const status of ['pending','cancelled'])assert.equal(onlineMeetingPhase({...meeting,status},start),status);
 for(const changes of [{startAt:null},{endAt:null},{meetingUrl:'javascript:alert(1)'},{meetingUrl:'https://user:password@example.test'}])assert.equal(onlineMeetingPhase({...meeting,...changes},start),'unavailable');
});
test('fresh row prevents joining cancelled, rescheduled, other-event or unauthorized meetings',()=>{
 assert.equal(checkedMeetingUrl(row,'event',true,start),meeting.meetingUrl);
 for(const changed of [{...row,status:'cancelled'},{...row,status:'pending'},{...row,event_id:'other'},{...row,start_at:new Date(end).toISOString(),end_at:new Date(end+300000).toISOString()},{...row,meta:{meeting_format:'in-person',video_url:meeting.meetingUrl}}])assert.throws(()=>checkedMeetingUrl(changed,'event',true,start));
 assert.throws(()=>checkedMeetingUrl(row,'event',false,start));
});
const email={status:'confirmed',recipientName:'Guest',partnerName:'Partner',eventName:'Example',meetingDate:'18 Nov',meetingTime:'17:40',networkingUrl:'https://example.test/schedule',qrCodeUrl:'https://example.test/physical-qr',videoUrl:meeting.meetingUrl};
test('opted-in video emails have schedule access but no physical QR or raw room link in every supported language',()=>{
 for(const locale of ['en','fr','ar']){
  const html=renderMeetingEmail({...email,locale,onlineExperience:true,meetingFormat:'video'});
  assert.ok(!html.includes('physical-qr'));assert.ok(!html.includes('private-room'));assert.ok(html.includes('https://example.test/schedule'));
 }
});
test('missing video URL does not turn an online meeting into a physical meeting',()=>{
 const html=renderMeetingEmail({...email,videoUrl:undefined,onlineExperience:true,meetingFormat:'video'});
 assert.ok(!html.includes('physical-qr'));assert.ok(!html.includes('Show this code'));
});
test('hybrid keeps its physical pass and routes video access through the current schedule',()=>{
 const html=renderMeetingEmail({...email,onlineExperience:true,meetingFormat:'hybrid'});
 assert.ok(html.includes('physical-qr'));assert.ok(!html.includes('private-room'));
});
test('legacy rendering remains byte-for-byte identical when activation is false',()=>{
 assert.equal(renderMeetingEmail(email),renderMeetingEmail({...email,onlineExperience:false,meetingFormat:'video'}));
 assert.ok(renderMeetingEmail(email).includes('physical-qr'));
});
test('cancelled and pending messages never include physical passes or direct room buttons',()=>{
 for(const status of ['pending','cancelled']){const html=renderMeetingEmail({...email,status,onlineExperience:true,meetingFormat:'video'});assert.ok(!html.includes('physical-qr'));assert.ok(!html.includes('private-room'))}
});
