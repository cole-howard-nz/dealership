"use client";

import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, AlertCircle, Eye, EyeOff } from "lucide-react";

interface AcceptInviteFormProps {
  action: (formData: FormData) => Promise<{ error: string | null }>;
}

export function AcceptInviteForm({ action }: AcceptInviteFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await action(formData);
      if (result.error) {
        setError(result.error);
      } else {
        router.push("/admin/login?message=invite-accepted");
      }
    });
  }

  const inputBase = "h-11 w-full rounded-xl px-4 text-sm text-white placeholder:text-white/20 focus:outline-none transition-colors";
  const inputStyle = { backgroundColor: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" };

  function onFocus(e: React.FocusEvent<HTMLInputElement>) {
    e.currentTarget.style.borderColor = "rgba(225,90,44,0.6)";
    e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.08)";
  }
  function onBlur(e: React.FocusEvent<HTMLInputElement>) {
    e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
    e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.06)";
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {error && (
        <div
          className="flex items-start gap-3 rounded-xl p-4 text-sm"
          style={{ backgroundColor: "rgba(220,38,38,0.12)", border: "1px solid rgba(220,38,38,0.25)", color: "#fca5a5" }}
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          {error}
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.4)" }}>
          Password
        </label>
        <div className="relative">
          <input
            id="password" name="password"
            type={showPassword ? "text" : "password"}
            required autoFocus minLength={8}
            className={`${inputBase} pr-11`}
            style={inputStyle}
            placeholder="Minimum 8 characters"
            onFocus={onFocus} onBlur={onBlur}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 flex items-center px-3 transition-colors"
            style={{ color: "rgba(255,255,255,0.3)" }}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="confirmPassword" className="text-xs font-semibold uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.4)" }}>
          Confirm Password
        </label>
        <div className="relative">
          <input
            id="confirmPassword" name="confirmPassword"
            type={showConfirm ? "text" : "password"}
            required
            className={`${inputBase} pr-11`}
            style={inputStyle}
            placeholder="Repeat your password"
            onFocus={onFocus} onBlur={onBlur}
          />
          <button
            type="button"
            onClick={() => setShowConfirm(!showConfirm)}
            className="absolute inset-y-0 right-0 flex items-center px-3 transition-colors"
            style={{ color: "rgba(255,255,255,0.3)" }}
            aria-label={showConfirm ? "Hide password" : "Show password"}
          >
            {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="mt-2 h-11 rounded-xl font-semibold text-sm text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 active:scale-[0.98]"
        style={{ backgroundColor: "#E15A2C" }}
      >
        {isPending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
        Set Password &amp; Activate Account
      </button>
    </form>
  );
}
