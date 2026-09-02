import "server-only";
import { createClient as createServerSupabase } from "@robosust/supabase/server";
import type { Tables } from "@robosust/supabase/types";
import { createContentModule } from "./_factory";

export type NavigationItem = Tables<"navigation_items">;

const base = createContentModule("navigation_items");

export const listNavigationItems = base.list; // all items, including hidden — admin only
export const getNavigationItemById = base.getById;
export const createNavigationItem = base.create;
export const updateNavigationItem = base.update;
export const deleteNavigationItem = base.remove;

// What the navbar/More menu/footer should render, grouped and sorted.
export async function getVisibleNavigation(): Promise<Record<NavigationItem["group_name"], NavigationItem[]>> {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from("navigation_items")
    .select("*")
    .eq("visible", true)
    .order("sort_order", { ascending: true });
  if (error) throw error;

  return data.reduce(
    (byGroup, item) => {
      byGroup[item.group_name].push(item);
      return byGroup;
    },
    { primary: [], more: [], footer: [] } as Record<NavigationItem["group_name"], NavigationItem[]>,
  );
}
