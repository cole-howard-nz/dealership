"use client";

import { useRef, useTransition, useState } from "react";
import { Send } from "lucide-react";

interface AddNoteFormProps {
  requestId: string;
  entityType: "ContactRequest" | "TradeInRequest" | "FinanceApplication";
  addNoteAction: (
    entityType: string,
    id: string,
    body: string
  ) => Promise<{ error: string | null }>;
}

export function AddNoteForm({
  requestId,
  entityType,
  addNoteAction,
}: AddNoteFormProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const body = textareaRef.current?.value.trim();
    if (!body) return;

    setError(null);
    startTransition(async () => {
      const result = await addNoteAction(entityType, requestId, body);
      if (result.error) {
        setError(result.error);
      } else if (textareaRef.current) {
        textareaRef.current.value = "";
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <textarea
        ref={textareaRef}
        placeholder="Add an internal note…"
        rows={3}
        disabled={isPending}
        className="w-full rounded-lg border px-3 py-2 text-sm resize-none outline-none focus:ring-2 disabled:opacity-60"
        style={{
          borderColor: "#E4E5E8",
          backgroundColor: "#ffffff",
          color: "#13151A",
        }}
        aria-label="Note body"
      />
      {error && (
        <p className="text-xs" style={{ color: "#DC2626" }}>
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={isPending}
        className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white transition-opacity disabled:opacity-60"
        style={{ backgroundColor: "#142036" }}
      >
        <Send className="h-3.5 w-3.5" aria-hidden="true" />
        {isPending ? "Saving…" : "Add Note"}
      </button>
    </form>
  );
}
