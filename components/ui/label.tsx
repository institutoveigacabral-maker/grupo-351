import { forwardRef, type LabelHTMLAttributes } from "react";

export interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
}

export const Label = forwardRef<HTMLLabelElement, LabelProps>(
  ({ className = "", required, children, ...props }, ref) => {
    return (
      <label
        ref={ref}
        className={`block text-sm font-medium text-foreground mb-1.5 ${className}`}
        {...props}
      >
        {children}
        {required && <span className="text-red-500 ml-0.5" aria-hidden="true">*</span>}
      </label>
    );
  }
);
Label.displayName = "Label";
