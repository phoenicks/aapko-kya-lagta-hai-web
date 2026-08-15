# Aapko Kya Lagta Hai — setup guide

This is a full Next.js website: a daily-refreshing image feed where people vote 👍/👎
and comment, an SEO-friendly permalink page per debate, and a password-protected
`/admin` dashboard. It needs two free accounts (Supabase + Vercel) and two free
API keys (Unsplash + Pexels) before it can go live. None of these cost anything
at this scale.

Budget about 30–45 minutes the first time.

## 1. Create a Supabase project (the database)

1. Go to supabase.com, sign up free, and create a new project. Pick any name/region;
   save the database password it gives you somewhere safe (you likely won't need it again).
2. Once the project is ready, open **SQL Editor** in the left sidebar → **New query**.
3. Open `supabase/schema.sql` from this project, copy the whole file, paste it into
   the SQL editor, and click **Run**. This creates the `posts`, `votes`, `comments`,
   and `sessions` tables plus the security rules.
4. Go to **Project Settings → API**. You'll need three values from this page in step 4:
   - **Project URL** → this is `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → this is `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → this is `SUPABASE_SERVICE_ROLE_KEY` (keep this one secret —
     it has full database access and must never be shown in the browser)

## 2. Get free image API keys

**Unsplash** (primary image source):
1. Go to unsplash.com/developers → **Register as a developer** → **New Application**.
2. Accept the API terms, name it something like "Aapko Kya Lagta Hai".
3. Copy the **Access Key** → this is `UNSPLASH_ACCESS_KEY`.
4. The free tier allows 50 requests/hour, which comfortably covers a daily fetch.

**Pexels** (automatic fallback if Unsplash is briefly unavailable):
1. Go to pexels.com/api → sign up free → copy your API key.
2. This is `PEXELS_API_KEY`.

## 3. Two random secrets (already generated for you)

These protect the daily cron job and sign the admin login cookie — you don't
need to generate them yourself, just paste these into Vercel in step 4:

```
CRON_SECRET=2e32ecf7940ea6383ac44f4e6a2c1b8b977aa20186df156f
ADMIN_SECRET=a83945789cf3acffd40ae14b22065e028a09dc926e3025050a7e81fd71765a4c
```

Also pick a real password for `ADMIN_PASSWORD` — this is what you'll type to log
into `/admin`. Pick something only you know; it doesn't need to follow any
particular format.

## 4. Deploy to Vercel

1. Push this project to a GitHub repo (or ask me to help with that).
2. Go to vercel.com, sign up free, **Add New → Project**, import the repo.
3. Before clicking Deploy, add these Environment Variables (Settings → Environment
   Variables, or during the import screen):

   | Key | Value |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | from Supabase step 1.4 |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | from Supabase step 1.4 |
   | `SUPABASE_SERVICE_ROLE_KEY` | from Supabase step 1.4 |
   | `UNSPLASH_ACCESS_KEY` | from step 2 |
   | `PEXELS_API_KEY` | from step 2 |
   | `DAILY_POSTS_PER_CATEGORY` | `2` (or however many new debates per category per day) |
   | `CRON_SECRET` | from step 3 |
   | `ADMIN_PASSWORD` | your chosen password |
   | `ADMIN_SECRET` | from step 3 |
   | `NEXT_PUBLIC_SITE_URL` | `https://aapkokyalagtahai.com` (or your Vercel URL if the domain isn't connected yet) |

4. Click **Deploy**. Vercel automatically reads `vercel.json` and schedules the
   daily image-fetch job for 3:00 AM UTC (~8:30 AM IST) — no extra setup needed.
   (Vercel's free "Hobby" plan allows cron jobs that run once a day, which is
   exactly what this needs.)

## 5. Connect aapkokyalagtahai.com

In Vercel: **Project → Settings → Domains → Add** → enter `aapkokyalagtahai.com` and
`www.aapkokyalagtahai.com`. Vercel will show you 1–2 DNS records (usually an A record
and a CNAME) to add at wherever you registered the domain. This can take a few
minutes to a few hours to propagate.

## 6. Populate the first batch of images

The cron job runs automatically every day, but the site will look empty until
the first run. To seed it immediately:
1. Visit `https://your-site.com/admin`, log in with `ADMIN_PASSWORD`.
2. Click **"Fetch new images now"**. This pulls fresh images for every category
   right away (same logic the daily cron uses) — you should see debates appear
   within a few seconds.

## What you get out of the box

- **Home page** (`/`): a swipeable/tappable vote feed plus a crawlable grid of
  recent debates below it (good for SEO and for people who'd rather click than swipe).
- **`/debate/[slug]`**: a permanent, shareable page per debate with Open Graph
  tags (so WhatsApp/X/etc. show the image + question when shared), structured
  data for search engines, and the comment thread.
- **`/category/[cat]`**: one page per category (Street Art, Fashion, Home & Décor,
  Food, Digital Art, Everyday Life) — edit the list in `lib/categories.js`.
- **`/admin`**: active users (last 24h), total posts/votes/comments, a table of
  every post with an enable/disable toggle, and a manual "fetch new images now" button.
- **`/sitemap.xml`** and **`/robots.txt`**: generated automatically from whatever's
  in the database, so new debates get discovered by search engines without any
  manual step.
- Bilingual EN/हिं toggle, light/dark mode, and a downloadable "share card" image
  for each vote result (the kind of thing that's easy to forward on WhatsApp).

## Editing the content bank

`lib/categories.js` holds the six categories, each with an image search query and
a rotating list of bilingual debate prompts. Add, remove, or rewrite these any
time — no redeploy of the database needed, just a normal code change + git push
(Vercel redeploys automatically).

## Costs at this scale

Everything above fits inside Supabase's free tier (500MB database, 50k monthly
active users) and Vercel's free Hobby tier, as long as traffic stays modest.
Unsplash/Pexels are free for this volume of daily requests. The only recurring
cost is your domain renewal. If Aapko Kya Lagta Hai takes off and you outgrow
the free tiers, that's a good problem — come back and we'll talk about scaling up.

## What's not built yet (roadmap)

- User-submitted images (currently all images are sourced automatically from
  Unsplash/Pexels — no upload flow yet).
- Native iOS/Android apps (this is the website; the plan discussed was to
  validate here first, then wrap it as a PWA/native app).
- Sponsored/branded debates (the monetization idea we discussed).

Ping me when you're ready for any of these and I'll build on top of what's here.
