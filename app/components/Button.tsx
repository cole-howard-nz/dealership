import { ButtonHTMLAttributes, forwardRef } from "react";

type Variant = "primary" | "secondary" | "ghost";
type Size = "md" | "sm";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  isLoading?: boolean;
}

const base =
  "inline-flex items-center justify-center gap-2 font-semibold rounded-md transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed";

const variants: Record<Variant, string> = {
  primary: "bg-accent text-white hover:bg-accent-hover",
  secondary: "bg-transparent border-2 border-navy text-navy hover:bg-navy hover:text-white",
  ghost: "bg-transparent text-navy hover:bg-border",
};

const sizes: Record<Size, string> = {
  md: "px-6 py-3 text-base",
  sm: "px-4 py-2 text-sm",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", isLoading, className = "", children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && (
          <span className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white animate-spin" aria-hidden="true" />
        )}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
