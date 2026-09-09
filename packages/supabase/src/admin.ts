import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

// Service-role client. Bypasses RLS entirely — never import this outside of
// server-only auth code (username->email lookup at login, user creation,
// admin-triggered password resets). Never expose SUPABASE_SECRET_KEY to the
// client bundle; the `server-only` import above makes that a build error.
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secretKey = process.env.SUPABASE_SECRET_KEY;

  // Named explicitly rather than asserted with `!`. SUPABASE_SECRET_KEY is read
  // at *runtime*, unlike the NEXT_PUBLIC_* pair which Next inlines at build —
  // so a deployment can serve every public page perfectly and still have this
  // undefined. Passing undefined through makes supabase-js throw "supabaseKey
  // is required" from inside the SDK, which says nothing about which variable
  // is missing or where to set it; that cost a debugging session on Netlify.
  if (!url || !secretKey) {
    const missing = [!url && "NEXT_PUBLIC_SUPABASE_URL", !secretKey && "SUPABASE_SECRET_KEY"]
      .filter(Boolean)
      .join(", ");
    throw new Error(
      `createAdminClient(): missing ${missing}. This is server-only and read at runtime — ` +
        `set it in the hosting environment (on Netlify: Site configuration → Environment ` +
        `variables, scoped to Functions), then redeploy.`,
    );
  }

  return createSupabaseClient<Database>(url, secretKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
