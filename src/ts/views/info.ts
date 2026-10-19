// Colofon: privacy, cookies, derden, rechten en "verwijder alles". Eerlijk en kort: dit is een privéproject.
import { S } from "../state";
import { exportAll, why, wipeAll } from "../store";
import type { View } from "./shell";

const $ = (id: string) => document.getElementById(id)!;

export const info: View = {
  title: "Colofon",
  mount(el) {
    const w = S.canWrite && !!S.db;
    el.innerHTML = `
<section class="c-hero">
  <div><p class="c-hero__kicker">Privacy, gegevens en bronnen</p><h1 class="c-hero__title">Colo<em>fon.</em></h1></div>
  <div><p class="c-hero__theme">Wat deze pagina bewaart, en hoe je het weer weghaalt.</p>
  <p class="c-hero__dek">Laatst bijgewerkt op 19 oktober 2026.</p></div>
</section>
<div class="c-prose">
  <section aria-labelledby="i1"><h2 id="i1">Wie en waarom</h2>
    <p>Een privéproject van Darko voor Darko en Lana: een digitale kleerkast en een lookbook. Er is geen bedrijf achter, er wordt niets verkocht, er zijn geen advertenties, affiliate links of betalingen. Daarom zijn er geen algemene voorwaarden, geen retourbeleid en geen kosten, verborgen of niet.</p></section>

  <section aria-labelledby="i2"><h2 id="i2">Welke gegevens</h2>
    <ul>
      <li>Foto's van kleding uit een map op Darko's pc, met wat erop te zien is (merk, kleur, maat, materiaal).</li>
      <li>Lichaamsmaten die je zelf invult op de pagina Maten. Alles is optioneel.</li>
      <li>Favorieten en verborgen stukken in het lookbook.</li>
    </ul>
    <p>Niet bewaard: naam, e-mailadres, adres, betaalgegevens, locatie, gegevens van kinderen. Er zijn geen formulieren die zulke gegevens vragen en er worden geen e-mails of nieuwsbrieven verstuurd.</p></section>

  <section aria-labelledby="i3"><h2 id="i3">Waar en wie het ziet</h2>
    <p>De gegevens staan in de database van deze pagina op claude.ai. Alleen mensen met wie de pagina gedeeld is kunnen ze zien. Er draait geen automatische scan meer: stukken komen er enkel bij als Darko of Claude ze toevoegt. </p>
    <p>Daarnaast staat er een openbare versie op GitHub Pages. Het lookbook is daar openbaar. De kleerkast en de maten staan er alleen versleuteld (AES-256, sleutel afgeleid van een wachtwoord dat niet op GitHub staat) en zijn enkel leesbaar na het intikken van dat wachtwoord. GitHub houdt als host technische gegevens bij, zoals IP-adressen in serverlogs.</p></section>

  <section aria-labelledby="i4"><h2 id="i4">Cookies en tracking</h2>
    <p>Deze pagina zet zelf geen cookies, gebruikt geen lokale opslag en heeft geen analytics, pixels, embeds of advertentiecode. Lettertypes en productfoto's worden mee geleverd met de pagina, dus bij het openen gaat er geen verzoek naar Google, Pinterest of een winkel. Ook GitHub Pages zet geen cookies. Een cookiebanner is daarom niet nodig. Claude.ai gebruikt zelf strikt noodzakelijke cookies om je ingelogd te houden; die vallen onder het beleid van Anthropic.</p></section>

  <section aria-labelledby="i5"><h2 id="i5">Links naar winkels</h2>
    <p>Een productlink opent de winkel pas als je erop klikt. Vanaf dan gelden de privacy- en cookieregels van die winkel. Prijzen zijn een momentopname van oktober 2026 en kunnen veranderd zijn. Yuanprijzen zijn omgerekend aan de middenkoers, zonder verzending, agentkosten, invoerrechten en btw.</p>
    <p><strong>Let op:</strong> huskyreps en 91sheep (Yupoo) verkopen namaak van bekende merken. Merknamen bij die stukken beschrijven wat het stuk nadoet, niet dat het echt is. De douane kan zulke pakjes in beslag nemen en vernietigen.</p></section>

  <section aria-labelledby="i6"><h2 id="i6">Rechten op beeld en tekst</h2>
    <p>Productfoto's en -namen zijn van de winkels en merken; ze staan hier als niet-commerciële inspiratie met een link naar de bron. Wil een winkel of merk een foto weg, dan kan dat via een issue op de GitHub-repository DarkoBoesmans/garderobe en gaat ze eruit. Lettertypes: Instrument Serif en Archivo, beide onder de SIL Open Font License. Je eigen kledingfoto's zijn van jou.</p></section>

  <section aria-labelledby="i7"><h2 id="i7">Jouw gegevens: inzien en wissen</h2>
    <p>Een stuk verwijder je via de knop "Verwijder stuk" in de detailweergave. Hier kun je alles in één keer downloaden of wissen. Wissen haalt stukken, vragen, maten, favorieten en foto's weg; de foto's in de map op de pc blijven staan.</p>
    <div class="c-actions c-actions--start" id="iacts">
      ${S.downloads ? `<button type="button" class="c-btn c-btn--ghost" data-export>Download mijn gegevens (JSON)</button>` : ""}
      ${w ? `<button type="button" class="c-btn c-btn--danger" data-wipe>Wis alle gegevens</button>` : ""}
      <span class="c-actions__status" role="status" id="istat"></span>
    </div></section>

  <section aria-labelledby="i8"><h2 id="i8">Toegankelijkheid</h2>
    <p>Alles werkt met het toetsenbord (Tab, Enter, Escape), knoppen zeggen wat ze doen, foto's hebben een beschrijving en tekst haalt minstens contrast 4,5:1 in licht en donker thema. Iets dat niet werkt? Zeg het tegen Darko.</p></section>
</div>`;
  },
  update() {},
};

document.addEventListener("click", async (e) => {
  const t = e.target as HTMLElement;
  if (t.closest("[data-export]")) {
    try { await exportAll(); $("istat").textContent = "Download klaar."; } catch { $("istat").textContent = "Downloaden lukte niet of je annuleerde."; }
    return;
  }
  if (t.closest("[data-wipe]")) {
    $("iacts").innerHTML = `<div class="c-confirm" role="alertdialog" aria-labelledby="wq">
  <p id="wq">Alles wissen: ${S.items.length} stukken, alle vragen, maten, favorieten en foto's? Dit kan niet ongedaan worden.</p>
  <button type="button" class="c-btn c-btn--ghost" data-wipe-no>Nee, niets wissen</button>
  <button type="button" class="c-btn c-btn--danger" data-wipe-yes>Ja, wis alles</button>
  <span class="c-actions__status" role="status" id="istat"></span></div>`;
    (document.querySelector("[data-wipe-no]") as HTMLElement).focus();
    return;
  }
  if (t.closest("[data-wipe-no]")) { info.mount(document.getElementById("view")!); return; }
  if (t.closest("[data-wipe-yes]")) {
    $("istat").textContent = "Bezig met wissen…";
    try { await wipeAll(); $("istat").textContent = "Alles is gewist."; } catch (err) { $("istat").textContent = why(err); }
  }
});
