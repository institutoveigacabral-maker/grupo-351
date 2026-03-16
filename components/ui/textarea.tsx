import { forwardRef, type TextareaHTMLAttributes } from "react";

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className = "", error, ...props }, ref) => {
    return (
      <div className="w-full">
        <textarea
          ref={ref}
          aria-invalid={error ? "true" : undefined}
          aria-describedby={error ? `${props.id}-error` : undefined}
          className={`w-full px-4 py-2.5 rounded-lg border text-sm bg-white text-foreground placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-accent/30 transition-colors resize-y min-h-[100px] disabled:opacity-50 disabled:cursor-not-allowed ${
            error ? "border-red-300 focus:ring-red-200" : "border-border"
          } ${className}`}
          {...props}
        />
        {error && (
          <p id={`${props.id}-error`} className="text-xs text-red-500 mt-1.5" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);
Textarea.displayName = "Textarea";
