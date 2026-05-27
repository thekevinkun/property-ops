"use client";

import { useState } from "react";
import Image from "next/image";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { EvidenceWithUploader } from "@/types";
import { formatDateTime, formatBytes } from "@/helpers/format";

type Props = {
  evidence: EvidenceWithUploader[];
  uploading: boolean;
};

const EvidencePhotoGrid = ({ evidence, uploading }: Props) => {
  const [selected, setSelected] = useState<EvidenceWithUploader | null>(null);

  // Empty state — spinner when uploading, message when idle
  if (evidence.length === 0) {
    return (
      <div className="flex items-center justify-center py-10">
        {uploading ? (
          <div
            className="w-8 h-8 rounded-full border-2 border-(--color-border)
              border-t-(--color-text-900) animate-spin"
            aria-label="Uploading photo…"
          />
        ) : (
          <p className="text-sm text-(--color-text-400)">
            No photos uploaded yet.
          </p>
        )}
      </div>
    );
  }

  return (
    <>
      {/* Overlay spinner when uploading into an existing grid */}
      <div className="relative">
        {uploading && (
          <div
            className="absolute inset-0 z-10 bg-white/60 flex items-center
              justify-center rounded-b-(--radius-lg)"
            aria-label="Uploading photo…"
          >
            <div
              className="w-8 h-8 rounded-full border-2 border-(--color-border)
                border-t-(--color-text-900) animate-spin"
            />
          </div>
        )}

        {/* Photo grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-5">
          {evidence.map((ev) => (
            <button
              key={ev.id}
              type="button"
              onClick={() => setSelected(ev)}
              disabled={uploading}
              className="group relative aspect-square rounded-(--radius-md) overflow-hidden
                border border-(--color-border) bg-(--color-bg-subtle)
                hover:border-(--color-border-strong) transition-colors"
              aria-label={`View photo: ${ev.fileName}`}
            >
              <Image
                src={ev.fileUrl}
                alt={ev.fileName}
                fill
                sizes="(max-width: 640px) 50vw, 33vw"
                loading={evidence.indexOf(ev) === 0 ? "eager" : "lazy"}
                className="object-cover transition-transform duration-150 group-hover:scale-105"
              />

              {/* Hover overlay — uploader + size */}
              <div
                className="absolute inset-0 bg-black/0 group-hover:bg-black/40
                  transition-colors flex items-end p-2"
              >
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <p className="text-xs text-white font-medium leading-tight truncate">
                    {ev.uploadedBy.name}
                  </p>
                  <p className="text-xs text-white/70 leading-tight">
                    {formatBytes(ev.sizeBytes)}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Modal preview */}
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="card-base sm:max-w-2xl p-0 overflow-hidden">
          <DialogHeader className="px-5 pt-5 pb-0">
            <DialogTitle className="text-sm font-medium text-(--color-text-900) truncate">
              {selected?.fileName}
            </DialogTitle>
          </DialogHeader>

          {selected && (
            <>
              <div className="relative w-full aspect-video bg-(--color-bg-subtle)">
                <Image
                  src={selected.fileUrl}
                  alt={selected.fileName}
                  fill
                  sizes="(max-width: 768px) 100vw, 672px"
                  className="object-contain"
                />
              </div>

              <div
                className="flex items-center justify-between px-5 py-4
                  border-t border-(--color-border)"
              >
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs text-(--color-text-600)">
                    Uploaded by{" "}
                    <span className="text-(--color-text-900) font-medium">
                      {selected.uploadedBy.name}
                    </span>
                  </span>
                  <span className="text-xs text-(--color-text-400)">
                    {formatBytes(selected.sizeBytes)}
                  </span>
                </div>

                <span className="font-mono text-xs text-(--color-text-400)">
                  {formatDateTime(selected.createdAt)}
                </span>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default EvidencePhotoGrid;
