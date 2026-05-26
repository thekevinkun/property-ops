// Supabase client — used for Auth and Storage only.
// All database queries go through Prisma, not Supabase.
import { createBrowserClient, createServerClient } from "@supabase/ssr";
import { env } from "@/lib/env";

// Browser client — used in Client Components for auth state
export function createClient() {
  return createBrowserClient(env.supabaseUrl, env.supabaseAnonKey);
}

// Server client — used in Server Components and Server Actions
export function createServerSupabaseClient(
  cookieStore: Awaited<ReturnType<typeof import("next/headers").cookies>>,
) {
  return createServerClient(env.supabaseUrl, env.supabaseAnonKey, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (cookiesToSet) => {
        cookiesToSet.forEach(({ name, value, options }) =>
          cookieStore.set(name, value, options),
        );
      },
    },
  });
}
