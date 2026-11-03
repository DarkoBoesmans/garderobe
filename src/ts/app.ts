// Start: sessie checken, profiel laden, juiste garderobe tonen. Zonder sessie: het loginscherm.
import { PEOPLE } from "./people";
import { S, render } from "./state";
import { load } from "./store";
import { sb } from "./supa";
import type { Lookbook } from "./types";
import { info } from "./views/info";
import { showLogin } from "./views/login";
import { startShell } from "./views/shell";

const app = document.getElementById("app")!;

/** Het colofon (privacy) moet ook zonder account leesbaar zijn. */
function showPrivacy() {
  app.innerHTML = `<main id="view" class="o-wrap" tabindex="-1"></main>`;
  info.mount(document.getElementById("view")!);
}
window.addEventListener("hashchange", () => { if (!S.uid) location.hash === "#info" ? showPrivacy() : showLogin(app); });

async function boot() {
  // Terug van een bevestigings- of resetmail: de code inwisselen voor een sessie, dan uit de URL halen.
  const code = new URLSearchParams(location.search).get("code");
  if (code) {
    await sb.auth.exchangeCodeForSession(code);
    history.replaceState(null, "", location.pathname + location.hash);
  }
  const { data } = await sb.auth.getSession();
  const session = data.session;
  if (!session) return location.hash === "#info" ? showPrivacy() : showLogin(app);
  S.uid = session.user.id;
  S.email = session.user.email ?? "";
  const { data: prof } = await sb.from("profiles").select("person").eq("id", S.uid).maybeSingle();
  S.person = PEOPLE[(prof?.person as keyof typeof PEOPLE) ?? "demo"] ?? PEOPLE.demo;
  S.look = (await (await fetch(`data/${S.person.book ?? S.person.key}.json`)).json()) as Lookbook;
  startShell(app);
  load().catch(() => { S.loaded = true; render(); });
}

sb.auth.onAuthStateChange((event) => {
  if (event === "PASSWORD_RECOVERY") showLogin(app, "new");
  if (event === "SIGNED_OUT") showLogin(app, "in", "Je bent uitgelogd.");
});
boot();
