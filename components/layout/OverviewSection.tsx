import { Role } from "@prisma/client";
import { Building2, ClipboardList, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { RoleGate } from "@/components/layout";

type Props = {
  user: {
    name: string;
    role: Role;
  };
};

const OverviewSection = ({ user }: Props) => {
  return (
    <div className="page-content">
      {/* Welcome */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-(--color-text-900) tracking-tight">
          Good to see you, {user.name.split(" ")[0]}
        </h1>

        <p className="mt-1 text-sm text-(--color-text-600)">
          Here&apos;s what&apos;s happening across your properties today.
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Properties */}
        <Card className="card-base p-0">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-(--color-text-600)">Properties</p>
              <Building2 className="w-4 h-4 text-(--color-text-400)" />
            </div>

            <p className="text-3xl font-semibold text-(--color-text-900)">—</p>

            <p className="mt-1 text-xs text-(--color-text-400)">
              Available later
            </p>
          </CardContent>
        </Card>

        {/* Tasks */}
        <Card className="card-base p-0">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-(--color-text-600)">Open Tasks</p>
              <ClipboardList className="w-4 h-4 text-(--color-text-400)" />
            </div>

            <p className="text-3xl font-semibold text-(--color-text-900)">—</p>

            <p className="mt-1 text-xs text-(--color-text-400)">
              Available later
            </p>
          </CardContent>
        </Card>

        {/* Users (admin only) */}
        <RoleGate userRole={user.role} allowedRoles={["ADMIN"]}>
          <Card className="card-base p-0">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm text-(--color-text-600)">Users</p>
                <Users className="w-4 h-4 text-(--color-text-400)" />
              </div>

              <p className="text-3xl font-semibold text-(--color-text-900)">
                —
              </p>

              <p className="mt-1 text-xs text-(--color-text-400)">
                Available later
              </p>
            </CardContent>
          </Card>
        </RoleGate>
      </div>

      {/* Session info */}
      <Card className="card-base mt-8 border-dashed p-0">
        <CardContent className="p-4">
          <p className="text-xs text-(--color-text-400) uppercase tracking-wider font-medium mb-1">
            Current session
          </p>

          <p className="text-sm text-(--color-text-600)">
            Signed in as{" "}
            <span className="font-medium text-(--color-text-900)">
              {user.name}
            </span>{" "}
            ·{" "}
            <Badge className="badge-base">
              {user.role.charAt(0) + user.role.slice(1).toLowerCase()}
            </Badge>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default OverviewSection;
