-- Linked-project regression: all temporary visibility changes roll back.
begin;
set local role anon;
do $$ begin
  if not exists (select 1 from public.business_members
    where business_id = 'c0b57669-e5bb-49e9-90c0-f694319be152'
      and profile_id = '48a65607-d476-4b5c-b8ca-df709199fba2') then
    raise exception 'Public viewers cannot resolve Ines''s Fidele membership';
  end if;
end $$;
reset role;
-- A different existing profile represents a signed-in non-owner.
select set_config('request.jwt.claim.sub', 'f7cbbd81-d0c8-426c-8539-c23cb18ecfe9', true);
set local role authenticated;
do $$ declare affected integer; begin
  if not exists (select 1 from public.business_members
    where business_id = 'c0b57669-e5bb-49e9-90c0-f694319be152'
      and profile_id = '48a65607-d476-4b5c-b8ca-df709199fba2') then
    raise exception 'Signed-in viewers cannot resolve public memberships';
  end if;
  update public.business_members set role = 'member'
    where business_id = 'c0b57669-e5bb-49e9-90c0-f694319be152';
  get diagnostics affected = row_count;
  if affected <> 0 then raise exception 'Non-owner can update memberships'; end if;
  delete from public.business_members
    where business_id = 'c0b57669-e5bb-49e9-90c0-f694319be152';
  get diagnostics affected = row_count;
  if affected <> 0 then raise exception 'Non-owner can delete memberships'; end if;
end $$;
reset role;
update public.business_profiles set is_public = false
where id = 'c0b57669-e5bb-49e9-90c0-f694319be152';
set local role authenticated;
do $$ begin
  if exists (select 1 from public.business_members
    where business_id = 'c0b57669-e5bb-49e9-90c0-f694319be152') then
    raise exception 'Private memberships leaked to a non-owner';
  end if;
end $$;
reset role;
select set_config('request.jwt.claim.sub', '99181238-d0cb-4495-9263-4db2724c0dcb', true);
set local role authenticated;
do $$ begin
  if not exists (select 1 from public.business_members
    where business_id = 'c0b57669-e5bb-49e9-90c0-f694319be152') then
    raise exception 'Owner lost access to private team';
  end if;
end $$;
reset role;
rollback;
