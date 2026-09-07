# RoboSUST platform — file registry

Monorepo for the RoboSUST website rebuild (Phase 1: CMS + public site; Phase 2, later: EC Portal). Read [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md) first — it has the current status and the exact steps to bring the backend live. This file is an index of what lives where; keep it updated as files are added, don't let it drift.

**When you have a symbol name and want to know what touches it** — "what calls `getHomeSectionByKey`", "what breaks if I change `getVisibleNavigation`", "how do `SiteHeader` and `navigation_items` connect" — run `graphify affected` / `explain` / `path` instead of grepping. Those are symbol-anchored and answer in ~15 lines with exact file:line. **They do not replace reading a file you are about to edit** — for that, read the file.

## Planning docs (repo root)

- [SRS.md](SRS.md) — formal Software Requirements Spec: phases, data model, roles, Phase 2 EC Portal design.
- [frontend-overview.md](frontend-overview.md) — agreed sitemap and content list ("what the site contains" — pages, sections, content types). **Not the source of truth for visual design/theme** — its "light-first" recommendation was superseded 2026-09-02 when the user provided an actual reference frontend (dark-themed); ignore this doc's palette/theme section, keep using it for sitemap and content-type completeness.
- [synapse6/robosust_frontend](https://github.com/synapse6/robosust_frontend) (external repo) — the visual/design reference, dark-themed, homepage-only, Next.js 14/React 18/Tailwind v3. **Ported into this monorepo and wired to `src/lib/content/*` as of 2026-09-05** — see `src/components/public/` below. Still useful as the source of truth for exact styling/markup if a section needs revisiting.
- [plans.md](plans.md) — earlier discussion log; superseded on sequencing by SRS v2.0 (CMS ships before, not after, the EC Portal) but still useful for the schema-namespacing rationale (`cms_users` vs. future `members`).
- [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md) — **the living plan/status doc, read this first.** Phase 1a (backend/CMS) is done; it now carries the step-by-step plan for Phase 1b (porting the reference frontend and wiring it to the CMS), the design→CMS field mapping, the `0002` schema gaps, and open questions.

## `packages/supabase` — shared Supabase client package

- `src/client.ts` — browser client (`createClient()`), for Client Components.
- `src/server.ts` — cookie-bound server client (`@supabase/ssr`), for Server Components/Actions. Server-only.
- `src/admin.ts` — service-role client, bypasses RLS. Server-only; used only by `src/lib/auth/*` (username→email lookup, user creation, password resets).
- `src/middleware.ts` — `updateSession()`, called from `apps/public-site/src/proxy.ts` to refresh the auth cookie every request.
- `src/database.types.ts` — hand-authored types mirroring the migration SQL. Regenerate via `supabase gen types typescript` once the CLI is linked to the project; until then, edit both files together.

## `.claude/skills/ui-ux-pro-max` — design-intelligence skill (project-scoped)

Installed from `github.com/nextlevelbuilder/ui-ux-pro-max-skill` (2026-09-04). Self-contained — `scripts/search.py` resolves its `data/` directory relative to itself, no plugin/marketplace machinery needed. Searchable style/color/typography/UX-guideline database; used to inform the `/admin` visual redesign (see IMPLEMENTATION_PLAN.md Step 3). Invoke via `python .claude/skills/ui-ux-pro-max/scripts/search.py "<query>" --domain <domain>` — see its own `SKILL.md` for the full query contract.

## `graphify` — codebase knowledge graph (local dev tool, not project-scoped)

Installed 2026-09-06 (`github.com/Graphify-Labs/graphify`; PyPI package `graphifyy`; CLI command `graphify`). The skill is registered **globally** at `~/.claude/skills/graphify/` (available in every project on this machine, not committed here) — its own description triggers it for "any question about a codebase, its architecture, file relationships" whenever `graphify-out/` exists — but read the query surface below before trusting that: only three of its five commands are actually worth reaching for on this repo.

**Output**: `graphify-out/` — gitignored (regenerable, goes stale on every commit). Holds `graph.json` (666 nodes / 1170 edges), `graph.html` (visual browser), `GRAPH_REPORT.md` (god nodes, communities, cross-file "surprising connections", import-cycle check).

**What's excluded — [`.graphifyignore`](.graphifyignore) (committed, read it before changing extraction).** graphify respects `.gitignore` automatically and `.graphifyignore` on top of it, `.gitignore` syntax including `!` negation. Ours exists for one reason: `.claude/skills/ui-ux-pro-max/` is a vendored design-reference skill, and extracting it put **467 of 1134 nodes — 41% of the graph — into its Python test fixtures**, polluting real queries (asking about `home_sections` returned `test_data_contracts.py`). Excluding it: 666 nodes, zero skill hits, and the planning docs still in.

**That file deliberately repeats every `.gitignore` pattern, and must keep doing so.** The README says the two files merge; [graphify#1363](https://github.com/Graphify-Labs/graphify/issues/1363) reports `.graphifyignore` actually *replaces* a directory's `.gitignore` — verified on 0.8.40, closed with no stated fix, and we run 0.9.55. Duplicating the patterns is correct under either behaviour. Getting it wrong would index `.env.local`, which holds the real Supabase service-role key and the R2 credentials. **Add a pattern to `.gitignore` → add it to `.graphifyignore` too.**

**Maintenance — run after any non-trivial batch of changes:**
```
graphify update .
```
Fast, local, no LLM/API cost — re-extracts only changed code files. Check staleness first if unsure: compare `git rev-parse HEAD` against the "Built from commit" line at the top of `GRAPH_REPORT.md`.

**Query surface — what each is actually good for** (all tested against this repo on 2026-09-06):
- `graphify affected "<symbol>"` — **the best one.** Reverse impact: `affected "getHomeSectionByKey"` returns all 11 callers with exact file:line. This is the "what would break" answer.
- `graphify explain "<symbol>"` — one node and its neighbours, ~15 lines. Good for learning a component's shape without opening it.
- `graphify path "A" "B"` — shortest relationship between two symbols.
- `graphify god-nodes` — most-connected symbols = the real architectural hubs.
- `graphify query "<question>"` — **weak here, treat as a last resort.** Natural-language BFS seeds from fuzzy label matches, so it latches onto `components.json` / `README.md` and then truncates at a 2000-token budget (54 of 110 nodes on a normal question), meaning the answer may be in the part it cut. It also cannot answer anything about string values — section keys, config literals, column names — because the AST graph doesn't model them. Raise `--budget` or narrow with `--context` if you must use it.

**Where graphify does NOT help, so don't reach for it:** reading a file you're about to edit (you need the exact text), anything about SQL/migrations (see gap below), and anything about string literals or CMS data.

**Known gap — the migrations aren't in the graph.** `tree_sitter_sql` isn't installed, so the 5 files under `supabase/migrations/` contribute nothing (every extraction warns about this). That matters more here than in most repos: a lot of this project's real structure lives in Postgres, not TypeScript. Two ways to close it, neither done yet:
- `pip install "graphifyy[sql]"` then re-extract — parses the migration *files*.
- `graphify extract . --postgres <DSN>` — maps the **live** schema: tables, views, functions and FK relationships (column-level detail is not represented). Better fit, since the live DB is the source of truth and the migrations are just how it got there. Needs the Supabase connection string.

**Deliberately not installed**: `graphify claude install` — the more invasive variant that writes a section into *this* file and adds a PreToolUse hook firing on every tool call. Plain `install` + manual maintenance covers the workflow without either the auto-edit risk or the per-call overhead.

## `apps/public-site` — the Next.js app (public site + `/admin` CMS)

- `supabase/migrations/0001_init.sql` — full Phase 1 schema: every content table, RLS policies, `cms_users`, the `is_cms_user()`/`is_cms_admin()` helper functions, seeded `agp_blocks` rows. **Applied to the live project** (2026-09-04, via Supabase MCP).
- `supabase/migrations/0002_frontend_fields.sql` — schema additions the reference frontend design needs: `home_sections` gets `eyebrow`/`body`/`secondary_image_url`/`secondary_cta_text`/`secondary_cta_url`; new `home_section_items` table (repeatable stat/metric cards, FK→`home_sections`); `projects.cover_image_url`; `blog_posts.category`; `site_settings` gets `social_instagram`/`social_github`/`footer_note`/`background_image_url`. Applied.
- `supabase/migrations/0003_baseline_content.sql` — idempotent seed of `site_settings`/`navigation_items`/`home_sections`/`home_section_items` with the reference design's actual copy, so the CMS opens populated rather than blank. Applied.
- `supabase/migrations/0004_site_pages.sql` — the reference frontend's second round (`cdbb656` "Added new pages") ported CMS-first: `home_sections` gains `page` (it now holds sections for every route, not just the homepage), `home_section_items` gains `icon`, `committee_members` gains `email`/`linkedin_url`; re-points `navigation_items` from anchors to real routes; drops the About stat cards upstream removed; seeds the 9 new page sections, the 3 About principles and per-page `seo_metadata`. Every guarded `update` only fires if the row still holds what `0003` seeded, so editor changes survive a re-run. Applied.
- `scripts/seed-cms-users.mjs` — seeds the 3 development CMS accounts (already run — see IMPLEMENTATION_PLAN.md's Account lifecycle section for how this works for real committee onboarding later).
- `src/proxy.ts` — Next.js 16's `proxy` file (renamed from `middleware`); just calls `updateSession()`.

### `src/lib/auth` — username/password auth, no email dependency

- `username.ts` — `usernameToSyntheticEmail()` (the non-deliverable `@cms.internal.robosust` mapping) and `generateTempPassword()`.
- `session.ts` — `login()`, `logout()`, `changeOwnPassword()`. All server actions.
- `guard.ts` — `getCmsUser()` / `requireCmsUser()` / `requireAdmin()`, used by the `/admin` layout and every mutating server action.
- `admin-actions.ts` — admin-only: `listCmsUsers()`, `createCmsUser()`, `resetCmsUserPassword()`, `deleteCmsUser()`. Uses the service-role client; every function calls `requireAdmin()` itself.

### `src/lib/content` — the typed content API (the actual "swap frontend anytime" contract)

One module per Phase 1 content type, each exporting typed CRUD plus any public-filtered read helpers. **Public pages should only ever import from here, never from `@robosust/supabase` directly.**

- `_factory.ts` — `createContentModule(table)`, the generic CRUD builder every module below is built from.
- `notices.ts`, `achievements.ts`, `projects.ts` (+ `getAllProjects()` for the /projects shelf), `events.ts`, `blog-posts.ts`, `committee-members.ts` (+ `getOrderedCommitteeMembers()` for /executive-members), `alumni.ts`, `gallery.ts` (albums + images), `agp.ts`, `forum.ts` (categories + posts + replies), `contact-submissions.ts`, `site-settings.ts` (singleton, not factory-based), `navigation.ts`, `home-sections.ts` (+ `home_section_items` via `getHomeSectionWithItems(key)`), `seo-metadata.ts`.

`src/lib/seo.ts` sits alongside these: `buildPageMetadata(pageKey, fallback)`, the one shape every public route's `generateMetadata()` uses (seo_metadata row → caller's fallback → site_settings). Kept out of `(public)/layout.tsx` so a page can import it without pulling the layout's component tree in.

### `src/lib/storage` — Cloudflare R2 media upload

- `r2.ts` — S3-compatible client (R2 is S3-compatible; only the endpoint/region differ), `uploadToR2(key, body, contentType)`.
- `actions.ts` — `uploadImageAction(formData)`, auth-gated server action, 5MB limit, image-types-only. Called from `ImageUrlField`.

### `src/lib/admin` — generic CRUD engine behind `/admin/[type]`

- `content-types.ts` — the registry: for each type, its table name, field list (label/kind/required/`options`/`reference`), list columns, sort column (one column, or several applied in order — `page_sections` sorts by `page` then `sort_order`, `section_cards` by `section_id` then `sort_order`, so both lists read grouped instead of interleaved), and `allowCreate`/`allowDelete` flags. Adding a content type's admin screen = an entry here, not a new page. Field kinds include `select` (fixed `options`, real `<select>`) and `reference` (FK — `<select>` populated from `{table, labelField}`, not a pasted UUID).
- `generic-store.ts` — runtime-string-table CRUD (`listRows`/`getRow`/`createRow`/`updateRow`/`deleteRow`) through the normal authenticated client, so writes go through RLS like any other request.
- `form-parsing.ts` — `FormData` ↔ row-object conversion driven by each field's `kind`. Empty optional `number` fields are *omitted*, not sent as `null` — several NOT-NULL-with-DEFAULT columns (`sort_order`, everywhere) reject an explicit null outright.
- `nav-icons.ts` — `CONTENT_TYPE_ICONS` map (slug → lucide icon), used by both the dashboard and the sidebar nav. Deliberately a plain module, not inside `admin-nav.tsx` — importing plain data (not a component) from a `"use client"` file into a Server Component doesn't reliably survive the RSC boundary (found live: every dashboard card silently showed the same fallback icon until this moved out).
- `ui-classes.ts` — shared Tailwind class-string constants (`inputClass`, `buttonPrimaryClass`, `cardClass`, etc.) so admin pages/forms pull from one definition instead of each hand-rolling near-identical styling. Palette (slate + blue-600) came from the `ui-ux-pro-max` skill's admin-panel design-system query.

### `src/components/admin`

- `image-url-field.tsx` — text input (paste a URL) + file upload (via R2) writing to the same field. Shared by the generic content form and the settings page.

### `src/app/admin` — the CMS UI

- `login/` — public login page + `loginAction`.
- `(protected)/layout.tsx` — the auth+role gate (`requireCmsUser()`) and shell (sidebar + main) for everything under `/admin`.
- `(protected)/admin-nav.tsx` — client component: grouped (Site/Content/Community), icon-led sidebar nav with active-route highlighting via `usePathname()`.
- `(protected)/page.tsx` — dashboard (icon cards linking to every content type).
- `(protected)/account/` — self-service password change.
- `(protected)/users/` — admin-only: create CMS users, reset passwords (temp password shown once via a short-lived httpOnly cookie, never in the URL), delete users.
- `(protected)/settings/` — `site_settings` singleton edit form, grouped into Identity/Social/Contact/Footer cards (not part of the generic router).
- `(protected)/[type]/` — the generic CRUD screen: `page.tsx` (list — `reference`-kind columns resolve to the real referenced row, not a raw UUID), `new/page.tsx`, `[id]/page.tsx` (edit), `actions.ts` (create/update/delete server actions, each re-checking auth), `content-form.tsx` (shared field renderer, async — `reference` fields fetch their options table).

### Public pages — `src/app/(public)` + `src/components/public`

The dark-themed public site, ported from [synapse6/robosust_frontend](https://github.com/synapse6/robosust_frontend) and wired to the CMS (IMPLEMENTATION_PLAN.md Steps 5-9, done 2026-09-05; the four extra routes from upstream's `cdbb656` followed on 2026-09-06). Route group so the dark theme lives on a wrapper `<div>` in its own layout, not on `<body>` — `/admin` stays untouched and light.

- `(public)/layout.tsx` — dark wrapper div (background image from `site_settings`, Space Grotesk), `generateMetadata()` from `seo_metadata`/`site_settings`, renders `SiteHeader`/`children`/`SiteFooter` inside `PageEffects`.
- `(public)/page.tsx` — the homepage: `HeroSection`, `EventsSection`, `AboutSection`, `ProjectsSection`, `AchievementsSection`, `BlogSection` in order.
- `(public)/about/page.tsx` — `PageIntro` (`about_intro`) + `AboutSection` + `AboutPrinciplesSection` + `AchievementsSection`.
- `(public)/events/page.tsx` — `PageIntro` (`events_intro`) + `EventsSection` + `EventsCalendarSection`. **Queries `getUpcomingEvents(12)` once for the whole page** and hands `[0]` to the featured panel and `.slice(1)` to the grid, rather than each section re-querying and having to agree on which row is "the featured one".
- `(public)/projects/page.tsx` — `PageIntro` (`projects_intro`) + `ProjectsShelfSection` (every project, vs. the homepage's 3 flagship) + `ProjectsCtaSection`.
- `(public)/executive-members/page.tsx` — `PageIntro` (`committee_intro`) + `ExecutiveMembersSection` (from `committee_members`). A member's `photo_url` becomes the card's own gradient-overlaid background; with no photo the card falls back to exactly the reference's flat panel. Mail/LinkedIn icons render only when that member's field is filled.

Each of the four uses `buildPageMetadata()` against its own `seo_metadata` row. `PageIntro`'s own `pt-[76px]` was dropped in the port — the layout already offsets the fixed header on `<main>`, so keeping it would double the gap.
- `src/components/public/page-effects.tsx` — client component: IntersectionObserver `.reveal` animations + scroll-spy active-nav-link highlighting. Ported near-verbatim.
- `src/components/public/hero-background.tsx` — client component: pointer-reactive canvas grid behind the hero. Ported near-verbatim.
- `src/components/public/mobile-nav.tsx` — client component: the reference's mobile menu was `alert("...")`; this is a real slide-down drawer fed by the same nav data.
- `src/components/public/social-icons.tsx` — `lucide-react` (this repo's version, `^1.39.0`) has no Facebook/Instagram/GitHub icons (brand icons were dropped from the package) — three small inline SVGs instead of a whole brand-icon-package dependency.
- `src/components/public/section-heading.tsx` — shared eyebrow/title/description layout every section below uses. A string `title` is split on newlines via `HeadingLines`.
- `src/components/public/heading-lines.tsx` — `HeadingLines` / `AccentHeadingLines`. **No markup is stored in the database**: the reference writes most headings with a literal `<br/>`, so a newline inside a CMS `heading` value is the editable equivalent (an editor presses Enter in the Heading textarea). `AccentHeadingLines` additionally renders every line after the first in the outlined/stroked treatment the page banners use.
- `src/components/public/page-intro.tsx` — the masthead every route below the homepage opens with (the homepage keeps its own full-height `HeroSection`).
- `src/components/public/scroll-to-top.tsx` — client component: back-to-top button, mounted once in `(public)/layout.tsx` so every route gets it. **Reveals by observing `main section` (the page's opening section), not a scrollY threshold** — the homepage hero is `min-h-dvh` and `PageIntro` is `min-h-[460px]`, so any fixed pixel value would fire far too early on one of them. `z-10`, deliberately below the `z-20` header/mobile drawer.
- `src/components/public/section-icons.ts` — `home_section_items.icon` holds a plain lowercase name an editor picks from a dropdown, so the CMS never references a component. Unknown/blank falls back to a default glyph. **Keep `SECTION_ICONS` and the field's `options` in `lib/admin/content-types.ts` in sync** — the registry imports `SECTION_ICON_NAMES` from here so they can't drift.
- `src/components/public/event-format.ts` — `formatEventCategory`/`formatEventDate`, shared by the featured-event panel and the /events calendar grid so a slug and a date read identically in both.
- `src/components/public/site-header.tsx`, `site-footer.tsx`, `hero-section.tsx`, `about-section.tsx`, `events-section.tsx`, `projects-section.tsx`, `project-card.tsx`, `achievements-section.tsx`, `blog-section.tsx`, `about-principles-section.tsx`, `events-calendar-section.tsx`, `projects-shelf-section.tsx`, `projects-cta-section.tsx`, `executive-members-section.tsx` — async Server Components, each fetching its own data through `src/lib/content/*` (see IMPLEMENTATION_PLAN.md §4 Step 7+8 for the exact field mapping). Sections backed by a specific row set (events/projects/blog) return `null` when empty rather than rendering a hollow shell; sections backed by a singleton (hero/about/achievements headings) fall back to the reference's original copy instead.

## Known gaps (see IMPLEMENTATION_PLAN.md §5 "Explicitly deferred" for the full list)

`next/image` optimization not used (the design is CSS-background-heavy, so this buys little today); `database.types.ts` is still hand-authored (regenerate via `supabase gen types` now that CLI-level MCP access exists); bulk CMS-account creation (fine for 3 dev accounts, worth revisiting before the first real committee onboarding). Beyond the homepage and the four routes above, the rest of frontend-overview.md's sitemap (Projects/Events/Blog **detail** pages, Gallery, Alumni, Contact, AGP, Forum) doesn't exist yet — see IMPLEMENTATION_PLAN.md §5 for the order. `/projects`, `/events` and `/executive-members` render their banner and nothing else until `projects`/`events`/`committee_members` actually have rows: that's the codebase's deliberate empty-state rule, not a bug.

## Security notes

- **`.env.local` / `.env.local.example`**: both gitignored via `apps/public-site/.gitignore`'s blanket `.env*` rule — never tracked, confirmed via `git ls-files` (2026-09-02). Real Supabase keys live in `.env.local.example` too (bootstrap convenience); the Cloudflare R2 credentials (`R2_ACCESS_KEY_ID`/`R2_SECRET_ACCESS_KEY`/etc.) deliberately do **not** — `.env.local.example` only has placeholders for those, real values are `.env.local`-only. Both files are gitignored either way.
- **Service-role client** (`packages/supabase/src/admin.ts`, `createAdminClient()`) bypasses RLS entirely. It's `server-only`-guarded and imported **only** by `src/lib/auth/session.ts` and `src/lib/auth/admin-actions.ts`. Never import it from a content module, a page, or anything reachable from a Client Component.
- **RLS is the actual enforcement boundary**, not application code — see `supabase/migrations/0001_init.sql`. Public reads are filtered at the policy level (e.g. `notices.expires_at`, `blog_posts.published`); every write requires `auth.uid()` to have a row in `cms_users`, checked via the `is_cms_user()`/`is_cms_admin()` SECURITY DEFINER functions.
- **Git commits in this repo**: never add Claude/Anthropic as a contributor or reference Claude in commit messages — no `Co-Authored-By` trailer, no attribution of any kind (user instruction, 2026-09-02).
