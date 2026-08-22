-- ============================================================================
-- Migration 002 — geo capture, user-submitted debates, affiliate product cards
-- Run this once in your Supabase project's SQL editor (Dashboard -> SQL Editor
-- -> New query -> paste this whole file -> Run). Safe to run more than once —
-- every step is idempotent.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. Geo capture — where an anonymous session's first request came from.
-- Populated from Vercel's automatic x-vercel-ip-* headers, so no extra
-- consent prompt or personal data is collected beyond what Vercel already
-- attaches to every request.
-- ---------------------------------------------------------------------------
alter table sessions add column if not exists city text;
alter table sessions add column if not exists region text;
alter table sessions add column if not exists country text;

-- ---------------------------------------------------------------------------
-- 2. User-submitted debates — which anonymous session submitted a post (for
-- the admin moderation queue + a simple per-session rate limit), and a new
-- 'pending' status so a submission isn't publicly visible until an admin
-- approves it.
-- ---------------------------------------------------------------------------
alter table posts add column if not exists submitted_by_session text;

-- Widen the status check constraint to allow 'pending', regardless of what
-- Postgres happened to auto-name the existing constraint.
do $$
declare r record;
begin
  for r in
    select con.conname
    from pg_constraint con
    join pg_class rel on rel.oid = con.conrelid
    join pg_attribute att on att.attrelid = con.conrelid and att.attnum = any(con.conkey)
    where rel.relname = 'posts' and con.contype = 'c' and att.attname = 'status'
  loop
    execute format('alter table posts drop constraint %I', r.conname);
  end loop;
end $$;

alter table posts add constraint posts_status_check
  check (status in ('active', 'disabled', 'pending'));

-- ---------------------------------------------------------------------------
-- 3. Affiliate / product cards (Amazon Associates) — a nullable link that,
-- when set, makes the debate card render a disclosed "Shop it" button.
-- Reuses the same 'user' image_source value as submitted debates, since
-- both are manually-provided images rather than pulled from Unsplash/Pexels.
-- ---------------------------------------------------------------------------
alter table posts add column if not exists affiliate_url text;

do $$
declare r record;
begin
  for r in
    select con.conname
    from pg_constraint con
    join pg_class rel on rel.oid = con.conrelid
    join pg_attribute att on att.attrelid = con.conrelid and att.attnum = any(con.conkey)
    where rel.relname = 'posts' and con.contype = 'c' and att.attname = 'image_source'
  loop
    execute format('alter table posts drop constraint %I', r.conname);
  end loop;
end $$;

alter table posts add constraint posts_image_source_check
  check (image_source in ('unsplash', 'pexels', 'user'));

-- ---------------------------------------------------------------------------
-- No RLS policy changes needed: the public "active posts only" read policy
-- already hides 'pending' rows from anon visitors automatically, and all the
-- new admin/submission routes go through the service-role client, which
-- bypasses RLS the same way the rest of /api/admin already does.
-- ---------------------------------------------------------------------------
