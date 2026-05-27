"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LogOut, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase";
import { formatLiveDateTime } from "@/helpers/format";

type Props = {
  onMenuClick: () => void;
};

const Topbar = ({ onMenuClick }: Props) => {
  const router = useRouter();
  const supabase = createClient();
  const [dateTime, setDateTime] = useState<string>("");

  useEffect(() => {
    setDateTime(formatLiveDateTime(new Date()));

    const now = new Date();
    const msUntilNextMinute =
      (60 - now.getSeconds()) * 1000 - now.getMilliseconds();

    let interval: ReturnType<typeof setInterval>;

    const timeout = setTimeout(() => {
      setDateTime(formatLiveDateTime(new Date()));
      interval = setInterval(() => {
        setDateTime(formatLiveDateTime(new Date()));
      }, 60_000);
    }, msUntilNextMinute);

    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <header
      className="h-14 flex items-center justify-between pl-4 pr-6
        border-b border-(--color-border) bg-(--color-bg-page) sticky top-0 z-10"
    >
      <div className="flex items-center gap-3">
        {/* Hamburger — mobile only */}
        <Button
          type="button"
          variant="ghost"
          onClick={onMenuClick}
          className="btn-ghost lg:hidden p-2"
          aria-label="Open navigation"
        >
          <Menu className="w-4 h-4" aria-hidden="true" />
        </Button>

        {/* Live date/time — hidden on very small screens, shown from sm up */}
        <p className="hidden sm:block text-sm text-(--color-text-400) font-mono">
          {dateTime}
        </p>
      </div>

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
