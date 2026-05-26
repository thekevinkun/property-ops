import { Role, TaskStatus, AuditAction } from "@prisma/client";

// AUTH
export type SessionUser = {
  id: string;
  email: string;
  name: string;
  role: Role;
};

// PROPERTY
type UserMini = {
  id: string;
  name: string;
  email: string;
};

// Used in the property list — includes creator and task count
export type PropertyWithMeta = {
  id: string;
  name: string;
  address: string;
  description: string | null;
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: UserMini;
  _count: { tasks: number };
};

// Used on the property detail page — includes full task list
export type PropertyDetail = {
  id: string;
  name: string;
  address: string;
  description: string | null;
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: UserMini;
  tasks: TaskWithMeta[];
};

// TASK
// Used in the task list — includes property reference and evidence count
export type TaskWithMeta = {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  propertyId: string;
  createdById: string;
  assignedToId: string | null;
  createdAt: Date;
  updatedAt: Date;
  property: { id: string; name: string };
  assignedTo: UserMini | null;
  createdBy: UserMini;
  _count: { evidence: number };
};

// Used on the task detail page — includes full evidence list
export type TaskDetail = {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  propertyId: string;
  createdById: string;
  assignedToId: string | null;
  createdAt: Date;
  updatedAt: Date;
  property: { id: string; name: string; address: string };
  assignedTo: UserMini | null;
  createdBy: UserMini;
  evidence: EvidenceWithUploader[];
};

// EVIDENCE
export type EvidenceWithUploader = {
  id: string;
  taskId: string;
  uploadedById: string;
  fileName: string;
  fileUrl: string;
  mimeType: string;
  sizeBytes: number;
  createdAt: Date;
  uploadedBy: { id: string; name: string };
};

// AUDIT LOG
export type AuditLogWithUser = {
  id: string;
  action: AuditAction;
  entityType: string;
  entityId: string;
  userId: string;
  before: unknown;
  after: unknown;
  metadata: unknown;
  createdAt: Date;
  user: UserMini;
};

// FORMS
export type CreatePropertyInput = {
  name: string;
  address: string;
  description?: string;
};

export type CreateTaskInput = {
  title: string;
  description?: string;
  propertyId: string;
  assignedToId?: string;
};
