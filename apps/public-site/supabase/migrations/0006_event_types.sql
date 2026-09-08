-- Events gain two things the /events redesign needs:
--
--   * `event_type` — the three buckets an event can be in: a plain upcoming
--     event, a `featured` one (which pops up on the homepage), or one whose
--     registration is currently open. Deliberately one column with one value
--     rather than a pair of booleans: an event belongs to exactly one bucket,
--     which keeps the /admin control a single dropdown and leaves no
--     "featured AND registration_open" state to reason about.
--
--     Note this is separate from the existing `category` (workshop/seminar/
--     competition/meeting), which describes what kind of event it is, not how
--     the site should surface it.
--
--   * `facebook_url` — the event's Facebook event page, shown as an Fb icon
--     next to Register. Optional; the icon only renders when it's filled,
--     the same rule the header socials and member cards follow.
--
-- Idempotent — safe to re-run.

alter table public.events add column if not exists event_type text not null default 'upcoming';
alter table public.events add column if not exists facebook_url text;

-- Guard the three allowed values at the database, not just in the admin
-- dropdown — the column is written through RLS by any cms_user, and a typo'd
-- value would silently drop the event out of every listing query.
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'events_event_type_check'
  ) then
    alter table public.events add constraint events_event_type_check
      check (event_type in ('upcoming', 'featured', 'registration_open'));
  end if;
end $$;

create index if not exists events_event_type_idx on public.events (event_type, event_date);
