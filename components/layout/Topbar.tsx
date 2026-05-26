"use client";

import { useRouter } from "next/navigation";

import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

import { createClient } from "@/lib/supabase";

type TopbarProps = {
  // Page title passed from each dashboard page
  title: string;
};

const Topbar = ({ title }: TopbarProps) => {
  const router = useRouter();

  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();

    // Redirect to login after session is cleared
    router.push("/login");
    router.refresh();
  };

  return (
    <header className="h-14 flex items-center justify-between px-6 border-b border-(--color-border) bg-(--color-bg-page) sticky top-0 z-10">
      {/* Page title */}
      <h2 className="text-sm font-medium text-(--color-text-900)">{title}</h2>

      {/* Sign out button */}
      <Button
        type="button"
        variant="ghost"
        onClick={handleSignOut}
        className="btn-ghost"
        aria-label="Sign out"
      >
        <LogOut className="w-4 h-4" aria-hidden="true" />
        <span>Sign out</span>
      </Button>
    </header>
  );
};

export default Topbar;
