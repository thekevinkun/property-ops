"use client";

import { useState } from "react";
import { Sidebar, Topbar } from "@/components/layout";
import { SessionUser } from "@/types";

type Props = {
  user: SessionUser;
  children: React.ReactNode;
};

const DashboardShell = ({ user, children }: Props) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-(--color-bg-page)">
      {/* Mobile overlay — closes sidebar when tapping outside */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar — fixed on mobile when open, always visible on desktop */}
      <div
        className={`
          fixed inset-y-0 left-0 z-30 lg:relative lg:block
          transition-transform duration-250 ease-smooth
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        <Sidebar user={user} onClose={() => setSidebarOpen(false)} />
      </div>

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Topbar onMenuClick={() => setSidebarOpen((prev) => !prev)} />
        {children}
      </main>
    </div>
  );
};

export default DashboardShell;
