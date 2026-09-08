import { User } from "lucide-react";
import { getVisibleNavigation } from "@/lib/content/navigation";
import { MobileNav } from "./mobile-nav";
import { NavMoreMenu } from "./nav-more-menu";
import { SiteLogo } from "./site-logo";

export async function SiteHeader() {
  const nav = await getVisibleNavigation();
  const navItems = nav.primary.map((item) => ({ label: item.label, href: item.url }));
  const moreItems = nav.more.map((item) => ({ id: item.id, label: item.label, url: item.url }));

  return (
    <header className="fixed left-0 right-0 top-0 z-20 h-[76px] border-b border-[#e5c76b]/15 bg-[#05070c]/80 backdrop-blur-xl">
      <div className="container-shell flex h-full items-center justify-between gap-4 px-5 md:px-0">
        <SiteLogo className="h-[28px] md:h-[46px]" />

        {/* The angled band, matching the
            mockup's slanted edges — but tinted dark gold rather than solid
            gold, so it reads as part of the header instead of a block dropped
            on top of it. It widens downward — the left edge leans out to
            the left and the right edge out to the right, so the bottom is
            wider than the top. Not a parallelogram (both edges leaning the
            same way) and not a trapezoid that narrows; both of those were
            tried and rejected. The nav sits in its own layer above the clipped one:
            clip-path on an ancestor would cut the hover underline off at the
            slanted edges. */}
        <div className="hidden h-full flex-1 items-center justify-center md:flex">
          {/* The band sizes to the nav rather than a fixed width, so it keeps
              hugging the items when one is added or renamed in /admin. */}
          <div className="relative flex h-full items-center px-12 lg:px-16">
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-r from-[#2b2109] via-[#453413] to-[#2b2109]"
              style={{ clipPath: "polygon(42px 0, calc(100% - 42px) 0, 100% 100%, 0 100%)" }}
            />
            <nav className="relative flex items-center gap-7 text-[14px] text-[#cbd1dc]">
              {navItems.map(({ label, href }) => (
                <a
                  key={href}
                  href={href}
                  className="group relative pb-1 text-[#dce2ec] transition hover:text-white"
                >
                  <span className="relative after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 after:bg-gradient-to-r after:from-[#d4af37] after:to-[#fdf6e3] after:transition-all after:duration-300 group-hover:after:w-full">
                    {label}
                  </span>
                </a>
              ))}
            </nav>
          </div>
        </div>

        <div className="flex items-center gap-4 md:gap-5">
          <a
            href="/join-us"
            className="hidden text-[13px] font-medium text-[#d4af37] transition hover:text-[#fdf6e3] md:block"
          >
            Join Us
          </a>
          <div className="hidden md:block">
            <NavMoreMenu items={moreItems} />
          </div>
          {/* Account entry point. Inert for now — a <span>, not a disabled
              <button>, so it doesn't advertise itself as something that should
              respond to a click. */}
          <span
            title="Account — coming soon"
            aria-hidden="true"
            className="hidden h-9 w-9 place-items-center rounded-full border border-white/15 text-[#aeb7c7] md:grid"
          >
            <User size={17} />
          </span>

          <MobileNav navItems={navItems} moreItems={moreItems} />
        </div>
      </div>
    </header>
  );
}
