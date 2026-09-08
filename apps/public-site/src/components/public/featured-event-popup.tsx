"use client";

import { ArrowUpRight, CalendarDays, MapPin, X } from "lucide-react";
import { useEffect, useState } from "react";

export type FeaturedEventCard = {
  id: string;
  title: string;
  description: string | null;
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
      className={`fixed bottom-6 left-6 z-20 w-[min(360px,calc(100vw-3rem))] overflow-hidden rounded-[20px] border border-white/15 bg-[#0d111a]/95 shadow-2xl shadow-black/50 backdrop-blur-xl transition-all duration-500 ease-out motion-reduce:transition-opacity ${
        visible
          ? "translate-y-0 opacity-100"
          : "pointer-events-none translate-y-6 opacity-0 motion-reduce:translate-y-0"
      }`}
    >
      {event.imageUrl && (
        <div
          className="h-[120px] bg-cover bg-center"
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
        className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full border border-white/15 bg-[#05070c]/70 text-[#dce2ec] backdrop-blur transition hover:border-[#d4af37]/70 hover:text-[#d4af37]"
      >
        <X size={15} />
      </button>

      <div className="p-5">
        <div className="text-[10px] uppercase tracking-[0.18em] text-[#ff3b46]">Featured event</div>
        <h2 className="mt-2 text-[19px] font-semibold leading-tight text-white">{event.title}</h2>

        <div className="mt-3 grid gap-1.5 text-[12px] text-[#c9d0db]">
          <span className="flex items-center gap-2">
            <CalendarDays size={14} className="text-[#3d7cff]" />
            {event.dateLabel}
          </span>
          {event.location && (
            <span className="flex items-center gap-2">
              <MapPin size={14} className="text-[#3d7cff]" />
              {event.location}
            </span>
          )}
        </div>

        {event.description && (
          <p className="mt-3 line-clamp-3 text-[13px] leading-6 text-[#98a1b3]">{event.description}</p>
        )}

        <a
          href="/events"
          tabIndex={visible ? 0 : -1}
          className="mt-4 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-[12px] font-semibold text-[#05070c] transition hover:-translate-y-0.5"
        >
          See event details <ArrowUpRight size={15} />
        </a>
      </div>
    </div>
  );
}
