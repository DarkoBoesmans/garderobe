// Voorpagina: genummerd menu, een platgelegde outfit als opener, de drie kasten als tijdschriftcovers,
// hoe het werkt in vier stappen, de cijfers en de drie redenen in grote gestapelde woorden.
import { readFileSync } from "node:fs";

interface Look { items: { id: string; sh: string; k: number; d: string; s: string }[]; dirs: { n: string; p: string[] }[]; sheets: Record<string, [number, number, number]> }

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);
const book = (k: string) => JSON.parse(readFileSync(`data/${k}-lookbook.json`, "utf8")) as Look;

function sprite(look: Look, id: string, base: string, cls: string) {
  const x = look.items.find((i) => i.id === id)!;
  const [c, r, ratio] = look.sheets[x.sh]!;
  const pos = `${c > 1 ? ((x.k % c) * 100) / (c - 1) : 0}% ${r > 1 ? (Math.floor(x.k / c) * 100) / (r - 1) : 0}%`;
  return `<span class="${cls}" role="img" aria-label="${esc(`${x.s}: ${x.d}`)}" style="aspect-ratio:${ratio};background-image:url(${base}/${x.sh}.jpg);background-size:${c * 100}% ${r * 100}%;background-position:${pos}"></span>`;
}

/** Een uitsnede uit de demo-kast als echte <img>, met vaste afmetingen tegen verspringen. */
const cut = (f: string, w: number, h: number, alt: string, cls = "", eager = false) =>
  `<img class="${cls}" src="app/demo/${f}-s.webp" width="${w}" height="${h}" alt="${esc(alt)}"${eager ? ' fetchpriority="high"' : ' loading="lazy"'} decoding="async">`;

function cover(p: { key: string; name: string; issue: string; theme: string; href: string; cta: string; facts: string }, art: string, inset: string) {
  return `<a class="c-cover" href="${p.href}" data-person="${p.key === "jules" ? "darko" : p.key}">
  <span class="c-cover__mast"><span>Garderobe</span><span>${p.issue}</span></span>
  ${art}
  <span class="c-cover__inset">${inset}</span>
  <span class="c-cover__lines">
    <span class="c-cover__name">${p.name}<em>.</em></span>
    <span class="c-cover__theme">${esc(p.theme)}</span>
    <span class="c-cover__facts">${p.facts}</span>
  </span>
  <span class="c-cover__cta">${p.cta}</span>
</a>`;
}

function covers() {
  const jules = cover({ key: "jules", name: "Jules", issue: "N° 00", theme: "Vintage streetwear", href: "app/#demo", cta: "Open de demo, zonder account", facts: "14 stuks · alles tweedehands · verzonnen" },
    `<span class="c-cover__hero c-cover__hero--cut">${cut("denim-c", 793, 900, "Raw denim trucker jacket")}</span>`,
    `${cut("vans-rood-c", 900, 631, "Rode suède sneakers", "c-cover__thumb c-cover__thumb--cut")}${cut("jeans-licht-c", 606, 784, "Lichte baggy jeans", "c-cover__thumb c-cover__thumb--cut")}`);
  const real = [
    { key: "darko", name: "Darko", issue: "N° 01", theme: "Warme heritage casual" },
    { key: "lana", name: "Lana", issue: "N° 02", theme: "Dark academia voor kantoor" },
  ].map((p) => {
    const look = book(p.key), [hero, ...rest] = look.dirs[0]!.p, base = `app/sheets/${p.key}`;
    return cover({ ...p, href: "app/", cta: "Log in om je kast te openen", facts: `${look.items.length} stuks in het lookbook · ${look.dirs.length} looks` },
      sprite(look, hero!, base, "c-cover__hero"), rest.slice(0, 2).map((id) => sprite(look, id, base, "c-cover__thumb")).join(""));
  });
  return [jules, ...real].join("");
}

const STEPS: [string, string, string][] = [
  ["Fotografeer", "Leg een stuk op een effen ondergrond en neem een foto. De locatie en andere gegevens in de foto worden gewist voor hij je toestel verlaat.", cut("denim-o", 762, 1200, "Spijkerjas aan een hanger tegen een donkere muur")],
  ["De achtergrond verdwijnt", "Je browser knipt het stuk uit, zonder dat de foto ergens anders heen gaat. Lukt het niet goed, dan hou je met één klik de gewone foto.", cut("denim-c", 793, 900, "Dezelfde spijkerjas, uitgeknipt")],
  ["Leg een outfit", "Tik een vak, kies een stuk. Of laat \"Verras me\" kiezen, dat slaat over wat je de laatste dagen al droeg.", `<span class="c-front-step__lay">${cut("trui-roest-c", 900, 642, "Roestbruine trui")}${cut("jeans-zwart-c", 478, 900, "Zwarte jeans")}${cut("converse-c", 694, 845, "Witte sneakers")}</span>`],
  ["Koop niets dubbel", "Bij elk stuk in het lookbook zie je \"Heb je al\" als je iets gelijkaardigs hebt, en anders meteen je eigen maat voor dat merk.", `<span class="c-front-step__tags"><span class="c-tag">Heb je al: Chuck Taylor low</span><span class="c-tag c-tag--accent">Jouw maat: L</span></span>`],
];

export function landing(darkoCount: number, lanaCount: number) {
  return `
<a class="c-skip" href="#main">Naar de inhoud</a>
<header class="c-front-nav o-wrap">
  <a class="c-front-nav__mark" href="./" aria-label="G. Garderobe, naar de voorpagina">G<em>.</em></a>
  <nav class="c-front-nav__menu" aria-label="Voorpagina">
    <a href="#kasten"><small>01</small>Kasten</a>
    <a href="#werking"><small>02</small>Werking</a>
    <a href="#waarom"><small>03</small>Waarom</a>
    <a href="app/#info"><small>04</small>Colofon</a>
  </nav>
  <a class="c-btn c-btn--small c-btn--ghost" href="app/">Inloggen</a>
</header>
<main id="main" tabindex="-1">
  <section class="c-front-hero o-wrap" aria-labelledby="t">
    <div class="c-front-hero__text">
      <p class="c-hero__kicker">N° 00 tot 02 · Herfst / winter 2026</p>
      <h1 class="c-front-hero__title" id="t">Garde<em>robe.</em></h1>
      <p class="c-front-hero__dek">Je kleerkast, uitgeknipt en op papier gelegd. Met outfits, maten en een lookbook dat weet wat je al hebt.</p>
      <p class="c-front-hero__acts"><a class="c-btn" href="app/#demo">Bekijk de demo</a> <a class="c-btn c-btn--ghost" href="app/">Log in op je kast</a></p>
    </div>
    <div class="c-front-hero__lay" aria-hidden="true">
      ${cut("denim-c", 793, 900, "", "c-front-hero__p c-front-hero__p--1", true)}
      ${cut("tee-wit-c", 574, 900, "", "c-front-hero__p c-front-hero__p--2", true)}
      ${cut("jeans-licht-c", 606, 784, "", "c-front-hero__p c-front-hero__p--3")}
      ${cut("vans-rood-c", 900, 631, "", "c-front-hero__p c-front-hero__p--4")}
      ${cut("pet-geel-c", 720, 482, "", "c-front-hero__p c-front-hero__p--5")}
    </div>
  </section>

  <section class="c-front-sec o-wrap" id="kasten" aria-labelledby="h1">
    <h2 class="c-front-sec__title" id="h1"><small>01</small>Drie kasten</h2>
    <p class="c-front-sec__dek">Jules is verzonnen en open voor iedereen. De kasten van Darko en Lana zijn echt en staan achter een account.</p>
    <div class="c-front-covers">${covers()}</div>
  </section>

  <section class="c-front-sec o-wrap" id="werking" aria-labelledby="h2">
    <h2 class="c-front-sec__title" id="h2"><small>02</small>Zo werkt het</h2>
    <ol class="c-front-steps">${STEPS.map(([t, d, art], i) => `
      <li class="c-front-step"><span class="c-front-step__art">${art}</span>
        <span class="c-front-step__no">0${i + 1}</span><h3 class="c-front-step__title">${t}</h3><p>${esc(d)}</p></li>`).join("")}
    </ol>
  </section>

  <section class="c-front-nums o-wrap" aria-label="In cijfers">
    <p><b>${(darkoCount + lanaCount).toLocaleString("nl-BE")}</b><span>stuks in de lookbooks</span></p>
    <p><b>14</b><span>stuks in de demo-kast</span></p>
    <p><b>24 u</b><span>tot de demo zichzelf wist</span></p>
    <p><b>0</b><span>trackers, advertenties of cookies</span></p>
  </section>

  <section class="c-front-sec o-wrap" id="waarom" aria-labelledby="h3">
    <h2 class="c-front-sec__title" id="h3"><small>03</small>Waarom</h2>
    <p class="c-front-stack"><span>Weet wat</span><em>je hebt.</em><span>Weet wat</span><em>past.</em><span>Koop niets</span><em>dubbel.</em></p>
    <p class="c-front-hero__acts"><a class="c-btn" href="app/#demo">Bekijk de demo</a></p>
  </section>
</main>
<footer class="c-front-foot o-wrap">
  <span class="c-front-foot__mark">Garde<em>robe.</em></span>
  <nav aria-label="Voettekst"><a href="app/#demo">Demo</a><a href="app/">Inloggen</a><a href="app/#info">Privacy en colofon</a><a href="https://github.com/DarkoBoesmans/garderobe">Broncode op GitHub</a></nav>
  <small>Niet commercieel. AGPL-3.0. Een project van Darko Boesmans.</small>
</footer>`;
}
