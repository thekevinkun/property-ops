"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Role } from "@prisma/client";
import { X } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

import { NAV_ITEMS } from "@/lib/constants";
import { SessionUser } from "@/types";

type SidebarProps = {
  user: SessionUser;
  onClose?: () => void;
};

const Sidebar = ({ user, onClose }: SidebarProps) => {
  const pathname = usePathname();

  return (
    <aside
      className="w-[240px] flex-shrink-0 flex flex-col border-r
        border-(--color-border) bg-(--color-bg-subtle) h-screen sticky top-0"
      aria-label="Main navigation"
    >
      {/* Logo area */}
      <div className="h-14 flex items-center justify-between px-4 border-b border-(--color-border)">
        <span className="text-sm font-semibold text-(--color-text-900) tracking-tight">
          Property Ops
        </span>

        {/* Close button — mobile only */}
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="btn-ghost lg:hidden p-1"
            aria-label="Close navigation"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        )}
      </div>

      {/* Nav items */}
      <nav className="flex-1 overflow-y-auto p-2 space-y-0.5">
        {NAV_ITEMS.map((item) => {
          if (item.roles && !item.roles.includes(user.role as Role)) {
            return null;
          }

          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname === item.href || pathname.startsWith(item.href + "/");

          return (
            <Link
              key={item.href}
              href={item.href}
              // Close sidebar on nav on mobile
              {...(onClose && { onClick: onClose })}
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
          <Avatar className="w-7 h-7 border border-(--color-border) bg-(--color-bg-input)">
            <AvatarFallback className="bg-(--color-bg-input) text-xs font-medium text-(--color-text-600)">
              {user.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-(--color-text-900) truncate leading-tight">
              {user.name}
            </p>

            <Badge
              className={`
                badge-base mt-0.5
                ${user.role === "ADMIN" ? "badge-role-admin" : ""}
                ${user.role === "OPERATOR" ? "badge-role-operator" : ""}
                ${user.role === "HOST" ? "badge-role-host" : ""}
              `}
            >
              {user.role.charAt(0) + user.role.slice(1).toLowerCase()}
            </Badge>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
