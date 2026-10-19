// De looks (stijlrichtingen) als lijst, en elke look als volledige outfit in één spread.
import { byId, brand, euro, haveOf, itemName, mySize, sprite } from "../look";
import { S } from "../state";
import type { LookItem } from "../types";
import { RATE, esc, eur, two } from "../util";
import { openDialog } from "./dialog";

const pieces = (i: number) => S.look.dirs[i]!.p.map(byId).filter((x): x is LookItem => !!x);
const pal = (c: string[]) => `<div class="c-look__pal" aria-hidden="true">${c.map((h) => `<span style="background:${h}"></span>`).join("")}</div>`;
const total = (ps: LookItem[]) => ps.reduce((a, x) => a + euro(x), 0);
const priceText = (x: LookItem) => (x.p == null ? "prijs op aanvraag" : x.cur === "¥" ? `¥${x.p}, ca. ${eur(x.p * RATE)}` : eur(x.p));

export function looksHtml() {
  return `<div class="c-looks__head"><h2 class="c-looks__title" id="looks-t">De <em>looks.</em></h2><span class="c-chapter__count">${S.look.dirs.length} outfits uit dit lookbook</span></div>` +
    S.look.dirs.map((d, i) => {
      const ps = pieces(i);
      return `<article class="c-look" aria-labelledby="look-${i}">
  <div class="c-look__num" aria-hidden="true">${two(i + 1)}</div>
  <div><h3 class="c-look__name" id="look-${i}">${esc(d.n)}</h3><p class="c-look__when">${esc(d.when)}</p>${pal(d.pal)}
    <p class="c-look__have">${ps.filter(haveOf).length} van ${ps.length} al in je kast · samen ca. ${eur(total(ps))}</p></div>
  <button type="button" class="c-look__strip" data-look="${i}" tabindex="-1" aria-hidden="true">${ps.map((x) => `<span class="c-look__thumb">${sprite(x)}</span>`).join("")}</button>
  <button type="button" class="c-btn" data-look="${i}">Bekijk look ${two(i + 1)}</button>
</article>`;
    }).join("");
}

export function openOutfit(i: number) {
  const n = S.look.dirs.length, d = S.look.dirs[i]!, ps = pieces(i);
  const yuan = ps.some((x) => x.cur === "¥");
  const piece = (x: LookItem, j: number) => {
    const h = haveOf(x), m = mySize(x);
    const extra = h ? `Heb je al: ${esc(itemName(h))}` : m ? `Jouw maat: ${esc(m)}` : m === "" ? "Jouw maat: nog meten" : "";
    return `<figure class="c-outfit__piece"><a href="${esc(x.u)}" target="_blank" rel="noopener noreferrer" tabindex="-1" aria-hidden="true">${sprite(x)}</a>
  <figcaption><b>${two(j + 1)}</b><a href="${esc(x.u)}" target="_blank" rel="noopener noreferrer">${esc(brand(x))}, ${esc(x.d)}<span class="u-sr-only"> (opent in een nieuw tabblad)</span></a>
  <span>${esc(priceText(x))}${x.b && x.b !== x.s ? ` · via ${esc(x.s)}` : ""}${extra ? " · " + extra : ""}</span></figcaption></figure>`;
  };
  openDialog(`<div class="c-outfit">
  <div>
    <div class="c-outfit__num" aria-hidden="true">${two(i + 1)}</div>
    <h2 class="c-outfit__title">${esc(d.n)}</h2>
    <p class="c-look__when">${esc(d.when)}</p>
    <p class="c-outfit__vibe">${esc(d.v)}</p>
    ${pal(d.pal)}
    <dl class="c-outfit__sum">
      <div><dt>Stukken</dt><dd>${ps.length}</dd></div>
      <div><dt>Al in je kast</dt><dd>${ps.filter(haveOf).length}</dd></div>
      <div><dt>Samen ongeveer</dt><dd>${eur(total(ps))}</dd></div>
    </dl>
    ${yuan ? `<p class="c-outfit__vibe">Yuanprijzen zijn omgerekend aan de middenkoers, zonder verzending, agentkosten, invoerrechten en btw.</p>` : ""}
    <div class="c-outfit__nav">
      <button type="button" class="c-btn c-btn--ghost" data-look="${(i + n - 1) % n}">Vorige look</button>
      <button type="button" class="c-btn c-btn--ghost" data-look="${(i + 1) % n}">Volgende look</button>
    </div>
  </div>
  <div class="c-outfit__grid">${ps.map(piece).join("")}</div>
</div>`, `Look ${two(i + 1)}: ${d.n}`);
}

document.addEventListener("click", (e) => {
  const b = (e.target as HTMLElement).closest<HTMLElement>("[data-look]");
  if (b) openOutfit(+b.dataset.look!);
});
