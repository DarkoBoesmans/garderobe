// Gedeelde maatlogica voor heren en dames.
import type { Advice, Body } from "../types";

export type Band = [number, number, string | number][];
export const LETTERS = ["XS", "S", "M", "L", "XL", "XXL", "3XL", "4XL"];

export const num = (b: Body, k: string) => Number(b[k]) || 0;

export function band(v: number, rows: Band) {
  for (const [lo, hi, l] of rows) if (v >= lo && v < hi) return { l, edge: v - lo < 1 ? "onder" : hi - v <= 1 ? "boven" : "" };
  return null;
}

/** Lettermaat met een waarschuwing als je op de grens zit. */
export function letter(v: number, rows: Band, tight: string) {
  const b = band(v, rows);
  if (!b) return null;
  const l = String(b.l);
  const i = LETTERS.indexOf(l);
  const next = LETTERS[i + 1] ?? l, prev = LETTERS[i - 1] ?? l;
  const note = b.edge === "boven" ? `Net onder ${next}: ${l} voor ${tight}, ${next} voor ruim.`
    : b.edge === "onder" ? `Net boven ${prev}: ${l} zit ruim, ${prev} ${tight}.` : "";
  return { size: l, note };
}

export const footEU = (foot: number, room: number) => Math.round((foot + room) * 1.5 * 2) / 2;

/** Schuift een maat op als een merk klein (+1) of groot (-1) valt. */
export function shiftSize(sz: string, dir: number): string {
  if (!dir) return sz;
  return sz
    .replace(/EU (\d+(?:\.5)?)/, (_, n) => "EU " + (+n + dir * 0.5))
    .replace(/^W(\d+)/, (_, n) => "W" + (+n + dir))
    .replace(/^(\d{2})$/, (_, n) => String(+n + dir * 2))
    .replace(/\b(4XL|3XL|XXL|XL|XS|L|M|S)\b/, (m) => LETTERS[Math.min(LETTERS.length - 1, Math.max(0, LETTERS.indexOf(m) + dir))]!);
}

export function footAdvice(b: Body, room: number, extra: string): Advice | null {
  const f = Math.max(num(b, "footL"), num(b, "footR"));
  if (!f) return null;
  const w = Math.max(num(b, "footWL"), num(b, "footWR"));
  const wide = w && w / f >= 0.38 ? ` Brede voet (${w} cm): kies wide fit of een halve maat groter.` : "";
  return ["Schoenen en sneakers", `EU ${footEU(f, room)}`, `Langste voet ${f} cm (+${String(room).replace(".", ",")} cm ruimte).${wide} ${extra}`, "schoen"];
}

export const FEET: [string, string, string, string][] = [
  ["footL", "Voet links, lengte", "cm", "Hiel tegen de muur op papier, streep aan je langste teen."],
  ["footR", "Voet rechts, lengte", "cm", "Zelfde als links; de langste voet telt."],
  ["footWL", "Voet links, breedte", "cm", "Breedste deel van de voorvoet."],
  ["footWR", "Voet rechts, breedte", "cm", "Zelfde als links."],
  ["head", "Hoofd", "cm", "Rond je hoofd, 1 cm boven je wenkbrauwen en oren."],
];
