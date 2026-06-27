"use client";

import { useActionState } from "react";
import { Eye, EyeOff, CheckCircle2, AlertCircle } from "lucide-react";
import { useState } from "react";
import { changePasswordAction } from "./actions";

interface AccountFormProps {
  userId: string;
}

const initialState = { success: false, error: null as string | null };

export function AccountForm({ userId }: AccountFormProps) {
  const [state, formAction, isPending] = useActionState(
    changePasswordAction.bind(null, userId),
    initialState
  );
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const inputClass =
    "h-11 w-full rounded-lg border px-3 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-navy/40";
  const labelClass = "text-sm font-semibold block mb-1.5";

  return (
    <div
      className="rounded-xl border bg-white shadow-sm"
      style={{ borderColor: "#E4E5E8" }}
    >
      <div
        className="px-5 py-4 border-b"
        style={{ borderColor: "#E4E5E8" }}
      >
        <h2 className="font-heading text-base font-bold" style={{ color: "#13151A" }}>
          Change Password
        </h2>
      </div>

      <form action={formAction} className="px-5 py-5 flex flex-col gap-5">
        {/* Success */}
        {state?.success && (
          <div
            className="flex items-center gap-3 rounded-lg border p-4 text-sm"
            style={{ backgroundColor: "#1F9D5510", borderColor: "#1F9D5540", color: "#1F9D55" }}
            role="alert"
          >
            <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
            Password changed successfully.
          </div>
        )}

        {/* Error */}
        {state?.error && !state?.success && (
          <div
            className="flex items-center gap-3 rounded-lg border p-4 text-sm"
            style={{ backgroundColor: "#D33A2C10", borderColor: "#D33A2C40", color: "#D33A2C" }}
            role="alert"
          >
            <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
            {state.error}
          </div>
        )}

        {/* Current password */}
        <div>
          <label htmlFor="currentPassword" className={labelClass} style={{ color: "#13151A" }}>
            Current password
          </label>
          <div className="relative">
            <input
              id="currentPassword"
              name="currentPassword"
              type={showCurrent ? "text" : "password"}
              autoComplete="current-password"
              required
              className={inputClass}
              style={{ borderColor: "#E4E5E8", color: "#13151A" }}
            />
            <button
              type="button"
              onClick={() => setShowCurrent((v) => !v)}
              className="absolute inset-y-0 right-0 flex items-center px-3"
              style={{ color: "#5B5F6B" }}
              aria-label={showCurrent ? "Hide current password" : "Show current password"}
            >
              {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* New password */}
        <div>
          <label htmlFor="newPassword" className={labelClass} style={{ color: "#13151A" }}>
            New password
          </label>
          <div className="relative">
            <input
              id="newPassword"
              name="newPassword"
              type={showNew ? "text" : "password"}
              autoComplete="new-password"
              required
              minLength={12}
              className={inputClass}
              style={{ borderColor: "#E4E5E8", color: "#13151A" }}
            />
            <button
              type="button"
              onClick={() => setShowNew((v) => !v)}
              className="absolute inset-y-0 right-0 flex items-center px-3"
              style={{ color: "#5B5F6B" }}
              aria-label={showNew ? "Hide new password" : "Show new password"}
            >
              {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <p className="text-xs mt-1.5" style={{ color: "#5B5F6B" }}>
            At least 12 characters.
          </p>
        </div>

        {/* Confirm password */}
        <div>
          <label htmlFor="confirmPassword" className={labelClass} style={{ color: "#13151A" }}>
            Confirm new password
          </label>
          <div className="relative">
            <input
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirm ? "text" : "password"}
              autoComplete="new-password"
              required
              className={inputClass}
              style={{ borderColor: "#E4E5E8", color: "#13151A" }}
            />
            <button
              type="button"
              onClick={() => setShowConfirm((v) => !v)}
              className="absolute inset-y-0 right-0 flex items-center px-3"
              style={{ color: "#5B5F6B" }}
              aria-label={showConfirm ? "Hide confirm password" : "Show confirm password"}
            >
              {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <div className="flex justify-end pt-1">
          <button
            type="submit"
            disabled={isPending}
            className="h-10 rounded-xl px-5 text-sm font-semibold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            style={{ backgroundColor: "#E15A2C" }}
          >
            {isPending ? (
              <>
                <span
                  className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white animate-spin"
                  aria-hidden="true"
                />
                Saving…
              </>
            ) : (
              "Update password"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
