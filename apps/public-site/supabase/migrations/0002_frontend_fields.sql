-- Additions needed to match the reference frontend (synapse6/robosust_frontend)
-- design, per IMPLEMENTATION_PLAN.md §3.

alter table public.home_sections
  add column eyebrow text,
  add column body text,
  add column secondary_image_url text,
  add column secondary_cta_text text,
  add column secondary_cta_url text;

-- Repeatable child rows: About's 3 stats ("01 Think"/"02 Build"/"03 Compete"),
-- Achievements' 2 metrics ("12+"/"24/7"). One generic table rather than a
-- separate one per section, since the shape (value/label/body/image, ordered)
-- is identical both times.
create table public.home_section_items (
  id uuid primary key default gen_random_uuid(),
  section_id uuid not null references public.home_sections(id) on delete cascade,
  value text,
  label text,
  body text,
  image_url text,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index home_section_items_section_id_idx on public.home_section_items (section_id);

create trigger set_updated_at before update on public.home_section_items
  for each row execute function public.set_updated_at();

alter table public.projects add column cover_image_url text;
alter table public.blog_posts add column category text;

alter table public.site_settings
  add column social_instagram text,
  add column social_github text,
  add column footer_note text,
  add column background_image_url text;

alter table public.home_section_items enable row level security;
create policy "home_section_items_public_select" on public.home_section_items
  for select using (true);
create policy "home_section_items_cms_write_insert" on public.home_section_items
  for insert to authenticated with check (public.is_cms_user());
create policy "home_section_items_cms_write_update" on public.home_section_items
  for update to authenticated using (public.is_cms_user()) with check (public.is_cms_user());
create policy "home_section_items_cms_write_delete" on public.home_section_items
  for delete to authenticated using (public.is_cms_user());
