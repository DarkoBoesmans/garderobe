// Colofon: privacy, cookies, derden, rechten en "verwijder alles". Eerlijk en kort: dit is een privéproject.
import { S } from "../state";
import { exportAll, why, wipeAll } from "../store";
import type { View } from "./shell";

const $ = (id: string) => document.getElementById(id)!;

export const info: View = {
  title: "Colofon",
  mount(el) {
    el.innerHTML = `
<section class="c-hero">
  <div><p class="c-hero__kicker">Privacy, gegevens en bronnen</p><h1 class="c-hero__title">Colo<em>fon.</em></h1></div>
  <div><p class="c-hero__theme">Wat deze site bewaart, en hoe je het weer weghaalt.</p>
  <p class="c-hero__dek">Laatst bijgewerkt op 2 november 2026.</p></div>
</section>
<div class="c-prose">
  <section aria-labelledby="i1"><h2 id="i1">Wie en waarom</h2>
    <p>Een niet-commercieel project van Darko Boesmans: een digitale kleerkast met maten en een lookbook, en een showcase van hoe zoiets veilig gebouwd wordt. Er wordt niets verkocht, er zijn geen advertenties, affiliate links of betalingen. Daarom zijn er geen algemene voorwaarden, geen retourbeleid en geen kosten.</p></section>

  <section aria-labelledby="i2"><h2 id="i2">Welke gegevens</h2>
    <ul>
      <li>Je e-mailadres en een versleuteld wachtwoord, om in te loggen. De demo gebruikt geen e-mailadres.</li>
      <li>Foto's van je kleding en wat je erover invult (merk, kleur, maat, materiaal).</li>
      <li>Lichaamsmaten die je zelf invult. Alles is optioneel.</li>
      <li>Favorieten, outfits en wanneer je iets droeg.</li>
    </ul>
    <p>Foto's worden in je browser opnieuw gecodeerd voor ze worden opgeladen. Daardoor verdwijnt alle metadata, ook de GPS-locatie die een gsm in een foto stopt. Er worden geen gegevens van kinderen gevraagd en geen nieuwsbrieven verstuurd; je krijgt enkel mails om je account te bevestigen of je wachtwoord te herstellen.</p></section>

  <section aria-labelledby="i3"><h2 id="i3">Waar en wie het ziet</h2>
    <p>De gegevens staan bij Supabase in Frankfurt (EU). Elke rij en elke foto is beveiligd met regels in de database zelf: je ziet alleen je eigen kast, of een kast die iemand uitdrukkelijk met je deelt. Foto's zijn privé en worden getoond via links die na een uur verlopen. De website zelf staat op GitHub Pages; GitHub houdt als host technische gegevens bij, zoals IP-adressen in serverlogs.</p>
    <p>Demo-accounts zijn anoniem en worden na 24 uur met alles erop en eraan gewist.</p></section>

  <section aria-labelledby="i4"><h2 id="i4">Cookies en opslag</h2>
    <p>Er zijn geen analytics, pixels, embeds of advertenties. Om je ingelogd te houden bewaart de site je sessie in de lokale opslag van je browser; dat is strikt noodzakelijk voor wat je vraagt en vraagt daarom geen toestemming. Uitloggen wist die sessie. Bij het eerste gebruik van "Achtergrond weghalen" haalt je browser het beeldmodel op bij IMG.LY (staticimgly.com); je foto's verlaten je toestel daarvoor niet.</p></section>

  <section aria-labelledby="i5"><h2 id="i5">Links naar winkels</h2>
    <p>Een productlink opent de winkel pas als je erop klikt. Vanaf dan gelden de privacy- en cookieregels van die winkel. Prijzen zijn een momentopname van oktober 2026. Yuanprijzen zijn omgerekend aan de middenkoers, zonder verzending, agentkosten, invoerrechten en btw.</p>
    <p><strong>Let op:</strong> huskyreps en 91sheep (Yupoo) verkopen namaak van bekende merken. Merknamen bij die stukken beschrijven wat het stuk nadoet, niet dat het echt is. De douane kan zulke pakjes in beslag nemen en vernietigen.</p></section>

  <section aria-labelledby="i6"><h2 id="i6">Rechten en licentie</h2>
    <p>Productfoto's en -namen zijn van de winkels en merken; ze staan hier als niet-commerciële inspiratie met een link naar de bron. Wil een winkel of merk een foto weg, dan kan dat via een issue op de GitHub-repository DarkoBoesmans/garderobe. De broncode is open onder de AGPL-3.0, net als de gebruikte achtergrondverwijderaar van IMG.LY. Lettertypes: Instrument Serif en Archivo (SIL Open Font License). Je eigen foto's blijven van jou.</p></section>

  <section aria-labelledby="i7"><h2 id="i7">Jouw gegevens: inzien en wissen</h2>
    <p>Een stuk verwijder je in de detailweergave. Hier download je alles als JSON, wis je al je stukken, foto's en maten, of verwijder je je account volledig.</p>
    ${S.uid ? `<div class="c-actions c-actions--start" id="iacts">
      <button type="button" class="c-btn c-btn--ghost" data-export>Download mijn gegevens (JSON)</button>
      ${S.canWrite ? `<button type="button" class="c-btn c-btn--danger" data-wipe="data">Wis mijn kast</button>
      <button type="button" class="c-btn c-btn--danger" data-wipe="account">Verwijder mijn account</button>` : ""}
      <span class="c-actions__status" role="status" id="istat"></span>
    </div>` : `<p><a href="./">Log in</a> om je gegevens te downloaden of te wissen.</p>`}</section>

  <section aria-labelledby="i8"><h2 id="i8">Toegankelijkheid</h2>
    <p>Alles werkt met het toetsenbord (Tab, Enter, Escape), knoppen zeggen wat ze doen, foto's hebben een beschrijving en tekst haalt minstens contrast 4,5:1 in licht en donker thema. Iets dat niet werkt? Meld het via een issue op GitHub.</p></section>
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
