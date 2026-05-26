import { redirect } from "next/navigation";
import { getSessionUser } from "@/services/auth.service";
import { Sidebar } from "@/components/layout";

type DashboardLayoutProps = {
  children: React.ReactNode;
};

export default async function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  // Verify session and get user from DB — single source of truth for auth state
  const result = await getSessionUser();

  if (!result.success) {
    // Session missing or invalid — send to login
    redirect("/login");
  }

  const user = result.data;

  return (
    <div className="flex min-h-screen bg-(--color-bg-page)">
      {/* Fixed sidebar — stays in place as content scrolls */}
      <Sidebar user={user} />

      {/* Main content area — takes all remaining width */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {children}
      </main>
    </div>
  );
}
