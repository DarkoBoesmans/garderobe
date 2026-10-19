// Bouwt dist/ voor twee bestemmingen:
// - dist/<persoon>/artifact.html + bestanden: de privé-artifact op claude.ai (fragment, Claude zet het skelet errond)
// - dist/ als geheel: de openbare GitHub Pages-site (index.html per persoon en een voorpagina)
import { build } from "esbuild";
import { compile } from "sass";
import { landing } from "./landing.ts";
import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";

// Titels blijven gelijk aan de bestaande artifacts.
const PEOPLE = { darko: "Darko's Kleerkast", lana: "Lana's Garderobe" };
const FONTS = {
  "instrument-serif-400.woff2": "@fontsource/instrument-serif/files/instrument-serif-latin-400-normal.woff2",
  "instrument-serif-400-italic.woff2": "@fontsource/instrument-serif/files/instrument-serif-latin-400-italic.woff2",
  "archivo-wdth.woff2": "@fontsource-variable/archivo/files/archivo-latin-wdth-normal.woff2",
};
const doc = (title: string, body: string, base = "") => `<!doctype html>
<html lang="nl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="robots" content="noindex"><title>${title}</title><link rel="stylesheet" href="${base}app.css"></head>
<body>${body}</body></html>
`;

const css = compile("src/scss/main.scss", { style: "compressed" }).css;
const fragment = readFileSync("src/index.html", "utf8");
rmSync("dist", { recursive: true, force: true });

for (const [key, title] of Object.entries(PEOPLE)) {
  const out = `dist/${key}`;
  mkdirSync(`${out}/fonts`, { recursive: true });
  await build({ entryPoints: [`src/ts/entries/${key}.ts`], bundle: true, minify: true, format: "iife", target: "es2020", outfile: `${out}/app.js` });
  writeFileSync(`${out}/app.css`, css);
  const page = fragment.replace("{{NAME}}", title);
  writeFileSync(`${out}/artifact.html`, page);
  writeFileSync(`${out}/index.html`, doc(title, page.replace(/<title>.*<\/title>\n|<link rel="stylesheet"[^>]*>\n/g, "")));
  for (const [to, from] of Object.entries(FONTS)) cpSync(`node_modules/${from}`, `${out}/fonts/${to}`);
  cpSync(`sheets/${key}`, `${out}/sheets`, { recursive: true });
  cpSync(`vault/${key}.bin`, `${out}/vault.bin`); // versleuteld; enkel voor GitHub Pages
  console.log("gebouwd:", out);
}

// Voorpagina van de openbare site.
writeFileSync("dist/app.css", css);
cpSync("dist/darko/fonts", "dist/fonts", { recursive: true });
writeFileSync("dist/.nojekyll", "");
writeFileSync("dist/index.html", doc("Garderobe", `
<main class="c-stand">
  <header class="c-stand__head o-wrap">
    <h1 class="c-stand__title">Garde<em>robe.</em></h1>
    <p class="c-stand__dek">Twee lookbooks voor herfst en winter 2026. Kies een cover.</p>
  </header>
  <div class="c-stand__covers o-wrap">${landing()}</div>
  <p class="c-stand__foot o-wrap">Niet commercieel. Productfoto's zijn van de winkels en linken naar de bron. <a href="lana/#info">Privacy en colofon</a></p>
</main>`));
console.log("gebouwd: dist (GitHub Pages)");
