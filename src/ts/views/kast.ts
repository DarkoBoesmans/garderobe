// Kleerkast: wat je hebt, per categorie, met stukken toevoegen bovenaan.
import { S } from "../state";
import type { Item } from "../types";
import { ROMAN, arr, esc, hex } from "../util";
import { catRank, missingOf, photosOf } from "./fields";
import { openItem } from "./item";
import { addPhotos } from "../upload";
import { importVault } from "../vault";
import { why } from "../store";
import type { View } from "./shell";

const st = { view: "grid", cat: "", color: "", style: "", q: "" };
const $ = (id: string) => document.getElementById(id)!;

const swatches = (it: Item) =>
  `<span class="c-swatches">${arr(it.colors).slice(0, 3).map((c) => `<span><span class="c-swatch" style="background:${hex(c)}"></span>${esc(c)}</span>`).join("")}</span>`;

function filtered() {
  const q = st.q.toLowerCase();
  return S.items.filter((i) =>
    (!st.cat || i.category === st.cat) && (!st.color || arr(i.colors).includes(st.color)) && (!st.style || arr(i.style).includes(st.style)) &&
    (!q || JSON.stringify([i.name, i.brand, i.category, i.type, i.colors, i.style, i.material, i.details, i.notes]).toLowerCase().includes(q)))
    .sort((a, b) => catRank(a.category) - catRank(b.category) || String(a.brand ?? "").localeCompare(String(b.brand ?? "")));
}

const card = (it: Item) => {
  const p = photosOf(it)[0], mi = missingOf(it).length;
  return `<button type="button" class="c-card c-card--button" data-item="${esc(it.id)}">
  <span class="c-card__media">${p ? `<img class="c-card__img${it.cutout ? " c-card__img--cut" : ""}" src="${esc(p)}" alt="" loading="lazy">` : ""}${mi ? `<span class="c-card__flag">${mi} open</span>` : ""}</span>
  <span class="c-card__head"><span class="c-card__shop">${esc(it.brand || "Merk onbekend")}</span><span class="c-card__price">${it.size ? "Maat " + esc(it.size) : ""}</span></span>
  <span class="c-card__title">${esc(it.name || it.type || "")}</span>
  ${swatches(it)}
</button>`;
};

const table = (g: Item[]) => `<div class="c-table-wrap"><table class="c-table"><thead><tr><th><span class="u-sr-only">Foto</span></th><th>Stuk</th><th>Merk</th><th>Kleur</th><th>Maat</th><th>Materiaal</th><th>Open</th></tr></thead><tbody>${g.map((it) => {
  const p = photosOf(it)[0];
  return `<tr><td>${p ? `<img src="${esc(p)}" alt="" loading="lazy">` : ""}</td><td><button type="button" data-item="${esc(it.id)}">${esc(it.name || "Naamloos stuk")}</button></td><td>${esc(it.brand ?? "")}</td><td>${swatches(it)}</td><td>${esc(it.size ?? "")}</td><td>${esc(it.material ?? "")}</td><td>${esc(missingOf(it).join(", "))}</td></tr>`;
}).join("")}</tbody></table></div>`;

export const kast: View = {
  title: "Kleerkast",
  mount(el) {
    el.innerHTML = `
<section class="c-hero">
  <div><p class="c-hero__kicker">Wat je hebt · ${esc(S.person.issue)}</p><h1 class="c-hero__title">Kleer<em>kast.</em></h1></div>
  <div><p class="c-hero__theme">Stuk per stuk.</p>
    <p class="c-hero__dek">Alles wat je hebt, stuk per stuk. Fotografeer een stuk op een effen ondergrond: de achtergrond verdwijnt vanzelf.</p>
    <div class="c-hero__facts" id="kfacts"></div></div>
</section>
<form class="c-add" id="kadd">
  <label class="c-btn c-add__pick"><input type="file" id="kfiles" accept="image/*" multiple class="u-sr-only">Stuk toevoegen</label>
  <label class="c-add__opt"><input type="checkbox" id="kbg" checked> Achtergrond weghalen</label>
  <span class="c-actions__status" id="kstat" role="status"></span>
</form>
<div id="kimport"></div>
<div class="c-toolbar" role="search">
  <div class="c-toolbar__seg" role="group" aria-label="Weergave"><button type="button" class="c-link-btn" data-kv="grid">Raster</button><button type="button" class="c-link-btn" data-kv="table">Tabel</button></div>
  <label class="c-toolbar__field"><span>Categorie</span><select id="kcat"></select></label>
  <label class="c-toolbar__field"><span>Kleur</span><select id="kcolor"></select></label>
  <label class="c-toolbar__field"><span>Stijl</span><select id="kstyle"></select></label>
  <label class="c-toolbar__field c-toolbar__field--grow"><span>Zoek</span><input type="search" id="kq-in" placeholder="Merk, stuk, kleur of materiaal" value="${esc(st.q)}"></label>
  <span class="c-toolbar__count" id="kcount" aria-live="polite"></span>
</div>
<div id="kbook"></div>`;
    $("kq-in").addEventListener("input", (e) => { st.q = (e.target as HTMLInputElement).value; kast.update(); });
    for (const k of ["cat", "color", "style"] as const) $("k" + k).addEventListener("change", (e) => { st[k] = (e.target as HTMLSelectElement).value; kast.update(); });
  },
  update() {
    if (!document.getElementById("kbook")) return;
    const cats = [...new Set(S.items.map((i) => i.category).filter(Boolean) as string[])].sort((a, b) => catRank(a) - catRank(b));
    $("kfacts").innerHTML = [[S.items.length, "stuks"], [cats.length, "categorieën"], [new Set(S.items.map((i) => i.brand).filter(Boolean)).size, "merken"]]
      .map(([n, l]) => `<span class="c-hero__fact"><b>${n}</b>${l}</span>`).join("");
    const fill = (id: string, vals: string[], label: string, cur: string) =>
      ($(id).innerHTML = `<option value="">${label}</option>` + vals.map((v) => `<option${v === cur ? " selected" : ""}>${esc(v)}</option>`).join(""));
    fill("kcat", cats, "Alle", st.cat);
    fill("kcolor", [...new Set(S.items.flatMap((i) => arr(i.colors)))].sort(), "Alle", st.color);
    fill("kstyle", [...new Set(S.items.flatMap((i) => arr(i.style)))].sort(), "Alle", st.style);
    document.querySelectorAll<HTMLElement>("[data-kv]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.kv === st.view)));
    // Eenmalige overstap: Darko's oude, versleutelde kast importeren zolang zijn kast leeg is.
    const showImport = S.loaded && !S.items.length && S.person.key === "darko";
    if (showImport && !$("kimport").innerHTML) $("kimport").innerHTML = `<form class="c-lock" id="kimp"><p class="c-hero__dek">Je kast is leeg. Importeer je oude kleerkast met het wachtwoord van de vergrendelde versie.</p>
      <label class="c-lock__label" for="kimppw">Oud wachtwoord</label><div class="c-lock__row"><input id="kimppw" type="password" autocomplete="off" required><button class="c-btn">Importeer</button></div>
      <p class="c-lock__msg" id="kimpmsg" role="status"></p></form>`;
    if (!showImport) $("kimport").innerHTML = "";
    const L = filtered();
    $("kcount").textContent = `${L.length} van ${S.items.length} stuks`;
    const book = $("kbook");
    if (!S.loaded) { book.innerHTML = `<p class="c-empty">Kleerkast laden…</p>`; return; }
    if (!S.items.length) { book.innerHTML = `<p class="c-empty">De kleerkast is nog leeg. Voeg je eerste stuk toe.</p>`; return; }
    if (!L.length) { book.innerHTML = `<p class="c-empty">Geen stukken voor deze filters.</p>`; return; }
    book.innerHTML = [...new Set(L.map((i) => i.category || "Overig"))].map((c, ci) => {
      const g = L.filter((i) => (i.category || "Overig") === c);
      return `<section class="c-chapter o-split" aria-labelledby="kc-${ci}">
  <div class="o-split__aside"><div class="c-chapter__num" aria-hidden="true">${ROMAN[ci] ?? ci + 1}</div><h2 class="c-chapter__title" id="kc-${ci}">${esc(c)}</h2><p class="c-chapter__count">${g.length} stuks</p></div>
  ${st.view === "grid" ? `<div class="o-grid">${g.map(card).join("")}</div>` : table(g)}
</section>`;
    }).join("");
  },
};

document.addEventListener("click", (e) => {
  const t = e.target as HTMLElement;
  const v = t.closest<HTMLElement>("[data-kv]");
  if (v) { st.view = v.dataset.kv!; kast.update(); return; }
  const it = t.closest<HTMLElement>("[data-item]");
  if (it) openItem(it.dataset.item!);
});

document.addEventListener("change", async (e) => {
  const inp = e.target as HTMLInputElement;
  if (inp.id !== "kfiles" || !inp.files?.length) return;
  const st2 = $("kstat"), files = [...inp.files];
  inp.disabled = true;
  try {
    const id = await addPhotos(files, ($("kbg") as HTMLInputElement).checked, (t) => (st2.textContent = t));
    st2.textContent = files.length > 1 ? `${files.length} stukken toegevoegd.` : "Toegevoegd. Vul nu de gegevens aan.";
    if (files.length === 1) openItem(id);
  } catch (err) {
    st2.textContent = err instanceof Error && err.message.startsWith("Deze foto") ? err.message : why(err);
  } finally { inp.disabled = false; inp.value = ""; }
});

document.addEventListener("submit", async (e) => {
  const f = e.target as HTMLFormElement;
  if (f.id !== "kimp") return;
  e.preventDefault();
  const msg = $("kimpmsg");
  try { await importVault(($("kimppw") as HTMLInputElement).value, (t) => (msg.textContent = t)); }
  catch { msg.textContent = "Importeren lukte niet. Klopt het wachtwoord?"; }
});
