import { getSupabaseAdmin } from "./supabaseAdmin";
import { CATEGORIES } from "./categories";
import { fetchImageForQuery, triggerUnsplashDownload } from "./images";
import { makeSlug } from "./slug";

// Shared by /api/cron/daily-fetch (automatic, once a day via Vercel Cron)
// and /api/admin/trigger-fetch (manual "fetch now" button in /admin).
export async function publishDailyPosts() {
  const perCategory = Math.max(
    1,
    parseInt(process.env.DAILY_POSTS_PER_CATEGORY || "2", 10)
  );
  const admin = getSupabaseAdmin();

  const results = [];

  for (const category of CATEGORIES) {
    for (let i = 0; i < perCategory; i++) {
      try {
        const image = await fetchImageForQuery(category.query);
        if (!image) {
          results.push({ category: category.id, ok: false, error: "no image found" });
          continue;
        }

        const prompt =
          category.prompts[Math.floor(Math.random() * category.prompts.length)];

        const { error } = await admin.from("posts").insert({
          slug: makeSlug(category.id),
          category: category.id,
          prompt_en: prompt.en,
          prompt_hi: prompt.hi,
          image_url: image.url,
          image_source: image.source,
          image_id: image.id,
          image_credit_name: image.creditName,
          image_credit_url: image.creditUrl,
          status: "active",
        });

        if (error) {
          results.push({ category: category.id, ok: false, error: error.message });
          continue;
        }

        if (image.source === "unsplash" && image.downloadLocation) {
          await triggerUnsplashDownload(image.downloadLocation);
        }

        results.push({ category: category.id, ok: true, source: image.source });
      } catch (err) {
        results.push({ category: category.id, ok: false, error: String(err) });
      }
    }
  }

  return {
    inserted: results.filter((r) => r.ok).length,
    failed: results.filter((r) => !r.ok).length,
    details: results,
  };
}
