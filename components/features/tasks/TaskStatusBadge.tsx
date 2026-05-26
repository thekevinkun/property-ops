import { STATUS_CONFIG } from "@/helpers/tasks";
import { TaskStatus } from "@prisma/client";

type Props = {
  status: TaskStatus;
};

const TaskStatusBadge = ({ status }: Props) => {
  const { label, className } = STATUS_CONFIG[status];
  return <span className={className}>{label}</span>;
};

export default TaskStatusBadge;
