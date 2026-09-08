import type { Metadata } from "next";
import { EventsListSection } from "@/components/public/events-list-section";
import { PageIntro } from "@/components/public/page-intro";
import { getEventsForListing } from "@/lib/content/events";
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
  const [intro, events] = await Promise.all([
    getHomeSectionByKey("events_intro"),
    getEventsForListing(),
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
      <EventsListSection events={events} />
    </>
  );
}
