// Upload service — creates Evidence DB records and generates signed URLs.
// Storage uploads are handled in app/api/upload/route.ts.
// This service handles everything after the file lands in Supabase Storage.

import { AuditAction } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { writeAuditLog } from "@/lib/audit";
import { createServiceSupabaseClient } from "@/lib/supabase";

import { ok, err, Result } from "@/types/result";
import { EvidenceWithUploader } from "@/types";

const BUCKET = "evidence";
// Signed URLs are valid for 24 hours — enough for a working shift without permanent exposure
const SIGNED_URL_EXPIRY_SECONDS = 60 * 60 * 24;

// Creates an Evidence record in the DB after a successful Storage upload.
// Called by the route handler — never called directly from a component.
export async function createEvidenceRecord(data: {
  taskId: string;
  uploadedById: string;
  fileName: string;
  storagePath: string;
  mimeType: string;
  sizeBytes: number;
}): Promise<Result<{ id: string }>> {
  try {
    const evidence = await prisma.evidence.create({
      data: {
        taskId: data.taskId,
        uploadedById: data.uploadedById,
        fileName: data.fileName,
        // fileUrl stores the storage path — signed URL is generated on read, not stored
        fileUrl: data.storagePath,
        mimeType: data.mimeType,
        sizeBytes: data.sizeBytes,
      },
    });

    await writeAuditLog({
      action: AuditAction.EVIDENCE_UPLOADED,
      entityType: "evidence",
      entityId: evidence.id,
      userId: data.uploadedById,
      before: null,
      after: {
        taskId: data.taskId,
        fileName: data.fileName,
        sizeBytes: data.sizeBytes,
        mimeType: data.mimeType,
      },
    });

    return ok({ id: evidence.id });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return err({
      code: "INTERNAL",
      message: "Failed to create evidence record",
      details: message,
    });
  }
}

// Generates a 24-hour signed URL for a single evidence item.
// Called when building the task detail page — storagePath is what we stored in fileUrl.
export async function getSignedUrl(
  storagePath: string,
): Promise<Result<string>> {
  try {
    const supabase = createServiceSupabaseClient();

    const { data, error } = await supabase.storage
      .from(BUCKET)
      .createSignedUrl(storagePath, SIGNED_URL_EXPIRY_SECONDS);

    if (error || !data?.signedUrl) {
      return err({
        code: "INTERNAL",
        message: "Failed to generate signed URL",
        details: error?.message,
      });
    }

    return ok(data.signedUrl);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return err({
      code: "INTERNAL",
      message: "Signed URL generation failed",
      details: message,
    });
  }
}

// Resolves signed URLs for all evidence items on a task.
// Called by the task detail page after fetching the task from DB.
// Non-fatal per item — a single failed signed URL won't crash the whole page.
export async function resolveEvidenceUrls(
  evidence: EvidenceWithUploader[],
): Promise<EvidenceWithUploader[]> {
  return Promise.all(
    evidence.map(async (ev) => {
      const result = await getSignedUrl(ev.fileUrl);
      return {
        ...ev,
        // On failure, keep the raw storagePath — broken image is better than a crash
        fileUrl: result.success ? result.data : ev.fileUrl,
      };
    }),
  );
}
