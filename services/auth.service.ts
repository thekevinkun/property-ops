// Authentication helpers used by Server Components, Server Actions, and proxy.ts.
// All functions return Result<T> — never throw to the caller.

import { cookies } from "next/headers";
import { Role } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { createServerSupabaseClient } from "@/lib/supabase";

import { ok, err } from "@/types/result";
import { Result } from "@/types/result";
import { SessionUser } from "@/types";

// GET SESSION USER
// Returns the authenticated user from DB, or an error result.
// Always reads role from DB — never trusts client-provided role.
// Call this at the top of every Server Action and scoped service function.
export async function getSessionUser(): Promise<Result<SessionUser>> {
  try {
    const cookieStore = await cookies();
    const supabase = createServerSupabaseClient(cookieStore);

    // Verify the JWT from the session cookie
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return err({ code: "FORBIDDEN", message: "Not authenticated" });
    }

    // Fetch the user record from our DB — includes role
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { id: true, email: true, name: true, role: true },
    });

    if (!dbUser) {
      // Supabase Auth has a session but no matching DB record — shouldn't happen in prod
      return err({ code: "NOT_FOUND", message: "User record not found" });
    }

    return ok(dbUser);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return err({
      code: "INTERNAL",
      message: "Auth check failed",
      details: message,
    });
  }
}

// REQUIRE ROLE
// Convenience wrapper — returns the session user only if they have one of the required roles.
// Use in Server Actions that are role-restricted (e.g. Admin-only actions).
export async function requireRole(
  allowedRoles: Role[],
): Promise<Result<SessionUser>> {
  const result = await getSessionUser();

  // Propagate auth failure as-is
  if (!result.success) return result;

  // Check if the user's role is in the allowed list
  if (!allowedRoles.includes(result.data.role)) {
    return err({ code: "FORBIDDEN", message: "Insufficient permissions" });
  }

  return ok(result.data);
}
