import type { ContentTypeConfig } from "./content-types";

// The admin's information architecture, in one place because both the sidebar
// and the dashboard render it — two copies would drift the moment a content
// type is added.
//
// Grouped by the job an editor came to do, not by how the tables are shaped:
// someone arrives thinking "I need to add an event" or "the team page is
// wrong", never "I need the committee_members table". Labels name the part of
// the public site each group feeds, and groups are kept to roughly 3–5 items —
// the eleven-item "Content" pile this replaced was the whole problem.
//
// A plain module, not inside the "use client" nav, so the Server Component
// dashboard can import it too. See nav-icons.ts for the same reasoning and the
// bug that established it.
export type NavGroup = { label: string; blurb: string; slugs: string[] };

export const NAV_GROUPS: NavGroup[] = [
  {
    label: "Events & projects",
    blurb: "What the club is doing and has done",
    slugs: ["events", "projects", "achievements", "agp-blocks"],
  },
  {
    label: "Team & alumni",
    blurb: "Who is on the committee, and who used to be",
    slugs: ["committee-wings", "committee-members", "alumni"],
  },
  {
    label: "Posts & media",
    blurb: "Writing, announcements and photos",
    slugs: ["blog-posts", "notices", "gallery-albums", "gallery-images"],
  },
  {
    label: "Pages & navigation",
    blurb: "Page copy, menus and search listings",
    slugs: ["home-sections", "home-section-items", "navigation-items", "seo-metadata"],
  },
  {
    label: "Community & inbox",
    blurb: "Messages in, and the forum",
    slugs: ["contact-submissions", "forum-categories", "forum-posts", "forum-replies"],
  },
];

export type ResolvedGroup = { label: string; blurb: string; items: ContentTypeConfig[] };

/** Groups resolved against the registry. Anything not placed above still shows
 *  up under "Other" — otherwise adding a content type would silently make it
 *  unreachable, which is exactly what the previous hardcoded list did. */
export function resolveNavGroups(contentTypes: ContentTypeConfig[]): ResolvedGroup[] {
  const bySlug = new Map(contentTypes.map((type) => [type.slug, type]));
  const placed = new Set(NAV_GROUPS.flatMap((group) => group.slugs));

  const groups: ResolvedGroup[] = NAV_GROUPS.map((group) => ({
    label: group.label,
    blurb: group.blurb,
    items: group.slugs
      .map((slug) => bySlug.get(slug))
      .filter((type): type is ContentTypeConfig => Boolean(type)),
  }));

  const leftovers = contentTypes.filter((type) => !placed.has(type.slug));
  if (leftovers.length > 0) {
    groups.push({ label: "Other", blurb: "Not yet grouped", items: leftovers });
  }

  return groups.filter((group) => group.items.length > 0);
}
