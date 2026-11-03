-- Demo-kast "Jules" voor anonieme bezoekers. Foto's zijn statische bestanden in app/demo/, niet in storage.

create table if not exists private.demo_items (
  n int primary key,
  data jsonb not null,
  photo_path text not null,
  cutout_path text
);

insert into private.demo_items (n, data, photo_path, cutout_path) values
 (1,  '{"name":"Trucker jacket raw denim","brand":"Lee","category":"Jassen","colors":["denim","bruin"],"style":["vintage","workwear"],"size":"M","fit":"regular","material":"denim","pattern":"effen","season":["lente","herfst"],"condition":"gedragen","notes":"Rommelmarkt Gent, 25 euro. Corduroy kraag."}', 'demo/denim-o.webp', 'demo/denim-c.webp'),
 (2,  '{"name":"Flanellen overshirt","brand":"Dickies","category":"Hemden & overshirts","colors":["grijs","zwart"],"style":["workwear"],"size":"L","fit":"relaxed","material":"katoen","pattern":"ruit","season":["herfst","winter"],"condition":"goed"}', 'demo/flanel-o.webp', 'demo/flanel-c.webp'),
 (3,  '{"name":"Hoodie met print","brand":"Vinted","category":"Sweaters & hoodies","colors":["zwart","groen"],"style":["streetwear"],"size":"L","fit":"oversized","material":"katoen","pattern":"print","season":["herfst","winter"],"condition":"goed","notes":"Uitsnede liet de reling staan, dus de gewone foto blijft."}', 'demo/hoodie-zwart-o.webp', null),
 (4,  '{"name":"Witte hoodie","brand":"Uniqlo","category":"Sweaters & hoodies","colors":["wit"],"style":["basic"],"size":"M","fit":"regular","material":"katoen","pattern":"effen","season":["lente","herfst"],"condition":"goed"}', 'demo/hoodie-wit-o.webp', 'demo/hoodie-wit-c.webp'),
 (5,  '{"name":"Wit T-shirt","brand":"Uniqlo","category":"T-shirts & polo''s","colors":["wit"],"style":["basic"],"size":"M","fit":"regular","material":"katoen","pattern":"effen","season":["lente","zomer"],"condition":"goed"}', 'demo/tee-wit-o.webp', 'demo/tee-wit-c.webp'),
 (6,  '{"name":"Gemêleerd T-shirt","brand":"Kringwinkel","category":"T-shirts & polo''s","colors":["grijs","lichtblauw"],"style":["vintage"],"size":"M","fit":"slim","material":"katoen","pattern":"gemêleerd","season":["zomer"],"condition":"gedragen"}', 'demo/tee-grijs-o.webp', 'demo/tee-grijs-c.webp'),
 (7,  '{"name":"Grofgebreide trui","brand":"Kringwinkel","category":"Truien & cardigans","colors":["bruin","oranje"],"style":["vintage"],"size":"L","fit":"relaxed","material":"wol","pattern":"effen","season":["herfst","winter"],"condition":"gedragen","notes":"Losse draad aan de mouw, laten herstellen."}', 'demo/trui-roest-o.webp', 'demo/trui-roest-c.webp'),
 (8,  '{"name":"Zwarte slim jeans","brand":"Levi''s","category":"Jeans","colors":["zwart"],"style":["basic"],"size":"W32 L32","fit":"slim","material":"denim","pattern":"effen","season":["lente","herfst","winter"],"condition":"goed"}', 'demo/jeans-zwart-o.webp', 'demo/jeans-zwart-c.webp'),
 (9,  '{"name":"Lichte baggy jeans","brand":"Vinted","category":"Jeans","colors":["lichtblauw","denim"],"style":["vintage","streetwear"],"size":"W33 L32","fit":"oversized","material":"denim","pattern":"effen","season":["lente","zomer"],"condition":"gedragen"}', 'demo/jeans-licht-o.webp', 'demo/jeans-licht-c.webp'),
 (10, '{"name":"Grijze werkbroek","brand":"Carhartt","category":"Broeken","colors":["grijs","antraciet"],"style":["workwear"],"size":"W32 L32","fit":"relaxed","material":"katoen","pattern":"effen","season":["lente","herfst"],"condition":"goed"}', 'demo/broek-grijs-o.webp', 'demo/broek-grijs-c.webp'),
 (11, '{"name":"Old Skool rood suède","brand":"Vans","category":"Sneakers","colors":["rood","wit"],"style":["skate"],"size":"43","material":"suède","pattern":"effen","season":["lente","zomer","herfst"],"condition":"gedragen"}', 'demo/vans-rood-o.webp', 'demo/vans-rood-c.webp'),
 (12, '{"name":"Chuck Taylor low","brand":"Converse","category":"Sneakers","colors":["wit"],"style":["basic","vintage"],"size":"43","material":"canvas","pattern":"effen","season":["lente","zomer"],"condition":"versleten","notes":"Veters kwijt. Niet nog een paar witte kopen."}', 'demo/converse-o.webp', 'demo/converse-c.webp'),
 (13, '{"name":"Trucker cap","brand":"Vinted","category":"Accessoires","colors":["wit","zwart"],"style":["streetwear"],"size":"one size","material":"polyester","pattern":"effen","season":["zomer"],"condition":"goed"}', 'demo/pet-trucker-o.webp', 'demo/pet-trucker-c.webp'),
 (14, '{"name":"Gele dad cap","brand":"Kringwinkel","category":"Accessoires","colors":["geel"],"style":["vintage"],"size":"one size","material":"katoen","pattern":"effen","season":["lente","zomer"],"condition":"goed"}', 'demo/pet-geel-o.webp', 'demo/pet-geel-c.webp')
on conflict (n) do update set data = excluded.data, photo_path = excluded.photo_path, cutout_path = excluded.cutout_path;

-- Is de huidige gebruiker een anonieme demobezoeker?
create or replace function private.is_demo() returns boolean
language sql stable set search_path = '' as $$
  select coalesce(((select auth.jwt()) ->> 'is_anonymous')::boolean, false);
$$;

-- Vult een lege demokast. Enkel voor anonieme gebruikers, en maar één keer.
create or replace function public.start_demo() returns void
language plpgsql security definer set search_path = '' as $$
declare uid uuid := (select auth.uid());
begin
  if uid is null or not private.is_demo() then raise exception 'Alleen voor de demo'; end if;
  if exists (select 1 from public.items where user_id = uid) then return; end if;
  insert into public.items (user_id, data, photo_path, cutout_path, created_at)
    select uid, d.data || jsonb_build_object('added', now()::date), d.photo_path, d.cutout_path, now() + make_interval(secs => d.n)
    from private.demo_items d;
  insert into public.bodies (user_id, data) values (uid,
    '{"height":178,"weight":72,"chest":98,"waist":84,"hips":96,"inseam":82,"footL":27.1,"footR":27.3,"brandFit":{"Levi''s":"klein","Uniqlo":"groot"}}'::jsonb
      || jsonb_build_object('measuredAt', now()))
  on conflict (user_id) do nothing;
  -- Wat geschiedenis, zodat "Verras me" en "laatst gedragen" iets tonen.
  insert into public.wears (user_id, item_id, worn_on)
    select uid, i.id, current_date - w.d
    from public.items i
    join (values ('Trucker jacket raw denim', 1), ('Wit T-shirt', 1), ('Lichte baggy jeans', 1), ('Old Skool rood suède', 1),
                 ('Gemêleerd T-shirt', 3), ('Zwarte slim jeans', 3), ('Chuck Taylor low', 3)) as w(n, d) on i.data ->> 'name' = w.n
    where i.user_id = uid;
end $$;
revoke all on function public.start_demo() from public, anon;
grant execute on function public.start_demo() to authenticated;

-- Limieten voor demobezoekers: maximaal 40 stukken en 30 opgeladen bestanden.
create or replace function private.demo_item_cap() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if private.is_demo() and (select count(*) from public.items where user_id = new.user_id) >= 40 then
    raise exception 'De demo is beperkt tot 40 stukken';
  end if;
  return new;
end $$;
create or replace trigger demo_item_cap before insert on public.items for each row execute function private.demo_item_cap();

create or replace function private.demo_upload_ok() returns boolean
language sql stable security definer set search_path = '' as $$
  select not private.is_demo()
      or (select count(*) from storage.objects o where o.bucket_id = 'closet' and o.name like (select auth.uid())::text || '/%') < 30;
$$;
grant execute on function private.demo_upload_ok() to authenticated;
grant execute on function private.is_demo() to authenticated;

alter policy "closet toevoegen" on storage.objects
  with check (bucket_id = 'closet' and private.can_write(((storage.foldername(name))[1])::uuid) and private.demo_upload_ok());

-- Demo-accounts ouder dan 24 uur; enkel de opruimfunctie (service role) mag dit lezen.
create or replace function public.demo_expired() returns setof uuid
language sql stable security definer set search_path = '' as $$
  select id from auth.users where is_anonymous and created_at < now() - interval '24 hours' limit 200;
$$;
revoke all on function public.demo_expired() from public, anon, authenticated;
grant execute on function public.demo_expired() to service_role;

-- Elk uur opruimen (pg_cron + pg_net roepen de edge function demo-cleanup aan).
create extension if not exists pg_cron;
create extension if not exists pg_net with schema extensions;
select cron.schedule('demo-cleanup', '17 * * * *',
  $$ select net.http_post(url := 'https://uubsuzhtpokskjfpcets.supabase.co/functions/v1/demo-cleanup', headers := '{"Content-Type":"application/json"}'::jsonb, body := '{}'::jsonb) $$);
