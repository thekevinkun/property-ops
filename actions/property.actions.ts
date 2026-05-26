"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { z } from "zod/v4";
import { createProperty } from "@/services/property.service";
import { createServerSupabaseClient } from "@/lib/supabase";

const createPropertySchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  address: z.string().min(1, "Address is required").max(200),
  description: z.string().max(500).optional(),
});

type ActionResult = { success: true } | { success: false; error: string };

// Server Action: create a property.
// Zod validates before the service is called — invalid input never reaches the DB.
export async function createPropertyAction(
  formData: FormData,
): Promise<ActionResult> {
  const cookieStore = await cookies();
  const supabase = createServerSupabaseClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const parsed = createPropertySchema.safeParse({
    name: formData.get("name"),
    address: formData.get("address"),
    description: formData.get("description") || undefined,
  });

  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? "Invalid input";
    return { success: false, error: message };
  }

  const result = await createProperty(parsed.data, user.id);

  if (!result.success) return { success: false, error: result.error.message };

  // Revalidate both the list page and the new detail page
  revalidatePath("/dashboard/properties");
  return { success: true };
}
