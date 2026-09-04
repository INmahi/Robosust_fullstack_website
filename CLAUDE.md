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

## `apps/public-site` — the Next.js app (public site + `/admin` CMS)

- `supabase/migrations/0001_init.sql` — full Phase 1 schema: every content table, RLS policies, `cms_users`, the `is_cms_user()`/`is_cms_admin()` helper functions, seeded `agp_blocks` rows. Not yet applied to the live project — see IMPLEMENTATION_PLAN.md.
- `scripts/seed-cms-users.mjs` — one-off script to create the 3 initial CMS accounts after the migration is applied.
- `src/proxy.ts` — Next.js 16's `proxy` file (renamed from `middleware`); just calls `updateSession()`.

### `src/lib/auth` — username/password auth, no email dependency

- `username.ts` — `usernameToSyntheticEmail()` (the non-deliverable `@cms.internal.robosust` mapping) and `generateTempPassword()`.
- `session.ts` — `login()`, `logout()`, `changeOwnPassword()`. All server actions.
- `guard.ts` — `getCmsUser()` / `requireCmsUser()` / `requireAdmin()`, used by the `/admin` layout and every mutating server action.
- `admin-actions.ts` — admin-only: `listCmsUsers()`, `createCmsUser()`, `resetCmsUserPassword()`, `deleteCmsUser()`. Uses the service-role client; every function calls `requireAdmin()` itself.

### `src/lib/content` — the typed content API (the actual "swap frontend anytime" contract)

One module per Phase 1 content type, each exporting typed CRUD plus any public-filtered read helpers. **Public pages should only ever import from here, never from `@robosust/supabase` directly.**

- `_factory.ts` — `createContentModule(table)`, the generic CRUD builder every module below is built from.
- `notices.ts`, `achievements.ts`, `projects.ts`, `events.ts`, `blog-posts.ts`, `committee-members.ts`, `alumni.ts`, `gallery.ts` (albums + images), `agp.ts`, `forum.ts` (categories + posts + replies), `contact-submissions.ts`, `site-settings.ts` (singleton, not factory-based), `navigation.ts`, `home-sections.ts`, `seo-metadata.ts`.

### `src/lib/admin` — generic CRUD engine behind `/admin/[type]`

- `content-types.ts` — the registry: for each type, its table name, field list (label/kind/required), list columns, sort column, and `allowCreate`/`allowDelete` flags. Adding a content type's admin screen = an entry here, not a new page.
- `generic-store.ts` — runtime-string-table CRUD (`listRows`/`getRow`/`createRow`/`updateRow`/`deleteRow`) through the normal authenticated client, so writes go through RLS like any other request.
- `form-parsing.ts` — `FormData` ↔ row-object conversion driven by each field's `kind`.

### `src/app/admin` — the CMS UI

- `login/` — public login page + `loginAction`.
- `(protected)/layout.tsx` — the auth+role gate (`requireCmsUser()`) and nav shell for everything else under `/admin`.
- `(protected)/page.tsx` — dashboard (links to every content type).
- `(protected)/account/` — self-service password change.
- `(protected)/users/` — admin-only: create CMS users, reset passwords (temp password shown once via a short-lived httpOnly cookie, never in the URL), delete users.
- `(protected)/settings/` — `site_settings` singleton edit form (not part of the generic router).
- `(protected)/[type]/` — the generic CRUD screen: `page.tsx` (list), `new/page.tsx`, `[id]/page.tsx` (edit), `actions.ts` (create/update/delete server actions, each re-checking auth), `content-form.tsx` (shared field renderer).

### Public pages

- `src/app/page.tsx` — homepage. **Deliberately a placeholder** — wired to `getActiveNotices()` + `getSiteSettings()` only to prove the content-layer contract works end to end, not a real design. Every other public page (Projects, Events, Committee, etc. — see frontend-overview.md §3) is not built yet; it's waiting on the reference frontend the user will hand over, at which point its pages get wired to the already-built `src/lib/content/*` functions.

## Known gaps (see IMPLEMENTATION_PLAN.md's "What's built vs. deferred" for the full list)

No image upload mechanism yet — every image field (`image_url`, `photo_url`, `cover_image_url`, etc.) is a plain URL string, storage-agnostic by design, so no schema rework is needed regardless of where files end up. **Media storage per SRS.md FR-10 is a Cloudflare bucket** (R2 or similar, referenced from Postgres by URL) — noticed 2026-09-02 when SRS.md was re-read mid-session; an earlier version of FR-10 said Supabase Storage, which is what informed the original schema design, but the plain-URL-field approach happens to satisfy either. Still to build: the actual Cloudflare bucket/account setup (status unconfirmed — ask the user) and an upload server action wired into the admin forms. Also no admin-friendly dropdowns for enum-ish fields (`status`, `category`, `group_name` are free-text inputs today), and the migration hasn't been applied to the live Supabase project yet.

## Security notes

- **`.env.local` / `.env.local.example`**: both gitignored via `apps/public-site/.gitignore`'s blanket `.env*` rule — never tracked, confirmed via `git ls-files` (2026-09-02). Safe to keep real Supabase keys in `.env.local.example` for local bootstrapping, but the secret/service-role key's value has been visible in plaintext during setup — worth rotating in the Supabase dashboard before wider team access, as routine hygiene rather than an active leak.
- **Service-role client** (`packages/supabase/src/admin.ts`, `createAdminClient()`) bypasses RLS entirely. It's `server-only`-guarded and imported **only** by `src/lib/auth/session.ts` and `src/lib/auth/admin-actions.ts`. Never import it from a content module, a page, or anything reachable from a Client Component.
- **RLS is the actual enforcement boundary**, not application code — see `supabase/migrations/0001_init.sql`. Public reads are filtered at the policy level (e.g. `notices.expires_at`, `blog_posts.published`); every write requires `auth.uid()` to have a row in `cms_users`, checked via the `is_cms_user()`/`is_cms_admin()` SECURITY DEFINER functions.
- **Git commits in this repo**: never add Claude/Anthropic as a contributor or reference Claude in commit messages — no `Co-Authored-By` trailer, no attribution of any kind (user instruction, 2026-09-02).
