import { redirect } from "next/navigation";

import { Role } from "@prisma/client";

import { getSessionUser } from "@/services/auth.service";
import { getTasks } from "@/services/task.service";
import { getProperties } from "@/services/property.service";
import { getOperators } from "@/services/task.service";

import { TasksSection } from "@/components/layout";
import { filterByStatus } from "@/helpers/status";

type Props = {
  searchParams: Promise<{
    status?: string;
  }>;
};

export default async function TasksPage({ searchParams }: Props) {
  const { status = "all" } = await searchParams;

  const sessionUserResult = await getSessionUser();

  if (!sessionUserResult.success) {
    redirect("/login");
  }

  const sessionUser = sessionUserResult.data;

  const tasksResult = await getTasks();

  if (!tasksResult.success) {
    return (
      <div className="page-content">
        <p className="text-sm text-(--color-status-cancelled)">
          {tasksResult.error.message}
        </p>
      </div>
    );
  }

  const allTasks = tasksResult.data;

  const filteredTasks = filterByStatus(allTasks, status);

  const isAdmin = sessionUser.role === Role.ADMIN;

  let properties: {
    id: string;
    name: string;
  }[] = [];

  let operators: {
    id: string;
    name: string;
    email: string;
  }[] = [];

  if (isAdmin) {
    const [propsResult, opsResult] = await Promise.all([
      getProperties(),
      getOperators(),
    ]);

    if (propsResult.success) {
      properties = propsResult.data.map((p) => ({
        id: p.id,
        name: p.name,
      }));
    }

    if (opsResult.success) {
      operators = opsResult.data;
    }
  }

  return (
    <TasksSection
      tasks={filteredTasks}
      allTasksCount={allTasks.length}
      status={status}
      userRole={sessionUser.role}
      properties={properties}
      operators={operators}
    />
  );
}
