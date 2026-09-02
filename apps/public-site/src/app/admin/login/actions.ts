"use server";

import { login } from "@/lib/auth/session";
import { redirect } from "next/navigation";

export async function loginAction(formData: FormData) {
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  const result = await login(username, password);
  if (result.error) {
    redirect(`/admin/login?error=${encodeURIComponent(result.error)}`);
  }

  redirect("/admin");
}
