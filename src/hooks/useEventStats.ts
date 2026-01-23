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
          .select('event_format, event_type, status')
          .eq('id', eventId)
          .single();
          
        const type = eventData?.event_type || eventData?.event_format || 'generic';
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
          registrationsRes,
          attendeesRes
        ] = await Promise.all([
          supabase.from('event_tickets').select('id', { count: 'exact', head: true }).eq('event_id', eventId),
          supabase.from('event_sessions').select('id', { count: 'exact', head: true }).eq('event_id', eventId),
          supabase.from('event_speakers').select('id', { count: 'exact', head: true }).eq('event_id', eventId),
          supabase.from('event_exhibitors').select('id', { count: 'exact', head: true }).eq('event_id', eventId),
          supabase
            .from('event_forms')
            .select('id, schema, form_type, is_default, created_at', { count: 'exact' })
            .eq('event_id', eventId),
          supabase.from('event_email_templates').select('id', { count: 'exact', head: true }).eq('event_id', eventId),
          supabase.from('event_tracking_links').select('id', { count: 'exact', head: true }).eq('event_id', eventId),
          supabase.from('event_tickets').select('price, currency, quantity_sold, quantity_total').eq('event_id', eventId),
          supabase.from('event_registrations').select('id, form_data, created_at').eq('event_id', eventId),
          supabase.from('event_attendees').select('id, meta').eq('event_id', eventId)
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

        const registrationRows = (registrationsRes.data && Array.isArray(registrationsRes.data) && registrationsRes.data.length)
          ? registrationsRes.data
          : (attendeesRes.data || []);
        const registrationsCount = registrationRows.length || sold;

        if (mounted) {
          setBaseStats({
            tickets: ticketsCount.count || 0,
            sessions: sessionsCount.count || 0,
            speakers: speakersCount.count || 0,
            exhibitors: exhibitorsCount.count || 0,
            forms: formsCount.count || 0,
            marketing: (marketingTemplates.count || 0) + (marketingLinks.count || 0),
            registrations: registrationsCount,
            revenue,
            ticketsSold: sold,
            ticketsTotal: total,
            avgPrice,
            currency
          });
        }

        // 3. Type-Specific Stats Calculation
        const newTypeStats: TypeSpecificStats = {};
        
        if (['summit', 'conference'].includes(type.toLowerCase())) {
          const { count: sponsorsCount } = await supabase.from('event_sponsors').select('id', { count: 'exact', head: true }).eq('event_id', eventId);
          newTypeStats.sponsorsCount = sponsorsCount || 0;
          // Abstracts count requires querying sessions or a separate abstracts table if it exists
          // Assuming sessions with 'abstract' type or similar for now, or just placeholder
          newTypeStats.abstractsCount = 0; 
        } else if (['training', 'workshop', 'masterclass', 'bootcamp'].includes(type.toLowerCase())) {
          // For training, we might check checked-in attendees as "certificates issued" proxy or real certificates table
          const { count: certificatesCount } = await supabase.from('event_certificates').select('id', { count: 'exact', head: true }).eq('event_id', eventId).maybeSingle();
          newTypeStats.certificatesIssued = (certificatesCount as any)?.count || 0; // fallback if table doesn't exist
          
          // Quiz scores would be in a separate table
          newTypeStats.avgQuizScore = 0; 
        } else if (type.toLowerCase() === 'networking') {
           const { count: meetingsCount } = await supabase.from('b2b_meetings').select('id', { count: 'exact', head: true }).eq('event_id', eventId);
           newTypeStats.meetingsScheduled = meetingsCount || 0;
           // Connections might be same as meetings or different
           newTypeStats.connectionsMade = meetingsCount || 0;
        }
        
        if (mounted) setTypeStats(newTypeStats);

        // 4. Smart Audience Insights
        const insights: AudienceInsight[] = [];
        const attendees = registrationRows.map((row: any) => ({
          ...row,
          __formData: row.form_data ?? row.meta
        }));
        const totalAttendees = attendees.length;
        
        if (totalAttendees > 0) {
           const formRows = formsCount.data || [];
           const registrationForm = formRows.find((f: any) => f.form_type === 'registration')
             || formRows.find((f: any) => f.is_default)
             || formRows[0];
           const schema = registrationForm?.schema || { fields: [] };
           
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
                const val = att.__formData?.[priorityField.id] || att.__formData?.[priorityField.label];
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
