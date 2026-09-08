-- Navbar restructure: logo | primary nav | Join Us + More + account.
--
-- `more` is the group that already existed in 0001's check constraint but was
-- never populated. It now holds the routes that are agreed but not yet built,
-- parked on url '#'. The header renders a '#' item as a dimmed "Soon" row
-- rather than a link, so the menu can list the full sitemap without shipping
-- links to 404s — give an item a real URL and it becomes a normal link with no
-- code change.
--
-- "Join Us" is deliberately NOT a navigation_items row: it's a fixed structural
-- CTA with its own styling and its own route, in the same category as the
-- wordmark. Everything an editor should be able to reorder or rename lives in
-- the table; this doesn't.
--
-- Guarded throughout so re-running can't duplicate or clobber editor changes.

-- Primary: match the agreed order, and Forum leaves for the More menu.
update public.navigation_items set label = 'Executives', sort_order = 4
where group_name = 'primary' and label = 'Executive';

update public.navigation_items set sort_order = 2
where group_name = 'primary' and label = 'Projects';

update public.navigation_items set sort_order = 3
where group_name = 'primary' and label = 'Events';

delete from public.navigation_items
where group_name = 'primary' and label = 'Forum';

update public.navigation_items set label = 'Executives'
where group_name = 'footer' and label = 'Executive';

-- More: the rest of frontend-overview.md's sitemap, not yet designed.
insert into public.navigation_items (label, url, group_name, sort_order)
select v.label, '#', 'more', v.sort_order
from (values
  ('Blog', 0),
  ('Forum', 1),
  ('Gallery', 2),
  ('Achievements', 3),
  ('Alumni', 4),
  ('AGP', 5),
  ('Contact', 6)
) as v(label, sort_order)
where not exists (
  select 1 from public.navigation_items n where n.label = v.label and n.group_name = 'more'
);
