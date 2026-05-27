"use client";

import { useState } from "react";
import { Role } from "@prisma/client";

import {
  EvidenceUploader,
  EvidencePhotoGrid,
} from "@/components/features/evidence";

import { EvidenceWithUploader } from "@/types";

type Props = {
  taskId: string;
  evidence: EvidenceWithUploader[];
  userRole: Role;
  currentUserId: string;
};

const EvidenceSection = ({
  taskId,
  evidence,
  userRole,
  currentUserId,
}: Props) => {
  const [uploading, setUploading] = useState(false);

  const canUpload = userRole === Role.OPERATOR || userRole === Role.ADMIN;

  return (
    <>
      <div
        className="flex items-center justify-between px-5 py-4
          border-b border-(--color-border)"
      >
        <div className="flex items-center gap-2">
          <p className="text-sm text-(--color-text-900) font-medium">
            Evidence Photos
          </p>

          {evidence.length > 0 && (
            <span
              className="text-xs text-(--color-text-400) bg-(--color-bg-subtle)
                border border-(--color-border) rounded px-1.5 py-0.5 font-mono"
            >
              {evidence.length}
            </span>
          )}
        </div>

        {canUpload && (
          <EvidenceUploader taskId={taskId} onUploadingChange={setUploading} />
        )}
      </div>

      <EvidencePhotoGrid
        evidence={evidence}
        uploading={uploading}
        userRole={userRole}
        currentUserId={currentUserId}
      />
    </>
  );
};

export default EvidenceSection;
