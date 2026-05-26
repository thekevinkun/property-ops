import { redirect } from "next/navigation";
import { getSessionUser } from "@/services/auth.service";
import { Topbar, OverviewSection } from "@/components/layout";

export default async function DashboardPage() {
  const result = await getSessionUser();

  if (!result.success) {
    redirect("/login");
  }

  const user = result.data;

  return (
    <>
      <Topbar title="Overview" />
      <OverviewSection user={user} />
    </>
  );
}
