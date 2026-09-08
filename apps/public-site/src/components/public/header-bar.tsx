"use client";

import { User } from "lucide-react";
import { useSyncExternalStore } from "react";
import { MobileNav } from "./mobile-nav";
import { NavMoreMenu, type MoreItem } from "./nav-more-menu";
import { SiteLogo } from "./site-logo";

// The band is a parallelogram in both states, leaning one way at rest and the
// mirror of that once scrolled — same 42px offset, opposite sides. Corners are
// listed in the same order (TL, TR, BR, BL) in both, and both have four points,
// which is what lets clip-path interpolate between them: change the point count
// or the winding and the transition snaps instead of animating.
const BAND_AT_REST = "polygon(42px 0, 100% 0, calc(100% - 42px) 100%, 0 100%)";
const BAND_SCROLLED = "polygon(0 0, calc(100% - 42px) 0, 100% 100%, 42px 100%)";

// useSyncExternalStore rather than an effect + setState: it gives the right
// answer on the very first render when the page loads already scrolled (a
// refresh partway down), and eslint's react-hooks/set-state-in-effect rejects
// the effect form outright.
function subscribe(onChange: () => void) {
  window.addEventListener("scroll", onChange, { passive: true });
  return () => window.removeEventListener("scroll", onChange);
}

function useScrolled(threshold = 24) {
  return useSyncExternalStore(
    subscribe,
    () => window.scrollY > threshold,
    () => false,
  );
}

export function HeaderBar({
  navItems,
  moreItems,
}: {
  navItems: { label: string; href: string }[];
  moreItems: MoreItem[];
}) {
  const scrolled = useScrolled();

  return (
    <header
      data-scrolled={scrolled}
      className={`fixed left-0 right-0 top-0 z-20 border-b border-[#e5c76b]/15 bg-[#05070c]/80 backdrop-blur-xl transition-[height] duration-300 ease-out motion-reduce:transition-none ${
        scrolled ? "h-[58px]" : "h-[76px]"
      }`}
    >
      <div className="container-shell flex h-full items-center justify-between gap-4 px-5 md:px-0">
        <SiteLogo
          className={`transition-[height] duration-300 ease-out motion-reduce:transition-none ${
            scrolled ? "h-[24px] md:h-[34px]" : "h-[28px] md:h-[46px]"
          }`}
        />

        <div className="hidden h-full flex-1 items-center justify-center md:flex">
          {/* The band sizes to the nav rather than a fixed width, so it keeps
              hugging the items when one is added or renamed in /admin. */}
          <div
            className={`relative flex h-full items-center transition-[padding] duration-300 ease-out ${
              scrolled ? "px-8" : "px-12 lg:px-16"
            }`}
          >
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-r from-[#2b2109] via-[#453413] to-[#2b2109] transition-[clip-path] duration-300 ease-out motion-reduce:transition-none"
              style={{ clipPath: scrolled ? BAND_SCROLLED : BAND_AT_REST }}
            />
            {/* The nav is a layer above the clipped one: clip-path on an
                ancestor would cut the hover underline off at the slanted edges. */}
            <nav
              className={`relative flex items-center text-[#cbd1dc] transition-all duration-300 ease-out ${
                scrolled ? "gap-5 text-[13px]" : "gap-7 text-[14px]"
              }`}
            >
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
            className={`hidden font-medium text-[#d4af37] transition-all duration-300 hover:text-[#fdf6e3] md:block ${
              scrolled ? "text-[12px]" : "text-[13px]"
            }`}
          >
            Join Us
          </a>
          <div className="hidden md:block">
            <NavMoreMenu items={moreItems} />
          </div>
          {/* Account entry point. Inert for now — a <span>, not a disabled
              <button>, so it doesn't advertise itself as clickable. */}
          <span
            title="Account — coming soon"
            aria-hidden="true"
            className={`hidden place-items-center rounded-full border border-white/15 text-[#aeb7c7] transition-all duration-300 md:grid ${
              scrolled ? "h-8 w-8" : "h-9 w-9"
            }`}
          >
            <User size={scrolled ? 15 : 17} />
          </span>

          <MobileNav navItems={navItems} moreItems={moreItems} />
        </div>
      </div>
    </header>
  );
}
