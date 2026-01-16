import { useState, useEffect, useCallback } from 'react';
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
}

export interface SponsorPackage {
  id: string;
  name: string;
  value: number;
  benefits: string[];
  color: string;
}

export function useSponsors() {
  const { eventId } = useParams<{ eventId: string }>();
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [packages, setPackages] = useState<SponsorPackage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadSponsors = useCallback(async () => {
    if (!eventId) return;
    
    setIsLoading(true);
    try {
      // Load Sponsors
      const { data: sponsorsData, error: sponsorsError } = await supabase
        .from('event_sponsors')
        .select('*')
        .eq('event_id', eventId);

      if (sponsorsError) throw sponsorsError;

      const mappedSponsors: Sponsor[] = (sponsorsData || []).map(s => ({
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
        notes: s.notes
      }));

      setSponsors(mappedSponsors);

      // Load Packages (from events table)
      const { data: eventData, error: eventError } = await supabase
        .from('events')
        .select('sponsorship_settings')
        .eq('id', eventId)
        .single();

      if (eventError) throw eventError;

      if (eventData?.sponsorship_settings && Array.isArray(eventData.sponsorship_settings) && eventData.sponsorship_settings.length > 0) {
        setPackages(eventData.sponsorship_settings);
      } else {
        // Default packages if none exist
        setPackages([
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
        ]);
      }

    } catch (error) {
      console.error('Error loading sponsors data:', error);
      toast.error('Failed to load sponsors');
    } finally {
      setIsLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    loadSponsors();
  }, [loadSponsors]);

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
          notes: sponsor.notes
        })
        .select()
        .single();

      if (error) throw error;
      
      await loadSponsors();
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
      
      await loadSponsors();
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
      
      await loadSponsors();
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
      
      setPackages(newPackages);
      toast.success('Packages updated');
    } catch (error) {
      console.error('Error updating packages:', error);
      toast.error('Failed to update packages');
    }
  };

  return {
    sponsors,
    packages,
    isLoading,
    createSponsor,
    updateSponsor,
    deleteSponsor,
    updatePackages,
    refreshSponsors: loadSponsors
  };
}