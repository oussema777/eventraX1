import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

export type ParticipantBusiness = {id:string;company_name:string;logo_url:string|null};

export function useParticipantBusinesses(profileIds: Array<string|null|undefined>) {
  const {user}=useAuth();
  const ids=[...new Set(profileIds.filter((id):id is string=>!!id))].sort();
  return useQuery({queryKey:['participant-business-identities',user?.id||'public',ids],enabled:ids.length>0,staleTime:60000,retry:false,queryFn:async()=>{
    const result=new Map<string,ParticipantBusiness[]>();
    const add=(profile:string,business:ParticipantBusiness)=>{
      if(!business.company_name?.trim())return;
      const current=result.get(profile)||[];
      if(!current.some(item=>item.id===business.id))result.set(profile,[...current,business]);
    };
    // Batch only the people on this surface. Read public identity fields, never business contacts.
    for(let offset=0;offset<ids.length;offset+=100){
      const batch=ids.slice(offset,offset+100);
      const memberships:Array<{profile_id:string;business_id:string}>=[];
      for(let start=0;;start+=500){
        const [owned,members]=await Promise.all([
          supabase.from('business_profiles').select('id,company_name,logo_url,owner_profile_id').in('owner_profile_id',batch).order('id').range(start,start+499),
          supabase.from('business_members').select('profile_id,business_id').in('profile_id',batch).order('profile_id').order('business_id').range(start,start+499),
        ]);
        if(owned.error||members.error)throw owned.error||members.error;
        for(const business of owned.data||[])add(business.owner_profile_id,business);
        memberships.push(...(members.data||[]));
        if((owned.data?.length||0)<500&&(members.data?.length||0)<500)break;
      }
      const businessIds=[...new Set(memberships.map(m=>m.business_id))];
      for(let start=0;start<businessIds.length;start+=100){
        const {data,error}=await supabase.from('business_profiles').select('id,company_name,logo_url').in('id',businessIds.slice(start,start+100)).order('id');
        if(error)throw error;
        for(const business of data||[])for(const member of memberships.filter(m=>m.business_id===business.id))add(member.profile_id,business);
      }
    }
    return result;
  }});
}
