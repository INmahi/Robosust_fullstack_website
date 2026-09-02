import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

// Service-role client. Bypasses RLS entirely — never import this outside of
// server-only auth code (username->email lookup at login, user creation,
// admin-triggered password resets). Never expose SUPABASE_SECRET_KEY to the
// client bundle; the `server-only` import above makes that a build error.
export function createAdminClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}
