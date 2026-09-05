"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";

type MobileNavProps = {
  navItems: { label: string; href: string }[];
};

export function MobileNav({ navItems }: MobileNavProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        aria-label={open ? "Close menu" : "Menu"}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="menu ml-auto grid h-9 w-9 place-items-center rounded-full border border-white/10 text-[#dce2ec]"
      >
        {open ? <X size={18} /> : <Menu size={18} />}
      </button>

      {/* Kept mounted (not open && ...) so it can transition closed instead
          of just vanishing — max-height animates the slide since the panel's
          real height depends on nav item count, which we don't know upfront. */}
      <div
        aria-hidden={!open}
        className={`fixed inset-x-0 top-[76px] z-20 overflow-hidden border-b bg-[#05070c]/95 backdrop-blur-xl transition-all duration-300 ease-out ${
          open
            ? "max-h-80 translate-y-0 border-white/10 opacity-100"
            : "pointer-events-none max-h-0 -translate-y-1 border-transparent opacity-0"
        }`}
      >
        <nav className="container-shell flex flex-col gap-1 py-4 text-[15px] text-[#cbd1dc]">
          {navItems.map(({ label, href }) => (
            <a
              key={href}
              href={href}
              tabIndex={open ? 0 : -1}
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-3 transition hover:bg-white/5 hover:text-white"
            >
              {label}
            </a>
          ))}
        </nav>
      </div>
    </div>
  );
}
