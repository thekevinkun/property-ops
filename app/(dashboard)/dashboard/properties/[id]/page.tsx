import { notFound, redirect } from "next/navigation";

import { getSessionUser } from "@/services/auth.service";

import { getPropertyDetail } from "@/services/property.service";

import { PropertyDetailSection } from "@/components/layout";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function PropertyDetailPage({ params }: Props) {
  // Next.js 16 — params are async, always await
  const { id } = await params;

  const sessionUserResult = await getSessionUser();

  if (!sessionUserResult.success) {
    redirect("/login");
  }

  const sessionUser = sessionUserResult.data;

  const result = await getPropertyDetail(id, sessionUser.id);

  if (!result.success) {
    // NOT_FOUND → 404.
    // FORBIDDEN → show 404 to avoid confirming the resource exists.
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
    <PropertyDetailSection property={result.data} userRole={sessionUser.role} />
  );
}
