"use client";

import { ArrowUp } from "lucide-react";
import { useEffect, useState } from "react";

// Appears once the page's opening section has scrolled out of view — the
// homepage's full-height hero, or the PageIntro masthead on every other
// route. Observing that element rather than a fixed scrollY threshold is
// what keeps the trigger right across both: the hero is min-h-dvh while
// PageIntro is min-h-[460px], so any single pixel value would fire far too
// early on one of them.
//
// z-10 deliberately: SiteHeader and the mobile drawer are both z-20 and must
// stay above this.
export function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const opening = document.querySelector("main section");

    // No opening section shouldn't happen on the public routes, but a future
    // page could render without one — fall back to a viewport-height check
    // rather than leaving the button permanently hidden.
    if (!opening) {
      const onScroll = () => setVisible(window.scrollY > window.innerHeight * 0.6);
      window.addEventListener("scroll", onScroll, { passive: true });
      onScroll();
      return () => window.removeEventListener("scroll", onScroll);
    }

    const observer = new IntersectionObserver(([entry]) => setVisible(!entry.isIntersecting), {
      threshold: 0,
    });
    observer.observe(opening);
    return () => observer.disconnect();
  }, []);

  const scrollToTop = () => {
    // html has scroll-behavior: smooth globally, but that doesn't apply to
    // scrollTo() — pass it explicitly, and honour a reduced-motion preference.
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
  };

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label="Scroll back to top"
      // Hidden from assistive tech and taken out of the tab order while it's
      // invisible — opacity alone would leave a focusable ghost control.
      aria-hidden={!visible}
      tabIndex={visible ? 0 : -1}
      className={`fixed bottom-6 right-6 z-10 grid h-11 w-11 place-items-center rounded-full border border-white/15 bg-[#0d111a]/85 text-[#dce2ec] shadow-lg shadow-black/40 backdrop-blur-xl transition duration-300 hover:-translate-y-0.5 hover:border-[#d4af37]/70 hover:text-[#d4af37] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#d4af37] md:bottom-8 md:right-8 ${
        visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0"
      }`}
    >
      <ArrowUp size={18} />
    </button>
  );
}
