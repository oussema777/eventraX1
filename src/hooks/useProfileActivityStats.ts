import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export interface ProfileActivityStats {
  eventsAttended: number;
  b2bMeetings: number;
  connections: number;
}

export function useProfileActivityStats(profileId?: string | null) {
  const [result, setResult] = useState<{ profileId: string; stats: ProfileActivityStats } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!profileId) return;
    let cancelled = false;
    const load = async () => {
      try {
        const { data, error: statsError } = await supabase.rpc('get_profile_activity_stats', { p_profile_id: profileId });
        if (statsError) throw statsError;
        if (!cancelled) { setResult({ profileId, stats: data as ProfileActivityStats }); setError(null); }
      } catch (loadError) {
        if (!cancelled) { setResult(null); setError(loadError instanceof Error ? loadError.message : 'Activity unavailable'); }
      }
    };
    void load();
    return () => { cancelled = true; };
  }, [profileId]);

  return { stats: result && result.profileId === profileId ? result.stats : null, error };
}
