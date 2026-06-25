import { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes, useId } from "react";
import { AlertCircle } from "lucide-react";

interface FieldShellProps {
  label: string;
  error?: string;
  required?: boolean;
  hint?: string;
  htmlFor: string;
  children: React.ReactNode;
}

function FieldShell({ label, error, required, hint, htmlFor, children }: FieldShellProps) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={htmlFor} className="text-sm font-semibold text-ink flex items-center gap-1">
        {label}
        {required ? (
          <span className="text-accent" aria-hidden="true">*</span>
        ) : (
          <span className="text-ink-muted font-normal">(optional)</span>
        )}
      </label>
      {children}
      {hint && !error && <span className="text-xs text-ink-muted">{hint}</span>}
      {error && (
        <span id={`${htmlFor}-error`} className="text-xs text-error flex items-center gap-1" role="alert">
          <AlertCircle className="h-3.5 w-3.5" aria-hidden="true" />
          {error}
        </span>
      )}
    </div>
  );
}

const inputBase =
  "w-full rounded-lg border bg-surface px-3 py-2 text-base text-ink placeholder:text-ink-muted/70 focus:outline-none focus:ring-2 focus:ring-navy/40 h-12";

type TextFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
  required?: boolean;
  hint?: string;
};

export function TextField({ label, error, required, hint, id, ...props }: TextFieldProps) {
  const autoId = useId();
  const fieldId = id ?? autoId;
  return (
    <FieldShell label={label} error={error} required={required} hint={hint} htmlFor={fieldId}>
      <input
        id={fieldId}
        aria-invalid={!!error}
        aria-describedby={error ? `${fieldId}-error` : undefined}
        className={`${inputBase} ${error ? "border-error" : "border-border"}`}
        {...props}
      />
    </FieldShell>
  );
}

type SelectFieldProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  error?: string;
  required?: boolean;
  options: { label: string; value: string }[];
};

export function SelectField({ label, error, required, id, options, ...props }: SelectFieldProps) {
  const autoId = useId();
  const fieldId = id ?? autoId;
  return (
    <FieldShell label={label} error={error} required={required} htmlFor={fieldId}>
      <select
        id={fieldId}
        aria-invalid={!!error}
        aria-describedby={error ? `${fieldId}-error` : undefined}
        className={`${inputBase} ${error ? "border-error" : "border-border"}`}
        {...props}
      >
        <option value="">Select…</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </FieldShell>
  );
}

type TextAreaFieldProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
  error?: string;
  required?: boolean;
};

export function TextAreaField({ label, error, required, id, ...props }: TextAreaFieldProps) {
  const autoId = useId();
  const fieldId = id ?? autoId;
  return (
    <FieldShell label={label} error={error} required={required} htmlFor={fieldId}>
      <textarea
        id={fieldId}
        aria-invalid={!!error}
        aria-describedby={error ? `${fieldId}-error` : undefined}
        rows={4}
        className={`${inputBase} ${error ? "border-error" : "border-border"}`}
        {...props}
      />
    </FieldShell>
  );
}

export function CheckboxField({
  label, error, id, ...props
}: InputHTMLAttributes<HTMLInputElement> & { label: React.ReactNode; error?: string }) {
  const autoId = useId();
  const fieldId = id ?? autoId;
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-start gap-2">
        <input id={fieldId} type="checkbox" className="mt-1 h-4 w-4 accent-accent" aria-invalid={!!error}
          aria-describedby={error ? `${fieldId}-error` : undefined} {...props} />
        <label htmlFor={fieldId} className="text-sm text-ink">{label}</label>
      </div>
      {error && (
        <span id={`${fieldId}-error`} className="text-xs text-error flex items-center gap-1 ml-6" role="alert">
          <AlertCircle className="h-3.5 w-3.5" aria-hidden="true" />
          {error}
        </span>
      )}
    </div>
  );
}
