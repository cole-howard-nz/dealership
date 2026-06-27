"use client";

import { useTransition, useState } from "react";
import { Loader2, AlertCircle, Copy, Check } from "lucide-react";

interface StaffDetailActionsProps {
  userId: string;
  isSelf: boolean;
  isActive: boolean;
  inviteAccepted: boolean;
  currentRoleId: string;
  isSystemRole: boolean;
  assignedLocationIds: string[];
  roles: { id: string; name: string; isSystem: boolean }[];
  allLocations: { id: string; name: string }[];
  canEdit: boolean;
  canDeactivate: boolean;
  canInvite: boolean;
  updateRoleAction: (userId: string, roleId: string) => Promise<{ error: string | null }>;
  updateLocationsAction: (userId: string, locationIds: string[]) => Promise<{ error: string | null }>;
  deactivateAction: (userId: string) => Promise<{ error: string | null }>;
  activateAction: (userId: string) => Promise<{ error: string | null }>;
  resendInviteAction: (userId: string) => Promise<{ error: string | null; inviteToken?: string }>;
}

export function StaffDetailActions({
  userId, isSelf, isActive, inviteAccepted,
  currentRoleId, isSystemRole, assignedLocationIds,
  roles, allLocations,
  canEdit, canDeactivate, canInvite,
  updateRoleAction, updateLocationsAction,
  deactivateAction, activateAction, resendInviteAction,
}: StaffDetailActionsProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [roleId, setRoleId] = useState(currentRoleId);
  const [locationIds, setLocationIds] = useState<string[]>(assignedLocationIds);
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  function notify(msg: string) {
    setSuccess(msg);
    setTimeout(() => setSuccess(null), 3000);
  }

  function handleRoleChange() {
    if (roleId === currentRoleId) return;
    setError(null);
    startTransition(async () => {
      const r = await updateRoleAction(userId, roleId);
      if (r.error) setError(r.error);
      else notify("Role updated.");
    });
  }

  function handleLocationsChange() {
    setError(null);
    startTransition(async () => {
      const r = await updateLocationsAction(userId, locationIds);
      if (r.error) setError(r.error);
      else notify("Locations updated.");
    });
  }

  function handleDeactivate() {
    if (!confirm("Deactivate this account? They will lose portal access immediately.")) return;
    setError(null);
    startTransition(async () => {
      const r = await deactivateAction(userId);
      if (r.error) setError(r.error);
    });
  }

  function handleActivate() {
    setError(null);
    startTransition(async () => {
      const r = await activateAction(userId);
      if (r.error) setError(r.error);
    });
  }

  async function handleResendInvite() {
    setError(null);
    startTransition(async () => {
      const r = await resendInviteAction(userId);
      if (r.error) { setError(r.error); return; }
      if (r.inviteToken) {
        setInviteUrl(`${window.location.origin}/admin/login/invite/${r.inviteToken}`);
      }
    });
  }

  async function copyUrl() {
    if (!inviteUrl) return;
    await navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-4">
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
          {success}
        </div>
      )}

      {/* Role */}
      {canEdit && !isSelf && (
        <Panel title="Change Role">
          <div className="flex gap-2">
            <select
              value={roleId}
              onChange={(e) => setRoleId(e.target.value)}
              disabled={isPending || isSystemRole}
              className="flex-1 rounded-lg border px-3 py-2 text-sm focus:outline-none"
              style={{ borderColor: "#E4E5E8", color: "#13151A" }}
            >
              {roles.map((r) => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
            <button
              type="button"
              onClick={handleRoleChange}
              disabled={isPending || roleId === currentRoleId || isSystemRole}
              className="px-4 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-40"
              style={{ backgroundColor: "#142036" }}
            >
              {isPending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : "Save"}
            </button>
          </div>
          {isSystemRole && (
            <p className="mt-2 text-xs" style={{ color: "#9CA3AF" }}>The Owner role cannot be reassigned via this panel.</p>
          )}
        </Panel>
      )}

      {/* Locations */}
      {canEdit && (
        <Panel title="Location Access">
          <div className="space-y-2 mb-3">
            {allLocations.map((loc) => (
              <label key={loc.id} className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={locationIds.includes(loc.id)}
                  onChange={(e) => {
                    setLocationIds((prev) =>
                      e.target.checked ? [...prev, loc.id] : prev.filter((id) => id !== loc.id)
                    );
                  }}
                  disabled={isPending}
                  className="h-4 w-4 rounded"
                  style={{ accentColor: "#E15A2C" }}
                />
                <span className="text-sm" style={{ color: "#13151A" }}>{loc.name}</span>
              </label>
            ))}
          </div>
          <button
            type="button"
            onClick={handleLocationsChange}
            disabled={isPending}
            className="px-4 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-40"
            style={{ backgroundColor: "#142036" }}
          >
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : "Update Locations"}
          </button>
        </Panel>
      )}

      {/* Pending invite */}
      {!inviteAccepted && canInvite && (
        <Panel title="Invite Link">
          {inviteUrl ? (
            <div className="space-y-2">
              <div className="flex gap-2">
                <div className="flex-1 rounded-lg border px-3 py-2 text-xs font-mono truncate"
                  style={{ borderColor: "#E4E5E8", color: "#5B5F6B", backgroundColor: "#F9FAFB" }}>
                  {inviteUrl}
                </div>
                <button type="button" onClick={copyUrl}
                  className="px-3 py-2 rounded-lg border text-xs font-medium transition-colors"
                  style={{ borderColor: "#E4E5E8", color: copied ? "#15803D" : "#5B5F6B" }}>
                  {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
                </button>
              </div>
              <p className="text-xs" style={{ color: "#9CA3AF" }}>New link expires in 48 hours.</p>
            </div>
          ) : (
            <button type="button" onClick={handleResendInvite} disabled={isPending}
              className="px-4 py-2 rounded-lg text-sm font-medium border transition-colors disabled:opacity-40"
              style={{ borderColor: "#E4E5E8", color: "#5B5F6B" }}>
              {isPending ? <Loader2 className="h-4 w-4 animate-spin inline mr-1" aria-hidden="true" /> : null}
              Generate New Invite Link
            </button>
          )}
        </Panel>
      )}

      {/* Deactivate / Activate */}
      {canDeactivate && !isSelf && (
        <Panel title={isActive ? "Deactivate Account" : "Activate Account"}>
          {isActive ? (
            <div>
              <p className="text-sm mb-3" style={{ color: "#5B5F6B" }}>
                Deactivating immediately revokes this user&apos;s portal access.
              </p>
              <button type="button" onClick={handleDeactivate} disabled={isPending}
                className="px-4 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-40"
                style={{ backgroundColor: "#DC2626" }}>
                {isPending ? <Loader2 className="h-4 w-4 animate-spin inline mr-1" aria-hidden="true" /> : null}
                Deactivate
              </button>
            </div>
          ) : (
            <div>
              <p className="text-sm mb-3" style={{ color: "#5B5F6B" }}>
                {inviteAccepted ? "Re-enable portal access for this user." : "This user has not accepted their invite."}
              </p>
              {inviteAccepted && (
                <button type="button" onClick={handleActivate} disabled={isPending}
                  className="px-4 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-40"
                  style={{ backgroundColor: "#15803D" }}>
                  {isPending ? <Loader2 className="h-4 w-4 animate-spin inline mr-1" aria-hidden="true" /> : null}
                  Activate
                </button>
              )}
            </div>
          )}
        </Panel>
      )}
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border bg-white shadow-sm overflow-hidden" style={{ borderColor: "#E4E5E8" }}>
      <div className="px-5 py-3 border-b" style={{ borderColor: "#E4E5E8", backgroundColor: "#F9FAFB" }}>
        <h2 className="text-xs font-semibold uppercase tracking-wide" style={{ color: "#5B5F6B" }}>{title}</h2>
      </div>
      <div className="px-5 py-4">{children}</div>
    </div>
  );
}
