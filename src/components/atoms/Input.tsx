import { cn } from "@/lib/utils";
import { forwardRef, type InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ error, className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          "w-full border px-4 py-3 text-sm transition-colors bg-[var(--bg)] text-[var(--text)]",
          "placeholder:text-[var(--muted)]",
          "focus:outline-none focus:border-[var(--accent)]",
          error
            ? "border-red-500"
            : "border-[var(--border)] hover:border-[var(--muted)]",
          className
        )}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";
