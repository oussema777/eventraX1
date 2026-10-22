import {useEffect,useState} from 'react';
import {Clock,Video,AlertCircle} from 'lucide-react';
import {onlineMeetingPhase,type OnlineMeetingDetails} from '../../utils/onlineMeeting';
import './OnlineMeetingJoin.css';
export default function OnlineMeetingJoin({meeting,onJoin}:{meeting:OnlineMeetingDetails;onJoin:()=>Promise<void>|void}) {
  const [now,setNow]=useState(Date.now());
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState('');
  useEffect(()=>{const update=()=>setNow(Date.now());const timer=setInterval(update,1000);window.addEventListener('focus',update);return()=>{clearInterval(timer);window.removeEventListener('focus',update)}},[]);
  const phase=onlineMeetingPhase(meeting,now);
  const label={pending:'Waiting for confirmation. The room opens after acceptance, at the scheduled time.',cancelled:'This meeting was cancelled. No need to join.',upcoming:'Your room opens at the scheduled appointment time shown above.',ended:'This meeting has ended.',unavailable:'Joining details are not available. Contact the organizer for help.',open:''}[phase];
  async function join(){setBusy(true);setError('');try{await onJoin()}catch{setError('We couldn’t check this meeting. Please try again.')}finally{setBusy(false)}}
  return <div className="online-meeting-join">{phase==='open'?<button disabled={busy} onClick={join}><Video size={17}/>{busy?'Checking meeting…':'Join private meeting'}</button>:<p><Clock size={16}/><span>{label}</span></p>}{error&&<p role="alert"><AlertCircle size={17}/>{error}</p>}{phase==='open'&&<small>Close or mute the main session before joining. This call is not recorded by Eventra.</small>}</div>;
}
