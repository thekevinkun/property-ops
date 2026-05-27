// This service handles the deletion of evidence files and their corresponding database records.
// It checks for user authentication and authorization, deletes the file from Supabase storage,
// and then removes the record from the database. The function returns a Result type indicating success or failure,
// along with relevant data or error information.

import { Role } from "@prisma/client";

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
        uploadedById: true,
        fileUrl: true,
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

    // Delete the file from Supabase storage
    const supabase = createServiceSupabaseClient();
    const { error: removeError } = await supabase.storage
      .from(BUCKET)
      .remove([evidence.fileUrl]);

    if (removeError) {
      return err({
        code: "INTERNAL",
        message: "Failed to delete evidence file",
        details: removeError.message,
      });
    }

    // Delete the database record
    await prisma.evidence.delete({
      where: { id: evidence.id },
    });

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
