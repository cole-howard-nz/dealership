import { Construction } from "lucide-react";

interface PhasePlaceholderProps {
  title: string;
  description: string;
  phase: string;
}

export function PhasePlaceholder({ title, description, phase }: PhasePlaceholderProps) {
  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-bold" style={{ color: "#13151A" }}>
          {title}
        </h1>
      </div>

      <div
        className="rounded-xl border bg-white shadow-sm p-10 text-center"
        style={{ borderColor: "#E4E5E8" }}
      >
        <div
          className="h-14 w-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
          style={{ backgroundColor: "#142036" }}
        >
          <Construction className="h-7 w-7 text-white" aria-hidden="true" />
        </div>
        <h2 className="font-heading text-lg font-bold mb-2" style={{ color: "#13151A" }}>
          Coming in {phase}
        </h2>
        <p className="text-sm max-w-sm mx-auto" style={{ color: "#5B5F6B" }}>
          {description}
        </p>
      </div>
    </div>
  );
}
