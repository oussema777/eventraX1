begin;
create function public.expire_review_requests() returns integer language plpgsql security definer set search_path='' as $$
declare count_expired integer;
begin
 with expired as (update public.event_booking_requests r set state='expired',revision=revision+1,updated_at=now()
  where state='awaiting_review' and starts_at<=now() and public.event_review_active(event_id) returning *)
 insert into public.event_review_outbox(event_id,request_id,request_revision,kind,recipient_id,deduplication_key)
 select event_id,id,revision,'expired',requester_id,id||':'||revision||':expired' from expired;
 get diagnostics count_expired=row_count;return count_expired;
end; $$;
create function public.review_guest_retained(p_user uuid) returns boolean language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.event_attendees a where a.profile_id=p_user and
  (exists(select 1 from public.event_investor_designations d where d.attendee_id=a.id)
   or exists(select 1 from public.event_booking_requests r where a.id in(r.requester_attendee_id,r.recipient_attendee_id))
   or exists(select 1 from public.event_review_meeting_permits p where p_user in(p.requester_id,p.recipient_id))));
$$;
-- Operator-selected cutoff only. No invented retention period or automatic
-- deletion of review/audit history. Keep ledger IDs/provider receipts for dedup.
create function public.purge_review_delivery_payloads(p_before timestamptz) returns jsonb language plpgsql security definer set search_path='' as $$
declare platform_count integer; review_count integer;
begin
 if p_before is null or p_before>now()-interval '24 hours' then raise exception 'Cutoff must precede the retry window'; end if;
 update public.platform_mail_deliveries set mail=jsonb_build_object('redacted',true) where state='sent' and created_at<p_before and not mail ? 'redacted';
 get diagnostics platform_count=row_count;
 update public.event_review_outbox set delivery_payload=null where state in ('sent','suppressed') and created_at<p_before and delivery_payload is not null;
 get diagnostics review_count=row_count;
 delete from public.registration_mail_preparations where lease_until<p_before;
 return jsonb_build_object('platform',platform_count,'review',review_count);
end; $$;
revoke all on function public.expire_review_requests(),public.review_guest_retained(uuid),public.purge_review_delivery_payloads(timestamptz) from public,anon,authenticated;
grant execute on function public.expire_review_requests(),public.review_guest_retained(uuid),public.purge_review_delivery_payloads(timestamptz) to service_role;
commit;
