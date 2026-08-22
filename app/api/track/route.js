import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import { getOrCreateSessionId } from "@/lib/session";

// Called once per page load (see components/SessionBeacon.js) purely to
// keep a "last_seen" heartbeat for the anonymous session cookie, so the
// admin dashboard can show a rough "active users in the last 24h" number.
export async function POST(request) {
  const { sessionId, isNew } = getOrCreateSessionId();

  const payload = { session_id: sessionId, last_seen: new Date().toISOString() };

  // Only stamp geo on the very first heartbeat for a session — it's meant
  // to answer "where did this visitor first show up from," not to be
  // overwritten on every later page load. Sourced entirely from Vercel's
  // own x-vercel-ip-* headers (added automatically to every request at the
  // edge), so this needs no consent prompt and no third-party geo lookup —
  // it's already there for the taking. All three are absent in local dev.
  if (isNew) {
    const rawCity = request.headers.get("x-vercel-ip-city");
    payload.city = rawCity ? decodeURIComponent(rawCity) : null;
    payload.region = request.headers.get("x-vercel-ip-country-region") || null;
    payload.country = request.headers.get("x-vercel-ip-country") || null;
  }

  const { error } = await supabase
    .from("sessions")
    .upsert(payload, { onConflict: "session_id" });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
