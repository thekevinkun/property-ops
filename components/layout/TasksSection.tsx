import Link from "next/link";
import { Role } from "@prisma/client";

import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { TaskCard, TaskForm } from "@/components/features/tasks";

import { STATUS_TABS } from "@/helpers/status";
import { TaskWithMeta } from "@/types";

type Property = { id: string; name: string };

type Operator = {
  id: string;
  name: string;
  email: string;
};

type Props = {
  tasks: TaskWithMeta[];
  allTasksCount: number;
  status: string;
  userRole: Role;
  properties: Property[];
  operators: Operator[];
};

const TasksSection = ({
  tasks,
  allTasksCount,
  status,
  userRole,
  properties,
  operators,
}: Props) => {
  const isAdmin = userRole === Role.ADMIN;

  return (
    <div>
      {/* HEADER */}
      <div className="page-header">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-(--color-text-900)">
              Tasks
            </h1>

            <p className="text-sm mt-0.5 text-(--color-text-600)">
              {tasks.length} of {allTasksCount} task
              {allTasksCount !== 1 ? "s" : ""}
              {userRole === Role.OPERATOR ? " assigned to you" : ""}
            </p>
          </div>

          {/* CREATE TASK (ADMIN ONLY) */}
          {isAdmin && (
            <Dialog>
              {/* Trigger button */}
              <DialogTrigger className="btn-primary">New Task</DialogTrigger>

              {/* Modal content */}
              <DialogContent className="card-base sm:max-w-md">
                {/* Header */}
                <DialogHeader>
                  <DialogTitle className="text-sm font-medium text-(--color-text-900)">
                    Create Task
                  </DialogTitle>

                  <DialogDescription>
                    Assign a new work order to a property and operator.
                  </DialogDescription>
                </DialogHeader>

                {/* Form */}
                <TaskForm properties={properties} operators={operators} />
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Status filter tabs — URL-driven, works without JS for SSR correctness */}
        <div className="flex items-center gap-1 mt-4 overflow-x-auto">
          {STATUS_TABS.map((tab) => {
            const isActive = (status ?? "all") === tab.value;

            return (
              <Link
                key={tab.value}
                href={`/dashboard/tasks?status=${tab.value}`}
                className="px-3 py-1.5 rounded text-xs font-medium whitespace-nowrap transition-colors"
                style={{
                  background: isActive ? "var(--color-accent)" : "transparent",
                  color: isActive
                    ? "var(--color-text-inverse)"
                    : "var(--color-text-600)",
                  border: isActive
                    ? "1px solid var(--color-accent)"
                    : "1px solid transparent",
                }}
              >
                {tab.label}

                {tab.value !== "all" && (
                  <span className="ml-1.5 opacity-70">
                    {tasks.filter((t) => tab.value === t.status).length}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </div>

      {/* CONTENT */}
      <div className="page-content">
        {tasks.length === 0 ? (
          <Card className="card-base p-0">
            <CardContent className="p-10 text-center text-(--color-text-400)">
              <p className="text-sm">
                No tasks {status !== "all" ? `with status "${status}"` : "yet"}.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="flex flex-col gap-2">
            {tasks.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TasksSection;
