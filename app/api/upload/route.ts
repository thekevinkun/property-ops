// Route handler for evidence photo uploads.
// Technical necessity — multipart/form-data streams require a route handler,
// can't be done in a Server Action.
// Only OPERATOR and ADMIN can upload. Session is verified before any file is accepted.

import { NextRequest, NextResponse } from "next/server";
import { Role } from "@prisma/client";

import { getSessionUser } from "@/services/auth.service";
import { createEvidenceRecord } from "@/services/upload.service";
import { createServiceSupabaseClient } from "@/lib/supabase.server";

import { MAX_FILE_SIZE, ALLOWED_MIME_TYPES, BUCKET } from "@/lib/upload";

export async function POST(request: NextRequest) {
  // Verify session — reject unauthenticated requests before reading the body
  const userResult = await getSessionUser();
  if (!userResult.success) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const user = userResult.data;

  // Only Operators and Admins can upload evidence
  if (user.role !== Role.OPERATOR && user.role !== Role.ADMIN) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const file = formData.get("file") as File | null;
  const taskId = formData.get("taskId") as string | null;

  if (!file || !taskId) {
    return NextResponse.json(
      { error: "Missing file or taskId" },
      { status: 400 },
    );
  }

  // Validate mime type — only images accepted
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: "Only JPEG, PNG, and WebP images are allowed" },
      { status: 400 },
    );
  }

  // Validate file size
  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { error: "File exceeds the 5MB limit" },
      { status: 400 },
    );
  }

  // Build a unique storage path — prevents filename collisions across tasks
  const ext = file.name.split(".").pop() ?? "jpg";
  const storagePath = `${taskId}/${crypto.randomUUID()}.${ext}`;

  const supabase = createServiceSupabaseClient();

  // Stream file buffer to Supabase Storage
  const arrayBuffer = await file.arrayBuffer();
  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, arrayBuffer, {
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) {
    console.error("[upload] Supabase Storage error:", uploadError.message);
    return NextResponse.json(
      { error: "Storage upload failed" },
      { status: 500 },
    );
  }

  // Create Evidence DB record + audit log
  const result = await createEvidenceRecord({
    taskId,
    uploadedById: user.id,
    fileName: file.name,
    storagePath,
    mimeType: file.type,
    sizeBytes: file.size,
  });

  if (!result.success) {
    console.error("[upload] Evidence record error:", result.error.message);
    // Rollback — remove the orphaned file from Storage so the bucket stays clean
    const { error: removeError } = await supabase.storage
      .from(BUCKET)
      .remove([storagePath]);
    if (removeError) {
      console.error("[upload] Rollback delete failed:", removeError.message);
    }
    return NextResponse.json(
      { error: "Failed to save evidence record" },
      { status: 500 },
    );
  }

  return NextResponse.json({ evidenceId: result.data.id }, { status: 201 });
}
