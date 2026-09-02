import "server-only";
import { createClient as createServerSupabase } from "@robosust/supabase/server";
import type { Tables } from "@robosust/supabase/types";
import { createContentModule } from "./_factory";

export type Achievement = Tables<"achievements">;

const base = createContentModule("achievements");

export const listAchievements = base.list;
export const getAchievementById = base.getById;
export const createAchievement = base.create;
export const updateAchievement = base.update;
export const deleteAchievement = base.remove;

export async function getRecentAchievements(limit = 6): Promise<Achievement[]> {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from("achievements")
    .select("*")
    .order("year", { ascending: false })
    .order("sort_order", { ascending: true })
    .limit(limit);
  if (error) throw error;
  return data;
}

export async function getAchievementsByYear(): Promise<Record<string, Achievement[]>> {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from("achievements")
    .select("*")
    .order("year", { ascending: false })
    .order("sort_order", { ascending: true });
  if (error) throw error;

  return data.reduce<Record<string, Achievement[]>>((byYear, row) => {
    const key = row.year ? String(row.year) : "Unspecified";
    (byYear[key] ??= []).push(row);
    return byYear;
  }, {});
}
