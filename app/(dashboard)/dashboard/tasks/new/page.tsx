import { redirect } from "next/navigation";

import { Role } from "@prisma/client";
import { getSessionUser } from "@/services/auth.service";
import { getProperties } from "@/services/property.service";
import { getOperators } from "@/services/task.service";

import { TaskNewSection } from "@/components/layout";

type Props = {
  searchParams: Promise<{ propertyId?: string }>;
};

export default async function NewTaskPage({ searchParams }: Props) {
  const { propertyId } = await searchParams;

  const sessionUserResult = await getSessionUser();

  if (!sessionUserResult.success) redirect("/login");

  const sessionUser = sessionUserResult.data;

  if (sessionUser.role !== Role.ADMIN) redirect("/unauthorized");

  const [propsResult, opsResult] = await Promise.all([
    getProperties(sessionUser.id),
    getOperators(),
  ]);

  const properties = propsResult.success
    ? propsResult.data.map((p) => ({ id: p.id, name: p.name }))
    : [];

  const operators = opsResult.success ? opsResult.data : [];

  return (
    <TaskNewSection
      propertyId={propertyId}
      properties={properties}
      operators={operators}
    />
  );
}
