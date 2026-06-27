"use client";

import { useTransition, useState } from "react";
import { Trash2, Loader2 } from "lucide-react";

interface DeleteRoleButtonProps {
  roleId: string;
  roleName: string;
  userCount: number;
  deleteAction: (id: string) => Promise<{ error: string | null }>;
}

export function DeleteRoleButton({ roleId, roleName, userCount, deleteAction }: DeleteRoleButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const disabled = userCount > 0 || isPending;

  function handleDelete() {
    if (!confirm(`Delete the "${roleName}" role? This cannot be undone.`)) return;
    setError(null);
    startTransition(async () => {
      const result = await deleteAction(roleId);
      if (result.error) setError(result.error);
    });
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={handleDelete}
        disabled={disabled}
        title={userCount > 0 ? `Cannot delete — ${userCount} user(s) assigned` : "Delete role"}
        className="p-1.5 rounded-lg border transition-colors hover:bg-red-50 disabled:opacity-40 disabled:cursor-not-allowed"
        style={{ borderColor: "#E4E5E8", color: "#9CA3AF" }}
      >
        {isPending
          ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          : <Trash2 className="h-4 w-4" aria-hidden="true" />}
      </button>
      {error && (
        <div
          className="absolute right-0 top-9 w-64 rounded-lg border px-3 py-2 text-xs z-10 shadow-md"
          style={{ borderColor: "#FCA5A5", backgroundColor: "#FEF2F2", color: "#DC2626" }}
        >
          {error}
        </div>
      )}
    </div>
  );
}
