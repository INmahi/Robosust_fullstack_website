"use server";

import { createClient as createServerSupabase } from "@robosust/supabase/server";
import { createAdminClient } from "@robosust/supabase/admin";
import { redirect } from "next/navigation";

export type LoginResult = { error: string } | { error?: undefined };

// Username -> synthetic email -> Supabase Auth. Nothing is ever emailed:
// the address exists only so Supabase Auth (which requires an email-shaped
// identifier) has something to key on.
export async function login(username: string, password: string): Promise<LoginResult> {
  if (!username || !password) {
    return { error: "Username and password are required." };
  }

  const admin = createAdminClient();
  const { data: cmsUser, error: lookupError } = await admin
    .from("cms_users")
    .select("email")
    .eq("username", username)
    .maybeSingle();

  if (lookupError || !cmsUser) {
    return { error: "Invalid username or password." };
  }

  const supabase = await createServerSupabase();
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: cmsUser.email,
    password,
  });

  if (signInError) {
    return { error: "Invalid username or password." };
  }

  return {};
}

export async function logout() {
  const supabase = await createServerSupabase();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

export type ChangePasswordResult = { error: string } | { error?: undefined };

export async function changeOwnPassword(
  currentPassword: string,
  newPassword: string,
): Promise<ChangePasswordResult> {
  if (newPassword.length < 8) {
    return { error: "New password must be at least 8 characters." };
  }

  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return { error: "Not signed in." };
  }

  // Re-verify the current password before allowing the change, since
  // updateUser() alone trusts the active session without asking for it again.
  const { error: reauthError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: currentPassword,
  });
  if (reauthError) {
    return { error: "Current password is incorrect." };
  }

  const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
  if (updateError) {
    return { error: updateError.message };
  }

  await supabase.from("cms_users").update({ must_change_password: false }).eq("id", user.id);

  return {};
}
