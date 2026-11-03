// Start: sessie checken, profiel laden, juiste garderobe tonen. Zonder sessie: het loginscherm.
import { PEOPLE } from "./people";
import { S, render } from "./state";
import { load } from "./store";
import { sb } from "./supa";
import type { Lookbook } from "./types";
import { info } from "./views/info";
import { showLogin, startDemo } from "./views/login";
import { startShell } from "./views/shell";
import { top } from "./views/top";

const app = document.getElementById("app")!;

/** Het colofon (privacy) moet ook zonder account leesbaar zijn. */
function showPrivacy() {
  app.innerHTML = `<a class="c-skip" href="#view">Naar de inhoud</a>${top("../")}<main id="view" class="o-wrap" tabindex="-1"></main>`;
  info.mount(document.getElementById("view")!);
}
window.addEventListener("hashchange", () => { if (!S.uid) location.hash === "#info" ? showPrivacy() : showLogin(app); });

const EMPTY: Lookbook = { items: [], dirs: [], chapters: [], sheets: {} };

/** De demo heeft een openbaar lookbook; de echte lookbooks staan privé in storage en zijn enkel na login leesbaar. */
async function loadLook(book: string) {
  if (book === "demo") {
    S.look = (await (await fetch("data/demo.json")).json()) as Lookbook;
    S.sheetUrl = Object.fromEntries(Object.keys(S.look.sheets).map((n) => [n, `sheets/demo/${n}.jpg`]));
    return;
  }
  const { data, error } = await sb.storage.from("lookbook").download(`${book}/lookbook.json`);
  S.look = error || !data ? EMPTY : (JSON.parse(await data.text()) as Lookbook);
  const names = Object.keys(S.look.sheets);
  if (!names.length) return;
  const { data: urls } = await sb.storage.from("lookbook").createSignedUrls(names.map((n) => `${book}/${n}.jpg`), 43200);
  S.sheetUrl = Object.fromEntries(names.map((n, i) => [n, urls?.[i]?.signedUrl ?? ""]));
}

async function boot() {
  // Terug van een bevestigings- of resetmail: de code inwisselen voor een sessie, dan uit de URL halen.
  const q = new URLSearchParams(location.search), code = q.get("code"), err = q.get("error_description");
  if (err) {
    history.replaceState(null, "", location.pathname);
    return showLogin(app, "in", /saving new user|Registratie/i.test(err) ? "Dit account is niet uitgenodigd. Vraag een uitnodiging of bekijk de demo." : "Inloggen lukte niet. Probeer het opnieuw.");
  }
  if (code) {
    await sb.auth.exchangeCodeForSession(code);
    history.replaceState(null, "", location.pathname + location.hash);
  }
  const { data } = await sb.auth.getSession();
  const session = data.session;
  if (!session) {
    if (location.hash === "#info") return showPrivacy();
    showLogin(app);
    if (location.hash === "#demo") { history.replaceState(null, "", location.pathname); startDemo(app); }
    return;
  }
  S.uid = session.user.id;
  S.email = session.user.email ?? "";
  const { data: prof } = await sb.from("profiles").select("person,name").eq("id", S.uid).maybeSingle();
  // Namen staan in de database, niet in de code: de publieke bundel noemt niemand.
  const base = PEOPLE[(prof?.person as keyof typeof PEOPLE) ?? "demo"] ?? PEOPLE.demo;
  S.person = { ...base, name: prof?.name || base.name || "jou" };
  await loadLook(S.person.book ?? S.person.key);
  startShell(app);
  load().catch(() => { S.loaded = true; render(); });
}

sb.auth.onAuthStateChange((event) => {
  if (event === "PASSWORD_RECOVERY") showLogin(app, "new");
  if (event === "SIGNED_OUT") showLogin(app, "in", "Je bent uitgelogd.");
});
boot();
