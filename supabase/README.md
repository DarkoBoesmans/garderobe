# Supabase

Project `garderobe` (Frankfurt, eu-central-1). Het schema is opgebouwd met deze migraties, in volgorde:
`core_schema`, `harden_policies`, `allowlist_private`, `delete_my_account` (zie de migratielijst in het Supabase-dashboard).

Kernregels:
- RLS op elke tabel; de rol `anon` (niet ingelogd) heeft geen rechten op tabellen.
- Lezen: eigenaar of iemand met een `shares`-rij. Schrijven: eigenaar of share met `role = 'edit'`.
- Helpers `private.can_read` / `private.can_write` staan buiten de publieke API.
- Registreren kan alleen voor e-mails in `private.allowed_emails` of anoniem (demo).
- Bucket `closet` is privé, map per gebruiker, alleen webp/jpeg/png tot 5 MB.

Iemand uitnodigen: `insert into private.allowed_emails values ('naam@voorbeeld.be');`

Beveiligingstest: `TEST_A=… TEST_B=… TEST_PASSWORD=… node supabase/tests/security.mjs`
