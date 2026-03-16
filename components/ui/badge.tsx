import type { HTMLAttributes } from "react";

const variants = {
  default: "bg-gray-100 text-gray-700",
  primary: "bg-accent/10 text-accent",
  success: "bg-emerald-100 text-emerald-700",
  warning: "bg-amber-100 text-amber-700",
  danger: "bg-red-100 text-red-700",
  purple: "bg-purple-100 text-purple-700",
  blue: "bg-blue-100 text-blue-700",
} as const;

const sizes = {
  sm: "text-[10px] px-2 py-0.5",
  md: "text-xs px-2.5 py-1",
} as const;

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
}

export function Badge({
  className = "",
  variant = "default",
  size = "sm",
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center font-medium rounded-full ring-1 ring-inset ring-black/[0.04] ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}
