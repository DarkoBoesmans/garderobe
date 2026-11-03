-- Juridisch opschonen (3 november 2026).
-- 1. Lookbooks met winkelfoto's staan niet meer openbaar op GitHub maar privé in storage.
--    Alleen ingelogde, niet-anonieme gebruikers lezen enkel de map van hun eigen garderobe (profiles.person).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('lookbook', 'lookbook', false, 5242880, array['image/jpeg','application/json'])
on conflict (id) do nothing;
create policy "lookbook lezen" on storage.objects for select to authenticated
  using (bucket_id = 'lookbook' and not private.is_demo()
         and (storage.foldername(name))[1] = (select p.person from public.profiles p where p.id = (select auth.uid())));
-- Namaakwinkels (huskyreps, 91sheep, chaosmade op Yupoo) zijn uit de lookbooks verwijderd voor het opladen.

-- 2. Demo: geen merknamen die niet op de foto staan; enkel Vans en Converse zijn zichtbaar.
update private.demo_items set data = jsonb_set(data, '{brand}', to_jsonb(v.b)) from (values
 (1,'Rommelmarkt Gent'),(2,'Kringwinkel'),(4,'Vinted'),(5,'Vinted'),(8,'Kringwinkel'),(10,'Rommelmarkt Gent')) as v(n,b)
where private.demo_items.n = v.n;
-- start_demo(): brandFit gebruikt nu {"Vinted":"groot","Vans":"klein"} (zie 20261103_demo.sql voor de rest van de functie).
