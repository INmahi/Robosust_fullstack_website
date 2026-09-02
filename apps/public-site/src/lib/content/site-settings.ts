import "server-only";
import { createClient as createServerSupabase } from "@robosust/supabase/server";
import type { Tables, TablesUpdate } from "@robosust/supabase/types";

export type SiteSettings = Tables<"site_settings">;

// Singleton row (id is always `true`, enforced by a check constraint in the
// migration) — no list/create/delete, just get and update.
export async function getSiteSettings(): Promise<SiteSettings> {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase.from("site_settings").select("*").single();
  if (error) throw error;
  return data;
}

export async function updateSiteSettings(values: TablesUpdate<"site_settings">): Promise<SiteSettings> {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from("site_settings")
    .update(values)
    .eq("id", true)
    .select()
    .single();
  if (error) throw error;
  return data;
}
