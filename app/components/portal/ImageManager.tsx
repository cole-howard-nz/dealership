"use client";

import {
  forwardRef,
  useImperativeHandle,
  useState,
  useRef,
  useCallback,
  useEffect,
} from "react";
import { X, GripVertical, Plus, ImageOff, UploadCloud } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

export type ImageEntry =
  | { id: string; kind: "url"; url: string }
  | { id: string; kind: "file"; file: File; preview: string };

export interface ImageManagerHandle {
  getEntries: () => ImageEntry[];
  syncEntries: (urls: string[]) => void;
}

interface ImageManagerProps {
  initial?: Array<{ url: string; alt: string; order: number }>;
}

// ─── URL preview image ────────────────────────────────────────────────────────

function UrlPreview({ url }: { url: string }) {
  const [status, setStatus] = useState<"loading" | "ok" | "error">("loading");

  useEffect(() => {
    if (!url) return;
    setStatus("loading");
    const img = new Image();
    img.onload = () => setStatus("ok");
    img.onerror = () => setStatus("error");
    img.src = url;
    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [url]);

  return (
    <>
      <img
        src={url}
        alt=""
        className={`absolute inset-0 w-full h-full object-cover transition-opacity ${status === "ok" ? "opacity-100" : "opacity-0"}`}
      />
      {status === "loading" && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-200 border-t-gray-400" />
        </div>
      )}
      {status === "error" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
          <ImageOff className="h-5 w-5" style={{ color: "#9CA3AF" }} />
          <span className="text-xs" style={{ color: "#9CA3AF" }}>Bad URL</span>
        </div>
      )}
    </>
  );
}

// ─── Image card ───────────────────────────────────────────────────────────────

interface CardProps {
  entry: ImageEntry;
  index: number;
  isDragging: boolean;
  isOver: boolean;
  onRemove: () => void;
  onUrlChange?: (url: string) => void;
  onDragStart: () => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: () => void;
  onDragEnd: () => void;
}

function ImageCard({
  entry,
  isDragging,
  isOver,
  onRemove,
  onUrlChange,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
}: CardProps) {
  const hasUrl = entry.kind === "url" && entry.url.trim().length > 0;

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
      className={`relative flex flex-col rounded-lg border overflow-hidden select-none transition-all ${
        isDragging ? "opacity-40 scale-95" : ""
      } ${isOver ? "ring-2 ring-[#E15A2C] ring-offset-1" : ""}`}
      style={{ borderColor: "#E4E5E8" }}
    >
      {/* Remove button */}
      <button
        type="button"
        onClick={onRemove}
        className="absolute top-1.5 right-1.5 z-10 rounded-md p-0.5 transition-colors hover:bg-red-50"
        style={{ backgroundColor: "rgba(255,255,255,0.85)", color: "#9CA3AF" }}
        aria-label="Remove image"
      >
        <X className="h-3.5 w-3.5" />
      </button>

      {/* Thumbnail */}
      <div className="relative h-28 bg-gray-50 flex items-center justify-center overflow-hidden">
        {entry.kind === "file" ? (
          <img
            src={entry.preview}
            alt=""
            className="w-full h-full object-cover"
          />
        ) : hasUrl ? (
          <UrlPreview url={entry.url} />
        ) : (
          <div className="px-3 w-full">
            <input
              type="url"
              value={entry.url}
              onChange={(e) => onUrlChange?.(e.target.value)}
              placeholder="https://..."
              className="w-full rounded-md border px-2 py-1.5 text-xs focus:outline-none focus:ring-1"
              style={{ borderColor: "#E4E5E8", color: "#13151A" }}
              onDragStart={(e) => e.stopPropagation()}
            />
          </div>
        )}
      </div>

      {/* URL input (shown below thumbnail when URL is set) */}
      {entry.kind === "url" && hasUrl && (
        <div className="px-2 py-1 border-t" style={{ borderColor: "#E4E5E8" }}>
          <input
            type="url"
            value={entry.url}
            onChange={(e) => onUrlChange?.(e.target.value)}
            className="w-full text-xs focus:outline-none truncate"
            style={{ color: "#9CA3AF" }}
            onDragStart={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* Footer: drag handle */}
      <div
        className="flex items-center justify-between px-2 py-1 border-t"
        style={{ borderColor: "#E4E5E8", backgroundColor: "#F9FAFB" }}
      >
        <div
          className="cursor-grab active:cursor-grabbing"
          style={{ color: "#9CA3AF" }}
          title="Drag to reorder"
        >
          <GripVertical className="h-4 w-4" />
        </div>
        <span className="text-xs" style={{ color: "#D1D5DB" }}>
          {entry.kind === "file" ? "local" : "url"}
        </span>
      </div>
    </div>
  );
}

// ─── ImageManager ─────────────────────────────────────────────────────────────

export const ImageManager = forwardRef<ImageManagerHandle, ImageManagerProps>(
  function ImageManager({ initial = [] }, ref) {
    const [entries, setEntries] = useState<ImageEntry[]>(() =>
      [...initial]
        .sort((a, b) => a.order - b.order)
        .map((img) => ({
          id: crypto.randomUUID(),
          kind: "url" as const,
          url: img.url,
        }))
    );
    const [fileError, setFileError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const dragIndexRef = useRef<number | null>(null);
    const [overIndex, setOverIndex] = useState<number | null>(null);

    // Expose handle to parent via ref
    useImperativeHandle(ref, () => ({
      getEntries: () => entries,
      syncEntries: (urls: string[]) => {
        setEntries((prev) => {
          prev.forEach((e) => {
            if (e.kind === "file") URL.revokeObjectURL(e.preview);
          });
          return urls.map((url) => ({
            id: crypto.randomUUID(),
            kind: "url" as const,
            url,
          }));
        });
      },
    }), [entries]);

    // Revoke objectURLs on unmount
    useEffect(() => {
      return () => {
        entries.forEach((e) => {
          if (e.kind === "file") URL.revokeObjectURL(e.preview);
        });
      };
      // intentionally run only on unmount
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const addFiles = useCallback((fileList: FileList) => {
      setFileError(null);
      const ALLOWED = ["image/jpeg", "image/png", "image/webp"];
      const MAX = 4 * 1024 * 1024;
      const rejected: string[] = [];

      const newEntries: ImageEntry[] = [];
      for (const file of Array.from(fileList)) {
        if (!ALLOWED.includes(file.type)) {
          rejected.push(`${file.name} (unsupported type)`);
          continue;
        }
        if (file.size > MAX) {
          rejected.push(`${file.name} (exceeds 10 MB)`);
          continue;
        }
        newEntries.push({
          id: crypto.randomUUID(),
          kind: "file",
          file,
          preview: URL.createObjectURL(file),
        });
      }

      if (rejected.length) {
        setFileError(`Skipped: ${rejected.join(", ")}`);
      }
      if (newEntries.length) {
        setEntries((prev) => [...prev, ...newEntries]);
      }
    }, []);

    const addUrlEntry = useCallback(() => {
      setEntries((prev) => [
        ...prev,
        { id: crypto.randomUUID(), kind: "url", url: "" },
      ]);
    }, []);

    const removeEntry = useCallback((id: string) => {
      setEntries((prev) => {
        const entry = prev.find((e) => e.id === id);
        if (entry?.kind === "file") URL.revokeObjectURL(entry.preview);
        return prev.filter((e) => e.id !== id);
      });
    }, []);

    const updateUrl = useCallback((id: string, url: string) => {
      setEntries((prev) =>
        prev.map((e) => (e.id === id && e.kind === "url" ? { ...e, url } : e))
      );
    }, []);

    const move = useCallback((from: number, to: number) => {
      setEntries((prev) => {
        const next = [...prev];
        const [item] = next.splice(from, 1);
        next.splice(to, 0, item);
        return next;
      });
    }, []);

    // Drop-zone drag handlers
    const handleDropZoneDragOver = (e: React.DragEvent) => {
      e.preventDefault();
    };
    const handleDropZoneDrop = (e: React.DragEvent) => {
      e.preventDefault();
      if (e.dataTransfer.files.length > 0) {
        addFiles(e.dataTransfer.files);
      }
    };

    return (
      <div className="space-y-3">
        {entries.length === 0 ? (
          // Empty drop zone
          <div
            onDragOver={handleDropZoneDragOver}
            onDrop={handleDropZoneDrop}
            className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed py-10 transition-colors"
            style={{ borderColor: "#E4E5E8" }}
          >
            <UploadCloud className="h-7 w-7" style={{ color: "#D1D5DB" }} />
            <p className="text-sm" style={{ color: "#9CA3AF" }}>
              Drop images here, or use the buttons below
            </p>
          </div>
        ) : (
          <div
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3"
            onDragOver={handleDropZoneDragOver}
            onDrop={handleDropZoneDrop}
          >
            {entries.map((entry, index) => (
              <ImageCard
                key={entry.id}
                entry={entry}
                index={index}
                isDragging={dragIndexRef.current === index}
                isOver={overIndex === index && dragIndexRef.current !== index}
                onRemove={() => removeEntry(entry.id)}
                onUrlChange={(url) => updateUrl(entry.id, url)}
                onDragStart={() => {
                  dragIndexRef.current = index;
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  if (dragIndexRef.current !== null) setOverIndex(index);
                }}
                onDrop={() => {
                  if (
                    dragIndexRef.current !== null &&
                    dragIndexRef.current !== index
                  ) {
                    move(dragIndexRef.current, index);
                  }
                  dragIndexRef.current = null;
                  setOverIndex(null);
                }}
                onDragEnd={() => {
                  dragIndexRef.current = null;
                  setOverIndex(null);
                }}
              />
            ))}
          </div>
        )}

        {/* Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={addUrlEntry}
            className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-gray-50"
            style={{ borderColor: "#E4E5E8", color: "#5B5F6B" }}
          >
            <Plus className="h-3.5 w-3.5" />
            Add URL
          </button>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-gray-50"
            style={{ borderColor: "#E4E5E8", color: "#5B5F6B" }}
          >
            <UploadCloud className="h-3.5 w-3.5" />
            Upload images
          </button>
          <span className="text-xs" style={{ color: "#9CA3AF" }}>
            JPG, PNG, WebP · max 4 MB each · drag to reorder
          </span>
        </div>

        {fileError && (
          <p className="text-xs" style={{ color: "#DC2626" }}>
            {fileError}
          </p>
        )}

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.length) addFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </div>
    );
  }
);
