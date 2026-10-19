// Lookbooklogica die meerdere views delen: foto uit de sprite, prijs, jouw maat en "heb je al".
import { S } from "./state";
import { shiftSize } from "./sizes/shared";
import type { Item, LookItem } from "./types";
import { RATE, arr, esc, eur } from "./util";

let index: Record<string, LookItem> | null = null;
export const byId = (id: string) => (index ??= Object.fromEntries(S.look.items.map((x) => [x.id, x])))[id];

export const brand = (x: LookItem) => x.b ?? x.s;
export const euro = (x: LookItem) => (x.p == null ? 0 : x.cur === "¥" ? x.p * RATE : x.p);

/** De foto als uitsnede uit een sprite sheet; de cel bepaalt de verhouding. */
export function sprite(x: LookItem, cls = "c-card__img") {
  const [c, r, ratio] = S.look.sheets[x.sh]!;
  const col = x.k % c, row = Math.floor(x.k / c);
  const pos = `${c > 1 ? (col * 100) / (c - 1) : 0}% ${r > 1 ? (row * 100) / (r - 1) : 0}%`;
  return `<span class="${cls}" role="img" aria-label="${esc(brand(x) + ": " + x.d)}" style="aspect-ratio:${ratio};background-image:url(sheets/${x.sh}.jpg);background-size:${c * 100}% ${r * 100}%;background-position:${pos}"></span>`;
}

export function price(x: LookItem) {
  if (x.p == null) return `Prijs op aanvraag`;
  return x.cur === "¥" ? `¥${x.p}<small>ca. ${eur(x.p * RATE)}</small>` : eur(x.p);
}

/** null: geen maat voor dit hoofdstuk. "": nog niet gemeten. */
export function mySize(x: LookItem): string | null {
  const kind = S.person.chapterMap[x.c]?.kind;
  if (!kind) return null;
  const a = S.person.sizes.advice(S.body).find((r) => r[3] === kind);
  if (!a) return "";
  const fit = S.body.brandFit?.[brand(x)];
  return fit === "klein" ? shiftSize(a[1], 1) : fit === "groot" ? shiftSize(a[1], -1) : a[1];
}

/** Een stuk uit je kleerkast in dezelfde categorie met een overlappende kleur. */
export function haveOf(x: LookItem): Item | undefined {
  const cats = S.person.chapterMap[x.c]?.cats ?? [];
  return S.items.find((i) => cats.includes(i.category ?? "") && arr(i.colors).some((c) => x.col.includes(c)));
}

export const itemName = (i: Item) => i.name || i.brand || "stuk";
