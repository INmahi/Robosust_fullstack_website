import { ArrowRight, Calendar, MapPin, Users } from "lucide-react";
import { getUpcomingEvents, type Event } from "@/lib/content/events";
import { formatEventCategory, formatEventDate } from "./event-format";
import { SectionHeading } from "./section-heading";

// `event` is optional: the homepage lets the section pick the next upcoming
// event itself, while /events already has the full upcoming list in hand and
// passes the first row in rather than re-querying for it.
export async function EventsSection({ event: provided }: { event?: Event | null } = {}) {
  const event = provided !== undefined ? provided : (await getUpcomingEvents(1))[0];
  if (!event) return null;

  const date = formatEventDate(event.event_date);
  const category = formatEventCategory(event.category);

  return (
    <section id="events" className="py-[110px]">
      <div className="container-shell">
        <SectionHeading eyebrow="" title="Featured Event" />
        <div className="grid gap-4 md:grid-cols-[0.8fr_1.2fr]">
          <div
            className="reveal relative min-h-[430px] rounded-[22px] border border-white/10 bg-cover bg-center"
            style={{
              backgroundImage: `linear-gradient(145deg,rgba(255,59,70,.3),rgba(61,124,255,.1)), url('${event.image_url || "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1400&q=85"}')`,
            }}
          >
            <div className="absolute left-6 top-6 rounded-xl bg-[#05070c] px-3 py-2 text-[12px] uppercase tracking-[0.08em] text-white">
              Upcoming
            </div>
          </div>
          <article className="reveal rounded-[22px] border border-white/10 bg-[#0d111a] p-[38px]">
            <h3 className="mt-2 text-[44px] font-semibold leading-[1]">{event.title}</h3>
            {event.description && <p className="mt-4 text-[15px] leading-7 text-[#98a1b3]">{event.description}</p>}
            <div className="mt-7 grid gap-3">
              <div className="flex items-center gap-3 text-[13px] text-[#c9d0db]">
                <Calendar size={16} className="text-[#3d7cff]" />
                {date}
              </div>
              {event.location && (
                <div className="flex items-center gap-3 text-[13px] text-[#c9d0db]">
                  <MapPin size={16} className="text-[#3d7cff]" />
                  {event.location}
                </div>
              )}
              {category && (
                <div className="flex items-center gap-3 text-[13px] text-[#c9d0db]">
                  <Users size={16} className="text-[#3d7cff]" />
                  {category}
                </div>
              )}
            </div>
            <a
              href={event.registration_url || "#"}
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-5 py-3.5 text-[13px] font-semibold text-[#05070c] transition hover:-translate-y-0.5"
            >
              Get event updates <ArrowRight size={16} />
            </a>
          </article>
        </div>
      </div>
    </section>
  );
}
