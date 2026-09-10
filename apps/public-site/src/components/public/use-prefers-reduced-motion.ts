"use client";

import { useSyncExternalStore } from "react";

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

// useSyncExternalStore rather than an effect + setState: it's the primitive
// built for subscribing to an external source, it has a real server snapshot
// (false, so SSR and the first client render agree), and it keeps eslint's
// react-hooks/set-state-in-effect satisfied instead of suppressed.
//
// Shared because three components now need it — the achievements carousel, the
// About counters and the About slider. Anything that moves on its own has to
// ask, and a fourth copy of the same ten lines would be the wrong answer.
export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(
    (onStoreChange) => {
      const query = window.matchMedia(REDUCED_MOTION_QUERY);
      query.addEventListener("change", onStoreChange);
      return () => query.removeEventListener("change", onStoreChange);
    },
    () => window.matchMedia(REDUCED_MOTION_QUERY).matches,
    () => false,
  );
}
