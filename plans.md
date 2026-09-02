# RoboSUST Website Revamp + EC Management System — Discussion Summary

> Status: **Discussion in progress, not yet a final actionable plan.** This file captures decisions locked so far and open items. Plan mode is still active; nothing has been built yet.

## Context

The current RoboSUST website (`robosust-website-stack`, cloned into this repo) is a working but basic full-stack site: React 18 (plain CSS) + Flask/SQLAlchemy backend with generic CRUD admin for content (achievements, initiatives, workshops, alumni, projects, blog, forum). See prior repo analysis for details (single hardcoded admin, no schema migrations, local-disk file uploads that don't survive Render redeploys, wide-open CORS).

The user wants:
1. A modernized, more feature-rich public frontend.
2. A CMS-like system for managing content (events, notices, achievements, etc.).
3. A **separate Executive Committee (EC) management system** — admins/moderators assess EC members (organized into "wings" like RnD, IT, Content, Publicity, etc.) on task completion, response time, and "impression"; core EC roles (President, General Secretary, Director) have broader/higher access than wing heads/members.

**Key sequencing decision**: the EC management system is urgently needed and should be built **first**, as its own system, ahead of the public website redesign — but architected so the two don't collide and can be brought together later without a "merge" event.

## Decisions locked so far

- **Frontend foundation**: Next.js (App Router) + TypeScript + Tailwind CSS + shadcn/ui. Chosen over keeping the plain Vite+CSS SPA for SEO/SSR, type safety, and a real design system — user explicitly prioritized long-term maintainability over speed to first ship.
- **Backend/DB**: Supabase (hosted Postgres + Auth with RLS + Storage), replacing hand-rolled Flask+JWT+local-disk uploads. Rationale: open-source core (Postgres/PostgREST/GoTrue) means no hard vendor lock-in even though it's a hosted vendor; solves migrations, auth, and the upload-persistence bug in one platform. User confirmed comfort with this after a trust/longevity discussion (funding, open-source escape hatch, free-tier auto-pause-after-inactivity caveat noted).
- **Hosting**: Vercel, on free `*.vercel.app` subdomains for now — no custom domain owned yet, can attach one later without rework.
- **Repo structure**: **Monorepo from day one** (Turborepo/pnpm-workspaces style). EC portal is the first app built; the public site + CMS gets added later as a sibling app in the same repo, sharing design system and Supabase client setup. This is the mechanism that avoids a future "merge" — there isn't one, the second app just gets added.
- **Sequencing**: Build the **EC management system first and standalone**, ship it, then build the public website/CMS afterward on the same shared backend.
- **EC term model**: Committee membership resets **annually**. Modeled as a "Term" (e.g. 2025-26) containing that year's members/roles/tasks/assessments. Past terms remain visible as **read-only archived history**, not wiped. Admin starts a new term each year and re-issues credentials/roles.
- **Role hierarchy (tentative shape, exact breakdown pending from user)**: Admin (full control) > Core EC (President/GS/Director — broader, cross-wing oversight) > Wing Head (manages own wing's members, records assessments for them) > Wing Member (sees/updates only their own tasks). To be confirmed with the actual wing list and precise permissions per tier.
- **No-collision strategy for EC-first sequencing** (validated as sound):
  - One shared Supabase project from the start, but EC-specific tables (terms, wings, members, tasks, assessments) live in a clearly namespaced schema, separate from wherever future CMS content tables (events, notices, blog, etc.) will go — no shared table names or FK entanglement between domains, they only share the auth/roles layer.
  - Roles modeled as an **extensible table**, not hardcoded enums, so adding e.g. a "Content Editor" role later for the CMS is additive, not a restructuring.
  - Monorepo means the public site is just a second app added later, reusing the same design system and Supabase client code the EC portal establishes now.
  - Verdict given to user: **the EC-first plan works**, provided this schema-namespacing and generic-roles discipline is maintained.

## Content model decisions (for the later public-site/CMS phase, not blocking EC work)

- "Events" generalizes the existing `Workshop` model rather than being a separate type (add a category/type field: workshop, seminar, competition, meeting, etc.).
- "Notices" are lightweight announcements/alerts (title, short body, optional link, expiry date, pinned flag) — not full blog-post-style content.
- Existing seeded/local SQLite data will **not** be migrated — starting fresh, content will be re-entered through the new CMS when that phase happens.
- Visual/branding direction for the public site redesign: **deferred**, to be discussed later (existing palette: dark `#161820` + gold/orange accent `#f9a826` as a possible anchor, not yet decided).

## Open items (pending before EC system plan can be finalized)

- **Exact wing list** (known so far: RnD, IT, Content, Publicity, "etc etc" — incomplete) and **precise role/permission breakdown** per tier — user is compiling this and will send it.
- Task lifecycle/status model (e.g. Assigned → In Progress → Under Review → Completed/Overdue) — not yet discussed.
- Precise definition of "response time" as a tracked metric (time-to-acknowledge? time relative to deadline?) — not yet discussed.
- Precise mechanics of the "impression" assessment (who rates whom, how often, what form the rating takes) — partially discussed: wing heads assess their own wing's members; core EC has "higher roles" with broader access; exact rights model deferred by user for later discussion.
- Whether a custom domain will eventually be acquired (currently: no, free Vercel subdomains for now).

## Next steps

Paused at user's request pending the wing/role breakdown. Once received: define the EC system's data model (terms, wings, roles/permissions, members, tasks, assessments) and task/assessment mechanics, then produce a concrete, buildable plan for the EC portal (Phase/App 1 of the monorepo).
