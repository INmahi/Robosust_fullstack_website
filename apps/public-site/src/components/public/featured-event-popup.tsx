"use client";

import { ArrowUpRight, CalendarDays, MapPin, X } from "lucide-react";
import { useEffect, useState } from "react";

export type FeaturedEventCard = {
  id: string;
  title: string;
  imageUrl: string | null;
  dateLabel: string;
  location: string | null;
};

// Storage key is per-event, so publishing a *different* featured event shows
// the card again to someone who dismissed the previous one. sessionStorage
// rather than localStorage: "not this visit" is the right memory span for an
// announcement — a returning visitor next week should see it again.
const dismissedKey = (id: string) => `robosust:featured-dismissed:${id}`;

export function FeaturedEventPopup({
  event,
  delayMs = 4000,
}: {
  event: FeaturedEventCard;
  delayMs?: number;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Storage access throws in some privacy modes — a failed read must not
    // take the whole card down with it.
    try {
      if (sessionStorage.getItem(dismissedKey(event.id))) return;
    } catch {
      /* fall through and show the card */
    }

    const timer = window.setTimeout(() => setVisible(true), delayMs);
    return () => window.clearTimeout(timer);
  }, [event.id, delayMs]);

  // Dismissing only flips `visible`; the card stays mounted so it transitions
  // out instead of vanishing, and pointer-events-none keeps the hidden shell
  // from covering the page.
  const dismiss = () => {
    setVisible(false);
    try {
      sessionStorage.setItem(dismissedKey(event.id), "1");
    } catch {
      /* dismissing still works for this page view */
    }
  };

  return (
    <div
      role="complementary"
      aria-label="Featured event"
      aria-hidden={!visible}
      // On a phone it sits centred along the bottom edge and rises into place;
      // on wider screens it keeps the bottom-right corner. The mobile position
      // is centred with left-1/2 + a translate rather than inset-x, so the card
      // can stay its own width instead of stretching edge to edge.
      className={`fixed bottom-5 left-1/2 z-20 w-[min(300px,calc(100vw-2.5rem))] -translate-x-1/2 overflow-hidden rounded-[18px] border border-white/15 bg-[#0d111a]/95 shadow-2xl shadow-black/50 backdrop-blur-xl transition-all duration-500 ease-out motion-reduce:transition-opacity sm:left-auto sm:right-6 sm:bottom-[84px] sm:translate-x-0 md:bottom-[96px] md:right-8 ${
        visible
          ? "translate-y-0 opacity-100"
          : "pointer-events-none translate-y-6 opacity-0 motion-reduce:translate-y-0"
      }`}
    >
      {event.imageUrl && (
        <div
          className="h-[86px] bg-cover bg-center"
          style={{
            backgroundImage: `linear-gradient(180deg, rgba(13,17,26,0.15), rgba(13,17,26,0.9)), url('${event.imageUrl}')`,
          }}
        />
      )}

      <button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss featured event"
        tabIndex={visible ? 0 : -1}
        className="absolute right-2.5 top-2.5 grid h-7 w-7 place-items-center rounded-full border border-white/15 bg-[#05070c]/70 text-[#dce2ec] backdrop-blur transition hover:border-[#d4af37]/70 hover:text-[#d4af37]"
      >
        <X size={13} />
      </button>

      {/* No description. The card is an announcement, not the event page — the
          title, when and where is everything a reader needs to decide whether
          to follow the link, and the prose was most of the old height. */}
      <div className="p-4">
        <div className="text-[9px] uppercase tracking-[0.18em] text-[#d4af37]">Featured event</div>
        <h2 className="mt-1.5 line-clamp-2 text-[15px] font-semibold leading-snug text-white">
          {event.title}
        </h2>

        <div className="mt-2 grid gap-1 text-[11px] text-[#c9d0db]">
          <span className="flex items-center gap-1.5">
            <CalendarDays size={12} className="shrink-0 text-[#d4af37]" />
            {event.dateLabel}
          </span>
          {event.location && (
            <span className="flex items-center gap-1.5">
              <MapPin size={12} className="shrink-0 text-[#d4af37]" />
              {event.location}
            </span>
          )}
        </div>

        <a
          href="/events"
          tabIndex={visible ? 0 : -1}
          className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-[#d4af37] px-3.5 py-2 text-[11px] font-semibold text-[#05070c] transition hover:-translate-y-0.5 hover:bg-[#fdf6e3]"
        >
          See event <ArrowUpRight size={13} />
        </a>
      </div>
    </div>
  );
}
