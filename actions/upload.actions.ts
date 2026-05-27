// Server Actions for evidence uploads.
// Note: the file upload itself goes to app/api/upload/route.ts (technical necessity —
// multipart streams require a route handler). This action handles post-upload needs.

"use server";

import { Role } from "@prisma/client";

import { getSessionUser } from "@/services/auth.service";
import { getSignedUrl } from "@/services/upload.service";
import { prisma } from "@/lib/prisma";

import { err } from "@/types/result";
import { Result } from "@/types/result";

// Returns a fresh 24-hour signed URL for an evidence item.
// Accepts evidenceId — loads and verifies ownership from DB before signing.
// Never signs a caller-provided storage path directly.
export async function getEvidenceSignedUrlAction(
  evidenceId: string,
): Promise<Result<string>> {
  const userResult = await getSessionUser();
  if (!userResult.success) {
    return err({ code: "FORBIDDEN", message: "Not authenticated" });
  }

  const user = userResult.data;

  // Load evidence record — includes task and property for ownership check
  const evidence = await prisma.evidence.findUnique({
    where: { id: evidenceId },
    include: {
      task: {
        include: {
          property: { select: { createdById: true } },
        },
      },
    },
  });

  if (!evidence) {
    return err({ code: "NOT_FOUND", message: "Evidence not found" });
  }

  // Verify the caller is allowed to view this evidence
  // Admin — full access
  // Operator — must be assigned to the task
  // Host — must own the property the task belongs to
  const allowed =
    user.role === Role.ADMIN ||
    (user.role === Role.OPERATOR && evidence.task.assignedToId === user.id) ||
    (user.role === Role.HOST && evidence.task.property.createdById === user.id);

  if (!allowed) {
    return err({ code: "FORBIDDEN", message: "Access denied" });
  }

  // Sign the verified storage path — never the caller-provided path
  return getSignedUrl(evidence.fileUrl);
}
