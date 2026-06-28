"use client";

import { useState, useTransition } from "react";
import { formatDistanceToNow } from "date-fns";
import { StickyNote, Pencil, Trash2, Check, X } from "lucide-react";

interface Note {
  id: string;
  body: string;
  authorId: string;
  createdAt: Date;
  author: { name: string };
}

interface NotesListProps {
  notes: Note[];
  currentUserId: string;
  canUpdate: boolean;
  editNoteAction: (noteId: string, body: string) => Promise<{ error: string | null }>;
  deleteNoteAction: (noteId: string) => Promise<{ error: string | null }>;
}

function NoteItem({
  note,
  isOwn,
  canDelete,
  editNoteAction,
  deleteNoteAction,
}: {
  note: Note;
  isOwn: boolean;
  canDelete: boolean;
  editNoteAction: NotesListProps["editNoteAction"];
  deleteNoteAction: NotesListProps["deleteNoteAction"];
}) {
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(note.body);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSave = () => {
    const trimmed = editValue.trim();
    if (!trimmed || trimmed === note.body) { setEditing(false); return; }
    setError(null);
    startTransition(async () => {
      const result = await editNoteAction(note.id, trimmed);
      if (result.error) {
        setError(result.error);
      } else {
        setEditing(false);
      }
    });
  };

  const handleDelete = () => {
    setError(null);
    startTransition(async () => {
      const result = await deleteNoteAction(note.id);
      if (result.error) setError(result.error);
    });
  };

  return (
    <div
      className="rounded-lg border p-3 text-sm"
      style={{ borderColor: "#E4E5E8", backgroundColor: "#FAFAFA" }}
    >
      <div className="flex items-baseline justify-between gap-2 mb-1.5">
        <span className="font-semibold text-xs" style={{ color: "#13151A" }}>
          {note.author.name}
        </span>
        <div className="flex items-center gap-1 shrink-0">
          <span className="text-xs" style={{ color: "#9CA3AF" }}>
            {formatDistanceToNow(note.createdAt, { addSuffix: true })}
          </span>
          {isOwn && !editing && (
            <button
              onClick={() => { setEditing(true); setEditValue(note.body); }}
              disabled={isPending}
              className="ml-1 p-0.5 rounded hover:bg-gray-200 transition-colors disabled:opacity-40"
              aria-label="Edit note"
            >
              <Pencil className="h-3 w-3" style={{ color: "#9CA3AF" }} />
            </button>
          )}
          {canDelete && !editing && (
            <button
              onClick={handleDelete}
              disabled={isPending}
              className="p-0.5 rounded hover:bg-red-50 transition-colors disabled:opacity-40"
              aria-label="Delete note"
            >
              <Trash2 className="h-3 w-3" style={{ color: "#E15A2C" }} />
            </button>
          )}
        </div>
      </div>

      {editing ? (
        <div className="space-y-2">
          <textarea
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            rows={3}
            disabled={isPending}
            className="w-full rounded-lg border px-3 py-2 text-sm resize-none outline-none focus:ring-2 disabled:opacity-60"
            style={{ borderColor: "#E4E5E8", backgroundColor: "#ffffff", color: "#13151A" }}
            autoFocus
          />
          {error && <p className="text-xs" style={{ color: "#DC2626" }}>{error}</p>}
          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              disabled={isPending}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white transition-opacity disabled:opacity-60"
              style={{ backgroundColor: "#142036" }}
            >
              <Check className="h-3 w-3" />
              {isPending ? "Saving…" : "Save"}
            </button>
            <button
              onClick={() => { setEditing(false); setError(null); }}
              disabled={isPending}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors disabled:opacity-60"
              style={{ borderColor: "#E4E5E8", color: "#5B5F6B" }}
            >
              <X className="h-3 w-3" />
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <>
          <p className="whitespace-pre-wrap" style={{ color: "#5B5F6B" }}>
            {note.body}
          </p>
          {error && <p className="text-xs mt-1" style={{ color: "#DC2626" }}>{error}</p>}
        </>
      )}
    </div>
  );
}

export function NotesList({
  notes,
  currentUserId,
  canUpdate,
  editNoteAction,
  deleteNoteAction,
}: NotesListProps) {
  if (notes.length === 0) {
    return (
      <div className="flex flex-col items-center py-6 text-center">
        <StickyNote className="mb-2 h-6 w-6 opacity-20" style={{ color: "#5B5F6B" }} aria-hidden="true" />
        <p className="text-xs" style={{ color: "#5B5F6B" }}>No notes yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {notes.map((note) => (
        <NoteItem
          key={note.id}
          note={note}
          isOwn={note.authorId === currentUserId}
          canDelete={note.authorId === currentUserId || canUpdate}
          editNoteAction={editNoteAction}
          deleteNoteAction={deleteNoteAction}
        />
      ))}
    </div>
  );
}
