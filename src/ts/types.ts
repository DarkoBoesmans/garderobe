// Gedeelde types. Kleerkastvelden komen uit de database en kunnen een lijst of een string zijn.
export interface LookItem {
  id: string;
  s: string; // winkel
  b?: string; // merk, als dat niet de winkel zelf is
  c: string; // hoofdstuk
  d: string; // omschrijving
  p: number | null;
  cur: "€" | "¥";
  sh: string; // sprite sheet
  k: number; // positie in de sheet
  u: string; // winkellink
  col: string[];
  pin?: string;
}
export interface Direction { n: string; when: string; v: string; pal: string[]; p: string[] }
export interface Lookbook {
  items: LookItem[];
  dirs: Direction[];
  chapters: [string, string][];
  sheets: Record<string, [number, number, number]>; // kolommen, rijen, breedte/hoogte van één cel
}
export type Field = string | string[] | undefined;
export interface Item {
  id: string;
  name?: string;
  brand?: string;
  category?: string;
  size?: string;
  colors?: Field;
  style?: Field;
  season?: Field;
  photo?: string;
  photos?: string[];
  file?: Field;
  files?: Field;
  added?: string;
  missing?: Field;
  [k: string]: unknown;
}
export interface Question {
  id: string;
  itemId: string;
  field: string;
  question: string;
  options?: string[];
  status: "open" | "answered" | "skipped" | "applied";
  answer?: string;
}
export interface Body { brandFit?: Record<string, string>; measuredAt?: string; [k: string]: unknown }
export interface Prefs { fav: string[]; hidden: string[] }
/** [voor wat, maat, uitleg, soort] */
export type Advice = [string, string, string, string];
/** [veld, label, eenheid, uitleg] */
export type BodyField = [string, string, string, string];
export interface SizeSystem {
  groups: [string, BodyField[]][];
  advice(b: Body): Advice[];
  /** maatsoort naar kleerkastcategorieën */
  kind: Record<string, string[]>;
}
export interface Person {
  key: "darko" | "lana";
  name: string;
  issue: string;
  season: string;
  theme: string;
  dek: string;
  folder: string;
  categories: string[];
  /** lookbookhoofdstuk naar kleerkastcategorieën en maatsoort */
  chapterMap: Record<string, { cats: string[]; kind?: string }>;
  sizes: SizeSystem;
}
