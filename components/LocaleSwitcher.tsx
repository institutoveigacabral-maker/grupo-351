"use client";

import { useState } from "react";
import { Globe } from "lucide-react";
import { locales, localeNames, type Locale } from "@/i18n/config";

const flags: Record<Locale, string> = {
  "pt-BR": "BR",
  "pt-PT": "PT",
  en: "EN",
  es: "ES",
};

export function LocaleSwitcher() {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState<Locale>(() => {
    if (typeof document !== "undefined") {
      const match = document.cookie.match(/locale=([^;]+)/);
      return (match?.[1] as Locale) || "pt-PT";
    }
    return "pt-PT";
  });

  async function changeLocale(locale: Locale) {
    await fetch("/api/platform/locale", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ locale }),
    });
    setCurrent(locale);
    setOpen(false);
    window.location.reload();
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 text-gray-400 hover:text-gray-600 transition-colors p-1.5 text-xs font-medium"
      >
        <Globe className="w-3.5 h-3.5" />
        {flags[current]}
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1 w-44 bg-white rounded-lg border border-gray-200 shadow-lg z-50 py-1 overflow-hidden">
            {locales.map((locale) => (
              <button
                key={locale}
                onClick={() => changeLocale(locale)}
                className={`w-full text-left px-3 py-2 text-xs hover:bg-gray-50 transition-colors flex items-center justify-between ${
                  locale === current ? "text-amber-600 font-medium bg-amber-50/50" : "text-gray-700"
                }`}
              >
                <span>{localeNames[locale]}</span>
                <span className="text-[10px] text-gray-400">{flags[locale]}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
