"use client";

import { useCallback, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { X } from "lucide-react";

interface Props {
  currentQ: string;
  showInactive: boolean;
}

export function StaffFilters({ currentQ, showInactive }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const push = useCallback((patch: Record<string, string | undefined>) => {
    const next = new URLSearchParams(searchParams.toString());
    for (const [k, v] of Object.entries(patch)) {
      if (v) next.set(k, v); else next.delete(k);
    }
    next.delete("page");
    startTransition(() => router.push(`/admin/staff?${next.toString()}`));
  }, [router, searchParams]);

  const hasFilters = currentQ || showInactive;

  return (
    <div className="flex flex-wrap gap-2 mb-5 items-center">
      <input
        type="search"
        defaultValue={currentQ}
        placeholder="Search name or email…"
        className="rounded-lg border px-3 py-2 text-sm focus:outline-none flex-1 min-w-[200px]"
        style={{ borderColor: "#E4E5E8", color: "#13151A" }}
        onChange={(e) => {
          const v = e.target.value;
          const timer = setTimeout(() => push({ q: v || undefined }), 300);
          return () => clearTimeout(timer);
        }}
      />
      <label
        className="flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer text-sm select-none"
        style={{ borderColor: showInactive ? "#142036" : "#E4E5E8", color: "#5B5F6B", backgroundColor: showInactive ? "#E8EDF2" : "transparent" }}
      >
        <input
          type="checkbox"
          defaultChecked={showInactive}
          className="h-4 w-4"
          style={{ accentColor: "#142036" }}
          onChange={(e) => push({ inactive: e.target.checked ? "1" : undefined })}
        />
        Show deactivated
      </label>
      {hasFilters && (
        <button
          onClick={() => push({ q: undefined, inactive: undefined })}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm"
          style={{ borderColor: "#E4E5E8", color: "#5B5F6B" }}
        >
          <X className="h-3.5 w-3.5" aria-hidden="true" />
          Clear
        </button>
      )}
    </div>
  );
}
