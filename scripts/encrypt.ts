// Versleutelt private/<persoon>.json naar vault/<persoon>.bin met het wachtwoord uit .env.
// Alleen de .bin-bestanden gaan naar GitHub; .env en private/ staan in .gitignore.
// Formaat: salt (16 bytes) | iv (12 bytes) | AES-256-GCM ciphertext. Sleutel: PBKDF2-SHA256.
import { readFileSync, writeFileSync } from "node:fs";
import { webcrypto as c } from "node:crypto";

export const ITER = 600_000;
const env = Object.fromEntries(readFileSync(".env", "utf8").split("\n").filter(Boolean).map((l) => l.split(/=(.*)/s).slice(0, 2)));

export async function key(pw: string, salt: Uint8Array) {
  const base = await c.subtle.importKey("raw", new TextEncoder().encode(pw), "PBKDF2", false, ["deriveKey"]);
  return c.subtle.deriveKey({ name: "PBKDF2", salt, iterations: ITER, hash: "SHA-256" }, base, { name: "AES-GCM", length: 256 }, false, ["encrypt", "decrypt"]);
}

for (const who of ["darko", "lana"]) {
  const pw = env[`${who.toUpperCase()}_PASSWORD`];
  if (!pw) throw new Error(`${who.toUpperCase()}_PASSWORD ontbreekt in .env`);
  const salt = c.getRandomValues(new Uint8Array(16)), iv = c.getRandomValues(new Uint8Array(12));
  const k = await key(pw, salt);
  const ct = new Uint8Array(await c.subtle.encrypt({ name: "AES-GCM", iv }, k, readFileSync(`private/${who}.json`)));
  writeFileSync(`vault/${who}.bin`, Buffer.concat([salt, iv, ct]));
  // Controle: terug ontsleutelen moet hetzelfde geven, een fout wachtwoord moet falen.
  const back = new TextDecoder().decode(await c.subtle.decrypt({ name: "AES-GCM", iv }, k, ct));
  if (back !== readFileSync(`private/${who}.json`, "utf8")) throw new Error("controle mislukt");
  const bad = await c.subtle.decrypt({ name: "AES-GCM", iv }, await key(pw + "x", salt), ct).then(() => true, () => false);
  if (bad) throw new Error("fout wachtwoord ontsleutelde toch");
  console.log(`vault/${who}.bin`, ct.length, "bytes");
}
