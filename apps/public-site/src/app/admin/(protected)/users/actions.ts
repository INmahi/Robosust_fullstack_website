"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  createCmsUser,
  resetCmsUserPassword,
  deleteCmsUser,
} from "@/lib/auth/admin-actions";

// Temp passwords are shown exactly once. Rather than putting them in the
// URL (logged in browser history), they're carried in a short-lived
// httpOnly cookie the /admin/users page reads on the very next render.
const FLASH_COOKIE = "cms_flash_temp_password";

async function flashTempPassword(tempPassword: string) {
  const cookieStore = await cookies();
  cookieStore.set(FLASH_COOKIE, tempPassword, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 60,
    path: "/admin/users",
  });
}

export async function createUserAction(formData: FormData) {
  const username = String(formData.get("username") ?? "").trim();
  const fullName = String(formData.get("fullName") ?? "").trim();
  const role = String(formData.get("role") ?? "editor").trim();

  const result = await createCmsUser({ username, fullName, role });
  // Checked against `undefined` (not truthiness) so TS narrows the result
  // union correctly below — `error` is a non-empty string in the error
  // branch, but plain truthiness can't rule out an empty-string edge case.
  if (result.error !== undefined) {
    redirect(`/admin/users?error=${encodeURIComponent(result.error)}`);
  }

  await flashTempPassword(result.tempPassword);
  redirect("/admin/users?created=1");
}

export async function resetPasswordAction(formData: FormData) {
  const userId = String(formData.get("userId") ?? "");
  const result = await resetCmsUserPassword(userId);
  if (result.error !== undefined) {
    redirect(`/admin/users?error=${encodeURIComponent(result.error)}`);
  }

  await flashTempPassword(result.tempPassword);
  redirect("/admin/users?reset=1");
}

export async function deleteUserAction(formData: FormData) {
  const userId = String(formData.get("userId") ?? "");
  const result = await deleteCmsUser(userId);
  if (result.error) {
    redirect(`/admin/users?error=${encodeURIComponent(result.error)}`);
  }
  redirect("/admin/users?deleted=1");
}

// Cookie expires 60s after being set (see flashTempPassword above) — this
// just reads whatever's there now, it doesn't need to actively clear it.
export async function readFlashTempPassword(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(FLASH_COOKIE)?.value;
}
