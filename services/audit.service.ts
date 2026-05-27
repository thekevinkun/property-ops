import { AuditAction, Role } from "@prisma/client";
import { getSessionUser } from "@/services/auth.service";

import { prisma } from "@/lib/prisma";
import { ok, err, Result } from "@/types/result";
import { AuditLogWithUser } from "@/types/index";

export type AuditLogFilters = {
  action?: AuditAction;
  entityType?: string;
  userId?: string;
};

// Returns all audit log entries, newest first, scoped to Admin only.
// Supports optional filters: action type, entity type, and user who performed the action.
// Filters are AND-combined — all provided filters must match.
export async function getAuditLogs(
  filters?: AuditLogFilters,
): Promise<Result<AuditLogWithUser[]>> {
  try {
    const userResult = await getSessionUser();
    if (!userResult.success)
      return err({ code: "FORBIDDEN", message: "Not authenticated" });

    const user = userResult.data;

    // Audit log is Admin-only — second layer of defense after proxy.ts
    if (user.role !== Role.ADMIN) {
      return err({ code: "FORBIDDEN", message: "Access denied" });
    }

    const logs = await prisma.auditLog.findMany({
      where: {
        // Only apply filter keys that were actually provided
        ...(filters?.action ? { action: filters.action } : {}),
        ...(filters?.entityType ? { entityType: filters.entityType } : {}),
        ...(filters?.userId ? { userId: filters.userId } : {}),
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return ok(logs as AuditLogWithUser[]);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return err({
      code: "INTERNAL",
      message: "Failed to fetch audit logs",
      details: message,
    });
  }
}
