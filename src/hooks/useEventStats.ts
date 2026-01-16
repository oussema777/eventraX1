import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface BaseStats {
  tickets: number;
  sessions: number;
  speakers: number;
  exhibitors: number;
  forms: number;
  marketing: number;
  registrations: number;
  revenue: number;
  ticketsSold: number;
  ticketsTotal: number;
  avgPrice: number;
  currency: string;
}

interface TypeSpecificStats {
  // Summit/Conference
  sponsorsCount?: number;
  abstractsCount?: number;
  
  // Training/Workshop
  certificatesIssued?: number;
  avgQuizScore?: number;
  
  // Networking
  meetingsScheduled?: number;
  connectionsMade?: number;
}

interface AudienceInsight {
  label: string;
  value: string;
  count: number;
  percentage: number;
}

export function useEventStats(eventId?: string) {
  const [baseStats, setBaseStats] = useState<BaseStats>({
    tickets: 0,
    sessions: 0,
    speakers: 0,
    exhibitors: 0,
    forms: 0,
    marketing: 0,
    registrations: 0,
    revenue: 0,
    ticketsSold: 0,
    ticketsTotal: 0,
    avgPrice: 0,
    currency: 'TND'
  });
  
  const [typeStats, setTypeStats] = useState<TypeSpecificStats>({});
  const [audienceInsights, setAudienceInsights] = useState<AudienceInsight[]>([]);
  const [eventType, setEventType] = useState<string>('generic');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!eventId) return;

    let mounted = true;
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        
        // 1. Fetch Event Details (Type & Base Settings)
        const { data: eventData } = await supabase
          .from('events')
          .select('event_format, event_type, status, registration_form_schema')
          .eq('id', eventId)
          .single();
          
        const type = eventData?.event_format || 'generic';
        if (mounted) setEventType(type);

        // 2. Base Queries (Shared across all events)
        const [
          ticketsCount,
          sessionsCount,
          speakersCount,
          exhibitorsCount,
          formsCount,
          marketingTemplates,
          marketingLinks,
          ticketSummary,
          attendeesRes
        ] = await Promise.all([
          supabase.from('event_tickets').select('id', { count: 'exact', head: true }).eq('event_id', eventId),
          supabase.from('event_sessions').select('id', { count: 'exact', head: true }).eq('event_id', eventId),
          supabase.from('event_speakers').select('id', { count: 'exact', head: true }).eq('event_id', eventId),
          supabase.from('event_exhibitors').select('id', { count: 'exact', head: true }).eq('event_id', eventId),
          supabase.from('event_forms').select('id', { count: 'exact', head: true }).eq('event_id', eventId),
          supabase.from('event_email_templates').select('id', { count: 'exact', head: true }).eq('event_id', eventId),
          supabase.from('event_marketing_links').select('id', { count: 'exact', head: true }).eq('event_id', eventId),
          supabase.from('event_tickets').select('price, currency, quantity_sold, quantity_total').eq('event_id', eventId),
          supabase.from('event_attendees').select('custom_form_data').eq('event_id', eventId)
        ]);

        // Calculate Revenue & Ticket Stats
        let sold = 0;
        let total = 0;
        let revenue = 0;
        let currency = 'TND';
        let avgPrice = 0;

        if (ticketSummary.data) {
          sold = ticketSummary.data.reduce((s, r: any) => s + (Number(r.quantity_sold) || 0), 0);
          total = ticketSummary.data.reduce((s, r: any) => s + (Number(r.quantity_total) || 0), 0);
          revenue = ticketSummary.data.reduce((s, r: any) => s + (Number(r.price) || 0) * (Number(r.quantity_sold) || 0), 0);
          currency = ticketSummary.data.find((r: any) => r.currency)?.currency || 'TND';
          avgPrice = sold > 0 ? revenue / sold : 0;
        }

        if (mounted) {
          setBaseStats({
            tickets: ticketsCount.count || 0,
            sessions: sessionsCount.count || 0,
            speakers: speakersCount.count || 0,
            exhibitors: exhibitorsCount.count || 0,
            forms: formsCount.count || 0,
            marketing: (marketingTemplates.count || 0) + (marketingLinks.count || 0),
            registrations: attendeesRes.data?.length || sold, // Use actual attendee row count
            revenue,
            ticketsSold: sold,
            ticketsTotal: total,
            avgPrice,
            currency
          });
        }

        // ... existing type stats logic ...

        // 4. Smart Audience Insights
        const insights: AudienceInsight[] = [];
        const attendees = attendeesRes.data || [];
        const totalAttendees = attendees.length;
        
        if (totalAttendees > 0) {
           const schema = eventData?.registration_form_schema || { fields: [] };
           
           // A. Find "Smart" fields (Categorical OR common text fields)
           const smartFields = (schema.fields || []).filter((f: any) => 
             (f.type === 'select' || f.type === 'radio' || f.type === 'text') && 
             f.label && (
               f.label.toLowerCase().includes('industry') || 
               f.label.toLowerCase().includes('sector') ||
               f.label.toLowerCase().includes('job') ||
               f.label.toLowerCase().includes('role') ||
               f.label.toLowerCase().includes('company') ||
               f.label.toLowerCase().includes('country') ||
               f.label.toLowerCase().includes('city') ||
               f.label.toLowerCase().includes('organization')
             )
           );

           // B. Pick the most "Interesting" field found
           const priorityField = smartFields[0] || (schema.fields || []).find((f: any) => f.type === 'select');

           if (priorityField) {
             const counts: Record<string, number> = {};
             attendees.forEach((att: any) => {
                // Try to find the value by ID first, then Label
                const val = att.custom_form_data?.[priorityField.id] || att.custom_form_data?.[priorityField.label];
                if (val && typeof val === 'string' && val.trim() !== '') {
                  const normalizedVal = val.trim();
                  counts[normalizedVal] = (counts[normalizedVal] || 0) + 1;
                }
             });
             
             Object.entries(counts)
               .sort(([,a], [,b]) => b - a)
               .slice(0, 3) 
               .forEach(([val, count]) => {
                  insights.push({
                    label: priorityField.label,
                    value: val,
                    count,
                    percentage: Math.round((count / totalAttendees) * 100)
                  });
               });
           }
        }
        
        if (mounted) setAudienceInsights(insights);

      } catch (err) {
        console.error('Error fetching event stats:', err);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    fetchStats();
    return () => { mounted = false; };
  }, [eventId]);

  return { baseStats, typeStats, audienceInsights, eventType, isLoading };
}
