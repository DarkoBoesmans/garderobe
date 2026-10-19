import look from "../../../data/lana-lookbook.json";
import { start } from "../main";
import { lana } from "../people";
import type { Lookbook } from "../types";

start(lana, look as unknown as Lookbook);
