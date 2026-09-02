import "server-only";
import { createClient as createServerSupabase } from "@robosust/supabase/server";
import type { Tables } from "@robosust/supabase/types";
import { createContentModule } from "./_factory";

export type Notice = Tables<"notices">;

const base = createContentModule("notices");

export const listNotices = base.list; // all rows, including expired — for the admin CRUD screen
export const getNoticeById = base.getById;
export const createNotice = base.create;
export const updateNotice = base.update;
export const deleteNotice = base.remove;

// What the public homepage banner should render: non-expired, pinned first.
export async function getActiveNotices(): Promise<Notice[]> {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from("notices")
    .select("*")
    .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
    .order("pinned", { ascending: false })
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return data;
}
