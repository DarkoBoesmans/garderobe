// Ontgrendelt de versleutelde kleerkast op GitHub Pages. Zelfde formaat als scripts/encrypt.ts.
import { S } from "./state";
import type { Body, Item } from "./types";

const ITER = 600_000;

export async function unlock(pw: string) {
  const buf = new Uint8Array(await (await fetch("vault.bin")).arrayBuffer());
  const salt = buf.slice(0, 16), iv = buf.slice(16, 28), ct = buf.slice(28);
  const base = await crypto.subtle.importKey("raw", new TextEncoder().encode(pw), "PBKDF2", false, ["deriveKey"]);
  const key = await crypto.subtle.deriveKey({ name: "PBKDF2", salt, iterations: ITER, hash: "SHA-256" }, base, { name: "AES-GCM", length: 256 }, false, ["decrypt"]);
  // Fout wachtwoord: AES-GCM weigert, dus dit gooit een fout.
  const data = JSON.parse(new TextDecoder().decode(await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, ct))) as { items: Item[]; body: Body };
  S.items = data.items;
  S.body = data.body;
  S.unlocked = true;
}
