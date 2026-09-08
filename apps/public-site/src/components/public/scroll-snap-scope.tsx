"use client";

import { useEffect } from "react";

// Viewport scroll-snap has to be declared on the scrolling element itself,
// which for a normal page is <html> — there's no way to scope it to one route
// from CSS alone. So this toggles a class for as long as the page is mounted
// and takes it off on the way out, rather than making every route snap.
//
// The class uses `proximity`, not `mandatory`: a wing with a dozen assistants
// can be taller than the viewport, and mandatory snapping fights the reader on
// sections it can't fit. It also switches off entirely under reduced motion —
// see globals.css.
export function ScrollSnapScope({ className = "snap-page" }: { className?: string }) {
  useEffect(() => {
    const root = document.documentElement;
    root.classList.add(className);
    return () => root.classList.remove(className);
  }, [className]);

  return null;
}
