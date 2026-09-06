import type { Metadata } from "next";
import { EventsCalendarSection } from "@/components/public/events-calendar-section";
import { EventsSection } from "@/components/public/events-section";
import { PageIntro } from "@/components/public/page-intro";
import { getUpcomingEvents } from "@/lib/content/events";
import { getHomeSectionByKey } from "@/lib/content/home-sections";
import { buildPageMetadata } from "@/lib/seo";

const fallbackIntroImage =
  "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1800&q=85";

export function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata("events", {
    title: "Events",
    description: "Workshops, competitions and open sessions hosted by RoboSUST.",
  });
}

export default async function EventsPage() {
  // One query for the whole page: the next event headlines the featured
  // panel, everything after it fills the calendar grid.
  const [intro, upcoming] = await Promise.all([
    getHomeSectionByKey("events_intro"),
    getUpcomingEvents(12),
  ]);

  return (
    <>
      <PageIntro
        eyebrow={intro?.eyebrow || "03 / Gather & compete"}
        title={intro?.heading || "Ideas become\naction."}
        description={
          intro?.subheading ||
          "Workshops, competitions and open sessions designed to bring curious people together around the joy of building machines."
        }
        image={intro?.background_image_url || fallbackIntroImage}
      />
      <div id="content">
        <EventsSection event={upcoming[0] ?? null} />
        <EventsCalendarSection events={upcoming.slice(1)} />
      </div>
    </>
  );
}
