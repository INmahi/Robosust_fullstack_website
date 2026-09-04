"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";

type MobileNavProps = {
  navItems: { label: string; href: string }[];
};

export function MobileNav({ navItems }: MobileNavProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="col-start-3 justify-self-end md:hidden">
      <button
        aria-label={open ? "Close menu" : "Menu"}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="menu ml-auto grid h-9 w-9 place-items-center rounded-full border border-white/10 text-[#dce2ec]"
      >
        {open ? <X size={18} /> : <Menu size={18} />}
      </button>

      {open && (
        <div className="fixed inset-x-0 top-[76px] z-20 border-b border-white/10 bg-[#05070c]/95 backdrop-blur-xl">
          <nav className="container-shell flex flex-col gap-1 py-4 text-[15px] text-[#cbd1dc]">
            {navItems.map(({ label, href }) => (
              <a
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-3 transition hover:bg-white/5 hover:text-white"
              >
                {label}
              </a>
            ))}
          </nav>
        </div>
      )}
    </div>
  );
}
