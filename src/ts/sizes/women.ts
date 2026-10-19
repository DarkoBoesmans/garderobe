// Damesmaten. ponytail: één algemene EU-tabel; merkverschillen via "Per merk" (shiftSize).
import type { Advice, SizeSystem } from "../types";
import { FEET, band, footAdvice, letter, num, type Band } from "./shared";

const TOP: Band = [[76, 82, "XS"], [82, 88, "S"], [88, 94, "M"], [94, 100, "L"], [100, 106, "XL"], [106, 112, "XXL"], [112, 120, "3XL"]];
const EUW: Record<string, number> = { XS: 34, S: 36, M: 38, L: 40, XL: 42, XXL: 44, "3XL": 46 };
const HIPS: Band = [[84, 90, 34], [90, 95, 36], [95, 100, 38], [100, 105, 40], [105, 110, 42], [110, 116, 44], [116, 122, 46]];
const WAIST: Band = [[58, 65, 34], [65, 69, 36], [69, 73, 38], [73, 77, 40], [77, 82, 42], [82, 88, 44], [88, 94, 46]];

export const women: SizeSystem = {
  groups: [
    ["Basis", [
      ["height", "Lengte", "cm", "Blootsvoets tegen de muur, boek plat op je hoofd, streepje zetten."],
      ["weight", "Gewicht", "kg", "'s Ochtends, voor het ontbijt."],
    ]],
    ["Bovenlijf", [
      ["bust", "Borst", "cm", "Over het volste deel van je borst, met een bh zonder voering, lint horizontaal."],
      ["shoulder", "Schouderbreedte", "cm", "Van schouderpunt tot schouderpunt over de rug (laat iemand helpen)."],
      ["sleeve", "Armlengte", "cm", "Van schouderpunt over de licht gebogen elleboog tot je polsbot."],
      ["waist", "Taille", "cm", "Op het smalste deel van je romp, meestal net boven je navel."],
    ]],
    ["Onderlijf", [
      ["hips", "Heup", "cm", "Over het breedste deel van je billen, voeten samen."],
      ["inseam", "Binnenbeen", "cm", "Van je kruis tot de grond, blootsvoets (of meet een broek die goed zit)."],
      ["thigh", "Dij", "cm", "Rond het dikste deel van je bovenbeen."],
    ]],
    ["Voeten en hoofd", FEET],
  ],
  kind: {
    top: ["Truien & cardigans", "T-shirts & tops", "Blouses & hemden"],
    jas: ["Jassen & blazers"],
    broek: ["Broeken", "Rokken", "Jurken"],
    jeans: ["Jeans"],
    schoen: ["Schoenen", "Sneakers", "Sport & outdoor"],
    pet: ["Accessoires"],
  },
  advice(B) {
    const out: Advice[] = [], n = (k: string) => num(B, k);
    if (n("bust")) {
      const t = letter(n("bust"), TOP, "aansluitend");
      if (t) {
        out.push(["Truien, blouses en tops", t.size, `Borst ${n("bust")} cm = EU ${EUW[t.size]}. ${t.note}`, "top"]);
        out.push(["Jassen en blazers", t.size, `Zelfde als je tops (EU ${EUW[t.size]}). Met een dikke trui eronder: één maat groter.`, "jas"]);
      }
    }
    if (n("hips") || n("waist")) {
      const h = n("hips") ? band(n("hips"), HIPS) : null, w = n("waist") ? band(n("waist"), WAIST) : null;
      const eu = Math.max(Number(h?.l ?? 0), Number(w?.l ?? 0));
      if (eu) out.push(["Broeken, rokken en jurken", String(eu),
        `${h ? `Heup ${n("hips")} cm: EU ${h.l}. ` : ""}${w ? `Taille ${n("waist")} cm: EU ${w.l}. ` : ""}${h && w && h.l !== w.l ? "De grootste telt; laat een wijde broek desnoods in de taille innemen." : "Voor rokken telt vooral je heup."}`, "broek"]);
    }
    if (n("waist")) {
      const W = Math.round(n("waist") / 2.54), L = n("inseam") ? Math.round(n("inseam") / 2.54) : null;
      out.push(["Jeans", `W${W}${L ? " L" + L : ""}`, `Taille ${n("waist")} cm = ${W} inch${L ? `, binnenbeen ${n("inseam")} cm = ${L} inch.` : ". Bij 1m74 is L32 tot L34 meestal goed."} Wide leg mag de grond net raken met hak.`, "jeans"]);
    }
    const f = footAdvice(B, 1.5, "Kniehoge laarzen: check ook je kuitomtrek.");
    if (f) out.push(["Schoenen en laarzen", f[1], f[2], f[3]]);
    if (n("head")) {
      const h = n("head");
      out.push(["Muts of baret", h < 54 ? "S" : h < 56 ? "M" : h < 58 ? "L" : "XL", `Hoofd ${h} cm.`, "pet"]);
    }
    if (n("height")) out.push(["Rok- en jaslengte", n("height") >= 170 ? "midi 75 tot 85 cm" : "midi 70 tot 75 cm",
      `Bij ${n("height")} cm valt een midirok van die lengte net onder de knie; een lange jas van 110 tot 120 cm valt op de kuit.`, "lengte"]);
    return out;
  },
};
