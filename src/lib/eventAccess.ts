import { supabase } from './supabase';

export type EventRole = 'owner' | 'platform_admin' | 'administrator' | 'coordinator' | 'checkin';
export type StaffRole = 'administrator' | 'coordinator' | 'checkin';
export const staffRoles: StaffRole[] = ['administrator', 'coordinator', 'checkin'];
export const roleTabs: Record<EventRole, string[]> = {
  owner: ['overview', 'agenda', 'speakers', 'attendees', 'forms', 'exhibitors', 'ticketing', 'b2b', 'dayof', 'notifications', 'team'],
  platform_admin: ['overview', 'agenda', 'speakers', 'attendees', 'forms', 'exhibitors', 'ticketing', 'b2b', 'dayof', 'notifications', 'team'],
  administrator: ['overview', 'agenda', 'speakers', 'attendees', 'forms', 'exhibitors', 'ticketing', 'b2b', 'dayof', 'notifications'],
  coordinator: ['attendees', 'b2b', 'dayof'],
  checkin: ['dayof'],
};
export const canManageDetails = (role: EventRole | null) => !!role && ['owner', 'platform_admin', 'administrator'].includes(role);
export const canManageTeam = (role: EventRole | null) => role === 'owner' || role === 'platform_admin';

export async function getEventRole(eventId: string): Promise<EventRole | null> {
  const { data, error } = await supabase.rpc('event_access_role', { p_event_id: eventId });
  if (error?.code === 'PGRST202') {
    // Keep existing owners working during a frontend-first rollout. Never grant
    // staff access without the database role function.
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) return null;
    const [event, profile] = await Promise.all([
      supabase.from('events').select('owner_id,organizer_id').eq('id', eventId).maybeSingle(),
      supabase.from('profiles').select('role').eq('id', auth.user.id).maybeSingle(),
    ]);
    if (event.error || profile.error) throw error;
    if ((event.data?.owner_id || event.data?.organizer_id) === auth.user.id) return 'owner';
    if (event.data && profile.data?.role === 'admin') return 'platform_admin';
    return null;
  }
  if (error) throw error;
  return typeof data === 'string' && Object.hasOwn(roleTabs, data) ? data as EventRole : null;
}

export async function getManagedEvents(userId: string, platformAdmin: boolean) {
  const columns = 'id,name,event_type,event_format,status,start_date,end_date,location_address,cover_image_url,owner_id,organizer_id,created_at,branding_settings';
  let query = supabase.from('events').select(columns).order('created_at', { ascending: false }).limit(100);
  if (!platformAdmin) query = query.or(`owner_id.eq.${userId},organizer_id.eq.${userId}`);
  const { data: owned, error } = await query;
  if (error) throw error;
  const result = new Map((owned || []).map(event => [event.id, { ...event, access_role: platformAdmin ? 'platform_admin' : 'owner' }]));
  if (!platformAdmin) {
    const { data: memberships, error: teamError } = await supabase.from('event_team_members')
      .select('event_id,role').eq('user_id', userId).eq('status', 'active');
    // During rollout, existing owners can still see their events before the migration.
    if (teamError && !['42P01', 'PGRST205'].includes(teamError.code)) throw teamError;
    const shared = (memberships || []).filter(member => !result.has(member.event_id));
    if (shared.length) {
      const { data, error: sharedError } = await supabase.from('events').select(columns).in('id', shared.map(member => member.event_id));
      if (sharedError) throw sharedError;
      for (const event of data || []) result.set(event.id, { ...event, access_role: shared.find(member => member.event_id === event.id)!.role });
    }
  }
  return [...result.values()];
}
