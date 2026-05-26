import Link from "next/link";

import { Card, CardContent } from "@/components/ui/card";
import { TaskStatusBadge } from "@/components/features/tasks";

import { formatDate } from "@/helpers/format";
import { TaskWithMeta } from "@/types/index";

type Props = {
  task: TaskWithMeta;
};

const TaskCard = ({ task }: Props) => {
  return (
    <Link href={`/dashboard/tasks/${task.id}`} className="block">
      <Card className="card-interactive p-0">
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              {/* Title truncates on narrow layouts — full text on detail page */}
              <p className="font-medium text-sm text-(--color-text-900) truncate">
                {task.title}
              </p>

              <p className="text-xs text-(--color-text-600) mt-0.5 truncate">
                {task.property.name}
              </p>
            </div>

            <TaskStatusBadge status={task.status} />
          </div>

          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-3">
              {/* Assignee — shows "Unassigned" when null so the card is never ambiguous */}
              <span className="text-xs text-(--color-text-400)">
                {task.assignedTo ? task.assignedTo.name : "Unassigned"}
              </span>

              {task._count.evidence > 0 && (
                <span className="text-xs text-(--color-text-400)">
                  {task._count.evidence} photo
                  {task._count.evidence !== 1 ? "s" : ""}
                </span>
              )}
            </div>

            <span className="font-mono text-xs text-(--color-text-400)">
              {formatDate(task.createdAt)}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default TaskCard;
