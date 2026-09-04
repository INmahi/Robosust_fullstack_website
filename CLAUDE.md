# RoboSUST platform — file registry

Monorepo for the RoboSUST website rebuild (Phase 1: CMS + public site; Phase 2, later: EC Portal). Read [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md) first — it has the current status and the exact steps to bring the backend live. This file is an index of what lives where; keep it updated as files are added, don't let it drift.

## Planning docs (repo root)

- [SRS.md](SRS.md) — formal Software Requirements Spec: phases, data model, roles, Phase 2 EC Portal design.
- [frontend-overview.md](frontend-overview.md) — agreed sitemap and content list ("what the site contains" — pages, sections, content types). **Not the source of truth for visual design/theme** — its "light-first" recommendation was superseded 2026-09-02 when the user provided an actual reference frontend (dark-themed); ignore this doc's palette/theme section, keep using it for sitemap and content-type completeness.
- [synapse6/robosust_frontend](https://github.com/synapse6/robosust_frontend) (external repo) — the actual visual/design reference, dark-themed. As of 2026-09-02 it's homepage-only (hardcoded Hero/About/Events/Projects/Achievements/Blog sections), Next.js 14/React 18/Tailwind v3 — not yet ported into this monorepo or wired to `src/lib/content/*`.
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

## `apps/public-site` — the Next.js app (public site + `/admin` CMS)

- `supabase/migrations/0001_init.sql` — full Phase 1 schema: every content table, RLS policies, `cms_users`, the `is_cms_user()`/`is_cms_admin()` helper functions, seeded `agp_blocks` rows. **Applied to the live project** (2026-09-04, via Supabase MCP).
- `supabase/migrations/0002_frontend_fields.sql` — schema additions the reference frontend design needs: `home_sections` gets `eyebrow`/`body`/`secondary_image_url`/`secondary_cta_text`/`secondary_cta_url`; new `home_section_items` table (repeatable stat/metric cards, FK→`home_sections`); `projects.cover_image_url`; `blog_posts.category`; `site_settings` gets `social_instagram`/`social_github`/`footer_note`/`background_image_url`. Applied.
- `supabase/migrations/0003_baseline_content.sql` — idempotent seed of `site_settings`/`navigation_items`/`home_sections`/`home_section_items` with the reference design's actual copy, so the CMS opens populated rather than blank. Applied.
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
- `notices.ts`, `achievements.ts`, `projects.ts`, `events.ts`, `blog-posts.ts`, `committee-members.ts`, `alumni.ts`, `gallery.ts` (albums + images), `agp.ts`, `forum.ts` (categories + posts + replies), `contact-submissions.ts`, `site-settings.ts` (singleton, not factory-based), `navigation.ts`, `home-sections.ts` (+ `home_section_items` via `getHomeSectionWithItems(key)`), `seo-metadata.ts`.

### `src/lib/storage` — Cloudflare R2 media upload

- `r2.ts` — S3-compatible client (R2 is S3-compatible; only the endpoint/region differ), `uploadToR2(key, body, contentType)`.
- `actions.ts` — `uploadImageAction(formData)`, auth-gated server action, 5MB limit, image-types-only. Called from `ImageUrlField`.

### `src/lib/admin` — generic CRUD engine behind `/admin/[type]`

- `content-types.ts` — the registry: for each type, its table name, field list (label/kind/required/`options`/`reference`), list columns, sort column, and `allowCreate`/`allowDelete` flags. Adding a content type's admin screen = an entry here, not a new page. Field kinds include `select` (fixed `options`, real `<select>`) and `reference` (FK — `<select>` populated from `{table, labelField}`, not a pasted UUID).
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

### Public pages

- `src/app/page.tsx` — homepage. **Deliberately a placeholder** — wired to `getActiveNotices()` + `getSiteSettings()` only to prove the content-layer contract works end to end, not a real design. The actual frontend port (from [synapse6/robosust_frontend](https://github.com/synapse6/robosust_frontend)) is IMPLEMENTATION_PLAN.md's Step 5 onward — not started yet.

## Known gaps (see IMPLEMENTATION_PLAN.md §5 "Explicitly deferred" for the full list)

`next/image` optimization not used (the design is CSS-background-heavy, so this buys little today); `database.types.ts` is still hand-authored (regenerate via `supabase gen types` now that CLI-level MCP access exists); bulk CMS-account creation (fine for 3 dev accounts, worth revisiting before the first real committee onboarding). The public frontend beyond the placeholder homepage doesn't exist yet — see IMPLEMENTATION_PLAN.md Steps 5-10.

## Security notes

- **`.env.local` / `.env.local.example`**: both gitignored via `apps/public-site/.gitignore`'s blanket `.env*` rule — never tracked, confirmed via `git ls-files` (2026-09-02). Real Supabase keys live in `.env.local.example` too (bootstrap convenience); the Cloudflare R2 credentials (`R2_ACCESS_KEY_ID`/`R2_SECRET_ACCESS_KEY`/etc.) deliberately do **not** — `.env.local.example` only has placeholders for those, real values are `.env.local`-only. Both files are gitignored either way.
- **Service-role client** (`packages/supabase/src/admin.ts`, `createAdminClient()`) bypasses RLS entirely. It's `server-only`-guarded and imported **only** by `src/lib/auth/session.ts` and `src/lib/auth/admin-actions.ts`. Never import it from a content module, a page, or anything reachable from a Client Component.
- **RLS is the actual enforcement boundary**, not application code — see `supabase/migrations/0001_init.sql`. Public reads are filtered at the policy level (e.g. `notices.expires_at`, `blog_posts.published`); every write requires `auth.uid()` to have a row in `cms_users`, checked via the `is_cms_user()`/`is_cms_admin()` SECURITY DEFINER functions.
- **Git commits in this repo**: never add Claude/Anthropic as a contributor or reference Claude in commit messages — no `Co-Authored-By` trailer, no attribution of any kind (user instruction, 2026-09-02).
