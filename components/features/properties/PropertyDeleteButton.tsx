"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import ConfirmationDialog from "@/components/ui/confirmation-dialog"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

type Props = {
  propertyId: string
  propertyName: string
  taskCount: number
}

const PropertyDeleteButton = ({
  propertyId,
  propertyName,
  taskCount,
}: Props) => {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const canDelete = taskCount === 0

  const handleDelete = async () => {
    setLoading(true)
    setError(null)

    try {
      const res = await fetch(`/api/properties/${propertyId}`, {
        method: "DELETE",
      })

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        setError(
          (body as { error?: string }).error ?? "Delete failed. Please try again.",
        )
        return
      }

      setOpen(false)
      router.push("/dashboard/properties")
      router.refresh()
    } catch {
      setError("Delete failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {canDelete ? (
        <Button
          type="button"
          variant="destructive"
          onClick={() => setOpen(true)}
          disabled={loading}
          className="text-xs px-3 py-1.5"
        >
          Delete Property
        </Button>
      ) : (
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="inline-flex">
              <Button
                type="button"
                variant="destructive"
                disabled
                className="text-xs px-3 py-1.5"
              >
                Delete Property
              </Button>
            </span>
          </TooltipTrigger>

          <TooltipContent>
            Delete is available only when no tasks exist.
          </TooltipContent>
        </Tooltip>
      )}

      <ConfirmationDialog
        open={open}
        onOpenChange={(nextOpen) => {
          setOpen(nextOpen)
          if (!nextOpen) setError(null)
        }}
        title={`Delete ${propertyName}?`}
        description="This will permanently remove the property. It cannot be undone."
        error={error}
        confirmLabel="Delete Property"
        loading={loading}
        onConfirm={handleDelete}
      />
    </>
  )
}

export default PropertyDeleteButton
