import { getFeaturedEvents } from "@/lib/content/events";
import { formatEventDate } from "./event-format";
import { FeaturedEventPopup } from "./featured-event-popup";

// Server half of the homepage featured-event card: does the query, hands the
// client component a plain serializable object. Renders nothing at all when
// no event is tagged `featured`, so the homepage is untouched by default.
//
// Shows the soonest featured event only. Several cards stacked in the corner
// would be clutter, and the card's CTA already sends people to /events where
// the full list lives.
export async function FeaturedEventAlert() {
  const [event] = await getFeaturedEvents(1);
  if (!event) return null;

  return (
    <FeaturedEventPopup
      event={{
        id: event.id,
        title: event.title,
        imageUrl: event.image_url,
        dateLabel: formatEventDate(event.event_date),
        location: event.location,
      }}
    />
  );
}
