"use client";

import { ArrowUpRight, Menu, User, X } from "lucide-react";
import { useEffect, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import type { MoreItem } from "./nav-more-menu";

type MobileNavProps = {
  navItems: { label: string; href: string }[];
  moreItems: MoreItem[];
};

const isPlaceholder = (url: string) => !url || url === "#";

// createPortal needs document, which doesn't exist during SSR. Expressed with
// useSyncExternalStore rather than an effect + setState: it has a real server
// snapshot, and eslint's react-hooks/set-state-in-effect rejects the effect
// form outright.
const noop = () => () => {};
function useIsClient() {
  return useSyncExternalStore(
    noop,
    () => true,
    () => false,
  );
}

export function MobileNav({ navItems, moreItems }: MobileNavProps) {
  const [open, setOpen] = useState(false);
  // The overlay is portalled to <body> rather than rendered in place, because
  // in place it is a descendant of <header>, which has backdrop-blur-xl. An
  // ancestor with backdrop-filter becomes a *backdrop root*: the drawer's own
  // backdrop-filter then has nothing behind it to sample, so the page showed
  // through sharp no matter how much blur was asked for.
  const mounted = useIsClient();

  useEffect(() => {
    if (!open) return;

    // The drawer covers the viewport, so the page behind it must not scroll
    // underneath — otherwise closing the drawer leaves you somewhere else.
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-label="Open menu"
        aria-expanded={open}
        onClick={() => setOpen(true)}
        className="grid h-9 w-9 place-items-center rounded-full border border-white/15 text-[#dce2ec] transition hover:border-[#d4af37]/60 hover:text-[#d4af37]"
      >
        <Menu size={18} />
      </button>

      {mounted &&
        createPortal(
          <>
            {/* Backdrop: blurs the page rather than just dimming it, so the
                drawer's own content is what reads clearly. */}
            <div
              onClick={() => setOpen(false)}
              aria-hidden="true"
              className={`fixed inset-0 z-30 bg-[#05070c]/70 backdrop-blur-md transition-opacity duration-300 ${
                open ? "opacity-100" : "pointer-events-none opacity-0"
              }`}
            />

            {/* Full-viewport panel sliding in from the left. Kept mounted so it can
          transition out; translate-x rather than max-height because the travel
          is a known distance here. */}
            <div
              role="dialog"
              aria-modal="true"
              aria-label="Site menu"
              aria-hidden={!open}
              className={`fixed inset-0 z-40 flex h-dvh w-full flex-col bg-[#05070c]/94 backdrop-blur-3xl transition-transform duration-300 ease-out motion-reduce:transition-none ${
                open ? "translate-x-0" : "pointer-events-none -translate-x-full"
              }`}
            >
              <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
                <span className="text-[11px] uppercase tracking-[0.22em] text-[#d4af37]">
                  Menu
                </span>
                <button
                  type="button"
                  aria-label="Close menu"
                  onClick={() => setOpen(false)}
                  tabIndex={open ? 0 : -1}
                  className="grid h-11 w-11 place-items-center rounded-full border border-white/15 text-[#dce2ec] transition hover:border-[#d4af37]/70 hover:text-[#d4af37]"
                >
                  <X size={20} />
                </button>
              </div>

              <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-6 py-8">
                {navItems.map(({ label, href }) => (
                  <a
                    key={href}
                    href={href}
                    tabIndex={open ? 0 : -1}
                    onClick={() => setOpen(false)}
                    className="border-b border-white/5 py-4 text-[22px] font-semibold text-[#e8ecf3] transition hover:text-[#d4af37]"
                  >
                    {label}
                  </a>
                ))}

                {moreItems.length > 0 && (
                  <div className="mt-8">
                    <div className="mb-2 text-[10px] uppercase tracking-[0.22em] text-[#6b7385]">
                      More
                    </div>
                    <div className="flex flex-wrap gap-x-5 gap-y-2">
                      {moreItems.map((item) =>
                        isPlaceholder(item.url) ? (
                          <span
                            key={item.id}
                            className="py-1 text-[14px] text-[#5d6473]"
                          >
                            {item.label}{" "}
                            <span className="text-[9px] uppercase tracking-[0.14em]">
                              soon
                            </span>
                          </span>
                        ) : (
                          <a
                            key={item.id}
                            href={item.url}
                            tabIndex={open ? 0 : -1}
                            onClick={() => setOpen(false)}
                            className="py-1 text-[14px] text-[#cbd1dc] transition hover:text-white"
                          >
                            {item.label}
                          </a>
                        ),
                      )}
                    </div>
                  </div>
                )}
              </nav>

              <div className="flex items-center gap-3 border-t border-white/10 px-6 py-6">
                <a
                  href="/join-us"
                  tabIndex={open ? 0 : -1}
                  onClick={() => setOpen(false)}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-[#d4af37] px-5 py-3.5 text-[13px] font-semibold text-[#05070c] transition hover:bg-[#fdf6e3]"
                >
                  Join Us <ArrowUpRight size={16} />
                </a>
                <span
                  title="Account — coming soon"
                  className="grid h-12 w-12 shrink-0 place-items-center rounded-full border border-white/15 text-[#6b7385]"
                >
                  <User size={18} />
                </span>
              </div>
            </div>
          </>,
          document.body,
        )}
    </div>
  );
}
