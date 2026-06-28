"use client";

import { useActionState, useState } from "react";
import { CheckCircle2, AlertCircle, TriangleAlert } from "lucide-react";

interface Props {
  action: (_prevState: { error: string | null; success: boolean }, formData: FormData) => Promise<{ error: string | null; success: boolean }>;
  currentMonths: number;
}

const initialState = { error: null as string | null, success: false };

const OPTIONS = [
  { value: "1", label: "1 month" },
  { value: "3", label: "3 months" },
  { value: "6", label: "6 months" },
  { value: "12", label: "12 months" },
];

export function SettingsRetentionForm({ action, currentMonths }: Props) {
  const [state, formAction, isPending] = useActionState(action, initialState);
  const [selected, setSelected] = useState(String(currentMonths));
  const reducing = Number(selected) < currentMonths;

  return (
    <form action={formAction} className="px-5 py-5 flex flex-col gap-4">
      {state?.success && (
        <div className="flex items-center gap-2 rounded-lg p-3 text-sm"
          style={{ backgroundColor: "#DCFCE7", color: "#15803D" }}>
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          Retention period updated.
        </div>
      )}
      {state?.error && (
        <div className="flex items-center gap-2 rounded-lg p-3 text-sm"
          style={{ backgroundColor: "#FEE2E2", color: "#B91C1C" }}>
          <AlertCircle className="h-4 w-4 shrink-0" />
          {state.error}
        </div>
      )}

      <div>
        <label htmlFor="months" className="block text-sm font-semibold mb-1.5" style={{ color: "#13151A" }}>
          Retention period
        </label>
        <select
          id="months"
          name="months"
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
          className="h-10 rounded-lg border px-3 text-sm focus:outline-none focus:ring-2 focus:ring-navy/30"
          style={{ borderColor: "#E4E5E8", color: "#13151A" }}
        >
          {OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <p className="text-xs mt-1.5" style={{ color: "#5B5F6B" }}>
          Finance applications older than this are automatically purged by the daily cron job.
        </p>
      </div>

      {reducing && (
        <div className="flex gap-3 rounded-lg p-3 text-sm"
          style={{ backgroundColor: "#FEF9C3", color: "#854D0E" }}>
          <TriangleAlert className="h-4 w-4 shrink-0 mt-0.5" />
          <span>Reducing the retention period will permanently delete finance applications older than the new threshold when the next purge runs.</span>
        </div>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isPending}
          className="h-9 px-4 rounded-lg text-sm font-semibold text-white transition-all disabled:opacity-50"
          style={{ backgroundColor: "#142036" }}
        >
          {isPending ? "Saving…" : "Save"}
        </button>
      </div>
    </form>
  );
}
