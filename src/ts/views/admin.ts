// Beheer: wie mag een account maken, en met welke garderobe. De database controleert zelf of jij de beheerder bent.
import { S } from "../state";
import { sb } from "../supa";
import { esc, fmtDate } from "../util";
import type { View } from "./shell";

export const ADMIN = "darkoboesmans@gmail.com";
interface Invite { email: string; person: string; joined: string | null; last: string | null }
interface Overview { invites: Invite[]; demos: number; items: number }

const PERSONS: [string, string][] = [["demo", "Lege kast (stijl van de demo)"], ["darko", "Darko"], ["lana", "Lana"]];
const st = { data: null as Overview | null, error: "", confirm: "" };
const $ = (id: string) => document.getElementById(id);

async function refresh() {
  const r = await sb.rpc("admin_overview");
  st.data = r.error ? null : (r.data as Overview);
  st.error = r.error ? "Geen toegang of geen verbinding." : "";
  admin.update();
}

function rows(list: Invite[]) {
  return list.map((i) => `<tr>
  <td>${esc(i.email)}</td>
  <td>${esc(PERSONS.find((p) => p[0] === i.person)?.[1] ?? i.person)}</td>
  <td>${i.joined ? `Account sinds ${esc(fmtDate(i.joined))}` : "Nog geen account"}${i.last ? `<br><small>laatst ingelogd ${esc(fmtDate(i.last))}</small>` : ""}</td>
  <td>${i.email === ADMIN ? "" : `<button type="button" class="c-link-btn" data-uninvite="${esc(i.email)}">${st.confirm === i.email ? "Zeker? Klik opnieuw" : "Uitnodiging intrekken"}</button>`}</td>
</tr>`).join("");
}

export const admin: View = {
  title: "Beheer",
  mount(el) {
    el.innerHTML = `
<section class="c-hero">
  <div><p class="c-hero__kicker">Alleen voor jou</p><h1 class="c-hero__title">Beheer</h1></div>
  <div><p class="c-hero__theme">Wie mag binnen.</p>
  <p class="c-hero__dek">Alleen uitgenodigde e-mailadressen kunnen een account maken. Wie je uitnodigt, krijgt een eigen, lege kast; kies "Darko" of "Lana" alleen voor jullie twee. Een uitnodiging intrekken wist geen bestaand account.</p></div>
</section>
<form class="c-lock c-admin__form" id="ainv" novalidate>
  <label class="c-lock__label" for="aemail">E-mailadres</label>
  <input id="aemail" type="email" autocomplete="off" required>
  <label class="c-lock__label" for="aperson">Garderobe</label>
  <select id="aperson">${PERSONS.map(([v, l]) => `<option value="${v}">${esc(l)}</option>`).join("")}</select>
  <button class="c-btn">Uitnodigen</button>
  <p class="c-lock__msg" id="amsg" role="status"></p>
</form>
<div id="aout"></div>`;
    refresh();
  },
  update() {
    const out = $("aout");
    if (!out) return;
    if (st.error) { out.innerHTML = `<p class="c-empty">${esc(st.error)}</p>`; return; }
    if (!st.data) { out.innerHTML = `<p class="c-empty">Laden…</p>`; return; }
    const d = st.data;
    out.innerHTML = `<p class="c-maten__legend">${d.invites.length} uitnodigingen · ${d.demos} demobezoekers nu actief · ${d.items} stukken in alle kasten</p>
<div class="c-table-wrap"><table class="c-table"><thead><tr><th scope="col">E-mail</th><th scope="col">Garderobe</th><th scope="col">Status</th><th scope="col"><span class="u-sr-only">Actie</span></th></tr></thead>
<tbody>${rows(d.invites)}</tbody></table></div>`;
  },
};

document.addEventListener("submit", async (e) => {
  if ((e.target as HTMLElement).id !== "ainv") return;
  e.preventDefault();
  const email = ($("aemail") as HTMLInputElement).value.trim(), person = ($("aperson") as HTMLSelectElement).value, msg = $("amsg")!;
  if (!/^\S+@\S+\.\S+$/.test(email)) { msg.textContent = "Vul een geldig e-mailadres in."; return; }
  const r = await sb.rpc("admin_invite", { p_email: email, p_person: person });
  if (r.error) { msg.textContent = "Uitnodigen lukte niet."; return; }
  ($("aemail") as HTMLInputElement).value = "";
  msg.textContent = `${email} is uitgenodigd. Stuur zelf de link naar de site; die persoon maakt daar een account met dit adres.`;
  refresh();
});

document.addEventListener("click", async (e) => {
  const b = (e.target as HTMLElement).closest<HTMLElement>("[data-uninvite]");
  if (!b || !S.uid) return;
  const email = b.dataset.uninvite!;
  if (st.confirm !== email) { st.confirm = email; admin.update(); return; }
  st.confirm = "";
  const r = await sb.rpc("admin_uninvite", { p_email: email });
  const msg = $("amsg");
  if (msg) msg.textContent = r.error ? "Intrekken lukte niet." : `Uitnodiging voor ${email} ingetrokken.`;
  refresh();
});
