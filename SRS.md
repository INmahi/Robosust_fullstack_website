# Software Requirements Specification
## RoboSUST Platform — Public Website CMS & EC Management System

| | |
|---|---|
| **Document version** | 2.0 |
| **Date** | 2026-08-17 |
| **Prepared for** | RoboSUST (Robotics Club, Shahjalal University of Science & Technology) |
| **Status** | Draft — pending stakeholder review of items marked **[Open]** |
| **Changelog** | v2.0: phase order reversed (CMS now Phase 1, EC Portal now Phase 2); assessment simplified (manual impression scoring removed); Phase 1 sitemap and Committee content type added; platform now targets a new, separate repository. |

---

## 1. Introduction

### 1.1 Purpose

This document specifies the requirements for a from-scratch RoboSUST web platform, built in two phases:

- **Phase 1 — CMS + Public Site**: a modernized public-facing website with a full content management system, replacing the current site.
- **Phase 2 — EC Portal**: an internal system for Executive Committee (EC) member onboarding, role-based task assignment/tracking, and performance visibility.

Phase 1 is built and shipped first; Phase 2 is built afterward, reusing the shared infrastructure (design system, auth, database) established in Phase 1.

### 1.2 Scope

The platform lives in a **new, separate repository** — it does not modify or depend on the existing `robosust-website-stack` repository (React 18 + Flask/SQLAlchemy), which continues running as the live site and reference implementation until cutover. The new platform is a TypeScript monorepo containing two applications built in sequence: `apps/public-site` (Phase 1) and `apps/ec-portal` (Phase 2, added later as a sibling app), sharing a common design system, authentication layer, and database.

### 1.3 Definitions & Acronyms

| Term | Meaning |
|---|---|
| AGP | Auto Grand Prix — an existing RoboSUST program/page |
| EC | Executive Committee |
| Wing | A functional sub-team of the EC (e.g. R&D, IT, Content and Creation) |
| Term | One year's Executive Committee (e.g. "10th Executive Committee") |
| Core EC | The cross-wing leadership tier (President, Vice President, Director of Robotics, General Secretary, Asst. General Secretary, Joint Secretary) |
| Wing Head | The "Secretary" of a given wing |
| Wing Member | An "Asst. Secretary" within a given wing |
| RLS | Row-Level Security (Postgres access-control mechanism) |
| SSR | Server-Side Rendering |

### 1.4 References

- Current live codebase: `robosust-website-stack` (separate repository, `backend/` and `frontend/`) — retained as reference only.
- RoboSUST 10th Executive Committee List (org chart supplied by stakeholder; reproduced in Appendix A).

---

## 2. Overall Description

### 2.1 Product Perspective

The platform is a from-scratch rebuild in a new repository, not a patch of the existing Flask/React app. The existing app stays live and operational during the rebuild and is only retired once Phase 1 (and later Phase 2) is ready to replace it.

### 2.2 Technology Stack

| Layer | Choice | Rationale |
|---|---|---|
| Frontend framework | Next.js (App Router) + TypeScript | SSR/SEO, type safety across a growing data model |
| Styling / components | Tailwind CSS + shadcn/ui | Consistent design system instead of a single hand-rolled CSS file |
| Backend / database | Supabase (Postgres + Auth + Storage) | Managed Postgres with built-in auth (RLS-based permissions) and file storage; open-source core avoids hard vendor lock-in |
| Hosting (initial) | Vercel (frontend) + Supabase Cloud (backend), free tiers | Zero-cost to start; both are swappable later |
| Hosting (future option) | VPS, for the Next.js app specifically, with Supabase kept managed | Ownership/professionalism goal, without taking on full database self-hosting risk |
| Repository structure | Monorepo (Turborepo/pnpm workspaces) in the new repo: `apps/public-site` (Phase 1), `apps/ec-portal` (Phase 2), shared packages for design system, Supabase client, and auth/roles | No "merge" step needed later — the second app is simply added |

**Portability constraint**: the platform must avoid hosting-provider-proprietary features (e.g. Vercel KV/Blob) so it can be redeployed to self-managed infrastructure (VPS/Docker) without a rewrite, only a redeploy. Supabase's self-hosting path (official Docker Compose distribution) is the documented escape hatch if the team ever moves off managed Supabase.

### 2.3 User Classes

| User class | Applies to |
|---|---|
| Admin | Platform administrator(s); full control over both phases |
| Public visitor | Any unauthenticated site visitor (Phase 1: all public content; Phase 2: EC roster remains public-visible via Committee page) |
| *(Phase 2)* Core EC | President, Vice President, Director of Robotics, General Secretary, Asst. General Secretary, Joint Secretary |
| *(Phase 2)* Wing Head | Each wing's Secretary |
| *(Phase 2)* Wing Member | Each wing's Asst. Secretary |
| *(Phase 2)* Treasury | Treasurer, Asst. Treasurer (managed directly by Core EC; no delegation authority of their own) |
| *(Open, Phase 2+)* Content Editor | Not yet specified — the roles system is designed to be extensible so this can be added later without restructuring |

### 2.4 Constraints & Assumptions

- No migration of the existing site's SQLite content into the new platform; Phase 1 content is entered fresh through the new CMS.
- Visual direction is an **evolution, not a redesign**: "almost the same as now, but with a modern feel" — recognizable continuity with the current site's layout and branding (dark `#161820` + gold `#f9a826` accent as a likely anchor), executed with a modern component system. Exact design specifics are **[Open]**, pending a dedicated design pass.
- EC membership (Phase 2) resets **annually**; each year is a distinct **Term**, and past terms remain read-only history.
- Wings and designation titles (Phase 2) are **data, not hardcoded values** — the committee's structure may change between terms.
- Custom domain acquisition is **[Open]** — currently assumed to run on free `*.vercel.app` subdomains.

---

## 3. Phase 1 — CMS + Public Site: Functional Requirements

### 3.1 Sitemap

Confirmed public pages: **Home, AGP, Projects, Blog, Forum, Events, Committee.**

### 3.2 Frontend

- **FR-1**: The public website is built on Next.js/TypeScript/Tailwind/shadcn-ui, replacing the current plain-CSS Vite/React SPA.
- **FR-2**: All public content pages are server-rendered (SSR/SSG) for SEO — indexable HTML on first load, not client-rendered-only.
- **FR-3**: Layouts are mobile-first and responsive across all public pages.
- **FR-4**: Visual direction follows the confirmed constraint in §2.4 — modernized execution of the current look, not a from-scratch redesign. Exact palette/component decisions are **[Open]**, pending a dedicated design pass.

### 3.3 Content Management (CMS)

- **FR-5**: All public content is fully admin-managed through the CMS — **no hardcoded content or media** anywhere in the codebase.
- **FR-6**: The following content types are rebuilt as fully CRUD-manageable: Achievements, Initiatives, Alumni, Projects, Blog Posts, Forum (categories, posts, replies).
- **FR-7**: The current site's "Workshop" content type is generalized into **Events**, adding a category/type field (workshop, seminar, competition, meeting, etc.) while retaining date and location.
- **FR-8**: A new **Notices** content type is introduced for lightweight announcements — title, short body, optional link, expiry date, pinned flag — surfaced prominently (e.g. a homepage banner/list), distinct from full Blog posts.
- **FR-9**: A new **Committee** content type powers the Committee page: **profile photo (dummy/placeholder allowed), name, designation, department-session** (single combined field, e.g. "EEE'21"). Simple admin-entered content — not wired to any authentication or role system in this phase. **[Open, revisit at Phase 2 kickoff]**: whether Phase 2's EC Portal eventually supersedes this content type with real membership data, or the two remain independently managed.
- **FR-10**: Media uploads (images for any content type) are stored in Cloudpflare bucket and accessed though supabase postgres link, replacing the current local-disk upload mechanism (which does not persist across redeploys on the existing host).
- **FR-11**: Existing seeded/legacy content is **not** migrated; content is re-entered fresh through the new CMS.

---

## 4. Phase 2 — EC Portal: Functional Requirements

*(Built after Phase 1 ships, reusing its shared design system, Supabase client, and auth infrastructure.)*

### 4.1 Roles & Permission Summary

| Role tier | Task assignment scope |
|---|---|
| Admin | Full override |
| Core EC | Any wing head or wing member/treasury, any wing |
| Wing Head | Own wing's members only |
| Wing Member | None (recipient only) |
| Treasury | None (recipient only; assigned exclusively by Core EC) |
| Public | N/A |

### 4.2 Authentication & Onboarding

- **FR-12**: Admin creates an EC member profile with: full name, email, designation title, wing (if applicable), role tier.
- **FR-13**: The system auto-generates a username in the format `FullName_XXXX` (4-digit random suffix) and a temporary password.
- **FR-14**: The system emails a registration/invite link to the new member.
- **FR-15**: The member completes their own profile via the invite link — department, batch/session, registration number, a formal profile photo — and sets/changes their password.
- **FR-16**: Login is handled via Supabase Auth (no custom credential storage in application code).
- **FR-17**: Members can change their password at any time from their dashboard.

### 4.3 Term & Organization Management (Admin only)

- **FR-18**: Admin creates a new Term (e.g. "11th Executive Committee") and marks it active; the previously active term becomes read-only automatically.
- **FR-19**: Admin defines and edits Wings within a term (name, description).
- **FR-20**: Admin sets each member's designation title (free text) and role tier (fixed set: admin / core_ec / wing_head / wing_member / treasury) per term.
- **FR-21**: Past terms, and all their members/tasks, remain viewable read-only indefinitely.

### 4.4 Task Management

- **FR-22**: An authorized assigner creates a task — title, description, assignee, deadline — within the scope defined in §4.1.
- **FR-23**: The assignee must click **Accept** to move the task from `Assigned` to `Accepted`, recording `accepted_at`.
- **FR-24**: The assignee marks their own task `Completed`, recording `completed_at`; the system computes on-time vs. late against the deadline.
- **FR-25**: A task past its deadline and not yet `Completed` is displayed as **Overdue** — a computed status, not a stored one.
- **FR-26**: The relevant assigner can **Reopen** a `Completed` task with a required comment, returning it to `Accepted`.
- **FR-27**: Every task state change (assigned / accepted / completed / reopened) is recorded in an append-only audit log with actor and timestamp.

### 4.5 Performance Visibility *(simplified — no manual scoring)*

> **Change from earlier draft**: manual "impression" scoring (1–5, entered by Wing Heads/Core EC) has been **removed**. Performance visibility is now purely derived from task data — no subjective rating layer.

- **FR-28**: A member's own dashboard shows their assigned tasks (list), completed-task count, and incomplete/pending-task count.
- **FR-29**: Completion rate and average response time (`accepted_at - assigned_at`) per member are computed automatically from task data.
- **FR-30**: Wing Heads can view these computed metrics for their own wing's members; Core EC can view them for all members; Admin has full visibility.

### 4.6 Public Roster

- **FR-31**: Unauthenticated visitors can view a roster of current and past EC members via the Committee page, showing only: full name, designation title, wing, department/batch, profile photo. All other fields remain private.
- **FR-32**: The roster is browsable by term (e.g. "10th Committee" vs. "9th Committee"). *(Relationship to the Phase 1 Committee content type per FR-9 is an open decision, see §7.)*

### 4.7 Admin Dashboard

- **FR-33**: The dashboard summarizes active-term status, member counts per wing, task completion rates, and overdue task counts.
- **FR-34**: Admin can override or correct any member or task record.

---

## 5. Data Model

### 5.1 Phase 1 (CMS + Public Site)

| Entity | Key fields |
|---|---|
| `achievements` | id, title, description, image, date, order |
| `initiatives` | id, title, description, image, status, order |
| `events` | id, title, description, image, category, date, location, order *(generalized from Workshop)* |
| `notices` | id, title, body, link, expires_at, pinned, order |
| `alumni` | id, name, department, batch, image, current_position, linkedin, order |
| `projects` | id, title, description, image, status, github, demo, order |
| `blog_posts` | id, title, content, excerpt, image, author, published, created_at, updated_at |
| `forum_categories` / `forum_posts` / `forum_replies` | as in the existing schema, rebuilt on the new stack |
| `committee_members` | id, photo_url (nullable/placeholder), name, designation, department_session, order *(simple content type, FR-9)* |

### 5.2 Phase 2 (EC Portal)

| Entity | Key fields |
|---|---|
| `terms` | id, name, term_number, start_date, end_date, is_active |
| `wings` | id, term_id, name, description |
| `members` | id, term_id, wing_id (nullable), auth_user_id, designation_title, role_tier, full_name, username, email, age, department, batch/session, registration_number, profile_photo_url, profile_completed, invite_sent_at |
| `tasks` | id, term_id, assigned_by, assigned_to, title, description, deadline, status, assigned_at, accepted_at, completed_at |
| `task_events` | id, task_id, event_type, actor_id, comment, created_at |
| `public_roster` (view) | restricted projection of `members` — public fields only |

Permissions are enforced with Postgres Row-Level Security, keyed on the authenticated user's `role_tier` and `wing_id` — not application-layer checks alone.

---

## 6. Non-Functional Requirements

- **NFR-1 (Security)**: Role-based access enforced via Postgres RLS (Phase 2).
- **NFR-2 (Data integrity)**: Phase 2 data is term-scoped; archived terms are immutable.
- **NFR-3 (Portability)**: No hosting-provider-proprietary features; the stack must remain deployable outside Vercel/Supabase managed hosting without a rewrite.
- **NFR-4 (SEO)**: Server-rendered, indexable pages for all public content (Phase 1 in full; Phase 2's public roster).
- **NFR-5 (Usability)**: Mobile-responsive throughout — EC members (Phase 2) are expected to accept/complete tasks from phones.
- **NFR-6 (Auditability)**: Full task-event history retained indefinitely per term (Phase 2).

---

## 7. Open Items for Future Revision

- Exact visual/design-system specifics for Phase 1 (beyond "same as now, modernized").
- Whether a custom domain will be acquired.
- Whether Phase 2's EC Portal ultimately takes over the Phase 1 Committee content type (FR-9) with real membership data, or the two remain independently managed.
- Exact permission model for a possible future "Content Editor" role.

---

## Appendix A — RoboSUST 10th Executive Committee (reference org chart, for Phase 2)

| Designation | Name(s) | Dept'batch |
|---|---|---|
| Director of Robotics | Md Yak Safu | SWE'21 |
| President | Dipongkar Chakma | EEE'21 |
| Vice President | Nishat Tarannum Mim, Md. Asad Shekh, Md Mehedi Hassan | MAT'21, EEE'21, EEE'21 |
| General Secretary | Yuvraj Nabil Rahman | MAT'21 |
| Asst. General Secretary | Shah Mohammad Abid, Nujhat-e-alam Tanvin | EEE'22, EEE'23 |
| Joint Secretary | Sukanta Biswas | EEE'21 |
| Treasurer | Md Fahim Talukder | EEE'21 |
| Asst. Treasurer | Md. Farhad Hossain Ovi | STA'23 |
| Secretary of Research & Development | Mollah Omar Hamza | CSE'22 |
| Asst. Secretary of R&D | Ishat Noor Mahi, Mushfiq Zubayer | STA'24, EEE'24 |
| Secretary of Project and Planning | Imteaz Hossain, Ahmed Istiaque | EEE'23, CSE'22 |
| Asst. Secretary of Project & Planning | Arjun Shil Roy, Md. Abdullah Al Sami Chowdhury | EEE'24, EEE'24 |
| Operations Secretary | Dipanwita Shome, Akm Yeahhiya Siam | EEE'22, EEE'23 |
| Asst. Operation Secretary | Zarif Hasan Sadik, Md. Abir Mahmud | EEE'24, EEE'24 |
| Organising Secretary | Shommyadip Das | PME'23 |
| Asst. Organising Secretary | Sirat Ahmed Shimanto, Ishmam Ahmed, Prince Mazumder | OCG'24, STA'24, STA'24 |
| IT Secretary | Nabiha Tahsin | EEE'23 |
| Asst. IT Secretary | Sheikh Wadil Ayman, Md Adib Al Zian, Nowrin Ara Nargish | CSE'24, SWE'23, EEE'24 |
| Secretary of School Program & Workshop | Progga Paromita Chanda Awishi, Humayra Jui | OCG'22, MAT'22 |
| Asst. Secretary of School Program & Workshop | Dhrubo Krishna Das, Nusrat Haque Faija | STA'24, PHY'24 |
| Secretary of Content and Creation | Maria Mostary Mouri | EEE'23 |
| Asst. Secretary of Content and Creation | Sunzid Rahman Abir, Quranul Islam Sahed, Surjita Datta | EEE'24, FET'24, PHY'24 |
| Secretary of Strategy & Sponsorship | Shafiqul Islam Fardin | BBA'23 |
| Asst. Secretary of Strategy & Sponsorship | Zannatul Mawa Shathy | EEE'24 |
