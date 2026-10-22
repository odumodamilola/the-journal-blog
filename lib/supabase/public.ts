import "server-only";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/types/database";
import { supabaseEnv } from "./env";

// No cookies or administrator session: public queries cannot inherit draft access.
export function publicClient() {
  const { url, key } = supabaseEnv();
  return createClient<Database>(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
    global: {
      fetch: (input, init) => fetch(input, { ...init, cache: "no-store" }),
    },
  });
}
