import {useEffect,useState} from 'react';
import {CalendarDays, Clock3, Video, Handshake, ShieldCheck, Mail, ArrowUpRight} from 'lucide-react';
import {calendarFile, httpsUrl, onlineConfig, onlineDate, sessionPhase, type OnlineExperience} from '../../../supabase/functions/_shared/onlineExperience';
import {eventAuthReturnUrl} from '../../utils/authRedirect';
import './onlineEventExperience.css';

export default function OnlineEventExperience({event,registered=false,name,emailFailed=false,accessEmailFailed=false,b2b=false}:{event:any;registered?:boolean;name?:string;emailFailed?:boolean;accessEmailFailed?:boolean;b2b?:boolean}) {
  const [now,setNow]=useState(Date.now());
  const [local,setLocal]=useState(false);
  const [calendarError,setCalendarError]=useState('');
  useEffect(()=>{const update=()=>setNow(Date.now());const interval=setInterval(update,1000);window.addEventListener('focus',update);return()=>{clearInterval(interval);window.removeEventListener('focus',update)}},[]);
  const c=onlineConfig(event);
  if(!c) return null;
  const phase=sessionPhase(c,now);
  const zone=local ? Intl.DateTimeFormat().resolvedOptions().timeZone : c.timeZone;
  const date=onlineDate(c,zone);
  const opens=new Intl.DateTimeFormat('en',{timeZone:zone,month:'short',day:'numeric',hour:'2-digit',minute:'2-digit',hour12:false}).format(new Date(Date.parse(c.startsAt)-c.joinMinutes*60000));
  const url=httpsUrl(c.meetingUrl);
  const accessUrl=new URL(`/event/${event.id}/access`,window.location.origin).href;
  const hero=event.branding_settings?.design_studio?.activeBlocks?.find((block:any)=>block.type==='hero')?.settings?.backgroundImage;
  const heroUrl=httpsUrl(hero) || (typeof hero==='string' && hero.startsWith('/') && !hero.startsWith('//') ? hero : null);
  function download(){try{const blob=new Blob([calendarFile(event.name,event.id,c as OnlineExperience,accessUrl)],{type:'text/calendar;charset=utf-8'});const object=URL.createObjectURL(blob);const a=document.createElement('a');a.href=object;a.download='eventra-event.ics';a.click();setTimeout(()=>URL.revokeObjectURL(object),1000);setCalendarError('')}catch{setCalendarError('Calendar download failed. Please try again.')}}
  return <section className="online-experience">
    <header className="oe-hero" style={heroUrl?{backgroundImage:`linear-gradient(90deg,rgba(7,24,44,.94),rgba(7,24,44,.72)),url(${JSON.stringify(heroUrl)})`}:undefined}>
      <span className="oe-eyebrow">{phase==='ended'?'EVENT ENDED':registered?'REGISTRATION CONFIRMED':'EVENT ACCESS'}</span>
      <h1>{registered ? `Your place is saved${name ? ', '+name.split(' ')[0] : ''}.` : event.name}</h1>
      {registered && <p>{event.name}</p>}
    </header>
    {(emailFailed || accessEmailFailed) && <div role="alert" className="oe-notice"><strong>Your registration is saved.</strong>{' '}{accessEmailFailed ? 'We could not email your secure sign-in link. Open your networking space below and request a fresh link using your registration email.' : 'We could not send your confirmation email. Save this page and add the event to your calendar.'}{' '}<a href={`mailto:${c.supportEmail}`}>Contact the organizer</a> if you need help.</div>}
    <div className="oe-card oe-date"><span className="oe-eyebrow">{phase==='ended'?'SESSION FINISHED':'SAVE THE DATE'}</span><h2><CalendarDays size={23}/>{date.date}</h2><p className="oe-time">{date.time} · {date.timeZone}</p><label className="oe-local"><input type="checkbox" checked={local} onChange={e=>setLocal(e.target.checked)}/> Show in my local time zone</label>{phase!=='ended' && <button type="button" className={phase==='upcoming'?'oe-primary':'oe-secondary'} onClick={download}><CalendarDays size={18}/>Add to calendar</button>}{calendarError&&<p role="alert">{calendarError}</p>}</div>
    <div className="oe-card"><span className="oe-eyebrow"><Video size={16}/> MAIN SESSION · {c.provider}</span><h2>{phase==='ended'?'Thank you for joining us.':phase==='upcoming'?'See you at the session.':url?'The room is ready for you.':'The room link is not available yet.'}</h2><p>{phase==='ended'?'This session has ended. No replay has been published.':phase==='upcoming'?`Joining opens on ${opens} (${zone}), ${c.joinMinutes} minutes before the session. Come back to this page when it’s time.`:c.instructions || 'Join the room and follow your host’s instructions.'}</p>{phase==='open' && (url?<a className="oe-primary" href={url} target="_blank" rel="noopener noreferrer">Join live session<ArrowUpRight size={18}/></a>:<div className="oe-notice"><Clock3 size={17}/><span>Please <a href={`mailto:${c.supportEmail}`}>contact the organizer</a> for joining details.</span></div>)}<p className="oe-fine"><ShieldCheck size={16}/>{c.recording?'The main session will be recorded. Private B2B calls will not.':'The main session will not be recorded.'}</p></div>
    {b2b && phase!=='ended' && <div className="oe-card"><span className="oe-eyebrow"><Handshake size={17}/> B2B NETWORKING</span><h2>Make your next introduction.</h2><p>Prepare your profile and request meetings before the event. Private calls follow each appointment’s scheduled time.</p><a className="oe-secondary" href={eventAuthReturnUrl(`/event/${event.id}/networking`,window.location.origin)}>Open my networking space<ArrowUpRight size={18}/></a></div>}
    {event.event_format==='hybrid'&&<div className="oe-card"><h2>Joining in person?</h2><p>{event.location_address || 'Contact the organizer for venue details.'}</p><p>Your physical entrance pass is in your registration confirmation.</p></div>}
    <footer className="oe-help"><Mail size={18}/><span>Need a hand? <a href={`mailto:${c.supportEmail}`}>{c.supportEmail}</a></span></footer>
  </section>;
}
