// Lookbook: hero, de looks, filters en de hoofdstukken met stukken.
import { brand, euro, haveOf, itemName, mySize, price, sprite } from "../look";
import { S } from "../state";
import { togglePref } from "../store";
import type { LookItem } from "../types";
import { ROMAN, esc, two } from "../util";
import { looksHtml } from "./looks";
import type { View } from "./shell";

const open = new Set<string>(); // hoofdstukken die volledig getoond worden
const FIRST = 10; // ponytail: vaste kop per hoofdstuk, paginering als 10 te weinig blijkt
const st = { q: "", shop: "", sort: "", ch: "", f: "all" as "all" | "fav" | "pin" | "hidden" };
const $ = (id: string) => document.getElementById(id)!;

const FILTERS: [typeof st.f, string][] = [["all", "Alles"], ["fav", "Favorieten"], ["pin", "Pinterest-matches"], ["hidden", "Verwijderd"]];

function filtered(): LookItem[] {
  const q = st.q.trim().toLowerCase(), fav = new Set(S.prefs.fav), hid = new Set(S.prefs.hidden);
  const L = S.look.items.filter((x) =>
    (st.f === "hidden" ? hid.has(x.id) : !hid.has(x.id)) &&
    (st.f !== "fav" || fav.has(x.id)) &&
    (st.f !== "pin" || !!x.pin) &&
    (!st.shop || x.s === st.shop) &&
    (!q || `${brand(x)} ${x.s} ${x.d} ${x.c} ${x.col.join(" ")}`.toLowerCase().includes(q)));
  if (st.sort) L.sort((a, b) => (a.p == null ? 1 : 0) - (b.p == null ? 1 : 0) || (st.sort === "lo" ? 1 : -1) * (euro(a) - euro(b)));
  return L;
}

function card(x: LookItem, n: number) {
  const m = mySize(x), h = haveOf(x), fav = S.prefs.fav.includes(x.id), hid = S.prefs.hidden.includes(x.id);
  const label = esc(`${brand(x)} ${x.d}`);
  const size = m ? `Jouw maat: <b>${esc(m)}</b>` : m === "" ? `Jouw maat: <a href="#maten">nog meten</a>` : "";
  return `<article class="c-card">
  <a class="c-card__media" href="${esc(x.u)}" target="_blank" rel="noopener noreferrer" tabindex="-1" aria-hidden="true">${sprite(x)}<span class="c-card__no">${two(n)}</span></a>
  <div class="c-card__head"><span class="c-card__shop">${esc(brand(x))}</span><span class="c-card__price">${price(x)}</span></div>
  <h3 class="c-card__title"><a href="${esc(x.u)}" target="_blank" rel="noopener noreferrer">${esc(x.d)}<span class="u-sr-only"> van ${esc(brand(x))}, opent ${esc(x.s)} in een nieuw tabblad</span></a></h3>
  <p class="c-card__meta">${x.b && x.b !== x.s ? `via ${esc(x.s)}${size ? " · " : ""}` : ""}${size}</p>
  <div>${h ? `<a class="c-tag" href="#kast">Heb je al: ${esc(itemName(h))}</a>` : ""}${x.pin ? `<a class="c-tag c-tag--accent" href="${esc(x.pin)}" target="_blank" rel="noopener noreferrer">Pinterest-match</a>` : ""}</div>
  ${S.online ? `<div class="c-card__actions">
    <button type="button" class="c-link-btn" data-fav="${esc(x.id)}" aria-pressed="${fav}" aria-label="Favoriet: ${label}">${fav ? "Favoriet" : "Bewaar"}</button>
    <button type="button" class="c-link-btn" data-hide="${esc(x.id)}" aria-label="${hid ? "Terugzetten" : "Verwijder uit lookbook"}: ${label}">${hid ? "Terugzetten" : "Verwijder"}</button>
  </div>` : ""}
</article>`;
}

export const lookbook: View = {
  title: "Lookbook",
  mount(el) {
    const p = S.person, shops = [...new Set(S.look.items.map((x) => x.s))].sort();
    el.innerHTML = `
<section class="c-hero">
  <div><p class="c-hero__kicker">Wat je wilt · ${esc(p.issue)}</p><h1 class="c-hero__title">Look<em>book.</em></h1></div>
  <div><p class="c-hero__theme">${esc(p.theme)}</p><p class="c-hero__dek">${esc(p.dek)}</p><div class="c-hero__facts" id="lfacts"></div></div>
</section>
<section class="c-looks" id="looks" aria-labelledby="looks-t"></section>
<div class="c-toolbar" role="search">
  <label class="c-toolbar__field c-toolbar__field--grow"><span>Zoek</span><input type="search" id="lq" placeholder="Merk, stuk of kleur" value="${esc(st.q)}"></label>
  <label class="c-toolbar__field"><span>Winkel</span><select id="lshop"><option value="">Alle winkels</option>${shops.map((s) => `<option${s === st.shop ? " selected" : ""}>${esc(s)}</option>`).join("")}</select></label>
  <label class="c-toolbar__field"><span>Sorteer</span><select id="lsort"><option value="">Eigen volgorde</option><option value="lo">Prijs, laag naar hoog</option><option value="hi">Prijs, hoog naar laag</option></select></label>
  <div class="c-toolbar__seg" role="group" aria-label="Tonen">${FILTERS.filter(([f]) => S.online || f === "all" || f === "pin").map(([f, l]) => `<button type="button" class="c-link-btn" data-lf="${f}">${l}</button>`).join("")}</div>
  <span class="c-toolbar__count" id="lcount" aria-live="polite"></span>
</div>
<nav class="c-toc" id="ltoc" aria-label="Hoofdstukken"></nav>
<div id="lbook"></div>`;
    ($("lsort") as HTMLSelectElement).value = st.sort;
    $("lq").addEventListener("input", (e) => { st.q = (e.target as HTMLInputElement).value; lookbook.update(); });
    $("lshop").addEventListener("change", (e) => { st.shop = (e.target as HTMLSelectElement).value; lookbook.update(); });
    $("lsort").addEventListener("change", (e) => { st.sort = (e.target as HTMLSelectElement).value; lookbook.update(); });
  },
  update() {
    if (!document.getElementById("lbook")) return;
    const L = filtered(), all = S.look.items;
    const busy = st.q || st.shop || st.ch || st.f !== "all";
    $("lfacts").innerHTML = [[all.length, "stuks"], [new Set(all.map((x) => x.s)).size, "winkels"], [S.look.dirs.length, "looks"], ...(S.online || S.unlocked ? [[all.filter(haveOf).length, "heb je al"]] : [])]
      .map(([n, l]) => `<span class="c-hero__fact"><b>${n}</b>${l}</span>`).join("");
    const looks = $("looks");
    looks.hidden = !!busy;
    if (!busy) looks.innerHTML = looksHtml();
    document.querySelectorAll<HTMLElement>("[data-lf]").forEach((b) => {
      b.setAttribute("aria-pressed", String(b.dataset.lf === st.f));
      if (b.dataset.lf === "hidden") b.textContent = `Verwijderd (${S.prefs.hidden.length})`;
      if (b.dataset.lf === "fav") b.textContent = `Favorieten (${S.prefs.fav.length})`;
    });
    const chs = S.look.chapters.filter(([c]) => L.some((x) => x.c === c));
    if (st.ch && !chs.some(([c]) => c === st.ch)) st.ch = "";
    $("ltoc").innerHTML = [["", "Alle hoofdstukken"], ...chs.map(([c], i) => [c, `<span>${ROMAN[S.look.chapters.findIndex((h) => h[0] === c)] ?? i + 1}</span> ${esc(c)}`])]
      .map(([v, l]) => `<button type="button" class="c-link-btn" data-lch="${esc(v!)}" aria-pressed="${st.ch === v}">${l}</button>`).join("");
    const V = L.filter((x) => !st.ch || x.c === st.ch);
    $("lcount").textContent = `${V.length} stuks`;
    const html = S.look.chapters.map(([c, note], ci) => {
      const g = V.filter((x) => x.c === c);
      if (!g.length) return "";
      return `<section class="c-chapter o-split" aria-labelledby="ch-${ci}">
  <div class="o-split__aside"><div class="c-chapter__num" aria-hidden="true">${ROMAN[ci]}</div><h2 class="c-chapter__title" id="ch-${ci}">${esc(c)}</h2><p class="c-chapter__note">${esc(note)}</p><p class="c-chapter__count">${g.length} stuks</p></div>
  <div><div class="o-grid">${(open.has(c) || st.ch === c ? g : g.slice(0, FIRST)).map((x, i) => card(x, i + 1)).join("")}</div>
  ${g.length > FIRST && !open.has(c) && st.ch !== c ? `<button type="button" class="c-btn c-btn--ghost c-chapter__more" data-more="${esc(c)}">Toon alle ${g.length} stuks</button>` : ""}</div>
</section>`;
    }).join("");
    $("lbook").innerHTML = html || `<p class="c-empty">${st.f === "fav" ? "Nog geen favorieten. Kies Bewaar bij een stuk." : st.f === "hidden" ? "Niets verwijderd." : "Niets gevonden. Wis de zoekterm of kies een andere winkel."}</p>`;
  },
};

document.addEventListener("click", (e) => {
  const t = e.target as HTMLElement;
  const f = t.closest<HTMLElement>("[data-lf]");
  if (f) { st.f = f.dataset.lf as typeof st.f; lookbook.update(); return; }
  const m = t.closest<HTMLElement>("[data-more]");
  if (m) { open.add(m.dataset.more!); lookbook.update(); return; }
  const c = t.closest<HTMLElement>("[data-lch]");
  if (c) { st.ch = c.dataset.lch!; lookbook.update(); return; }
  const fav = t.closest<HTMLElement>("[data-fav]");
  if (fav) { togglePref("fav", fav.dataset.fav!); return; }
  const hide = t.closest<HTMLElement>("[data-hide]");
  if (hide) togglePref("hidden", hide.dataset.hide!);
});
