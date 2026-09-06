import "server-only";
import type { Metadata } from "next";
import { getSeoMetadataForPage } from "@/lib/content/seo-metadata";
import { getSiteSettings } from "@/lib/content/site-settings";

// One shape for every public route's generateMetadata(): the seo_metadata row
// for that page_key wins, then the caller's own fallback, then site_settings.
// Kept out of (public)/layout.tsx so a page can import it without pulling the
// layout's component tree in with it.
export async function buildPageMetadata(
  pageKey: string,
  fallback: { title: string; description?: string },
): Promise<Metadata> {
  const [seo, settings] = await Promise.all([getSeoMetadataForPage(pageKey), getSiteSettings()]);

  return {
    title: seo?.title || `${fallback.title} — ${settings.site_name}`,
    description: seo?.description || fallback.description || settings.tagline || undefined,
    openGraph: seo?.share_image_url ? { images: [seo.share_image_url] } : undefined,
  };
}
