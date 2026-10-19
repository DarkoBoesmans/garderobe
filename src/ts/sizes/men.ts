// Herenmaten. ponytail: één algemene EU-tabel; merkverschillen via "Per merk" (shiftSize).
import type { Advice, SizeSystem } from "../types";
import { FEET, footAdvice, letter, num, type Band } from "./shared";

const TOP: Band = [[84, 92, "S"], [92, 100, "M"], [100, 108, "L"], [108, 116, "XL"], [116, 124, "XXL"], [124, 132, "3XL"], [132, 140, "4XL"]];
const BOTTOM: Band = [[72, 80, "S"], [80, 88, "M"], [88, 96, "L"], [96, 104, "XL"], [104, 112, "XXL"], [112, 120, "3XL"], [120, 128, "4XL"]];

export const men: SizeSystem = {
  groups: [
    ["Basis", [
      ["height", "Lengte", "cm", "Blootsvoets tegen de muur, boek plat op je hoofd, streepje zetten."],
      ["weight", "Gewicht", "kg", "'s Ochtends, voor het ontbijt."],
    ]],
    ["Bovenlijf", [
      ["neck", "Nek", "cm", "Rond de nek net onder de adamsappel, één vinger tussen lint en huid."],
      ["chest", "Borst", "cm", "Onder de oksels over het breedste deel, armen los, gewoon uitademen."],
      ["shoulder", "Schouderbreedte", "cm", "Van schouderpunt tot schouderpunt over de rug (laat iemand helpen)."],
      ["sleeve", "Armlengte", "cm", "Van schouderpunt over de licht gebogen elleboog tot je polsbot."],
      ["waist", "Taille", "cm", "Rond je buik ter hoogte van je navel, niet intrekken."],
    ]],
    ["Onderlijf", [
      ["hips", "Heup", "cm", "Over het breedste deel van je billen, voeten samen."],
      ["inseam", "Binnenbeen", "cm", "Van je kruis tot de grond, blootsvoets (of meet een broek die goed zit)."],
      ["thigh", "Dij", "cm", "Rond het dikste deel van je bovenbeen."],
    ]],
    ["Voeten en hoofd", FEET],
  ],
  kind: {
    top: ["Truien & cardigans", "Sweaters & hoodies", "T-shirts & polo's"],
    jas: ["Jassen"],
    hemd: ["Hemden & overshirts"],
    broek: ["Broeken", "Jeans"],
    short: ["Shorts"],
    schoen: ["Sneakers", "Schoenen", "Sport & outdoor"],
    pet: ["Accessoires"],
  },
  advice(B) {
    const out: Advice[] = [], n = (k: string) => num(B, k);
    if (n("chest")) {
      const t = letter(n("chest"), TOP, "slim");
      if (t) out.push(["T-shirts, truien, hoodies", t.size, `Borst ${n("chest")} cm. ${t.note}`, "top"]);
      out.push(["Jas of colbert (EU)", String(Math.round(n("chest") / 2 / 2) * 2), `Borst gedeeld door 2, afgerond op een even maat${n("chest") >= 108 ? ". Met een dikke trui eronder: één maat groter." : "."}`, "jas"]);
    }
    if (n("neck")) {
      const t = n("chest") ? letter(n("chest"), TOP, "slim")?.size : "";
      out.push(["Hemd (boordmaat)", `${Math.ceil(n("neck"))} cm${t ? " / " + t : ""}`, `Nek ${n("neck")} cm, naar boven afgerond. Mouwlengte: ${n("sleeve") ? Math.round(n("sleeve")) + " cm" : "meet je armlengte"}.`, "hemd"]);
    }
    if (n("waist")) {
      const w = Math.round(n("waist") / 2.54), L = n("inseam") ? Math.round(n("inseam") / 2.54) : null;
      out.push(["Jeans en broeken", `W${w}${L ? " L" + L : ""}`, `Taille ${n("waist")} cm = ${w} inch${L ? `, binnenbeen ${n("inseam")} cm = ${L} inch` : ""}. Jeans zitten vaak een maat kleiner dan je meting: probeer ook W${w - 1}.`, "broek"]);
      out.push(["Broek (EU-maat)", String(Math.max(42, Math.round((48 + (n("waist") - 86) / 2) / 2) * 2)), `Taille ${n("waist")} cm.`, "broek"]);
      const b = letter(n("waist"), BOTTOM, "strak");
      if (b) out.push(["Shorts en joggings", b.size, `Taille ${n("waist")} cm. ${b.note}`, "short"]);
    }
    const f = footAdvice(B, 2, "Jordan en Nike vallen vaak klein: neem een halve maat extra.");
    if (f) out.push(f);
    if (n("head")) {
      const h = n("head");
      out.push(["Pet of muts", h < 55 ? "S" : h < 57 ? "M" : h < 59 ? "L" : h < 61 ? "XL" : "XXL", `Hoofd ${h} cm. One-size petten passen meestal tot 59 cm.`, "pet"]);
    }
    return out;
  },
};
