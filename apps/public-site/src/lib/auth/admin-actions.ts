"use server";

import { createAdminClient } from "@robosust/supabase/admin";
import type { Tables } from "@robosust/supabase/types";
import { requireAdmin } from "./guard";
import { usernameToSyntheticEmail, generateTempPassword } from "./username";

export async function listCmsUsers(): Promise<Tables<"cms_users">[]> {
  await requireAdmin();
  const admin = createAdminClient();
  const { data, error } = await admin.from("cms_users").select("*").order("created_at", { ascending: true });
  if (error) throw error;
  return data;
}

export type CreateCmsUserResult =
  | { error: string; tempPassword?: undefined }
  | { error?: undefined; tempPassword: string };

export async function createCmsUser(input: {
  username: string;
  fullName: string;
  role: string;
}): Promise<CreateCmsUserResult> {
  await requireAdmin();

  const username = input.username.trim().toLowerCase();
  if (!/^[a-z0-9._-]{3,32}$/.test(username)) {
    return { error: "Username must be 3-32 characters: letters, numbers, dot, dash, underscore." };
  }

  const admin = createAdminClient();
  const email = usernameToSyntheticEmail(username);
  const tempPassword = generateTempPassword();

  const { data: authUser, error: createError } = await admin.auth.admin.createUser({
    email,
    password: tempPassword,
    email_confirm: true,
  });
  if (createError || !authUser?.user) {
    return { error: createError?.message ?? "Could not create the auth account." };
  }

  const { error: insertError } = await admin.from("cms_users").insert({
    id: authUser.user.id,
    username,
    email,
    full_name: input.fullName,
    role: input.role || "editor",
    must_change_password: true,
  });

  if (insertError) {
    // Roll back the orphaned auth user so retrying with the same username works.
    await admin.auth.admin.deleteUser(authUser.user.id);
    return { error: insertError.message };
  }

  return { tempPassword };
}

export type ResetPasswordResult = { error: string; tempPassword?: undefined } | { error?: undefined; tempPassword: string };

export async function resetCmsUserPassword(userId: string): Promise<ResetPasswordResult> {
  await requireAdmin();

  const admin = createAdminClient();
  const tempPassword = generateTempPassword();

  const { error: updateAuthError } = await admin.auth.admin.updateUserById(userId, {
    password: tempPassword,
  });
  if (updateAuthError) {
    return { error: updateAuthError.message };
  }

  const { error: updateRowError } = await admin
    .from("cms_users")
    .update({ must_change_password: true })
    .eq("id", userId);
  if (updateRowError) {
    return { error: updateRowError.message };
  }

  return { tempPassword };
}

export async function deleteCmsUser(userId: string): Promise<{ error?: string }> {
  const actor = await requireAdmin();
  if (actor.id === userId) {
    return { error: "You can't delete your own account." };
  }

  const admin = createAdminClient();
  const { error } = await admin.auth.admin.deleteUser(userId);
  if (error) return { error: error.message };

  // cms_users row cascades on auth.users delete (FK on delete cascade).
  return {};
}
