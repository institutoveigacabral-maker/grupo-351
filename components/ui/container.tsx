import type { HTMLAttributes } from "react";

const maxWidths = {
  sm: "max-w-3xl",
  md: "max-w-5xl",
  lg: "max-w-6xl",
  xl: "max-w-7xl",
  full: "max-w-full",
} as const;

export interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  size?: keyof typeof maxWidths;
}

export function Container({ size = "lg", className = "", children, ...props }: ContainerProps) {
  return (
    <div className={`${maxWidths[size]} mx-auto px-4 md:px-6 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function Stack({ className = "", children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`flex flex-col gap-6 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function Row({ className = "", children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`flex items-center gap-3 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function Section({ className = "", children, ...props }: HTMLAttributes<HTMLElement>) {
  return (
    <section className={`py-16 md:py-24 ${className}`} {...props}>
      {children}
    </section>
  );
}
