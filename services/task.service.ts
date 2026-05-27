import { AuditAction, Role, TaskStatus } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { writeAuditLog } from "@/lib/audit";
import { canTransition } from "@/lib/state-machine";
import { getSessionUser } from "@/services/auth.service";
import { resolveEvidenceUrls } from "@/services/upload.service";

import { ok, err, Result } from "@/types/result";
import { TaskWithMeta, TaskDetail, EvidenceWithUploader } from "@/types/index";

// Returns the task list scoped to the caller's role.
// Decision for Adriano: Operators see only tasks assigned to them — this is the
// real operational model (a cleaner only sees their own work order list).
// Admins see all tasks across all properties. Hosts see tasks on their properties.
// Scoping is enforced here — pages receive pre-filtered data, no role checks in UI.
export async function getTasks(): Promise<Result<TaskWithMeta[]>> {
  try {
    const userResult = await getSessionUser();
    if (!userResult.success)
      return err({ code: "FORBIDDEN", message: "Not authenticated" });

    const user = userResult.data;

    const where =
      user.role === Role.ADMIN
        ? {}
        : user.role === Role.OPERATOR
          ? { assignedToId: user.id }
          : // Host: tasks on any property they own
            { property: { createdById: user.id } };

    const tasks = await prisma.task.findMany({
      where,
      include: {
        property: { select: { id: true, name: true } },
        assignedTo: { select: { id: true, name: true, email: true } },
        createdBy: { select: { id: true, name: true, email: true } },
        _count: { select: { evidence: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return ok(tasks as TaskWithMeta[]);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return err({
      code: "INTERNAL",
      message: "Failed to fetch tasks",
      details: message,
    });
  }
}

// Returns a single task with evidence list.
// Access rule: Admin sees any. Operator sees only their assigned task (strict —
// prevents an Operator from probing another's task detail via direct URL).
// Host sees any task on their property — they need visibility into all work on their unit.
export async function getTaskDetail(
  taskId: string,
): Promise<Result<TaskDetail>> {
  try {
    const userResult = await getSessionUser();
    if (!userResult.success)
      return err({ code: "FORBIDDEN", message: "Not authenticated" });

    const user = userResult.data;

    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        property: { select: { id: true, name: true, address: true } },
        assignedTo: { select: { id: true, name: true, email: true } },
        createdBy: { select: { id: true, name: true, email: true } },
        evidence: {
          orderBy: { createdAt: "desc" },
          include: {
            uploadedBy: { select: { id: true, name: true } },
          },
        },
      },
    });

    if (!task) return err({ code: "NOT_FOUND", message: "Task not found" });

    // Operator: strictly assigned only — direct URL enumeration is blocked
    if (user.role === Role.OPERATOR && task.assignedToId !== user.id) {
      return err({ code: "FORBIDDEN", message: "Access denied" });
    }

    // Host: must own the property this task belongs to
    if (user.role === Role.HOST && task.property.id) {
      const property = await prisma.property.findUnique({
        where: { id: task.propertyId },
        select: { createdById: true },
      });
      if (property?.createdById !== user.id) {
        return err({ code: "FORBIDDEN", message: "Access denied" });
      }
    }

    // Resolve signed URLs for all evidence items — fileUrl in DB is a storage path,
    // not a public URL. Non-fatal per item — failed URLs fall back to raw storage path.
    const evidenceWithUrls = await resolveEvidenceUrls(
      task.evidence as EvidenceWithUploader[],
    );

    return ok({ ...task, evidence: evidenceWithUrls } as TaskDetail);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return err({
      code: "INTERNAL",
      message: "Failed to fetch task",
      details: message,
    });
  }
}

// Creates a task. Admin only.
export async function createTask(data: {
  title: string;
  description?: string | undefined;
  propertyId: string;
  assignedToId?: string | undefined;
}): Promise<Result<{ id: string }>> {
  try {
    const userResult = await getSessionUser();
    if (!userResult.success)
      return err({ code: "FORBIDDEN", message: "Not authenticated" });

    const user = userResult.data;

    if (user.role !== Role.ADMIN) {
      return err({
        code: "FORBIDDEN",
        message: "Only Admins can create tasks",
      });
    }

    // Verify the property exists before creating
    const property = await prisma.property.findUnique({
      where: { id: data.propertyId },
    });
    if (!property)
      return err({ code: "NOT_FOUND", message: "Property not found" });

    if (data.assignedToId) {
      const assignee = await prisma.user.findUnique({
        where: { id: data.assignedToId },
        select: { role: true },
      });
      if (!assignee || assignee.role !== Role.OPERATOR) {
        return err({
          code: "FORBIDDEN",
          message: "Assignee must be an existing Operator",
        });
      }
    }

    const task = await prisma.task.create({
      data: {
        title: data.title,
        description: data.description ?? null,
        propertyId: data.propertyId,
        createdById: user.id,
        assignedToId: data.assignedToId ?? null,
        status: TaskStatus.PENDING,
      },
    });

    await writeAuditLog({
      action: AuditAction.TASK_CREATED,
      entityType: "task",
      entityId: task.id,
      userId: user.id,
      before: null,
      after: {
        title: task.title,
        status: task.status,
        propertyId: task.propertyId,
        assignedToId: task.assignedToId,
      },
    });

    return ok({ id: task.id });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return err({
      code: "INTERNAL",
      message: "Failed to create task",
      details: message,
    });
  }
}

// Transitions a task status. Validates via state machine before any DB write.
// Both the from-status and to-status are captured in the audit log so Adriano
// can reconstruct the full lifecycle of any task from the audit table alone.
export async function transitionTaskStatus(
  taskId: string,
  newStatus: TaskStatus,
): Promise<Result<{ status: TaskStatus }>> {
  try {
    const userResult = await getSessionUser();
    if (!userResult.success)
      return err({ code: "FORBIDDEN", message: "Not authenticated" });

    const user = userResult.data;

    const task = await prisma.task.findUnique({ where: { id: taskId } });
    if (!task) return err({ code: "NOT_FOUND", message: "Task not found" });

    // State machine check — single call, single source of truth
    if (!canTransition(user.role, task.status, newStatus)) {
      return err({
        code: "FORBIDDEN",
        message: `Cannot transition from ${task.status} to ${newStatus} as ${user.role}`,
      });
    }

    // Operator must be assigned to transition — prevents unassigned Operators from
    // claiming or closing someone else's task via direct API call
    if (user.role === Role.OPERATOR && task.assignedToId !== user.id) {
      return err({
        code: "FORBIDDEN",
        message: "You are not assigned to this task",
      });
    }

    const previousStatus = task.status;

    const updateResult = await prisma.task.updateMany({
      where: {
        id: taskId,
        status: previousStatus,
        ...(user.role === Role.OPERATOR ? { assignedToId: user.id } : {}),
      },
      data: { status: newStatus },
    });
    if (updateResult.count !== 1) {
      return err({
        code: "FORBIDDEN",
        message: "Task changed during transition. Please retry.",
      });
    }

    const updated = { status: newStatus };

    // Audit: before/after captures full transition path for the log table
    await writeAuditLog({
      action: AuditAction.TASK_STATUS_CHANGED,
      entityType: "task",
      entityId: taskId,
      userId: user.id,
      before: { status: previousStatus },
      after: { status: newStatus },
      metadata: { transition: `${previousStatus} → ${newStatus}` },
    });

    return ok({ status: updated.status });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return err({
      code: "INTERNAL",
      message: "Failed to transition task status",
      details: message,
    });
  }
}

// Returns all Operators — used by the create task form's assignee dropdown.
export async function getOperators(): Promise<
  Result<{ id: string; name: string; email: string }[]>
> {
  try {
    const userResult = await getSessionUser();
    if (!userResult.success)
      return err({ code: "FORBIDDEN", message: "Not authenticated" });

    const user = userResult.data;

    if (user.role !== Role.ADMIN) {
      return err({ code: "FORBIDDEN", message: "Access denied" });
    }

    const operators = await prisma.user.findMany({
      where: { role: Role.OPERATOR },
      select: { id: true, name: true, email: true },
      orderBy: { name: "asc" },
    });

    return ok(operators);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return err({
      code: "INTERNAL",
      message: "Failed to fetch operators",
      details: message,
    });
  }
}
