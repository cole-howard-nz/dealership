"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { List, CalendarDays } from "lucide-react";

interface Props {
  currentView: "list" | "calendar";
}

export function ViewToggle({ currentView }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function setView(v: "list" | "calendar") {
    const next = new URLSearchParams(searchParams.toString());
    next.set("view", v);
    if (v === "list") next.delete("month");
    router.push(`${pathname}?${next.toString()}`);
  }

  const btnBase = "flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-colors";
  const active = { backgroundColor: "#142036", color: "#ffffff" };
  const inactive = { backgroundColor: "#ffffff", color: "#5B5F6B" };

  return (
    <div
      className="inline-flex rounded-lg border overflow-hidden"
      style={{ borderColor: "#E4E5E8" }}
      role="group"
      aria-label="View mode"
    >
      <button
        onClick={() => setView("list")}
        className={btnBase}
        style={currentView === "list" ? active : inactive}
        aria-pressed={currentView === "list"}
      >
        <List className="h-3.5 w-3.5" aria-hidden="true" />
        List
      </button>
      <button
        onClick={() => setView("calendar")}
        className={`${btnBase} border-l`}
        style={currentView === "calendar" ? active : { ...inactive, borderColor: "#E4E5E8" }}
        aria-pressed={currentView === "calendar"}
      >
        <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
        Calendar
      </button>
    </div>
  );
}
