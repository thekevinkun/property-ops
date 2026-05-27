import Link from "next/link";
import { Role } from "@prisma/client";

import { Card, CardContent } from "@/components/ui/card";
import {
  TaskStatusBadge,
  TaskTransitionButton,
} from "@/components/features/tasks";
import { EvidenceSection } from "@/components/features/evidence";

import { TaskDetail } from "@/types";
import { formatDateTime } from "@/helpers/format";

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
  currentUserId: string;
};

const TaskDetailSection = ({ task, userRole, currentUserId }: Props) => {
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

        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-1 sm:gap-3 mb-2 sm:mb-0">
              <h1 className="order-2 text-xl font-semibold text-(--color-text-900)">
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
            <Card className="card-base p-0 overflow-hidden">
              <EvidenceSection
                taskId={task.id}
                evidence={task.evidence}
                userRole={userRole}
                currentUserId={currentUserId}
              />
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
