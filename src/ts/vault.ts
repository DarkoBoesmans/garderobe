// Eenmalige import van de oude, versleutelde kleerkast (vault/darko.bin) naar Supabase.
// ponytail: alleen voor de overstap; na de import gaan dit bestand en de vault weg.
import { S } from "./state";
import { load } from "./store";
import { BUCKET, sb } from "./supa";
import type { Body, Item } from "./types";

async function decrypt(pw: string) {
  const buf = new Uint8Array(await (await fetch(`vault/${S.person.key}.bin`)).arrayBuffer());
  const base = await crypto.subtle.importKey("raw", new TextEncoder().encode(pw), "PBKDF2", false, ["deriveKey"]);
  const key = await crypto.subtle.deriveKey({ name: "PBKDF2", salt: buf.slice(0, 16), iterations: 600_000, hash: "SHA-256" }, base, { name: "AES-GCM", length: 256 }, false, ["decrypt"]);
  return JSON.parse(new TextDecoder().decode(await crypto.subtle.decrypt({ name: "AES-GCM", iv: buf.slice(16, 28) }, key, buf.slice(28)))) as { items: Item[]; body: Body };
}

export async function importVault(pw: string, progress: (t: string) => void) {
  const old = await decrypt(pw); // fout wachtwoord: gooit
  let n = 0;
  for (const it of old.items) {
    progress(`Stuk ${++n} van ${old.items.length}…`);
    const { id: _id, photo, photos, file: _f, files: _fs, ...data } = it;
    const path = `${S.uid}/${crypto.randomUUID()}.jpg`;
    const src = (photos?.[0] ?? photo) as string | undefined;
    if (src) {
      // data:-URL zelf omzetten: fetch() op data: valt buiten de CSP.
      const bin = Uint8Array.from(atob(src.split(",")[1]!), (c) => c.charCodeAt(0));
      const up = await sb.storage.from(BUCKET).upload(path, new Blob([bin], { type: "image/jpeg" }), { contentType: "image/jpeg" });
      if (up.error) throw up.error;
    }
    const { error } = await sb.from("items").insert({ data, photo_path: src ? path : null });
    if (error) throw error;
  }
  const { measuredAt: _m, ...body } = old.body as Record<string, unknown>;
  await sb.from("bodies").upsert({ user_id: S.uid, data: body });
  await load();
}
