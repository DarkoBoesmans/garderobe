# Garderobe

Lookbook, kleerkast en maten voor Darko en Lana. Elke persoon is één artifact op claude.ai.

```
npm install
npm run check   # TypeScript + contrastcontrole (WCAG AA)
npm run build   # dist/darko en dist/lana
```

- `src/ts`: TypeScript. `people.ts` bevat alles wat per persoon verschilt, `views/` één bestand per scherm.
- `src/scss`: SCSS volgens ITCSS (settings, tools, generic, elements, objects, components, utilities) met BEM-klassen (`c-card__title`, `c-btn--ghost`).
- `data/`: lookbookstukken per persoon. `sheets/`: de productfoto's als sprite sheets.
- De kleerkast leest en schrijft de database van het artifact (`items`, `questions`, `meta/body`, `meta/lookbook`, `meta/state`).

Privéproject, niet commercieel. Productfoto's zijn van de winkels; niet publiek delen.
