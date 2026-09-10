"use client";

import { useEffect, useRef, useState } from "react";
import { usePrefersReducedMotion } from "./use-prefers-reduced-motion";

const DURATION_MS = 1600;

// easeOutExpo: fast off the mark, then a long settle onto the final number.
// A linear ramp reads like a loading bar; this reads like a tally landing.
function easeOutExpo(t: number): number {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

/**
 * A single stat that counts up the first time it scrolls into view, then stays
 * put. Counting again on every re-entry would turn a page the visitor scrolls
 * back through into a slot machine.
 */
export function CounterStat({
  countTo,
  suffix,
  className,
}: {
  countTo: number;
  suffix?: string | null;
  className?: string;
}) {
  const prefersReducedMotion = usePrefersReducedMotion();
  // Starting at the final value means that if JS never runs, hydration fails,
  // or the observer never fires, the visitor still reads the real number
  // rather than a permanent zero.
  const [displayed, setDisplayed] = useState(countTo);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node || prefersReducedMotion) return;

    let frame = 0;
    let started = false;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting || started) continue;
          started = true;
          observer.disconnect();

          const startedAt = performance.now();
          const step = (now: number) => {
            const progress = Math.min((now - startedAt) / DURATION_MS, 1);
            setDisplayed(Math.round(easeOutExpo(progress) * countTo));
            if (progress < 1) frame = requestAnimationFrame(step);
          };
          setDisplayed(0);
          frame = requestAnimationFrame(step);
        }
      },
      // Fires once the card is properly on screen rather than the instant its
      // top edge clips the fold, so the count isn't already over by the time
      // it's readable.
      { threshold: 0.4 },
    );

    observer.observe(node);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [countTo, prefersReducedMotion]);

  return (
    <span ref={ref} className={className}>
      {/* Thousand separators — an unpunctuated 200000 is materially harder to
          read at a glance than 200,000. */}
      {displayed.toLocaleString("en-US")}
      {suffix}
    </span>
  );
}
