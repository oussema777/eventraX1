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

interface KpiChartData {
  fieldLabel: string;
  data: { name: string; value: number }[];
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
  const [kpiCharts, setKpiCharts] = useState<KpiChartData[]>([]);
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

        const registrationRows = (attendeesRes.data && Array.isArray(attendeesRes.data) && attendeesRes.data.length)
          ? attendeesRes.data
          : (registrationsRes.data || []);
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

        // 4. Smart Audience Insights & KPI Charts
        const insights: AudienceInsight[] = [];
        const charts: KpiChartData[] = [];
        const attendees = registrationRows.map((row: any) => ({
          ...row,
          __formData: row.form_data ?? row.meta
        }));
        const totalAttendees = attendees.length;
        
        // Always fetch form schema to find KPIs
        const formRows = formsCount.data || [];
        const registrationForm = formRows.find((f: any) => f.form_type === 'registration')
             || formRows.find((f: any) => f.is_default)
             || formRows[0];
        const schema = registrationForm?.schema || { fields: [] };
        
        console.log('[useEventStats] Schema Fields:', schema.fields);
        console.log('[useEventStats] Total Registrations:', totalAttendees);
        console.log('[useEventStats] Registration Data Sample:', attendees[0]?.__formData);
           
        // A. Find "Smart" fields (KPIs first, then Categorical fallback)
        const kpiFields = (schema.fields || []).filter((f: any) => f.isKpi === true);
        console.log('[useEventStats] Detected KPI Fields:', kpiFields);
           
        const fallbackFields = (schema.fields || []).filter((f: any) => 
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

        // Use KPI fields if available, otherwise fallback to smart detection
        const targetFields = kpiFields.length > 0 ? kpiFields : (fallbackFields.length > 0 ? [fallbackFields[0]] : []);

        targetFields.forEach((field: any) => {
             const counts: Record<string, number> = {};
             
             if (totalAttendees > 0) {
               attendees.forEach((att: any) => {
                  // Try to find the value by ID first, then Label, then case-insensitive Label
                  let rawVal = att.__formData?.[field.id] || att.__formData?.[field.label];
                  
                  if (rawVal === undefined && att.__formData) {
                     // Fuzzy search
                     const lowerLabel = field.label.toLowerCase();
                     const key = Object.keys(att.__formData).find(k => k.toLowerCase() === lowerLabel);
                     if (key) rawVal = att.__formData[key];
                  }
                  
                  if (rawVal !== undefined && rawVal !== null && rawVal !== '') {
                    const val = String(rawVal).trim();
                    if (val !== '') {
                      const normalizedVal = val;
                      counts[normalizedVal] = (counts[normalizedVal] || 0) + 1;
                    }
                  }
               });
             }
             
             // Get top values for Insights (Simple Card) - only if data exists
             if (totalAttendees > 0) {
               const topValues = Object.entries(counts)
                 .sort(([,a], [,b]) => b - a)
                 .slice(0, 3);
                 
               topValues.forEach(([val, count]) => {
                  insights.push({
                    label: field.label,
                    value: val,
                    count,
                    percentage: Math.round((count / totalAttendees) * 100)
                  });
               });
             }

             // Build Chart Data (Full Distribution)
             // Even if empty, we want to return the chart config so UI can show "No Data" state
             const chartData = Object.entries(counts)
               .map(([name, value]) => ({ name, value }))
               .sort((a, b) => b.value - a.value);

             charts.push({
                fieldLabel: field.label,
                data: chartData
             });
        });
        
        if (mounted) {
          setAudienceInsights(insights);
          setKpiCharts(charts);
        }

      } catch (err) {
        console.error('Error fetching event stats:', err);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    fetchStats();
    return () => { mounted = false; };
  }, [eventId]);

  return { baseStats, typeStats, audienceInsights, kpiCharts, eventType, isLoading };
}
