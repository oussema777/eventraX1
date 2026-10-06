-- Setup for session-order.sql. Run only against an empty disposable local PostgreSQL database.
\set ON_ERROR_STOP on
create role anon;
create role authenticated;
create schema auth;
create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
create table public.profiles (id uuid primary key, role text);
create table public.events (id uuid primary key, owner_id uuid);
create table public.event_sessions (id uuid primary key, event_id uuid references events, starts_at timestamptz, title text);
\ir ../supabase/migrations/20261006090000_session_display_order.sql
insert into events values ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001'), ('00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002');
insert into profiles values ('10000000-0000-0000-0000-000000000003', 'admin');
insert into event_sessions(id, event_id, starts_at, title) values
('20000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', '2026-11-25T10:00:00Z', 'One'),
('20000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', '2026-11-25T10:00:00Z', 'Two'),
('20000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000002', '2026-11-25T10:00:00Z', 'Other event');
