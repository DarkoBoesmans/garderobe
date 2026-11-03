// Inloggen, account aanmaken (alleen voor uitgenodigde e-mails) en wachtwoord vergeten.
import { sb } from "../supa";
import { esc } from "../util";

type Mode = "in" | "up" | "reset" | "new";
const TEXT: Record<Mode, [string, string, string]> = {
  in: ["Log in op je", "Inloggen", "Je kast, je maten en je lookbook staan achter je account."],
  up: ["Maak je", "Account aanmaken", "Alleen uitgenodigde e-mailadressen kunnen een account maken. Je krijgt een mail om het te bevestigen."],
  reset: ["Nieuw", "Stuur resetlink", "Je krijgt een mail met een link om een nieuw wachtwoord te kiezen."],
  new: ["Kies een nieuw", "Wachtwoord opslaan", "Minstens 10 tekens. Een zin van vier woorden werkt goed."],
};

/** Supabase geeft Engelse foutcodes; vertaal de gewone gevallen, verberg de rest. */
function nl(e: { message?: string; code?: string }) {
  const m = `${e.code ?? ""} ${e.message ?? ""}`;
  if (/invalid_credentials|Invalid login/i.test(m)) return "E-mail of wachtwoord klopt niet.";
  if (/email_not_confirmed/i.test(m)) return "Bevestig eerst je e-mailadres via de mail die je kreeg.";
  if (/Registratie is gesloten|Database error saving new user/i.test(m)) return "Dit e-mailadres is niet uitgenodigd.";
  if (/rate|too many/i.test(m)) return "Te veel pogingen. Wacht een paar minuten.";
  if (/weak|password/i.test(m)) return "Dat wachtwoord is te zwak. Kies minstens 10 tekens.";
  return "Dat lukte niet. Probeer het opnieuw.";
}

export function showLogin(app: HTMLElement, mode: Mode = "in", note = "") {
  const [kicker, button, dek] = TEXT[mode];
  const word = mode === "in" ? "garderobe." : mode === "up" ? "account." : "wachtwoord.";
  app.innerHTML = `
<main class="o-wrap c-login" id="view" tabindex="-1">
  <section class="c-hero">
    <div><p class="c-hero__kicker"><a href="../">Garderobe</a></p><h1 class="c-hero__title">${kicker} <em>${word}</em></h1></div>
    <form class="c-lock" id="auth" novalidate>
      <p class="c-hero__dek">${esc(dek)}</p>
      ${mode !== "new" ? `<label class="c-lock__label" for="email">E-mail</label>
      <input id="email" name="email" type="email" autocomplete="email" required>` : ""}
      ${mode !== "reset" ? `<label class="c-lock__label" for="pw">Wachtwoord</label>
      <input id="pw" name="pw" type="password" autocomplete="${mode === "in" ? "current-password" : "new-password"}" minlength="10" required>` : ""}
      <button class="c-btn">${button}</button>
      <p class="c-lock__msg" id="msg" role="status">${esc(note)}</p>
      ${mode === "in" ? `<div class="c-login__demo"><p>Geen uitnodiging? Kijk rond in de kast van Jules, een verzonnen vintage-streetwear garderobe. Je kunt alles uitproberen, ook foto's toevoegen; na 24 uur wordt alles gewist.</p>
      <button type="button" class="c-btn c-btn--ghost" data-demo>Bekijk de demo</button></div>` : ""}
      <p class="c-login__alt"><a class="c-link-btn" href="#info">Privacy en colofon</a>
        ${mode === "in" ? `<button type="button" class="c-link-btn" data-mode="reset">Wachtwoord vergeten</button> <button type="button" class="c-link-btn" data-mode="up">Uitgenodigd? Maak je account</button>`
          : mode !== "new" ? `<button type="button" class="c-link-btn" data-mode="in">Terug naar inloggen</button>` : ""}
      </p>
    </form>
  </section>
</main>`;
  const f = app.querySelector<HTMLFormElement>("#auth")!, msg = app.querySelector("#msg")!;
  app.querySelectorAll<HTMLElement>("[data-mode]").forEach((b) => b.addEventListener("click", () => showLogin(app, b.dataset.mode as Mode)));
  (f.querySelector("input") as HTMLInputElement).focus();
  app.querySelector("[data-demo]")?.addEventListener("click", async () => {
    msg.textContent = "De demo-kast wordt klaargezet…";
    const { error } = await sb.auth.signInAnonymously();
    if (error) { msg.textContent = /disabled|not allowed/i.test(error.message) ? "De demo staat even uit." : nl(error); return; }
    const r = await sb.rpc("start_demo");
    if (r.error) { msg.textContent = "De demo-kast kon niet klaargezet worden. Probeer het opnieuw."; await sb.auth.signOut({ scope: "local" }); return; }
    location.reload();
  });
  f.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = (f.elements.namedItem("email") as HTMLInputElement | null)?.value.trim() ?? "";
    const password = (f.elements.namedItem("pw") as HTMLInputElement | null)?.value ?? "";
    if (mode !== "new" && !/^\S+@\S+\.\S+$/.test(email)) { msg.textContent = "Vul een geldig e-mailadres in."; return; }
    if ((mode === "up" || mode === "new") && password.length < 10) { msg.textContent = "Kies een wachtwoord van minstens 10 tekens."; return; }
    msg.textContent = "Even geduld…";
    const here = location.origin + location.pathname;
    const r = mode === "in" ? await sb.auth.signInWithPassword({ email, password })
      : mode === "up" ? await sb.auth.signUp({ email, password, options: { emailRedirectTo: here } })
      : mode === "reset" ? await sb.auth.resetPasswordForEmail(email, { redirectTo: here })
      : await sb.auth.updateUser({ password });
    if (r.error) { msg.textContent = nl(r.error); return; }
    // Bij reset en registratie zeggen we nooit of het adres bestaat (geen e-mailenumeratie).
    if (mode === "up") msg.textContent = "Check je mailbox om je account te bevestigen.";
    else if (mode === "reset") msg.textContent = "Als dit adres een account heeft, is er een mail onderweg.";
    else location.reload();
  });
}
