import { redirect } from "next/navigation";
import { Role } from "@prisma/client";

import { getSessionUser } from "@/services/auth.service";
import { prisma } from "@/lib/prisma";
import { OverviewSection } from "@/components/layout";

export default async function DashboardPage() {
  const result = await getSessionUser();

  if (!result.success) {
    redirect("/login");
  }

  const user = result.data;
  const isAdmin = user.role === Role.ADMIN;
  const isOperator = user.role === Role.OPERATOR;

  // Fetch counts scoped by role — same scoping rules as the service layer
  const [taskCount, propertyCount, userCount, auditCount] = await Promise.all([
    prisma.task.count({
      where: {
        ...(isOperator
          ? {
              assignedToId: user.id,
              status: { in: ["PENDING", "IN_PROGRESS"] },
            }
          : isAdmin
            ? { status: { in: ["PENDING", "IN_PROGRESS"] } }
            : {
                property: { createdById: user.id },
                status: { in: ["PENDING", "IN_PROGRESS"] },
              }),
      },
    }),
    prisma.property.count({
      where: isAdmin ? {} : { createdById: user.id },
    }),
    isAdmin ? prisma.user.count() : Promise.resolve(0),
    // Audit log count — Admin only
    isAdmin ? prisma.auditLog.count() : Promise.resolve(0),
  ]);

  return (
    <OverviewSection
      user={user}
      taskCount={taskCount}
      propertyCount={propertyCount}
      userCount={userCount}
      auditCount={auditCount}
    />
  );
}
