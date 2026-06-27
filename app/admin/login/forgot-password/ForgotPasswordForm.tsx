"use client";

import { useActionState } from "react";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { requestPasswordReset } from "./actions";
import Link from "next/link";

const initialState = { error: null as string | null, success: false };

export function ForgotPasswordForm() {
  const [state, formAction, isPending] = useActionState(requestPasswordReset, initialState);

  if (state?.success) {
    return (
      <div className="flex flex-col items-center gap-4 text-center py-4">
        <div className="w-12 h-12 rounded-full flex items-center justify-center"
          style={{ backgroundColor: "rgba(31,157,85,0.12)" }}>
          <CheckCircle2 className="h-6 w-6" style={{ color: "#1F9D55" }} />
        </div>
        <div>
          <p className="font-semibold text-white mb-1">Check your email</p>
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>
            If that email belongs to an active staff account, we&apos;ve sent a reset link. It expires in 1 hour.
          </p>
        </div>
        <Link
          href="/admin/login"
          className="mt-2 text-sm font-medium hover:underline"
          style={{ color: "#E15A2C" }}
        >
          Back to sign in
        </Link>
      </div>
    );
  }

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
        <label
          htmlFor="email"
          className="block text-sm font-medium mb-1.5"
          style={{ color: "rgba(255,255,255,0.7)" }}
        >
          Email address
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          autoFocus
          required
          placeholder="you@northbridgemotors.co.nz"
          className="w-full h-11 rounded-xl px-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/40"
          style={{
            backgroundColor: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.12)",
            color: "#fff",
          }}
        />
        <p className="text-xs mt-1.5" style={{ color: "rgba(255,255,255,0.35)" }}>
          We&apos;ll send a reset link to this address if it&apos;s on an active account.
        </p>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="h-11 rounded-xl font-semibold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        style={{ backgroundColor: "#E15A2C", color: "#fff" }}
      >
        {isPending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            Sending…
          </>
        ) : (
          "Send reset link"
        )}
      </button>

      <Link
        href="/admin/login"
        className="text-center text-sm hover:underline"
        style={{ color: "rgba(255,255,255,0.4)" }}
      >
        Back to sign in
      </Link>
    </form>
  );
}
