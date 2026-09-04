-- RoboSUST Phase 1 schema: CMS content tables, cms_users, and RLS.
-- Apply in the Supabase SQL editor (Dashboard > SQL Editor > New query), in order.
-- Written by hand (no Supabase CLI linked to the project in the build environment).

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- cms_users — who can access /admin. Extensible: add a row, don't add a role.
-- Each row maps 1:1 to a Supabase Auth user whose email is a synthetic,
-- non-deliverable address (see src/lib/auth) so login/reset never sends mail.
--
-- Created before is_cms_user()/is_cms_admin() below: `language sql` function
-- bodies are validated against the catalog at CREATE time (unlike plpgsql,
-- which only checks syntax), so the table they query has to exist first.
-- ---------------------------------------------------------------------------

create table public.cms_users (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null unique,
  email text not null unique,
  full_name text not null,
  role text not null default 'editor',
  must_change_password boolean not null default true,
  created_at timestamptz not null default now()
);

-- SECURITY DEFINER so RLS policies can check cms_users membership without
-- recursively re-evaluating cms_users' own RLS policies.
create or replace function public.is_cms_user()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (select 1 from public.cms_users where id = auth.uid());
$$;

create or replace function public.is_cms_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (select 1 from public.cms_users where id = auth.uid() and role = 'admin');
$$;

grant execute on function public.is_cms_user() to anon, authenticated;
grant execute on function public.is_cms_admin() to anon, authenticated;

alter table public.cms_users enable row level security;

create policy "cms_users_select_self_or_member" on public.cms_users
  for select to authenticated
  using (public.is_cms_user());

create policy "cms_users_insert_admin_only" on public.cms_users
  for insert to authenticated
  with check (public.is_cms_admin());

create policy "cms_users_update_admin_only" on public.cms_users
  for update to authenticated
  using (public.is_cms_admin())
  with check (public.is_cms_admin());

create policy "cms_users_delete_admin_only" on public.cms_users
  for delete to authenticated
  using (public.is_cms_admin());

-- ---------------------------------------------------------------------------
-- Site shell / config
-- ---------------------------------------------------------------------------

create table public.site_settings (
  id boolean primary key default true check (id),
  site_name text not null default 'RoboSUST',
  tagline text,
  logo_url text,
  favicon_url text,
  social_facebook text,
  social_youtube text,
  social_linkedin text,
  contact_email text,
  contact_phone text,
  contact_address text,
  map_embed_url text,
  recruitment_open boolean not null default false,
  updated_at timestamptz not null default now()
);
insert into public.site_settings (id) values (true);

create table public.navigation_items (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  url text not null,
  group_name text not null check (group_name in ('primary', 'more', 'footer')),
  parent_id uuid references public.navigation_items(id) on delete cascade,
  sort_order int not null default 0,
  visible boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index navigation_items_parent_id_idx on public.navigation_items (parent_id);

create table public.home_sections (
  id uuid primary key default gen_random_uuid(),
  section_key text not null unique,
  heading text,
  subheading text,
  background_image_url text,
  stat_text text,
  cta_text text,
  cta_url text,
  visible boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.seo_metadata (
  id uuid primary key default gen_random_uuid(),
  page_key text not null unique,
  title text,
  description text,
  share_image_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Content
-- ---------------------------------------------------------------------------

create table public.notices (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text,
  link text,
  pinned boolean not null default false,
  expires_at timestamptz,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index notices_expires_at_idx on public.notices (expires_at);

create table public.achievements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  image_url text,
  competition text,
  year int,
  position text,
  team_name text,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index achievements_year_idx on public.achievements (year);

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text,
  body text,
  images text[] not null default '{}',
  status text not null default 'ongoing' check (status in ('ongoing', 'completed', 'upcoming')),
  flagship boolean not null default false,
  category text,
  github_url text,
  demo_url text,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index projects_status_idx on public.projects (status);
create index projects_flagship_idx on public.projects (flagship);

create table public.events (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text,
  image_url text,
  category text check (category in ('workshop', 'seminar', 'competition', 'meeting')),
  event_date timestamptz,
  location text,
  registration_url text,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index events_event_date_idx on public.events (event_date);

create table public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  content text,
  excerpt text,
  image_url text,
  author text,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index blog_posts_published_idx on public.blog_posts (published);

create table public.committee_members (
  id uuid primary key default gen_random_uuid(),
  photo_url text,
  name text not null,
  designation text not null,
  department_session text,
  tier_group text,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.alumni (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  department text,
  batch text,
  photo_url text,
  current_position text,
  linkedin_url text,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.gallery_albums (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  cover_image_url text,
  album_date date,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.gallery_images (
  id uuid primary key default gen_random_uuid(),
  album_id uuid not null references public.gallery_albums(id) on delete cascade,
  image_url text not null,
  caption text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);
create index gallery_images_album_id_idx on public.gallery_images (album_id);

-- AGP has no schema in the SRS at all; frontend-overview.md §6.2 defines it as
-- independently-editable, independently-hideable blocks, so it's modeled as
-- one row per block with freeform jsonb content rather than a rigid table.
create table public.agp_blocks (
  id uuid primary key default gen_random_uuid(),
  block_key text not null unique check (
    block_key in ('hero', 'overview', 'rules', 'schedule', 'past_editions', 'photo_strip', 'registration_cta')
  ),
  content jsonb not null default '{}'::jsonb,
  visible boolean not null default true,
  sort_order int not null default 0,
  updated_at timestamptz not null default now()
);

-- Seed the fixed set of AGP blocks (frontend-overview.md §6.2) so the admin
-- screen has rows to edit immediately — block_key can't be created/deleted
-- from the CMS (see content-types.ts), only content/visible/sort_order.
insert into public.agp_blocks (block_key, sort_order) values
  ('hero', 0),
  ('overview', 1),
  ('rules', 2),
  ('schedule', 3),
  ('past_editions', 4),
  ('photo_strip', 5),
  ('registration_cta', 6);

create table public.forum_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table public.forum_posts (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.forum_categories(id) on delete set null,
  title text not null,
  body text not null,
  author_name text not null,
  author_email text not null,
  created_at timestamptz not null default now()
);
create index forum_posts_category_id_idx on public.forum_posts (category_id);

create table public.forum_replies (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.forum_posts(id) on delete cascade,
  body text not null,
  author_name text not null,
  author_email text not null,
  created_at timestamptz not null default now()
);
create index forum_replies_post_id_idx on public.forum_replies (post_id);

create table public.contact_submissions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  department text,
  batch text,
  area_of_interest text,
  message text,
  resolved boolean not null default false,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- updated_at triggers
-- ---------------------------------------------------------------------------

do $$
declare
  t text;
begin
  for t in
    select unnest(array[
      'site_settings', 'navigation_items', 'home_sections', 'seo_metadata',
      'notices', 'achievements', 'projects', 'events', 'blog_posts',
      'committee_members', 'alumni', 'gallery_albums', 'agp_blocks'
    ])
  loop
    execute format(
      'create trigger set_updated_at before update on public.%I for each row execute function public.set_updated_at();',
      t
    );
  end loop;
end;
$$;

-- ---------------------------------------------------------------------------
-- RLS — public read (filtered where a draft/expiry concept exists),
-- cms_users-only write. No per-type permission split yet by design.
-- ---------------------------------------------------------------------------

alter table public.site_settings enable row level security;
alter table public.navigation_items enable row level security;
alter table public.home_sections enable row level security;
alter table public.seo_metadata enable row level security;
alter table public.notices enable row level security;
alter table public.achievements enable row level security;
alter table public.projects enable row level security;
alter table public.events enable row level security;
alter table public.blog_posts enable row level security;
alter table public.committee_members enable row level security;
alter table public.alumni enable row level security;
alter table public.gallery_albums enable row level security;
alter table public.gallery_images enable row level security;
alter table public.agp_blocks enable row level security;
alter table public.forum_categories enable row level security;
alter table public.forum_posts enable row level security;
alter table public.forum_replies enable row level security;
alter table public.contact_submissions enable row level security;

-- Fully-public-read content (no draft/expiry concept): select for everyone,
-- write for cms_users only.
do $$
declare
  t text;
begin
  for t in
    select unnest(array[
      'site_settings', 'navigation_items', 'home_sections', 'seo_metadata',
      'achievements', 'projects', 'events', 'committee_members', 'alumni',
      'gallery_albums', 'gallery_images', 'agp_blocks', 'forum_categories'
    ])
  loop
    execute format('create policy "%1$s_public_select" on public.%1$s for select using (true);', t);
    execute format('create policy "%1$s_cms_write_insert" on public.%1$s for insert to authenticated with check (public.is_cms_user());', t);
    execute format('create policy "%1$s_cms_write_update" on public.%1$s for update to authenticated using (public.is_cms_user()) with check (public.is_cms_user());', t);
    execute format('create policy "%1$s_cms_write_delete" on public.%1$s for delete to authenticated using (public.is_cms_user());', t);
  end loop;
end;
$$;

-- notices: public sees only pinned/non-expired; cms_users see everything.
-- One combined SELECT policy, not two overlapping ones — Postgres evaluates
-- every permissive policy that applies to a role, so two policies covering
-- the same role/action is pure overhead (flagged by the performance advisor).
create policy "notices_select" on public.notices
  for select
  using (public.is_cms_user() or expires_at is null or expires_at > now());
create policy "notices_cms_write_insert" on public.notices
  for insert to authenticated with check (public.is_cms_user());
create policy "notices_cms_write_update" on public.notices
  for update to authenticated using (public.is_cms_user()) with check (public.is_cms_user());
create policy "notices_cms_write_delete" on public.notices
  for delete to authenticated using (public.is_cms_user());

-- blog_posts: public sees only published; cms_users see everything (drafts too).
create policy "blog_posts_select" on public.blog_posts
  for select
  using (public.is_cms_user() or published = true);
create policy "blog_posts_cms_write_insert" on public.blog_posts
  for insert to authenticated with check (public.is_cms_user());
create policy "blog_posts_cms_write_update" on public.blog_posts
  for update to authenticated using (public.is_cms_user()) with check (public.is_cms_user());
create policy "blog_posts_cms_write_delete" on public.blog_posts
  for delete to authenticated using (public.is_cms_user());

-- forum_posts / forum_replies: anonymous posting is a stated (flagged) requirement
-- carried over from the current site — public can read and create, only
-- cms_users can moderate (update/delete).
create policy "forum_posts_public_select" on public.forum_posts for select using (true);
create policy "forum_posts_public_insert" on public.forum_posts for insert with check (true);
create policy "forum_posts_cms_update" on public.forum_posts for update to authenticated using (public.is_cms_user()) with check (public.is_cms_user());
create policy "forum_posts_cms_delete" on public.forum_posts for delete to authenticated using (public.is_cms_user());

create policy "forum_replies_public_select" on public.forum_replies for select using (true);
create policy "forum_replies_public_insert" on public.forum_replies for insert with check (true);
create policy "forum_replies_cms_update" on public.forum_replies for update to authenticated using (public.is_cms_user()) with check (public.is_cms_user());
create policy "forum_replies_cms_delete" on public.forum_replies for delete to authenticated using (public.is_cms_user());

-- contact_submissions: public can submit (insert-only), only cms_users can read/manage.
create policy "contact_submissions_public_insert" on public.contact_submissions
  for insert with check (true);
create policy "contact_submissions_cms_select" on public.contact_submissions
  for select to authenticated using (public.is_cms_user());
create policy "contact_submissions_cms_update" on public.contact_submissions
  for update to authenticated using (public.is_cms_user()) with check (public.is_cms_user());
create policy "contact_submissions_cms_delete" on public.contact_submissions
  for delete to authenticated using (public.is_cms_user());
