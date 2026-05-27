"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Role } from "@prisma/client";
import { Loader2Icon, Trash2Icon, XIcon } from "lucide-react";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

import { EvidenceWithUploader } from "@/types";
import { formatDateTime, formatBytes } from "@/helpers/format";
import ConfirmationDialog from "@/components/ui/confirmation-dialog";

type Props = {
  evidence: EvidenceWithUploader[];
  uploading: boolean;
  userRole: Role;
  currentUserId: string;
};

const EvidencePhotoGrid = ({
  evidence,
  uploading,
  userRole,
  currentUserId,
}: Props) => {
  const router = useRouter();

  const [selected, setSelected] = useState<EvidenceWithUploader | null>(null);

  // State for delete confirmation dialog and async delete operation
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Determine if the current user can delete the selected evidence
  const canDeleteEvidence =
    !!selected &&
    (userRole === Role.ADMIN ||
      (userRole === Role.OPERATOR && selected.uploadedById === currentUserId));

  const handleDeleteEvidence = async () => {
    if (!selected) return;

    setDeleting(true);
    setDeleteError(null);

    try {
      const res = await fetch(`/api/evidence/${selected.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setDeleteError(
          (body as { error?: string }).error ??
            "Delete failed. Please try again.",
        );
        return;
      }

      setDeleteDialogOpen(false);
      setSelected(null);
      router.refresh();
    } catch {
      setDeleteError("Delete failed. Please try again.");
    } finally {
      setDeleting(false);
    }
  };

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
              onClick={() => {
                setSelected(ev);
                setDeleteError(null);
                setDeleteDialogOpen(false);
              }}
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
      <Dialog
        open={!!selected}
        onOpenChange={(open) => {
          if (!open) {
            setSelected(null);
            setDeleteDialogOpen(false);
            setDeleteError(null);
          }
        }}
      >
        <DialogContent
          aria-describedby={undefined}
          showCloseButton={false}
          className="card-base sm:max-w-2xl p-0 overflow-hidden"
        >
          {selected && (
            <>
              <DialogHeader className="flex-row items-start justify-between gap-3 px-5 pt-5 pb-0">
                <div className="min-w-0">
                  <DialogTitle className="text-sm font-medium text-(--color-text-900) truncate">
                    {selected.fileName}
                  </DialogTitle>
                </div>

                <div className="flex items-center gap-1">
                  {canDeleteEvidence && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => setDeleteDialogOpen(true)}
                      disabled={uploading || deleting}
                      aria-label="Delete evidence photo"
                    >
                      {deleting ? (
                        <Loader2Icon className="size-4 animate-spin" />
                      ) : (
                        <Trash2Icon className="size-4" />
                      )}
                    </Button>
                  )}

                  <DialogClose asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      aria-label="Close preview"
                    >
                      <XIcon className="size-4" />
                    </Button>
                  </DialogClose>
                </div>
              </DialogHeader>

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
                  {deleteError && (
                    <span className="text-xs text-(--color-status-cancelled)">
                      {deleteError}
                    </span>
                  )}
                </div>

                <span className="font-mono text-xs text-(--color-text-400)">
                  {formatDateTime(selected.createdAt)}
                </span>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Confirmation dialog for deleting evidence */}
      <ConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={(open) => {
          setDeleteDialogOpen(open);
          if (!open) {
            setDeleteError(null);
          }
        }}
        title="Delete this photo?"
        description="This will permanently remove the evidence image from storage and the database."
        confirmLabel="Delete photo"
        loading={deleting}
        onConfirm={handleDeleteEvidence}
      />
    </>
  );
};

export default EvidencePhotoGrid;
