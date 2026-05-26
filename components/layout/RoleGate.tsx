import type { Role } from "@/types";

type RoleGateProps = {
  // The authenticated user's current role
  userRole: Role;
  // Render children only if the user has one of these roles
  allowedRoles: Role[];
  children: React.ReactNode;
  // Optional fallback — rendered when access is denied. Defaults to null.
  fallback?: React.ReactNode;
};

const RoleGate = ({
  userRole,
  allowedRoles,
  children,
  fallback = null,
}: RoleGateProps) => {
  // Simple inclusion check — no async needed, role comes from the server layout
  const hasAccess = allowedRoles.includes(userRole);

  return hasAccess ? <>{children}</> : <>{fallback}</>;
};

export default RoleGate;
