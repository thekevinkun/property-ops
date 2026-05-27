import { redirect, notFound } from "next/navigation";

import { getSessionUser } from "@/services/auth.service";
import { getTaskDetail } from "@/services/task.service";

import { TaskDetailSection } from "@/components/layout";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function TaskDetailPage({ params }: Props) {
  const { id } = await params;

  const sessionUserResult = await getSessionUser();

  if (!sessionUserResult.success) {
    redirect("/login");
  }

  const sessionUser = sessionUserResult.data;

  const result = await getTaskDetail(id);

  if (!result.success) {
    if (
      result.error.code === "NOT_FOUND" ||
      result.error.code === "FORBIDDEN"
    ) {
      notFound();
    }

    return (
      <div className="page-content">
        <p className="text-sm text-(--color-status-cancelled)">
          {result.error.message}
        </p>
      </div>
    );
  }

  return (
    <TaskDetailSection
      task={result.data}
      userRole={sessionUser.role}
      currentUserId={sessionUser.id}
    />
  );
}
