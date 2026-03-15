export const locales = ["pt-BR", "pt-PT", "en", "es"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "pt-PT";

export const localeNames: Record<Locale, string> = {
  "pt-BR": "Português (BR)",
  "pt-PT": "Português (PT)",
  en: "English",
  es: "Español",
};
