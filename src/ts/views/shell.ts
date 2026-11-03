// Paginaskelet en router: masthead met inhoudstafel, één <main> per view, colofon.
import { S, onRender } from "../state";
import { esc } from "../util";
import { info } from "./info";
import { kast } from "./kast";
import { lookbook } from "./lookbook";
import { maten } from "./maten";
import { outfits } from "./outfits";
import { ADMIN, admin } from "./admin";
import { sb } from "../supa";

export interface View { title: string; mount(el: HTMLElement): void; update(): void }

const ROUTES: Record<string, View> = { "#kast": kast, "#outfits": outfits, "#lookbook": lookbook, "#maten": maten, "#info": info };
const NAV: [string, string][] = [["#kast", "Kast"], ["#outfits", "Outfits"], ["#lookbook", "Lookbook"], ["#maten", "Maten"], ["#info", "Colofon"]];
/** Beheer verschijnt enkel voor de beheerder; de database weigert iedereen anders sowieso. */
const isAdmin = () => S.email.toLowerCase() === ADMIN;
let current: View = kast;

export function startShell(app: HTMLElement) {
  const p = S.person;
  if (isAdmin()) { ROUTES["#admin"] = admin; NAV.push(["#admin", "Beheer"]); }
  document.documentElement.lang = "nl";
  document.body.dataset.person = p.key;
  app.innerHTML = `
<a class="c-skip" href="#view" data-skip>Naar de inhoud</a>
<header class="c-masthead"><div class="o-wrap c-masthead__bar">
  <span class="c-masthead__issue"><b>${esc(p.issue)}</b> De garderobe van ${esc(p.name)}</span>
  <nav class="c-masthead__nav" aria-label="Onderdelen">${NAV.map(([h, l]) => `<a class="c-masthead__link" href="${h}">${l}</a>`).join("")}</nav>
  <span class="c-masthead__season">${esc(p.season)}</span>
</div></header>
<main id="view" class="o-wrap" tabindex="-1"></main>
<footer class="o-wrap c-footer">
  <span>${S.email ? `Ingelogd als ${esc(S.email)}` : "Demo: deze kast en alles wat je toevoegt wordt na 24 uur gewist"}. Niet-commercieel, geen tracking.</span>
  <a href="#info">Privacy, gegevens en colofon</a>
  <button type="button" class="c-link-btn" data-logout>Uitloggen</button>
</footer>
<dialog id="dlg" class="c-dialog"></dialog>`;
  window.addEventListener("hashchange", () => go(true));
  app.querySelector("[data-skip]")!.addEventListener("click", (e) => { e.preventDefault(); document.getElementById("view")!.focus(); });
  app.querySelector("[data-logout]")!.addEventListener("click", () => sb.auth.signOut());
  onRender(() => current.update());
  go(false);
}

function go(moveFocus: boolean) {
  const hash = location.hash in ROUTES ? location.hash : "#kast";
  current = ROUTES[hash]!;
  document.querySelectorAll(".c-masthead__link").forEach((a) => a.toggleAttribute("aria-current", a.getAttribute("href") === hash));
  document.querySelectorAll(".c-masthead__link[aria-current]").forEach((a) => a.setAttribute("aria-current", "page"));
  document.title = `${current.title} · ${S.person.name}`;
  const el = document.getElementById("view")!;
  current.mount(el);
  current.update();
  if (moveFocus) { window.scrollTo(0, 0); el.focus({ preventScroll: true }); }
}
