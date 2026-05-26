import { AuditAction, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

type WriteAuditParams = {
  action: AuditAction;
  entityType: string;
  entityId: string;
  userId: string;
  before?: Prisma.InputJsonValue | null;
  after?: Prisma.InputJsonValue | null;
  metadata?: Prisma.InputJsonValue | null;
};

// Writes a single append-only audit record. Never throws — a failed audit write
// must not abort the parent operation. Errors are logged server-side only.
// Called after every successful mutation: task create, status change, property create, upload.
export async function writeAuditLog(params: WriteAuditParams): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        action: params.action,
        entityType: params.entityType,
        entityId: params.entityId,
        userId: params.userId,
        // Prisma.JsonNull is required for nullable Json fields — plain null is rejected
        before: params.before ?? Prisma.JsonNull,
        after: params.after ?? Prisma.JsonNull,
        metadata: params.metadata ?? Prisma.JsonNull,
      },
    });
  } catch (e: unknown) {
    // Intentional: audit failure is non-fatal. Log server-side, never surface to client.
    const message = e instanceof Error ? e.message : "Unknown error";
    console.error(`[audit] Failed to write audit log: ${message}`, {
      action: params.action,
      entityId: params.entityId,
    });
  }
}
