// Server-only Supabase client using the service role key.
// "server-only" package causes a build error if this is ever imported
// into a client bundle — hard guardrail against accidental exposure.
// Import this only in route handlers and server-side services.
import "server-only";
import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";

export function createServiceSupabaseClient() {
  return createClient(env.supabaseUrl, env.supabaseServiceKey);
}
