// Alles wat de database leest of schrijft. Views roepen enkel deze functies aan.
import { S, render } from "./state";
import { BUCKET, sb } from "./supa";
import type { Item, Outfit } from "./types";
import { arr } from "./util";

const LISTS = new Set(["colors", "style", "season"]);
export const isList = (f: string) => LISTS.has(f);

interface Row { id: string; data: Record<string, unknown>; photo_path: string | null; cutout_path: string | null }
/** Velden die de app zelf toevoegt en nooit in `data` horen. */
const LOCAL = ["id", "photo", "photos", "paths", "cutout"];
/** Paden van de demo-kast: vaste bestanden in app/demo/, nooit in storage. */
export const isStatic = (p: string) => /^demo\/[\w-]+\.webp$/.test(p);

/** Laadt kast, maten en voorkeuren van de ingelogde gebruiker. Foto's via signed URL's van 1 uur. */
export async function load() {
  const [it, body, prefs, outfits, wears] = await Promise.all([
    sb.from("items").select("id,data,photo_path,cutout_path").eq("user_id", S.uid).eq("archived", false).order("created_at"),
    sb.from("bodies").select("data").eq("user_id", S.uid).maybeSingle(),
    sb.from("prefs").select("fav,hidden").eq("user_id", S.uid).maybeSingle(),
    sb.from("outfits").select("id,name,slots").eq("user_id", S.uid).order("created_at", { ascending: false }),
    sb.from("wears").select("item_id,worn_on").eq("user_id", S.uid).order("worn_on", { ascending: false }).limit(1000),
  ]);
  if (it.error) throw it.error;
  const rows = it.data as Row[];
  // Demo-foto's zijn statische bestanden naast de app; al de rest is privé en krijgt een signed URL.
  const paths = rows.flatMap((r) => [r.cutout_path, r.photo_path]).filter((p): p is string => !!p && !isStatic(p));
  const url = new Map<string, string>(rows.flatMap((r) => [r.cutout_path, r.photo_path]).filter((p): p is string => !!p && isStatic(p)).map((p) => [p, p]));
  if (paths.length) {
    const { data } = await sb.storage.from(BUCKET).createSignedUrls(paths, 3600);
    data?.forEach((d) => d.path && d.signedUrl && url.set(d.path, d.signedUrl));
  }
  S.items = rows.map((r) => {
    const p = [r.cutout_path, r.photo_path].filter((x): x is string => !!x);
    return { ...r.data, id: r.id, paths: p, cutout: r.cutout_path ? url.get(r.cutout_path) : undefined, photos: p.map((x) => url.get(x)!).filter(Boolean), photo: url.get(p[0] ?? "") } as Item;
  });
  S.body = (body.data?.data as typeof S.body) ?? {};
  S.prefs = { fav: prefs.data?.fav ?? [], hidden: prefs.data?.hidden ?? [] };
  S.outfits = (outfits.data ?? []) as Outfit[];
  S.lastWorn = {};
  for (const w of wears.data ?? []) S.lastWorn[w.item_id] ??= w.worn_on;
  S.loaded = true;
  render();
}

const dataOf = (it: Item) => Object.fromEntries(Object.entries(it).filter(([k]) => !LOCAL.includes(k)));

/** Foutmelding in gewone taal. */
export const why = (e: unknown) => {
  const m = String((e as { message?: string })?.message ?? "");
  return /row-level security|permission/i.test(m) ? "Je kunt deze kast alleen bekijken, niet wijzigen." : "Dat lukte niet. Controleer je verbinding en probeer opnieuw.";
};

export async function togglePref(key: "fav" | "hidden", id: string) {
  const cur = new Set(S.prefs[key]);
  cur.has(id) ? cur.delete(id) : cur.add(id);
  S.prefs = { ...S.prefs, [key]: [...cur] };
  render();
  await sb.from("prefs").upsert({ user_id: S.uid, ...S.prefs });
}

export async function saveItem(it: Item, patch: Record<string, unknown>) {
  patch.missing = arr(it.missing).filter((k) => !(k in patch) || patch[k] === "" || (Array.isArray(patch[k]) && !(patch[k] as unknown[]).length));
  const { error } = await sb.from("items").update({ data: { ...dataOf(it), ...patch } }).eq("id", it.id);
  if (error) throw error;
  Object.assign(it, patch);
  render();
}

/** Verwijdert een stuk en zijn foto's. */
export async function deleteItem(it: Item) {
  const { error } = await sb.from("items").delete().eq("id", it.id);
  if (error) throw error;
  const own = (it.paths ?? []).filter((p) => !isStatic(p));
  if (own.length) await sb.storage.from(BUCKET).remove(own);
  S.items = S.items.filter((x) => x.id !== it.id);
  render();
}

export async function saveBody(d: Record<string, unknown>) {
  const { error } = await sb.from("bodies").upsert({ user_id: S.uid, data: { ...d, measuredAt: new Date().toISOString() } });
  if (error) throw error;
  S.body = d;
  render();
}

/** Alle gegevens als één JSON-bestand (recht op inzage). */
export function exportAll() {
  const data = JSON.stringify({ exported: new Date().toISOString(), items: S.items.map(dataOf), body: S.body, lookbook: S.prefs }, null, 2);
  const a = Object.assign(document.createElement("a"), { href: URL.createObjectURL(new Blob([data], { type: "application/json" })), download: `garderobe-${S.person.key}.json` });
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

/** Wist alles van deze gebruiker: rijen, foto's en het account zelf (recht op vergetelheid). */
export async function wipeAll(account: boolean) {
  for (const t of ["wears", "outfits", "items", "bodies", "prefs"]) {
    const { error } = await sb.from(t).delete().eq("user_id", S.uid);
    if (error) throw error;
  }
  const { data } = await sb.storage.from(BUCKET).list(S.uid, { limit: 1000 });
  if (data?.length) await sb.storage.from(BUCKET).remove(data.map((f) => `${S.uid}/${f.name}`));
  if (account) {
    const { error } = await sb.rpc("delete_my_account");
    if (error) throw error;
    await sb.auth.signOut();
    location.reload();
  }
  await load();
}

export async function saveOutfit(name: string, slots: Record<string, string>) {
  const { data, error } = await sb.from("outfits").insert({ name, slots }).select("id,name,slots").single();
  if (error) throw error;
  S.outfits = [data as Outfit, ...S.outfits];
  render();
  return data as Outfit;
}

export async function deleteOutfit(id: string) {
  const { error } = await sb.from("outfits").delete().eq("id", id);
  if (error) throw error;
  S.outfits = S.outfits.filter((o) => o.id !== id);
  render();
}

/** "Vandaag gedragen": één rij per stuk, zodat laatst gedragen en prijs per keer kloppen. */
export async function wearToday(itemIds: string[], outfitId?: string) {
  const today = new Date().toISOString().slice(0, 10);
  const { error } = await sb.from("wears").insert(itemIds.map((item_id) => ({ item_id, outfit_id: outfitId ?? null, worn_on: today })));
  if (error) throw error;
  for (const id of itemIds) S.lastWorn[id] = today;
  render();
}
