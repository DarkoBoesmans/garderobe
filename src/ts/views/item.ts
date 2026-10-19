// Detail van een stuk: foto's, bewerkbare velden en verwijderen.
import { S } from "../state";
import { deleteItem, isList, saveItem, why } from "../store";
import type { Item } from "../types";
import { arr, esc, fmtDate, hex } from "../util";
import { closeDialog, openDialog } from "./dialog";
import { CLOSED, FIELDS, OPTS, known, missingOf, photosOf } from "./fields";

const dis = () => (S.canWrite ? "" : " disabled");

/** Vaste keuzes als dropdown, lijsten als aan/uit-chips, de rest als invulveld met suggesties. */
function control(k: string, it: Item, miss: boolean) {
  const id = "f-" + k, cls = miss ? ' class="is-missing"' : "";
  if (k === "details" || k === "notes") return `<textarea id="${id}" name="${k}" rows="2"${dis()}>${esc(it[k] ?? "")}</textarea>`;
  const base = k === "category" ? S.person.categories : OPTS[k] ?? [];
  const opts = [...new Set([...base, ...known(k)])];
  if (CLOSED.has(k)) {
    const v = String(it[k] ?? "");
    return `<select id="${id}" name="${k}"${cls}${dis()}><option value="">${miss ? "Nog onbekend, kies" : "Kies"}</option>${[...new Set([...opts, v].filter(Boolean))]
      .map((o) => `<option${o === v ? " selected" : ""}>${esc(o)}</option>`).join("")}</select>`;
  }
  if (isList(k)) {
    const cur = arr(it[k]);
    const shown = [...new Set([...cur, ...known(k), ...(k === "season" ? OPTS.season! : [])])];
    const more = opts.filter((o) => !shown.includes(o));
    const chip = (o: string) => `<button type="button" class="c-chip" data-tog="${k}" data-v="${esc(o)}" aria-pressed="${cur.includes(o)}"${dis()}>${k === "colors" ? `<span class="c-swatch" style="background:${hex(o)}"></span>` : ""}${esc(o)}</button>`;
    return `<input type="hidden" id="${id}" name="${k}" value="${esc(cur.join(", "))}">
<div class="c-chips" role="group" aria-labelledby="l-${k}">${shown.map(chip).join("")}<input class="c-chip-add" data-add="${k}" placeholder="+ andere" aria-label="Andere waarde toevoegen"${dis()}></div>
${more.length ? `<details><summary class="c-link-btn">Meer keuzes (${more.length})</summary><div class="c-chips">${more.map(chip).join("")}</div></details>` : ""}`;
  }
  return `<input id="${id}" name="${k}" list="dl-${k}" autocomplete="off" value="${esc(it[k] ?? "")}"${cls} placeholder="${miss ? "Nog onbekend, kies of typ" : "Kies of typ"}"${dis()}>
<datalist id="dl-${k}">${opts.map((o) => `<option value="${esc(o)}">`).join("")}</datalist>`;
}

export function openItem(id: string) {
  const it = S.items.find((i) => i.id === id);
  if (!it) return;
  const ps = photosOf(it), miss = new Set(missingOf(it)), title = it.name || it.type || "Naamloos stuk";
  openDialog(`<form class="c-item" data-edit="${esc(it.id)}">
  <div>
    ${ps[0] ? `<img class="c-item__photo" id="big" src="${esc(ps[0])}" alt="Foto van ${esc(title)}">` : ""}
    ${ps.length > 1 ? `<div class="c-item__thumbs">${ps.map((p, i) => `<button type="button" data-swap="${esc(p)}" aria-label="Foto ${i + 1} van ${ps.length}" aria-current="${i === 0}"><img src="${esc(p)}" alt=""></button>`).join("")}</div>` : ""}
    <p class="c-item__file">Bestand: ${esc(arr(it.files ?? it.file).join(", "))}<br>Toegevoegd: ${esc(fmtDate(it.added))}</p>
  </div>
  <div>
    <h2 class="c-item__title">${esc(it.brand || "Merk onbekend")}</h2>
    <p class="c-item__sub">${esc(title)}</p>
    <dl class="c-fields">${FIELDS.map(([k, l]) => `<dt id="l-${k}"><label for="f-${k}">${l}</label></dt><dd>${control(k, it, miss.has(k))}</dd>`).join("")}</dl>
    <div class="c-actions" id="acts">
      <span class="c-actions__status" role="status" id="dstat"></span>
      ${S.canWrite ? `<button type="button" class="c-btn c-btn--danger" data-del>Verwijder stuk</button><button class="c-btn">Wijzigingen opslaan</button>` : ""}
    </div>
  </div>
</form>`, `${it.brand ?? ""} ${title}`);
}

const form = () => document.querySelector<HTMLFormElement>("[data-edit]");
const status = (t: string) => { const s = document.getElementById("dstat"); if (s) s.textContent = t; };
const sync = (k: string) => {
  const h = document.getElementById("f-" + k) as HTMLInputElement;
  h.value = [...document.querySelectorAll<HTMLElement>(`[data-tog="${k}"][aria-pressed="true"]`)].map((b) => b.dataset.v).join(", ");
};

document.addEventListener("click", async (e) => {
  const t = e.target as HTMLElement, f = form();
  if (!f || !f.contains(t)) return;
  const sw = t.closest<HTMLElement>("[data-swap]");
  if (sw) {
    (document.getElementById("big") as HTMLImageElement).src = sw.dataset.swap!;
    f.querySelectorAll("[data-swap]").forEach((b) => b.setAttribute("aria-current", String(b === sw)));
    return;
  }
  const tog = t.closest<HTMLElement>("[data-tog]");
  if (tog) { tog.setAttribute("aria-pressed", String(tog.getAttribute("aria-pressed") !== "true")); sync(tog.dataset.tog!); return; }
  // Verwijderen in twee stappen, zonder browserpop-up: eerst vragen, dan pas wissen.
  if (t.closest("[data-del]")) {
    const it = S.items.find((i) => i.id === f.dataset.edit)!;
    document.getElementById("acts")!.innerHTML = `<div class="c-confirm" role="alertdialog" aria-labelledby="cq">
  <p id="cq">"${esc(it.name || it.brand || "Dit stuk")}" en de foto's ervan definitief verwijderen? De avondscan voegt het niet opnieuw toe.</p>
  <button type="button" class="c-btn c-btn--ghost" data-keep>Nee, houden</button>
  <button type="button" class="c-btn c-btn--danger" data-del-yes>Ja, verwijder</button>
  <span class="c-actions__status" role="status" id="dstat"></span></div>`;
    (document.querySelector("[data-keep]") as HTMLElement).focus();
    return;
  }
  if (t.closest("[data-keep]")) { openItem(f.dataset.edit!); return; }
  if (t.closest("[data-del-yes]")) {
    const it = S.items.find((i) => i.id === f.dataset.edit);
    if (!it) return;
    status("Bezig met verwijderen…");
    try { await deleteItem(it); closeDialog(); } catch (err) { status(why(err)); }
  }
});

// Een eigen waarde toevoegen met Enter.
document.addEventListener("keydown", (e) => {
  const inp = (e.target as HTMLElement).closest<HTMLInputElement>("[data-add]");
  if (!inp || e.key !== "Enter") return;
  e.preventDefault();
  const v = inp.value.trim().toLowerCase(), k = inp.dataset.add!;
  if (!v) return;
  const ex = document.querySelector<HTMLElement>(`[data-tog="${k}"][data-v="${CSS.escape(v)}"]`);
  if (ex) ex.setAttribute("aria-pressed", "true");
  else inp.insertAdjacentHTML("beforebegin", `<button type="button" class="c-chip" data-tog="${k}" data-v="${esc(v)}" aria-pressed="true">${esc(v)}</button>`);
  inp.value = "";
  sync(k);
});

document.addEventListener("submit", async (e) => {
  const f = (e.target as HTMLElement).closest<HTMLFormElement>("[data-edit]");
  if (!f) return;
  e.preventDefault();
  const it = S.items.find((i) => i.id === f.dataset.edit)!;
  const patch: Record<string, unknown> = {};
  for (const [k] of FIELDS) {
    const el = f.elements.namedItem(k) as HTMLInputElement | null;
    if (!el) continue;
    const v = el.value.trim(), nv = isList(k) ? arr(v) : v, ov = isList(k) ? arr(it[k]) : it[k] ?? "";
    if (JSON.stringify(nv) !== JSON.stringify(ov)) patch[k] = nv;
  }
  if (!Object.keys(patch).length) { status("Niets gewijzigd."); return; }
  try { await saveItem(it, patch); status("Opgeslagen."); } catch (err) { status(why(err)); }
});
