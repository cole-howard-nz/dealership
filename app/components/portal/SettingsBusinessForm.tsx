"use client";

import { useActionState } from "react";
import { CheckCircle2, AlertCircle } from "lucide-react";

interface Props {
  action: (_prevState: { error: string | null; success: boolean }, formData: FormData) => Promise<{ error: string | null; success: boolean }>;
  defaultValues: {
    businessName: string;
    businessPhone: string;
    businessAddress: string;
  };
}

const initialState = { error: null as string | null, success: false };

const labelClass = "block text-sm font-semibold mb-1.5";
const inputClass = "h-10 w-full rounded-lg border px-3 text-sm focus:outline-none focus:ring-2 focus:ring-navy/30";
const inputStyle = { borderColor: "#E4E5E8", color: "#13151A" };

export function SettingsBusinessForm({ action, defaultValues }: Props) {
  const [state, formAction, isPending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="px-5 py-5 flex flex-col gap-4">
      {state?.success && (
        <div className="flex items-center gap-2 rounded-lg p-3 text-sm"
          style={{ backgroundColor: "#DCFCE7", color: "#15803D" }}>
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          Saved.
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
        <label htmlFor="businessName" className={labelClass} style={{ color: "#13151A" }}>Business name</label>
        <input
          id="businessName"
          name="businessName"
          type="text"
          defaultValue={defaultValues.businessName}
          className={inputClass}
          style={inputStyle}
        />
      </div>
      <div>
        <label htmlFor="businessPhone" className={labelClass} style={{ color: "#13151A" }}>Phone</label>
        <input
          id="businessPhone"
          name="businessPhone"
          type="text"
          defaultValue={defaultValues.businessPhone}
          placeholder="e.g. 04 123 4567"
          className={inputClass}
          style={inputStyle}
        />
      </div>
      <div>
        <label htmlFor="businessAddress" className={labelClass} style={{ color: "#13151A" }}>Address</label>
        <textarea
          id="businessAddress"
          name="businessAddress"
          defaultValue={defaultValues.businessAddress}
          rows={2}
          placeholder="e.g. 12 Cuba St, Te Aro, Wellington"
          className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy/30 resize-none"
          style={inputStyle}
        />
      </div>

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
