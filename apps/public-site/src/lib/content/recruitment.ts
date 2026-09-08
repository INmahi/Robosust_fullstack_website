import "server-only";
import { cache } from "react";
import { createClient as createServerSupabase } from "@robosust/supabase/server";
import type { Tables, TablesUpdate } from "@robosust/supabase/types";

export type Recruitment = Tables<"recruitment">;
export type RecruitmentStatus = Recruitment["status"];

// Singleton row (id is always `true`, enforced by a check constraint in the
// migration) — no list/create/delete, just get and update, exactly like
// site-settings.ts. Cached per-request in case more than one thing on a page
// ends up asking.
export const getRecruitment = cache(async (): Promise<Recruitment | null> => {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase.from("recruitment").select("*").maybeSingle();
  if (error) throw error;
  return data;
});

export async function updateRecruitment(values: TablesUpdate<"recruitment">): Promise<Recruitment> {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from("recruitment")
    .update(values)
    .eq("id", true)
    .select()
    .single();
  if (error) throw error;
  return data;
}
