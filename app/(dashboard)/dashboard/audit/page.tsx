import { redirect } from "next/navigation";
import { AuditAction } from "@prisma/client";

import { getSessionUser } from "@/services/auth.service";
import { getAuditLogs } from "@/services/audit.service";
import { getUsers } from "@/services/user.service";

import { AuditLogSection } from "@/components/layout";

type Props = {
  searchParams: Promise<{
    action?: string;
    entityType?: string;
    userId?: string;
  }>;
};

export default async function AuditPage({ searchParams }: Props) {
  const {
    action = "all",
    entityType = "all",
    userId = "all",
  } = await searchParams;

  const sessionUserResult = await getSessionUser();

  if (!sessionUserResult.success) {
    redirect("/login");
  }

  const [logsResult, usersResult] = await Promise.all([
    getAuditLogs({
      ...(action !== "all" ? { action: action as AuditAction } : {}),
      ...(entityType !== "all" ? { entityType } : {}),
      ...(userId !== "all" ? { userId } : {}),
    }),
    getUsers(),
  ]);

  if (!logsResult.success) {
    return (
      <div className="page-content">
        <p className="text-sm text-(--color-status-cancelled)">
          {logsResult.error.message}
        </p>
      </div>
    );
  }

  const users = usersResult.success ? usersResult.data : [];

  return (
    <AuditLogSection
      logs={logsResult.data}
      users={users}
      action={action}
      entityType={entityType}
      userId={userId}
    />
  );
}
