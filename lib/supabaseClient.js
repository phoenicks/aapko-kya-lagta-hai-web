import { createClient } from "@supabase/supabase-js";

// Public, browser-safe client. Uses the anon key, which only ever sees what
// Row Level Security policies in supabase/schema.sql allow (active posts,
// visible comments). Safe to import from client or server components.
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);
