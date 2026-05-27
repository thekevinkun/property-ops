"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

import {
  ALLOWED_MIME_TYPES,
  ACCEPTED_FILE_TYPE_INPUT,
  MAX_FILE_SIZE,
} from "@/lib/upload";

type Props = {
  taskId: string;
  onUploadingChange: (uploading: boolean) => void;
};

const EvidenceUploader = ({ taskId, onUploadingChange }: Props) => {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setUploadingState = (value: boolean) => {
    setUploading(value);

    // Notify parent so EvidencePhotoGrid can show overlay
    onUploadingChange(value);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);

    // Client-side guard — route handler validates again server-side
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      setError("Only JPEG, PNG, and WebP images are allowed.");
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError("File exceeds the 5MB limit.");
      return;
    }

    setUploadingState(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("taskId", taskId);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(
          (body as { error?: string }).error ??
            "Upload failed. Please try again.",
        );
        return;
      }

      // Refresh server component data — pulls new evidence list from DB
      router.refresh();
    } catch {
      setError("Upload failed. Please try again.");
    } finally {
      setUploadingState(false);
      // Reset input so the same file can be re-selected after an error
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="flex flex-col items-end gap-1">
      {/* Hidden file input — triggered by button click */}
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_FILE_TYPE_INPUT}
        className="hidden"
        aria-hidden="true"
        onChange={handleFileChange}
      />

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="btn-secondary text-xs px-3 py-1.5"
        aria-label="Upload evidence photo"
      >
        {uploading ? "Uploading…" : "Upload Photo"}
      </button>

      {error && (
        <p className="text-xs text-(--color-status-cancelled)">{error}</p>
      )}
    </div>
  );
};

export default EvidenceUploader;
