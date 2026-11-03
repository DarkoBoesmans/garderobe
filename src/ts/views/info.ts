// Colofon: wie, welke gegevens, waarom, hoe lang, rechten, gebruiksregels en bronnen. Ook leesbaar zonder account.
import { S } from "../state";
import { exportAll, why, wipeAll } from "../store";
import type { View } from "./shell";

const $ = (id: string) => document.getElementById(id)!;
export const CONTACT = "darkoboesmans@gmail.com";

export const info: View = {
  title: "Colofon",
  mount(el) {
    el.innerHTML = `
<section class="c-hero">
  <div><p class="c-hero__kicker">Privacy, voorwaarden en bronnen</p><h1 class="c-hero__title">Colofon</h1></div>
  <div><p class="c-hero__dek">Wat deze app bewaart, waarom, hoe lang, en hoe je het weer weghaalt. Laatst bijgewerkt op 3 november 2026.</p></div>
</section>
<div class="c-prose">
  <section aria-labelledby="i1"><h2 id="i1">Wie is verantwoordelijk</h2>
    <p>Garderobe is een gratis, niet-commercieel project van Darko Boesmans, privépersoon in België. Hij is de verwerkingsverantwoordelijke voor je gegevens. Contact voor alle vragen, verzoeken en meldingen: <b>${CONTACT}</b>.</p>
    <p>Er wordt niets verkocht. Er zijn geen advertenties, affiliate links, betalingen of abonnementen.</p></section>

  <section aria-labelledby="i2"><h2 id="i2">Welke gegevens, waarvoor en op welke grond</h2>
    <ul>
      <li><b>Account</b>: je e-mailadres en een versleuteld wachtwoord, om in te loggen. Grond: de overeenkomst die je aangaat door een account te maken (art. 6.1.b AVG). Een account kan enkel op uitnodiging.</li>
      <li><b>Je kast</b>: foto's van kleding, wat je erover invult, outfits, wanneer je iets droeg, favorieten en lichaamsmaten die je zelf ingeeft. Alles is optioneel. Grond: dezelfde overeenkomst; je vraagt de app om dit bij te houden.</li>
      <li><b>De demo</b>: een anoniem account zonder e-mailadres. Grond: gerechtvaardigd belang (art. 6.1.f AVG) om het project te kunnen tonen. Alles wordt na 24 uur automatisch gewist.</li>
      <li><b>Technische gegevens</b>: IP-adres en tijdstip in de serverlogs van de hosting (zie verder). Grond: gerechtvaardigd belang, voor de beveiliging.</li>
    </ul>
    <p>Foto's worden in je browser opnieuw gecodeerd voor ze worden opgeladen. Daardoor verdwijnt alle metadata, ook de GPS-locatie die een gsm in een foto stopt. Er worden geen profielen gemaakt, geen gegevens verkocht of gedeeld voor marketing en geen nieuwsbrieven verstuurd. De app is bedoeld voor wie 16 jaar of ouder is.</p></section>

  <section aria-labelledby="i3"><h2 id="i3">Waar het staat en wie het ziet</h2>
    <ul>
      <li><b>Supabase</b> (database, login en foto's), servers in Frankfurt, EU. Elke rij en elke foto is beveiligd met regels in de database zelf: je ziet alleen je eigen kast. Foto's zijn privé en worden getoond via links die na een uur verlopen.</li>
      <li><b>GitHub Pages</b> (de website zelf), GitHub Inc., VS. GitHub ziet je IP-adres wanneer je de site laadt. Doorgifte naar de VS gebeurt onder het EU-VS Data Privacy Framework.</li>
      <li><b>IMG.LY</b>: bij het eerste gebruik van "Achtergrond weghalen" haalt je browser een rekenmodel op bij staticimgly.com. Daarbij ziet die dienst je IP-adres; je foto's verlaten je toestel daarvoor niet.</li>
    </ul>
    <p>Niemand anders krijgt je gegevens, behalve als de wet dat verplicht.</p></section>

  <section aria-labelledby="i4"><h2 id="i4">Hoe lang</h2>
    <p>Zolang je account bestaat. Verwijder je je account, dan verdwijnt alles meteen: stukken, foto's, outfits, maten en het account zelf. Demo-accounts worden na 24 uur gewist. Serverlogs volgen de bewaartermijnen van Supabase en GitHub.</p></section>

  <section aria-labelledby="i5"><h2 id="i5">Cookies en opslag</h2>
    <p>Er zijn geen cookies, analytics, pixels of embeds. Om je ingelogd te houden bewaart de site je sessie in de lokale opslag van je browser. Dat is strikt noodzakelijk voor wat je vraagt en heeft daarom geen toestemming nodig. Uitloggen wist die sessie.</p></section>

  <section aria-labelledby="i6"><h2 id="i6">Je rechten</h2>
    <p>Je hebt recht op inzage, verbetering, wissing, beperking, overdraagbaarheid en bezwaar. Inzage, overdraagbaarheid en wissing doe je zelf hieronder. Voor de rest mail je naar het adres bovenaan; je krijgt binnen een maand antwoord. Ben je niet tevreden, dan kun je een klacht indienen bij de Gegevensbeschermingsautoriteit, Drukpersstraat 35, 1000 Brussel, <a href="https://www.gegevensbeschermingsautoriteit.be">gegevensbeschermingsautoriteit.be</a>.</p>
    ${S.uid ? `<div class="c-actions c-actions--start" id="iacts">
      <button type="button" class="c-btn c-btn--ghost" data-export>Download mijn gegevens (JSON)</button>
      ${S.canWrite ? `<button type="button" class="c-btn c-btn--danger" data-wipe="data">Wis mijn kast</button>
      <button type="button" class="c-btn c-btn--danger" data-wipe="account">Verwijder mijn account</button>` : ""}
      <span class="c-actions__status" role="status" id="istat"></span>
    </div>` : `<p><a href="./">Log in</a> om je gegevens te downloaden of te wissen.</p>`}</section>

  <section aria-labelledby="i7"><h2 id="i7">Gebruiksregels</h2>
    <ul>
      <li>Laad alleen foto's op van kleding die je zelf mag gebruiken, liefst zonder personen erop. Geen foto's van anderen zonder hun toestemming, en niets wat onwettig of kwetsend is of wat je niet mag gebruiken.</li>
      <li>Wat je oplaadt, is alleen voor jou zichtbaar. In de demo wordt het na 24 uur gewist.</li>
      <li>Zie je toch iets wat niet mag, of gaat iets over jou of je werk: mail het adres bovenaan met de plek en de reden. Elke melding wordt bekeken en onwettige inhoud wordt zo snel mogelijk verwijderd.</li>
      <li>De app is gratis en wordt geleverd zoals ze is, zonder garantie dat ze altijd werkt of foutloos is. Download zelf een kopie van wat je niet wilt verliezen. Behalve bij opzet of grove fout is er geen aansprakelijkheid voor verlies van gegevens of schade door het gebruik. Wie deze regels breekt, kan de toegang verliezen.</li>
      <li>Op deze voorwaarden is het Belgisch recht van toepassing.</li>
    </ul></section>

  <section aria-labelledby="i8"><h2 id="i8">Bronnen en rechten</h2>
    <p>De foto's van de demo-kast en het demo-lookbook komen van Unsplash en vallen onder de Unsplash License. Ze zijn gemaakt door Caio Coelho, Haryo Setyadi, Cristofer Maximilian, Mediamodifier, Chris Lynch, Yuliia Pakhomova, TuanAnh Blue, engin akyurt, Jake Weirick, Henry Kobutra, Marija Zaric, Fabio T., sonu kumar, Yap, Anna Evans, Claire Abdo, Tamas Pap, personalgraphic.com, Jason Leung, Christian Agbede, Korie Cull, Fábio Alves, Alessia C_Jpg en Kyle Loftus. Jules is verzonnen. Merknamen in de demo beschrijven alleen wat een stuk is; er is geen band met die merken.</p>
    <p>De lookbooks van ingelogde gebruikers zijn privé en enkel voor eigen gebruik, met een link naar de winkel. Wil een winkel of merk iets weg, mail dan het adres bovenaan.</p>
    <p>De broncode is open onder de AGPL-3.0, net als de achtergrondverwijderaar van IMG.LY. Lettertypes: IBM Plex Mono en Archivo, beide onder de SIL Open Font License. Gemaakt door Darko Boesmans.</p></section>

  <section aria-labelledby="i9"><h2 id="i9">Toegankelijkheid</h2>
    <p>Alles werkt met het toetsenbord (Tab, Enter, Escape), knoppen zeggen wat ze doen, foto's hebben een beschrijving en tekst haalt minstens contrast 4,5:1 in licht en donker thema. Werkt er iets niet? Mail het adres bovenaan.</p></section>
</div>`;
  },
  update() {},
};

document.addEventListener("click", async (e) => {
  const t = e.target as HTMLElement;
  if (t.closest("[data-export]")) { exportAll(); $("istat").textContent = "Download gestart."; return; }
  const w = t.closest<HTMLElement>("[data-wipe]");
  if (w) {
    const acc = w.dataset.wipe === "account";
    $("iacts").innerHTML = `<div class="c-confirm" role="alertdialog" aria-labelledby="wq">
  <p id="wq">${acc ? "Je account en" : "Alles in je kast:"} ${S.items.length} stukken, foto's, outfits en maten definitief wissen? Dit kan niet ongedaan worden.</p>
  <button type="button" class="c-btn c-btn--ghost" data-wipe-no>Nee, niets wissen</button>
  <button type="button" class="c-btn c-btn--danger" data-wipe-yes="${acc ? "account" : "data"}">Ja, ${acc ? "verwijder mijn account" : "wis alles"}</button>
  <span class="c-actions__status" role="status" id="istat"></span></div>`;
    (document.querySelector("[data-wipe-no]") as HTMLElement).focus();
    return;
  }
  if (t.closest("[data-wipe-no]")) { info.mount(document.getElementById("view")!); return; }
  const y = t.closest<HTMLElement>("[data-wipe-yes]");
  if (y) {
    $("istat").textContent = "Bezig met wissen…";
    try { await wipeAll(y.dataset.wipeYes === "account"); $("istat").textContent = "Alles is gewist."; } catch (err) { $("istat").textContent = why(err); }
  }
});
