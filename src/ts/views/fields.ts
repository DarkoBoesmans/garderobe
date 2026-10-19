// Velden van een kleerkaststuk en de keuzes die we voorstellen.
import { S } from "../state";
import type { Item } from "../types";
import { arr } from "../util";

export const FIELDS: [string, string][] = [
  ["name", "Stuk"], ["brand", "Merk"], ["category", "Categorie"], ["type", "Type"], ["colors", "Kleuren"], ["style", "Stijl"],
  ["size", "Maat"], ["fit", "Pasvorm"], ["material", "Materiaal"], ["pattern", "Patroon"], ["season", "Seizoen"],
  ["condition", "Staat"], ["details", "Details"], ["notes", "Notities"],
];
export const fieldLabel = (f: string) => FIELDS.find((x) => x[0] === f)?.[1] ?? f;

export const OPTS: Record<string, string[]> = {
  fit: ["slim", "regular", "relaxed", "oversized"],
  condition: ["nieuw", "goed", "gedragen", "versleten"],
  season: ["lente", "zomer", "herfst", "winter"],
  colors: ["zwart", "wit", "grijs", "antraciet", "navy", "blauw", "lichtblauw", "denim", "beige", "crème", "camel", "zand", "taupe", "bruin", "kaki", "olijf", "groen", "turquoise", "rood", "bordeaux", "oranje", "geel", "roze", "paars"],
  size: ["XS", "S", "M", "L", "XL", "XXL"],
  pattern: ["effen", "strepen", "ruit", "print", "gemêleerd", "camo"],
};
export const CLOSED = new Set(["category", "fit", "condition"]);
const FOOT = new Set(["Schoenen", "Sneakers", "Sport & outdoor"]);

/** Bestaande waarden van een veld, meest gebruikt eerst: zo blijft de spelling overal gelijk. */
export function known(f: string, cat?: string) {
  const n: Record<string, number> = {};
  S.items.forEach((i) => {
    if (cat === "*kleding" ? FOOT.has(i.category ?? "") : cat && i.category !== cat) return;
    arr(i[f]).forEach((v) => (n[v] = (n[v] ?? 0) + 1));
  });
  return Object.keys(n).sort((a, b) => n[b]! - n[a]!);
}

export const missingOf = (it: Item) => arr(it.missing).filter((f) => !arr(it[f]).length);
export const photosOf = (it: Item) => [...new Set([...(it.photos ?? []), it.photo ?? ""])].filter(Boolean);
export const catRank = (c?: string) => { const i = S.person.categories.indexOf(c ?? ""); return i < 0 ? 99 : i; };

/** Maat volgens de Maten-pagina voor een categorie, zodat suggesties overal gelijk zijn. */
export function bodySizeFor(cat?: string) {
  const kind = Object.keys(S.person.sizes.kind).find((k) => S.person.sizes.kind[k]!.includes(cat ?? ""));
  const a = S.person.sizes.advice(S.body).find((r) => r[3] === kind);
  return a ? a[1].split(" / ").pop()! : null;
}

export const isFoot = (cat?: string) => FOOT.has(cat ?? "");
