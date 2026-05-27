"use server";

import { revalidatePath } from "next/cache";
import { Role } from "@prisma/client";
import {
  getUsers,
  changeUserRole,
  UserWithRole,
} from "@/services/user.service";

// Fetches all users. Admin only — enforced in service layer.
export async function getUsersAction(): Promise<{
  data?: UserWithRole[];
  error?: string;
}> {
  const result = await getUsers();

  if (!result.success) {
    return { error: result.error.message };
  }

  return { data: result.data };
}

// Changes a user's role. Admin only — enforced in service layer.
// Revalidates users and audit pages so both reflect the change immediately.
export async function changeUserRoleAction(
  targetUserId: string,
  newRole: Role,
): Promise<{ data?: { id: string; role: Role }; error?: string }> {
  const result = await changeUserRole(targetUserId, newRole);

  if (!result.success) {
    return { error: result.error.message };
  }

  revalidatePath("/dashboard/users");
  revalidatePath("/dashboard/audit");

  return { data: result.data };
}
