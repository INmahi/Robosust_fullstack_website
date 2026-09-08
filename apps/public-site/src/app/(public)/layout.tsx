import type { Metadata } from "next";
import { PublicShell } from "@/components/public/public-shell";
import { getSiteSettings } from "@/lib/content/site-settings";
import { getSeoMetadataForPage } from "@/lib/content/seo-metadata";

export async function generateMetadata(): Promise<Metadata> {
  const [settings, seo] = await Promise.all([getSiteSettings(), getSeoMetadataForPage("home")]);

  return {
    title: seo?.title || `${settings.site_name} — ${settings.tagline || "Robotics For Glory."}`,
    description: seo?.description || settings.tagline || undefined,
    openGraph: seo?.share_image_url ? { images: [seo.share_image_url] } : undefined,
  };
}

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return <PublicShell>{children}</PublicShell>;
}
