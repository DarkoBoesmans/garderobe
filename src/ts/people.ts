// De twee garderobes. Alles wat per persoon verschilt staat hier.
import type { Person } from "./types";
import { men } from "./sizes/men";
import { women } from "./sizes/women";

export const darko: Person = {
  key: "darko",
  name: "Darko",
  issue: "N° 01",
  season: "Herfst / Winter 2026",
  theme: "Warme heritage casual",
  dek: "Tabak, olijf, camel en ecru. Wijde broeken, truien met textuur en één opvallende laag, afgewerkt met een sneaker die het verhaal draagt.",
  folder: "C:\\Users\\Darko\\Pictures\\Wardrobe",
  categories: ["Jassen", "Truien & cardigans", "Hemden & overshirts", "T-shirts & polo's", "Sweaters & hoodies", "Broeken", "Jeans", "Shorts", "Schoenen", "Sneakers", "Accessoires", "Sport & outdoor", "Overig"],
  chapterMap: {
    "Jassen": { cats: ["Jassen"], kind: "jas" },
    "Truien & cardigans": { cats: ["Truien & cardigans"], kind: "top" },
    "Hemden & overshirts": { cats: ["Hemden & overshirts"], kind: "hemd" },
    "Broeken & jeans": { cats: ["Broeken", "Jeans"], kind: "broek" },
    "Sneakers": { cats: ["Sneakers", "Schoenen"], kind: "schoen" },
    "Sweaters & fleece": { cats: ["Sweaters & hoodies"], kind: "top" },
    "T-shirts": { cats: ["T-shirts & polo's"], kind: "top" },
    "Accessoires": { cats: ["Accessoires"] },
  },
  sizes: men,
};

export const lana: Person = {
  key: "lana",
  name: "Lana",
  issue: "N° 02",
  season: "Herfst / Winter 2026",
  theme: "Dark academia voor kantoor",
  dek: "Chocolade, bordeaux, bosgroen en crème. Lange jassen, midirokken en truien met textuur: verzorgd genoeg voor een werkdag als preventieadviseur.",
  folder: "C:\\Users\\Darko\\Pictures\\Wardrobe Lana",
  categories: ["Jassen & blazers", "Truien & cardigans", "Blouses & hemden", "T-shirts & tops", "Broeken", "Jeans", "Rokken", "Jurken", "Schoenen", "Sneakers", "Tassen", "Accessoires", "Sport & outdoor", "Overig"],
  chapterMap: {
    "Jassen & blazers": { cats: ["Jassen & blazers"], kind: "jas" },
    "Truien & cardigans": { cats: ["Truien & cardigans"], kind: "top" },
    "Blouses & hemden": { cats: ["Blouses & hemden", "T-shirts & tops"], kind: "top" },
    "Broeken & jeans": { cats: ["Broeken", "Jeans"], kind: "broek" },
    "Rokken & jurken": { cats: ["Rokken", "Jurken"], kind: "broek" },
    "Schoenen": { cats: ["Schoenen", "Sneakers"], kind: "schoen" },
    "Tassen & accessoires": { cats: ["Tassen", "Accessoires"] },
  },
  sizes: women,
};
