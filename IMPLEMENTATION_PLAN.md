# Phase 1 backend: complete DB + server-side backbone, frontend-agnostic

> **Status: built, not yet live.** Everything below was implemented in this pass (see `CLAUDE.md` for the file-by-file registry). It compiles, lints, and builds clean, and has been smoke-tested against the real Supabase project (confirmed real API connectivity — the only failure so far is the expected "table not found," because the migration hasn't been applied yet). **Nothing here works end-to-end until the two steps in "Next steps to go live" below are done.**

## Context

Previous session context was lost, so this plan is written to be self-contained and persisted **inside the repo** (not just Claude's local plan storage), so it survives future session loss too. Source docs: [SRS.md](SRS.md) (formal spec) and [frontend-overview.md](frontend-overview.md) (agreed sitemap/content list) — both already agreed, both final on *what the site contains*. The visual frontend is explicitly **not final** and still churning.

Given that, the user's direction for this pass: stop waiting on frontend design. **Fully build out the database and server-side backend now** — schema, RLS, auth, and a typed content API — so that whenever a reference frontend (site + repo) is handed over later, the work is *wiring that frontend's pages to an already-complete backend*, not designing the backend around whatever the frontend happens to assume. The backend must be correct and complete on its own, independent of any particular UI.

Confirmed direction (this session):
- Backend = the already-provisioned Supabase project (Postgres + Auth + Storage), accessed through a typed content layer (`src/lib/content/*`) — never raw Supabase calls scattered through UI code. This is what makes it pluggable to *any* future frontend without rework, and matches how professional headless-backend setups decouple frontend from backend (discussed and confirmed in this session).
- CMS/admin lives inside `apps/public-site` as role-gated `/admin` routes (not a separate app).
- Auth is username + password (not email-based) — Supabase's email sending hits rate limits; login and password reset must not depend on it.
- Live Supabase from the start, not mock data.
- CMS access for now: 3 people, but the permission model must not hardcode who they are — adding a person is a data insert, not a schema change.
- **New this turn**: build the *entire* backend surface for all Phase 1 content types now (schema + RLS + typed read/write functions for every type in frontend-overview.md §8), not just one reference example. Admin UI is scoped down to what's needed to operate the system (auth, account, user management, and a generic schema-driven CRUD screen reused across all content types) rather than bespoke per-type UI — that can be redone/restyled freely later since it isn't the public-facing design.

## What "done" means for this pass

Anyone (this session or a future one, or a different frontend) can:
1. Call a typed function from `src/lib/content/*` for any Phase 1 content type and get/set real data in Supabase, correctly permissioned.
2. Log in at `/admin` with a username/password, manage content through a generic CRUD screen, manage other CMS users, and reset a password — all without Supabase ever sending an email.
3. Read `CLAUDE.md` (repo root) and this plan file to understand what exists and why, without needing this conversation's history.

## Architecture

**New shared package** — `packages/supabase`:
- `src/client.ts` — browser client
- `src/server.ts` — cookie-based server client (Server Components/Actions, `@supabase/ssr`)
- `src/admin.ts` — service-role client, server-only, used only by auth (username→email resolution, password resets) and admin user management
- `src/database.types.ts` — hand-authored types matching the schema (regenerate later via `supabase gen types` once the CLI is linked to the project)

**`apps/public-site/supabase/migrations/*.sql`** — full schema, hand-written (no Supabase CLI in this environment; user applies via the Supabase SQL editor, or installs the CLI later). Organized by domain:
- Shell/config: `site_settings` (singleton), `navigation_items`, `home_sections`, `seo_metadata`
- Content: `notices`, `achievements`, `projects` (absorbs Initiatives, `flagship` flag), `events` (generalized Workshop, `category` field), `blog_posts`, `committee_members`, `alumni`, `gallery_albums` + `gallery_images`, `agp_blocks` (key/type/jsonb content + per-block visibility — SRS defines no AGP schema at all; frontend-overview §6.2 does)
- Community: `forum_categories` / `forum_posts` / `forum_replies`
- Operational: `contact_submissions`
- Access: `cms_users` (see below)

**RLS, applied uniformly**: public `SELECT` on published/non-expired rows only (e.g. `notices.expires_at`, `blog_posts.published`); `INSERT`/`UPDATE`/`DELETE` only when `auth.uid()` has a row in `cms_users`. No per-type permission distinctions yet — all CMS users get equal write access everywhere (matches "don't bother about fine-grained control yet, but stay extensible").

**`cms_users`** (named apart from `profiles`/`members` to avoid colliding with Phase 2's future EC-portal `members` table, per the schema-namespacing discipline already agreed in `plans.md`): `id (FK auth.users)`, `username` (unique), `full_name`, `role` (free-text label, default `'editor'`, descriptive only for now), `must_change_password` (bool), `created_at`.

**Username/password auth, no email dependency**:
- Each `cms_users` row maps to a synthetic, non-deliverable email (`<username>@cms.internal.robosust`) — Supabase Auth requires an email-shaped identifier, but nothing is ever sent to it.
- **Login**: server action resolves username → synthetic email via the admin client, calls `signInWithPassword` server-side, sets the session cookie.
- **Self-service password change** (logged in, `/admin/account`): `auth.updateUser({password})` on the session-bound server client.
- **Forgot-password**: no email recovery. An admin-role user, from `/admin/users`, resets via the admin client (`auth.admin.updateUserById`), shown once on screen to relay manually, with `must_change_password` forcing a change on next login. Sidesteps Supabase's email rate limits entirely; extensible to real email recovery later without restructuring.

**The content layer, `src/lib/content/<type>.ts`** — one module per content type, each exporting typed read *and* write functions (e.g. `getNotices()`, `getNoticeById()`, `createNotice()`, `updateNotice()`, `deleteNotice()`, `getPublishedNotices()` for the public-facing filtered view). This is the actual deliverable of "fix the backend so any frontend can plug in" — every future page, admin screen, or rewritten frontend calls these functions and nothing else touches Supabase directly.

**Admin UI, kept minimal and generic** (not the public-facing design, so building it now doesn't fight the still-churning frontend):
- `/admin/login`, `/admin/layout.tsx` (auth+role gate), `/admin/account` (password change), `/admin/users` (admin-only: create users, trigger resets)
- `/admin/[type]` — **one generic, schema-driven list/form component** parameterized by a per-type field config (labels, input kinds, required flags), reused across all content types instead of 15 bespoke builds. This gives a working way to enter content today without depending on final visual design.

## Build order

1. `packages/supabase` — client factories + `database.types.ts`.
2. Full migration SQL — every table above + RLS + `cms_users`. Hand off to the user to run in the Supabase SQL editor.
3. Auth backend: username→email resolution, login action, `requireCmsUser()` guard, `/admin/login`, `/admin/account`, `/admin/users`.
4. `src/lib/content/*` — full typed read/write layer for every content type listed above.
5. Generic schema-driven `/admin/[type]` CRUD screen, wired to the content layer, config-driven per type.
6. Seed the 3 initial `cms_users` (admin/service-role one-off script), confirm login end-to-end.
7. Persist durable docs **in the repo**: this plan saved as `IMPLEMENTATION_PLAN.md` (repo root), plus `CLAUDE.md` (repo root) as a running file registry — every meaningful file/folder with a one-line purpose, covering the planning docs, `packages/supabase`, the migrations, `src/lib/content/*`, `src/lib/auth/*`, and the `/admin` tree. Updated as each piece lands, not just once at the end.
8. Not in this pass: any public-facing page redesign — that's deliberately deferred until a reference frontend is provided, at which point its pages get wired to the already-complete `src/lib/content/*` functions.

## Verification

- Apply the migration SQL against the live Supabase project; confirm tables + RLS in the Supabase dashboard.
- Seed 3 `cms_users` rows with initial passwords.
- `npm run dev`: log in at `/admin/login`, confirm redirect to `/admin`; confirm unauthenticated access to `/admin` redirects to login.
- Create/edit/delete a row of at least 2-3 different content types through the generic `/admin/[type]` screen; confirm each round-trips through `src/lib/content/<type>.ts` correctly (including the public-filtered read, e.g. an expired notice or unpublished blog post not appearing in `getPublished...()`).
- Self-service password change from `/admin/account`; admin-triggered reset from `/admin/users` for a second seeded user — confirm neither triggers a Supabase email send.
- `npm run lint` / `npm run type-check` across the workspace.

## Next steps to go live

1. **Apply the migration.** Open the Supabase dashboard → SQL Editor → paste the contents of `apps/public-site/supabase/migrations/0001_init.sql` → run. Creates every Phase 1 table, RLS policies, and seeds the 7 fixed `agp_blocks` rows.
2. **Seed the 3 CMS users.** Edit the `USERS` array at the top of `apps/public-site/scripts/seed-cms-users.mjs` with real names, then from `apps/public-site/` run:
   ```
   node --env-file=.env.local scripts/seed-cms-users.mjs
   ```
   Prints each username's one-time temp password — relay manually, no email is sent. Each account is forced to set its own password on first login.
3. `npm run dev` from the repo root, then sign in at `/admin/login`.

## What's built vs. deferred

Built in this pass: every item in "Architecture" above, for all 17 Phase 1 content types (`notices`, `achievements`, `projects`, `events`, `blog_posts`, `committee_members`, `alumni`, `gallery_albums`, `gallery_images`, `agp_blocks`, `navigation_items`, `home_sections`, `seo_metadata`, `forum_categories`, `forum_posts`, `forum_replies`, `contact_submissions`), plus `site_settings` as a dedicated singleton page (`/admin/settings`, not part of the generic `/admin/[type]` router). The homepage (`/`) is wired to `getActiveNotices()` + `getSiteSettings()` as a deliberately minimal proof of the read path — not a real design.

Deferred (not started):
- Any public-facing page beyond that one proof-of-wiring homepage — waiting on the reference frontend the user will hand over.
- Media upload wiring for image fields (content types currently take a plain image URL string — fine for pasting existing URLs, no upload widget yet). Per SRS.md FR-10 the destination is a **Cloudflare bucket**, referenced from Postgres by URL — not Supabase Storage (an earlier FR-10 version said Supabase Storage; SRS.md changed mid-session on 2026-09-02, after the schema was already written). The plain-URL-field schema design is storage-agnostic, so no rework is needed either way — only the actual bucket setup and an upload server action are outstanding. See `CLAUDE.md`'s "Known gaps" for the current detail.
- `packages/supabase/src/database.types.ts` is hand-authored to mirror the migration; once the Supabase CLI is linked to the project, regenerate it with `supabase gen types typescript` instead of hand-editing both files in sync.
- Per-type admin polish (select dropdowns instead of free-text for things like `status`/`category`/`group_name`, an album-picker for `gallery_images.album_id` instead of pasting a UUID). The generic CRUD works today, just not maximally friendly.

## Loose end, flagged separately from this build

`apps/public-site/.env.local.example` has real-looking Supabase keys already committed to git — worth rotating the secret key and replacing the file with placeholders.
