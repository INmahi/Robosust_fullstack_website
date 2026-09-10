import { CalendarDays, MapPin } from "lucide-react";
import { getEventsForListing, type Event } from "@/lib/content/events";
import { formatEventDate } from "./event-format";
import { SectionHeading } from "./section-heading";

// Stand-ins until events carry their own artwork. Indexed by position rather
// than picked at random so a given row keeps the same picture between renders —
// a server component runs on every request, and Math.random() here would make
// the image flicker on each navigation.
const placeholderImages = [
  "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1200&q=80",
];

/**
 * The homepage events strip, below Projects: each event is an image beside its
 * details, and the two sides swap every row.
 *
 * Reads the same query /events does, so an event added in /admin appears in
 * both without anything else being touched — it just takes the first few here.
 */
export async function EventsShowcaseSection({ limit = 4 }: { limit?: number } = {}) {
  const events = await getEventsForListing(limit);
  if (events.length === 0) return null;

  return (
    <section id="upcoming-events" className="py-[110px]">
      <div className="container-shell">
        <SectionHeading
          eyebrow="04 / What's on"
          title={"Come and\nbuild with us."}
          description="Workshops, competitions and open sessions — everything currently on the calendar."
        />

        <div className="mt-4 flex flex-col gap-[72px] md:gap-[110px]">
          {events.map((event, index) => (
            <EventRow key={event.id} event={event} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}

function EventRow({ event, index }: { event: Event; index: number }) {
  // Odd rows put the image on the right. `md:` only — stacked on a phone the
  // alternation would just look like inconsistent spacing, so there the image
  // always leads.
  const imageRight = index % 2 === 1;
  const image = event.image_url || placeholderImages[index % placeholderImages.length];

  return (
    <article className="grid items-center gap-8 md:grid-cols-2 md:gap-14">
      <div
        // reveal-from-left / -right are the scroll-in: the image and the text
        // come from opposite edges and meet, which is what makes the alternation
        // read as deliberate rather than as a layout that can't make its mind up.
        className={`reveal ${imageRight ? "reveal-from-right md:order-2" : "reveal-from-left"}`}
      >
        <div
          className="aspect-4/3 rounded-[20px] border border-white/10 bg-cover bg-center shadow-2xl shadow-black/40 md:aspect-3/2"
          style={{ backgroundImage: `url('${image}')` }}
          role="img"
          aria-label={event.title}
        />
      </div>

      <div className={`reveal ${imageRight ? "reveal-from-left md:order-1" : "reveal-from-right"}`}>
        <h3 className="text-[clamp(24px,3.4vw,38px)] font-semibold leading-[1.1] tracking-[-0.02em] text-white">
          {event.title}
        </h3>

        {event.description && (
          <p className="mt-4 max-w-[46ch] text-[14px] leading-7 text-[#98a1b3]">
            {event.description}
          </p>
        )}

        {/* The design's two diamonds, as the things they actually stand for. */}
        <div className="mt-7 flex flex-wrap items-center gap-x-8 gap-y-3">
          <Meta icon={CalendarDays} text={formatEventDate(event.event_date)} />
          {event.location && <Meta icon={MapPin} text={event.location} />}
        </div>
      </div>
    </article>
  );
}

function Meta({
  icon: Icon,
  text,
}: {
  icon: typeof CalendarDays;
  text: string;
}) {
  return (
    <span className="flex items-center gap-2.5 text-[13px] text-[#c9d0db]">
      <span className="grid size-8 shrink-0 place-items-center rounded-lg border border-[#d4af37]/25 bg-[#d4af37]/10 text-[#d4af37]">
        <Icon size={15} />
      </span>
      {text}
    </span>
  );
}
