import { TaskWithMeta } from "@/types/index";

// Status filter labels shown as tabs above the task list
export const STATUS_TABS: { label: string; value: string }[] = [
  { label: "All", value: "all" },
  { label: "Pending", value: "PENDING" },
  { label: "In Progress", value: "IN_PROGRESS" },
  { label: "Done", value: "DONE" },
  { label: "Cancelled", value: "CANCELLED" },
];

export function filterByStatus(
  tasks: TaskWithMeta[],
  status: string,
): TaskWithMeta[] {
  if (status === "all" || !status) return tasks;
  return tasks.filter((t) => t.status === status);
}
