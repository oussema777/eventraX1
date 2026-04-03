import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useParams } from 'react-router-dom';
import { toast } from 'sonner';

export interface Exhibitor {
  id: string;
  company: string; // db: company_name
  industry: string;
  status: 'confirmed' | 'pending' | 'contract-sent' | 'declined';
  email: string; // db: contact_email
  phone: string; // db: contact_phone
  website: string; // db: website_url
  description: string;
  logo_url?: string; // db: logo_url
  note?: string; // db: notes
  boothLocation?: string; // db: booth_location
}

const EXHIBITORS_COLUMNS = 'id, company_name, industry, status, contact_email, contact_phone, website_url, description, logo_url, notes, booth_location';

function mapExhibitor(item: any): Exhibitor {
  return {
    id: item.id,
    company: item.company_name,
    industry: item.industry || '',
    status: item.status as any,
    email: item.contact_email || '',
    phone: item.contact_phone || '',
    website: item.website_url || '',
    description: item.description || '',
    logo_url: item.logo_url,
    note: item.notes,
    boothLocation: item.booth_location
  };
}

async function fetchExhibitors(eventId: string): Promise<Exhibitor[]> {
  const { data, error } = await supabase
    .from('event_exhibitors')
    .select(EXHIBITORS_COLUMNS)
    .eq('event_id', eventId)
    .order('created_at', { ascending: false });

  if (error) {
    if (error.code === 'PGRST204' || error.code === '42P01') return [];
    throw error;
  }
  return (data || []).map(mapExhibitor);
}

export function useExhibitors(propsEventId?: string) {
  const { eventId: paramEventId } = useParams();
  const eventId = propsEventId || paramEventId;
  const queryClient = useQueryClient();
  const queryKey = ['exhibitors', eventId];

  const { data: exhibitors = [], isLoading } = useQuery({
    queryKey,
    queryFn: () => fetchExhibitors(eventId!),
    enabled: !!eventId && eventId !== 'new',
  });

  const createExhibitor = async (exhibitor: Omit<Exhibitor, 'id'>) => {
    if (!eventId || eventId === 'new') {
      toast.error('Please save event details first');
      return;
    }
    try {
      const payload = {
        event_id: eventId,
        company_name: exhibitor.company,
        industry: exhibitor.industry,
        status: exhibitor.status,
        contact_email: exhibitor.email,
        contact_phone: exhibitor.phone,
        website_url: exhibitor.website,
        description: exhibitor.description,
        logo_url: exhibitor.logo_url,
        notes: exhibitor.note,
        booth_location: exhibitor.boothLocation
      };

      const { data, error } = await supabase
        .from('event_exhibitors')
        .insert([payload])
        .select()
        .single();

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey });
      return data ? mapExhibitor(data) : undefined;
    } catch (err) {
      console.error('Error creating exhibitor:', err);
      throw err;
    }
  };

  const updateExhibitor = async (id: string, updates: Partial<Exhibitor>) => {
    try {
      const payload: any = {};
      if (updates.company !== undefined) payload.company_name = updates.company;
      if (updates.industry !== undefined) payload.industry = updates.industry;
      if (updates.status !== undefined) payload.status = updates.status;
      if (updates.email !== undefined) payload.contact_email = updates.email;
      if (updates.phone !== undefined) payload.contact_phone = updates.phone;
      if (updates.website !== undefined) payload.website_url = updates.website;
      if (updates.description !== undefined) payload.description = updates.description;
      if (updates.logo_url !== undefined) payload.logo_url = updates.logo_url;
      if (updates.note !== undefined) payload.notes = updates.note;
      if (updates.boothLocation !== undefined) payload.booth_location = updates.boothLocation;

      const { error } = await supabase
        .from('event_exhibitors')
        .update(payload)
        .eq('id', id);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey });
    } catch (err) {
      console.error('Error updating exhibitor:', err);
      throw err;
    }
  };

  const deleteExhibitor = async (id: string) => {
    try {
      const { error } = await supabase
        .from('event_exhibitors')
        .delete()
        .eq('id', id);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey });
    } catch (err) {
      console.error('Error deleting exhibitor:', err);
      throw err;
    }
  };

  return {
    exhibitors,
    isLoading,
    createExhibitor,
    updateExhibitor,
    deleteExhibitor
  };
}
