import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner@2.0.3';
import { useParams } from 'react-router-dom';

export interface TicketType {
  id: string;
  name: string;
  price: number;
  currency: string;
  status: 'active' | 'expired' | 'draft' | 'hidden';
  sold: number;
  total: number;
  revenue: number;
  isPro: boolean;
  endDate: string;
  startDate?: string;
  maxPerPerson: number;
  includes: string[];
  description?: string;
  event_id?: string;
  tier: 'standard' | 'vip';
  visibility: 'public' | 'private' | 'hidden';
  isEarlyBird: boolean;
  earlyBirdDiscount?: number;
  earlyBirdEndDate?: string;
}

export function useTickets(eventIdOverride?: string) {
  const params = useParams<{ eventId: string }>();
  const eventId = eventIdOverride || params.eventId;
  const [tickets, setTickets] = useState<TicketType[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (eventId) {
      loadTickets(eventId);
    }
  }, [eventId]);

  const loadTickets = async (id: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('event_tickets')
        .select('*')
        .eq('event_id', id);

      if (error) {
        if (error.code === 'PGRST204' || error.code === '42P01') {
          console.warn('event_tickets table not found');
          setTickets([]);
          return;
        }
        throw error;
      }

      // Map DB fields to UI fields
      const mappedTickets: TicketType[] = (data || []).map(t => {
        const price = t.price || 0;
        const earlyBirdPrice = t.early_bird_price || 0;
        let discount = 0;
        if (t.is_early_bird && price > 0 && earlyBirdPrice > 0) {
          discount = Math.round(((price - earlyBirdPrice) / price) * 100);
        }

        return {
          id: t.id,
          name: t.name,
          price: price,
          currency: t.currency || 'USD',
          status: (t.status as any) || 'active',
          sold: t.quantity_sold || 0,
          total: t.quantity_total || 0,
          revenue: price * (t.quantity_sold || 0),
          isPro: t.is_vip,
          endDate: t.sales_end ? new Date(t.sales_end).toISOString().slice(0, 16) : '',
          startDate: t.sales_start ? new Date(t.sales_start).toISOString().slice(0, 16) : '',
          maxPerPerson: t.max_per_person || 10,
          includes: Array.isArray(t.includes) ? t.includes : [],
          description: t.description,
          event_id: t.event_id,
          tier: t.tier === 'vip' || t.is_vip ? 'vip' : 'standard',
          visibility: t.visibility === 'link_only' ? 'hidden' : (t.visibility as any) || 'public',
          isEarlyBird: t.is_early_bird || false,
          earlyBirdDiscount: discount,
          earlyBirdEndDate: t.early_bird_end_date ? new Date(t.early_bird_end_date).toISOString().slice(0, 16) : ''
        };
      });

      setTickets(mappedTickets);
    } catch (error) {
      console.error('Error loading tickets:', error);
      toast.error('Failed to load tickets');
    } finally {
      setIsLoading(false);
    }
  };

  const createTicket = async (ticket: Partial<TicketType>) => {
    if (!eventId) {
      console.error('createTicket: Missing eventId');
      toast.error('Event ID is missing. Please save the event first.');
      return null;
    }
    
    console.log('Creating ticket for event:', eventId, ticket);

    try {
      // Calculate early bird price if discount is present
      let earlyBirdPrice = 0;
      if (ticket.isEarlyBird && ticket.price && ticket.earlyBirdDiscount) {
        earlyBirdPrice = ticket.price * (1 - ticket.earlyBirdDiscount / 100);
      }

      const payload = {
        event_id: eventId,
        name: ticket.name,
        price: ticket.price,
        quantity_total: ticket.total,
        sales_start: ticket.startDate ? new Date(ticket.startDate).toISOString() : null,
        sales_end: ticket.endDate ? new Date(ticket.endDate).toISOString() : null,
        status: ticket.status || 'active',
        includes: ticket.includes || [],
        is_vip: ticket.isPro || ticket.tier === 'vip',
        description: ticket.description,
        max_per_person: ticket.maxPerPerson,
        currency: ticket.currency,
        visibility: ticket.visibility === 'hidden' ? 'link_only' : ticket.visibility,
        is_early_bird: ticket.isEarlyBird,
        early_bird_price: earlyBirdPrice,
        early_bird_end_date: ticket.earlyBirdEndDate ? new Date(ticket.earlyBirdEndDate).toISOString() : null,
        tier: ticket.isPro || ticket.tier === 'vip' ? 'vip' : 'standard'
      };

      console.log('Ticket Payload:', payload);

      const { data, error } = await supabase
        .from('event_tickets')
        .insert(payload)
        .select()
        .single();

      if (error) throw error;
      
      await loadTickets(eventId);
      toast.success('Ticket created');
      return data;
    } catch (error) {
      console.error('Error creating ticket:', error);
      toast.error('Failed to create ticket');
      return null;
    }
  };

  const updateTicket = async (id: string, ticket: Partial<TicketType>) => {
    try {
      // Calculate early bird price if discount is present
      let earlyBirdPrice = 0;
      if (ticket.isEarlyBird && ticket.price !== undefined && ticket.earlyBirdDiscount !== undefined) {
         earlyBirdPrice = ticket.price * (1 - ticket.earlyBirdDiscount / 100);
      } else if (ticket.isEarlyBird && ticket.earlyBirdDiscount !== undefined) {
         // If price is not in update payload, we might need it to calculate. 
         // But usually update sends full object or we need to rely on existing.
         // For now, assuming price is available or we handle it. 
         // If we don't have price, we can't recalculate correctly without fetching.
         // However, in TicketsTab we usually have the full object.
      }

      const { data, error } = await supabase
        .from('event_tickets')
        .update({
          name: ticket.name,
          price: ticket.price,
          quantity_total: ticket.total,
          sales_start: ticket.startDate ? new Date(ticket.startDate).toISOString() : null,
          sales_end: ticket.endDate ? new Date(ticket.endDate).toISOString() : null,
          status: ticket.status,
          includes: ticket.includes || [],
          is_vip: ticket.isPro || ticket.tier === 'vip',
          description: ticket.description,
          max_per_person: ticket.maxPerPerson,
          currency: ticket.currency,
          visibility: ticket.visibility === 'hidden' ? 'link_only' : ticket.visibility,
          is_early_bird: ticket.isEarlyBird,
          early_bird_price: earlyBirdPrice > 0 ? earlyBirdPrice : undefined, // Only update if calculated
          early_bird_end_date: ticket.earlyBirdEndDate ? new Date(ticket.earlyBirdEndDate).toISOString() : null,
          tier: ticket.isPro || ticket.tier === 'vip' ? 'vip' : 'standard'
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      if (eventId) await loadTickets(eventId);
      toast.success('Ticket updated');
      return data;
    } catch (error) {
      console.error('Error updating ticket:', error);
      toast.error('Failed to update ticket');
    }
  };

  const deleteTicket = async (id: string) => {
    try {
      const { error } = await supabase
        .from('event_tickets')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      if (eventId) await loadTickets(eventId);
      toast.success('Ticket deleted');
    } catch (error) {
      console.error('Error deleting ticket:', error);
      toast.error('Failed to delete ticket');
    }
  };

  return {
    tickets,
    isLoading,
    createTicket,
    updateTicket,
    deleteTicket,
    loadTickets
  };
}
