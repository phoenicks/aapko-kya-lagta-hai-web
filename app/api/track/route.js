import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import { getOrCreateSessionId } from "@/lib/session";

// Called once per page load (see components/SessionBeacon.js) purely to
// keep a "last_seen" heartbeat for the anonymous session cookie, so the
// admin dashboard can show a rough "active users in the last 24h" number.
export async function POST() {
  const { sessionId } = getOrCreateSessionId();

  const { error } = await supabase
    .from("sessions")
    .upsert(
      { session_id: sessionId, last_seen: new Date().toISOString() },
      { onConflict: "session_id" }
    );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
