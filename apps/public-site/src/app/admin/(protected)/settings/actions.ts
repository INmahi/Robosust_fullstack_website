"use server";

import { updateSiteSettings } from "@/lib/content/site-settings";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function updateSiteSettingsAction(formData: FormData) {
  const get = (key: string) => {
    const value = String(formData.get(key) ?? "").trim();
    return value === "" ? null : value;
  };

  await updateSiteSettings({
    site_name: get("site_name") ?? "RoboSUST",
    tagline: get("tagline"),
    logo_url: get("logo_url"),
    favicon_url: get("favicon_url"),
    social_facebook: get("social_facebook"),
    social_youtube: get("social_youtube"),
    social_linkedin: get("social_linkedin"),
    contact_email: get("contact_email"),
    contact_phone: get("contact_phone"),
    contact_address: get("contact_address"),
    map_embed_url: get("map_embed_url"),
    recruitment_open: formData.get("recruitment_open") === "on",
  });

  revalidatePath("/admin/settings");
  redirect("/admin/settings?success=1");
}
