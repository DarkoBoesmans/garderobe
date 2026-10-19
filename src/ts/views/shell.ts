// Paginaskelet en router: masthead met inhoudstafel, één <main> per view, colofon.
import { S, onRender } from "../state";
import { esc } from "../util";
import { info } from "./info";
import { kast } from "./kast";
import { lookbook } from "./lookbook";
import { maten } from "./maten";

export interface View { title: string; mount(el: HTMLElement): void; update(): void }

const ROUTES: Record<string, View> = { "#lookbook": lookbook, "#kast": kast, "#maten": maten, "#info": info };
const NAV: [string, string][] = [["#lookbook", "Lookbook"], ["#kast", "Kleerkast"], ["#maten", "Maten"], ["#info", "Colofon"]];
let current: View = lookbook;

export function startShell(app: HTMLElement) {
  const p = S.person;
  document.documentElement.lang = "nl";
  document.body.dataset.person = p.key;
  app.innerHTML = `
<button type="button" class="c-skip" data-skip>Naar de inhoud</button>
<header class="c-masthead"><div class="o-wrap c-masthead__bar">
  <span class="c-masthead__issue"><b>${esc(p.issue)}</b> De garderobe van ${esc(p.name)}</span>
  <nav class="c-masthead__nav" aria-label="Onderdelen">${NAV.map(([h, l], i) => `<a class="c-masthead__link" href="${h}"><small>0${i + 1}</small>${l}</a>`).join("")}</nav>
  <span class="c-masthead__season">${esc(p.season)}</span>
</div></header>
<main id="view" class="o-wrap" tabindex="-1"></main>
<footer class="o-wrap c-footer">
  <span>Privé en niet-commercieel. Geen cookies, geen tracking.</span>
  <a href="#info">Privacy, gegevens en colofon</a>
</footer>
<dialog id="dlg" class="c-dialog"></dialog>`;
  window.addEventListener("hashchange", () => go(true));
  app.querySelector("[data-skip]")!.addEventListener("click", () => document.getElementById("view")!.focus());
  onRender(() => current.update());
  go(false);
}

function go(moveFocus: boolean) {
  const hash = location.hash in ROUTES ? location.hash : "#lookbook";
  current = ROUTES[hash]!;
  document.querySelectorAll(".c-masthead__link").forEach((a) => a.toggleAttribute("aria-current", a.getAttribute("href") === hash));
  document.querySelectorAll(".c-masthead__link[aria-current]").forEach((a) => a.setAttribute("aria-current", "page"));
  document.title = `${current.title} · ${S.person.name}`;
  const el = document.getElementById("view")!;
  current.mount(el);
  current.update();
  if (moveFocus) { window.scrollTo(0, 0); el.focus({ preventScroll: true }); }
}
