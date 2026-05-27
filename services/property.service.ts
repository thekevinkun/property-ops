import { AuditAction, Prisma, Role } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { writeAuditLog } from "@/lib/audit";
import { getSessionUser } from "@/services/auth.service";

import { ok, err, Result } from "@/types/result";
import { PropertyWithMeta, PropertyDetail } from "@/types/index";

// Returns the property list scoped to the caller's role.
// Decision for Adriano: Hosts see only their own properties (createdById match).
// Operators see no properties in the list — they navigate via tasks. Admins see all.
// This matches the permissions matrix exactly and makes the service the single
// enforcement point — no scattered where-clause logic in pages.
export async function getProperties(): Promise<Result<PropertyWithMeta[]>> {
  try {
    const userResult = await getSessionUser();
    if (!userResult.success)
      return err({ code: "FORBIDDEN", message: "Not authenticated" });

    const user = userResult.data;
    const actorId = user.id;

    const where =
      user.role === Role.ADMIN
        ? {}
        : user.role === Role.HOST
          ? { createdById: actorId }
          : // Operators: return empty — they work from the tasks view
            { id: "none" };

    const properties = await prisma.property.findMany({
      where,
      include: {
        createdBy: { select: { id: true, name: true, email: true } },
        _count: { select: { tasks: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return ok(properties as PropertyWithMeta[]);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return err({
      code: "INTERNAL",
      message: "Failed to fetch properties",
      details: message,
    });
  }
}

// Returns a single property with its full task list.
// Access rule: Admin sees any. Host sees only their own. Operator sees any property
// whose tasks include at least one assigned to them — this lets Operators navigate
// to a property detail from a task, which is a real operational need.
export async function getPropertyDetail(
  propertyId: string,
): Promise<Result<PropertyDetail>> {
  try {
    const userResult = await getSessionUser();
    if (!userResult.success)
      return err({ code: "FORBIDDEN", message: "Not authenticated" });

    const user = userResult.data;

    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      include: {
        createdBy: { select: { id: true, name: true, email: true } },
        tasks: {
          include: {
            property: {
              select: {
                id: true,
                name: true,
              },
            },
            assignedTo: { select: { id: true, name: true, email: true } },
            createdBy: { select: { id: true, name: true, email: true } },
            _count: { select: { evidence: true } },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!property)
      return err({ code: "NOT_FOUND", message: "Property not found" });

    // Ownership check — Host can only see their own property
    if (user.role === Role.HOST && property.createdById !== user.id) {
      return err({ code: "FORBIDDEN", message: "Access denied" });
    }

    // Operator check — must have at least one task assigned on this property
    if (user.role === Role.OPERATOR) {
      const hasAssignedTask = property.tasks.some(
        (t) => t.assignedToId === user.id,
      );
      if (!hasAssignedTask)
        return err({ code: "FORBIDDEN", message: "Access denied" });
    }

    return ok(property as PropertyDetail);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return err({
      code: "INTERNAL",
      message: "Failed to fetch property",
      details: message,
    });
  }
}

// Creates a property. Admin only — enforced here and at the route level.
export async function createProperty(data: {
  name: string;
  address: string;
  description?: string | undefined;
}): Promise<Result<{ id: string }>> {
  try {
    const userResult = await getSessionUser();
    if (!userResult.success)
      return err({ code: "FORBIDDEN", message: "Not authenticated" });

    const user = userResult.data;

    // Service-layer role enforcement — defense in depth beyond proxy.ts
    if (user.role !== Role.ADMIN) {
      return err({
        code: "FORBIDDEN",
        message: "Only Admins can create properties",
      });
    }

    const property = await prisma.property.create({
      data: {
        name: data.name,
        address: data.address,
        description: data.description ?? null,
        createdById: user.id,
      },
    });

    // Audit — records the full created state in `after`
    await writeAuditLog({
      action: AuditAction.PROPERTY_CREATED,
      entityType: "property",
      entityId: property.id,
      userId: user.id,
      before: null,
      after: { name: property.name, address: property.address },
    });

    return ok({ id: property.id });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return err({
      code: "INTERNAL",
      message: "Failed to create property",
      details: message,
    });
  }
}

// Deletes a property. Admin only, and only when there are no tasks attached.
export async function deleteProperty(
  propertyId: string,
): Promise<Result<{ id: string }>> {
  try {
    const userResult = await getSessionUser();
    if (!userResult.success)
      return err({ code: "FORBIDDEN", message: "Not authenticated" });

    const user = userResult.data;

    if (user.role !== Role.ADMIN) {
      return err({
        code: "FORBIDDEN",
        message: "Only Admins can delete properties",
      });
    }

    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      select: {
        id: true,
        name: true,
        address: true,
        description: true,
        createdById: true,
        _count: { select: { tasks: true } },
      },
    });

    if (!property) {
      return err({ code: "NOT_FOUND", message: "Property not found" });
    }

    if (property._count.tasks > 0) {
      return err({
        code: "CONFLICT",
        message: "Property has tasks and cannot be deleted",
      });
    }

    await prisma.$transaction(async (tx) => {
      await tx.property.delete({
        where: { id: property.id },
      });

      await tx.auditLog.create({
        data: {
          action: AuditAction.PROPERTY_DELETED,
          entityType: "property",
          entityId: property.id,
          userId: user.id,
          before: {
            id: property.id,
            name: property.name,
            address: property.address,
            description: property.description,
            createdById: property.createdById,
            taskCount: property._count.tasks,
          },
          after: Prisma.JsonNull,
        },
      });
    });

    return ok({ id: property.id });
  } catch (e: unknown) {
    const code = (e as { code?: string }).code;
    if (code === "P2003") {
      return err({
        code: "CONFLICT",
        message: "Property has tasks and cannot be deleted",
      });
    }

    if (code === "P2025") {
      return err({ code: "NOT_FOUND", message: "Property not found" });
    }

    const message = e instanceof Error ? e.message : "Unknown error";
    return err({
      code: "INTERNAL",
      message: "Failed to delete property",
      details: message,
    });
  }
}
