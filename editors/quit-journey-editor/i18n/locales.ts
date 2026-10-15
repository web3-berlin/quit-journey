export interface LocaleInfo {
  /** BCP 47 tag, also the catalog file name. */
  code: string;
  /** Name in the language itself, for the picker. */
  name: string;
  /** English name, for docs and translators. */
  english: string;
  dir: "ltr" | "rtl";
}

/**
 * English plus 40 of the most-spoken languages (total speakers, Ethnologue 2025 ranking) that have
 * a standard written form and CLDR locale data, so Intl number/date/plural rules work. Spoken
 * varieties without their own written standard are served by their written language. Arabic,
 * Persian, Urdu, Pashto, Sindhi, Indonesian, Malay, Burmese and Odia aren't included yet: their
 * translations were stopped before completion. Right-to-left support (dir="rtl") stays in place
 * for when they are added. English is the source language.
 */
export const LOCALES: LocaleInfo[] = [
  { code: "en", name: "English", english: "English", dir: "ltr" },
  { code: "zh-Hans", name: "简体中文", english: "Chinese (Simplified)", dir: "ltr" },
  { code: "hi", name: "हिन्दी", english: "Hindi", dir: "ltr" },
  { code: "es", name: "Español", english: "Spanish", dir: "ltr" },
  { code: "fr", name: "Français", english: "French", dir: "ltr" },
  { code: "bn", name: "বাংলা", english: "Bengali", dir: "ltr" },
  { code: "pt", name: "Português", english: "Portuguese", dir: "ltr" },
  { code: "ru", name: "Русский", english: "Russian", dir: "ltr" },
  { code: "de", name: "Deutsch", english: "German", dir: "ltr" },
  { code: "ja", name: "日本語", english: "Japanese", dir: "ltr" },
  { code: "pcm", name: "Naijá", english: "Nigerian Pidgin", dir: "ltr" },
  { code: "mr", name: "मराठी", english: "Marathi", dir: "ltr" },
  { code: "te", name: "తెలుగు", english: "Telugu", dir: "ltr" },
  { code: "tr", name: "Türkçe", english: "Turkish", dir: "ltr" },
  { code: "ha", name: "Hausa", english: "Hausa", dir: "ltr" },
  { code: "ta", name: "தமிழ்", english: "Tamil", dir: "ltr" },
  { code: "sw", name: "Kiswahili", english: "Swahili", dir: "ltr" },
  { code: "vi", name: "Tiếng Việt", english: "Vietnamese", dir: "ltr" },
  { code: "fil", name: "Filipino", english: "Filipino (Tagalog)", dir: "ltr" },
  { code: "pa", name: "ਪੰਜਾਬੀ", english: "Punjabi", dir: "ltr" },
  { code: "ko", name: "한국어", english: "Korean", dir: "ltr" },
  { code: "jv", name: "Basa Jawa", english: "Javanese", dir: "ltr" },
  { code: "it", name: "Italiano", english: "Italian", dir: "ltr" },
  { code: "gu", name: "ગુજરાતી", english: "Gujarati", dir: "ltr" },
  { code: "th", name: "ไทย", english: "Thai", dir: "ltr" },
  { code: "am", name: "አማርኛ", english: "Amharic", dir: "ltr" },
  { code: "kn", name: "ಕನ್ನಡ", english: "Kannada", dir: "ltr" },
  { code: "yo", name: "Yorùbá", english: "Yoruba", dir: "ltr" },
  { code: "pl", name: "Polski", english: "Polish", dir: "ltr" },
  { code: "ml", name: "മലയാളം", english: "Malayalam", dir: "ltr" },
  { code: "uk", name: "Українська", english: "Ukrainian", dir: "ltr" },
  { code: "su", name: "Basa Sunda", english: "Sundanese", dir: "ltr" },
  { code: "ig", name: "Igbo", english: "Igbo", dir: "ltr" },
  { code: "uz", name: "Oʻzbekcha", english: "Uzbek", dir: "ltr" },
  { code: "ro", name: "Română", english: "Romanian", dir: "ltr" },
  { code: "nl", name: "Nederlands", english: "Dutch", dir: "ltr" },
  { code: "az", name: "Azərbaycanca", english: "Azerbaijani", dir: "ltr" },
  { code: "ne", name: "नेपाली", english: "Nepali", dir: "ltr" },
  { code: "zh-Hant", name: "繁體中文", english: "Chinese (Traditional)", dir: "ltr" },
  { code: "zu", name: "isiZulu", english: "Zulu", dir: "ltr" },
  { code: "yue", name: "粵語", english: "Cantonese", dir: "ltr" },
];

export const SOURCE_LOCALE = "en";

/** Best supported locale for a list of preferences (e.g. navigator.languages). */
export function resolveLocale(preferred: readonly string[]): string {
  const codes = LOCALES.map((l) => l.code);
  for (const raw of preferred) {
    const tag = raw.replace("_", "-");
    const exact = codes.find((c) => c.toLowerCase() === tag.toLowerCase());
    if (exact) return exact;
    const [lang, ...rest] = tag.split("-");
    if (lang.toLowerCase() === "zh") {
      // Cantonese for Hong Kong/Macau, Traditional script for Taiwan or explicit Hant, otherwise Simplified.
      if (rest.some((r) => /^(hk|mo)$/i.test(r))) return "yue";
      return rest.some((r) => /^(hant|tw)$/i.test(r)) ? "zh-Hant" : "zh-Hans";
    }
    if (lang.toLowerCase() === "tl") return "fil";
    const base = codes.find((c) => c.toLowerCase() === lang.toLowerCase());
    if (base) return base;
  }
  return SOURCE_LOCALE;
}

export function localeInfo(code: string): LocaleInfo {
  return LOCALES.find((l) => l.code === code) ?? LOCALES[0];
}
