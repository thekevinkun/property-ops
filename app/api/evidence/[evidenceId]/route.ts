import { NextRequest, NextResponse } from "next/server";

import { deleteEvidence } from "@/services/evidence.service";

type Params = {
  params: Promise<{ evidenceId: string }>;
};

export async function DELETE(_request: NextRequest, { params }: Params) {
  const { evidenceId } = await params;
  const result = await deleteEvidence(evidenceId);

  if (!result.success) {
    const status =
      result.error.code === "FORBIDDEN"
        ? 403
        : result.error.code === "NOT_FOUND"
          ? 404
          : 500;

    return NextResponse.json({ error: result.error.message }, { status });
  }

  return NextResponse.json({ taskId: result.data.taskId }, { status: 200 });
}
