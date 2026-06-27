"use client";

import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, AlertCircle } from "lucide-react";

export interface LocationFormDefaults {
  name?: string;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
}

interface LocationFormProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  action: (formData: FormData) => Promise<any>;
  defaultValues?: LocationFormDefaults;
  cancelHref: string;
  mode: "create" | "edit";
}

const inputClass = "w-full rounded-lg border px-3 py-2 text-sm focus:outline-none";
const inputStyle = { borderColor: "#E4E5E8", color: "#13151A" };

export function LocationForm({ action, defaultValues: d = {}, cancelHref, mode }: LocationFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await action(formData);
      if (result?.error) {
        setError(result.error);
      } else {
        // createLocation calls redirect() server-side; updateLocation returns null error
        if (mode === "edit") setSuccess(true);
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
          Location updated successfully.
        </div>
      )}

      <div className="rounded-xl border bg-white shadow-sm overflow-hidden" style={{ borderColor: "#E4E5E8" }}>
        <div className="px-5 py-3 border-b" style={{ borderColor: "#E4E5E8", backgroundColor: "#F9FAFB" }}>
          <h2 className="text-xs font-semibold uppercase tracking-wide" style={{ color: "#5B5F6B" }}>Location Details</h2>
        </div>
        <div className="px-5 py-4 space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-1" style={{ color: "#5B5F6B" }}>
              Name <span style={{ color: "#E15A2C" }}>*</span>
            </label>
            <input id="name" name="name" type="text" required defaultValue={d.name ?? ""}
              className={inputClass} style={inputStyle} placeholder="e.g. Wellington Yard" />
          </div>
          <div>
            <label htmlFor="address" className="block text-sm font-medium mb-1" style={{ color: "#5B5F6B" }}>
              Address
            </label>
            <input id="address" name="address" type="text" defaultValue={d.address ?? ""}
              className={inputClass} style={inputStyle} placeholder="e.g. 123 Main Street, Wellington 6011" />
          </div>
          <div>
            <label htmlFor="phone" className="block text-sm font-medium mb-1" style={{ color: "#5B5F6B" }}>
              Phone
            </label>
            <input id="phone" name="phone" type="tel" defaultValue={d.phone ?? ""}
              className={inputClass} style={inputStyle} placeholder="e.g. 04 123 4567" />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1" style={{ color: "#5B5F6B" }}>
              Email <span className="text-xs" style={{ color: "#9CA3AF" }}>(for Phase 4 notifications)</span>
            </label>
            <input id="email" name="email" type="email" defaultValue={d.email ?? ""}
              className={inputClass} style={inputStyle} placeholder="e.g. wellington@northbridgemotors.co.nz" />
          </div>
        </div>
      </div>

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
          {mode === "create" ? "Add Location" : "Save Changes"}
        </button>
      </div>
    </form>
  );
}
