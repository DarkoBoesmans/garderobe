// Eén plek voor de toestand van de pagina. Views lezen hieruit en roepen render() aan.
import type { Body, Item, Lookbook, Person, Prefs, Question } from "./types";

export const S = {
  person: undefined as unknown as Person,
  look: undefined as unknown as Lookbook,
  items: [] as Item[],
  qs: [] as Question[],
  body: {} as Body,
  meta: null as Record<string, unknown> | null,
  prefs: { fav: [], hidden: [] } as Prefs,
  db: null as DB | null,
  assets: null as Claude.Assets | null,
  downloads: null as typeof Claude.downloads | null,
  canWrite: true,
  /** false tot de database antwoordt; dan tonen we "laden" in plaats van "leeg". */
  loaded: false,
};

let renderer: () => void = () => {};
export const onRender = (fn: () => void) => { renderer = fn; };
export const render = () => renderer();
