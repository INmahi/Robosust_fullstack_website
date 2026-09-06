-- The reference frontend (synapse6/robosust_frontend @ cdbb656 "Added new
-- pages") grew four routes beyond the homepage: /about, /events, /projects
-- and /executive-members. We port them CMS-controlled rather than static,
-- which needs three things:
--   1. home_sections has to become page-scoped — it now holds sections for
--      every page, not just the homepage. A `page` column keeps the /admin
--      list readable instead of one undifferentiated pile of section keys.
--   2. home_section_items needs an `icon` slot for the About page's three
--      "principles" cards (upstream renders a lucide icon per card).
--   3. committee_members needs the contact fields the new executive-member
--      cards show (upstream's are dead "#" links; ours render only when the
--      field is actually filled, same rule as the header socials).
-- Idempotent — safe to re-run.

alter table public.home_sections add column if not exists page text not null default 'home';
alter table public.home_section_items add column if not exists icon text;

alter table public.committee_members add column if not exists email text;
alter table public.committee_members add column if not exists linkedin_url text;

create index if not exists home_sections_page_idx on public.home_sections (page, sort_order);

-- Existing rows are all homepage sections; the column default already says
-- 'home', this is only for a re-run against a hand-edited row.
update public.home_sections set page = 'home'
where section_key in ('hero', 'about', 'achievements', 'blog') and page is distinct from 'home';

-- ---------------------------------------------------------------------------
-- Homepage About section — upstream replaced its copy and dropped the three
-- stat cards (01 Think / 02 Build / 03 Compete). Both updates are guarded on
-- the row still holding exactly what 0003 seeded, so an editor who has
-- already rewritten this copy in /admin keeps their version.
-- ---------------------------------------------------------------------------
update public.home_sections set
  eyebrow = 'About RoboSUST',
  heading = 'About RoboSUST',
  subheading = null,
  body = 'Fostering innovation across disciplines, the club empowers members to transform theoretical knowledge into real-world technological solutions. Through hands-on workshops, competitive events, and collaborative projects, RoboSUST nurtures the next generation of engineers, coders, and automation enthusiasts, driving technological advancements and representing the university on national and international robotics platforms.'
where section_key = 'about'
  and eyebrow = '01 / Who we are'
  and heading = 'Engineering the next move.';

delete from public.home_section_items i
using public.home_sections s
where i.section_id = s.id
  and s.section_key = 'about'
  and (i.value, i.label) in (('01', 'Think'), ('02', 'Build'), ('03', 'Compete'));

-- ---------------------------------------------------------------------------
-- Navigation — anchors on a single-page site become real routes. Each update
-- is guarded on the old seeded URL for the same reason as above.
-- ---------------------------------------------------------------------------
update public.navigation_items set url = '/', sort_order = 0
where group_name = 'primary' and label = 'Home' and url = '#top';

update public.navigation_items set label = 'Events', url = '/events', sort_order = 2
where group_name = 'primary' and label = 'Event' and url = '#events';

update public.navigation_items set url = '/projects', sort_order = 4
where group_name = 'primary' and label = 'Projects' and url = '#projects';

update public.navigation_items set sort_order = 5
where group_name = 'primary' and label = 'Forum' and url = '#forum';

-- Upstream's header no longer carries Blog (it stays in the footer).
delete from public.navigation_items where group_name = 'primary' and label = 'Blog' and url = '#blog';

insert into public.navigation_items (label, url, group_name, sort_order)
select v.label, v.url, 'primary', v.sort_order
from (values ('About', '/about', 1), ('Executive', '/executive-members', 3)) as v(label, url, sort_order)
where not exists (
  select 1 from public.navigation_items n where n.label = v.label and n.group_name = 'primary'
);

update public.navigation_items set url = '/about', sort_order = 0
where group_name = 'footer' and label = 'About' and url = '#about';

update public.navigation_items set url = '/projects', sort_order = 2
where group_name = 'footer' and label = 'Projects' and url = '#projects';

update public.navigation_items set url = '/events', sort_order = 3
where group_name = 'footer' and label = 'Events' and url = '#events';

update public.navigation_items set url = '/#blog', sort_order = 4
where group_name = 'footer' and label = 'Blog' and url = '#blog';

update public.navigation_items set sort_order = 5
where group_name = 'footer' and label = 'Forum' and url = '#';

insert into public.navigation_items (label, url, group_name, sort_order)
select 'Executive', '/executive-members', 'footer', 1
where not exists (
  select 1 from public.navigation_items n where n.label = 'Executive' and n.group_name = 'footer'
);

-- ---------------------------------------------------------------------------
-- Sections for the four new pages, seeded with the reference frontend's own
-- copy so every page renders populated and every word is editable in /admin.
-- A newline inside `heading` renders as a line break (upstream writes these
-- as literal <br/>); on a PageIntro, lines after the first render outlined.
-- ---------------------------------------------------------------------------
insert into public.home_sections
  (section_key, page, eyebrow, heading, subheading, background_image_url, cta_text, cta_url, sort_order)
values
  ('about_intro', 'about', '01 / The laboratory',
   E'More than a\nrobotics club.',
   'RoboSUST is a student-led community at Shahjalal University of Science and Technology building the skills, systems and friendships that make ambitious robotics possible.',
   'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1800&q=85',
   null, null, 0),
  ('about_principles', 'about', '02 / Our approach',
   E'Learn by\nmaking.',
   'The lab is a place to move between theory and practice. A sketch becomes a circuit, a circuit becomes a machine, and a machine teaches us what the sketch missed.',
   null, 'Meet the executive members', '/executive-members', 1),
  ('events_intro', 'events', '03 / Gather & compete',
   E'Ideas become\naction.',
   'Workshops, competitions and open sessions designed to bring curious people together around the joy of building machines.',
   'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1800&q=85',
   null, null, 0),
  ('events_calendar', 'events', '02 / Calendar',
   E'More ways\nto get involved.',
   'Keep an eye on the calendar for learning sessions, recruitment opportunities and the competitions that bring our community together.',
   null, null, null, 1),
  ('projects_intro', 'projects', '04 / Selected work',
   E'Machines with\na purpose.',
   'Every RoboSUST project starts with a real problem, a curious team and the willingness to test an idea until it works outside the sketchbook.',
   'https://images.unsplash.com/photo-1535378917042-10a22c95931a?auto=format&fit=crop&w=1800&q=85',
   null, null, 0),
  ('projects_shelf', 'projects', '01 / The project shelf',
   E'What we\nbuild.',
   'From autonomous navigation to human-robot interaction, our work brings together electronics, mechanics, software and a lot of iteration.',
   null, null, null, 1),
  ('projects_cta', 'projects', '02 / Keep building',
   'The next prototype is already taking shape.',
   null, null, 'Join the next event', '/events', 2),
  ('committee_intro', 'committee', '02 / The people',
   E'Built by\nbuilders.',
   'Meet the executive team guiding RoboSUST''s projects, programs and community. Their job is to keep the lab moving and make room for the next idea.',
   'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1800&q=85',
   null, null, 0),
  ('committee_list', 'committee', '03 / Executive committee',
   E'The team\nbehind the work.',
   'A small team with a shared responsibility: create an environment where members can learn quickly, collaborate generously and take on difficult problems.',
   null, null, null, 1)
on conflict (section_key) do nothing;

-- The About page's three principle cards. `icon` holds a lucide icon name
-- resolved by src/components/public/section-icons.ts (unknown/blank falls
-- back to a default glyph, so a typo degrades instead of breaking a build).
insert into public.home_section_items (section_id, icon, label, body, sort_order)
select s.id, v.icon, v.label, v.body, v.sort_order
from public.home_sections s, (values
  ('lightbulb', 'Curiosity first', 'We ask better questions before we reach for an answer, then turn ideas into experiments.', 0),
  ('cpu', 'Build together', 'Hardware, software, design and research move faster when knowledge is shared openly.', 1),
  ('trophy', 'Compete with purpose', 'Every competition is a chance to sharpen our thinking and represent SUST with pride.', 2)
) as v(icon, label, body, sort_order)
where s.section_key = 'about_principles'
  and not exists (select 1 from public.home_section_items i where i.section_id = s.id);

-- Per-page SEO rows, so /admin → SEO Metadata covers every route that exists.
insert into public.seo_metadata (page_key, title, description)
select v.page_key, v.title, v.description
from (values
  ('about', 'About — RoboSUST', 'RoboSUST is a student-led robotics community at Shahjalal University of Science and Technology.'),
  ('events', 'Events — RoboSUST', 'Workshops, competitions and open sessions hosted by RoboSUST.'),
  ('projects', 'Projects — RoboSUST', 'Autonomous systems, embedded hardware and research projects built at RoboSUST.'),
  ('executive-members', 'Executive Members — RoboSUST', 'The executive committee guiding RoboSUST''s projects, programs and community.')
) as v(page_key, title, description)
where not exists (select 1 from public.seo_metadata m where m.page_key = v.page_key);
