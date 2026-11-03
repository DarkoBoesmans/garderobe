// Outfitbord: uitsneden op papier in vakken. Tik een vak, kies een stuk. Met "Verras me" en "Vandaag gedragen".
import { byId, brand, haveOf, mySize, sprite } from "../look";
import { S } from "../state";
import { deleteOutfit, saveOutfit, wearToday, why } from "../store";
import type { Item, LookItem } from "../types";
import { esc } from "../util";
import type { View } from "./shell";

/** Hoe lang een stuk na dragen even niet voorgesteld wordt (dagen), zoals in Closet. */
const REST: Record<string, number> = { Top: 5, Onder: 3 };
const st = { active: "Top", slots: {} as Record<string, string>, missing: [] as LookItem[], from: "", confirm: "" };
const $ = (id: string) => document.getElementById(id)!;

const img = (it: Item) => it.cutout ?? it.photo ?? "";
const slotOf = (it: Item) => S.person.slots.find(([, cats]) => cats.includes(it.category ?? ""))?.[0];
const daysAgo = (d?: string) => (d ? Math.round((Date.now() - +new Date(d)) / 864e5) : null);
const worn = (id: string) => { const d = daysAgo(S.lastWorn[id]); return d == null ? "nog nooit gedragen" : d === 0 ? "vandaag gedragen" : `${d} d geleden gedragen`; };
const itemsFor = (slot: string) =>
  S.items.filter((i) => slotOf(i) === slot).sort((a, b) => (S.lastWorn[a.id] ?? "").localeCompare(S.lastWorn[b.id] ?? ""));

/** "Maak deze look met wat ik heb": vult de vakken met eigen stukken die op de look lijken. */
export function fromLook(i: number) {
  const d = S.look.dirs[i]!;
  st.slots = {};
  st.missing = [];
  st.from = d.n;
  for (const x of d.p.map(byId).filter((x): x is LookItem => !!x)) {
    const h = haveOf(x), slot = h && slotOf(h);
    if (h && slot && !st.slots[slot]) st.slots[slot] = h.id;
    else st.missing.push(x);
  }
  location.hash = "#outfits";
}

function shuffle() {
  const pick = <T,>(a: T[]) => a[Math.floor(Math.random() * a.length)];
  st.slots = {};
  st.from = "";
  st.missing = [];
  for (const [slot] of S.person.slots) {
    const rest = REST[slot] ?? 0;
    const ok = itemsFor(slot).filter((i) => (daysAgo(S.lastWorn[i.id]) ?? 99) >= rest);
    if (slot === "Extra" && Math.random() < 0.5) continue;
    const it = pick(ok.length ? ok : itemsFor(slot));
    if (it) st.slots[slot] = it.id;
  }
}

function board() {
  return `<div class="c-board" role="group" aria-label="Outfitbord">${S.person.slots.map(([slot], n) => {
    const it = S.items.find((i) => i.id === st.slots[slot]);
    return `<button type="button" class="c-board__slot c-board__slot--${n}" data-slot="${esc(slot)}" aria-pressed="${st.active === slot}">
  ${it ? `<img src="${esc(img(it))}" alt="${esc(`${slot}: ${it.name || it.brand || "stuk"}`)}">` : `<span class="c-board__empty">+ ${esc(slot)}</span>`}
  <span class="c-board__label">${esc(slot)}</span></button>`;
  }).join("")}</div>`;
}

function picker() {
  const L = itemsFor(st.active);
  return `<div class="c-picker" role="listbox" aria-label="Kies ${esc(st.active)}">
  <button type="button" class="c-picker__item c-picker__item--none" data-pick="" role="option" aria-selected="${!st.slots[st.active]}">Leeg laten</button>
  ${L.map((it) => `<button type="button" class="c-picker__item" data-pick="${esc(it.id)}" role="option" aria-selected="${st.slots[st.active] === it.id}">
    <img src="${esc(img(it))}" alt="" loading="lazy"><span>${esc(it.name || it.brand || "Naamloos")}</span><small>${worn(it.id)}</small></button>`).join("")}
  ${L.length ? "" : `<p class="c-empty">Nog niets in ${esc(st.active.toLowerCase())}. Voeg stukken toe in de kleerkast.</p>`}
</div>`;
}

function missing() {
  if (!st.missing.length) return "";
  return `<div class="c-board__missing"><h3 class="c-maten__legend">Nog nodig voor "${esc(st.from)}"</h3>
  <ul>${st.missing.map((x) => {
    const m = mySize(x);
    return `<li><span class="c-board__mthumb">${sprite(x, "c-card__img")}</span><a href="${esc(x.u)}" target="_blank" rel="noopener noreferrer">${esc(brand(x))}, ${esc(x.d)}<span class="u-sr-only"> (opent in een nieuw tabblad)</span></a>${m ? ` <b>Jouw maat ${esc(m)}</b>` : ""}</li>`;
  }).join("")}</ul></div>`;
}

function saved() {
  if (!S.outfits.length) return `<p class="c-empty">Nog geen outfits bewaard.</p>`;
  return `<div class="c-saved">${S.outfits.map((o) => `<article class="c-saved__card">
  <div class="c-saved__lay">${Object.values(o.slots).map((id) => S.items.find((i) => i.id === id)).filter((x): x is Item => !!x).map((it) => `<img src="${esc(img(it))}" alt="">`).join("")}</div>
  <h3 class="c-saved__name">${esc(o.name || "Zonder naam")}</h3>
  <div class="c-card__actions"><button type="button" class="c-link-btn" data-load="${esc(o.id)}">Op het bord</button>
  <button type="button" class="c-link-btn" data-wear-o="${esc(o.id)}">Vandaag gedragen</button>
  <button type="button" class="c-link-btn" data-del-o="${esc(o.id)}">${st.confirm === o.id ? "Zeker? Klik opnieuw" : "Wis"}</button></div>
</article>`).join("")}</div>`;
}

export const outfits: View = {
  title: "Outfits",
  mount(el) {
    el.innerHTML = `
<section class="c-hero">
  <div><p class="c-hero__kicker">Wat je draagt</p><h1 class="c-hero__title">Out<em>fits.</em></h1></div>
  <div><p class="c-hero__theme">Leg het neer zoals op je bed.</p>
  <p class="c-hero__dek">Tik een vak en kies een stuk. "Verras me" slaat over wat je de laatste dagen al droeg. Vanuit het lookbook vult "Maak deze look met wat ik heb" het bord voor je.</p></div>
</section>
<div class="c-studio">
  <div id="oboard"></div>
  <div class="c-studio__side">
    <div class="c-studio__tools">
      <button type="button" class="c-btn c-btn--ghost" data-shuffle>Verras me</button>
      <button type="button" class="c-btn c-btn--ghost" data-wear>Vandaag gedragen</button>
      <button type="button" class="c-link-btn" data-clear>Bord leegmaken</button>
    </div>
    <form class="c-studio__save" id="osave">
      <label class="c-lock__label" for="oname">Naam van de outfit</label>
      <div class="c-lock__row"><input id="oname" maxlength="80" placeholder="Bv. Zaterdag markt" autocomplete="off"><button class="c-btn">Bewaar outfit</button></div>
      <p class="c-lock__msg" id="ostat" role="status"></p>
    </form>
    <div id="opick"></div>
  </div>
</div>
<div id="omiss"></div>
<section class="c-chapter"><h2 class="c-chapter__title">Bewaarde outfits</h2><div id="osaved"></div></section>`;
  },
  update() {
    if (!document.getElementById("oboard")) return;
    $("oboard").innerHTML = board();
    $("opick").innerHTML = picker();
    $("omiss").innerHTML = missing();
    $("osaved").innerHTML = saved();
  },
};

const ids = () => Object.values(st.slots).filter(Boolean);
const msg = (t: string) => { const m = document.getElementById("ostat"); if (m) m.textContent = t; };

document.addEventListener("click", async (e) => {
  const t = e.target as HTMLElement;
  if (!t.closest(".c-studio, #osaved, #oboard")) return;
  const slot = t.closest<HTMLElement>("[data-slot]");
  if (slot) { st.active = slot.dataset.slot!; outfits.update(); $("opick").querySelector<HTMLElement>("[aria-selected=true]")?.focus(); return; }
  const pick = t.closest<HTMLElement>("[data-pick]");
  if (pick) { pick.dataset.pick ? (st.slots[st.active] = pick.dataset.pick) : delete st.slots[st.active]; outfits.update(); return; }
  if (t.closest("[data-shuffle]")) { shuffle(); outfits.update(); return; }
  if (t.closest("[data-clear]")) { st.slots = {}; st.missing = []; outfits.update(); return; }
  try {
    if (t.closest("[data-wear]")) {
      if (!ids().length) return msg("Leg eerst iets op het bord.");
      await wearToday(ids());
      return msg("Bewaard als vandaag gedragen.");
    }
    const load = t.closest<HTMLElement>("[data-load]");
    if (load) { st.slots = { ...S.outfits.find((o) => o.id === load.dataset.load)!.slots }; st.missing = []; outfits.update(); window.scrollTo({ top: 0 }); return; }
    const wo = t.closest<HTMLElement>("[data-wear-o]");
    if (wo) { const o = S.outfits.find((x) => x.id === wo.dataset.wearO)!; await wearToday(Object.values(o.slots), o.id); return msg(`"${o.name}" gedragen vandaag.`); }
    const del = t.closest<HTMLElement>("[data-del-o]");
    if (del) {
      if (st.confirm !== del.dataset.delO) { st.confirm = del.dataset.delO!; outfits.update(); return; }
      st.confirm = "";
      await deleteOutfit(del.dataset.delO!);
    }
  } catch (err) { msg(why(err)); }
});

document.addEventListener("submit", async (e) => {
  if ((e.target as HTMLElement).id !== "osave") return;
  e.preventDefault();
  if (!ids().length) return msg("Leg eerst iets op het bord.");
  const name = ($("oname") as HTMLInputElement).value.trim() || st.from || "Outfit";
  try { await saveOutfit(name, { ...st.slots }); ($("oname") as HTMLInputElement).value = ""; msg(`"${name}" bewaard.`); } catch (err) { msg(why(err)); }
});
