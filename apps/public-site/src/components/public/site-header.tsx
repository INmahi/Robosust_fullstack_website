import { getVisibleNavigation } from "@/lib/content/navigation";
import { MobileNav } from "./mobile-nav";

export async function SiteHeader() {
  const nav = await getVisibleNavigation();
  const navItems = nav.primary.map((item) => ({ label: item.label, href: item.url }));

  return (
    <header className="fixed left-0 right-0 top-0 z-20 h-[76px] border-b border-white/10 bg-[#05070c]/70 backdrop-blur-xl">
      <div className="container-shell flex h-full items-center justify-between px-7 md:px-0">
        <a href="#top" className="text-[20px] font-bold tracking-[0.08em]">
          ROBO<span className="text-[#ff3b46]">SUST</span>
        </a>
        {/* One flex item, not two: justify-between only pins this flush
            right reliably if it always has real width, which nav+mobile-
            button always does (nav on desktop, the mobile button on small
            screens) — see the header-collapse bug this avoided, noted in
            IMPLEMENTATION_PLAN.md's status log. */}
        <div className="flex items-center gap-8">
          <nav className="hidden items-center gap-7 text-[14px] text-[#cbd1dc] md:flex">
            {navItems.map(({ label, href }) => (
              <a key={href} href={href} className="group relative pb-2 text-[#cbd1dc] transition hover:text-white">
                <span className="relative after:absolute after:left-0 after:bottom-0 after:h-[2px] after:w-0 after:bg-gradient-to-r after:from-[#d4af37] after:to-[#fdf6e3] after:transition-all after:duration-300 group-hover:after:w-full">
                  {label}
                </span>
              </a>
            ))}
          </nav>
          <MobileNav navItems={navItems} />
        </div>
      </div>
    </header>
  );
}
