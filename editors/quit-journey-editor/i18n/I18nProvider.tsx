import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { IntlProvider, ReactIntlErrorCode } from "react-intl";
import { setFormatLocale } from "../lib/format.js";
import { loadMessages, type Messages } from "./loaders.js";
import { localeInfo, resolveLocale, SOURCE_LOCALE } from "./locales.js";

const STORAGE_KEY = "qj-locale";

interface LanguageContextValue {
  locale: string;
  /** The user's explicit choice, or null when following the device language. */
  chosen: string | null;
  setLocale: (code: string | null) => void;
}

const LanguageContext = createContext<LanguageContextValue>({ locale: SOURCE_LOCALE, chosen: null, setLocale: () => undefined });

export const useLanguage = () => useContext(LanguageContext);

function readChoice(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function deviceLocale(): string {
  return resolveLocale(typeof navigator === "undefined" ? [] : navigator.languages);
}

/**
 * Wraps the app in react-intl. English is the source language (messages come from each
 * `defaultMessage`); other catalogs are loaded lazily. The language follows the device
 * unless the user picks one, which is remembered on this device.
 */
export function I18nProvider({ children, locale: forced }: { children: ReactNode; locale?: string }) {
  const [chosen, setChosen] = useState<string | null>(readChoice);
  const locale = forced ?? chosen ?? deviceLocale();
  const [loaded, setLoaded] = useState<{ locale: string; messages: Messages }>({ locale: SOURCE_LOCALE, messages: {} });

  useEffect(() => {
    let alive = true;
    void loadMessages(locale)
      .then((messages) => alive && setLoaded({ locale, messages }))
      .catch((e: unknown) => console.error(`Could not load ${locale} messages`, e));
    return () => {
      alive = false;
    };
  }, [locale]);

  // Until the catalog arrives, render English rather than mixing languages.
  const active = loaded.locale === locale ? loaded : { locale: SOURCE_LOCALE, messages: {} };
  setFormatLocale(active.locale);

  const value = useMemo<LanguageContextValue>(() => ({
    locale: active.locale,
    chosen,
    setLocale: (code) => {
      try {
        if (code) localStorage.setItem(STORAGE_KEY, code);
        else localStorage.removeItem(STORAGE_KEY);
      } catch {
        // A remembered language is a convenience only.
      }
      setChosen(code);
    },
  }), [active.locale, chosen]);

  return (
    <LanguageContext.Provider value={value}>
      <IntlProvider
        locale={active.locale}
        defaultLocale={SOURCE_LOCALE}
        messages={active.messages}
        onError={(err) => {
          // Missing keys fall back to English by design; report anything else.
          if (err.code !== ReactIntlErrorCode.MISSING_TRANSLATION) console.error(err);
        }}
      >
        {children}
      </IntlProvider>
    </LanguageContext.Provider>
  );
}

export function useDirection(): "ltr" | "rtl" {
  return localeInfo(useLanguage().locale).dir;
}
