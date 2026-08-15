// Image sourcing: Unsplash first (better quality/relevance for a search
// query), falling back to Pexels if Unsplash errors or rate-limits.
// Both are royalty-free for this kind of use. Unsplash's API terms require
// specific attribution + a "download" ping when a photo is used in
// production — see help.unsplash.com "API Guidelines". Both are implemented
// below; don't remove them if you swap providers in and out.

const SITE_NAME = "aapkokyalagtahai";

async function fetchUnsplash(query) {
  const key = process.env.UNSPLASH_ACCESS_KEY;
  if (!key) return null;

  const url = `https://api.unsplash.com/photos/random?query=${encodeURIComponent(
    query
  )}&content_filter=high&orientation=portrait`;

  const res = await fetch(url, {
    headers: { Authorization: `Client-ID ${key}` },
    cache: "no-store",
  });
  if (!res.ok) return null;
  const data = await res.json();
  if (!data || !data.urls) return null;

  return {
    source: "unsplash",
    id: data.id,
    // Per Unsplash guidelines, always use the hotlinked photo.urls values —
    // never re-host or download-and-serve the raw file yourself.
    url: data.urls.regular,
    creditName: data.user?.name || "Unknown photographer",
    creditUrl: data.user?.links?.html
      ? `${data.user.links.html}?utm_source=${SITE_NAME}&utm_medium=referral`
      : null,
    downloadLocation: data.links?.download_location || null,
  };
}

async function fetchPexels(query) {
  const key = process.env.PEXELS_API_KEY;
  if (!key) return null;

  const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(
    query
  )}&per_page=15&orientation=portrait`;

  const res = await fetch(url, {
    headers: { Authorization: key },
    cache: "no-store",
  });
  if (!res.ok) return null;
  const data = await res.json();
  const photos = data?.photos || [];
  if (!photos.length) return null;

  const pick = photos[Math.floor(Math.random() * photos.length)];
  return {
    source: "pexels",
    id: String(pick.id),
    url: pick.src?.large2x || pick.src?.large || pick.src?.original,
    creditName: pick.photographer || "Unknown photographer",
    creditUrl: pick.photographer_url || pick.url || null,
    downloadLocation: null,
  };
}

// Per Unsplash API guidelines: call this once when a photo is actually used
// (i.e. published as a post), not on every page view.
export async function triggerUnsplashDownload(downloadLocation) {
  const key = process.env.UNSPLASH_ACCESS_KEY;
  if (!downloadLocation || !key) return;
  try {
    await fetch(`${downloadLocation}&client_id=${key}`, { cache: "no-store" });
  } catch {
    // Non-fatal — attribution ping failing shouldn't block publishing.
  }
}

export async function fetchImageForQuery(query) {
  try {
    const fromUnsplash = await fetchUnsplash(query);
    if (fromUnsplash) return fromUnsplash;
  } catch {
    // fall through to Pexels
  }
  try {
    const fromPexels = await fetchPexels(query);
    if (fromPexels) return fromPexels;
  } catch {
    // both failed
  }
  return null;
}
