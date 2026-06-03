import { TextareaHTMLAttributes, forwardRef } from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ className, label, error, rows = 3, ...props }, ref) => {
    return (
      <div className="w-full flex flex-col gap-1.5 text-left">
        {label ? (
          <label className="text-xs font-semibold uppercase tracking-wider text-text-muted">
            {label}
          </label>
        ) : null}
        <textarea
          ref={ref}
          rows={rows}
          className={twMerge(
            clsx(
              "w-full px-3.5 py-2.5 rounded-lg border border-border-main bg-surface text-text-main placeholder-text-muted/60 focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand transition-all duration-200 text-sm resize-none",
              error && "border-red-500 focus:ring-red-500/20 focus:border-red-500",
              className
            )
          )}
          {...props}
        />
        {error ? <span className="text-xs text-red-500">{error}</span> : null}
      </div>
    );
  }
);

TextArea.displayName = "TextArea";

export default TextArea;
