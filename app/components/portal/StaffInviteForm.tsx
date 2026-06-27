"use client";

import { useTransition, useState } from "react";
import { Loader2, AlertCircle, Copy, Check, Link as LinkIcon } from "lucide-react";

interface StaffInviteFormProps {
  action: (formData: FormData) => Promise<{ error: string | null; inviteToken?: string }>;
  roles: { id: string; name: string; isSystem: boolean }[];
  locations: { id: string; name: string }[];
}

export function StaffInviteForm({ action, roles, locations }: StaffInviteFormProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await action(formData);
      if (result.error) {
        setError(result.error);
      } else if (result.inviteToken) {
        const origin = window.location.origin;
        setInviteUrl(`${origin}/admin/login/invite/${result.inviteToken}`);
      }
    });
  }

  async function copyUrl() {
    if (!inviteUrl) return;
    await navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (inviteUrl) {
    return (
      <div className="rounded-xl border bg-white shadow-sm overflow-hidden" style={{ borderColor: "#E4E5E8" }}>
        <div className="px-5 py-4 border-b" style={{ borderColor: "#E4E5E8", backgroundColor: "#F0FDF4" }}>
          <p className="text-sm font-semibold" style={{ color: "#15803D" }}>
            Invite created successfully
          </p>
          <p className="text-sm mt-0.5" style={{ color: "#5B5F6B" }}>
            Share this link with the new team member. It expires in 48 hours.
          </p>
        </div>
        <div className="px-5 py-4 space-y-4">
          <div className="flex items-stretch gap-2">
            <div
              className="flex-1 rounded-lg border px-3 py-2 text-sm font-mono overflow-hidden text-ellipsis"
              style={{ borderColor: "#E4E5E8", color: "#5B5F6B", backgroundColor: "#F9FAFB" }}
            >
              <LinkIcon className="inline h-3.5 w-3.5 mr-1.5 mb-0.5" style={{ color: "#9CA3AF" }} aria-hidden="true" />
              {inviteUrl}
            </div>
            <button
              type="button"
              onClick={copyUrl}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-colors"
              style={{ borderColor: "#E4E5E8", color: copied ? "#15803D" : "#5B5F6B" }}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
          <p className="text-xs" style={{ color: "#9CA3AF" }}>
            Phase 4 will add automatic email delivery. For now, copy and share this link manually.
          </p>
          <button
            type="button"
            onClick={() => { setInviteUrl(null); setCopied(false); }}
            className="text-sm font-medium hover:underline"
            style={{ color: "#E15A2C" }}
          >
            Invite another person
          </button>
        </div>
      </div>
    );
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

      <div className="rounded-xl border bg-white shadow-sm overflow-hidden" style={{ borderColor: "#E4E5E8" }}>
        <div className="px-5 py-3 border-b" style={{ borderColor: "#E4E5E8", backgroundColor: "#F9FAFB" }}>
          <h2 className="text-xs font-semibold uppercase tracking-wide" style={{ color: "#5B5F6B" }}>Staff Details</h2>
        </div>
        <div className="px-5 py-4 space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-1" style={{ color: "#5B5F6B" }}>
              Full Name <span style={{ color: "#E15A2C" }}>*</span>
            </label>
            <input
              id="name" name="name" type="text" required autoFocus
              className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none"
              style={{ borderColor: "#E4E5E8", color: "#13151A" }}
              placeholder="e.g. Jane Smith"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1" style={{ color: "#5B5F6B" }}>
              Email Address <span style={{ color: "#E15A2C" }}>*</span>
            </label>
            <input
              id="email" name="email" type="email" required
              className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none"
              style={{ borderColor: "#E4E5E8", color: "#13151A" }}
              placeholder="jane@northbridgemotors.co.nz"
            />
          </div>
          <div>
            <label htmlFor="roleId" className="block text-sm font-medium mb-1" style={{ color: "#5B5F6B" }}>
              Role <span style={{ color: "#E15A2C" }}>*</span>
            </label>
            <select
              id="roleId" name="roleId" required
              className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none"
              style={{ borderColor: "#E4E5E8", color: "#13151A" }}
              defaultValue=""
            >
              <option value="" disabled>Select a role…</option>
              {roles.map((r) => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="rounded-xl border bg-white shadow-sm overflow-hidden" style={{ borderColor: "#E4E5E8" }}>
        <div className="px-5 py-3 border-b" style={{ borderColor: "#E4E5E8", backgroundColor: "#F9FAFB" }}>
          <h2 className="text-xs font-semibold uppercase tracking-wide" style={{ color: "#5B5F6B" }}>Location Access</h2>
        </div>
        <div className="px-5 py-4">
          <p className="text-sm mb-3" style={{ color: "#5B5F6B" }}>
            Select which locations this staff member can access. At least one is required.
          </p>
          <div className="space-y-2">
            {locations.map((loc) => (
              <label key={loc.id} className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="locationIds"
                  value={loc.id}
                  className="h-4 w-4 rounded"
                  style={{ accentColor: "#E15A2C" }}
                />
                <span className="text-sm" style={{ color: "#13151A" }}>{loc.name}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 justify-end pt-1">
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-opacity disabled:opacity-60"
          style={{ backgroundColor: "#142036" }}
        >
          {isPending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
          Send Invite
        </button>
      </div>
    </form>
  );
}
