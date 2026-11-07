import { supabase } from './supabase';

export type InvestorPolicy = { investor: boolean; requires_review: boolean; awaiting_acceptance: boolean; use_workflow: boolean; available: boolean };
export type AssignmentInventory = { active: boolean; scheduled_pending: number; unscheduled_matches: number; confirmed: number; fingerprint: string };
export type ReviewCapabilities = { released: boolean; enabled: boolean; can_configure: boolean; can_designate: boolean; can_review: boolean };
export type BookingReviewRequest = { created_by?: string; id: string; event_id: string; requester_id: string; recipient_id: string; starts_at: string; ends_at: string; format: string; message: string; state: string; revision: number; requester_reason: string | null; meeting_id: string | null };
export type MeetingBatchResult = { index: number; state: string; meeting_id?: string };
const batchKeys = new Map<string,string>();
export async function submitEventMeetingBatch(eventId: string, items: Record<string,unknown>[]): Promise<MeetingBatchResult[]> {
  const {data:{session}}=await supabase.auth.getSession();
  if (!session?.user?.id) throw new Error('Sign in required');
  const signatures=items.map(item=>JSON.stringify([session?.user?.id,eventId,item]));
  const payload=items.map((item,index)=>{
    if(!batchKeys.has(signatures[index]))batchKeys.set(signatures[index],crypto.randomUUID());
    return {...item,submission_key:batchKeys.get(signatures[index])};
  });
  const {data,error}=await supabase.rpc('create_event_meeting_batch',{p_event:eventId,p_items:payload});
  if(error)throw error;
  if(!Array.isArray(data)||data.length!==items.length||data.some((item,index)=>item?.index!==index||!['pending','awaiting_review','needs_schedule','forwarded'].includes(item.state)))throw new Error('Invalid scheduling response');
  signatures.forEach(key=>batchKeys.delete(key));
  return data as MeetingBatchResult[];
}

export async function investorRpc<T>(name: string, args: Record<string, unknown>): Promise<T> {
  const { data, error } = await supabase.rpc(name, args);
  if (error) throw error;
  return data as T;
}

export async function respondToProtectedMeeting(meetingId: string, expected: string, status: 'confirmed' | 'cancelled'): Promise<boolean> {
  const { data, error } = await supabase.rpc('respond_protected_meeting', { p_meeting: meetingId, p_expected: expected, p_status: status });
  if (error?.code === 'PGRST202') return false;
  if (error) throw error;
  if (typeof data !== 'boolean') throw new Error('Invalid meeting response');
  return data;
}

export async function protectedMeetingContext(meetingId: string): Promise<boolean> {
  const {data,error}=await supabase.rpc('protected_meeting_context',{p_meeting:meetingId});
  if(error?.code==='PGRST202')return false;
  if(error)throw error;
  if(typeof data!=='boolean')throw new Error('Invalid meeting context');
  return data;
}

// Only a genuinely absent migration falls back to existing behavior. Network,
// permission and server failures must not silently disable review enforcement.
export async function investorBookingPolicy(eventId: string, recipientId: string): Promise<InvestorPolicy | null> {
  const { data, error } = await supabase.rpc('get_investor_booking_policy', { p_event: eventId, p_recipient: recipientId });
  if (error?.code === 'PGRST202') return null;
  if (error) throw error;
  return data as InvestorPolicy;
}

export async function investorCapabilities(eventId: string): Promise<ReviewCapabilities | null> {
  const { data, error } = await supabase.rpc('get_event_review_capabilities', { p_event: eventId });
  if (error?.code === 'PGRST202') return null;
  if (error) throw error;
  return data as ReviewCapabilities;
}

export function investorFailure(error: unknown): string {
  if (error && typeof error === 'object' && 'code' in error && ['40001','40P01'].includes(String(error.code))) return 'changed';
  const message = error && typeof error === 'object' && 'message' in error ? String(error.message) : '';
  if (message.includes('INVESTOR_PREVIEW_CHANGED') || message.includes('REVIEW_STALE_DECISION')) return 'changed';
  if (message.includes('INVESTOR_REGISTRATION_REQUIRED')) return 'registrationRequired';
  if (message.includes('INVESTOR_ORGANIZER_ACTION_REQUIRED') || message.includes('INVESTOR_LEGACY_REPAIR_REQUIRED')) return 'organizerRequired';
  if (message.includes('INVESTOR_REVIEW_NOT_RELEASED')) return 'paused';
  if (message.includes('INVESTOR_ACCEPTANCE_PENDING')) return 'awaitingAcceptance';
  if (message.includes('REVIEW_SELF_DECISION')) return 'selfReview';
  if (message.includes('INVESTOR_INVITATION_EXISTS')) return 'inviteExists';
  if (message.includes('REVIEW_REQUIRED') || message.includes('REVIEW_IMMUTABLE_MEETING')) return 'newRequestRequired';
  return 'failed';
}
