-- The reference frontend (synapse6/robosust_frontend @ c54d4bb "Add slideshow
-- components") replaced the Achievements section's featured-milestone card +
-- two metric cards with a single auto-advancing slideshow.
--
-- For us the slides come from the `achievements` table rather than a hardcoded
-- array, so no schema change is needed — but three pieces of seeded content are
-- now orphaned and would keep showing up in /admin as fields that render
-- nowhere:
--   * home_sections['achievements'].body + .secondary_image_url — these backed
--     the milestone card's copy and image, which the slideshow replaces with
--     real `achievements` rows.
--   * the two home_section_items metric cards ("12+", "24/7") — the section no
--     longer has a metrics column at all.
-- The heading also changes: upstream's is now "Proof of progress." with no
-- description, where 0003 seeded the milestone title into it.
--
-- Every statement is guarded on the row still holding exactly what 0003
-- seeded, so an editor who has already rewritten this keeps their version.
-- Idempotent — safe to re-run.

update public.home_sections set
  heading = 'Proof of progress.',
  subheading = null,
  body = null,
  secondary_image_url = null
where section_key = 'achievements'
  and heading = 'From prototype to podium.'
  and subheading = 'A modular showcase for competition results, milestones and moments worth remembering.';

delete from public.home_section_items i
using public.home_sections s
where i.section_id = s.id
  and s.section_key = 'achievements'
  and (i.value, i.body) in (
    ('12+', 'Competition and research projects across autonomous robotics, embedded systems and intelligent machines.'),
    ('24/7', 'A builder mindset: test, break, learn, iterate and ship.')
  );
