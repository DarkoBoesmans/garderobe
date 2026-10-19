# Garderobe

Lookbook, kleerkast en maten voor Darko en Lana.

- Openbaar (enkel lookbook): https://darkoboesmans.github.io/garderobe/
- Privé (lookbook, kleerkast en maten): één artifact per persoon op claude.ai.

```
npm install
npm run check   # TypeScript + contrastcontrole (WCAG AA)
npm run build   # dist/ = GitHub Pages, dist/<persoon>/artifact.html = claude.ai
```

- `src/ts`: TypeScript. `people.ts` bevat alles wat per persoon verschilt, `views/` één bestand per scherm.
- `src/scss`: SCSS volgens ITCSS (settings, tools, generic, elements, objects, components, utilities) met BEM-klassen (`c-card__title`, `c-btn--ghost`).
- `data/`: lookbookstukken per persoon. `sheets/`: de productfoto's als sprite sheets.
- De kleerkast leest en schrijft de database van het artifact (`items`, `questions`, `meta/body`, `meta/lookbook`, `meta/state`).

Niet commercieel. Productfoto's zijn van de winkels en linken naar de bron; een verzoek tot verwijderen kan via een issue.

GitHub Actions (`.github/workflows/pages.yml`) draait bij elke push `npm run check` en `npm run build` en zet `dist/` op GitHub Pages.
