import { redirect } from "next/navigation";
import { headers } from "next/headers";
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

  // Get current pathname for active nav item highlighting
  // headers() gives us the URL in server components without usePathname
  const headersList = await headers();
  const currentPath = headersList.get("x-invoke-path") ?? "/dashboard";

  return (
    <div className="flex min-h-screen bg-(--color-bg-page)">
      {/* Fixed sidebar — stays in place as content scrolls */}
      <Sidebar user={user} currentPath={currentPath} />

      {/* Main content area — takes all remaining width */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {children}
      </main>
    </div>
  );
}
