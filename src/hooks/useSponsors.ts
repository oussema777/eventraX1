import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import { useParams } from 'react-router-dom';

export interface Sponsor {
  id: string;
  name: string;
  tier: string;
  websiteUrl?: string;
  logoUrl?: string;
  description?: string;
  event_id?: string;
  // Enhanced fields
  status: 'confirmed' | 'pending' | 'contract-sent';
  contributionAmount: number;
  benefits: string[];
  notes?: string;
  sortOrder: number;
}

export interface SponsorPackage {
  id: string;
  name: string;
  value: number;
  benefits: string[];
  color: string;
}

const SPONSORS_COLUMNS = 'id, name, tier, website_url, logo_url, description, event_id, status, contribution_amount, benefits, notes, sort_order, updated_at';

const DEFAULT_PACKAGES: SponsorPackage[] = [
  {
    id: 'platinum',
    name: 'Platinum',
    value: 25000,
    color: '#C0C0C0',
    benefits: ['Logo on Website', '3 Speaking Slots', 'VIP Dinner Access', 'Social Media Mentions', 'Premium Placement']
  },
  {
    id: 'gold',
    name: 'Gold',
    value: 15000,
    color: '#FFD700',
    benefits: ['Logo Placement', '2 Speaking Slots', 'Attendee List Access', 'Marketing Materials']
  },
  {
    id: 'silver',
    name: 'Silver',
    value: 10000,
    color: '#A8A8A8',
    benefits: ['Logo Placement', 'Marketing Materials', 'Social Media Mention']
  },
  {
    id: 'bronze',
    name: 'Bronze',
    value: 5000,
    color: '#CD7F32',
    benefits: ['Logo on Website', '1 Speaking Slot']
  }
];

function mapSponsor(s: any): Sponsor {
  return {
    id: s.id,
    name: s.name,
    tier: s.tier || 'gold',
    websiteUrl: s.website_url,
    logoUrl: s.logo_url,
    description: s.description,
    event_id: s.event_id,
    status: s.status || 'confirmed',
    contributionAmount: s.contribution_amount || 0,
    benefits: s.benefits || [],
    notes: s.notes,
    sortOrder: s.sort_order ?? 0
  };
}

async function fetchSponsors(eventId: string): Promise<Sponsor[]> {
  const { data, error } = await supabase
    .from('event_sponsors')
    .select(SPONSORS_COLUMNS)
    .eq('event_id', eventId)
    .order('sort_order', { ascending: true });

  if (error) {
    if (error.code === 'PGRST204' || error.code === '42P01') return [];
    throw error;
  }
  return (data || []).map(mapSponsor);
}

async function fetchPackages(eventId: string): Promise<SponsorPackage[]> {
  const { data, error } = await supabase
    .from('events')
    .select('sponsorship_settings')
    .eq('id', eventId)
    .single();

  if (error) return DEFAULT_PACKAGES;

  if (data?.sponsorship_settings && Array.isArray(data.sponsorship_settings) && data.sponsorship_settings.length > 0) {
    return data.sponsorship_settings;
  }
  return DEFAULT_PACKAGES;
}

export function useSponsors() {
  const { eventId } = useParams<{ eventId: string }>();
  const queryClient = useQueryClient();
  const sponsorsKey = ['sponsors', eventId];
  const packagesKey = ['sponsor-packages', eventId];

  const { data: sponsors = [], isLoading: sponsorsLoading } = useQuery({
    queryKey: sponsorsKey,
    queryFn: () => fetchSponsors(eventId!),
    enabled: !!eventId,
  });

  const { data: packages = DEFAULT_PACKAGES, isLoading: packagesLoading } = useQuery({
    queryKey: packagesKey,
    queryFn: () => fetchPackages(eventId!),
    enabled: !!eventId,
  });

  const isLoading = sponsorsLoading || packagesLoading;

  const createSponsor = async (sponsor: Partial<Sponsor>) => {
    if (!eventId) return;
    try {
      const { data, error } = await supabase
        .from('event_sponsors')
        .insert({
          event_id: eventId,
          name: sponsor.name,
          tier: sponsor.tier,
          website_url: sponsor.websiteUrl,
          logo_url: sponsor.logoUrl,
          description: sponsor.description,
          status: sponsor.status,
          contribution_amount: sponsor.contributionAmount,
          benefits: sponsor.benefits,
          notes: sponsor.notes,
          sort_order: sponsors.length
        })
        .select()
        .single();

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: sponsorsKey });
      queryClient.invalidateQueries({ queryKey: ['event-stats', eventId] });
      toast.success('Sponsor created');
      return data;
    } catch (error) {
      console.error('Error creating sponsor:', error);
      toast.error('Failed to create sponsor');
    }
  };

  const updateSponsor = async (id: string, sponsor: Partial<Sponsor>) => {
    try {
      const { data, error } = await supabase
        .from('event_sponsors')
        .update({
          name: sponsor.name,
          tier: sponsor.tier,
          website_url: sponsor.websiteUrl,
          logo_url: sponsor.logoUrl,
          description: sponsor.description,
          status: sponsor.status,
          contribution_amount: sponsor.contributionAmount,
          benefits: sponsor.benefits,
          notes: sponsor.notes
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: sponsorsKey });
      queryClient.invalidateQueries({ queryKey: ['event-stats', eventId] });
      toast.success('Sponsor updated');
      return data;
    } catch (error) {
      console.error('Error updating sponsor:', error);
      toast.error('Failed to update sponsor');
    }
  };

  const deleteSponsor = async (id: string) => {
    try {
      const { error } = await supabase
        .from('event_sponsors')
        .delete()
        .eq('id', id);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: sponsorsKey });
      queryClient.invalidateQueries({ queryKey: ['event-stats', eventId] });
      toast.success('Sponsor deleted');
    } catch (error) {
      console.error('Error deleting sponsor:', error);
      toast.error('Failed to delete sponsor');
    }
  };

  const updatePackages = async (newPackages: SponsorPackage[]) => {
    if (!eventId) return;
    try {
      const { error } = await supabase
        .from('events')
        .update({ sponsorship_settings: newPackages })
        .eq('id', eventId);

      if (error) throw error;

      queryClient.setQueryData(packagesKey, newPackages);
      toast.success('Packages updated');
    } catch (error) {
      console.error('Error updating packages:', error);
      toast.error('Failed to update packages');
    }
  };

  const reorderSponsors = async (orderedIds: string[]) => {
    // Optimistic update: reorder locally first for instant UI feedback
    const previousSponsors = sponsors;
    const reordered = orderedIds
      .map((id, index) => {
        const sponsor = sponsors.find(s => s.id === id);
        return sponsor ? { ...sponsor, sortOrder: index } : null;
      })
      .filter(Boolean) as Sponsor[];
    queryClient.setQueryData(sponsorsKey, reordered);

    try {
      // Fetch current updated_at timestamps for optimistic locking
      const { data: currentRows, error: fetchError } = await supabase
        .from('event_sponsors')
        .select('id, updated_at')
        .in('id', orderedIds);

      if (fetchError) throw fetchError;

      const timestampMap = new Map(
        (currentRows || []).map((r: any) => [r.id, r.updated_at])
      );

      // Update each sponsor with optimistic lock check on updated_at
      const results = await Promise.all(
        orderedIds.map((id, index) => {
          const expectedUpdatedAt = timestampMap.get(id);
          let query = supabase
            .from('event_sponsors')
            .update({ sort_order: index })
            .eq('id', id);

          // If we have a timestamp, use it as an optimistic lock
          if (expectedUpdatedAt) {
            query = query.eq('updated_at', expectedUpdatedAt);
          }

          return query.select('id');
        })
      );

      // Check if any update returned 0 rows (conflict detected)
      const hasConflict = results.some(
        (r) => !r.error && (!r.data || r.data.length === 0)
      );

      if (hasConflict) {
        // Another user modified sponsors — refetch and notify
        queryClient.invalidateQueries({ queryKey: sponsorsKey });
        toast.error('Sponsor order was modified by another user. Refreshing...');
        return;
      }

      // Check for actual errors
      const firstError = results.find((r) => r.error);
      if (firstError?.error) throw firstError.error;
    } catch (error) {
      // Rollback on failure
      queryClient.setQueryData(sponsorsKey, previousSponsors);
      console.error('Error reordering sponsors:', error);
      toast.error('Failed to reorder sponsors');
    }
  };

  const setSponsors = (updater: Sponsor[] | ((prev: Sponsor[]) => Sponsor[])) => {
    queryClient.setQueryData(sponsorsKey, (old: Sponsor[] | undefined) => {
      if (typeof updater === 'function') return updater(old || []);
      return updater;
    });
  };

  return {
    sponsors,
    setSponsors,
    packages,
    isLoading,
    createSponsor,
    updateSponsor,
    deleteSponsor,
    updatePackages,
    reorderSponsors,
    refreshSponsors: () => queryClient.invalidateQueries({ queryKey: sponsorsKey })
  };
}
