-- A fourth event_type bucket: `past`.
--
-- The point of the bucket is that it is *not* date arithmetic. An event can be
-- over before its own date (cancelled, rescheduled away, or simply never given
-- a date), and the listing queries filter on event_date, so without an explicit
-- bucket an editor had no way to take a finished event out of "upcoming"
-- without deleting it or faking the date. Tagging it `past` is that way.
--
-- The constraint is replaced rather than added to: it already exists from 0006,
-- so `if not exists` would skip a re-run and quietly leave 'past' rejected.
alter table public.events drop constraint if exists events_event_type_check;
alter table public.events add constraint events_event_type_check
  check (event_type in ('upcoming', 'featured', 'registration_open', 'past'));
