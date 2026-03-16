import type { ReactNode } from "react";

export interface FormFieldProps {
  label: string;
  htmlFor?: string;
  required?: boolean;
  error?: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

export function FormField({
  label,
  htmlFor,
  required,
  error,
  description,
  children,
  className = "",
}: FormFieldProps) {
  return (
    <div className={className}>
      <label htmlFor={htmlFor} className="block text-sm font-medium text-foreground mb-1.5">
        {label}
        {required && <span className="text-red-500 ml-0.5" aria-hidden="true">*</span>}
      </label>
      {children}
      {description && !error && (
        <p className="text-xs text-muted mt-1.5">{description}</p>
      )}
      {error && (
        <p className="text-xs text-red-500 mt-1.5" role="alert">{error}</p>
      )}
    </div>
  );
}
