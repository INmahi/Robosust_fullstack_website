// Registry driving the generic /admin/[type] CRUD screen. Each entry maps a
// URL slug to a table + a field list the form/table renderer walks over, so
// adding a content type's admin screen is a config entry, not a new page.
// site_settings isn't here — it's a singleton with its own /admin/settings
// page instead of a list+id route.

import { SECTION_ICON_NAMES } from "@/components/public/section-icons";

export type FieldKind =
  | "text"
  | "textarea"
  | "number"
  | "boolean"
  | "date"
  | "datetime-local"
  | "image-url"
  | "string-array"
  | "json"
  | "select"
  | "reference";

export type FieldConfig = {
  key: string;
  label: string;
  kind: FieldKind;
  required?: boolean;
  /** kind: "select" — fixed choices, rendered as a real <select>. */
  options?: string[];
  /** kind: "reference" — a foreign key, rendered as a <select> populated
   * from another table's rows instead of a pasted-in UUID. */
  reference?: { table: string; labelField: string };
  /** kind: "image-url" — recommended dimensions for this specific slot,
   * shown as a hint right next to the upload control. */
  recommendedSize?: string;
};

export type ContentTypeConfig = {
  slug: string;
  table: string;
  label: string;
  fields: FieldConfig[];
  listColumns: string[]; // subset of field keys shown in the table view
  /** One column, or several applied in order (e.g. ["page", "sort_order"]). */
  sortColumn?: string | string[];
  allowCreate: boolean;
  allowDelete: boolean;
};

// Every public route that has editable sections, and every section key a
// component actually reads. Both are fixed sets rendered as dropdowns so an
// editor can't strand a row under a page or key nothing renders.
const PAGE_KEYS = ["home", "about", "events", "projects", "committee"];

const SECTION_KEYS = [
  "hero",
  "about",
  "achievements",
  "blog",
  "about_intro",
  "about_principles",
  "events_intro",
  "events_calendar",
  "projects_intro",
  "projects_shelf",
  "projects_cta",
  "committee_intro",
  "committee_list",
];

export const contentTypes: ContentTypeConfig[] = [
  {
    slug: "notices",
    table: "notices",
    label: "Notices",
    fields: [
      { key: "title", label: "Title", kind: "text", required: true },
      { key: "body", label: "Body", kind: "textarea" },
      { key: "link", label: "Link", kind: "text" },
      { key: "pinned", label: "Pinned", kind: "boolean" },
      { key: "expires_at", label: "Expires at", kind: "datetime-local" },
      { key: "sort_order", label: "Sort order", kind: "number" },
    ],
    listColumns: ["title", "pinned", "expires_at"],
    sortColumn: "sort_order",
    allowCreate: true,
    allowDelete: true,
  },
  {
    slug: "achievements",
    table: "achievements",
    label: "Achievements",
    fields: [
      { key: "title", label: "Title", kind: "text", required: true },
      { key: "description", label: "Description", kind: "textarea" },
      {
        key: "image_url",
        label: "Image",
        kind: "image-url",
        recommendedSize: "Landscape, ~1600×900px (16:9) — used as a wide card background.",
      },
      { key: "competition", label: "Competition", kind: "text" },
      { key: "year", label: "Year", kind: "number" },
      { key: "position", label: "Position/result", kind: "text" },
      { key: "team_name", label: "Team", kind: "text" },
      { key: "sort_order", label: "Sort order", kind: "number" },
    ],
    listColumns: ["title", "year", "competition"],
    sortColumn: "sort_order",
    allowCreate: true,
    allowDelete: true,
  },
  {
    slug: "projects",
    table: "projects",
    label: "Projects",
    fields: [
      { key: "slug", label: "Slug", kind: "text", required: true },
      { key: "title", label: "Title", kind: "text", required: true },
      { key: "description", label: "Short description", kind: "textarea" },
      { key: "body", label: "Full body", kind: "textarea" },
      {
        key: "cover_image_url",
        label: "Cover image",
        kind: "image-url",
        recommendedSize: "Landscape, ~1200×675px (16:9) — shown in a 220px-tall card.",
      },
      { key: "images", label: "Gallery image URLs", kind: "string-array" },
      {
        key: "status",
        label: "Status",
        kind: "select",
        required: true,
        options: ["ongoing", "completed", "upcoming"],
      },
      { key: "flagship", label: "Flagship (shown on homepage)", kind: "boolean" },
      { key: "category", label: "Category", kind: "text" },
      { key: "github_url", label: "GitHub URL", kind: "text" },
      { key: "demo_url", label: "Demo URL", kind: "text" },
      { key: "sort_order", label: "Sort order", kind: "number" },
    ],
    listColumns: ["title", "status", "flagship"],
    sortColumn: "sort_order",
    allowCreate: true,
    allowDelete: true,
  },
  {
    slug: "events",
    table: "events",
    label: "Events",
    fields: [
      { key: "slug", label: "Slug", kind: "text", required: true },
      { key: "title", label: "Title", kind: "text", required: true },
      { key: "description", label: "Description", kind: "textarea" },
      {
        key: "image_url",
        label: "Image",
        kind: "image-url",
        recommendedSize: "Landscape or square, ~1200×1000px — fills a tall image panel.",
      },
      {
        key: "category",
        label: "Category (what kind of event it is)",
        kind: "select",
        options: ["workshop", "seminar", "competition", "meeting"],
      },
      {
        key: "event_type",
        label: "Type (how the site shows it — featured events pop up on the homepage)",
        kind: "select",
        required: true,
        options: ["upcoming", "featured", "registration_open"],
      },
      { key: "event_date", label: "Date", kind: "datetime-local" },
      { key: "location", label: "Location", kind: "text" },
      { key: "registration_url", label: "Registration URL (the Register button)", kind: "text" },
      { key: "facebook_url", label: "Facebook event URL (optional — shows an Fb icon)", kind: "text" },
      { key: "sort_order", label: "Sort order", kind: "number" },
    ],
    listColumns: ["title", "event_type", "category", "event_date"],
    sortColumn: "event_date",
    allowCreate: true,
    allowDelete: true,
  },
  {
    slug: "blog-posts",
    table: "blog_posts",
    label: "Blog Posts",
    fields: [
      { key: "slug", label: "Slug", kind: "text", required: true },
      { key: "title", label: "Title", kind: "text", required: true },
      { key: "category", label: "Category (e.g. Build log, Engineering, Lab notes)", kind: "text" },
      { key: "excerpt", label: "Excerpt", kind: "textarea" },
      { key: "content", label: "Content", kind: "textarea" },
      {
        key: "image_url",
        label: "Image",
        kind: "image-url",
        recommendedSize: "Landscape, ~1200×675px (16:9) — shown in a 190px-tall card.",
      },
      { key: "author", label: "Author", kind: "text" },
      { key: "published", label: "Published", kind: "boolean" },
    ],
    listColumns: ["title", "author", "published"],
    allowCreate: true,
    allowDelete: true,
  },
  {
    slug: "committee-members",
    table: "committee_members",
    label: "Committee Members",
    fields: [
      { key: "name", label: "Name", kind: "text", required: true },
      { key: "designation", label: "Designation", kind: "text", required: true },
      { key: "department_session", label: "Department + session (e.g. EEE'21)", kind: "text" },
      { key: "tier_group", label: "Tier group (e.g. Core EC, R&D)", kind: "text" },
      {
        key: "photo_url",
        label: "Photo",
        kind: "image-url",
        recommendedSize: "Portrait headshot, ~800×1000px (4:5), centered on the face.",
      },
      // Both optional — the /executive-members card shows each icon only when
      // its field is filled, the same rule the header social links follow.
      { key: "email", label: "Email (optional — shows a mail icon on the card)", kind: "text" },
      { key: "linkedin_url", label: "LinkedIn URL (optional)", kind: "text" },
      { key: "sort_order", label: "Sort order", kind: "number" },
    ],
    listColumns: ["name", "designation", "tier_group"],
    sortColumn: "sort_order",
    allowCreate: true,
    allowDelete: true,
  },
  {
    slug: "alumni",
    table: "alumni",
    label: "Alumni",
    fields: [
      { key: "name", label: "Name", kind: "text", required: true },
      { key: "department", label: "Department", kind: "text" },
      { key: "batch", label: "Batch", kind: "text" },
      {
        key: "photo_url",
        label: "Photo",
        kind: "image-url",
        recommendedSize: "Portrait headshot, ~800×1000px (4:5), centered on the face.",
      },
      { key: "current_position", label: "Current position", kind: "text" },
      { key: "linkedin_url", label: "LinkedIn URL", kind: "text" },
      { key: "sort_order", label: "Sort order", kind: "number" },
    ],
    listColumns: ["name", "department", "batch"],
    sortColumn: "sort_order",
    allowCreate: true,
    allowDelete: true,
  },
  {
    slug: "gallery-albums",
    table: "gallery_albums",
    label: "Gallery Albums",
    fields: [
      { key: "slug", label: "Slug", kind: "text", required: true },
      { key: "title", label: "Title", kind: "text", required: true },
      {
        key: "cover_image_url",
        label: "Cover image",
        kind: "image-url",
        recommendedSize: "Landscape, ~1200×800px.",
      },
      { key: "album_date", label: "Date", kind: "date" },
      { key: "sort_order", label: "Sort order", kind: "number" },
    ],
    listColumns: ["title", "album_date"],
    sortColumn: "sort_order",
    allowCreate: true,
    allowDelete: true,
  },
  {
    slug: "gallery-images",
    table: "gallery_images",
    label: "Gallery Images",
    fields: [
      {
        key: "album_id",
        label: "Album",
        kind: "reference",
        required: true,
        reference: { table: "gallery_albums", labelField: "title" },
      },
      {
        key: "image_url",
        label: "Image",
        kind: "image-url",
        required: true,
        recommendedSize: "Any — original resolution up to ~2000px on the long edge.",
      },
      { key: "caption", label: "Caption", kind: "text" },
      { key: "sort_order", label: "Sort order", kind: "number" },
    ],
    listColumns: ["image_url", "album_id"],
    sortColumn: "sort_order",
    allowCreate: true,
    allowDelete: true,
  },
  {
    slug: "agp-blocks",
    table: "agp_blocks",
    label: "AGP Page Blocks",
    fields: [
      {
        key: "block_key",
        label: "Block key",
        kind: "select",
        required: true,
        options: ["hero", "overview", "rules", "schedule", "past_editions", "photo_strip", "registration_cta"],
      },
      { key: "content", label: "Content (JSON)", kind: "json" },
      { key: "visible", label: "Visible", kind: "boolean" },
      { key: "sort_order", label: "Sort order", kind: "number" },
    ],
    listColumns: ["block_key", "visible"],
    sortColumn: "sort_order",
    allowCreate: false, // block_key is a fixed set — seeded once, see migration comment
    allowDelete: false,
  },
  {
    slug: "navigation-items",
    table: "navigation_items",
    label: "Navigation",
    fields: [
      { key: "label", label: "Label", kind: "text", required: true },
      { key: "url", label: "URL", kind: "text", required: true },
      {
        key: "group_name",
        label: "Group",
        kind: "select",
        required: true,
        options: ["primary", "more", "footer"],
      },
      { key: "visible", label: "Visible", kind: "boolean" },
      { key: "sort_order", label: "Sort order", kind: "number" },
    ],
    listColumns: ["label", "group_name", "visible"],
    sortColumn: "sort_order",
    allowCreate: true,
    allowDelete: true,
  },
  {
    slug: "home-sections",
    table: "home_sections",
    label: "Page Sections",
    fields: [
      {
        key: "page",
        label: "Page",
        kind: "select",
        required: true,
        options: PAGE_KEYS,
      },
      {
        key: "section_key",
        label: "Section key",
        kind: "select",
        required: true,
        // A fixed set, not free text: each key is read by name from a specific
        // component, so a made-up key would save fine and then render nowhere.
        // Adding a section here means adding the component that reads it.
        options: SECTION_KEYS,
      },
      { key: "eyebrow", label: "Eyebrow (small label above heading)", kind: "text" },
      {
        key: "heading",
        label: "Heading (press Enter for a line break — on a page's top banner, lines after the first render outlined)",
        kind: "textarea",
      },
      { key: "subheading", label: "Subheading", kind: "textarea" },
      { key: "body", label: "Body copy", kind: "textarea" },
      {
        key: "background_image_url",
        label: "Background image",
        kind: "image-url",
        recommendedSize: "Wide landscape, at least 1920×1080px — fills the entire section width.",
      },
      {
        key: "secondary_image_url",
        label: "Secondary image",
        kind: "image-url",
        recommendedSize: "Portrait or square, ~1000×1200px — shown in a tall side panel.",
      },
      { key: "stat_text", label: "Stat text", kind: "text" },
      { key: "cta_text", label: "Primary CTA text", kind: "text" },
      { key: "cta_url", label: "Primary CTA URL", kind: "text" },
      { key: "secondary_cta_text", label: "Secondary CTA text", kind: "text" },
      { key: "secondary_cta_url", label: "Secondary CTA URL", kind: "text" },
      { key: "visible", label: "Visible", kind: "boolean" },
      { key: "sort_order", label: "Sort order", kind: "number" },
    ],
    listColumns: ["page", "section_key", "heading", "visible"],
    sortColumn: ["page", "sort_order"],
    allowCreate: true,
    allowDelete: true,
  },
  {
    slug: "home-section-items",
    table: "home_section_items",
    label: "Section Cards",
    fields: [
      {
        key: "section_id",
        label: "Section",
        kind: "reference",
        required: true,
        reference: { table: "home_sections", labelField: "section_key" },
      },
      { key: "value", label: "Value (e.g. 12+, 24/7 — used by the Achievements metric cards)", kind: "text" },
      { key: "label", label: "Label / card title", kind: "text" },
      { key: "body", label: "Body text", kind: "textarea" },
      {
        key: "icon",
        label: "Icon (About page principle cards only)",
        kind: "select",
        options: SECTION_ICON_NAMES,
      },
      {
        key: "image_url",
        label: "Image",
        kind: "image-url",
        recommendedSize: "Not currently rendered (stat/metric/principle cards show text and an icon only).",
      },
      { key: "sort_order", label: "Sort order", kind: "number" },
    ],
    listColumns: ["section_id", "label", "value"],
    // Grouped by section, then in card order — otherwise two sections' cards
    // interleave by sort_order and the list is unreadable.
    sortColumn: ["section_id", "sort_order"],
    allowCreate: true,
    allowDelete: true,
  },
  {
    slug: "seo-metadata",
    table: "seo_metadata",
    label: "SEO Metadata",
    fields: [
      { key: "page_key", label: "Page key", kind: "text", required: true },
      { key: "title", label: "Title", kind: "text" },
      { key: "description", label: "Description", kind: "textarea" },
      {
        key: "share_image_url",
        label: "Share image",
        kind: "image-url",
        recommendedSize: "1200×630px — the standard Open Graph / social-share preview size.",
      },
    ],
    listColumns: ["page_key", "title"],
    allowCreate: true,
    allowDelete: true,
  },
  {
    slug: "forum-categories",
    table: "forum_categories",
    label: "Forum Categories",
    fields: [
      { key: "name", label: "Name", kind: "text", required: true },
      { key: "slug", label: "Slug", kind: "text", required: true },
      { key: "description", label: "Description", kind: "textarea" },
      { key: "sort_order", label: "Sort order", kind: "number" },
    ],
    listColumns: ["name", "slug"],
    sortColumn: "sort_order",
    allowCreate: true,
    allowDelete: true,
  },
  {
    slug: "forum-posts",
    table: "forum_posts",
    label: "Forum Posts (moderation)",
    fields: [
      { key: "title", label: "Title", kind: "text" },
      { key: "body", label: "Body", kind: "textarea" },
      { key: "author_name", label: "Author name", kind: "text" },
      { key: "author_email", label: "Author email", kind: "text" },
    ],
    listColumns: ["title", "author_name", "created_at"],
    allowCreate: false, // posts come from the public forum, admin only moderates
    allowDelete: true,
  },
  {
    slug: "forum-replies",
    table: "forum_replies",
    label: "Forum Replies (moderation)",
    fields: [
      { key: "body", label: "Body", kind: "textarea" },
      { key: "author_name", label: "Author name", kind: "text" },
      { key: "author_email", label: "Author email", kind: "text" },
    ],
    listColumns: ["author_name", "body", "created_at"],
    allowCreate: false,
    allowDelete: true,
  },
  {
    slug: "contact-submissions",
    table: "contact_submissions",
    label: "Contact Submissions",
    fields: [
      { key: "name", label: "Name", kind: "text" },
      { key: "email", label: "Email", kind: "text" },
      { key: "department", label: "Department", kind: "text" },
      { key: "batch", label: "Batch", kind: "text" },
      { key: "area_of_interest", label: "Area of interest", kind: "text" },
      { key: "message", label: "Message", kind: "textarea" },
      { key: "resolved", label: "Resolved", kind: "boolean" },
    ],
    listColumns: ["name", "email", "resolved"],
    allowCreate: false, // submitted only via the public contact form
    allowDelete: true,
  },
];

export function getContentTypeConfig(slug: string): ContentTypeConfig | undefined {
  return contentTypes.find((c) => c.slug === slug);
}
