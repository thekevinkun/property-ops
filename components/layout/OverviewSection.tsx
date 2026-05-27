import Link from "next/link";
import { Role } from "@prisma/client";
import { Building2, ClipboardList, Users, ScrollText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { RoleGate } from "@/components/layout";

type Props = {
  user: { name: string; role: Role };
  taskCount: number;
  propertyCount: number;
  userCount: number;
  auditCount: number;
};

const StatCard = ({
  label,
  value,
  icon: Icon,
  href,
}: {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
}) => (
  <Link href={href}>
    <Card className="card-interactive p-0">
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm text-(--color-text-600)">{label}</p>
          <Icon className="w-4 h-4 text-(--color-text-400)" />
        </div>
        <p className="text-3xl font-semibold text-(--color-text-900)">
          {value}
        </p>
      </CardContent>
    </Card>
  </Link>
);

const OverviewSection = ({
  user,
  taskCount,
  propertyCount,
  userCount,
  auditCount,
}: Props) => {
  const isOperator = user.role === Role.OPERATOR;

  return (
    <div className="page-content">
      {/* Welcome */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-(--color-text-900) tracking-tight">
          Good to see you, {user.name.split(" ")[0]}
        </h1>
        <p className="mt-1 text-sm text-(--color-text-600)">
          {isOperator
            ? "Here are your open tasks for today."
            : "Here's what's happening across your properties today."}
        </p>
      </div>

      {/* Stat cards — clickable, navigate to the relevant page */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <RoleGate userRole={user.role} allowedRoles={[Role.HOST, Role.ADMIN]}>
          <StatCard
            label="Properties"
            value={propertyCount}
            icon={Building2}
            href="/dashboard/properties"
          />
        </RoleGate>

        <StatCard
          label={isOperator ? "Your Open Tasks" : "Open Tasks"}
          value={taskCount}
          icon={ClipboardList}
          href="/dashboard/tasks"
        />

        <RoleGate userRole={user.role} allowedRoles={[Role.ADMIN]}>
          <StatCard
            label="Users"
            value={userCount}
            icon={Users}
            href="/dashboard/users"
          />
        </RoleGate>

        <RoleGate userRole={user.role} allowedRoles={[Role.ADMIN]}>
          <StatCard
            label="Audit Log"
            value={auditCount}
            icon={ScrollText}
            href="/dashboard/audit"
          />
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
