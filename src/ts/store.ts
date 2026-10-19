// Alles wat de database leest of schrijft. Views roepen enkel deze functies aan.
import { S, render } from "./state";
import type { Item, Prefs, Question } from "./types";
import { arr } from "./util";

const now = () => new Date().toISOString();
const LISTS = new Set(["colors", "style", "season"]);
export const isList = (f: string) => LISTS.has(f);

export async function connect() {
  const c = window.claude;
  if (!c) { S.canWrite = false; S.loaded = true; render(); return; }
  const [db, user, assets, downloads] = await Promise.all([c.use("db"), c.use("user"), c.use("assets"), c.use("downloads")]);
  S.db = db; S.assets = assets; S.downloads = downloads;
  if (!db) { S.loaded = true; render(); return; }
  if (user && (await user.can("data.write")) === false) S.canWrite = false;
  const docs = <T>(s: { docs: { id: string; data(): unknown }[] }) => s.docs.map((d) => ({ id: d.id, ...(d.data() as object) }) as T);
  db.collection("items").onSnapshot((s) => { S.items = docs<Item>(s); S.loaded = true; render(); }, () => {});
  db.collection("questions").onSnapshot((s) => { S.qs = docs<Question>(s); render(); }, () => {});
  db.doc("meta/body").onSnapshot((s) => { S.body = s.exists ? s.data()! : {}; render(); }, () => {});
  db.doc("meta/state").onSnapshot((s) => { S.meta = s.exists ? s.data()! : null; render(); }, () => {});
  db.doc("meta/lookbook").onSnapshot((s) => {
    const d = s.exists ? (s.data() as Partial<Prefs>) : {};
    S.prefs = { fav: d.fav ?? [], hidden: d.hidden ?? [] };
    render();
  }, () => {});
}

/** Foutmelding in gewone taal. */
export const why = (e: unknown) =>
  (e as { code?: string })?.code === "invalid_argument" || (e as { code?: string })?.code === "permission_denied"
    ? "Je kunt deze pagina alleen bekijken, niet wijzigen." : "Dat lukte niet. Probeer het opnieuw.";

export async function togglePref(key: keyof Prefs, id: string) {
  const cur = new Set(S.prefs[key]);
  cur.has(id) ? cur.delete(id) : cur.add(id);
  S.prefs = { ...S.prefs, [key]: [...cur] };
  render();
  await S.db?.doc("meta/lookbook").set({ ...S.prefs });
}

export async function saveItem(it: Item, patch: Record<string, unknown>) {
  patch.missing = arr(it.missing).filter((k) => !(k in patch) || patch[k] === "" || (Array.isArray(patch[k]) && !(patch[k] as unknown[]).length));
  patch.editedAt = now();
  await S.db!.doc("items/" + it.id).update(patch);
  for (const q of S.qs.filter((q) => q.itemId === it.id && q.status === "open" && q.field in patch)) {
    const v = patch[q.field];
    await S.db!.doc("questions/" + q.id).update({ status: "answered", answer: Array.isArray(v) ? v.join(", ") : v, answeredAt: now(), via: "edit" });
  }
}

export async function answer(q: Question, val: string | null) {
  await S.db!.doc("questions/" + q.id).update({ status: val == null ? "skipped" : "answered", answer: val ?? "", answeredAt: now() });
  const it = S.items.find((i) => i.id === q.itemId);
  if (val != null && it) {
    await S.db!.doc("items/" + it.id).update({ [q.field]: isList(q.field) ? arr(val) : val, missing: arr(it.missing).filter((k) => k !== q.field) });
  }
}

const blobId = (url: string) => url.match(/\/_blob\/([0-9a-f]{32})/)?.[1];

/** Verwijdert een stuk, zijn vragen en zijn foto's. De avondscan voegt het niet opnieuw toe:
 * de bestandsnamen blijven in meta/state als verwerkt staan. */
export async function deleteItem(it: Item) {
  const db = S.db!;
  for (const q of S.qs.filter((q) => q.itemId === it.id)) await db.doc("questions/" + q.id).delete();
  await db.doc("items/" + it.id).delete();
  for (const u of new Set([it.photo ?? "", ...(it.photos ?? [])])) {
    const id = blobId(u);
    if (id && S.assets) await S.assets.delete(id).catch(() => {});
  }
}

export async function saveBody(d: Record<string, unknown>) {
  await S.db!.doc("meta/body").set({ ...d, measuredAt: now() });
}

/** Alle gegevens van deze pagina als één JSON-bestand (recht op inzage). */
export async function exportAll() {
  const data = JSON.stringify({ exported: now(), items: S.items, questions: S.qs, body: S.body, lookbook: S.prefs, scan: S.meta }, null, 2);
  if (!S.downloads) throw new Error("no downloads");
  await S.downloads.save({ filename: `garderobe-${S.person.key}.json`, data });
}

/** Wist alles: stukken, vragen, maten, favorieten, scanstatus en alle foto's (recht op vergetelheid). */
export async function wipeAll() {
  const db = S.db!;
  for (const q of S.qs) await db.doc("questions/" + q.id).delete();
  for (const it of S.items) await db.doc("items/" + it.id).delete();
  for (const p of ["meta/body", "meta/lookbook", "meta/state"]) await db.doc(p).delete();
  if (S.assets) {
    const { assets } = await S.assets.list();
    for (const a of assets) await S.assets.delete(a.id).catch(() => {});
  }
}
