"use client";

import { useState, useRef, useEffect, type ReactNode } from "react";

interface DropdownProps {
  trigger: ReactNode;
  children: ReactNode;
  align?: "left" | "right";
  className?: string;
}

export function Dropdown({ trigger, children, align = "right", className = "" }: DropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }

    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  return (
    <div ref={ref} className={`relative ${className}`}>
      <div onClick={() => setOpen(!open)} aria-expanded={open}>
        {trigger}
      </div>
      {open && (
        <div
          className={`absolute top-full mt-1.5 z-50 min-w-[180px] bg-white rounded-xl border border-black/[0.06] shadow-lg shadow-black/[0.08] overflow-hidden animate-scale-in ${
            align === "right" ? "right-0" : "left-0"
          }`}
          role="menu"
        >
          {children}
        </div>
      )}
    </div>
  );
}

interface DropdownItemProps {
  children: ReactNode;
  onClick?: () => void;
  danger?: boolean;
  disabled?: boolean;
}

export function DropdownItem({ children, onClick, danger, disabled }: DropdownItemProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      role="menuitem"
      className={`w-full text-left px-3 py-2 text-sm transition-colors flex items-center gap-2
        ${danger ? "text-red-600 hover:bg-red-50" : "text-gray-700 hover:bg-gray-50"}
        ${disabled ? "opacity-40 pointer-events-none" : ""}
      `}
    >
      {children}
    </button>
  );
}

export function DropdownSeparator() {
  return <div className="h-px bg-black/[0.04] my-1" />;
}
