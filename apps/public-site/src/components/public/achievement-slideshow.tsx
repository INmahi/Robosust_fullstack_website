"use client";

import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { useEffect, useState, useSyncExternalStore } from "react";

export type AchievementSlide = {
  id: string;
  image: string;
  imageAlt: string;
  label: string;
  title: string;
  description: string;
};

type AchievementSlideshowProps = {
  slides: AchievementSlide[];
  autoPlay?: boolean;
  interval?: number;
};

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

// Auto-advancing content is motion — someone who asked the OS for less of it
// shouldn't get a carousel that moves on its own. useSyncExternalStore rather
// than an effect + setState: it's the primitive built for subscribing to an
// external source, it has a real server snapshot (false, so SSR and the first
// client render agree), and it keeps eslint's react-hooks/set-state-in-effect
// satisfied instead of suppressed.
function usePrefersReducedMotion() {
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

export function AchievementSlideshow({
  slides,
  autoPlay = true,
  interval = 6000,
}: AchievementSlideshowProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (!autoPlay || isPaused || isHovering || prefersReducedMotion || slides.length < 2) return;

    const timer = window.setInterval(() => {
      setActiveIndex((currentIndex) => (currentIndex + 1) % slides.length);
    }, interval);
    return () => window.clearInterval(timer);
  }, [autoPlay, interval, isHovering, isPaused, prefersReducedMotion, slides.length]);

  if (slides.length === 0) return null;

  const activeSlide = slides[activeIndex];

  const showPrevious = () => {
    setActiveIndex((current) => (current === 0 ? slides.length - 1 : current - 1));
    setIsPaused(true);
  };

  const showNext = () => {
    setActiveIndex((current) => (current + 1) % slides.length);
    setIsPaused(true);
  };

  return (
    <div
      className="reveal overflow-hidden rounded-[22px] border border-white/10 bg-[#090c13]/90"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <div className="grid h-[620px] md:h-[460px] md:grid-cols-[1.08fr_0.92fr]">
        <div className="relative h-full overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element -- next/image is
              deliberately unused across the public site (see CLAUDE.md "Known
              gaps"); the design is CSS-background-heavy and no remotePatterns
              config exists for the R2 domain. */}
          <img
            // Remounting on image change is what restarts the enter animation,
            // so each slide actually fades in rather than swapping instantly.
            key={activeSlide.image}
            src={activeSlide.image}
            alt={activeSlide.imageAlt}
            className="h-full w-full animate-in object-cover fade-in duration-500 ease-out"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-[#090c13]/35" />
        </div>

        <div className="flex min-h-0 flex-col justify-between p-7 md:p-9">
          {/* Announced politely so a screen reader hears the slide change
              instead of the panel silently swapping underneath. */}
          <div aria-live="polite">
            <div className="text-[10px] uppercase tracking-[0.14em] text-[#7f899b]">
              {activeSlide.label}
            </div>
            <h3 className="mt-4 max-w-[420px] text-[38px] font-semibold leading-[1.04] md:text-[46px]">
              {activeSlide.title}
            </h3>
            <p className="mt-5 max-w-[470px] text-[14px] leading-7 text-[#98a1b3]">
              {activeSlide.description}
            </p>
          </div>

          <div className="mt-8 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2" aria-label="Choose achievement">
              {slides.map((slide, index) => (
                <button
                  key={slide.id}
                  type="button"
                  aria-label={`Show ${slide.title}`}
                  aria-current={index === activeIndex}
                  onClick={() => {
                    setActiveIndex(index);
                    setIsPaused(true);
                  }}
                  className={`h-1.5 rounded-full transition-all ${
                    index === activeIndex ? "w-8 bg-[#ff3b46]" : "w-4 bg-white/20"
                  }`}
                />
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-label={isPaused ? "Resume slideshow" : "Pause slideshow"}
                onClick={() => setIsPaused((paused) => !paused)}
                className="grid h-9 w-9 place-items-center rounded-full border border-white/10 text-[#98a1b3] transition hover:border-white/30 hover:text-white"
              >
                {isPaused ? <Play size={14} /> : <Pause size={14} />}
              </button>
              <button
                type="button"
                aria-label="Previous achievement"
                onClick={showPrevious}
                className="grid h-9 w-9 place-items-center rounded-full border border-white/10 text-[#98a1b3] transition hover:border-white/30 hover:text-white"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                type="button"
                aria-label="Next achievement"
                onClick={showNext}
                className="grid h-9 w-9 place-items-center rounded-full border border-white/10 text-[#98a1b3] transition hover:border-white/30 hover:text-white"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
