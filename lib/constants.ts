import { Role } from "@prisma/client";
import {
  LayoutDashboard,
  Building2,
  ClipboardList,
  ScrollText,
  Users,
} from "lucide-react";

// UI HELPERS
// Nav item shape used by sidebar — role filtering applied before rendering
export type NavItem = {
  label: string;
  href: string;
  // Lucide icon component — typed as a React component accepting SVG props
  icon: React.ComponentType<{ className?: string }>;
  // If set, only these roles see this nav item
  roles?: Role[];
};

// Nav items with their role restrictions.
// Items without a `roles` array are visible to all authenticated users.
export const NAV_ITEMS: NavItem[] = [
  {
    label: "Overview",
    href: "/dashboard",
    icon: LayoutDashboard,
    // All roles see the overview
  },
  {
    label: "Properties",
    href: "/dashboard/properties",
    icon: Building2,
    roles: [Role.HOST, Role.ADMIN],
  },
  {
    label: "Tasks",
    href: "/dashboard/tasks",
    icon: ClipboardList,
    // All roles see tasks (scoped by role in the service layer)
  },
  {
    label: "Audit Log",
    href: "/dashboard/audit",
    icon: ScrollText,
    roles: ["ADMIN"],
  },
  {
    label: "Users",
    href: "/dashboard/users",
    icon: Users,
    roles: ["ADMIN"],
  },
];
