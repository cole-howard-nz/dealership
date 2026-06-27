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

  const inputClass = "w-full rounded-lg border px-3 py-2.5 text-sm focus:outline-none";
  const inputStyle = { borderColor: "#E4E5E8", color: "#13151A" };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="flex items-center gap-2 rounded-lg border px-4 py-3 text-sm"
          style={{ borderColor: "#FCA5A5", backgroundColor: "#FEF2F2", color: "#DC2626" }}>
          <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
          {error}
        </div>
      )}

      <div>
        <label htmlFor="password" className="block text-sm font-medium mb-1" style={{ color: "#5B5F6B" }}>
          Password <span style={{ color: "#E15A2C" }}>*</span>
        </label>
        <div className="relative">
          <input
            id="password" name="password"
            type={showPassword ? "text" : "password"}
            required autoFocus
            minLength={8}
            className={`${inputClass} pr-10`}
            style={inputStyle}
            placeholder="Minimum 8 characters"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2"
            style={{ color: "#9CA3AF" }}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
          </button>
        </div>
      </div>

      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1" style={{ color: "#5B5F6B" }}>
          Confirm Password <span style={{ color: "#E15A2C" }}>*</span>
        </label>
        <div className="relative">
          <input
            id="confirmPassword" name="confirmPassword"
            type={showConfirm ? "text" : "password"}
            required
            className={`${inputClass} pr-10`}
            style={inputStyle}
            placeholder="Repeat your password"
          />
          <button
            type="button"
            onClick={() => setShowConfirm(!showConfirm)}
            className="absolute right-3 top-1/2 -translate-y-1/2"
            style={{ color: "#9CA3AF" }}
            aria-label={showConfirm ? "Hide password" : "Show password"}
          >
            {showConfirm ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
          </button>
        </div>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-opacity disabled:opacity-60 mt-2"
        style={{ backgroundColor: "#142036" }}
      >
        {isPending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
        Set Password &amp; Activate Account
      </button>
    </form>
  );
}
