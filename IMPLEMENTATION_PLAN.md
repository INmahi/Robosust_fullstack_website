# RoboSUST Phase 1 — implementation plan

> **Status (2026-09-04)**
> - **Phase 1a — backend/CMS: built, verified, committed.** Schema, RLS, auth, typed content API, generic admin CRUD, Cloudflare R2 upload. See "Phase 1a" below for what exists.
> - **Phase 1b — public frontend: NOT started. This document's step-by-step plan covers it.**
> - **Live database is still empty** (`public` schema, 0 tables — verified via Supabase MCP). Migration `0001_init.sql` has never been applied. This is step 1.

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

### Step 1 — Bring the database live
1. Apply `0001_init.sql` via Supabase MCP `apply_migration`.
2. Verify with `list_tables` (expect 18 tables) and spot-check RLS via `get_advisors`.
3. Seed the 3 **development** CMS accounts via `scripts/seed-cms-users.mjs`, all with `role = 'admin'`:

   | Username | Full name |
   |---|---|
   | `yakSafu122` | Md Yak Safu |
   | `MollahHamza22444` | Mollah Omor Hamza |
   | `inMahi787` | Ishat Noor Mahi |

   All three get `admin` deliberately: during development the point is that each person can exercise *the whole* CMS, including user management. These are **throwaway accounts** — real accounts get created fresh once the platform is ready (see "Account lifecycle" below), so nothing here needs to reflect actual committee designations.
4. **Verify:** log in as each; confirm the forced password change on first login. Then exercise the handover flow itself — create a 4th test user from `/admin/users`, log in as them, change their password, delete them. That flow *is* the club's yearly onboarding mechanism, so it needs to work before anything is built on top of it.

#### Account lifecycle (the model this has to support long-term)
Each time a new Executive Committee is formed, an existing admin (outgoing president, or whoever holds the role) creates accounts for the incoming members from `/admin/users` and hands each person their username + one-time temporary password; the member changes it themselves at `/admin/account`. No email is involved at any point — which is exactly why auth was built on synthetic addresses.

The current build already supports this end to end. Two things worth knowing: `role = 'admin'` is the only role that unlocks user management, so at least one person per cycle must hold it; and creating ~30 accounts one at a time is workable but tedious — see §5 for the bulk-handout idea if that becomes a real pain point.

### Step 2 — Migration `0002` + types
1. Write `0002_frontend_fields.sql` per §3, apply via MCP.
2. Update `database.types.ts` to match.
3. Extend `src/lib/content/home-sections.ts` with `home_section_items` reads (`getHomeSectionWithItems(key)`).
4. **Verify:** `npm run type-check`.

### Step 3 — Admin UX so the growing schema stays manageable
This is the "smooth CMS experience" requirement, and it gets *worse* if deferred until after the schema grows.
1. Add a `select` field kind to `src/lib/admin/content-types.ts` + `content-form.tsx` — real dropdowns for `status`, `events.category`, `navigation_items.group_name`, `agp_blocks.block_key` (currently free-text, easy to typo into a broken page).
2. Add a `reference` field kind — renders a `<select>` populated from another table. Fixes `gallery_images.album_id` and the new `home_section_items.section_id` (both currently require pasting a raw UUID).
3. Register `home_section_items` + all new §3 fields.
4. **Verify:** create a stat item from `/admin` picking its parent section from a dropdown — no UUID typing anywhere.

### Step 4 — Seed baseline content
So the site renders immediately and editors *edit* rather than *invent*. Seeded via SQL (idempotent, `on conflict do nothing`):
- `site_settings` — name, tagline, socials, footer note, background image.
- `navigation_items` — 5 primary (Home/Event/Projects/Blog/Forum) + 5 footer.
- `home_sections` — `hero`, `about`, `achievements`, `blog` with the reference design's real copy.
- `home_section_items` — About's 3 stats, Achievements' 2 metrics.
- **Verify:** every row visible and editable in `/admin`.

### Step 5 — Route restructure: isolate public from admin
Root layout only renders `<html>`/`<body>`, so the dark theme **cannot** live on `<body>` without breaking the light admin.
1. Move `src/app/page.tsx` → `src/app/(public)/page.tsx`.
2. New `src/app/(public)/layout.tsx` — dark wrapper `<div>` (bg, text color, page background image from `site_settings`), Space Grotesk, header + footer.
3. Root layout: load both fonts as CSS variables, drop theme classes from `<body>`.
4. **Verify:** `/admin` still renders light and unbroken; `/` renders dark.

### Step 6 — Port the design system (Tailwind v3 → v4)
Low risk: the reference uses arbitrary hex values (`bg-[#0d111a]`) almost everywhere, so its `tailwind.config.ts` colors are barely referenced — nothing to translate there.
1. Port `:root` custom properties, `container-shell`, `reveal`, `grid-pattern` into our `globals.css` (v4 syntax), leaving the shadcn token block untouched.
2. Add the reference's palette as `@theme` tokens for anything that *does* use named colors.
3. **Verify:** admin screens visually unchanged.

### Step 7 — Port components 1:1 (still hardcoded)
Copy into `src/components/public/`: `SiteHeader`, `HeroSection`, `HeroBackground`, `PageEffects`, `SectionHeading`, `AboutSection`, `EventsSection`, `ProjectsSection`, `ProjectCard`, `AchievementsSection`, `BlogSection`, `SiteFooter` — **keeping their hardcoded data initially**, so any visual difference is provably a port bug, not a data bug.
- Keep CSS `background-image` (not `next/image`) — the design uses backgrounds nearly everywhere, so no `remotePatterns` config is needed and fidelity is exact.
- `"use client"` stays on `HeroBackground`, `PageEffects`, `SiteHeader`.
- **Verify:** run both apps side by side, compare at 375 / 768 / 1280 px.

### Step 8 — Wire sections to the CMS
Replace each hardcoded array with a server-side call to `src/lib/content/*`. Sections stay server components; only the effects stay client.
- Hero/About/Achievements/Blog headings ← `home_sections` (+ `home_section_items`)
- Featured event ← next upcoming `events` row
- Projects ← `getFlagshipProjects(3)`
- Achievements milestone ← top `achievements` row
- Blog cards ← `getPublishedBlogPosts(3)`
- Header/footer ← `getVisibleNavigation()` + `getSiteSettings()`
- **Every section needs an empty-state fallback** — the DB starts empty and sections must degrade gracefully (hide, or show placeholder) rather than crash.
- **Verify:** edit a row in `/admin` → refresh `/` → change appears. That round-trip is the whole point of the architecture.

### Step 9 — Finish what the reference left unfinished
1. Real mobile drawer replacing `alert("Mobile navigation coming soon.")`, fed by the same `navigation_items` data.
2. Metadata from `seo_metadata` + `site_settings` (`generateMetadata`).
3. `"View project"` / `"Read article"` links: inert for now, wired when detail routes land (§5).

### Step 10 — Verify and ship
`npm run type-check`, `npm run lint`, `npm run build`; dev-server pass at 3 breakpoints; CMS round-trip on at least 3 content types; then small commits + push.

---

## 5. Explicitly deferred

The reference repo is **homepage-only**. The remaining frontend-overview.md pages come after this lands, in roughly this order: Projects + `/projects/[slug]`, Events + detail, Blog + detail, Committee, Achievements, Gallery + album, Alumni, Contact (with the `contact_submissions` form), AGP, Forum.

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
- **No open blockers.** Step 1 can start on approval.
