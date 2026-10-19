// Maten: meetformulier links, live maatadvies rechts.
import { S } from "../state";
import { shiftSize } from "../sizes/shared";
import { saveBody, why } from "../store";
import type { Body, BodyField } from "../types";
import { esc, fmtDate } from "../util";
import type { View } from "./shell";

const FITS: [string, string][] = [["normaal", "Valt normaal"], ["klein", "Valt klein (kies groter)"], ["groot", "Valt groot (kies kleiner)"]];
const fields = (): BodyField[] => S.person.sizes.groups.flatMap((g) => g[1]);
const $ = (id: string) => document.getElementById(id);

const kindOf = (cat?: string) => Object.keys(S.person.sizes.kind).find((k) => S.person.sizes.kind[k]!.includes(cat ?? ""));

/** Per merk de soorten kleding die je ervan hebt, zodat een correctie op het juiste advies werkt. */
function brandKinds(): [string, string][] {
  const m = new Set<string>();
  for (const i of S.items) { const k = kindOf(i.category); if (i.brand && k) m.add(i.brand + "|" + k); }
  return [...m].map((s) => s.split("|") as [string, string]).sort((a, b) => a[0].localeCompare(b[0]));
}

const inKast = (kind: string) =>
  [...new Set(S.items.filter((i) => kindOf(i.category) === kind && i.size).map((i) => `${i.size} (${i.brand || i.name})`))].slice(0, 3).join(", ");

/** Wat nu in het formulier staat; zo ververst het advies terwijl je typt. */
function formBody(): Body {
  const f = $("bodyForm") as HTMLFormElement | null;
  if (!f) return S.body;
  const B: Body = { brandFit: {} };
  for (const [k] of fields()) {
    const v = (f.elements.namedItem(k) as HTMLInputElement).value.replace(",", ".").trim();
    if (v !== "" && +v > 0) B[k] = +v;
  }
  f.querySelectorAll<HTMLSelectElement>("[data-brand]").forEach((s) => { if (s.value !== "normaal") B.brandFit![s.dataset.brand!] = s.value; });
  return B;
}

function adviceHtml(B: Body) {
  const adv = S.person.sizes.advice(B), fit = B.brandFit ?? {};
  const perBrand = brandKinds().map(([b, k]) => {
    const a = adv.find((r) => r[3] === k), f = fit[b];
    return a && f ? [b, a[0], shiftSize(a[1], f === "klein" ? 1 : -1), f] : null;
  }).filter((x): x is string[] => !!x);
  const row = (what: string, size: string, why: string) =>
    `<div class="c-advice__row"><span class="c-advice__what">${esc(what)}</span><span class="c-advice__size">${esc(size)}</span><span class="c-advice__why">${esc(why)}</span></div>`;
  return `<h2 class="c-advice__title">Jouw <em class="u-accent">maten.</em></h2>
${adv.length ? adv.map(([w, s, y, k]) => row(w, s, y + (inKast(k) ? ` In je kast: ${inKast(k)}.` : ""))).join("") : `<p class="c-empty">Vul borst, taille of voetlengte in voor je eerste maatadvies.</p>`}
${perBrand.length ? `<h3 class="c-maten__legend">Per merk</h3>${perBrand.map(([b, w, s, f]) => row(b!, s!, `${w}, valt ${f}.`)).join("")}` : ""}
<p class="c-maten__hint">Algemene EU-tabel. Merken vallen verschillend: zet bij "Per merk" hoe een merk bij jou valt.</p>`;
}

export const maten: View = {
  title: "Maten",
  mount(el) {
    const B = S.body, d = S.canWrite ? "" : " disabled", brands = [...new Set(brandKinds().map((x) => x[0]))];
    el.innerHTML = `
<section class="c-hero">
  <div><p class="c-hero__kicker">Wie je bent${B.measuredAt ? " · gemeten " + esc(fmtDate(B.measuredAt)) : ""}</p><h1 class="c-hero__title">Ma<em>ten.</em></h1></div>
  <div><p class="c-hero__theme">Tien minuten, één lintmeter.</p><p class="c-hero__dek">Meet over ondergoed of een dun T-shirt, met een spiegel of iemand die helpt. Elke maat die je invult geeft meteen advies, en het lookbook toont daarna bij elk stuk jouw maat.</p></div>
</section>
<div class="c-maten">
  <form id="bodyForm" novalidate>
    ${S.person.sizes.groups.map(([g, fs]) => `<fieldset class="c-maten__group"><legend class="c-maten__legend">${esc(g)}</legend>${fs.map(([k, l, u, h]) => `
      <div class="c-maten__row"><label class="c-maten__label" for="b-${k}">${esc(l)}</label>
        <span class="c-maten__input"><input id="b-${k}" name="${k}" type="number" inputmode="decimal" step="0.5" min="0" max="400" value="${esc(B[k] ?? "")}" aria-describedby="h-${k}"${d}><span class="c-maten__unit">${u}</span></span>
        <span class="c-maten__hint" id="h-${k}">${esc(h)}</span></div>`).join("")}</fieldset>`).join("")}
    ${brands.length ? `<fieldset class="c-maten__group"><legend class="c-maten__legend">Per merk</legend>${brands.map((b, i) => `
      <div class="c-maten__row"><label class="c-maten__label" for="bf-${i}">${esc(b)}</label>
        <select id="bf-${i}" data-brand="${esc(b)}"${d}>${FITS.map(([v, l]) => `<option value="${v}"${(B.brandFit?.[b] ?? "normaal") === v ? " selected" : ""}>${l}</option>`).join("")}</select></div>`).join("")}</fieldset>` : ""}
    <div class="c-actions"><span class="c-actions__status" id="bstat" role="status"></span>${S.canWrite ? `<button class="c-btn">Maten bewaren</button>` : ""}</div>
  </form>
  <aside class="c-advice" id="madv" aria-live="polite"></aside>
</div>`;
    $("bodyForm")!.addEventListener("input", () => { $("madv")!.innerHTML = adviceHtml(formBody()); });
    $("bodyForm")!.addEventListener("submit", async (e) => {
      e.preventDefault();
      const f = e.target as HTMLFormElement, st = $("bstat")!, out: Record<string, unknown> = {};
      for (const [k, l] of fields()) {
        const inp = f.elements.namedItem(k) as HTMLInputElement, v = inp.value.replace(",", ".").trim();
        if (v === "") continue;
        if (!(+v > 0 && +v < 400)) { st.textContent = `${l}: vul een getal tussen 0 en 400 in.`; inp.focus(); return; }
        out[k] = +v;
      }
      out.brandFit = formBody().brandFit;
      try { await saveBody(out); st.textContent = "Bewaard. Het lookbook toont nu jouw maten."; } catch (err) { st.textContent = why(err); }
    });
  },
  update() {
    const a = $("madv");
    if (!a) return;
    // Niet hertekenen terwijl iemand typt; enkel het advies verversen.
    const typing = $("bodyForm")?.contains(document.activeElement);
    if (!typing) this.mount(document.getElementById("view")!);
    $("madv")!.innerHTML = adviceHtml(typing ? formBody() : S.body);
  },
};
