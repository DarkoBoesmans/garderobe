// Start: kies de persoon, teken het skelet, verbind met de database.
import { S, render } from "./state";
import { connect } from "./store";
import type { Lookbook, Person } from "./types";
import { startShell } from "./views/shell";

export function start(person: Person, look: Lookbook) {
  S.person = person;
  S.look = look;
  startShell(document.getElementById("app")!);
  connect().catch(() => { S.loaded = true; render(); });
}
