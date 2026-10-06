-- Additive; no existing titles, times, bookings, or historical order are changed.
-- Null uses the deterministic title/id fallback until an organizer saves an order.
alter table public.event_sessions
  add column if not exists sort_order integer check (sort_order >= 0);
