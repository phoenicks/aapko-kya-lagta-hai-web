import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminAuth";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { findCategory } from "@/lib/categories";

export async function GET() {
  if (!requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admin = getSupabaseAdmin();
  const { data, error } = await admin
    .from("posts")
    .select(
      "id, slug, category, prompt_en, prompt_hi, image_url, status, up_count, down_count, created_at, submitted_by_session, affiliate_url"
    )
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ posts: data });
}

// Handles both the simple Enable/Disable toggle (just `{id, status}`) and
// the full edit form (any of prompt/category/image/affiliate fields
// alongside id) — same endpoint, since both are "change some columns on
// one post." Every field is optional except id; only the fields actually
// present in the body get validated and written.
export async function PATCH(request) {
  if (!requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const id = body?.id;
  if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

  const update = {};

  if (body.status !== undefined) {
    if (body.status !== "active" && body.status !== "disabled") {
      return NextResponse.json({ error: "status must be 'active' or 'disabled'" }, { status: 400 });
    }
    update.status = body.status;
  }

  if (body.promptEn !== undefined) {
    const v = body.promptEn.toString().trim();
    if (!v) return NextResponse.json({ error: "Prompt (English) can't be empty" }, { status: 400 });
    update.prompt_en = v;
  }

  if (body.promptHi !== undefined) {
    const v = body.promptHi.toString().trim();
    if (!v) return NextResponse.json({ error: "Prompt (Hindi) can't be empty" }, { status: 400 });
    update.prompt_hi = v;
  }

  if (body.category !== undefined) {
    if (!findCategory(body.category)) {
      return NextResponse.json({ error: "Pick a valid category" }, { status: 400 });
    }
    update.category = body.category;
  }

  if (body.imageUrl !== undefined) {
    const v = body.imageUrl.toString().trim();
    if (!/^https:\/\//i.test(v)) {
      return NextResponse.json({ error: "Image URL must start with https://" }, { status: 400 });
    }
    update.image_url = v;
  }

  if (body.affiliateUrl !== undefined) {
    const v = body.affiliateUrl.toString().trim();
    // Empty string is allowed here — that's how an edit clears an existing
    // affiliate link back off a post.
    if (v && !/^https:\/\/(www\.)?(amazon\.[a-z.]+|amzn\.to|amzn\.in)\//i.test(v)) {
      return NextResponse.json(
        { error: "That doesn't look like an amazon.*, amzn.to, or amzn.in Associates link" },
        { status: 400 }
      );
    }
    update.affiliate_url = v || null;
  }

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  }

  const admin = getSupabaseAdmin();
  const { data, error } = await admin
    .from("posts")
    .update(update)
    .eq("id", id)
    .select("id, status")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Any of these fields can change what's already live on the public site —
  // without this, a fix (or a disable) would sit invisible until the
  // 5-minute ISR cache happened to expire on its own.
  revalidatePath("/", "layout");

  return NextResponse.json({ post: data });
}

export async function DELETE(request) {
  if (!requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const id = request.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

  const admin = getSupabaseAdmin();
  // Cascades to that post's votes and comments too (see the foreign keys in
  // supabase/schema.sql) — permanent, which is why the dashboard confirms
  // before calling this.
  const { error } = await admin.from("posts").delete().eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  revalidatePath("/", "layout");

  return NextResponse.json({ ok: true });
}
