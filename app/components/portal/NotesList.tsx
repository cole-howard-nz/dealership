import { formatDistanceToNow } from "date-fns";
import { StickyNote } from "lucide-react";

interface Note {
  id: string;
  body: string;
  createdAt: Date;
  author: { name: string };
}

export function NotesList({ notes }: { notes: Note[] }) {
  if (notes.length === 0) {
    return (
      <div className="flex flex-col items-center py-6 text-center">
        <StickyNote
          className="mb-2 h-6 w-6 opacity-20"
          style={{ color: "#5B5F6B" }}
          aria-hidden="true"
        />
        <p className="text-xs" style={{ color: "#5B5F6B" }}>
          No notes yet
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {notes.map((note) => (
        <div
          key={note.id}
          className="rounded-lg border p-3 text-sm"
          style={{ borderColor: "#E4E5E8", backgroundColor: "#FAFAFA" }}
        >
          <div className="flex items-baseline justify-between gap-2 mb-1">
            <span className="font-semibold text-xs" style={{ color: "#13151A" }}>
              {note.author.name}
            </span>
            <span className="shrink-0 text-xs" style={{ color: "#9CA3AF" }}>
              {formatDistanceToNow(note.createdAt, { addSuffix: true })}
            </span>
          </div>
          <p className="whitespace-pre-wrap" style={{ color: "#5B5F6B" }}>
            {note.body}
          </p>
        </div>
      ))}
    </div>
  );
}
