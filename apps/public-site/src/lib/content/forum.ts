import "server-only";
import { createClient as createServerSupabase } from "@robosust/supabase/server";
import type { Tables } from "@robosust/supabase/types";
import { createContentModule } from "./_factory";

export type ForumCategory = Tables<"forum_categories">;
export type ForumPost = Tables<"forum_posts">;
export type ForumReply = Tables<"forum_replies">;

const categoryBase = createContentModule("forum_categories");
const postBase = createContentModule("forum_posts");
const replyBase = createContentModule("forum_replies");

export const listForumCategories = categoryBase.list;
export const createForumCategory = categoryBase.create;
export const updateForumCategory = categoryBase.update;
export const deleteForumCategory = categoryBase.remove;

export const listForumPosts = postBase.list;
export const getForumPostById = postBase.getById;
export const deleteForumPost = postBase.remove;

// Anonymous posting (name + email, no account) is a carried-over requirement
// from the current site — see frontend-overview.md §6.10's flagged spam-risk note.
export async function createForumPost(input: {
  categoryId: string | null;
  title: string;
  body: string;
  authorName: string;
  authorEmail: string;
}): Promise<ForumPost> {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from("forum_posts")
    .insert({
      category_id: input.categoryId,
      title: input.title,
      body: input.body,
      author_name: input.authorName,
      author_email: input.authorEmail,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export const deleteForumReply = replyBase.remove;

export async function createForumReply(input: {
  postId: string;
  body: string;
  authorName: string;
  authorEmail: string;
}): Promise<ForumReply> {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from("forum_replies")
    .insert({
      post_id: input.postId,
      body: input.body,
      author_name: input.authorName,
      author_email: input.authorEmail,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getForumPostsByCategory(categoryId: string): Promise<ForumPost[]> {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from("forum_posts")
    .select("*")
    .eq("category_id", categoryId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function getForumRepliesForPost(postId: string): Promise<ForumReply[]> {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from("forum_replies")
    .select("*")
    .eq("post_id", postId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data;
}
