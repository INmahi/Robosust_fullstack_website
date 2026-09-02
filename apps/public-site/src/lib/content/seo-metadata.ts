import "server-only";
import { createClient as createServerSupabase } from "@robosust/supabase/server";
import type { Tables } from "@robosust/supabase/types";
import { createContentModule } from "./_factory";

export type SeoMetadata = Tables<"seo_metadata">;

const base = createContentModule("seo_metadata");

export const listSeoMetadata = base.list;
export const createSeoMetadata = base.create;
export const updateSeoMetadata = base.update;
export const deleteSeoMetadata = base.remove;

export async function getSeoMetadataForPage(pageKey: string): Promise<SeoMetadata | null> {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from("seo_metadata")
    .select("*")
    .eq("page_key", pageKey)
    .maybeSingle();
  if (error) throw error;
  return data;
}
