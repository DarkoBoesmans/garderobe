// Contrastcontrole (WCAG 2.2, AA): leest de tokens en faalt onder 4.5:1 voor tekst.
import { readFileSync } from "node:fs";

const src = readFileSync("src/scss/settings/_tokens.scss", "utf8");
const tok = (n: string) => src.match(new RegExp(`\\$${n}: (#[0-9A-Fa-f]{6});`))![1]!;
const lum = (hex: string) => {
  const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * c[0]! + 0.7152 * c[1]! + 0.0722 * c[2]!;
};
export const ratio = (a: string, b: string) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x! + 0.05) / (y! + 0.05); };

let fail = 0;
for (const d of ["", "-dark"]) {
  const pairs: [string, string][] = [["ink", "paper"], ["ink-2", "paper"], ["ink-2", "paper-2"], ["ink", "paper-2"],
    ["accent-darko", "paper"], ["accent-lana", "paper"], ["paper", "accent-darko"], ["paper", "accent-lana"], ["accent-darko", "paper-2"], ["accent-lana", "paper-2"]];
  for (const [f, b] of pairs) {
    const r = ratio(tok(f + d), tok(b + d)), ok = r >= 4.5;
    if (!ok) fail++;
    console.log(`${ok ? "ok  " : "FOUT"} ${(f + d).padEnd(18)} op ${(b + d).padEnd(14)} ${r.toFixed(2)}:1`);
  }
}
if (ratio("#000000", "#FFFFFF") < 20.9) throw new Error("ratio() klopt niet");
process.exit(fail ? 1 : 0);
