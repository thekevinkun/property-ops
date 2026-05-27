import { redirect } from "next/navigation";
import { getSessionUser } from "@/services/auth.service";
import { DashboardShell } from "@/components/layout";

type DashboardLayoutProps = {
  children: React.ReactNode;
};

export default async function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  const result = await getSessionUser();

  if (!result.success) {
    redirect("/login");
  }

  const user = result.data;

  return <DashboardShell user={user}>{children}</DashboardShell>;
}
