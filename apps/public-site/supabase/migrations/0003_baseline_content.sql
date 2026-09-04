-- Baseline content matching the reference frontend's actual copy
-- (synapse6/robosust_frontend), so the site renders fully populated and
-- editors edit real placeholder content rather than starting from blank
-- rows. Idempotent — safe to re-run.

update public.site_settings set
  tagline = coalesce(tagline, 'Robotics For Glory.'),
  background_image_url = coalesce(background_image_url, 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=1800&q=80'),
  footer_note = coalesce(footer_note, 'A modern digital home for a robotics laboratory, its projects and its people.')
where id = true;

-- navigation_items — primary (matches SiteHeader.tsx's anchor nav) + footer
insert into public.navigation_items (label, url, group_name, sort_order)
select v.label, v.url, 'primary', v.sort_order
from (values
  ('Home', '#top', 0),
  ('Event', '#events', 1),
  ('Projects', '#projects', 2),
  ('Blog', '#blog', 3),
  ('Forum', '#forum', 4)
) as v(label, url, sort_order)
where not exists (
  select 1 from public.navigation_items n where n.label = v.label and n.group_name = 'primary'
);

insert into public.navigation_items (label, url, group_name, sort_order)
select v.label, v.url, 'footer', v.sort_order
from (values
  ('About', '#about', 0),
  ('Projects', '#projects', 1),
  ('Events', '#events', 2),
  ('Blog', '#blog', 3),
  ('Forum', '#', 4)
) as v(label, url, sort_order)
where not exists (
  select 1 from public.navigation_items n where n.label = v.label and n.group_name = 'footer'
);

-- home_sections + home_section_items, matching the reference frontend's copy
insert into public.home_sections (section_key, eyebrow, heading, subheading, body, background_image_url, secondary_image_url, cta_text, cta_url, secondary_cta_text, secondary_cta_url, sort_order)
values (
  'hero',
  'Robotics Laboratory based in SUST',
  'Robotics For Glory.',
  null,
  null,
  'https://images.unsplash.com/photo-1781330189305-d92d518dc28d',
  null,
  'Register for AGP', '#projects',
  'Our mission', '#about',
  0
)
on conflict (section_key) do nothing;

insert into public.home_sections (section_key, eyebrow, heading, subheading, body, background_image_url, secondary_image_url, sort_order)
values (
  'about',
  '01 / Who we are',
  'Engineering the next move.',
  'A visual-first robotics community focused on experimentation, competition, research and building machines that move ideas forward.',
  'We bring students, engineers and makers together around robotics and intelligent systems. From autonomous navigation to competitive machines, the laboratory is a place to turn ambitious concepts into working hardware.',
  'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1800&q=80',
  'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1200&q=80',
  1
)
on conflict (section_key) do nothing;

-- The "featured milestone" card (heading/body/secondary_image_url) and the
-- section header (eyebrow/subheading) share this one row — a reasonable
-- simplification for placeholder content; revisit if the milestone card
-- ever needs to vary independently of the section heading.
insert into public.home_sections (section_key, eyebrow, heading, subheading, body, background_image_url, secondary_image_url, sort_order)
values (
  'achievements',
  '03 / Achievements',
  'From prototype to podium.',
  'A modular showcase for competition results, milestones and moments worth remembering.',
  'Replace this with the laboratory''s latest major competition result or research milestone.',
  'https://images.unsplash.com/photo-1564053489984-317bbd7f4a8f?auto=format&fit=crop&w=1800&q=80',
  'https://images.unsplash.com/photo-1561557944-6e7860d1a7eb?auto=format&fit=crop&w=1600&q=85',
  2
)
on conflict (section_key) do nothing;

insert into public.home_sections (section_key, eyebrow, heading, subheading, sort_order)
values (
  'blog',
  '05 / Field notes',
  'Inside the lab.',
  'Technical stories, build logs and ideas from the people behind the machines.',
  3
)
on conflict (section_key) do nothing;

-- About's 3 stats
insert into public.home_section_items (section_id, value, label, sort_order)
select id, v.value, v.label, v.sort_order
from public.home_sections, (values ('01', 'Think', 0), ('02', 'Build', 1), ('03', 'Compete', 2)) as v(value, label, sort_order)
where section_key = 'about'
and not exists (select 1 from public.home_section_items i where i.section_id = home_sections.id);

-- Achievements' 2 metrics
insert into public.home_section_items (section_id, value, body, sort_order)
select id, v.value, v.body, v.sort_order
from public.home_sections, (values
  ('12+', 'Competition and research projects across autonomous robotics, embedded systems and intelligent machines.', 0),
  ('24/7', 'A builder mindset: test, break, learn, iterate and ship.', 1)
) as v(value, body, sort_order)
where section_key = 'achievements'
and not exists (select 1 from public.home_section_items i where i.section_id = home_sections.id);
