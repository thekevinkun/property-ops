"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

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
        <Card className="card-base p-0">
          <CardContent className="p-6">
            <form onSubmit={handleLogin} noValidate>
              <div className="space-y-4">
                {/* Email field */}
                <div className="space-y-1.5">
                  <Label
                    htmlFor="email"
                    className="text-sm font-medium text-(--color-text-900)"
                  >
                    Email
                  </Label>

                  <Input
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
                  <Label
                    htmlFor="password"
                    className="text-sm font-medium text-(--color-text-900)"
                  >
                    Password
                  </Label>

                  <Input
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
                <Button
                  type="submit"
                  disabled={loading || !email || !password}
                  className={cn(
                    "btn-primary w-full",
                    (loading || !email || !password) &&
                      "opacity-60 cursor-not-allowed",
                  )}
                >
                  {loading ? "Signing in…" : "Sign in"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Demo credentials — visible for Adriano's evaluation */}
        <Card className="card-base mt-6 p-0">
          <CardContent className="p-4">
            <p className="text-(--text-xs) font-medium text-(--color-text-400) uppercase tracking-wider mb-3">
              Demo credentials
            </p>

            <div className="space-y-2">
              {[
                { role: "Admin", email: "admin@test.com" },
                { role: "Operator", email: "operator@test.com" },
                { role: "Host", email: "host@test.com" },
              ].map(({ role, email: demoEmail }) => (
                <Button
                  key={role}
                  type="button"
                  variant="ghost"
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
                </Button>
              ))}
            </div>

            <p className="mt-3 text-(--text-xs) text-(--color-text-400)">
              Password for all accounts:{" "}
              <code className="text-(--color-text-600)">password123</code>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LoginForm;
