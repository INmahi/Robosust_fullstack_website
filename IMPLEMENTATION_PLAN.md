# RoboSUST Phase 1 — implementation plan

> **Status (2026-09-05)**
> - **Steps 1-4: done, live, verified in a real browser (Playwright), committed.** Database is live with 18 tables + baseline content, 3 dev CMS accounts work end to end, admin UX redesigned (select/reference fields, grouped nav, real components). Four real bugs found and fixed along the way — see the commit messages for `f1434d3`, `81f5728`, and the list-view fix in the step-4 commit.
> - **Steps 5-9 (the frontend port): done, live, verified in a real browser at 375/768/1280px, committed.** The homepage is ported from `synapse6/robosust_frontend` and every section reads real data from `src/lib/content/*` — not a redesign, not hardcoded data kept "for now." Details in each step below.
> - **Step 10 (final verify/ship): done** — see that section.
> - Full Supabase MCP access confirmed working — `apply_migration`/`execute_sql`/`get_advisors` all used directly, no more manual SQL-editor pasting.
> - **2026-09-05, post-Step-10 polish round**: hero section got a vertical Facebook/LinkedIn/WhatsApp icon bar (`hero-social-bar.tsx`), header logo moved permanently left, nav hover recolored to gold, hero height fixed to `min-h-dvh`, scrollbar hidden site-wide. **One real bug found and fixed, worth reading before touching `site-header.tsx` again**: the first version of the left-aligned header used a 3-way `flex justify-between` (logo / nav / socials+mobile-button as three separate top-level children). `justify-between` forces the gaps *between all children* equal — when the socials group has zero items (true right now; no one has filled in Settings → Social links yet), that third child collapses to ~0 width, and the forced-equal-gap rule drags the nav toward the middle instead of letting it hug the right edge. Symptom looked exactly like "navbar weirdly in the middle, right side empty." Fixed by grouping nav + socials + mobile-button into a single right-hand flex child, so `justify-between` only ever has 2 real children (logo, right-cluster) — the right-cluster always has nonzero width (nav on desktop, the mobile button on small screens, never both empty at once), so the layout can't collapse this way again. **If a header/footer layout ever "looks centered/off" again, check whether it depends on `justify-between` (or similar) across 3+ items where one item's visibility depends on CMS data that might be empty** — that's the general failure mode here, not a one-off.
> - **2026-09-06 — upstream's second round ported (`cdbb656` "Added new pages").** The reference repo gained four routes (`/about`, `/events`, `/executive-members`, `/projects`), a `PageIntro` masthead component, real-route navigation instead of anchors, and an `AboutSection` rework (image column first, stat cards removed, new copy). All of it is in, **CMS-controlled rather than static** per the decision below. Migration `0004_site_pages.sql` carries the schema + seed; `tsc`/`eslint`/`next build` clean; all four routes verified live in a browser at 1280/375px with temporary rows in `projects`/`events`/`committee_members` (since removed — those tables are empty again).
>   - **Decision (2026-09-06, user):** match upstream's design exactly, but nothing hardcoded — every word on the new pages is editable in `/admin`. That's why `home_sections` grew a `page` column instead of the pages carrying static copy arrays: it now holds sections for every route, and `/admin` → **Page Sections** lists them grouped by page. Section keys and page names are `select` dropdowns (a fixed set), not free text — a made-up key would save fine and then render nowhere.
>   - **Decision (2026-09-06, user):** `committee_members` gained `email` + `linkedin_url`; the member cards show each icon only when that field is filled, the same rule the header socials follow.
>   - **`/projects`, `/events` and `/executive-members` show only their banner until their tables have rows.** Same deliberate empty-state rule as the homepage's Events/Projects/Blog sections — check the table before diagnosing a bug.

> - **Hero social bar showing nothing is expected right now, not a bug**: `HeroSocialBar` (and the header's own social icons) return nothing until `site_settings.social_facebook` / `.social_linkedin` / `.social_whatsapp` are filled in via `/admin/settings` → Social links. This was verified working live (filled in test URLs, confirmed icons + gold hover + correct hrefs, then cleared them back to empty) — it's the same empty-state pattern used everywhere else in this codebase (Events/Projects/Blog sections also render nothing until their tables have rows). Don't re-diagnose this as broken — check `site_settings` first.

---

## 1. Where things stand

**Backend (done, in `main`):**
- `apps/public-site/supabase/migrations/0001_init.sql` — 17 content tables + `cms_users`, RLS on everything, seeded `agp_blocks`. Written, **not yet applied**.
- `packages/supabase` — browser/server/admin clients + hand-authored `database.types.ts`.
- `src/lib/auth/*` — username/password auth, no email dependency (synthetic `@cms.internal.robosust` addresses), self-service password change, admin-triggered resets.
- `src/lib/content/*` — typed CRUD + public-filtered reads for every content type. **This is the contract the frontend consumes.**
- `src/app/admin/*` — generic schema-driven CRUD for all types, `/admin/settings` singleton, `/admin/users`.
- `src/lib/storage/*` — Cloudflare R2 upload, auth-gated, wired into every image field. **Verified end-to-end against the live bucket** (PUT/GET/public-fetch/DELETE all pass).

**Infrastructure:**
- Supabase project `robosust-platform` (`pjhgpbjnfkypdosigopv`) — ACTIVE_HEALTHY, reachable via MCP with full access as of 2026-09-04.
- Cloudflare R2 bucket `robosust-media` — live, public URL `https://pub-5bce015397ff4317a30d01acabd8ae01.r2.dev`, credentials in `.env.local` (gitignored).

**Design reference:** [`synapse6/robosust_frontend`](https://github.com/synapse6/robosust_frontend) — Next.js 14 / React 18 / Tailwind v3, **dark theme**, single homepage. Fully static: every section holds a hardcoded array. This plan ports it **1:1** into `apps/public-site` and wires it to the CMS. frontend-overview.md governs *which pages/content exist*, **not** the visual theme (superseded — dark is correct).

---

## 2. What the reference design needs, mapped to our CMS

| Design element | Data source | Status |
|---|---|---|
| Header nav (Home/Event/Projects/Blog/Forum) | `navigation_items` (group=primary) | ✅ exists |
| Header socials (Facebook, Instagram, GitHub) | `site_settings` | ⚠️ has fb/youtube/linkedin — **needs instagram + github** |
| Mobile menu | — | ⚠️ reference just calls `alert()` — **must be built for real** |
| Hero: eyebrow, title, tagline, 2 CTAs, bg image | `home_sections['hero']` | ⚠️ **needs `eyebrow`, `body`, second CTA pair** |
| Hero canvas particle effect | pure design (client component) | ✅ port as-is |
| Featured event: image/title/desc/date/venue/category/CTA | `events` (next upcoming) | ✅ maps cleanly |
| About: eyebrow, title, desc, body, 2 images | `home_sections['about']` | ⚠️ **needs `body`, `secondary_image_url`** |
| About: 3 stats (01 Think / 02 Build / 03 Compete) | — | ⚠️ **needs repeatable child rows** |
| Projects: 3 cards (category/title/desc/image) | `projects` via `getFlagshipProjects(3)` | ⚠️ card image should be **`cover_image_url`**, not `images[0]` |
| Achievements: featured milestone card | `achievements` (top row) | ✅ title/description/image_url |
| Achievements: 2 metric cards ("12+", "24/7") | — | ⚠️ **needs repeatable child rows** |
| Blog: 3 cards with "Build log / 08.26" label | `blog_posts` via `getPublishedBlogPosts(3)` | ⚠️ **needs `category`** (label = `{category} / {MM.YY}`) |
| Footer: wordmark, tagline, links, copyright | `site_settings` + `navigation_items` (group=footer) | ⚠️ **needs `footer_note`** |
| Page background image (fixed, full-site) | hardcoded Unsplash URL | ⚠️ **needs `site_settings.background_image_url`** |

**Decision — the wordmark stays in code.** `ROBO` + red `SUST` is branding/typography, not editable content. `site_settings.site_name` drives everything else (metadata, alt text).

**Decision — the featured event auto-picks the next upcoming event** by date rather than adding a `featured` flag. Fewer knobs, less for editors to get wrong. Revisit if they want manual control.

---

## 3. Migration `0002` — schema additions

| Table | Add |
|---|---|
| `home_sections` | `eyebrow text`, `body text`, `secondary_image_url text`, `secondary_cta_text text`, `secondary_cta_url text` |
| `home_section_items` | **new table** — `id`, `section_id` FK→`home_sections` (cascade), `value text`, `label text`, `body text`, `image_url text`, `sort_order int`, timestamps. Powers About's 3 stats and Achievements' 2 metrics. |
| `projects` | `cover_image_url text` |
| `blog_posts` | `category text` |
| `site_settings` | `social_instagram text`, `social_github text`, `footer_note text`, `background_image_url text` |

Same RLS pattern as everything else: public `SELECT`, writes require a `cms_users` row. `packages/supabase/src/database.types.ts` must be updated in the same commit (hand-authored — keep it in sync).

---

## 4. Step-by-step

Each step ends in a working, committable state. Commits stay small (one per step, or finer).

### Step 1 — Bring the database live ✅ done
Applied via Supabase MCP. Two real bugs surfaced immediately (things the never-actually-applied SQL-editor route had never caught):
- `is_cms_user()`/`is_cms_admin()` are `language sql` functions — their bodies are validated against the catalog at CREATE time, so they must be created *after* `cms_users` exists, not before. Migration reordered.
- `login()` looked up `cms_users` by the raw (non-lowercased) username, but usernames are stored lowercased — a mixed-case username (`yakSafu122`, exactly what was seeded) could never log in. Fixed in `session.ts`.

Seeded the 3 **development** CMS accounts via `scripts/seed-cms-users.mjs`, all `role = 'admin'`: `yakSafu122` (Md Yak Safu), `MollahHamza22444` (Mollah Omor Hamza), `inMahi787` (Ishat Noor Mahi). All three get `admin` deliberately — during development the point is that each person can exercise the whole CMS, including user management. These are **throwaway accounts**; real ones get created fresh once the platform is ready (see "Account lifecycle" below).

Also applied `get_advisors`' findings (mutable `search_path` on `set_updated_at`, two redundant overlapping SELECT policies each on `notices`/`blog_posts`, a missing index on `navigation_items.parent_id`).

**Verified live in a browser** (Playwright, not just curl): login with the mixed-case username, forced-password-change banner, self-service password change, the full user lifecycle (create a test user from `/admin/users` → temp password shown once → log in as them → delete them), and the auth guard redirecting an unauthenticated request. Also caught and fixed a third bug live: the username `pattern` regex (`[a-z0-9_.-]{3,32}`) is invalid under the `v` flag modern browsers now compile HTML `pattern` attributes with — reordered to `[a-z0-9._-]{3,32}` (hyphen at the end, not mid-class).

#### Account lifecycle (the model this has to support long-term)
Each time a new Executive Committee is formed, an existing admin (outgoing president, or whoever holds the role) creates accounts for the incoming members from `/admin/users` and hands each person their username + one-time temporary password; the member changes it themselves at `/admin/account`. No email is involved at any point — which is exactly why auth was built on synthetic addresses.

The current build already supports this end to end. Two things worth knowing: `role = 'admin'` is the only role that unlocks user management, so at least one person per cycle must hold it; and creating ~30 accounts one at a time is workable but tedious — see §5 for the bulk-handout idea if that becomes a real pain point.

### Step 2 — Migration `0002` + types ✅ done
Applied `0002_frontend_fields.sql`, updated `database.types.ts`, extended `src/lib/content/home-sections.ts` with `getHomeSectionWithItems(key)`. Clean `tsc`.

### Step 3 — Admin UX so the growing schema stays manageable ✅ done
Installed the `ui-ux-pro-max` skill (project-scoped, `.claude/skills/ui-ux-pro-max/`) and used its `--design-system` query for an "internal CRUD admin panel" to pick the palette (slate + blue-600, light, matches its "admin panels" typography/style data) rather than guessing. Built:
- `select` and `reference` field kinds (`content-types.ts`, `content-form.tsx`) — real dropdowns for `status`/`category`/`group_name`/`block_key`, and `reference` renders a `<select>` populated from the actual foreign table (`gallery_images.album_id`, `home_section_items.section_id`) instead of asking for a pasted UUID.
- Grouped, icon-led sidebar nav with active-route highlighting (`admin-nav.tsx`) — a flat 22-link list is exactly the "overloaded navigation" anti-pattern the skill's `ux-guidelines.csv` flags.
- Shared class constants (`src/lib/admin/ui-classes.ts`) so every admin page pulls from one input/button/card definition.
- Table view: `overflow-x-auto` wrapper, icon row-actions, human-readable column headers, and **reference columns resolve to the real referenced row** in the list table too (not just the form) — caught live when `home_section_items`' list showed raw UUIDs instead of "about"/"achievements".

**Three more real bugs found live** (Playwright, not just tsc/lint/build — all three passed clean and still shipped these):
1. `globals.css`'s `--font-sans` theme token pointed at itself (`var(--font-sans)`) instead of `var(--font-geist-sans)` — every admin page was silently falling back to the browser default serif font since the *original scaffold commit*, invisible until actually looking at a screenshot.
2. `form-parsing.ts` sent explicit `null` for an empty optional number field. Several NOT-NULL-with-DEFAULT columns (`sort_order`, on nearly every table) reject that outright — an explicit null in an INSERT/UPDATE overrides the column default. Fixed by omitting the key instead of sending null when empty and optional.
3. Importing a plain data object (not a component) from a `"use client"` file into a Server Component doesn't reliably cross the RSC boundary — the dashboard's per-type icons all silently rendered the same fallback icon until the icon map was moved to its own plain module (`nav-icons.ts`).

### Step 4 — Seed baseline content ✅ done
Seeded via `0003_baseline_content.sql` (idempotent — `on conflict do nothing` / `where not exists`): `site_settings` (tagline, background image, footer note), 10 `navigation_items` (5 primary + 5 footer, matching `SiteHeader.tsx`/`SiteFooter.tsx`'s real anchors), 4 `home_sections` (`hero`/`about`/`achievements`/`blog`) with the reference design's actual copy, 5 `home_section_items` (About's 3 stats, Achievements' 2 metrics). **Verified live**: every row renders correctly in `/admin`, including through the reference-column fix above.

### Step 5 — Route restructure: isolate public from admin ✅ done
`src/app/page.tsx` → `src/app/(public)/page.tsx`; new `src/app/(public)/layout.tsx` renders a dark-themed wrapper `<div>` (gradient + `site_settings.background_image_url`, Space Grotesk) around `SiteHeader`/`children`/`SiteFooter`, instead of the theme living on `<body>` — `<body>` stays neutral so `/admin` is untouched. Root layout now also loads `Space_Grotesk` as `--font-space-grotesk` alongside the existing Geist variables. **Verified live**: `/admin` still renders light with zero console errors; `/` renders dark; no full-page-reload flash between them (both nest under the one root layout, per Next.js's route-groups multiple-root-layout caveat — we only have one root layout, so this doesn't apply here anyway).

### Step 6 — Port the design system (Tailwind v3 → v4) ✅ done
Confirmed low risk as expected: the reference's components use arbitrary hex values (`bg-[#0d111a]`) almost everywhere, so nothing needed translating from its `tailwind.config.ts`. Ported `container-shell`/`reveal`/`grid-pattern` into `globals.css` inside `@layer utilities` (works identically in Tailwind v4) plus `scroll-behavior: smooth` on `html`. No named color tokens were needed — skipped that part of the plan since the reference never used its own config's named colors either.

### Step 7 + 8 — Port components and wire to the CMS (done together) ✅ done
Folded into one pass instead of two: a hardcoded-then-rewired intermediate state doesn't buy anything when the mapping to `src/lib/content/*` was already fully spec'd in §2. Ported into `src/components/public/`: `SiteHeader`, `MobileNav`, `HeroSection`, `HeroBackground`, `PageEffects`, `SectionHeading`, `AboutSection`, `EventsSection`, `ProjectsSection`, `ProjectCard`, `AchievementsSection`, `BlogSection`, `SiteFooter`, `social-icons` (see bug list below). Every section is an async Server Component fetching its own data; only `HeroBackground`, `PageEffects`, and `MobileNav` stay `"use client"`. CSS `background-image` kept throughout (no `next/image`), so no `remotePatterns` config was needed and fidelity is exact.

Data mapping, as built (matches §2's plan exactly):
- Header nav/socials ← `getVisibleNavigation()` + `getSiteSettings()` (Facebook/Instagram/GitHub only shown if that `site_settings` field is non-null)
- Hero ← `home_sections['hero']` — eyebrow, tagline, both CTA pairs. Wordmark stays hardcoded per §2's decision.
- About ← `home_sections['about']` + its `home_section_items` (3 stats)
- Featured event ← `getUpcomingEvents(1)`, auto-picked by date per §2's decision; section returns `null` if none
- Projects ← `getFlagshipProjects(3)`; card image is `cover_image_url` falling back to `images[0]`; returns `null` if none
- Achievements ← section heading/subheading from `home_sections['achievements']`, the 2 metric cards from its `home_section_items`, but the **featured milestone card itself is the most recent `achievements` row** (title/description/image_url) — not part of `home_sections`, per §2's table
- Blog ← `getPublishedBlogPosts(3)`; card label is `"{category} / {MM.YY}"`; returns `null` if none
- Footer ← `site_settings.tagline` + `.footer_note` concatenated (this is exactly what the two fields were seeded with in `0003_baseline_content.sql` — confirmed they compose into the reference's original one-paragraph copy) + footer nav items

**One real bug found**: `lucide-react` (`^1.39.0`, already pinned in this repo) has dropped all brand/logo icons (`Facebook`/`Instagram`/`Github` don't exist — confirmed by listing the package's actual exports, not assumed from memory/training data). Fixed with three small inline SVGs in `social-icons.tsx` rather than adding a whole brand-icon package dependency for three glyphs.

**Verified live** (Playwright, all three breakpoints): full DB → CMS → homepage round trip works — nav/hero/about/achievements render real seeded content; events/projects/blog sections correctly render nothing (not an empty shell) since those tables have no rows yet, proving the empty-state requirement below actually holds. `/admin` unaffected. Zero console errors at every breakpoint.

- **Empty-state requirement, verified**: every CMS-backed section either falls back to sensible default copy (Hero/About/Achievements — sections whose *heading* comes from the CMS) or returns `null` entirely (Events/Projects/Blog — sections whose *existence* depends on there being any rows at all). The DB starts empty; nothing crashes.

### Step 9 — Finish what the reference left unfinished ✅ done
1. **Real mobile drawer**, not `alert("Mobile navigation coming soon.")` — built as part of Step 7/8 rather than as a separate pass (`MobileNav`, `"use client"`): hamburger toggles a slide-down panel fed by the same nav data, closes on link click. Found and fixed one layout bug live: the reference's 3-column header grid (`grid-cols-[1fr_auto_1fr]`) auto-places a 4th/floating item (the button) into whichever column is next in flow, which on the smallest breakpoint (no socials, no desktop nav in the grid) left the button sitting left-of-center with dead space to its right instead of flush against the edge — a pre-existing quirk in the upstream reference, invisible there since its button was decorative (`alert(...)`) and never looked at closely. Fixed with explicit `col-start-3 justify-self-end` on our real button's wrapper.
2. **Metadata** wired via `generateMetadata()` in `(public)/layout.tsx`, from `getSeoMetadataForPage("home")` falling back to `site_settings.site_name`/`.tagline`.
3. `"View project"` / `"Read article"` links: still inert, as planned — wired once Projects/Blog detail routes land (§5, deferred).

### Step 10 — Verify and ship ✅ done
`tsc --noEmit`, `eslint`, `next build` all clean. Dev server checked at 375/768/1280px via Playwright — see Step 7+8 and Step 9 above for what was actually exercised (CMS round-trip, mobile drawer, admin isolation). Committed in 4 separate commits (route restructure / design-system CSS / effects+shared components / CMS-wired sections), pushed to `origin main`.

---

## 5. Explicitly deferred

The reference repo now covers the homepage plus `/about`, `/events`, `/executive-members` and `/projects` — all ported. The remaining frontend-overview.md pages come next, in roughly this order: `/projects/[slug]`, `/events/[slug]`, Blog + `/blog/[slug]`, Achievements, Gallery + album, Alumni, Contact (with the `contact_submissions` form), AGP, Forum.

Two things the port deliberately left alone, worth a decision later:
- **Past events.** `/events` shows the next upcoming event plus the rest of the upcoming list; `getPastEvents()` exists but nothing renders it. Upstream had no past-events section either.
- **"View project" / "Event details" / "Read article" links** are still inert or hidden until the matching detail routes exist.

Also deferred:
- `next/image` optimization (needs `remotePatterns` for the R2 domain; the design uses CSS backgrounds so this buys little today).
- Regenerating `database.types.ts` via `supabase gen types` now that CLI-level access exists, instead of hand-authoring it.
- **Bulk account handover** — if creating a full committee's accounts one at a time proves painful, add either CSV/bulk creation or a one-time printable credentials sheet to `/admin/users`. Not needed for the 3 dev accounts; worth revisiting before the first real committee onboarding.

---

## 6. Decisions taken (2026-09-04)

- **The 3 accounts are development accounts, not role assignments.** All get `admin`; committee designations are irrelevant at this stage. Everything gets set up fresh once the platform is ready.
- **Full names confirmed:** Md Yak Safu, Mollah Omor Hamza, Ishat Noor Mahi.
- **Seeding the reference design's placeholder copy is approved** for Step 4 — the site should render fully populated so editors have something to edit. Real copy replaces it through the CMS before launch; nothing about that requires a code change.
- **Theme:** dark, per the reference frontend. frontend-overview.md's "light-first" section is superseded and should be ignored; that document governs pages/content only.
- **No open blockers.** Steps 1-10 are done. §5 "Explicitly deferred" is the actual next-up list: the remaining frontend-overview.md pages beyond this homepage.
