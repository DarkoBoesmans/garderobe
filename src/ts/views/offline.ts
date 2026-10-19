// Op GitHub Pages is er geen Claude-database: kleerkast en maten verwijzen naar de privéversie.
import { S } from "../state";
import { esc } from "../util";
import type { View } from "./shell";

export const offline = (hash: string): View => ({
  title: hash === "#kast" ? "Kleerkast" : "Maten",
  mount(el) {
    const [a, b] = hash === "#kast" ? ["Kleer", "kast."] : ["Ma", "ten."];
    el.innerHTML = `
<section class="c-hero">
  <div><p class="c-hero__kicker">Alleen in de privéversie</p><h1 class="c-hero__title">${a}<em>${b}</em></h1></div>
  <div><p class="c-hero__theme">Dit deel is privé.</p>
  <p class="c-hero__dek">De kleerkast en de maten bevatten persoonlijke gegevens en staan daarom niet op deze openbare pagina. ${esc(S.person.name)} opent ze via de privélink op Claude.</p>
  <p class="c-hero__dek"><a class="c-btn" href="${esc(S.person.privateUrl)}" target="_blank" rel="noopener noreferrer">Open de privéversie</a></p></div>
</section>`;
  },
  update() {},
});
