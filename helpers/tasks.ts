import { TaskStatus } from "@prisma/client";

// Maps each TaskStatus to its globals.css badge class.
// Color is the only place in the UI that communicates meaning — this component
// keeps that mapping in one place. Never inline status colors anywhere else.
export const STATUS_CONFIG: Record<
  TaskStatus,
  { label: string; className: string }
> = {
  PENDING: { label: "Pending", className: "badge-base badge-pending" },
  IN_PROGRESS: {
    label: "In Progress",
    className: "badge-base badge-in-progress",
  },
  DONE: { label: "Done", className: "badge-base badge-done" },
  CANCELLED: { label: "Cancelled", className: "badge-base badge-cancelled" },
};

// Human-readable labels and button variants per target status.
// CANCELLED is always btn-danger — it's a destructive terminal action.
export const TRANSITION_CONFIG: Record<
  TaskStatus,
  { label: string; className: string }
> = {
  IN_PROGRESS: {
    label: "Start Task",
    className: "btn-primary",
  },

  DONE: {
    label: "Mark Done",
    className: "btn-primary",
  },

  CANCELLED: {
    label: "Cancel Task",
    className: "btn-danger",
  },

  // PENDING is never a target status — included for type completeness
  PENDING: {
    label: "Reset",
    className: "btn-secondary",
  },
};
