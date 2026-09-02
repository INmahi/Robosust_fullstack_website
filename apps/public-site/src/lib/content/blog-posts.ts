import "server-only";
import { createClient as createServerSupabase } from "@robosust/supabase/server";
import type { Tables } from "@robosust/supabase/types";
import { createContentModule } from "./_factory";

export type BlogPost = Tables<"blog_posts">;

const base = createContentModule("blog_posts");

export const listBlogPosts = base.list; // includes drafts — admin only
export const getBlogPostById = base.getById;
export const createBlogPost = base.create;
export const updateBlogPost = base.update;
export const deleteBlogPost = base.remove;

export async function getPublishedBlogPosts(limit?: number): Promise<BlogPost[]> {
  const supabase = await createServerSupabase();
  let query = supabase
    .from("blog_posts")
    .select("*")
    .eq("published", true)
    .order("created_at", { ascending: false });
  if (limit) query = query.limit(limit);
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function getPublishedBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();
  if (error) throw error;
  return data;
}
