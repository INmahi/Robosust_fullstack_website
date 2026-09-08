"use client";

import { ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export type MoreItem = { id: string; label: string; url: string };

// Items parked on '#' are routes that exist in the sitemap but not yet in the
// app. They render as a dimmed "Soon" row instead of a link, so the menu can
// show the whole plan without shipping links to 404s. Giving one a real URL in
// /admin turns it into a normal link — no code change.
const isPlaceholder = (url: string) => !url || url === "#";

export function NavMoreMenu({ items }: { items: MoreItem[] }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: MouseEvent) => {
      if (!wrapRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  if (items.length === 0) return null;

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((value) => !value)}
        className="flex items-center gap-1 text-[13px] text-[#d4af37] transition hover:text-[#fdf6e3]"
      >
        More
        <ChevronDown size={14} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      <div
        role="menu"
        aria-hidden={!open}
        className={`absolute right-0 top-[calc(100%+14px)] w-[200px] overflow-hidden rounded-xl border border-white/12 bg-[#0b0d13]/95 p-1.5 shadow-2xl shadow-black/60 backdrop-blur-xl transition-all duration-200 ${
          open ? "translate-y-0 opacity-100" : "pointer-events-none -translate-y-1 opacity-0"
        }`}
      >
        {items.map((item) =>
          isPlaceholder(item.url) ? (
            <div
              key={item.id}
              className="flex items-center justify-between rounded-lg px-3 py-2 text-[13px] text-[#6b7385]"
            >
              {item.label}
              <span className="rounded-full border border-white/10 px-1.5 py-0.5 text-[9px] uppercase tracking-[0.14em]">
                Soon
              </span>
            </div>
          ) : (
            <a
              key={item.id}
              href={item.url}
              tabIndex={open ? 0 : -1}
              onClick={() => setOpen(false)}
              className="block rounded-lg px-3 py-2 text-[13px] text-[#cbd1dc] transition hover:bg-white/5 hover:text-white"
            >
              {item.label}
            </a>
          ),
        )}
      </div>
    </div>
  );
}
