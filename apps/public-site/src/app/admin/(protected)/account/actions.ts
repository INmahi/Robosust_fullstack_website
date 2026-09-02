"use server";

import { changeOwnPassword } from "@/lib/auth/session";
import { redirect } from "next/navigation";

export async function changePasswordAction(formData: FormData) {
  const currentPassword = String(formData.get("currentPassword") ?? "");
  const newPassword = String(formData.get("newPassword") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (newPassword !== confirmPassword) {
    redirect(`/admin/account?error=${encodeURIComponent("New passwords don't match.")}`);
  }

  const result = await changeOwnPassword(currentPassword, newPassword);
  if (result.error) {
    redirect(`/admin/account?error=${encodeURIComponent(result.error)}`);
  }

  redirect("/admin/account?success=1");
}
