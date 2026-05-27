"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

import { createClient } from "@/lib/supabase";
import { formatLiveDateTime } from "@/helpers/format";

const Topbar = () => {
  const router = useRouter();
  const supabase = createClient();

  const [dateTime, setDateTime] = useState<string>("");

  useEffect(() => {
    // Set immediately on mount — avoids blank flash
    setDateTime(formatLiveDateTime(new Date()));

    // Calculate ms until next full minute so the clock ticks exactly on the minute
    const now = new Date();
    const msUntilNextMinute =
      (60 - now.getSeconds()) * 1000 - now.getMilliseconds();

    let interval: ReturnType<typeof setInterval>;

    const timeout = setTimeout(() => {
      setDateTime(formatLiveDateTime(new Date()));
      // Now tick every exact minute
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
      className="h-14 flex items-center justify-between pl-8 pr-6
        border-b border-(--color-border) bg-(--color-bg-page) sticky top-0 z-10"
    >
      {/* Live date and time — updates every minute */}
      <p className="text-sm text-(--color-text-400) font-mono">{dateTime}</p>

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
