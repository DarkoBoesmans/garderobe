import look from "../../../data/darko-lookbook.json";
import { start } from "../main";
import { darko } from "../people";
import type { Lookbook } from "../types";

start(darko, look as unknown as Lookbook);
