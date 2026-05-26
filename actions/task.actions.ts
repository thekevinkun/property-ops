"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { TaskStatus } from "@prisma/client";
import { z } from "zod/v4";
import { createTask, transitionTaskStatus } from "@/services/task.service";
import { createServerSupabaseClient } from "@/lib/supabase";

type ActionResult = { success: true } | { success: false; error: string };

const createTaskSchema = z.object({
  title: z.string().min(1, "Title is required").max(150),
  description: z.string().max(1000).optional(),
  propertyId: z.string().min(1, "Property is required"),
  assignedToId: z.string().optional(),
});

// Server Action: create a task (Admin only — enforced in service layer).
export async function createTaskAction(
  formData: FormData,
): Promise<ActionResult> {
  const cookieStore = await cookies();
  const supabase = createServerSupabaseClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const parsed = createTaskSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description") || undefined,
    propertyId: formData.get("propertyId"),
    // Empty string means unassigned — treat as undefined
    assignedToId: formData.get("assignedToId") || undefined,
  });

  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? "Invalid input";
    return { success: false, error: message };
  }

  const result = await createTask(parsed.data, user.id);

  if (!result.success) return { success: false, error: result.error.message };

  revalidatePath("/dashboard/tasks");
  revalidatePath(`/dashboard/properties/${parsed.data.propertyId}`);
  return { success: true };
}

// Server Action: transition a task to a new status.
// newStatus comes from a button click — validated as a known TaskStatus value.
export async function transitionTaskAction(
  taskId: string,
  newStatus: TaskStatus,
): Promise<ActionResult> {
  const cookieStore = await cookies();
  const supabase = createServerSupabaseClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  // Confirm newStatus is a valid enum value — prevents arbitrary string injection
  if (!Object.values(TaskStatus).includes(newStatus)) {
    return { success: false, error: "Invalid status" };
  }

  const result = await transitionTaskStatus(taskId, newStatus, user.id);

  if (!result.success) return { success: false, error: result.error.message };

  // Revalidate the task detail page and the task list
  revalidatePath(`/dashboard/tasks/${taskId}`);
  revalidatePath("/dashboard/tasks");
  return { success: true };
}
