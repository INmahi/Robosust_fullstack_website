import "server-only";
import { createClient as createServerSupabase } from "@robosust/supabase/server";
import type { Tables } from "@robosust/supabase/types";
import { createContentModule } from "./_factory";

export type HomeSection = Tables<"home_sections">;
export type HomeSectionItem = Tables<"home_section_items">;

const base = createContentModule("home_sections");
const itemBase = createContentModule("home_section_items");

export const listHomeSections = base.list; // all sections, including hidden — admin only
export const getHomeSectionById = base.getById;
export const createHomeSection = base.create;
export const updateHomeSection = base.update;
export const deleteHomeSection = base.remove;

export const createHomeSectionItem = itemBase.create;
export const updateHomeSectionItem = itemBase.update;
export const deleteHomeSectionItem = itemBase.remove;

export async function getVisibleHomeSections(): Promise<HomeSection[]> {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from("home_sections")
    .select("*")
    .eq("visible", true)
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return data;
}

export async function getHomeSectionByKey(sectionKey: string): Promise<HomeSection | null> {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from("home_sections")
    .select("*")
    .eq("section_key", sectionKey)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function listHomeSectionItems(sectionId: string): Promise<HomeSectionItem[]> {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from("home_section_items")
    .select("*")
    .eq("section_id", sectionId)
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return data;
}

// The public read path: a section plus its ordered items in one call, for
// sections like About/Achievements whose cards come from home_section_items.
export async function getHomeSectionWithItems(
  sectionKey: string,
): Promise<(HomeSection & { items: HomeSectionItem[] }) | null> {
  const section = await getHomeSectionByKey(sectionKey);
  if (!section) return null;

  const items = await listHomeSectionItems(section.id);
  return { ...section, items };
}
