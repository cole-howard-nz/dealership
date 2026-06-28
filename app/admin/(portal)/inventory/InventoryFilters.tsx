"use client";

import { useCallback, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { X } from "lucide-react";

const selectClass = "rounded-lg border px-3 py-2 text-sm focus:outline-none appearance-none bg-white pr-8 bg-no-repeat bg-[right_0.6rem_center] cursor-pointer";
const selectStyle = { borderColor: "#E4E5E8", color: "#13151A", backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%235B5F6B' stroke-width='2.5'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")` };

interface Props {
  currentQ: string;
  currentStatus: string;
}

export function InventoryFilters({ currentQ, currentStatus }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const push = useCallback((patch: Record<string, string | undefined>) => {
    const next = new URLSearchParams(searchParams.toString());
    for (const [k, v] of Object.entries(patch)) {
      if (v) next.set(k, v); else next.delete(k);
    }
    next.delete("page");
    startTransition(() => router.push(`/admin/inventory?${next.toString()}`));
  }, [router, searchParams]);

  const hasFilters = currentQ || currentStatus;

  return (
    <div className="flex flex-wrap gap-2 mb-5 items-center">
      <input
        type="search"
        defaultValue={currentQ}
        placeholder="Search make, model, VIN…"
        className="rounded-lg border px-3 py-2 text-sm focus:outline-none flex-1 min-w-[200px]"
        style={{ borderColor: "#E4E5E8", color: "#13151A" }}
        onChange={(e) => {
          const v = e.target.value;
          const timer = setTimeout(() => push({ q: v || undefined }), 300);
          return () => clearTimeout(timer);
        }}
      />
      <div className="relative">
        <select
          defaultValue={currentStatus}
          className={selectClass}
          style={selectStyle}
          onChange={(e) => push({ status: e.target.value || undefined })}
        >
          <option value="">All statuses</option>
          <option value="AVAILABLE">Available</option>
          <option value="PENDING">Pending</option>
          <option value="SOLD">Sold</option>
          <option value="ARCHIVED">Archived</option>
        </select>
      </div>
      {hasFilters && (
        <button
          onClick={() => push({ q: undefined, status: undefined })}
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
