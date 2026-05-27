import { redirect } from "next/navigation";

import { getUsers } from "@/services/user.service";
import { getSessionUser } from "@/services/auth.service";

import { UsersSection } from "@/components/layout";

export default async function UsersPage() {
  const sessionUserResult = await getSessionUser();

  if (!sessionUserResult.success) {
    redirect("/login");
  }

  const sessionUser = sessionUserResult.data;

  if (sessionUser.role !== "ADMIN") {
    redirect("/unauthorized");
  }

  const usersResult = await getUsers();

  if (!usersResult.success) {
    return (
      <div className="page-content">
        <p className="text-sm text-(--color-status-cancelled)">
          {usersResult.error.message}
        </p>
      </div>
    );
  }

  return (
    <UsersSection users={usersResult.data} currentUserId={sessionUser.id} />
  );
}
