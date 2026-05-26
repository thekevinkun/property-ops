import { redirect } from "next/navigation";
import { getSessionUser } from "@/services/auth.service";
import { RoleGate, Topbar } from "@/components/layout";
import { Building2, ClipboardList, Users } from "lucide-react";

export default async function DashboardPage() {
  const result = await getSessionUser();

  if (!result.success) {
    redirect("/login");
  }

  const user = result.data;

  return (
    <>
      <Topbar title="Overview" />

      <div className="page-content">
        {/* Welcome line */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-(--color-text-900) tracking-tight">
            Good to see you, {user.name.split(" ")[0]}
          </h1>
          <p className="mt-1 text-sm text-(--color-text-600)">
            Here&apos;s what&apos;s happening across your properties today.
          </p>
        </div>

        {/* Stat cards — role-scoped. Placeholders until wires real data. */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Properties card — all roles */}
          <div className="card-base p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-(--color-text-600)">Properties</p>
              <Building2
                className="w-4 h-4 text-(--color-text-400)"
                aria-hidden="true"
              />
            </div>
            <p className="text-3xl font-semibold text-(--color-text-900) tracking-tight">
              —
            </p>
            <p className="mt-1 text-xs text-(--color-text-400)">
              Available later
            </p>
          </div>

          {/* Tasks card — all roles */}
          <div className="card-base p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-(--color-text-600)">Open Tasks</p>
              <ClipboardList
                className="w-4 h-4 text-(--color-text-400)"
                aria-hidden="true"
              />
            </div>
            <p className="text-3xl font-semibold text-(--color-text-900) tracking-tight">
              —
            </p>
            <p className="mt-1 text-xs text-(--color-text-400)">
              Available later
            </p>
          </div>

          {/* Admin-only: Users card */}
          <RoleGate userRole={user.role} allowedRoles={["ADMIN"]}>
            <div className="card-base p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm text-(--color-text-600)">Users</p>
                <Users
                  className="w-4 h-4 text-(--color-text-400)"
                  aria-hidden="true"
                />
              </div>
              <p className="text-3xl font-semibold text-(--color-text-900) tracking-tight">
                —
              </p>
              <p className="mt-1 text-xs text-(--color-text-400)">
                Available later
              </p>
            </div>
          </RoleGate>
        </div>

        {/* Role context note — useful for Adriano's demo walkthrough */}
        <div className="mt-8 card-base p-4 border-dashed">
          <p className="text-xs text-(--color-text-400) uppercase tracking-wider font-medium mb-1">
            Current session
          </p>
          <p className="text-sm text-(--color-text-600)">
            Signed in as{" "}
            <span className="font-medium text-(--color-text-900)">
              {user.name}
            </span>{" "}
            ·{" "}
            <span
              className={`
                badge-base
                ${user.role === "ADMIN" ? "badge-role-admin" : ""}
                ${user.role === "OPERATOR" ? "badge-role-operator" : ""}
                ${user.role === "HOST" ? "badge-role-host" : ""}
              `}
            >
              {user.role.charAt(0) + user.role.slice(1).toLowerCase()}
            </span>
          </p>
        </div>
      </div>
    </>
  );
}
