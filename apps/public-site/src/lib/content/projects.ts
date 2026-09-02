import "server-only";
import { createClient as createServerSupabase } from "@robosust/supabase/server";
import type { Tables } from "@robosust/supabase/types";
import { createContentModule } from "./_factory";

export type Project = Tables<"projects">;

const base = createContentModule("projects");

export const listProjects = base.list;
export const getProjectById = base.getById;
export const createProject = base.create;
export const updateProject = base.update;
export const deleteProject = base.remove;

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase.from("projects").select("*").eq("slug", slug).maybeSingle();
  if (error) throw error;
  return data;
}

export async function getFlagshipProjects(limit = 3): Promise<Project[]> {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("flagship", true)
    .order("sort_order", { ascending: true })
    .limit(limit);
  if (error) throw error;
  return data;
}

export async function getProjectsByStatus(status: Project["status"]): Promise<Project[]> {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("status", status)
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return data;
}
