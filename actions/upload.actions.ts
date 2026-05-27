// Server Actions for evidence uploads.
// Note: the file upload itself goes to app/api/upload/route.ts (technical necessity —
// multipart streams require a route handler). This action handles post-upload needs.

"use server";

import { getSessionUser } from "@/services/auth.service";
import { getSignedUrl } from "@/services/upload.service";
import { err } from "@/types/result";
import { Result } from "@/types/result";

// Returns a fresh 24-hour signed URL for an evidence item.
// Called client-side after a successful upload to display the photo immediately.
export async function getEvidenceSignedUrlAction(
  storagePath: string,
): Promise<Result<string>> {
  const userResult = await getSessionUser();
  if (!userResult.success) {
    return err({ code: "FORBIDDEN", message: "Not authenticated" });
  }

  return getSignedUrl(storagePath);
}
