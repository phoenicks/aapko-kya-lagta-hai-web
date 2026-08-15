import { createClient } from "@supabase/supabase-js";

// Server-only client using the service role key, which bypasses Row Level
// Security. NEVER import this file from a "use client" component — it must
// only run in API routes / server components, and the key must never reach
// the browser bundle.
let adminClient = null;

export function getSupabaseAdmin() {
  if (!adminClient) {
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error(
        "SUPABASE_SERVICE_ROLE_KEY is not set. Add it to your environment (server-side only)."
      );
    }
    adminClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      { auth: { persistSession: false } }
    );
  }
  return adminClient;
}
