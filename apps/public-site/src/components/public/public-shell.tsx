import { getSiteSettings } from "@/lib/content/site-settings";
import { PageEffects } from "./page-effects";
import { ScrollToTop } from "./scroll-to-top";
import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";

const fallbackBackground =
  "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=1800&q=80";

// The public site's chrome, shared by both public route groups. It exists as a
// component rather than living in one layout because a Server Component layout
// can't know which child route rendered — and /join-us needs the header without
// the footer. Route groups are the idiomatic way to express that in the App
// Router, and this is what keeps the two layouts from drifting.
export async function PublicShell({
  children,
  footer = true,
}: {
  children: React.ReactNode;
  /** /join-us is exactly one viewport tall by design; a footer would make it
   *  scroll, which is the thing that page is trying not to do. */
  footer?: boolean;
}) {
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
        {footer && <SiteFooter />}
        {footer && <ScrollToTop />}
      </PageEffects>
    </div>
  );
}
