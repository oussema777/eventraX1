-- Restore import ownership using original Mongo relationships, never company names
-- or public contact emails. Source: archived businessprofiles.owner.actor ->
-- attendees.user -> profiles.mongo_id (October 2026 repair).
-- Only replaces the known import placeholder; existing real owners are preserved.
begin;

update public.profiles set account_type = 'system'
where id = '5e1d401a-16a1-5b5f-b839-6692ffc3d62f' and email = 'system@eventra.local';

with source(business_mongo_id, actor_mongo_id, user_mongo_id) as (values
('68ffc9f3f6fdf840a68bbc06', '68f90b23e7c3ac5a52ec471c', '692ba53a26e99a9c28b7899e'),
('6902098c1d543347f422473b', '6902076b1d543347f42245db', '692ba57226e99a9c28b78bbc'),
('690216b81d543347f42250c6', '690215521d543347f4224e66', '692ba57526e99a9c28b78bd8'),
('690217a51d543347f422527e', '68f79736b1cedad6f9f49350', '692ba53126e99a9c28b78942'),
('690217a81d543347f4225283', '68ff41934c9c1b667e8c1cc3', '692ba55b26e99a9c28b78ae0'),
('69021ca41d543347f422591c', '69021b341d543347f42256cd', '692ba57726e99a9c28b78be8'),
('6903842f1d543347f422a8fb', '690381f21d543347f422a817', '692ba58426e99a9c28b78c68'),
('69045068b14d48bf569a73eb', '68ff91d14c9c1b667e8c37ab', '692ba56026e99a9c28b78b14'),
('6905183f50151b27138d17a2', '68f788bab1cedad6f9f48d50', '692ba52d26e99a9c28b7891e'),
('690606ebbcd88cd3b11907ba', '68f6ce058429eb86abfc3a18', '692ba52c26e99a9c28b78916'),
('69060c62a2433b643527668c', '690215f91d543347f4224fd7', '692ba57626e99a9c28b78bdc'),
('69086cfbd34fb1a09d4f810f', '69086b2fd34fb1a09d4f8035', '692ba5a226e99a9c28b78d86'),
('6908923cd34fb1a09d4f9374', '690737a4d34fb1a09d4f6aa7', '692ba59c26e99a9c28b78d52'),
('6908c6a9d34fb1a09d4fb139', '68f15ddecce1e2ac9ff79cd9', '692ba50126e99a9c28b78776'),
('690a1cb04aaf567045dcafeb', '6904fd3f50151b27138d15de', '692ba59326e99a9c28b78cfa'),
('690a20784aaf567045dcba99', '690a1d684aaf567045dcb2f6', '692ba5b826e99a9c28b78e62'),
('690a2d2f4aaf567045dcd5da', '68f1450ccce1e2ac9ff79ae2', '692ba50026e99a9c28b7876e'),
('690a362d4aaf567045dcdad8', '6904d16ab14d48bf569a9140', '692ba59226e99a9c28b78cee'),
('690b337fd4fbdc76e08d754c', '690b2425d4fbdc76e08d6b01', '692ba5ca26e99a9c28b78f12'),
('690b3c6ed4fbdc76e08d7b70', '6900c437906874c83870066e', '692ba56826e99a9c28b78b60'),
('690b6ee4d4fbdc76e08d9409', '68f982f5e7c3ac5a52ec4a17', '692ba53d26e99a9c28b789b6'),
('690b9c86d4fbdc76e08d9ea0', '690b9838d4fbdc76e08d9d87', '692ba5cf26e99a9c28b78f3a'),
('690bc0cfd4fbdc76e08da7b6', '690228751d543347f4226200', '692ba57926e99a9c28b78bf8'),
('690bc8c3d4fbdc76e08daa76', '690bb50ed4fbdc76e08da41e', '692ba5cf26e99a9c28b78f42'),
('690c92fdd4fbdc76e08dd668', '6902259c1d543347f4225fdc', '692ba57826e99a9c28b78bf0'),
('690c9330d4fbdc76e08dd67f', '68f9f809e7c3ac5a52ec5120', '692ba53f26e99a9c28b789ca'),
('690c99afd4fbdc76e08ddbff', '68f7a07ab1cedad6f9f49698', '692ba53126e99a9c28b7894a'),
('690cabf3d4fbdc76e08df31d', '68f9e66de7c3ac5a52ec4b90', '692ba53d26e99a9c28b789ba'),
('690cae26d4fbdc76e08df6fc', '690cab23d4fbdc76e08df17c', '692ba5d726e99a9c28b78f8e'),
('690cb5fdd4fbdc76e08e05cd', '690b918ad4fbdc76e08d9ca8', '692ba5ce26e99a9c28b78f36'),
('690cebc360f9b51e2b3e39ff', '68fe7c564c9c1b667e8c158c', '692ba55926e99a9c28b78acc'),
('690dadb365a3695afa5879a3', '690daa1365a3695afa587656', '692ba5ea26e99a9c28b79042'),
('690db28d65a3695afa587d5d', '690a49084aaf567045dce3cc', '692ba5bd26e99a9c28b78e8a'),
('690dd38765a3695afa589666', '68f16699cce1e2ac9ff79d33', '692ba50126e99a9c28b7877a'),
('690ddc754243a8c9f5eb55e2', '69023bfd1d543347f422694f', '692ba57a26e99a9c28b78c08'),
('690de2514243a8c9f5eb5b59', '68ffa3604c9c1b667e8c3d10', '692ba56226e99a9c28b78b28'),
('690e1485743c43ba4b6892fc', '68f78e73b1cedad6f9f48f88', '692ba52e26e99a9c28b7892e'),
('690e230a743c43ba4b68a3d3', '68f79541b1cedad6f9f49274', '692ba53026e99a9c28b7893a'),
('690e2eef743c43ba4b68ab5f', '690e2d13743c43ba4b68a9e8', '692ba5fb26e99a9c28b790e2'),
('690e5b55743c43ba4b68c2bc', '690e5a35743c43ba4b68c1a1', '692ba5fb26e99a9c28b790e6'),
('690e5b78743c43ba4b68c2ed', '68fe09dd4c9c1b667e8c1032', '692ba55626e99a9c28b78ab4'),
('690e87cf743c43ba4b68d4a7', '690e84d6743c43ba4b68d2da', '692ba60026e99a9c28b79116'),
('690f1517743c43ba4b68fdc8', '6904a0a5b14d48bf569a8472', '692ba59026e99a9c28b78cde'),
('690f1b04743c43ba4b6905ad', '690f1987743c43ba4b6903af', '692ba60326e99a9c28b7912e'),
('690f2363743c43ba4b690f28', '690f21ef743c43ba4b690d32', '692ba60426e99a9c28b7913e'),
('690f2425743c43ba4b691031', '690f1dec743c43ba4b690831', '692ba60426e99a9c28b79136'),
('690f2989743c43ba4b69176c', '690cb54dd4fbdc76e08e047a', '692ba5dd26e99a9c28b78fc2'),
('690f3fe1743c43ba4b692f17', '690f1e6d743c43ba4b690926', '692ba60426e99a9c28b7913a'),
('690f544e743c43ba4b69427b', '68ffffc2f6fdf840a68bc233', '692ba56526e99a9c28b78b48'),
('690f5a35743c43ba4b69469d', '690f586e743c43ba4b694588', '692ba60826e99a9c28b79164'),
('690f72ed743c43ba4b695be0', '690f7157743c43ba4b6959fd', '692ba60a26e99a9c28b79174'),
('690f902291943958dc27315f', '68f376d3cce1e2ac9ff7a971', '692ba50526e99a9c28b7879e'),
('690f9c7891943958dc273a4a', '690f909d91943958dc2731b8', '692ba60d26e99a9c28b79190'),
('690fd01a91943958dc2751ce', '690b42b0d4fbdc76e08d803a', '692ba5cc26e99a9c28b78f1e'),
('691098c191943958dc276935', '68f95466e7c3ac5a52ec49df', '692ba53c26e99a9c28b789b2'),
('6910ba4b7b23bc481138e5e4', '690b0dc5d4fbdc76e08d60d8', '692ba5c726e99a9c28b78ef2'),
('6910c22e7b23bc481138ec1f', '690a53104aaf567045dcebf8', '692ba5bf26e99a9c28b78e9e'),
('6910d56a29c5aeb4a3348ed4', '690a312b4aaf567045dcd8a5', '692ba5bb26e99a9c28b78e76'),
('6910de9129c5aeb4a3349186', '68f7d328b1cedad6f9f4a47a', '692ba53326e99a9c28b7895a'),
('6911b83aa3d7fc868cc1715f', '690991574aaf567045dc6f41', '692ba5ac26e99a9c28b78dee'),
('6912154ca3d7fc868cc1fdde', '68fa556d2ba5ab876d6908b6', '692ba54326e99a9c28b789f6'),
('69122baca3d7fc868cc21b53', '690dda4f4243a8c9f5eb5401', '692ba5f426e99a9c28b790a2'),
('69122c8da3d7fc868cc21dae', '6912245da3d7fc868cc20b4e', '692ba62c26e99a9c28b792c0'),
('69123604a3d7fc868cc22f80', '68ff9ae44c9c1b667e8c3b99', '692ba56126e99a9c28b78b20'),
('69123a8ba3d7fc868cc23466', '68fd4ad24c9c1b667e8c0d9b', '692ba55626e99a9c28b78ab0'),
('69123d87a3d7fc868cc237dd', '690368881d543347f422a141', '692ba58426e99a9c28b78c64'),
('6912fe61a3d7fc868cc286ea', '68f88977e7c3ac5a52ec2506', '692ba53726e99a9c28b7897e'),
('691318f6a3d7fc868cc2b281', '6911923da3d7fc868cc15154', '692ba61d26e99a9c28b79230'),
('69131955a3d7fc868cc2b4cb', '6905f691a2433b6435275c5f', '692ba59526e99a9c28b78d0e'),
('69131abca3d7fc868cc2b76b', '68f3d2d0cce1e2ac9ff7b18e', '692ba52626e99a9c28b788de'),
('69131b9da3d7fc868cc2b9b0', '68f791b6b1cedad6f9f49098', '692ba52f26e99a9c28b78936'),
('69131c39a3d7fc868cc2bb3c', '69131bb4a3d7fc868cc2ba02', '692ba63426e99a9c28b79310'),
('691359e324577fce5dc77886', '6911bf1ba3d7fc868cc17b88', '692ba62126e99a9c28b79254'),
('691373c224577fce5dc791b4', '68fd037c4c9c1b667e8c0347', '692ba55326e99a9c28b78a90'),
('6913869124577fce5dc7ad5d', '6913843224577fce5dc7a56e', '692ba63f26e99a9c28b79378'),
('69139c8824577fce5dc7c6c6', '68fa05ade7c3ac5a52ec54a7', '692ba54026e99a9c28b789d6'),
('6913ab8524577fce5dc7d8c4', '68f7c08db1cedad6f9f4a0b3', '692ba53326e99a9c28b78956'),
('6913b88e24577fce5dc7e13a', '6913b77024577fce5dc7e094', '692ba64226e99a9c28b79394'),
('69145bb1f8eef836696f6b57', '69090e654aaf567045dc66ae', '692ba5a926e99a9c28b78dce'),
('6914b173972ed70ab9ff1ca4', '68fa3499e7c3ac5a52ec6386', '692ba54226e99a9c28b789ea'),
('6914b1be972ed70ab9ff1d19', '68ffb69a4c9c1b667e8c3f59', '692ba56326e99a9c28b78b30'),
('6914b298972ed70ab9ff1def', '6914af13972ed70ab9ff1a65', '692ba64c26e99a9c28b793f0'),
('6914b684972ed70ab9ff2393', '69131d78a3d7fc868cc2bdbd', '692ba63526e99a9c28b79314'),
('6914bbea972ed70ab9ff2a9a', '6900c053906874c8387005c4', '692ba56726e99a9c28b78b5c'),
('6914d371972ed70ab9ff43b9', '68ff40194c9c1b667e8c1c71', '692ba55a26e99a9c28b78adc'),
('6914d6a0972ed70ab9ff46e0', '68fe39454c9c1b667e8c12e2', '692ba55826e99a9c28b78ac0'),
('6914debf972ed70ab9ff59d4', '68ffb94e4c9c1b667e8c3fe7', '692ba56326e99a9c28b78b34'),
('6914f958972ed70ab9ff71bb', '690086b2906874c8386ff595', '692ba56626e99a9c28b78b4c'),
('6914ff9c972ed70ab9ff77a1', '6906b10713b972966e417441', '692ba59b26e99a9c28b78d4a'),
('691502511c21c2d7a4929108', '690e02e94243a8c9f5eb73b0', '692ba5f826e99a9c28b790ca'),
('69152a7d972ed70ab9ff9716', '690490beb14d48bf569a7da4', '692ba58f26e99a9c28b78cd6'),
('6915798d972ed70ab9ffc066', '691365e224577fce5dc78733', '692ba63e26e99a9c28b7936c'),
('69158ce2972ed70ab9ffd6fb', '690ed583743c43ba4b68e300', '692ba60126e99a9c28b7911e'),
('691a08b4b472a3cee6858c39', '69159614972ed70ab9ffefea', '692ba66726e99a9c28b794f4'),
('69220187b472a3cee685e0e8', '69087c1cd34fb1a09d4f89c7', '692ba5a326e99a9c28b78d92')
), recreated_accounts(user_mongo_id, original_email, original_name) as (
  -- These original owners recreated their accounts; their old Mongo ID is absent.
  -- Both the verified login email and full name must match the original user record.
  values
    ('692ba52c26e99a9c28b78916', 'raslenderbali77@gmail.com', 'Raslen Derbali'),
    ('692ba57526e99a9c28b78bd8', 'ghaleb@gmail.com', 'Ghaleb BEN ALI'),
    ('692ba62126e99a9c28b79254', 'firasdhaouadi@edtrust.tn', 'Firas Dhaouadi')
), identities as (
  select mongo_id, id from public.profiles where mongo_id is not null
  union all
  select a.user_mongo_id, p.id from recreated_accounts a
  join auth.users u on lower(trim(u.email)) = a.original_email and u.email_confirmed_at is not null
  join public.profiles p on p.id = u.id and p.mongo_id is null
    and lower(trim(p.full_name)) = lower(a.original_name)
  where not exists (select 1 from public.profiles existing where existing.mongo_id = a.user_mongo_id)
), resolved as (
  select b.id business_id, p.id profile_id
  from source s
  join public.business_profiles b on b.mongo_id = s.business_mongo_id
  join identities i on i.mongo_id = coalesce(s.user_mongo_id, s.actor_mongo_id)
  join public.profiles p on p.id = i.id
  join auth.users u on u.id = p.id
  where b.owner_profile_id = '5e1d401a-16a1-5b5f-b839-6692ffc3d62f'
    and p.id <> b.owner_profile_id and p.account_type <> 'system'
)
update public.business_profiles b set owner_profile_id = r.profile_id, updated_at = now()
from resolved r where b.id = r.business_id;

-- Preserve historical threads. Never transfer their messages to repaired owners.
-- Reject new participants/messages involving a technical account, including old threads.
create or replace function public.reject_system_messaging()
returns trigger language plpgsql security definer set search_path = public, pg_temp as $$
begin
  if tg_table_name = 'message_thread_participants' then
    if exists (select 1 from public.profiles p where p.id = new.profile_id
      and (p.account_type = 'system' or p.id = '5e1d401a-16a1-5b5f-b839-6692ffc3d62f')) then
      raise exception 'Technical accounts cannot participate in conversations' using errcode = '23514';
    end if;
  else
    if exists (select 1 from public.profiles p where p.id = new.sender_id
      and (p.account_type = 'system' or p.id = '5e1d401a-16a1-5b5f-b839-6692ffc3d62f'))
      or exists (select 1 from public.message_thread_participants m join public.profiles p on p.id = m.profile_id
        where m.thread_id = new.thread_id
        and (p.account_type = 'system' or p.id = '5e1d401a-16a1-5b5f-b839-6692ffc3d62f')) then
      raise exception 'Technical accounts cannot receive messages' using errcode = '23514';
    end if;
  end if;
  return new;
end;
$$;
revoke all on function public.reject_system_messaging() from public, anon, authenticated;
drop trigger if exists reject_system_participant on public.message_thread_participants;
create trigger reject_system_participant before insert or update of profile_id
on public.message_thread_participants for each row execute function public.reject_system_messaging();
drop trigger if exists reject_system_message on public.message_messages;
create trigger reject_system_message before insert or update of thread_id, sender_id, body
on public.message_messages for each row execute function public.reject_system_messaging();
commit;
