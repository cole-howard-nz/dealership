"use client";

import { useActionState } from "react";
import { CheckCircle2, AlertCircle } from "lucide-react";

interface Props {
  action: (_prevState: { error: string | null; success: boolean }, formData: FormData) => Promise<{ error: string | null; success: boolean }>;
  currentPrefs: Record<string, boolean | undefined>;
}

const initialState = { error: null as string | null, success: false };

const PREFS = [
  { key: "contact.new", label: "New contact requests", description: "Email when a new general enquiry is submitted." },
  { key: "tradein.new", label: "New trade-in requests", description: "Email when a trade-in valuation is submitted." },
  { key: "finance.new", label: "New finance applications", description: "Email when a finance application is submitted." },
] as const;

export function NotificationPrefsForm({ action, currentPrefs }: Props) {
  const [state, formAction, isPending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="px-5 py-5">
      {state?.success && (
        <div className="flex items-center gap-2 rounded-lg p-3 text-sm mb-4"
          style={{ backgroundColor: "#DCFCE7", color: "#15803D" }}>
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          Preferences saved.
        </div>
      )}
      {state?.error && (
        <div className="flex items-center gap-2 rounded-lg p-3 text-sm mb-4"
          style={{ backgroundColor: "#FEE2E2", color: "#B91C1C" }}>
          <AlertCircle className="h-4 w-4 shrink-0" />
          {state.error}
        </div>
      )}

      <div className="space-y-4">
        {PREFS.map(({ key, label, description }) => {
          // undefined or true → default on; false → opted out
          const checked = currentPrefs[key] !== false;
          return (
            <label key={key} className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                name={key}
                defaultChecked={checked}
                className="mt-0.5 h-4 w-4 rounded border accent-orange-600"
                style={{ accentColor: "#E15A2C" }}
              />
              <div>
                <p className="text-sm font-semibold" style={{ color: "#13151A" }}>{label}</p>
                <p className="text-xs mt-0.5" style={{ color: "#5B5F6B" }}>{description}</p>
              </div>
            </label>
          );
        })}
      </div>

      <div className="flex justify-end mt-5">
        <button
          type="submit"
          disabled={isPending}
          className="h-9 px-4 rounded-lg text-sm font-semibold text-white disabled:opacity-50"
          style={{ backgroundColor: "#142036" }}
        >
          {isPending ? "Saving…" : "Save preferences"}
        </button>
      </div>
    </form>
  );
}
