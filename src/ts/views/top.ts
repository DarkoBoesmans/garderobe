// Gedeelde kop voor de voorpagina, het loginscherm, het colofon zonder account en de 404.
// Pure string zonder DOM, zodat ook het buildscript hem kan gebruiken.
/** base: pad naar de site-root ("" op de voorpagina, "../" in de app, "/garderobe/" op de 404). */
export const top = (base: string) => `
<header class="c-top"><div class="o-wrap c-top__bar">
  <a class="c-top__mark" href="${base}">Garderobe</a>
  <nav class="c-top__nav" aria-label="Site">
    <a href="${base}app/#demo">Demo</a>
    <a href="${base}#werking">Werking</a>
    <a href="${base}app/#info">Colofon</a>
    <a class="c-top__login" href="${base}app/">Inloggen</a>
  </nav>
</div></header>`;

/** Wasvoorschriftsymbolen als kleine SVG's: wastobbe 30°, niet bleken, strijken laag, niet in de droogkast. */
export const CARE = {
  wash: `<svg viewBox="0 0 40 32" aria-hidden="true"><path d="M3 8 L7 28 H33 L37 8" fill="none" stroke="currentColor" stroke-width="2"/><path d="M3 8 Q10 13 15 8 Q20 13 25 8 Q30 13 37 8" fill="none" stroke="currentColor" stroke-width="2"/><text x="20" y="24" text-anchor="middle" font-size="10" font-family="monospace" fill="currentColor">30</text></svg>`,
  nobleach: `<svg viewBox="0 0 40 32" aria-hidden="true"><path d="M20 3 L37 29 H3 Z" fill="none" stroke="currentColor" stroke-width="2"/><path d="M8 4 L32 30 M32 4 L8 30" stroke="currentColor" stroke-width="2"/></svg>`,
  iron: `<svg viewBox="0 0 40 32" aria-hidden="true"><path d="M4 26 H36 V22 Q36 10 24 10 H12 Q8 10 7 16 Z" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="20" cy="19" r="1.8" fill="currentColor"/></svg>`,
  nodry: `<svg viewBox="0 0 40 32" aria-hidden="true"><rect x="5" y="2" width="30" height="28" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="20" cy="16" r="9" fill="none" stroke="currentColor" stroke-width="2"/><path d="M6 3 L34 29 M34 3 L6 29" stroke="currentColor" stroke-width="2"/></svg>`,
};
