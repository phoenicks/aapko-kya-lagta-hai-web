-- ============================================================================
-- Apokalacta — Supabase schema
-- Run this once in your Supabase project's SQL editor (Dashboard -> SQL Editor
-- -> New query -> paste this whole file -> Run).
-- ============================================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- posts: one row per debate (an image + a bilingual prompt)
-- ---------------------------------------------------------------------------
create table if not exists posts (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  category text not null,
  prompt_en text not null,
  prompt_hi text not null,
  image_url text not null,
  image_source text not null check (image_source in ('unsplash', 'pexels')),
  image_id text,
  image_credit_name text,
  image_credit_url text,
  up_count integer not null default 0,
  down_count integer not null default 0,
  status text not null default 'active' check (status in ('active', 'disabled')),
  created_at timestamptz not null default now()
);

create index if not exists posts_status_created_idx on posts (status, created_at desc);
create index if not exists posts_category_idx on posts (category);
-- Composite index for the infinite-scroll feed's keyset-paginated,
-- category-filtered queries (see lib/posts.js) — keeps those fast as the
-- table grows past what posts_status_created_idx/posts_category_idx cover
-- well on their own for a filtered, cursor-ordered scan.
create index if not exists posts_status_cat_created_idx on posts (status, category, created_at desc, id desc);

-- ---------------------------------------------------------------------------
-- votes: one vote per (post, anonymous session). Re-voting changes the vote.
-- ---------------------------------------------------------------------------
create table if not exists votes (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references posts (id) on delete cascade,
  session_id text not null,
  direction text not null check (direction in ('up', 'down')),
  created_at timestamptz not null default now(),
  unique (post_id, session_id)
);

-- ---------------------------------------------------------------------------
-- comments
-- ---------------------------------------------------------------------------
create table if not exists comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references posts (id) on delete cascade,
  session_id text,
  author_name text not null default 'Anonymous',
  body text not null check (char_length(body) between 1 and 280),
  status text not null default 'visible' check (status in ('visible', 'hidden')),
  created_at timestamptz not null default now()
);

create index if not exists comments_post_idx on comments (post_id, created_at desc);

-- ---------------------------------------------------------------------------
-- sessions: last-seen heartbeat per anonymous visitor, used for the
-- "active users" stat in /admin. Not personal data — just an opaque id
-- stored in a first-party cookie.
-- ---------------------------------------------------------------------------
create table if not exists sessions (
  session_id text primary key,
  first_seen timestamptz not null default now(),
  last_seen timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- cast_vote: atomically insert-or-change a vote and keep posts.up_count /
-- down_count correct, even if the same session votes again or flips their
-- vote. Called from /api/vote via supabase.rpc('cast_vote', ...).
-- ---------------------------------------------------------------------------
create or replace function cast_vote(p_post_id uuid, p_session_id text, p_direction text)
returns table (up_count integer, down_count integer) as $$
declare
  existing_direction text;
begin
  select direction into existing_direction
  from votes
  where post_id = p_post_id and session_id = p_session_id;

  if existing_direction is null then
    insert into votes (post_id, session_id, direction)
    values (p_post_id, p_session_id, p_direction);

    if p_direction = 'up' then
      update posts set up_count = up_count + 1 where id = p_post_id;
    else
      update posts set down_count = down_count + 1 where id = p_post_id;
    end if;

  elsif existing_direction <> p_direction then
    update votes set direction = p_direction, created_at = now()
    where post_id = p_post_id and session_id = p_session_id;

    if p_direction = 'up' then
      update posts set up_count = up_count + 1, down_count = greatest(down_count - 1, 0) where id = p_post_id;
    else
      update posts set down_count = down_count + 1, up_count = greatest(up_count - 1, 0) where id = p_post_id;
    end if;
  end if;
  -- if existing_direction = p_direction, it's a no-op (already voted this way)

  return query select posts.up_count, posts.down_count from posts where id = p_post_id;
end;
$$ language plpgsql security definer;

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table posts enable row level security;
alter table votes enable row level security;
alter table comments enable row level security;
alter table sessions enable row level security;

-- Public (anon key) can read only active posts.
create policy "public can read active posts" on posts
  for select using (status = 'active');

-- Public can read visible comments.
create policy "public can read visible comments" on comments
  for select using (status = 'visible');

-- Public can insert their own comment (server route still validates/sanitizes).
create policy "public can insert comments" on comments
  for insert with check (status = 'visible');

-- Votes are written only through the cast_vote() function (security definer),
-- so no direct insert/update policy is needed for the anon role. Uncomment
-- below only if you want to allow direct table access too:
-- create policy "public can insert votes" on votes for insert with check (true);

-- Sessions: allow public upsert of their own heartbeat row.
create policy "public can upsert sessions" on sessions
  for insert with check (true);
create policy "public can update own session" on sessions
  for update using (true);
create policy "public can read sessions" on sessions
  for select using (true);

-- Admin operations (list all posts incl. disabled, toggle status, read all
-- comments, count sessions) go through API routes using the SERVICE ROLE key
-- on the server, which bypasses RLS entirely — never expose that key to the
-- browser.
