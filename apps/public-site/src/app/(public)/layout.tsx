import type { Metadata } from "next";
import { getSiteSettings } from "@/lib/content/site-settings";
import { getSeoMetadataForPage } from "@/lib/content/seo-metadata";
import { PageEffects } from "@/components/public/page-effects";
import { SiteHeader } from "@/components/public/site-header";
import { SiteFooter } from "@/components/public/site-footer";

const fallbackBackground =
  "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=1800&q=80";

export async function generateMetadata(): Promise<Metadata> {
  const [settings, seo] = await Promise.all([getSiteSettings(), getSeoMetadataForPage("home")]);

  return {
    title: seo?.title || `${settings.site_name} — ${settings.tagline || "Robotics For Glory."}`,
    description: seo?.description || settings.tagline || undefined,
    openGraph: seo?.share_image_url ? { images: [seo.share_image_url] } : undefined,
  };
}

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSiteSettings();
  const backgroundImage = settings.background_image_url || fallbackBackground;

  return (
    <div
      className="min-h-screen font-[family-name:var(--font-space-grotesk)] text-[#f5f7fb] antialiased"
      style={{
        backgroundImage: `linear-gradient(180deg, rgba(5,7,12,0.88), rgba(5,7,12,0.96)), url('${backgroundImage}')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
        backgroundRepeat: "no-repeat",
      }}
    >
      <PageEffects>
        <SiteHeader />
        <main id="top" className="pt-[76px]">
          {children}
        </main>
        <SiteFooter />
      </PageEffects>
    </div>
  );
}
