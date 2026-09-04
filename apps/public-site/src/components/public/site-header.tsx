import { getVisibleNavigation } from "@/lib/content/navigation";
import { getSiteSettings } from "@/lib/content/site-settings";
import { MobileNav } from "./mobile-nav";
import { FacebookIcon, GithubIcon, InstagramIcon } from "./social-icons";

export async function SiteHeader() {
  const [nav, settings] = await Promise.all([getVisibleNavigation(), getSiteSettings()]);
  const navItems = nav.primary.map((item) => ({ label: item.label, href: item.url }));

  const socials = [
    settings.social_facebook && { label: "Facebook", Icon: FacebookIcon, href: settings.social_facebook },
    settings.social_instagram && { label: "Instagram", Icon: InstagramIcon, href: settings.social_instagram },
    settings.social_github && { label: "GitHub", Icon: GithubIcon, href: settings.social_github },
  ].filter((social): social is { label: string; Icon: typeof FacebookIcon; href: string } => Boolean(social));

  return (
    <header className="fixed left-0 right-0 top-0 z-20 h-[76px] border-b border-white/10 bg-[#05070c]/70 backdrop-blur-xl">
      <div className="container-shell flex h-full items-center justify-between px-7 md:px-0">
        <a href="#top" className="text-[18px] font-bold tracking-[0.08em]">
          ROBO<span className="text-[#ff3b46]">SUST</span>
        </a>
        {/* One flex item, not two/three: justify-between only pins this
            flush right reliably if it always has real width. Splitting nav
            and socials into separate top-level flex children broke that the
            moment socials was empty (the common case, until an admin fills
            in Settings -> Social links) — nav drifted toward the middle
            instead of hugging the right edge, since justify-between forces
            both gaps equal regardless of whether the last item is visible. */}
        <div className="flex items-center gap-8">
          <nav className="hidden items-center gap-6 text-[13px] text-[#cbd1dc] md:flex">
            {navItems.map(({ label, href }) => (
              <a key={href} href={href} className="group relative pb-2 text-[#cbd1dc] transition hover:text-white">
                <span className="relative after:absolute after:left-0 after:bottom-0 after:h-[2px] after:w-0 after:bg-gradient-to-r after:from-[#d4af37] after:to-[#fdf6e3] after:transition-all after:duration-300 group-hover:after:w-full">
                  {label}
                </span>
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-4">
            <div className="hidden items-center gap-3 sm:flex">
              {socials.map(({ label, Icon, href }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={label}
                  className="grid h-9 w-9 place-items-center rounded-full border border-white/10 text-[#dce2ec] transition hover:-translate-y-0.5 hover:border-[#d4af37]/60 hover:text-[#d4af37]"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
            <MobileNav navItems={navItems} />
          </div>
        </div>
      </div>
    </header>
  );
}
