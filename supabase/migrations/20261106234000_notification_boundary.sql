begin;
alter table public.notifications add column source_key text unique;
revoke insert on public.notifications from public,anon;
create function public.investor_notification_target(p_user uuid)
returns boolean language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.event_investor_designations d join public.event_attendees a on a.id=d.attendee_id where d.active and a.profile_id=p_user)
 or exists(select 1 from public.event_investor_invitations i join auth.users u on lower(u.email)=i.email where u.id=p_user and i.status='pending' and i.expires_at>now());
$$;
create policy investor_notification_server_only on public.notifications as restrictive for insert to authenticated
 with check(recipient_id=auth.uid() or not public.investor_notification_target(recipient_id));
create function public.guard_notification_content() returns trigger language plpgsql security definer set search_path='' as $$
begin
 if auth.uid() is not null and (to_jsonb(new)-'read_at') is distinct from (to_jsonb(old)-'read_at') then
   raise exception 'Notification content is immutable' using errcode='42501';
 end if;
 return new;
end; $$;
create trigger notification_read_only_update before update on public.notifications for each row execute function public.guard_notification_content();
revoke all on function public.investor_notification_target(uuid),public.guard_notification_content() from public,anon,authenticated;
grant execute on function public.investor_notification_target(uuid) to authenticated;
create function public.remove_networking_connection(p_connection uuid) returns void language plpgsql security definer set search_path='' as $$
declare connection record; recipient uuid;
begin
 if auth.uid() is null then raise exception 'Sign in required' using errcode='42501'; end if;
 select * into connection from public.b2b_connections where id=p_connection for update;
 if not found then return; end if;
 if not coalesce(auth.uid() in(connection.profile_a_id,connection.profile_b_id),false) then raise exception 'Not authorized' using errcode='42501'; end if;
 recipient:=case when auth.uid()=connection.profile_a_id then connection.profile_b_id else connection.profile_a_id end;
 delete from public.b2b_connections where id=p_connection;
 insert into public.notifications(recipient_id,actor_id,type,title,body,action_url,source_key)
 values(recipient,auth.uid(),'action','Connection removed','Your networking connections have changed.','/my-networking','connection-removed:'||p_connection) on conflict(source_key) do nothing;
end; $$;
revoke all on function public.remove_networking_connection(uuid) from public,anon,authenticated;
grant execute on function public.remove_networking_connection(uuid) to authenticated;
commit;
