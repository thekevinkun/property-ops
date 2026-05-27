import { AuditAction, Role } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { writeAuditLog } from "@/lib/audit";
import { getSessionUser } from "@/services/auth.service";
import { createServiceSupabaseClient } from "@/lib/supabase.server";
import { ok, err, Result } from "@/types/result";

export type UserWithRole = {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt: Date;
};

// Returns all users. Admin only.
// Used by the users management page to list all accounts with their roles.
export async function getUsers(): Promise<Result<UserWithRole[]>> {
  try {
    const userResult = await getSessionUser();
    if (!userResult.success)
      return err({ code: "FORBIDDEN", message: "Not authenticated" });

    const user = userResult.data;

    if (user.role !== Role.ADMIN) {
      return err({ code: "FORBIDDEN", message: "Access denied" });
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
      orderBy: { createdAt: "asc" },
    });

    return ok(users);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return err({
      code: "INTERNAL",
      message: "Failed to fetch users",
      details: message,
    });
  }
}

// Updates a user's role in both Prisma DB and Supabase Auth app_metadata.
// Both must stay in sync — proxy.ts reads app_metadata for fast admin route blocking.
// Admin only. An Admin cannot change their own role — prevents lockout.
export async function changeUserRole(
  targetUserId: string,
  newRole: Role,
): Promise<Result<{ id: string; role: Role }>> {
  try {
    const userResult = await getSessionUser();
    if (!userResult.success)
      return err({ code: "FORBIDDEN", message: "Not authenticated" });

    const user = userResult.data;

    if (user.role !== Role.ADMIN) {
      return err({ code: "FORBIDDEN", message: "Access denied" });
    }

    // Prevent Admin from changing their own role — would cause immediate lockout
    if (user.id === targetUserId) {
      return err({
        code: "FORBIDDEN",
        message: "You cannot change your own role",
      });
    }

    const target = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: { id: true, role: true, name: true, email: true },
    });

    if (!target) {
      return err({ code: "NOT_FOUND", message: "User not found" });
    }

    // No-op if the role is already what's requested
    if (target.role === newRole) {
      return ok({ id: target.id, role: target.role });
    }

    const previousRole = target.role;

    // Update Prisma DB first
    const updated = await prisma.user.update({
      where: { id: targetUserId },
      data: { role: newRole },
      select: { id: true, role: true },
    });

    // Sync app_metadata in Supabase Auth — proxy.ts reads this for admin route guard
    const supabase = createServiceSupabaseClient();
    const { error: supabaseError } = await supabase.auth.admin.updateUserById(
      targetUserId,
      { app_metadata: { role: newRole } },
    );

    if (supabaseError) {
      // Supabase sync failed — roll back the DB change to keep them in sync
      const rollback = await prisma.user.updateMany({
        where: { id: targetUserId, role: newRole },
        data: { role: previousRole },
      });

      if (rollback.count === 0) {
        return err({
          code: "INTERNAL",
          message:
            "Failed to sync role and detected concurrent role change; manual reconciliation required",
          details: supabaseError.message,
        });
      }

      return err({
        code: "INTERNAL",
        message: "Failed to sync role — change rolled back",
        details: supabaseError.message,
      });
    }

    await writeAuditLog({
      action: AuditAction.USER_ROLE_CHANGED,
      entityType: "user",
      entityId: targetUserId,
      userId: user.id,
      before: { role: previousRole },
      after: { role: newRole },
    });

    return ok({ id: updated.id, role: updated.role });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return err({
      code: "INTERNAL",
      message: "Failed to change user role",
      details: message,
    });
  }
}
