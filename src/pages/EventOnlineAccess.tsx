import {useQuery} from '@tanstack/react-query';
import {useEventRouteParams} from '../components/navigation/EventPublicRoute';
import {supabase} from '../lib/supabase';
import {onlineConfig} from '../../supabase/functions/_shared/onlineExperience';
import OnlineEventExperience from '../components/events/OnlineEventExperience';
export default function EventOnlineAccess(){
  const {eventId}=useEventRouteParams();
  const {data,isPending,isError,refetch}=useQuery({queryKey:['event-online-access',eventId],enabled:!!eventId,refetchOnWindowFocus:true,refetchInterval:60000,queryFn:async()=>{const {data,error}=await supabase.from('events').select('*').eq('id',eventId).eq('status','published').maybeSingle();if(error)throw error;return data}});
  return <main style={{minHeight:'100vh',background:'#091b30',padding:'24px 16px'}}>{isPending?<p role="status" style={{color:'white'}}>Loading event access…</p>:isError?<div style={{color:'white'}} role="alert">We couldn’t load the event. <button onClick={()=>refetch()}>Try again</button></div>:data&&onlineConfig(data)?<OnlineEventExperience event={data}/>:<p style={{color:'white'}}>Online access is not available for this event.</p>}</main>;
}
