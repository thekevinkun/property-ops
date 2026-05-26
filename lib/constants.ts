import {
  LayoutDashboard,
  Building2,
  ClipboardList,
  ScrollText,
  Users,
} from "lucide-react";
import type { NavItem } from "@/types";

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
    // All roles see properties (scoped by role in the service layer)
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
