import { AuditAction, Prisma, Role } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { createServiceSupabaseClient } from "@/lib/supabase.server";
import { getSessionUser } from "@/services/auth.service";

import { BUCKET } from "@/lib/upload";
import { err, ok, Result } from "@/types/result";

export async function deleteEvidence(
  evidenceId: string,
): Promise<Result<{ taskId: string }>> {
  try {
    // Verify user session and get user info
    const userResult = await getSessionUser();
    if (!userResult.success) {
      return err({ code: "FORBIDDEN", message: "Not authenticated" });
    }

    const user = userResult.data;

    // Fetch the evidence record to check ownership and get file URL
    const evidence = await prisma.evidence.findUnique({
      where: { id: evidenceId },
      select: {
        id: true,
        taskId: true,
        fileName: true,
        fileUrl: true,
        mimeType: true,
        sizeBytes: true,
        uploadedById: true,
        createdAt: true,
        uploadedBy: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!evidence) {
      return err({ code: "NOT_FOUND", message: "Evidence not found" });
    }

    // Check if the user has permission to delete this evidence
    const canDelete =
      user.role === Role.ADMIN ||
      (user.role === Role.OPERATOR && evidence.uploadedById === user.id);

    if (!canDelete) {
      return err({ code: "FORBIDDEN", message: "Access denied" });
    }

    await prisma.$transaction(async (tx) => {
      await tx.evidence.delete({
        where: { id: evidence.id },
      });

      await tx.auditLog.create({
        data: {
          action: AuditAction.EVIDENCE_DELETED,
          entityType: "evidence",
          entityId: evidence.id,
          userId: user.id,
          before: {
            id: evidence.id,
            taskId: evidence.taskId,
            fileName: evidence.fileName,
            fileUrl: evidence.fileUrl,
            mimeType: evidence.mimeType,
            sizeBytes: evidence.sizeBytes,
            uploadedById: evidence.uploadedById,
            uploadedByName: evidence.uploadedBy.name,
            createdAt: evidence.createdAt.toISOString(),
          },
          after: Prisma.JsonNull,
        },
      });
    });

    const supabase = createServiceSupabaseClient();
    const { error: removeError } = await supabase.storage
      .from(BUCKET)
      .remove([evidence.fileUrl]);

    if (removeError) {
      console.error("[evidence] Storage cleanup failed:", removeError.message, {
        evidenceId: evidence.id,
        fileUrl: evidence.fileUrl,
      });
    }

    return ok({ taskId: evidence.taskId });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return err({
      code: "INTERNAL",
      message: "Failed to delete evidence",
      details: message,
    });
  }
}
