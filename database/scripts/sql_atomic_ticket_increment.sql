-- Atomic ticket increment RPC
-- Prevents race conditions when multiple users purchase the same ticket simultaneously.
-- Uses row-level locking (SELECT ... FOR UPDATE equivalent via UPDATE WHERE) to ensure
-- quantity_sold never exceeds quantity_available.
--
-- Usage from client: supabase.rpc('increment_ticket_sold', { p_ticket_id: ticketId })

CREATE OR REPLACE FUNCTION increment_ticket_sold(p_ticket_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE event_tickets
  SET quantity_sold = COALESCE(quantity_sold, 0) + 1
  WHERE id = p_ticket_id
  AND (quantity_available IS NULL OR COALESCE(quantity_sold, 0) < quantity_available);

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Ticket sold out or not found';
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
