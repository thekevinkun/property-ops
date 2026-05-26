// All shared TypeScript types for the application.
// Never define types inline in component or service files — import from here.

import type { Role, TaskStatus, AuditAction } from "@prisma/client";

// Re-export Prisma enums so the rest of the app imports from one place
export type { Role, TaskStatus, AuditAction };

// AUTH / SESSION
// The session user shape returned by getSessionUser().
// Subset of the Prisma User model — only what the app needs at runtime.
export type SessionUser = {
  id: string;
  email: string;
  name: string;
  role: Role;
};

// USERS
// Full user record as stored in DB — used in admin user management pages
export type UserWithRole = {
  id: string;
  email: string;
  name: string;
  role: Role;
  createdAt: Date;
  updatedAt: Date;
};

// PROPERTIES
// Property with its creator — used in property list and detail pages
export type PropertyWithCreator = {
  id: string;
  name: string;
  address: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
  createdBy: {
    id: string;
    name: string;
    email: string;
  };
};

// TASKS
// Task with relations — used in task list and detail pages
export type TaskWithRelations = {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  createdAt: Date;
  updatedAt: Date;
  property: {
    id: string;
    name: string;
  };
  createdBy: {
    id: string;
    name: string;
  };
  assignedTo: {
    id: string;
    name: string;
    email: string;
  } | null;
};

// EVIDENCE
// Evidence record with uploader info — used on task detail page
export type EvidenceWithUploader = {
  id: string;
  taskId: string;
  fileName: string;
  fileUrl: string;
  mimeType: string;
  sizeBytes: number;
  createdAt: Date;
  uploadedBy: {
    id: string;
    name: string;
  };
};

// AUDIT LOGS
// Audit log entry with the acting user — used on admin audit page
export type AuditLogWithUser = {
  id: string;
  action: AuditAction;
  entityType: string;
  entityId: string;
  before: unknown;
  after: unknown;
  metadata: unknown;
  createdAt: Date;
  user: {
    id: string;
    name: string;
    email: string;
    role: Role;
  };
};

// UI HELPERS
// Nav item shape used by sidebar — role filtering applied before rendering
export type NavItem = {
  label: string;
  href: string;
  // Lucide icon component — typed as a React component accepting SVG props
  icon: React.ComponentType<{ className?: string }>;
  // If set, only these roles see this nav item
  roles?: Role[];
};
