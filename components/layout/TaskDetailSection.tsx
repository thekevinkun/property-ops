import Link from "next/link";
import { Role } from "@prisma/client";

import { Card, CardContent } from "@/components/ui/card";
import {
  TaskStatusBadge,
  TaskTransitionButton,
} from "@/components/features/tasks";

import { TaskDetail } from "@/types";
import { formatDateTime, formatBytes } from "@/helpers/format";

const MetaRow = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-(--color-text-400)">{label}</span>

      {children}
    </div>
  );
};

type Props = {
  task: TaskDetail;
  userRole: Role;
};

const TaskDetailSection = ({ task, userRole }: Props) => {
  return (
    <div>
      <div className="page-header">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-xs text-(--color-text-400) mb-3">
          <Link
            href="/dashboard/tasks"
            className="hover:underline text-(--color-text-600)"
          >
            Tasks
          </Link>

          <span>/</span>

          <span className="truncate max-w-48">{task.title}</span>
        </div>

        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-semibold text-(--color-text-900)">
                {task.title}
              </h1>

              <TaskStatusBadge status={task.status} />
            </div>

            <Link
              href={`/dashboard/properties/${task.property.id}`}
              className="text-sm mt-0.5 hover:underline text-(--color-text-600)"
            >
              {task.property.name}
            </Link>
          </div>

          <div className="shrink-0">
            <TaskTransitionButton
              taskId={task.id}
              currentStatus={task.status}
              userRole={userRole}
            />
          </div>
        </div>
      </div>

      <div className="page-content">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            {task.description && (
              <Card className="card-base">
                <CardContent className="p-5">
                  <p className="text-xs text-(--color-text-400) font-medium uppercase tracking-wider mb-2">
                    Description
                  </p>

                  <p className="text-sm text-(--color-text-900) whitespace-pre-wrap">
                    {task.description}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Evidence */}
            <Card className="card-base">
              <div
                className="flex items-center justify-between px-5 py-4"
                style={{
                  borderBottom: "1px solid var(--color-border)",
                }}
              >
                <p className="text-sm text-(--color-text-900) font-medium">
                  Evidence Photos
                </p>

                {(userRole === Role.OPERATOR || userRole === Role.ADMIN) && (
                  <span
                    className="bg-(--color-bg-subtle) text-xs text-(--color-text-400) px-2 py-1
                      border border-(--color-border) rounded"
                  >
                    Upload
                  </span>
                )}
              </div>

              {task.evidence.length === 0 ? (
                <CardContent className="p-8 text-center text-(--color-text-400)">
                  <p className="text-sm">No photos uploaded yet.</p>
                </CardContent>
              ) : (
                <div className="divide-y border-(--color-border)">
                  {task.evidence.map((ev) => (
                    <div
                      key={ev.id}
                      className="flex items-center justify-between px-5 py-3"
                    >
                      <div>
                        <p className="text-sm text-(--color-text-900)">
                          {ev.fileName}
                        </p>

                        <p className="text-xs text-(--color-text-400) mt-0.5">
                          {formatBytes(ev.sizeBytes)} · by {ev.uploadedBy.name}
                        </p>
                      </div>

                      <span className="font-mono text-xs text-(--color-text-400)">
                        {formatDateTime(ev.createdAt)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>

          {/* RIGHT */}
          <div className="flex flex-col gap-3">
            <Card className="card-base">
              <CardContent className="p-5">
                <p className="text-xs text-(--color-text-400) font-medium uppercase tracking-wider mb-3">
                  Details
                </p>

                <div className="flex flex-col gap-3">
                  <MetaRow label="Property">
                    <Link
                      href={`/dashboard/properties/${task.property.id}`}
                      className="text-sm text-(--color-text-900) hover:underline"
                    >
                      {task.property.name}
                    </Link>
                  </MetaRow>

                  <MetaRow label="Assigned to">
                    <span className="text-sm">
                      {task.assignedTo?.name ?? (
                        <span className="text-(--color-text-400)">
                          Unassigned
                        </span>
                      )}
                    </span>
                  </MetaRow>

                  <MetaRow label="Created by">
                    <span className="text-sm">{task.createdBy.name}</span>
                  </MetaRow>

                  <MetaRow label="Created">
                    <span className="text-xs text-(--color-text-600) font-mono">
                      {formatDateTime(task.createdAt)}
                    </span>
                  </MetaRow>

                  <MetaRow label="Last updated">
                    <span className="text-xs text-(--color-text-600) font-mono">
                      {formatDateTime(task.updatedAt)}
                    </span>
                  </MetaRow>

                  <MetaRow label="Task ID">
                    <span className="text-xs text-(--color-text-400) font-mono">
                      {task.id}
                    </span>
                  </MetaRow>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDetailSection;
