current website at: https://github.com/MollahHamza/robosust-website-stack

# RoboSUST Platform — Frontend Overview

**What the new public website will contain.**

| | |
|---|---|
| **Scope** | Phase 1, Milestone 1 — public-facing frontend |
| **Date** | 2026-08-31 |
| **Basis** | `plans srs.md` v2.0, plus decisions taken in review where the SRS was incomplete or wrong |
| **Status** | Agreed — ready to build |

---

## 1. What this document is

This is the agreed content and layout definition for the rebuilt RoboSUST website: every page, every section on every page, and the admin-editable content behind each one.

It is not the implementation plan. It answers one question: **what will the site contain?**

---

## 2. Where the current site stands

The live site (`robosust.netlify.app`) is a Vite + React SPA — about 1,990 lines of source, backed by Flask on Render. Three findings shaped the plan:

**It has no SEO at all.** Requesting the live URL returns nothing but `<title>RoboSUST - Robotics for Glory</title>`. No navigation, no headings, no content. Search engines index an empty page. Every word on the site is invisible to Google.

**Its content is hardcoded.** Each page carries a fallback array baked into the JSX (`fallbackAchievements`, `fallbackProjects`, `fallbackAlumni`…), and roughly 40 images are committed into the repository. Beyond that, the navigation links, the social media URLs, the footer text, the hero headline, every section title — and the club's headline stat, *"65+ robotics contest title wins and counting"* — are all literals inside components. None of it can be changed without a developer and a redeploy.

**It is thinner than it looks.** Five navigation items exist. `/agp` is a 35-line "Coming Soon" placeholder. Events and Committee pages do not exist. Achievements, Initiatives, Alumni and Notices have database schemas but no page of their own — they appear only as homepage strips that grow without limit as content is added.

### One correction to the SRS

SRS §2.4 describes the current site as *"dark `#161820` + gold `#f9a826`"* and proposes that as the anchor for the redesign.

**That is not what the site is.** The body background is white. `#161820` appears only in the footer, buttons and image overlays. It is a **light** site with dark chrome. Since the SRS's binding constraint in the same paragraph is *"evolution, not redesign — recognizable continuity"*, the new site follows what the site actually is: **light-first**.

---

## 3. Sitemap

**11 pages**, plus 5 detail routes.

### Pages

| # | Page | Route | Status |
|---|---|---|---|
| 1 | Home | `/` | Rebuilt |
| 2 | AGP | `/agp` | **New** — replaces the "Coming Soon" stub |
| 3 | Projects | `/projects` | Rebuilt, absorbs Initiatives |
| 4 | Events | `/events` | **New** — generalizes Workshops |
| 5 | Committee | `/committee` | **New** |
| 6 | Achievements | `/achievements` | **New** — added in review |
| 7 | Blog | `/blog` | Rebuilt |
| 8 | Alumni | `/alumni` | **New** — added in review |
| 9 | Gallery | `/gallery` | **New** — added in review |
| 10 | Forum | `/forum` | Rebuilt |
| 11 | Contact / Join Us | `/contact` | **New** — added in review |

### Detail routes

`/projects/[slug]` · `/events/[slug]` · `/blog/[slug]` · `/gallery/[slug]` · `/forum/[id]`

### Deliberately not included

**No About page.** The club story lives as a section on the homepage instead — but a real, editable one, not the three hardcoded cards it is today.

**No Notices archive page.** Notices appear as a homepage banner only. `pinned` controls prominence and `expires_at` retires them silently. Notices are ephemeral by design.

**No Sponsors page.** Sponsor logos can be placed as a strip on AGP or the homepage later if needed. The content type is deferred, not designed out.

---

## 4. Navigation

### Primary bar

```
[logo] RoboSUST    Home  AGP  Projects  Events  Committee  More ▾      fb yt in
```

### More ▾

Achievements · Blog · Alumni · Gallery · Forum · Contact

### Footer

Grouped link columns covering all 11 pages, social icons, club tagline, copyright, and the admin login link.

Every label and URL above is **admin-editable** — navigation is data, not code. Items can be renamed, reordered, hidden, or moved between the primary bar, the More menu, and the footer without touching the codebase. AGP in particular can be pulled out of the primary bar between competition seasons.

**On mobile:** hamburger → full-height drawer, More ▾ items shown inline rather than nested.

---

## 5. Global shell

**Navbar** — sticky, logo + wordmark, primary links, More dropdown, social icons, mobile drawer. Active page indicated in accent gold.

**Footer** — dark `#161820`, grouped link columns, social icons, tagline, copyright, admin link.

**Scroll-to-top** — floating accent button, appears past the fold.

All shell content comes from Site Settings and Navigation — nothing hardcoded.

---

## 6. Page-by-page

### 6.1 Home

A **teaser hub**: every major page gets a short strip with a "View all" link. This keeps the homepage a fixed length no matter how much content the club adds — the failure mode of the current homepage, which renders every achievement, every workshop and every alumnus with no limit.

| # | Section | Contents | Fed by |
|---|---|---|---|
| 1 | **Hero** | Background image, headline, subtitle, CTA button | Home Sections |
| 2 | **Notices** | Pinned announcements, dismissible; hidden when none active | Notices |
| 3 | **About RoboSUST** | Club intro paragraph + flagship robot cards (Ribo, Li, SUSTsat-1) | Home Sections + Projects |
| 4 | **Flagship Projects** | 3 flagship projects → *View all* | Projects |
| 5 | **Achievements** | 6 most recent + the headline stat → *View all* | Achievements |
| 6 | **Upcoming Events** | Next 3 events → *View all* | Events |
| 7 | **From the Blog** | 3 latest posts → *View all* | Blog Posts |
| 8 | **Alumni** | 6 alumni avatars → *View all* | Alumni |
| 9 | **Gallery** | Photo mosaic strip → *View all* | Gallery |
| 10 | **Join Us** | Full-width accent CTA band → `/contact` | Home Sections |

Each section's heading, subheading, background image and CTA text is admin-editable, and each section can be **hidden or reordered** from the CMS.

> **Note:** the headline stat *"65+ robotics contest title wins"* becomes an editable field. Today it is a hardcoded string that will silently go stale.

### 6.2 AGP — Auto Grand Prix

The SRS gives AGP a navigation slot and its own entry in the definitions table, but **defines no content type for it whatsoever**. It is built here as one rich page with independently editable blocks.

1. Hero — event banner, title, tagline, edition/year
2. Overview — what AGP is
3. Rules & categories
4. Schedule / timeline
5. Past editions — previous years with results
6. Photo strip
7. Registration CTA — links out, with an open/closed state

Every block is editable and individually hideable, so the page degrades gracefully between competition seasons instead of reading "Coming Soon."

### 6.3 Projects

Absorbs the old Initiatives type. Initiatives and Projects had near-identical schemas and overlapping content — Ribo could plausibly have been filed under either. They are now one type with a **flagship** flag; the homepage "Ongoing Initiatives" strip becomes a filtered view of flagship projects.

- Page header
- Filters — status (ongoing / completed / upcoming) and category
- Card grid — image, status badge, title, description, GitHub / demo links

**Detail page** (`/projects/[slug]`): cover image, full body, image gallery, GitHub/demo links, related projects.

### 6.4 Events

Generalizes the old Workshop type by adding a category, per SRS FR-7.

- Page header
- Upcoming / Past tabs
- Category filter — workshop, seminar, competition, meeting
- Card grid — image, category badge, date, location, title

**Detail page** (`/events/[slug]`): full description, date and time, location, registration link.

### 6.5 Committee

- Page header
- Members grouped by tier — Core EC first, then wing by wing
- Photo cards — photo, name, designation, department-session (e.g. "EEE'21")

Placeholder avatars are supported, so the page can go live before every photo is collected.

> Phase 2's EC Portal may later supersede this with real membership data. Until then it is simple admin-entered content, exactly as SRS FR-9 specifies.

### 6.6 Achievements

The club claims **65+ contest wins**. Sixty-five items cannot live in a homepage strip — this page gives them a home.

- Page header with the total stat
- Year filter
- Grid grouped by year — image, competition, position/result, team name, description

### 6.7 Blog

- Page header
- Featured latest post
- Card grid — image, date, title, excerpt, author
- Empty state for when no posts are published

**Detail page** (`/blog/[slug]`): article layout with proper reading typography, author and date, share links.

### 6.8 Alumni

The alumni schema already carries `current_position` and `linkedin` — **and the current site renders neither**. The data model is richer than any surface that exists today. This page finally uses it.

- Page header
- Batch / department filter
- Cards — photo, name, department and batch, current position, LinkedIn link

### 6.9 Gallery

Roughly 40 event photos already sit in the repository, used only as section backgrounds.

- Album grid — cover image, title, date, photo count

**Album page** (`/gallery/[slug]`): image grid with lightbox and captions.

### 6.10 Forum

Carried over as-is functionally: category list, post list, and thread pages with replies. Posting remains anonymous (name + email), matching the current implementation.

> **Flagged for a later decision:** an anonymous, unmoderated forum is a spam and abuse risk. Worth revisiting before launch — moderation tools, or requiring an account. Out of scope for this milestone.

### 6.11 Contact / Join Us

**Absent from the SRS entirely.** The current site's only contact path is three social icons in the footer — a club that recruits every year has no way for anyone to reach it. This is the cheapest high-value page in the build.

- Page header
- Contact details — email, phone, address, map
- Join / recruitment form — name, email, department, batch, area of interest, message
- Recruitment open/closed state, toggled from the CMS
- Social links

---

## 7. Design direction

**Light-first, modernized** — an evolution of the current look, not a redesign. Someone who knows the current site will recognize the new one.

### Palette

Carried over from the existing stylesheet — these are the club's real identity:

| Token | Value | Use |
|---|---|---|
| Primary | `#161820` | Navbar chrome, footer, dark bands |
| Accent | `#f9a826` | Links, buttons, active nav, CTAs |
| Surface | `#ffffff` / `#fafafa` | Page and card backgrounds |
| Heading | `#161616` | Headings |
| Body | `#555555` | Body text |

Plus the existing 11-step gray ramp and semantic colors for success / warning / danger states.

### Typography

**Nunito** at weights 300 / 400 / 600 / 700 — retained from the current site.

### What changes visually

**The parallax problem gets fixed.** The current homepage stacks four consecutive `background-attachment: fixed` banner sections. The result is that Achievements, Initiatives, Workshops and Alumni all look identical, and fixed attachment janks badly on mobile. These are replaced with a deliberate alternating rhythm — light surface, tinted surface, and a single dark accent band used sparingly for emphasis.

Beyond that: a real component system in place of one hand-rolled stylesheet, consistent spacing and type scale, proper empty and loading states, and genuine mobile-first layouts.

---

## 8. What admins will be able to edit

The SRS requires **no hardcoded content or media anywhere** (FR-5). That covers far more than page bodies.

### Content types

| Type | What it drives |
|---|---|
| **Site Settings** | Site name, tagline, logo, favicon, social URLs, contact email/phone/address, map, recruitment open/closed |
| **Navigation** | Every nav label, URL, group, order and visibility |
| **Home Sections** | Each homepage section's heading, subheading, background image, stat text, CTA, visibility, order |
| **SEO Metadata** | Per-page title, description and social share image |
| **Notices** | Title, body, link, expiry, pinned |
| **Projects** | Title, description, body, images, status, flagship flag, category, GitHub, demo |
| **Achievements** | Title, description, image, competition, year, position, team |
| **Events** | Title, description, image, category, date, location, registration link |
| **Blog Posts** | Title, content, excerpt, image, author, published state |
| **Committee Members** | Photo, name, designation, department-session |
| **Alumni** | Name, department, batch, photo, current position, LinkedIn |
| **Gallery** | Albums and images with captions |
| **AGP Page** | All content blocks — overview, rules, schedule, past editions |
| **Forum** | Categories, posts, replies |
| **Contact Submissions** | Inbox of form submissions, markable as resolved |

### Media

All images upload through the CMS to cloud storage. This replaces two broken mechanisms: images committed into the repository, and the existing upload endpoint that writes to Render's ephemeral disk, where files disappear on every redeploy.

---

## 9. Technical characteristics

**Server-rendered.** Every public page ships real HTML on first load. This directly fixes the current site's total SEO failure and is verified by inspecting the raw response, not assumed.

**Mobile-first.** All pages, tested at 375 / 768 / 1280 px.

**Built content-source-agnostic.** Pages read through a single typed content interface. The initial build runs on local mock data so layouts can be reviewed immediately; switching to the live database and cloud storage later changes one module and **zero page files**. Image fields are typed references from the start, so cloud storage URLs drop in without touching any page.

**Isolated from the live site.** All new code lives in a separate folder on a separate branch. The current site's files are never modified, and its deployment cannot be affected.

---

## 10. Not in this milestone

- Database, cloud storage and authentication setup
- The CMS admin panel itself
- Entering real content
- Cutover from the current site
- Phase 2 — the EC Portal

This milestone ends with the complete site, all 11 pages plus detail routes, running on mock data and ready for visual review.

---

## 11. Open questions

1. **Forum moderation** — anonymous posting is a spam risk. Decide before launch.
2. **Committee vs. EC Portal** — whether Phase 2 replaces the Committee content type with real membership data, or the two stay independent (SRS §7 leaves this open).
3. **Custom domain** — still unresolved in the SRS.
4. **Sponsors** — whether sponsor logos are needed for AGP, and where they belong.
