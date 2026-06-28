"use client";

import { useActionState, useState } from "react";
import { Eye, EyeOff, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import Link from "next/link";

const initialState = { error: null as string | null, success: false };

interface Props {
  boundAction: (_prevState: { error: string | null; success: boolean }, formData: FormData) => Promise<{ error: string | null; success: boolean }>;
}

export function ResetPasswordForm({ boundAction }: Props) {
  const [state, formAction, isPending] = useActionState(boundAction, initialState);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  if (state?.success) {
    return (
      <div className="flex flex-col items-center gap-4 text-center py-4">
        <div className="w-12 h-12 rounded-full flex items-center justify-center"
          style={{ backgroundColor: "rgba(31,157,85,0.12)" }}>
          <CheckCircle2 className="h-6 w-6" style={{ color: "#1F9D55" }} />
        </div>
        <div>
          <p className="font-semibold text-white mb-1">Password updated</p>
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>
            Your password has been changed. You can now sign in with your new password.
          </p>
        </div>
        <Link
          href="/admin/login"
          className="mt-2 h-11 px-6 rounded-xl font-semibold text-sm flex items-center gap-2"
          style={{ backgroundColor: "#E15A2C", color: "#fff" }}
        >
          Sign in
        </Link>
      </div>
    );
  }

  const inputClass = "w-full h-11 rounded-xl px-3 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/40";
  const inputStyle = {
    backgroundColor: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.12)",
    color: "#fff" as const,
  };

  return (
    <form action={formAction} className="flex flex-col gap-5">
      {state?.error && (
        <div
          className="flex items-center gap-3 rounded-xl p-3 text-sm"
          style={{ backgroundColor: "rgba(211,58,44,0.1)", border: "1px solid rgba(211,58,44,0.3)", color: "#ff6b6b" }}
          role="alert"
        >
          <AlertCircle className="h-4 w-4 shrink-0" />
          {state.error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium mb-1.5" style={{ color: "rgba(255,255,255,0.7)" }}>
          New password
        </label>
        <div className="relative">
          <input
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            required
            minLength={12}
            className={inputClass}
            style={inputStyle}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute inset-y-0 right-0 flex items-center px-3"
            style={{ color: "rgba(255,255,255,0.4)" }}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        <p className="text-xs mt-1.5" style={{ color: "rgba(255,255,255,0.35)" }}>At least 12 characters.</p>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1.5" style={{ color: "rgba(255,255,255,0.7)" }}>
          Confirm new password
        </label>
        <div className="relative">
          <input
            name="confirmPassword"
            type={showConfirm ? "text" : "password"}
            autoComplete="new-password"
            required
            className={inputClass}
            style={inputStyle}
          />
          <button
            type="button"
            onClick={() => setShowConfirm((v) => !v)}
            className="absolute inset-y-0 right-0 flex items-center px-3"
            style={{ color: "rgba(255,255,255,0.4)" }}
            aria-label={showConfirm ? "Hide password" : "Show password"}
          >
            {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="h-11 rounded-xl font-semibold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        style={{ backgroundColor: "#E15A2C", color: "#fff" }}
      >
        {isPending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Saving…
          </>
        ) : (
          "Set new password"
        )}
      </button>
    </form>
  );
}
