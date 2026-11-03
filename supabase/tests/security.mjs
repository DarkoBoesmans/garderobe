// Beveiligingstest tegen het echte project. Vereist twee testaccounts die op de allowlist staan:
//   TEST_A, TEST_B (e-mail), TEST_PASSWORD. Draai: node supabase/tests/security.mjs
// Elke regel moet "ok" geven; één "FOUT" betekent dat RLS of Storage-regels lekken.
import { createClient } from "@supabase/supabase-js";
const URL = "https://uubsuzhtpokskjfpcets.supabase.co", KEY = "sb_publishable_rj1Dyw4cP-Kam6La6GHIvA_RKGdZbGd";
const { TEST_A, TEST_B, TEST_PASSWORD } = process.env;
const login = async (email) => {
  const c = createClient(URL, KEY, { auth: { persistSession: false } });
  const r = await c.auth.signInWithPassword({ email, password: TEST_PASSWORD });
  if (r.error) throw r.error;
  return [c, r.data.user.id];
};
let fails = 0;
const ok = (name, cond) => { if (!cond) fails++; console.log(cond ? "ok  " : "FOUT", name); };
const [a, ua] = await login(TEST_A), [b, ub] = await login(TEST_B);
const img = new Blob([Buffer.from("UklGRiIAAABXRUJQVlA4IBYAAAAwAQCdASoBAAEADsD+JaQAA3AAAAAA", "base64")], { type: "image/webp" });
const id = crypto.randomUUID(), path = `${ua}/${id}-o.webp`;
ok("A upload in eigen map", !(await a.storage.from("closet").upload(path, img, { contentType: "image/webp" })).error);
ok("A voegt stuk toe", !(await a.from("items").insert({ id, data: { name: "test" }, photo_path: path })).error);
ok("B ziet A's stuk niet", ((await b.from("items").select("id").eq("id", id)).data ?? []).length === 0);
ok("B krijgt geen link naar A's foto", !(await b.storage.from("closet").createSignedUrls([path], 60)).data?.[0]?.signedUrl);
ok("B kan niet in A's map opladen", !!(await b.storage.from("closet").upload(`${ua}/x.webp`, img, { contentType: "image/webp" })).error);
ok("B kan A's stuk niet wissen", ((await b.from("items").delete().eq("id", id).select()).data ?? []).length === 0);
ok("SVG wordt geweigerd", !!(await b.storage.from("closet").upload(`${ub}/x.svg`, new Blob(["<svg onload=alert(1)>"], { type: "image/svg+xml" }), { contentType: "image/svg+xml" })).error);
ok("helperfuncties niet via /rpc", !!(await b.rpc("can_read", { owner: ua })).error);
const anon = createClient(URL, KEY, { auth: { persistSession: false } });
ok("niet ingelogd ziet niets", ((await anon.from("items").select("id")).data ?? []).length === 0);
ok("registreren zonder uitnodiging faalt", !!(await anon.auth.signUp({ email: "vreemd@garderobe.test", password: "EenLangWachtwoord-1" })).error);
await a.storage.from("closet").remove([path]);
await a.from("items").delete().eq("id", id);
process.exit(fails ? 1 : 0);
