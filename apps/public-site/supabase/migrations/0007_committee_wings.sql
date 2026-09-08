-- The Meet the Team page (design: Stitch "Meet the Team - Robotics Innovation
-- Lab") groups members into ordered wings, each rendered as a head row with an
-- assistants row beneath it. The requirement that drove the shape of this:
-- when next year's committee has, say, three assistant R&D secretaries instead
-- of two, an editor adds a member in /admin and a card appears — no code change.
--
-- Hence a real wings table rather than columns on committee_members: an editor
-- can create a wing that doesn't exist yet, reorder wings, and retitle them,
-- none of which is possible when the list of wings lives in a code registry.
--
-- committee_members.tier_group is left in place untouched — getCommitteeMembersByTier()
-- still uses it, and dropping a column to replace it in the same migration
-- would break that read path for no gain.

create table if not exists public.committee_wings (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  subtitle text,
  sort_order int not null default 0,
  visible boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists committee_wings_sort_idx on public.committee_wings (sort_order);

drop trigger if exists set_updated_at on public.committee_wings;
create trigger set_updated_at before update on public.committee_wings
  for each row execute function public.set_updated_at();

-- on delete set null, not cascade: deleting a wing must never silently delete
-- the people in it. They fall out of the page and can be reassigned.
alter table public.committee_members
  add column if not exists wing_id uuid references public.committee_wings(id) on delete set null;

alter table public.committee_members
  add column if not exists role_level text not null default 'head';

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'committee_members_role_level_check') then
    alter table public.committee_members add constraint committee_members_role_level_check
      check (role_level in ('head', 'assistant'));
  end if;
end $$;

create index if not exists committee_members_wing_idx
  on public.committee_members (wing_id, role_level, sort_order);

alter table public.committee_wings enable row level security;

drop policy if exists "committee_wings_public_select" on public.committee_wings;
create policy "committee_wings_public_select" on public.committee_wings
  for select using (true);

drop policy if exists "committee_wings_cms_write_insert" on public.committee_wings;
create policy "committee_wings_cms_write_insert" on public.committee_wings
  for insert to authenticated with check (public.is_cms_user());

drop policy if exists "committee_wings_cms_write_update" on public.committee_wings;
create policy "committee_wings_cms_write_update" on public.committee_wings
  for update to authenticated using (public.is_cms_user()) with check (public.is_cms_user());

drop policy if exists "committee_wings_cms_write_delete" on public.committee_wings;
create policy "committee_wings_cms_write_delete" on public.committee_wings
  for delete to authenticated using (public.is_cms_user());

-- Seeded from the design's own section dividers, so the page has a working
-- structure to fill rather than opening empty. Wings are editable content:
-- rename, reorder, add and delete them freely.
insert into public.committee_wings (name, subtitle, sort_order)
select v.name, v.subtitle, v.sort_order
from (values
  ('Top Executive Leadership', 'Presidential command and central technological direction', 0),
  ('Vice Presidents', 'Strategic delegation and cross-wing synchronisation', 1),
  ('General Secretariat', 'General administration, joint operations and governance', 2),
  ('Treasury', 'Capital allocation and financial stewardship', 3),
  ('Research & Development', 'Kinodynamics, perception pipelines and autonomy', 4),
  ('Project & Planning', 'Roadmaps, milestones and delivery', 5),
  ('Operations', 'Logistics, laboratory operations and readiness', 6),
  ('Organising', 'Events, competitions and community programmes', 7),
  ('IT', 'Systems, infrastructure and digital platforms', 8),
  ('Workshop', 'Fabrication, tooling and hands-on training', 9),
  ('Content', 'Media, documentation and the RoboSUST voice', 10)
) as v(name, subtitle, sort_order)
where not exists (select 1 from public.committee_wings w where w.name = v.name);
