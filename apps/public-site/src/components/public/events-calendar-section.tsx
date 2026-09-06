import { ArrowUpRight, MapPin, Users } from "lucide-react";
import type { Event } from "@/lib/content/events";
import { getHomeSectionByKey } from "@/lib/content/home-sections";
import { formatEventCategory, formatEventDate } from "./event-format";
import { SectionHeading } from "./section-heading";

// The "more ways to get involved" grid on /events. Takes its rows from the
// page (which already fetched the upcoming list for the featured panel) and
// renders nothing when there is no second event — a section whose existence
// depends on there being rows at all, like Projects/Blog on the homepage.
export async function EventsCalendarSection({ events }: { events: Event[] }) {
  if (events.length === 0) return null;

  const section = await getHomeSectionByKey("events_calendar");

  return (
    <section id="calendar" className="border-t border-white/10 py-[110px]">
      <div className="container-shell">
        <SectionHeading
          eyebrow={section?.eyebrow || "02 / Calendar"}
          title={section?.heading || "More ways\nto get involved."}
          description={
            section?.subheading ||
            "Keep an eye on the calendar for learning sessions, recruitment opportunities and the competitions that bring our community together."
          }
        />
        <div className="grid gap-4 md:grid-cols-3">
          {events.map((event) => (
            <article
              key={event.id}
              className="reveal rounded-[22px] border border-white/10 bg-[#0d111a] p-7 transition duration-300 hover:-translate-y-1 hover:border-[#3d7cff]/45"
            >
              <div className="flex items-center justify-between gap-3 text-[10px] uppercase tracking-[0.16em] text-[#7f899b]">
                <span>{formatEventCategory(event.category) || "Event"}</span>
                <span>{formatEventDate(event.event_date)}</span>
              </div>
              <h2 className="mt-12 text-[25px] font-semibold leading-tight">{event.title}</h2>
              {event.description && (
                <p className="mt-4 text-[13px] leading-6 text-[#98a1b3]">{event.description}</p>
              )}
              <div className="mt-7 grid gap-3 border-t border-white/10 pt-5 text-[12px] text-[#c9d0db]">
                <span className="flex items-center gap-3">
                  <MapPin size={15} className="text-[#3d7cff]" />
                  {event.location || "Venue to be announced"}
                </span>
                <span className="flex items-center gap-3">
                  <Users size={15} className="text-[#3d7cff]" />
                  Open to the community
                </span>
              </div>
              {event.registration_url && (
                <a
                  href={event.registration_url}
                  className="mt-7 inline-flex items-center gap-2 text-[12px] font-semibold text-white transition hover:text-[#3d7cff]"
                >
                  Event details <ArrowUpRight size={15} />
                </a>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
