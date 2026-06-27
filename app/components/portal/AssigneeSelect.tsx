"use client";

import { useTransition } from "react";
import { Loader2 } from "lucide-react";

interface Assignee {
  id: string;
  name: string;
}

interface AssigneeSelectProps {
  currentAssigneeId: string | null;
  requestId: string;
  entityType: "ContactRequest" | "TradeInRequest" | "FinanceApplication";
  staffOptions: Assignee[];
  updateAction: (
    entityType: string,
    id: string,
    assigneeId: string | null
  ) => Promise<{ error: string | null }>;
  canUpdate: boolean;
}

export function AssigneeSelect({
  currentAssigneeId,
  requestId,
  entityType,
  staffOptions,
  updateAction,
  canUpdate,
}: AssigneeSelectProps) {
  const [isPending, startTransition] = useTransition();

  if (!canUpdate) {
    const assignee = staffOptions.find((s) => s.id === currentAssigneeId);
    return (
      <span className="text-sm font-medium" style={{ color: "#13151A" }}>
        {assignee?.name ?? "Unassigned"}
      </span>
    );
  }

  return (
    <div className="relative">
      <select
        defaultValue={currentAssigneeId ?? ""}
        disabled={isPending}
        onChange={(e) => {
          const val = e.target.value || null;
          startTransition(async () => {
            await updateAction(entityType, requestId, val);
          });
        }}
        className="w-full rounded-lg border py-2 pl-3 pr-8 text-sm appearance-none outline-none focus:ring-2 disabled:opacity-60"
        style={{
          borderColor: "#E4E5E8",
          backgroundColor: "#ffffff",
          color: "#13151A",
        }}
        aria-label="Assign to staff member"
      >
        <option value="">Unassigned</option>
        {staffOptions.map((s) => (
          <option key={s.id} value={s.id}>
            {s.name}
          </option>
        ))}
      </select>
      {isPending && (
        <Loader2
          className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin"
          style={{ color: "#E15A2C" }}
          aria-hidden="true"
        />
      )}
    </div>
  );
}
