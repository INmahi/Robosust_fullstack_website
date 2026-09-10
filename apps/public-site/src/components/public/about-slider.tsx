"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { usePrefersReducedMotion } from "./use-prefers-reduced-motion";

export type AboutSlideView = { id: string; image: string; caption: string | null };

const INTERVAL_MS = 6000;

/**
 * The photo strip: one slide open at full width, the rest collapsed to
 * vertical slivers either side, in the order they're set in /admin. The slide
 * an editor marks as the main attraction is the one that starts open, which is
 * what `initialIndex` carries in.
 *
 * Laid out with flex-grow rather than transforms so the open slide's width is
 * whatever the container has left — no fixed slide width to keep in sync with
 * the container, and it reflows on resize for free. Tuned for roughly a dozen
 * photos; far more than that and the slivers stop being clickable.
 */
export function AboutSlider({
  slides,
  initialIndex = 0,
}: {
  slides: AboutSlideView[];
  initialIndex?: number;
}) {
  const [active, setActive] = useState(initialIndex);
  const [paused, setPaused] = useState(false);
  const prefersReducedMotion = usePrefersReducedMotion();

  const go = useCallback(
    (next: number) => setActive(((next % slides.length) + slides.length) % slides.length),
    [slides.length],
  );

  useEffect(() => {
    // Auto-advancing content is motion; someone who asked the OS for less of
    // it gets a strip that only moves when they move it.
    if (prefersReducedMotion || paused || slides.length < 2) return;
    const timer = setInterval(() => setActive((i) => (i + 1) % slides.length), INTERVAL_MS);
    return () => clearInterval(timer);
  }, [prefersReducedMotion, paused, slides.length]);

  if (slides.length === 0) return null;

  return (
    <div
      className="reveal"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <div className="relative">
        <div
          className="flex h-[260px] gap-1.5 overflow-hidden rounded-[20px] border border-white/10 sm:h-[340px] sm:gap-2 lg:h-[420px]"
          role="group"
          aria-roledescription="carousel"
          aria-label="Photos from the club"
        >
          {slides.map((slide, index) => {
            const isActive = index === active;
            // Slides further from the open one sit further back: dimmer and
            // slightly desaturated, so the eye lands on the centre first.
            const distance = Math.abs(index - active);
            const dim = isActive ? 1 : Math.max(0.28, 0.62 - distance * 0.1);

            return (
              <button
                key={slide.id}
                type="button"
                onClick={() => setActive(index)}
                aria-label={slide.caption || `Photo ${index + 1} of ${slides.length}`}
                aria-current={isActive ? "true" : undefined}
                // Only the dimming is inline — it varies per slide. The widths
                // are classes so they can be responsive: on a phone the open
                // photo has to claim far more of the row, or six slivers leave
                // it too narrow to read.
                style={{ filter: `brightness(${dim})` }}
                className={`group relative min-w-[12px] cursor-pointer overflow-hidden bg-cover bg-center transition-[flex-grow,filter] duration-500 ease-out focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#d4af37] sm:min-w-[26px] ${
                  isActive ? "grow-[16] sm:grow-[8]" : "grow hover:brightness-90"
                }`}
              >
                <span
                  aria-hidden="true"
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-700"
                  style={{ backgroundImage: `url('${slide.image}')` }}
                />
                {/* The caption only exists on the open slide — there is no room
                    for it on a 26px sliver, and fading it in with the width
                    would just be noise. */}
                {isActive && slide.caption && (
                  <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#05070c]/85 to-transparent px-5 pb-4 pt-10 text-left text-[13px] text-white">
                    {slide.caption}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {slides.length > 1 && (
          <>
            <SliderArrow side="left" onClick={() => go(active - 1)} />
            <SliderArrow side="right" onClick={() => go(active + 1)} />
          </>
        )}
      </div>

      {slides.length > 1 && (
        <div className="mt-4 flex items-center justify-center gap-2">
          {slides.map((slide, index) => (
            <button
              key={slide.id}
              type="button"
              onClick={() => setActive(index)}
              aria-label={`Show photo ${index + 1}`}
              aria-current={index === active ? "true" : undefined}
              className={`h-2 rounded-full transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#d4af37] ${
                index === active ? "w-6 bg-[#d4af37]" : "w-2 bg-white/25 hover:bg-white/45"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function SliderArrow({ side, onClick }: { side: "left" | "right"; onClick: () => void }) {
  const Icon = side === "left" ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={side === "left" ? "Previous photo" : "Next photo"}
      className={`absolute top-1/2 z-10 flex size-9 -translate-y-1/2 items-center justify-center rounded-full border border-[#d4af37]/30 bg-[#05070c]/70 text-[#d4af37] backdrop-blur transition hover:bg-[#d4af37] hover:text-[#05070c] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#d4af37] ${
        side === "left" ? "left-3" : "right-3"
      }`}
    >
      <Icon size={18} />
    </button>
  );
}
