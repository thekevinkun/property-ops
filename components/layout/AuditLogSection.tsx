import { Suspense } from "react";

import { AuditLogTable, AuditLogFilters } from "@/components/features/audit";
import { AuditLogWithUser } from "@/types";
import { UserWithRole } from "@/services/user.service";

type Props = {
  logs: AuditLogWithUser[];
  users: UserWithRole[];
  action: string;
  entityType: string;
  userId: string;
};

const AuditLogSection = ({
  logs,
  users,
  action,
  entityType,
  userId,
}: Props) => {
  return (
    <div>
      <div className="page-header">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold text-(--color-text-900)">
              Audit Log
            </h1>
            <p className="text-sm mt-0.5 text-(--color-text-600)">
              {logs.length} entr{logs.length !== 1 ? "ies" : "y"}
              {action !== "all" || entityType !== "all" || userId !== "all"
                ? " matching filters"
                : ""}
            </p>
          </div>
        </div>

        {/* Filters — wrapped in Suspense because AuditLogFilters uses useSearchParams */}
        <div className="mt-4">
          <Suspense fallback={null}>
            <AuditLogFilters
              users={users}
              action={action}
              entityType={entityType}
              userId={userId}
            />
          </Suspense>
        </div>
      </div>

      <div className="page-content">
        <AuditLogTable logs={logs} />
      </div>
    </div>
  );
};

export default AuditLogSection;
