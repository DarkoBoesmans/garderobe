// Open vragen over stukken: één tik op een suggestie of zelf typen.
import { S, render } from "../state";
import { answer, why } from "../store";
import type { Item, Question } from "../types";
import { arr, esc } from "../util";
import { bodySizeFor, fieldLabel, isFoot, known, photosOf } from "./fields";

let showAll = false;

function suggestions(q: Question, it: Item) {
  let o = arr(q.options);
  if (q.field === "size") { const b = bodySizeFor(it.category); if (b) o = [b, ...o.filter((x) => x !== b)]; }
  if (o.length) return o;
  return [...new Set([...known(q.field, it.category), ...known(q.field, isFoot(it.category) ? undefined : "*kleding")])].slice(0, 6);
}

export function questionsHtml() {
  const open = S.qs.filter((q) => q.status === "open");
  if (!open.length) return "";
  const shown = showAll ? open : open.slice(0, 6);
  const dis = S.canWrite ? "" : " disabled";
  return `<section class="c-questions" aria-labelledby="q-t">
  <div class="c-looks__head"><h2 class="c-chapter__title" id="q-t">Vragen voor jou</h2><span class="c-chapter__count">${open.length} open</span></div>
  <p class="c-chapter__note">Kies een suggestie of typ zelf. Het antwoord gaat meteen in het stuk en dezelfde vraag komt niet terug, ook niet na "Weet ik niet".</p>
  <div class="c-questions__list">${shown.map((q) => {
    const it = S.items.find((i) => i.id === q.itemId) ?? ({ id: "" } as Item);
    const p = photosOf(it)[0];
    return `<article class="c-question">
    ${p ? `<img class="c-question__img" src="${esc(p)}" alt="">` : `<span class="c-question__img"></span>`}
    <div><p class="c-question__field">${esc(fieldLabel(q.field))} · ${esc(it.brand || it.name || "Nieuw stuk")}</p>
      <p class="c-question__text" id="qt-${esc(q.id)}">${esc(q.question)}</p>
      <form class="c-question__form" data-qf="${esc(q.id)}" aria-labelledby="qt-${esc(q.id)}">
        ${suggestions(q, it).map((o) => `<button type="button" class="c-chip" data-pick="${esc(o)}"${dis}>${esc(o)}</button>`).join("")}
        <label class="u-sr-only" for="qa-${esc(q.id)}">Jouw antwoord</label>
        <input id="qa-${esc(q.id)}" name="a" autocomplete="off" placeholder="Of typ je antwoord"${dis}>
        <button class="c-btn c-btn--small"${dis}>Bewaar antwoord</button>
        <button type="button" class="c-link-btn" data-skip-q${dis}>Weet ik niet</button>
        <span class="c-actions__status" role="status"></span>
      </form></div></article>`;
  }).join("")}</div>
  ${open.length > shown.length ? `<button type="button" class="c-btn c-btn--ghost" data-allq>Toon alle ${open.length} vragen</button>` : ""}
</section>`;
}

async function send(form: HTMLFormElement, val: string | null) {
  const q = S.qs.find((x) => x.id === form.dataset.qf);
  if (!q) return;
  if (val != null) val = known(q.field).find((v) => v.toLowerCase() === val!.toLowerCase()) ?? val;
  try { await answer(q, val); } catch (e) { form.querySelector("[role=status]")!.textContent = why(e); }
}

document.addEventListener("click", (e) => {
  const t = e.target as HTMLElement;
  if (t.closest("[data-allq]")) { showAll = true; render(); return; }
  const form = t.closest<HTMLFormElement>("[data-qf]");
  if (!form) return;
  const pick = t.closest<HTMLElement>("[data-pick]");
  if (pick) send(form, pick.dataset.pick!);
  else if (t.closest("[data-skip-q]")) send(form, null);
});
document.addEventListener("submit", (e) => {
  const form = (e.target as HTMLElement).closest<HTMLFormElement>("[data-qf]");
  if (!form) return;
  e.preventDefault();
  const v = (form.elements.namedItem("a") as HTMLInputElement).value.trim();
  if (v) send(form, v);
});
