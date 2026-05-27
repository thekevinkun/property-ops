"use server";

import { AuditAction } from "@prisma/client";
import { getAuditLogs, AuditLogFilters } from "@/services/audit.service";
import { AuditLogWithUser } from "@/types/index";

// Fetches audit logs with optional filters.
// Delegates all auth and role checks to the service layer.
export async function getAuditLogsAction(
  filters?: AuditLogFilters,
): Promise<{ data?: AuditLogWithUser[]; error?: string }> {
  const result = await getAuditLogs(filters);

  if (!result.success) {
    return { error: result.error.message };
  }

  return { data: result.data };
}

// Returns the list of valid AuditAction enum values for the filter dropdown.
// Computed here so the client never imports from @prisma/client directly.
export async function getAuditActionOptions(): Promise<string[]> {
  return Object.values(AuditAction);
}
