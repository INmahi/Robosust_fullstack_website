// Shared between the featured-event panel and the /events calendar grid, so
// a stored category slug and an event date read identically in both places.

const CATEGORY_LABELS: Record<string, string> = {
  workshop: "Workshop",
  seminar: "Seminar",
  competition: "Competition",
  meeting: "Meeting",
};

export function formatEventCategory(category: string | null): string | null {
  if (!category) return null;
  return CATEGORY_LABELS[category] ?? category;
}

export function formatEventDate(eventDate: string | null): string {
  if (!eventDate) return "Date to be announced";
  return new Date(eventDate).toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
