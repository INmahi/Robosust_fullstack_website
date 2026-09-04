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
      <div className="container-shell grid h-full grid-cols-[1fr_auto_1fr] items-center px-7 md:px-0">
        <div className="hidden items-center gap-3 sm:flex">
          {socials.map(({ label, Icon, href }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noreferrer"
              aria-label={label}
              className="grid h-9 w-9 place-items-center rounded-full border border-white/10 text-[#dce2ec] transition hover:-translate-y-0.5 hover:border-[#3d7cff]/60"
            >
              <Icon size={16} />
            </a>
          ))}
        </div>
        <a href="#top" className="justify-self-start text-[18px] font-bold tracking-[0.08em] md:justify-self-center">
          ROBO<span className="text-[#ff3b46]">SUST</span>
        </a>
        <nav className="hidden items-center justify-self-end gap-6 text-[13px] text-[#cbd1dc] md:flex">
          {navItems.map(({ label, href }) => (
            <a key={href} href={href} className="group relative pb-2 text-[#cbd1dc] transition hover:text-white">
              <span className="relative after:absolute after:left-0 after:bottom-0 after:h-[2px] after:w-0 after:bg-gradient-to-r after:from-[#ff3b46] after:to-[#3d7cff] after:transition-all after:duration-300 group-hover:after:w-full">
                {label}
              </span>
            </a>
          ))}
        </nav>
        <MobileNav navItems={navItems} />
      </div>
    </header>
  );
}
