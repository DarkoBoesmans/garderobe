// Bouwt dist/ voor GitHub Pages:
// - dist/index.html: voorpagina met covers
// - dist/app/: de app (login via Supabase, kast, outfits, lookbook, maten)
import { build } from "esbuild";
import { compile } from "sass";
import { landing } from "./landing.ts";
import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";

const SUPA = "https://uubsuzhtpokskjfpcets.supabase.co";
const FONTS = {
  "instrument-serif-400.woff2": "@fontsource/instrument-serif/files/instrument-serif-latin-400-normal.woff2",
  "instrument-serif-400-italic.woff2": "@fontsource/instrument-serif/files/instrument-serif-latin-400-italic.woff2",
  "archivo-wdth.woff2": "@fontsource-variable/archivo/files/archivo-latin-wdth-normal.woff2",
};
const DESC = "Een digitale kleerkast met uitgeknipte stukken, outfits, maten en een lookbook. Showcase van Darko Boesmans.";
const ICON = `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" fill="#0D0D0C"/><text x="16" y="24" font-family="Georgia,serif" font-style="italic" font-size="24" fill="#F6F6F3" text-anchor="middle">G</text></svg>')}`;
// Content Security Policy: GitHub Pages kan geen headers zetten, dus via een meta-tag.
// 'unsafe-inline' alleen voor stijlen (sprite-posities staan in style-attributen); scripts nooit inline.
const CSP = [
  "default-src 'self'",
  `connect-src 'self' ${SUPA} wss://${SUPA.slice(8)}`,
  "script-src 'self'",
  // De achtergrondverwijderaar draait in een eigen worker-bestand. Workers krijgen hun CSP van hun eigen
  // response (GitHub Pages stuurt geen), zodat de eval en WASM van die bibliotheek de pagina niet raken.
  "worker-src 'self'",
  `img-src 'self' data: blob: ${SUPA}`,
  "style-src 'self' 'unsafe-inline'",
  "font-src 'self'",
  "object-src 'none'",
  "base-uri 'none'",
  "form-action 'self'",
].join("; ");
const SITE = "https://darkoboesmans.github.io/garderobe/";
/** path: pad vanaf de site-root voor canonical; leeg = niet indexeren (404). */
const doc = (title: string, body: string, base = "", head = "", path: string | null = "") => `<!doctype html>
<html lang="nl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta http-equiv="Content-Security-Policy" content="${CSP}"><meta name="referrer" content="strict-origin-when-cross-origin">
${path === null ? '<meta name="robots" content="noindex">' : `<link rel="canonical" href="${SITE}${path}">`}<title>${title}</title><meta name="description" content="${DESC}">
<meta property="og:title" content="${title}"><meta property="og:description" content="${DESC}"><meta property="og:type" content="website"><meta property="og:url" content="${SITE}${path ?? ""}">
<meta property="og:image" content="${SITE}og.png"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta name="twitter:card" content="summary_large_image"><meta name="theme-color" content="#F6F6F3">
<link rel="icon" href="${ICON}"><link rel="preload" href="${base}fonts/instrument-serif-400.woff2" as="font" type="font/woff2" crossorigin><link rel="stylesheet" href="${base}app.css">${head}</head>
<body>${body}</body></html>
`;

const css = compile("src/scss/main.scss", { style: "compressed" }).css;
rmSync("dist", { recursive: true, force: true });
mkdirSync("dist/app/data", { recursive: true });

// De app en de worker voor de achtergrond. De worker laadt pas bij het eerste opladen.
await build({ entryPoints: ["src/ts/app.ts", "src/ts/cutout.worker.ts"], bundle: true, minify: true, format: "esm", splitting: true, target: "es2022", outdir: "dist/app", entryNames: "[name]", chunkNames: "chunks/[name]-[hash]" });
for (const dir of ["dist", "dist/app"]) {
  writeFileSync(`${dir}/app.css`, css);
  mkdirSync(`${dir}/fonts`, { recursive: true });
  for (const [to, from] of Object.entries(FONTS)) cpSync(`node_modules/${from}`, `${dir}/fonts/${to}`);
}
for (const book of ["darko", "lana"]) {
  cpSync(`sheets/${book}`, `dist/app/sheets/${book}`, { recursive: true });
  cpSync(`data/${book}-lookbook.json`, `dist/app/data/${book}.json`);
}
cpSync("demo", "dist/app/demo", { recursive: true });
cpSync("vault", "dist/app/vault", { recursive: true }); // ponytail: alleen voor de eenmalige import, daarna weg
writeFileSync("dist/app/index.html", doc("Inloggen · Garderobe", `<div id="app"><main style="padding:24px"><h1>Garderobe</h1><p>De garderobe laadt…</p></main></div>`, "", `<script type="module" src="app.js"></script>`, "app/"));

// Voorpagina en 404.
writeFileSync("dist/.nojekyll", "");
const count = (k: string) => (JSON.parse(readFileSync(`data/${k}-lookbook.json`, "utf8")) as { items: unknown[] }).items.length;
writeFileSync("dist/index.html", doc("Garderobe · je kleerkast, uitgeknipt", landing(count("darko"), count("lana")),
  "", `<link rel="preload" href="app/demo/denim-c.webp" as="image" fetchpriority="high">`).replace("<body>", `<body data-person="lana">`));
cpSync("static/og.png", "dist/og.png");
writeFileSync("dist/robots.txt", `User-agent: *\nDisallow: /garderobe/app/\nSitemap: ${SITE}sitemap.xml\n`);
writeFileSync("dist/sitemap.xml", `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${SITE}</loc></url></urlset>\n`);
writeFileSync("dist/404.html", doc("Niet gevonden · Garderobe", `
<a class="c-skip" href="#main">Naar de inhoud</a>
<main class="c-stand" id="main" tabindex="-1">
  <header class="c-stand__head o-wrap">
    <h1 class="c-stand__title">Niet in de <em>kast.</em></h1>
    <p class="c-stand__dek">Deze pagina bestaat niet.</p>
  </header>
  <p class="o-wrap c-stand__acts"><a class="c-btn" href="/garderobe/">Naar de voorpagina</a> <a class="c-btn c-btn--ghost" href="/garderobe/app/#demo">Bekijk de demo</a></p>
</main>`, "/garderobe/", "", null).replace("<body>", `<body data-person="lana">`));
console.log("gebouwd: dist");
