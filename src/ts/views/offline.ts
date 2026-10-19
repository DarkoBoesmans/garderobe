// Op GitHub Pages: kleerkast en maten zitten versleuteld in vault.bin en openen pas met het wachtwoord.
import { S } from "../state";
import { esc } from "../util";
import { unlock } from "../vault";
import type { View } from "./shell";

export const offline = (hash: string): View => ({
  title: hash === "#kast" ? "Kleerkast" : "Maten",
  mount(el) {
    const [a, b] = hash === "#kast" ? ["Kleer", "kast."] : ["Ma", "ten."];
    el.innerHTML = `
<section class="c-hero">
  <div><p class="c-hero__kicker">Vergrendeld</p><h1 class="c-hero__title">${a}<em>${b}</em></h1></div>
  <div><p class="c-hero__theme">Alleen met het wachtwoord.</p>
  <p class="c-hero__dek">De kleerkast en de maten van ${esc(S.person.name)} staan hier versleuteld. Het wachtwoord staat niet op GitHub; zonder wachtwoord is dit onleesbare data.</p>
  <form class="c-lock" id="lock">
    <input type="text" name="username" value="${esc(S.person.key)}" autocomplete="username" hidden>
    <label class="c-lock__label" for="pw">Wachtwoord</label>
    <div class="c-lock__row">
      <input id="pw" name="pw" type="password" autocomplete="current-password" required aria-describedby="lockmsg">
      <button class="c-btn">Ontgrendel</button>
    </div>
    <p class="c-lock__msg" id="lockmsg" role="status"></p>
  </form></div>
</section>`;
    el.querySelector<HTMLFormElement>("#lock")!.addEventListener("submit", async (e) => {
      e.preventDefault();
      const f = e.target as HTMLFormElement, msg = f.querySelector("#lockmsg")!, pw = (f.elements.namedItem("pw") as HTMLInputElement);
      msg.textContent = "Bezig met ontsleutelen…";
      try {
        await unlock(pw.value);
        window.dispatchEvent(new HashChangeEvent("hashchange"));
      } catch {
        msg.textContent = "Dat wachtwoord klopt niet. Probeer het opnieuw.";
        pw.select();
      }
    });
  },
  update() {},
});
