interface BadgeProps {
  children: React.ReactNode;
  tone?: "default" | "success" | "warning" | "error" | "navy";
}

const tones: Record<string, string> = {
  default: "bg-border text-ink",
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  error: "bg-error/10 text-error",
  navy: "bg-navy text-white",
};

export function Badge({ children, tone = "default" }: BadgeProps) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-sm px-2 py-1 text-xs font-semibold ${tones[tone]}`}>
      {children}
    </span>
  );
}
