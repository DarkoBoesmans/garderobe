// Eén plek voor de toestand van de pagina. Views lezen hieruit en roepen render() aan.
import type { Body, Item, Lookbook, Person, Prefs } from "./types";

export const S = {
  person: undefined as unknown as Person,
  look: undefined as unknown as Lookbook,
  uid: "",
  email: "",
  items: [] as Item[],
  body: {} as Body,
  prefs: { fav: [], hidden: [] } as Prefs,
  canWrite: true,
  /** false tot de database antwoordt; dan tonen we "laden" in plaats van "leeg". */
  loaded: false,
};

let renderer: () => void = () => {};
export const onRender = (fn: () => void) => { renderer = fn; };
export const render = () => renderer();
