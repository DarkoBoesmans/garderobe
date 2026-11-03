// Supabase-client. De publishable key is bedoeld om publiek te zijn: alle bescherming zit in RLS.
import { createClient } from "@supabase/supabase-js";

export const SUPABASE_URL = "https://uubsuzhtpokskjfpcets.supabase.co";
export const sb = createClient(SUPABASE_URL, "sb_publishable_rj1Dyw4cP-Kam6La6GHIvA_RKGdZbGd", {
  // detectSessionInUrl uit: die leest de #hash en loopt vast op routes als #kast. app.ts wisselt ?code= zelf in.
  auth: { flowType: "pkce", detectSessionInUrl: false, persistSession: true },
});
export const BUCKET = "closet";
