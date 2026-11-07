-- Disposable database only: reproduce permissive legacy bell writes so the
-- new restrictive boundary is tested independently of historical policies.
create table public.notifications(id uuid primary key default gen_random_uuid(),recipient_id uuid references auth.users(id),actor_id uuid references auth.users(id),type text,title text,body text,action_url text,created_at timestamptz default now(),read_at timestamptz);
alter table public.notifications enable row level security;
grant select,insert,update,delete on public.notifications to authenticated;
grant all on public.notifications to service_role;
create policy legacy_notifications on public.notifications to authenticated using(true) with check(true);
create table public.b2b_connections(id uuid primary key,profile_a_id uuid not null,profile_b_id uuid not null);
