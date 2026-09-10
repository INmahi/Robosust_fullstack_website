-- The homepage About section becomes: main image + three counters, with a
-- photo slider beneath it. /about reuses the same slider as its hero and the
-- same counters further down, so both live in the CMS once and are read twice.

-- ---------------------------------------------------------------------------
-- Counters
-- ---------------------------------------------------------------------------
-- Counters ride on home_section_items (attached to the 'about' section) rather
-- than a new table: they are exactly what that table already models — ordered,
-- repeatable cards belonging to a section — and reusing it means the existing
-- Section Cards admin screen covers them with no new page.
--
-- count_to is a real integer, separate from the existing free-text `value`,
-- because the number has to be animated from zero. Parsing "200+" back into a
-- number would work until the day an editor types "200 +" or "2k". `value` is
-- left alone for the Achievements metric cards that still use it.
alter table public.home_section_items
  add column if not exists count_to int,
  add column if not exists value_suffix text;

comment on column public.home_section_items.count_to is
  'Counter target. Set this and the card animates 0 -> count_to on scroll. Null = not a counter.';
comment on column public.home_section_items.value_suffix is
  'Rendered immediately after count_to, e.g. "+" or "%".';

-- ---------------------------------------------------------------------------
-- Slider
-- ---------------------------------------------------------------------------
create table if not exists public.about_slides (
  id uuid primary key default gen_random_uuid(),
  image_url text not null,
  caption text,
  -- Which slide opens in the centre, at full size. A boolean with a trigger
  -- rather than a unique index: an editor picking a second "main" photo should
  -- move the flag the way a radio button does, not fail with a constraint
  -- error. See about_slides_single_focal below.
  is_focal boolean not null default false,
  visible boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists about_slides_sort_order_idx
  on public.about_slides (sort_order);

-- At most one focal slide, enforced in the database so it holds no matter what
-- writes the row. The inner UPDATE re-fires this trigger, but with is_focal
-- false, so the WHEN clause stops it recursing.
create or replace function public.about_slides_single_focal()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.about_slides
    set is_focal = false
    where is_focal and id <> new.id;
  return new;
end;
$$;

drop trigger if exists about_slides_single_focal on public.about_slides;
create trigger about_slides_single_focal
  before insert or update of is_focal on public.about_slides
  for each row
  when (new.is_focal)
  execute function public.about_slides_single_focal();

alter table public.about_slides enable row level security;

-- Hidden slides stay visible to editors, the same rule notices and blog_posts
-- use, so a slide can be parked without deleting it.
create policy "about_slides_select" on public.about_slides
  for select using (public.is_cms_user() or visible = true);
create policy "about_slides_cms_write_insert" on public.about_slides
  for insert to authenticated with check (public.is_cms_user());
create policy "about_slides_cms_write_update" on public.about_slides
  for update to authenticated using (public.is_cms_user()) with check (public.is_cms_user());
create policy "about_slides_cms_write_delete" on public.about_slides
  for delete to authenticated using (public.is_cms_user());

-- ---------------------------------------------------------------------------
-- Seed the three counters from the design
-- ---------------------------------------------------------------------------
-- Guarded on the card not already existing, so a re-run never overwrites an
-- edit or resurrects a counter someone deliberately removed — the same rule
-- 0008's roster seed follows.
do $$
declare
  about_id uuid;
begin
  select id into about_id from public.home_sections where section_key = 'about';
  if about_id is null then
    return;
  end if;

  insert into public.home_section_items (section_id, label, count_to, value_suffix, icon, sort_order)
  select about_id, v.label, v.count_to, '+', v.icon, v.sort_order
  from (values
    ('Projects',  20,  'rocket', 0),
    ('Members',   200, 'users',  1),
    ('Workshops', 20,  'wrench', 2)
  ) as v(label, count_to, icon, sort_order)
  where not exists (
    select 1 from public.home_section_items existing
    where existing.section_id = about_id and existing.label = v.label
  );
end;
$$;
