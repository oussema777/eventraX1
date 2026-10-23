// Shared by the browser and registration email function. No event-specific rules.
export interface OnlineExperience {
  version: 1;
  enabled: boolean;
  linkVisibility: 'public';
  provider: string;
  meetingUrl: string;
  instructions: string;
  supportEmail: string;
  startsAt: string;
  endsAt: string;
  timeZone: string;
  joinMinutes: number;
  recording: boolean;
}
export const emptyOnlineExperience: OnlineExperience = {
  version: 1, enabled: false, linkVisibility: 'public', provider: 'Google Meet', meetingUrl: '',
  instructions: '', supportEmail: '', startsAt: '', endsAt: '', timeZone: 'UTC', joinMinutes: 10, recording: false,
};
export function httpsUrl(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  try { const u = new URL(value); return u.protocol === 'https:' && !u.username && !u.password ? u.href : null; } catch { return null; }
}
export function validZone(value: unknown): boolean {
  if (typeof value !== 'string' || !value) return false;
  try { new Intl.DateTimeFormat('en', {timeZone:value}).format(); return true; } catch { return false; }
}
export function onlineErrors(c: OnlineExperience): string[] {
  if (!c.enabled) return [];
  const errors: string[] = [];
  if (c.version !== 1 || c.linkVisibility !== 'public') errors.push('Choose a shareable main-session link.');
  if (typeof c.meetingUrl !== 'string' || (c.meetingUrl && !httpsUrl(c.meetingUrl))) errors.push('Use a secure meeting link beginning with https://.');
  if (typeof c.provider !== 'string' || !c.provider.trim()) errors.push('Enter the meeting platform.');
  if (typeof c.instructions !== 'string') errors.push('Enter valid joining instructions.');
  if (typeof c.supportEmail !== 'string' || !/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(c.supportEmail)) errors.push('Enter a valid support email.');
  const absoluteDate = (s: unknown) => typeof s === 'string' && /T.*(?:Z|[+-]\d{2}:\d{2})$/.test(s) && Number.isFinite(Date.parse(s));
  if (!absoluteDate(c.startsAt) || !absoluteDate(c.endsAt) || Date.parse(c.endsAt) <= Date.parse(c.startsAt)) errors.push('Set a session end time after its start time.');
  if (!validZone(c.timeZone)) errors.push('Choose a valid event time zone.');
  if (![5,10,15].includes(c.joinMinutes)) errors.push('Choose a joining window of 5, 10 or 15 minutes.');
  return errors;
}
export function onlineConfig(event: any): OnlineExperience | null {
  // Explicit opt-in only. Paid and access-code events retain their existing flow.
  const c = event?.attendee_settings?.onlineExperience;
  if (!c || c.enabled !== true || c.version !== 1 || !['virtual','hybrid'].includes(event?.event_format) || event?.event_status === 'paid' || event?.access_code || event?.is_public === false) return null;
  return onlineErrors(c).length ? null : c;
}
export function sessionPhase(c: OnlineExperience, now = Date.now()): 'upcoming'|'open'|'ended'|'unavailable' {
  if (!Number.isFinite(now) || onlineErrors({...c, enabled:true}).length) return 'unavailable';
  if (now >= Date.parse(c.endsAt)) return 'ended';
  return now < Date.parse(c.startsAt) - c.joinMinutes * 60000 ? 'upcoming' : 'open';
}
export function escapeOnlineHtml(value: unknown) { return String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!)); }
export function onlineDate(c: OnlineExperience, zone = c.timeZone) {
  const timeZone = validZone(zone) ? zone : c.timeZone;
  const date = new Intl.DateTimeFormat('en', {timeZone,weekday:'long',day:'numeric',month:'long',year:'numeric'}).format(new Date(c.startsAt));
  const t = new Intl.DateTimeFormat('en', {timeZone,hour:'2-digit',minute:'2-digit',hour12:false});
  return {date, time:`${t.format(new Date(c.startsAt))}–${t.format(new Date(c.endsAt))}`, timeZone};
}
export function joiningOpens(c:OnlineExperience, zone=c.timeZone) {
  return new Intl.DateTimeFormat('en',{timeZone:zone,month:'short',day:'numeric',hour:'2-digit',minute:'2-digit',hour12:false}).format(new Date(Date.parse(c.startsAt)-c.joinMinutes*60000));
}
export function googleCalendarUrl(name:string,c:OnlineExperience,accessUrl:string) {
  const stamp=(value:string)=>new Date(value).toISOString().replace(/[-:]/g,'').replace(/\.\d{3}/,'');
  const params=new URLSearchParams({action:'TEMPLATE',text:name,dates:`${stamp(c.startsAt)}/${stamp(c.endsAt)}`,ctz:c.timeZone,details:`Join the online session: ${accessUrl}\nJoining opens ${joiningOpens(c)} (${c.timeZone}).`,location:accessUrl});
  return `https://calendar.google.com/calendar/render?${params}`;
}
export function calendarFile(name:string, id:string, c:OnlineExperience, accessUrl:string) {
  const esc = (s:string) => s.replace(/\\/g,'\\\\').replace(/\r?\n/g,'\\n').replace(/[,;]/g, x=>'\\'+x);
  const stamp = (s:string) => new Date(s).toISOString().replace(/[-:]/g,'').replace(/\.\d{3}/,'');
  const lines = ['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Eventra//Online Event//EN','BEGIN:VEVENT',`UID:${esc(id)}@eventra.cloud`,`DTSTAMP:${stamp(new Date().toISOString())}`,`DTSTART:${stamp(c.startsAt)}`,`DTEND:${stamp(c.endsAt)}`,`SUMMARY:${esc(name)}`,`DESCRIPTION:${esc('Join the online session: '+accessUrl+'\nJoining opens '+joiningOpens(c)+' ('+c.timeZone+').')}`,`URL:${esc(accessUrl)}`,`LOCATION:${esc(accessUrl)}`,'END:VEVENT','END:VCALENDAR'];
  // RFC 5545 folding counts UTF-8 bytes, not JavaScript characters.
  return lines.map(line=>{let out='', bytes=0;for(const char of line){const n=new TextEncoder().encode(char).length;if(bytes+n>73){out+='\r\n ';bytes=1}out+=char;bytes+=n}return out}).join('\r\n')+'\r\n';
}
export function renderOnlineEmail(event:any, attendeeName:string, accessUrl:string, networkingUrl?:string|null, qrUrl?:string) {
  const c=onlineConfig(event);
  if (!c || !httpsUrl(accessUrl)) return null;
  const e=escapeOnlineHtml, date=onlineDate(c);
  const button=(url:string,label:string)=>`<p><a href="${e(url)}" style="display:inline-block;padding:15px 22px;background:#0875ec;color:white;text-decoration:none;border-radius:8px;font-weight:bold">${e(label)}</a></p>`;
  return `<!doctype html><html><body style="margin:0;background:#edf3f9;font-family:Arial,sans-serif;color:#18334e"><table role="presentation" style="width:100%;max-width:620px;margin:24px auto;border-collapse:collapse;background:white"><tr><td style="padding:26px 30px;background:#102b46;color:white;font-size:24px;font-weight:bold">Eventra</td></tr><tr><td style="padding:30px"><p style="color:#19795a;font-size:12px;font-weight:bold">REGISTRATION CONFIRMED</p><h1 style="font-size:28px">Your place is saved, ${e(attendeeName)}.</h1><p style="line-height:1.7">You’re registered for <strong>${e(event.name)}</strong>.</p><div style="padding:20px;background:#eef5fc;border-radius:10px;line-height:1.8"><strong>${e(date.date)}</strong><br>${e(date.time)} · ${e(date.timeZone)}</div><h2 style="font-size:20px">Join your online session on ${e(c.provider)}</h2><p style="line-height:1.7">Keep this email and use the button below to return on event day. The event access page is available now; the live-room button opens on <strong>${e(joiningOpens(c))} (${e(c.timeZone)})</strong>, ${c.joinMinutes} minutes before the session.</p>${button(accessUrl,'Join the online session')}<p style="line-height:1.7">${c.meetingUrl ? 'Your meeting link is saved on the event access page. Before joining opens, that page shows the start time and joining status.' : 'The organizer has not added the meeting link yet. Check the event access page for updates or contact the organizer.'}</p><p style="font-size:13px;line-height:1.7">If the button does not work, open: <a href="${e(accessUrl)}">${e(accessUrl)}</a></p><p><a href="${e(googleCalendarUrl(event.name,c,accessUrl))}">Add to Google Calendar</a> · For Apple Calendar or Outlook, download the calendar file from your event access page.</p><p style="line-height:1.7">${e(c.instructions)}</p>${networkingUrl && httpsUrl(networkingUrl) ? `<hr style="border:0;border-top:1px solid #dce5ef"><h2 style="font-size:20px">Prepare for your B2B meetings</h2><p style="line-height:1.7">Complete your profile and arrange conversations before the event. Private calls follow their own appointment times.</p>${button(networkingUrl,'Open my networking space')}<p style="font-size:12px;color:#62768a">This link may sign you in. Keep it private. If it expires, request a fresh sign-in link from the event networking page.</p>`:''}${event.event_format==='hybrid' ? `<h2 style="font-size:20px">Joining in person?</h2><p>${e(event.location_address || 'Contact the organizer for venue details.')}</p>${qrUrl && httpsUrl(qrUrl) ? `<img src="${e(qrUrl)}" width="160" height="160" alt="Physical venue check-in QR code"><p>Show this code at the venue entrance.</p>`:''}`:''}<p style="font-size:12px;color:#62768a">${c.recording ? 'The main session will be recorded. Private B2B calls will not be recorded.' : 'The main session will not be recorded.'}</p><p>Need help? <a href="mailto:${e(c.supportEmail)}">${e(c.supportEmail)}</a></p></td></tr><tr><td style="padding:20px 30px;background:#f5f8fb;font-size:12px;color:#63778b">You received this because you registered for ${e(event.name)}.</td></tr></table></body></html>`;
}
