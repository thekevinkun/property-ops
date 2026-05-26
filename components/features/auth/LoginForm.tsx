"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase";

const LoginForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Where to send the user after login — defaults to /dashboard
  const redirectTo = searchParams.get("redirect") ?? "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Browser Supabase client — used only for Auth on the client side
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      // Surface auth errors clearly — wrong credentials is the common case
      setError(authError.message);
      setLoading(false);
      return;
    }

    // Session cookie is now set — redirect to dashboard
    router.push(redirectTo);
    router.refresh();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-(--color-bg-page)">
      <div className="w-full max-w-sm">
        {/* Logo / wordmark area */}
        <div className="mb-8 text-center">
          <h1 className="text-xl font-semibold text-(--color-text-900) tracking-tight">
            Property Ops
          </h1>
          <p className="mt-1 text-sm text-(--color-text-600)">
            Sign in to your account
          </p>
        </div>

        {/* Login card */}
        <div className="card-base p-6">
          <form onSubmit={handleLogin} noValidate>
            <div className="space-y-4">
              {/* Email field */}
              <div className="space-y-1.5">
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-(--color-text-900)"
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="input-base"
                  disabled={loading}
                />
              </div>

              {/* Password field */}
              <div className="space-y-1.5">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-(--color-text-900)"
                >
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input-base"
                  disabled={loading}
                />
              </div>

              {/* Error message — shown only when auth fails */}
              {error && (
                <p
                  role="alert"
                  className="text-sm text-(--color-status-cancelled)"
                >
                  {error}
                </p>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading || !email || !password}
                className={cn(
                  "btn-primary w-full",
                  (loading || !email || !password) &&
                    "opacity-60 cursor-not-allowed",
                )}
              >
                {loading ? "Signing in…" : "Sign in"}
              </button>
            </div>
          </form>
        </div>

        {/* Demo credentials — visible for Adriano's evaluation */}
        <div className="mt-6 card-base p-4">
          <p className="text-(--text-xs) font-medium text-(--color-text-400) uppercase tracking-wider mb-3">
            Demo credentials
          </p>
          <div className="space-y-2">
            {[
              { role: "Admin", email: "admin@test.com" },
              { role: "Operator", email: "operator@test.com" },
              { role: "Host", email: "host@test.com" },
            ].map(({ role, email: demoEmail }) => (
              <button
                key={role}
                type="button"
                onClick={() => {
                  setEmail(demoEmail);
                  setPassword("password123");
                  setError(null);
                }}
                className="w-full flex items-center justify-between px-3 py-2 rounded-(--radius-md) hover:bg-(--color-bg-hover) transition-colors duration-(--duration-fast)"
              >
                <span className="text-sm text-(--color-text-900) font-medium">
                  {role}
                </span>
                <span className="text-(--text-xs) text-(--color-text-400) font-mono">
                  {demoEmail}
                </span>
              </button>
            ))}
          </div>
          <p className="mt-3 text-(--text-xs) text-(--color-text-400)">
            Password for all accounts:{" "}
            <code className="text-(--color-text-600)">password123</code>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
