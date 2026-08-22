import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { getOrCreateSessionId } from "@/lib/session";
import { findCategory } from "@/lib/categories";
import { makeSlug } from "@/lib/slug";

// Free, no-paywall user submissions — every debate lands as status:'pending'
// (invisible to the public feed, same RLS policy that already hides
// 'disabled' posts) until an admin approves it from the new "Pending
// submissions" section of /admin. This is the fix for the site's original
// content-repetition problem (24 hardcoded prompts total) as much as it's a
// feature: it turns the prompt bank from fixed to crowdsourced.
const MAX_PENDING_PER_SESSION = 3;
const MAX_PROMPT_LEN = 140;

// This route makes a server-side request to a URL an anonymous, unauthenticated
// caller supplies — a classic SSRF shape — so reject anything that isn't
// plainly a public https host before ever fetching it. Not exhaustive (DNS
// rebinding, redirects to internal hosts, IPv6 literals aren't covered) but
// it closes the obvious targets (loopback, link-local/cloud-metadata,
// private ranges) for very little code.
function isSafeImageHost(urlString) {
  let u;
  try {
    u = new URL(urlString);
  } catch {
    return false;
  }
  if (u.protocol !== "https:") return false;
  const host = u.hostname.toLowerCase();
  if (host === "localhost" || host.endsWith(".local")) return false;

  const ipMatch = host.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (ipMatch) {
    const [a, b] = ipMatch.slice(1, 3).map(Number);
    const isPrivate =
      a === 127 || // loopback
      a === 0 ||
      (a === 169 && b === 254) || // link-local / cloud metadata (169.254.169.254)
      (a === 10) ||
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168);
    if (isPrivate) return false;
  }
  return true;
}

async function looksLikeImage(url) {
  if (!isSafeImageHost(url)) return false;
  try {
    const res = await fetch(url, { method: "HEAD", signal: AbortSignal.timeout(5000), redirect: "error" });
    const type = res.headers.get("content-type") || "";
    return res.ok && type.startsWith("image/");
  } catch {
    return false;
  }
}

export async function POST(request) {
  const body = await request.json().catch(() => null);
  const promptEn = (body?.promptEn || "").toString().trim();
  const promptHiRaw = (body?.promptHi || "").toString().trim();
  const categoryId = (body?.category || "").toString().trim();
  const imageUrl = (body?.imageUrl || "").toString().trim();

  if (!promptEn) {
    return NextResponse.json({ error: "A debate prompt is required" }, { status: 400 });
  }
  if (promptEn.length > MAX_PROMPT_LEN) {
    return NextResponse.json(
      { error: `Keep the prompt under ${MAX_PROMPT_LEN} characters` },
      { status: 400 }
    );
  }
  if (promptHiRaw.length > MAX_PROMPT_LEN) {
    return NextResponse.json(
      { error: `Keep the Hindi prompt under ${MAX_PROMPT_LEN} characters` },
      { status: 400 }
    );
  }

  const category = findCategory(categoryId);
  if (!category) {
    return NextResponse.json({ error: "Pick a valid category" }, { status: 400 });
  }

  if (!imageUrl || !/^https:\/\//i.test(imageUrl)) {
    return NextResponse.json(
      { error: "A valid image URL (starting with https://) is required" },
      { status: 400 }
    );
  }

  const isImage = await looksLikeImage(imageUrl);
  if (!isImage) {
    return NextResponse.json(
      { error: "That link doesn't load a direct image — make sure it points straight at a .jpg/.png/.webp, not a webpage" },
      { status: 400 }
    );
  }

  const { sessionId } = getOrCreateSessionId();
  const admin = getSupabaseAdmin();

  const { count, error: countError } = await admin
    .from("posts")
    .select("id", { count: "exact", head: true })
    .eq("submitted_by_session", sessionId)
    .eq("status", "pending");

  if (countError) return NextResponse.json({ error: countError.message }, { status: 500 });

  if ((count || 0) >= MAX_PENDING_PER_SESSION) {
    return NextResponse.json(
      { error: "You already have a few debates waiting for review — wait for those to be approved first" },
      { status: 429 }
    );
  }

  const { data, error } = await admin
    .from("posts")
    .insert({
      slug: makeSlug(categoryId),
      category: categoryId,
      prompt_en: promptEn,
      // Hindi is optional in the form — falling back to the English text
      // keeps prompt_hi's NOT NULL constraint satisfied without forcing
      // every submitter to write both languages.
      prompt_hi: promptHiRaw || promptEn,
      image_url: imageUrl,
      image_source: "user",
      status: "pending",
      submitted_by_session: sessionId,
    })
    .select("id, slug")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, id: data.id });
}
