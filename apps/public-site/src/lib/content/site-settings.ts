import "server-only";
import { cache } from "react";
import { createClient as createServerSupabase } from "@robosust/supabase/server";
import type { Tables, TablesUpdate } from "@robosust/supabase/types";

export type SiteSettings = Tables<"site_settings">;

// Singleton row (id is always `true`, enforced by a check constraint in the
// migration) — no list/create/delete, just get and update. Wrapped in React's
// cache() because the header, footer, and hero section of a single page all
// call this independently — dedupes to one query per request instead of one
// per caller.
export const getSiteSettings = cache(async (): Promise<SiteSettings> => {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase.from("site_settings").select("*").single();
  if (error) throw error;
  return data;
});

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
