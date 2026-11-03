// Wist demo-accounts (anoniem) ouder dan 24 uur, met hun foto's in storage. Rijen verdwijnen via ON DELETE CASCADE.
// Geen geheim nodig: de functie doet altijd hetzelfde en raakt enkel verlopen anonieme accounts.
import { createClient } from "jsr:@supabase/supabase-js@2";

const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { auth: { persistSession: false } });

Deno.serve(async () => {
  const { data: ids, error } = await admin.rpc("demo_expired");
  if (error) return new Response("fout", { status: 500 });
  let n = 0;
  for (const id of (ids ?? []) as string[]) {
    const { data: files } = await admin.storage.from("closet").list(id, { limit: 1000 });
    if (files?.length) await admin.storage.from("closet").remove(files.map((f) => `${id}/${f.name}`));
    if (!(await admin.auth.admin.deleteUser(id)).error) n++;
  }
  return new Response(JSON.stringify({ gewist: n }), { headers: { "Content-Type": "application/json" } });
});
