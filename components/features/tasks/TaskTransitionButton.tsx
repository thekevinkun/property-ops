"use client";

import { useState } from "react";
import { Role, TaskStatus } from "@prisma/client";
import { transitionTaskAction } from "@/actions/task.actions";

import { Button } from "@/components/ui/button";

import { getValidTransitions } from "@/lib/state-machine";
import { TRANSITION_CONFIG } from "@/helpers/tasks";

type Props = {
  taskId: string;
  currentStatus: TaskStatus;
  userRole: Role;
};

const TaskTransitionButton = ({ taskId, currentStatus, userRole }: Props) => {
  const [pending, setPending] = useState<TaskStatus | null>(null);

  const [error, setError] = useState<string | null>(null);

  // getValidTransitions is the single source of truth — no permission logic here
  const validTransitions = getValidTransitions(userRole, currentStatus);

  if (validTransitions.length === 0) return null;

  const handleTransition = async (newStatus: TaskStatus) => {
    setPending(newStatus);
    setError(null);

    try {
      const result = await transitionTaskAction(taskId, newStatus);

      if (!result.success) {
        setError(result.error);
      }
    } catch {
      setError("Unable to update task status. Please try again.");
    } finally {
      // On success, revalidatePath in the action refreshes the page — no local state needed
      setPending(null);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2 flex-wrap">
        {validTransitions.map((status) => {
          const { label, className } = TRANSITION_CONFIG[status];

          const isLoading = pending === status;

          return (
            <Button
              key={status}
              type="button"
              onClick={() => handleTransition(status)}
              disabled={pending !== null}
              className={className}
              aria-label={`${label} — transition task from ${currentStatus} to ${status}`}
            >
              {isLoading ? "Updating…" : label}
            </Button>
          );
        })}
      </div>

      {/* Error shown inline below buttons — no toast library needed */}
      {error && (
        <p className="text-xs text-(--color-status-cancelled)">{error}</p>
      )}
    </div>
  );
};

export default TaskTransitionButton;
