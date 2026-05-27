import { redirect } from "next/navigation";
import { getSessionUser } from "@/services/auth.service";
import { Sidebar, Topbar } from "@/components/layout";

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

  return (
    <div className="flex min-h-screen bg-(--color-bg-page)">
      <Sidebar user={user} />

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar sits above all page content — sign out always accessible */}
        <Topbar />
        {children}
      </main>
    </div>
  );
}
