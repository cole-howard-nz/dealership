"use client";

import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, AlertCircle } from "lucide-react";
import { PermissionMatrix } from "./PermissionMatrix";

interface RoleFormSubmitProps {
  action: (formData: FormData) => Promise<{ error: string | null; id?: string }>;
  defaultName: string;
  defaultPermissions: string[];
  cancelHref: string;
  disabled?: boolean;
}

export function RoleFormSubmit({ action, defaultName, defaultPermissions, cancelHref, disabled = false }: RoleFormSubmitProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await action(formData);
      if (result.error) {
        setError(result.error);
      } else {
        setSuccess(true);
        // Server action may redirect, or we show success
        if (result.id) {
          router.push(`/admin/roles/${result.id}`);
        }
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="flex items-center gap-2 rounded-lg border px-4 py-3 text-sm"
          style={{ borderColor: "#FCA5A5", backgroundColor: "#FEF2F2", color: "#DC2626" }}>
          <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-lg border px-4 py-3 text-sm"
          style={{ borderColor: "#86EFAC", backgroundColor: "#F0FDF4", color: "#15803D" }}>
          Role saved successfully.
        </div>
      )}

      <div className="rounded-xl border bg-white shadow-sm overflow-hidden" style={{ borderColor: "#E4E5E8" }}>
        <div className="px-5 py-3 border-b" style={{ borderColor: "#E4E5E8", backgroundColor: "#F9FAFB" }}>
          <h2 className="text-xs font-semibold uppercase tracking-wide" style={{ color: "#5B5F6B" }}>Role Details</h2>
        </div>
        <div className="px-5 py-4">
          <label htmlFor="name" className="block text-sm font-medium mb-1" style={{ color: "#5B5F6B" }}>
            Role Name <span style={{ color: "#E15A2C" }}>*</span>
          </label>
          <input
            id="name" name="name" type="text" required
            defaultValue={defaultName}
            disabled={disabled}
            className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ borderColor: "#E4E5E8", color: "#13151A" }}
            placeholder="e.g. Sales Manager"
          />
        </div>
      </div>

      <div className="rounded-xl border bg-white shadow-sm overflow-hidden" style={{ borderColor: "#E4E5E8" }}>
        <div className="px-5 py-3 border-b" style={{ borderColor: "#E4E5E8", backgroundColor: "#F9FAFB" }}>
          <h2 className="text-xs font-semibold uppercase tracking-wide" style={{ color: "#5B5F6B" }}>Permissions</h2>
        </div>
        <div className="px-5 py-4">
          <PermissionMatrix currentPermissions={defaultPermissions} disabled={disabled} />
        </div>
      </div>

      {!disabled && (
        <div className="flex items-center gap-3 justify-end pt-1">
          <button type="button" onClick={() => router.push(cancelHref)}
            className="px-5 py-2.5 rounded-lg border text-sm font-medium hover:bg-gray-50"
            style={{ borderColor: "#E4E5E8", color: "#5B5F6B" }}>
            Cancel
          </button>
          <button type="submit" disabled={isPending}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white disabled:opacity-60"
            style={{ backgroundColor: "#142036" }}>
            {isPending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
            Save Role
          </button>
        </div>
      )}
    </form>
  );
}
