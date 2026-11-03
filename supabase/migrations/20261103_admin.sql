-- Adminscherm: uitnodigingen beheren. Enkel voor Darko, gecontroleerd in de database zelf.

alter table private.allowed_emails add column if not exists person text not null default 'demo'
  check (person in ('darko', 'lana', 'demo'));
update private.allowed_emails set person = 'darko' where lower(email) = 'darkoboesmans@gmail.com';
update private.allowed_emails set person = 'lana' where lower(email) = 'lana.vannieuwenhuysen@gmail.com';

-- Nieuwe gebruikers krijgen de garderobe die bij hun uitnodiging hoort; anoniem en onbekend wordt demo.
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, name, person) values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'name', ''),
    coalesce((select a.person from private.allowed_emails a where lower(a.email) = lower(new.email)), 'demo')
  );
  return new;
end $$;

create or replace function private.is_admin() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from auth.users u where u.id = (select auth.uid())
                 and lower(u.email) = 'darkoboesmans@gmail.com' and u.email_confirmed_at is not null);
$$;

create or replace function public.admin_overview() returns jsonb
language plpgsql stable security definer set search_path = '' as $$
begin
  if not private.is_admin() then raise exception 'Geen toegang'; end if;
  return jsonb_build_object(
    'invites', coalesce((select jsonb_agg(jsonb_build_object('email', a.email, 'person', a.person,
        'joined', u.created_at, 'last', u.last_sign_in_at) order by a.email)
      from private.allowed_emails a left join auth.users u on lower(u.email) = lower(a.email)), '[]'::jsonb),
    'demos', (select count(*) from auth.users where is_anonymous),
    'items', (select count(*) from public.items)
  );
end $$;

create or replace function public.admin_invite(p_email text, p_person text default 'demo') returns void
language plpgsql security definer set search_path = '' as $$
begin
  if not private.is_admin() then raise exception 'Geen toegang'; end if;
  if p_email !~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' or length(p_email) > 254 then raise exception 'Ongeldig e-mailadres'; end if;
  insert into private.allowed_emails (email, person) values (lower(trim(p_email)), coalesce(p_person, 'demo'))
  on conflict (email) do update set person = excluded.person;
end $$;

create or replace function public.admin_uninvite(p_email text) returns void
language plpgsql security definer set search_path = '' as $$
begin
  if not private.is_admin() then raise exception 'Geen toegang'; end if;
  if lower(p_email) = 'darkoboesmans@gmail.com' then raise exception 'Je kunt jezelf niet uitschrijven'; end if;
  delete from private.allowed_emails where lower(email) = lower(p_email);
end $$;

revoke all on function public.admin_overview(), public.admin_invite(text, text), public.admin_uninvite(text) from public, anon;
grant execute on function public.admin_overview(), public.admin_invite(text, text), public.admin_uninvite(text) to authenticated;
