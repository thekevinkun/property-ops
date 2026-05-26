import { redirect } from "next/navigation";

import { Role } from "@prisma/client";

import { getSessionUser } from "@/services/auth.service";
import { getProperties } from "@/services/property.service";

import { PropertiesSection } from "@/components/layout";

// Server Component — no "use client". All data fetched server-side before render.
export default async function PropertiesPage() {
  const sessionUserResult = await getSessionUser();

  if (!sessionUserResult.success) {
    redirect("/login");
  }

  const sessionUser = sessionUserResult.data;

  // Operators navigate properties through tasks — redirect them directly
  if (sessionUser.role === Role.OPERATOR) {
    redirect("/dashboard/tasks");
  }

  const result = await getProperties(sessionUser.id);

  if (!result.success) {
    return (
      <div className="page-content">
        <p className="text-sm text-(--color-status-cancelled)">
          {result.error.message}
        </p>
      </div>
    );
  }

  return (
    <PropertiesSection properties={result.data} userRole={sessionUser.role} />
  );
}
