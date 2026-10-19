// Voorpagina van de openbare site: twee tijdschriftcovers naast elkaar, gemaakt uit echte stukken.
import { readFileSync } from "node:fs";

interface Look { items: { id: string; sh: string; k: number; d: string; s: string }[]; dirs: { n: string; p: string[] }[]; sheets: Record<string, [number, number, number]> }

const COVERS = [
  { key: "lana", name: "Lana", issue: "N° 02", theme: "Dark academia voor kantoor" },
  { key: "darko", name: "Darko", issue: "N° 01", theme: "Warme heritage casual" },
];

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);

function sprite(look: Look, id: string, base: string, cls: string) {
  const x = look.items.find((i) => i.id === id)!;
  const [c, r, ratio] = look.sheets[x.sh]!;
  const pos = `${c > 1 ? ((x.k % c) * 100) / (c - 1) : 0}% ${r > 1 ? (Math.floor(x.k / c) * 100) / (r - 1) : 0}%`;
  return `<span class="${cls}" role="img" aria-label="${esc(`${x.s}: ${x.d}`)}" style="aspect-ratio:${ratio};background-image:url(${base}/sheets/${x.sh}.jpg);background-size:${c * 100}% ${r * 100}%;background-position:${pos}"></span>`;
}

export function landing() {
  return COVERS.map((p) => {
    const look = JSON.parse(readFileSync(`data/${p.key}-lookbook.json`, "utf8")) as Look;
    const [hero, ...rest] = look.dirs[0]!.p;
    return `<a class="c-cover" href="${p.key}/" data-person="${p.key}">
  <span class="c-cover__mast"><span>Garderobe</span><span>${p.issue}</span></span>
  ${sprite(look, hero!, p.key, "c-cover__hero")}
  <span class="c-cover__inset">${rest.slice(0, 2).map((id) => sprite(look, id, p.key, "c-cover__thumb")).join("")}</span>
  <span class="c-cover__lines">
    <span class="c-cover__name">${p.name}<em>.</em></span>
    <span class="c-cover__theme">${esc(p.theme)}</span>
    <span class="c-cover__facts">${look.items.length} stuks · ${new Set(look.items.map((i) => i.s)).size} winkels · ${look.dirs.length} looks</span>
  </span>
  <span class="c-cover__cta">Open het lookbook</span>
</a>`;
  }).join("");
}
