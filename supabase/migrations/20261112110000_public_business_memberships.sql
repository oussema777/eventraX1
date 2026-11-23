-- Public business profiles already display their team. Networking cards and
-- personal profiles must be able to resolve those same public affiliations.
-- Keep the existing owner-only INSERT/UPDATE/DELETE policies unchanged.
create policy "Public can view public business memberships"
on public.business_members for select to anon, authenticated
using (
  exists (
    select 1 from public.business_profiles b
    where b.id = business_members.business_id and b.is_public = true
  )
);
