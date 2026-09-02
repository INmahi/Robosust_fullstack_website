// Registry driving the generic /admin/[type] CRUD screen. Each entry maps a
// URL slug to a table + a field list the form/table renderer walks over, so
// adding a content type's admin screen is a config entry, not a new page.
// site_settings isn't here — it's a singleton with its own /admin/settings
// page instead of a list+id route.

export type FieldKind =
  | "text"
  | "textarea"
  | "number"
  | "boolean"
  | "date"
  | "datetime-local"
  | "image-url"
  | "string-array"
  | "json";

export type FieldConfig = {
  key: string;
  label: string;
  kind: FieldKind;
  required?: boolean;
};

export type ContentTypeConfig = {
  slug: string;
  table: string;
  label: string;
  fields: FieldConfig[];
  listColumns: string[]; // subset of field keys shown in the table view
  sortColumn?: string;
  allowCreate: boolean;
  allowDelete: boolean;
};

const timestampless = <T extends FieldConfig[]>(fields: T) => fields;

export const contentTypes: ContentTypeConfig[] = [
  {
    slug: "notices",
    table: "notices",
    label: "Notices",
    fields: timestampless([
      { key: "title", label: "Title", kind: "text", required: true },
      { key: "body", label: "Body", kind: "textarea" },
      { key: "link", label: "Link", kind: "text" },
      { key: "pinned", label: "Pinned", kind: "boolean" },
      { key: "expires_at", label: "Expires at", kind: "datetime-local" },
      { key: "sort_order", label: "Sort order", kind: "number" },
    ]),
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
      { key: "image_url", label: "Image URL", kind: "image-url" },
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
      { key: "images", label: "Image URLs", kind: "string-array" },
      { key: "status", label: "Status (ongoing/completed/upcoming)", kind: "text", required: true },
      { key: "flagship", label: "Flagship", kind: "boolean" },
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
      { key: "image_url", label: "Image URL", kind: "image-url" },
      { key: "category", label: "Category (workshop/seminar/competition/meeting)", kind: "text" },
      { key: "event_date", label: "Date", kind: "datetime-local" },
      { key: "location", label: "Location", kind: "text" },
      { key: "registration_url", label: "Registration URL", kind: "text" },
      { key: "sort_order", label: "Sort order", kind: "number" },
    ],
    listColumns: ["title", "category", "event_date"],
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
      { key: "excerpt", label: "Excerpt", kind: "textarea" },
      { key: "content", label: "Content", kind: "textarea" },
      { key: "image_url", label: "Image URL", kind: "image-url" },
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
      { key: "photo_url", label: "Photo URL", kind: "image-url" },
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
      { key: "photo_url", label: "Photo URL", kind: "image-url" },
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
      { key: "cover_image_url", label: "Cover image URL", kind: "image-url" },
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
      { key: "album_id", label: "Album ID", kind: "text", required: true },
      { key: "image_url", label: "Image URL", kind: "image-url", required: true },
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
      { key: "block_key", label: "Block key", kind: "text", required: true },
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
      { key: "group_name", label: "Group (primary/more/footer)", kind: "text", required: true },
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
    label: "Home Sections",
    fields: [
      { key: "section_key", label: "Section key", kind: "text", required: true },
      { key: "heading", label: "Heading", kind: "text" },
      { key: "subheading", label: "Subheading", kind: "textarea" },
      { key: "background_image_url", label: "Background image URL", kind: "image-url" },
      { key: "stat_text", label: "Stat text", kind: "text" },
      { key: "cta_text", label: "CTA text", kind: "text" },
      { key: "cta_url", label: "CTA URL", kind: "text" },
      { key: "visible", label: "Visible", kind: "boolean" },
      { key: "sort_order", label: "Sort order", kind: "number" },
    ],
    listColumns: ["section_key", "heading", "visible"],
    sortColumn: "sort_order",
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
      { key: "share_image_url", label: "Share image URL", kind: "image-url" },
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
