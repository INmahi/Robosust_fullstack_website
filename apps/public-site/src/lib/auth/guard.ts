import "server-only";
import { createClient as createServerSupabase } from "@robosust/supabase/server";
import type { Tables } from "@robosust/supabase/types";
import { redirect } from "next/navigation";

export type CmsUser = Tables<"cms_users">;

// Returns the signed-in cms_users row, or null if unauthenticated / not a
// cms_user. A Supabase session that isn't paired with a cms_users row (e.g.
// the row was deleted by an admin) is treated as logged-out.
export async function getCmsUser(): Promise<CmsUser | null> {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data } = await supabase.from("cms_users").select("*").eq("id", user.id).maybeSingle();
  return data ?? null;
}

export async function requireCmsUser(): Promise<CmsUser> {
  const user = await getCmsUser();
  if (!user) redirect("/admin/login");
  return user;
}

export async function requireAdmin(): Promise<CmsUser> {
  const user = await requireCmsUser();
  if (user.role !== "admin") redirect("/admin");
  return user;
}
