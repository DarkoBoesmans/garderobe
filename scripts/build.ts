// Bouwt per persoon een map in dist/ die als één artifact gepubliceerd wordt:
// index.html, app.js (TypeScript), app.css (SCSS), fonts/ en sheets/.
import { build } from "esbuild";
import { compile } from "sass";
import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";

// Titels blijven gelijk aan de bestaande artifacts.
const PEOPLE = { darko: "Darko's Kleerkast", lana: "Lana's Garderobe" };
const FONTS = {
  "instrument-serif-400.woff2": "@fontsource/instrument-serif/files/instrument-serif-latin-400-normal.woff2",
  "instrument-serif-400-italic.woff2": "@fontsource/instrument-serif/files/instrument-serif-latin-400-italic.woff2",
  "archivo-wdth.woff2": "@fontsource-variable/archivo/files/archivo-latin-wdth-normal.woff2",
};

const css = compile("src/scss/main.scss", { style: "compressed" }).css;
rmSync("dist", { recursive: true, force: true });

for (const [key, name] of Object.entries(PEOPLE)) {
  const out = `dist/${key}`;
  mkdirSync(`${out}/fonts`, { recursive: true });
  await build({ entryPoints: [`src/ts/entries/${key}.ts`], bundle: true, minify: true, format: "iife", target: "es2020", outfile: `${out}/app.js` });
  writeFileSync(`${out}/app.css`, css);
  writeFileSync(`${out}/index.html`, readFileSync("src/index.html", "utf8").replace("{{NAME}}", name));
  for (const [to, from] of Object.entries(FONTS)) cpSync(`node_modules/${from}`, `${out}/fonts/${to}`);
  cpSync(`sheets/${key}`, `${out}/sheets`, { recursive: true });
  console.log("gebouwd:", out);
}
