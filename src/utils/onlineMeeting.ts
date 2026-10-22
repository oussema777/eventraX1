export type OnlineMeetingPhase = 'pending' | 'cancelled' | 'upcoming' | 'open' | 'ended' | 'unavailable';
export interface OnlineMeetingDetails {
  status?: string; startAt?: string | null; endAt?: string | null;
  meetingUrl?: string; meetingFormat?: string; onlineExperienceEnabled?: boolean;
}
export function safeMeetingUrl(value?: string): string | null {
  try { const u=new URL(value || ''); return u.protocol==='https:' && !u.username && !u.password ? u.href : null; } catch { return null; }
}
export function onlineMeetingPhase(meeting:OnlineMeetingDetails,now=Date.now()):OnlineMeetingPhase {
  if(meeting.status==='cancelled'||meeting.status==='declined')return 'cancelled';
  if(meeting.status==='pending')return 'pending';
  if(meeting.status!=='confirmed'||!Number.isFinite(now))return 'unavailable';
  const start=Date.parse(meeting.startAt||''),end=Date.parse(meeting.endAt||'');
  if(!Number.isFinite(start)||!Number.isFinite(end)||end<=start)return 'unavailable';
  if(now>=end)return 'ended';
  if(now<start)return 'upcoming';
  return safeMeetingUrl(meeting.meetingUrl)?'open':'unavailable';
}
export function meetingIsOnline(format?:string) {return format==='video'||format==='hybrid';}
export function checkedMeetingUrl(row: {event_id?:string;status?:string;start_at?:string;end_at?:string;meta?:{meeting_format?:string;meeting_type?:string;video_url?:string}},eventId:string|null|undefined,isParticipant:boolean,now=Date.now()):string {
  if (!eventId || row.event_id!==eventId || !isParticipant) throw new Error('This room is for the meeting participants.');
  const details={status:row.status,startAt:row.start_at,endAt:row.end_at,meetingUrl:row.meta?.video_url};
  if (!meetingIsOnline(row.meta?.meeting_format || row.meta?.meeting_type) || onlineMeetingPhase(details,now)!=='open') throw new Error('This meeting is not available to join now. Check its latest status and appointment time.');
  return safeMeetingUrl(details.meetingUrl)!;
}
