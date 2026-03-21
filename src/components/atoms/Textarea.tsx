import { cn } from "@/lib/utils";
import { forwardRef, type TextareaHTMLAttributes } from "react";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ error, className, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          "w-full border px-4 py-3 text-sm transition-colors resize-y min-h-[100px]",
          "bg-[var(--bg)] text-[var(--text)]",
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
Textarea.displayName = "Textarea";
