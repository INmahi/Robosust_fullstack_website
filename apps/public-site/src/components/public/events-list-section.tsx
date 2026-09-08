import { ArrowRight, CalendarDays, MapPin, Users } from "lucide-react";
import type { Event } from "@/lib/content/events";
import { getHomeSectionByKey } from "@/lib/content/home-sections";
import { formatEventCategory, formatEventDate } from "./event-format";
import { SectionHeading } from "./section-heading";
import { FacebookIcon } from "./social-icons";

const typeLabels: Record<string, string> = {
  upcoming: "Upcoming",
  featured: "Featured",
  registration_open: "Registration open",
};

const fallbackImage =
  "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1400&q=85";

// Each event is a two-panel row: the image on the left, the detail panel on
// the right. The image panel hides the event name until hover, when the image
// blurs back and the name fades in over it — on touch, where there is no
// hover, the name is shown permanently (see the group-hover/no-hover pair on
// the overlay) so it is never unreachable.
export async function EventsListSection({ events }: { events: Event[] }) {
  if (events.length === 0) return null;

  const section = await getHomeSectionByKey("events_calendar");

  return (
    <section id="content" className="border-t border-white/10 py-[110px]">
      <div className="container-shell">
        <SectionHeading
          eyebrow={section?.eyebrow || "02 / Calendar"}
          title={section?.heading || "More ways\nto get involved."}
          description={
            section?.subheading ||
            "Keep an eye on the calendar for learning sessions, recruitment opportunities and the competitions that bring our community together."
          }
        />

        <div className="grid gap-5">
          {events.map((event) => (
            <article key={event.id} className="reveal grid gap-4 md:grid-cols-2">
              <div
                className="group relative min-h-[260px] overflow-hidden rounded-[22px] border border-white/10"
                style={{ backgroundColor: "#0d111a" }}
              >
                <div
                  className="absolute inset-0 bg-cover bg-center transition-all duration-500 group-hover:scale-[1.03] group-hover:blur-[3px]"
                  style={{ backgroundImage: `url('${event.image_url || fallbackImage}')` }}
                />
                <div className="absolute inset-0 bg-[#05070c]/25 transition-colors duration-500 group-hover:bg-[#05070c]/55" />
                <div className="absolute inset-0 flex items-center p-7 opacity-0 transition-opacity duration-500 group-hover:opacity-100 no-hover:opacity-100">
                  <h2 className="flex items-center gap-4 text-[26px] font-semibold leading-tight text-white">
                    <span className="h-9 w-[3px] shrink-0 bg-[#ff3b46]" />
                    {event.title}
                  </h2>
                </div>
              </div>

              <div className="rounded-[22px] border border-white/10 bg-[#0d111a] p-7 md:p-9">
                <div className="flex items-center gap-3 text-[10px] uppercase tracking-[0.16em] text-[#7f899b]">
                  <span className="text-[#ff3b46]">{typeLabels[event.event_type] ?? "Event"}</span>
                  {event.category && <span>· {formatEventCategory(event.category)}</span>}
                </div>

                <h3 className="mt-3 flex items-start gap-4 text-[25px] font-semibold leading-tight">
                  <span className="mt-1 h-7 w-[3px] shrink-0 bg-[#ff3b46]" />
                  {event.title}
                </h3>

                {event.description && (
                  <p className="mt-4 text-[13px] leading-7 text-[#98a1b3]">{event.description}</p>
                )}

                {/* Unchanged from the featured panel — date, venue, category
                    read the same everywhere on the site. */}
                <div className="mt-6 grid gap-2.5 border-t border-white/10 pt-5 text-[12px] text-[#c9d0db]">
                  <span className="flex items-center gap-3">
                    <CalendarDays size={15} className="text-[#3d7cff]" />
                    {formatEventDate(event.event_date)}
                  </span>
                  <span className="flex items-center gap-3">
                    <MapPin size={15} className="text-[#3d7cff]" />
                    {event.location || "Venue to be announced"}
                  </span>
                  <span className="flex items-center gap-3">
                    <Users size={15} className="text-[#3d7cff]" />
                    {formatEventCategory(event.category) || "Open to the community"}
                  </span>
                </div>

                {(event.registration_url || event.facebook_url) && (
                  <div className="mt-7 flex items-center gap-3">
                    {event.registration_url && (
                      <a
                        href={event.registration_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 rounded-full border border-white/15 px-5 py-2.5 text-[12px] font-semibold text-white transition hover:-translate-y-0.5 hover:border-[#d4af37]/70"
                      >
                        Register <ArrowRight size={15} />
                      </a>
                    )}
                    {event.facebook_url && (
                      <a
                        href={event.facebook_url}
                        target="_blank"
                        rel="noreferrer"
                        aria-label={`${event.title} on Facebook`}
                        className="grid h-10 w-10 place-items-center rounded-full border border-white/15 text-[#aeb7c7] transition hover:-translate-y-0.5 hover:border-[#3d7cff]/70 hover:text-[#3d7cff]"
                      >
                        <FacebookIcon size={16} />
                      </a>
                    )}
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
