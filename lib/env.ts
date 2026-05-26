// Validates all required environment variables at startup.
// Never access process.env directly anywhere else in the codebase.

function requireEnv(key: string): string {
  // Throw immediately with a clear message if the variable is missing
  const value = process.env[key]
  if (!value) throw new Error(`Missing required environment variable: ${key}`)
  return value
}

export const env = {
  // Supabase direct database connection — used by Prisma
  databaseUrl: requireEnv("DATABASE_URL"),

  // Supabase project URL — safe for browser
  supabaseUrl: requireEnv("NEXT_PUBLIC_SUPABASE_URL"),

  // Supabase anon key — safe for browser, used for auth on client
  supabaseAnonKey: requireEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),

  // Supabase service role key — server only, never sent to client
  supabaseServiceKey: requireEnv("SUPABASE_SERVICE_ROLE_KEY"),

  // Supabase Storage bucket name for evidence uploads
  storageBucket: requireEnv("SUPABASE_STORAGE_BUCKET"),
} as const
