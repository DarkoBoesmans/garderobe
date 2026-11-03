// Voorpagina als wasetiket: grote uitsneden op wit, een strook met wasvoorschriften,
// de demo-kast als archiefraster, hoe het werkt per symbool, en de drie kasten als geweven labels.
import { CARE, top } from "../src/ts/views/top.ts";

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);

/** Een uitsnede uit de demo-kast (kleine versie), met vaste afmetingen tegen verspringen. */
const cut = (f: string, w: number, h: number, alt: string, eager = false) =>
  `<img src="app/demo/${f}-s.webp" width="${w}" height="${h}" alt="${esc(alt)}"${eager ? ' fetchpriority="high"' : ' loading="lazy"'} decoding="async">`;

// [bestand, breedte, hoogte, naam, maat, materiaal]
const KAST: [string, number, number, string, string, string][] = [
  ["denim-c", 388, 440, "Trucker jacket", "M", "Denim"],
  ["flanel-c", 296, 440, "Flanellen overshirt", "L", "Katoen"],
  ["hoodie-wit-c", 259, 440, "Witte hoodie", "M", "Katoen"],
  ["tee-wit-c", 281, 440, "Wit T-shirt", "M", "Katoen"],
  ["tee-grijs-c", 313, 440, "Gemêleerd T-shirt", "M", "Katoen"],
  ["trui-roest-c", 440, 314, "Grofgebreide trui", "L", "Wol"],
  ["jeans-zwart-c", 234, 440, "Zwarte slim jeans", "W32 L32", "Denim"],
  ["jeans-licht-c", 340, 440, "Lichte baggy jeans", "W33 L32", "Denim"],
  ["broek-grijs-c", 167, 440, "Grijze werkbroek", "W32 L32", "Katoen"],
  ["vans-rood-c", 440, 308, "Rode suède sneakers", "43", "Suède"],
  ["converse-c", 361, 440, "Witte canvas sneakers", "43", "Canvas"],
  ["pet-trucker-c", 423, 440, "Trucker cap", "One size", "Polyester"],
  ["pet-geel-c", 440, 295, "Gele dad cap", "One size", "Katoen"],
];

const STEPS: [keyof typeof CARE, string, string][] = [
  ["wash", "Fotografeer een stuk", "Op een effen ondergrond, met je gsm. De locatie en andere gegevens in de foto worden gewist voor hij je toestel verlaat."],
  ["nobleach", "De achtergrond verdwijnt", "Je browser knipt het stuk uit; de foto gaat daarvoor nergens heen. Lukt het niet goed, dan hou je met één klik de gewone foto."],
  ["iron", "Leg een outfit", "Kies per vak een stuk, of laat de app kiezen. Wat je de laatste dagen droeg, slaat hij over."],
  ["nodry", "Koop niets dubbel", "Bij een stuk dat je wilt kopen zie je of je al iets gelijkaardigs hebt, en anders meteen je maat voor dat merk."],
];

function label(name: string, kind: string, lines: string[], href: string, cta: string, primary = false) {
  return `<article class="c-label">
  <p class="c-label__kind">${kind}</p>
  <h3 class="c-label__name">${name}</h3>
  <ul class="c-label__lines">${lines.map((l) => `<li>${l}</li>`).join("")}</ul>
  <a class="c-btn${primary ? "" : " c-btn--ghost"}" href="${href}">${cta}</a>
</article>`;
}

export function landing() {
  const kast = KAST;
  return `
<a class="c-skip" href="#main">Naar de inhoud</a>
${top("")}
<main id="main" tabindex="-1">
  <section class="c-tag-hero o-wrap" aria-labelledby="t">
    <h1 class="c-tag-hero__title" id="t">Garderobe</h1>
    <p class="c-tag-hero__lead">Je kleerkast in je broekzak. Wat je hebt, wat past, en wat je dus niet nog eens koopt.</p>
    <div class="c-tag-hero__lay">
      <figure>${cut("denim-c", 388, 440, "Spijkerjas, uitgeknipt", true)}<figcaption>Trucker jacket · M · denim</figcaption></figure>
      <figure>${cut("jeans-licht-c", 340, 440, "Lichte jeans, uitgeknipt", true)}<figcaption>Baggy jeans · W33 · denim</figcaption></figure>
      <figure>${cut("vans-rood-c", 440, 308, "Rode sneakers, uitgeknipt")}<figcaption>Sneakers · 43 · suède</figcaption></figure>
    </div>
    <dl class="c-care">
      <div><dt>Samenstelling</dt><dd>100% je eigen kleren</dd></div>
      <div><dt>Maat</dt><dd>De jouwe, per merk</dd></div>
      <div><dt>Onderhoud</dt><dd class="c-care__icons">${CARE.wash}${CARE.nobleach}${CARE.iron}${CARE.nodry}</dd></div>
      <div><dt>Bewaren</dt><dd>In de EU, privé</dd></div>
    </dl>
    <p class="c-tag-hero__acts"><a class="c-btn" href="app/#demo">Open de demo</a><a class="c-btn c-btn--ghost" href="app/">Inloggen</a></p>
  </section>

  <section class="c-archive o-wrap" aria-labelledby="h1">
    <div class="c-archive__head"><h2 class="c-sec-title" id="h1">De demo-kast</h2><p>Jules is verzonnen. Dit is wat Jules heeft, uitgeknipt en gesorteerd. Open de demo om er outfits mee te leggen.</p></div>
    <ul class="c-archive__grid">${kast.map(([f, w, h, n, m, mat]) => `
      <li class="c-archive__item">${cut(f, w, h, n)}<p><b>${esc(n)}</b><span>${esc(m)} · ${esc(mat)}</span></p></li>`).join("")}
      <li class="c-archive__item c-archive__item--more"><a href="app/#demo">Leg er een outfit mee</a></li>
    </ul>
  </section>

  <section class="c-steps o-wrap" id="werking" aria-labelledby="h2">
    <h2 class="c-sec-title" id="h2">Werking</h2>
    <ol class="c-steps__list">${STEPS.map(([icon, t, d]) => `
      <li><span class="c-steps__icon">${CARE[icon]}</span><h3>${t}</h3><p>${esc(d)}</p></li>`).join("")}
    </ol>
  </section>

  <section class="c-labels o-wrap" aria-labelledby="h3">
    <h2 class="c-sec-title" id="h3">Drie kasten</h2>
    <div class="c-labels__row">
      ${label("Jules", "Demo · verzonnen", ["14 stuks, alles tweedehands", "Open voor iedereen, zonder account", "Na 24 uur gewist"], "app/#demo", "Open de demo", true)}
      ${label("Darko", "Privé", ["Eigen kast en een privé lookbook", "Alleen na inloggen", "Op uitnodiging"], "app/", "Inloggen")}
      ${label("Lana", "Privé", ["Eigen kast en een privé lookbook", "Alleen na inloggen", "Op uitnodiging"], "app/", "Inloggen")}
    </div>
  </section>
</main>
<footer class="c-foot o-wrap">
  <p>Gemaakt door Darko Boesmans</p>
  <nav aria-label="Voettekst"><a href="app/#info">Privacy en voorwaarden</a><a href="https://github.com/DarkoBoesmans/garderobe">Broncode (AGPL-3.0)</a></nav>
  <p>Niet commercieel · Geen cookies · Geen trackers</p>
</footer>`;
}
