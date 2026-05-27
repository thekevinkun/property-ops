import { AuditLogWithUser } from "@/types/index";
import { AUDIT_ACTION_CONFIG } from "@/helpers/audit";
import { formatDateTime } from "@/helpers/format";

type Props = {
  logs: AuditLogWithUser[];
};

// Renders a single metadata pill — before/after state from the audit record
const MetaPill = ({ label, value }: { label: string; value: string }) => (
  <span className="inline-flex items-center gap-1 text-xs font-mono text-(--color-text-600)">
    <span className="text-(--color-text-400)">{label}:</span>
    {value}
  </span>
);

// Extracts a readable summary from before/after JSON fields.
// Covers the most common cases — status transitions and role changes.
const renderDelta = (log: AuditLogWithUser) => {
  const before = log.before as Record<string, string> | null;
  const after = log.after as Record<string, string> | null;

  if (!before && !after) return null;

  // Status transition — show arrow format matching the audit metadata
  if (after?.status) {
    return (
      <div className="flex items-center gap-2 flex-wrap">
        {before?.status && <MetaPill label="from" value={before.status} />}
        {before?.status && (
          <span className="text-(--color-text-400) text-xs">→</span>
        )}
        <MetaPill label="to" value={after.status} />
      </div>
    );
  }

  // Role change
  if (after?.role) {
    return (
      <div className="flex items-center gap-2 flex-wrap">
        {before?.role && <MetaPill label="from" value={before.role} />}
        {before?.role && (
          <span className="text-(--color-text-400) text-xs">→</span>
        )}
        <MetaPill label="to" value={after.role} />
      </div>
    );
  }

  // Generic after fields — title, propertyId, etc.
  if (after) {
    const key = Object.keys(after)[0];
    if (key) return <MetaPill label={key} value={String(after[key])} />;
  }

  return null;
};

const AuditLogTable = ({ logs }: Props) => {
  if (logs.length === 0) {
    return (
      <div className="card-base p-8 text-center">
        <p className="text-sm text-(--color-text-400)">
          No audit log entries found.
        </p>
      </div>
    );
  }

  return (
    <div className="card-base overflow-hidden">
      <table className="table-base">
        <thead>
          <tr>
            <th>Action</th>
            <th>Entity</th>
            <th>Change</th>
            <th>Performed by</th>
            <th>When</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log) => {
            const { label, className } = AUDIT_ACTION_CONFIG[log.action];
            return (
              <tr key={log.id}>
                <td>
                  <span className={className}>{label}</span>
                </td>
                <td>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm capitalize">{log.entityType}</span>
                    <span className="text-xs font-mono text-(--color-text-400) truncate max-w-32">
                      {log.entityId}
                    </span>
                  </div>
                </td>
                <td>{renderDelta(log)}</td>
                <td>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm">{log.user.name}</span>
                    <span className="text-xs text-(--color-text-400)">
                      {log.user.email}
                    </span>
                  </div>
                </td>
                <td>
                  <span className="text-xs font-mono text-(--color-text-600)">
                    {formatDateTime(log.createdAt)}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default AuditLogTable;
