import Link from "next/link";
import { NAV_ITEMS } from "@/lib/constants";
import type { SessionUser, Role } from "@/types";

type SidebarProps = {
  user: SessionUser;
  // The current pathname — used to highlight the active nav item
  currentPath: string;
};

const Sidebar = ({ user, currentPath }: SidebarProps) => {
  return (
    <aside
      className="w-[240px] flex-shrink-0 flex flex-col border-r border-(--color-border) bg-(--color-bg-subtle) h-screen sticky top-0"
      aria-label="Main navigation"
    >
      {/* Logo area */}
      <div className="h-14 flex items-center px-4 border-b border-(--color-border)">
        <span className="text-sm font-semibold text-(--color-text-900) tracking-tight">
          Property Ops
        </span>
      </div>

      {/* Nav items */}
      <nav className="flex-1 overflow-y-auto p-2 space-y-0.5">
        {NAV_ITEMS.map((item) => {
          // Skip items the current role cannot see
          if (item.roles && !item.roles.includes(user.role as Role)) {
            return null;
          }

          // Exact match for overview, prefix match for nested routes
          const isActive =
            item.href === "/dashboard"
              ? currentPath === "/dashboard"
              : currentPath.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-item ${isActive ? "nav-item-active" : ""}`}
              aria-current={isActive ? "page" : undefined}
            >
              <item.icon className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User info + role badge at bottom */}
      <div className="p-3 border-t border-(--color-border)">
        <div className="flex items-center gap-2.5 px-2 py-2">
          {/* Avatar — initials-based, no image needed */}
          <div
            className="w-7 h-7 rounded-full bg-(--color-bg-input) border border-(--color-border) 
              flex items-center justify-center flex-shrink-0"
            aria-hidden="true"
          >
            <span className="text-xs font-medium text-(--color-text-600)">
              {user.name.charAt(0).toUpperCase()}
            </span>
          </div>

          <div className="flex-1 min-w-0">
            {/* Name — truncated if long */}
            <p className="text-sm font-medium text-(--color-text-900) truncate leading-tight">
              {user.name}
            </p>
            {/* Role badge */}
            <span
              className={`
                badge-base mt-0.5
                ${user.role === "ADMIN" ? "badge-role-admin" : ""}
                ${user.role === "OPERATOR" ? "badge-role-operator" : ""}
                ${user.role === "HOST" ? "badge-role-host" : ""}
              `}
            >
              {user.role.charAt(0) + user.role.slice(1).toLowerCase()}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
