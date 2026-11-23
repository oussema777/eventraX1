import { supabase } from './supabase';

export interface PublicExhibitor {
  id: string;
  company_name: string;
  logo_url: string | null;
  sector: string | null;
  description: string | null;
  website_url: string | null;
  booth_number: string | null;
  booth_location: string | null;
  contact_email: string | null;
  contact_phone: string | null;
}

export async function loadPublicExhibitors(eventId: string): Promise<PublicExhibitor[]> {
  const rows: PublicExhibitor[] = [];
  const size = 200;
  for (let offset = 0; ; offset += size) {
    const { data, error } = await supabase.rpc('list_public_event_exhibitors', { p_event_id: eventId })
      .order('company_name').order('id').range(offset, offset + size - 1);
    if (error) throw error;
    rows.push(...data);
    if (data.length < size) return rows;
  }
}
