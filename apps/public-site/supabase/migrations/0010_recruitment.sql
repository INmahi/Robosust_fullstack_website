-- Recruitment status, editable from /admin, driving the Join Us page. Until now
-- that page hardcoded "closed" and a date in the component, so announcing an
-- intake meant a developer and a deploy.
--
-- A singleton (id = true, the same shape as site_settings) rather than a
-- home_sections row: the state is a status plus two dates plus a link, and
-- home_sections has no columns for any of that. Bending it to fit would mean
-- adding date columns to a table every other section shares.
--
-- Two date fields because the one an editor fills depends on the status:
--   running       → closes_on is the application deadline
--   opening_soon  → opens_on is when applications start
--   closed        → opens_on is the next possible intake
-- Both are nullable: "opening soon, date to be confirmed" is a real state, and
-- the page renders without a date rather than hiding the status.

create table if not exists public.recruitment (
  id boolean primary key default true check (id),
  status text not null default 'closed',
  closes_on date,
  opens_on date,
  registration_url text,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Constrained in the database, not just the admin dropdown: the column is
-- written through RLS, and an unrecognised status would fall through the page's
-- switch and render nothing at all.
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'recruitment_status_check') then
    alter table public.recruitment add constraint recruitment_status_check
      check (status in ('running', 'opening_soon', 'closed'));
  end if;
end $$;

drop trigger if exists set_updated_at on public.recruitment;
create trigger set_updated_at before update on public.recruitment
  for each row execute function public.set_updated_at();

alter table public.recruitment enable row level security;

drop policy if exists "recruitment_public_select" on public.recruitment;
create policy "recruitment_public_select" on public.recruitment for select using (true);

drop policy if exists "recruitment_cms_write_update" on public.recruitment;
create policy "recruitment_cms_write_update" on public.recruitment
  for update to authenticated using (public.is_cms_user()) with check (public.is_cms_user());

drop policy if exists "recruitment_cms_write_insert" on public.recruitment;
create policy "recruitment_cms_write_insert" on public.recruitment
  for insert to authenticated with check (public.is_cms_user());

-- The one row. No delete policy: there is nothing to delete, and losing it
-- would leave the Join Us page with no status to render.
insert into public.recruitment (id, status, opens_on)
values (true, 'closed', date '2027-03-01')
on conflict (id) do nothing;
