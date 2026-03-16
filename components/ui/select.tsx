import { forwardRef, type SelectHTMLAttributes } from "react";

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  error?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className = "", error, children, ...props }, ref) => {
    return (
      <div className="w-full">
        <select
          ref={ref}
          aria-invalid={error ? "true" : undefined}
          className={`w-full px-4 py-2.5 rounded-lg border text-sm bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-accent/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
            error ? "border-red-300 focus:ring-red-200" : "border-border"
          } ${className}`}
          {...props}
        >
          {children}
        </select>
        {error && (
          <p className="text-xs text-red-500 mt-1.5" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);
Select.displayName = "Select";
