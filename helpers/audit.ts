import { AuditAction } from "@prisma/client";

// Maps each AuditAction to a human-readable label and badge class.
// Follows the same pattern as STATUS_CONFIG in helpers/tasks.ts.
// Only status/role badges use color — audit action badges use neutral styling.
export const AUDIT_ACTION_CONFIG: Record<
  AuditAction,
  { label: string; className: string }
> = {
  TASK_CREATED: {
    label: "Task Created",
    className:
      "badge-base bg-(--color-bg-subtle) text-(--color-text-600) border-(--color-border)",
  },
  TASK_STATUS_CHANGED: {
    label: "Status Changed",
    className:
      "badge-base bg-(--color-bg-subtle) text-(--color-text-600) border-(--color-border)",
  },
  TASK_ASSIGNED: {
    label: "Task Assigned",
    className:
      "badge-base bg-(--color-bg-subtle) text-(--color-text-600) border-(--color-border)",
  },
  EVIDENCE_UPLOADED: {
    label: "Evidence Uploaded",
    className:
      "badge-base bg-(--color-bg-subtle) text-(--color-text-600) border-(--color-border)",
  },
  EVIDENCE_DELETED: {
    label: "Evidence Deleted",
    className:
      "badge-base bg-(--color-bg-subtle) text-(--color-text-600) border-(--color-border)",
  },
  PROPERTY_CREATED: {
    label: "Property Created",
    className:
      "badge-base bg-(--color-bg-subtle) text-(--color-text-600) border-(--color-border)",
  },
  PROPERTY_DELETED: {
    label: "Property Deleted",
    className:
      "badge-base bg-(--color-bg-subtle) text-(--color-text-600) border-(--color-border)",
  },
  USER_ROLE_CHANGED: {
    label: "Role Changed",
    className: "badge-base badge-role-admin",
  },
  PROPERTY_DELETED: {
    label: "Property Deleted",
    className:
      "badge-base bg-(--color-bg-subtle) text-(--color-text-600) border-(--color-border)",
  },
};

// Entity type labels for the filter dropdown
export const ENTITY_TYPE_OPTIONS: { label: string; value: string }[] = [
  { label: "All Entities", value: "all" },
  { label: "Task", value: "task" },
  { label: "Property", value: "property" },
  { label: "Evidence", value: "evidence" },
  { label: "User", value: "user" },
];
