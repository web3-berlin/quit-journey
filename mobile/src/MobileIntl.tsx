import { useEffect, useState, type ReactNode } from "react";
import { IntlProvider, useIntl } from "react-intl";
import type { Messages } from "../../editors/quit-journey-editor/i18n/loaders.js";
import { localeInfo, SOURCE_LOCALE } from "../../editors/quit-journey-editor/i18n/locales.js";
import { activeLocale, loadCatalog, onIntlError } from "./translate.js";

/**
 * react-intl for screens rendered outside QuitJourneyApp (lock screen, boot screen), in the same
 * language the app uses. The language is read when the wrapper mounts.
 */
export function MobileIntlProvider({ children }: { children: ReactNode }) {
  const [locale] = useState(activeLocale);
  const [messages, setMessages] = useState<Messages | null>(null);

  useEffect(() => {
    let alive = true;
    void loadCatalog(locale).then((m) => alive && setMessages(m));
    return () => {
      alive = false;
    };
  }, [locale]);

  // Until the catalog arrives, render English rather than mixing languages.
  return (
    <IntlProvider locale={messages ? locale : SOURCE_LOCALE} defaultLocale={SOURCE_LOCALE} messages={messages ?? {}} onError={onIntlError}>
      {children}
    </IntlProvider>
  );
}

/** `dir` and `lang` attributes for a root element in the current intl language. */
export function useLocaleAttrs(): { dir: "ltr" | "rtl"; lang: string } {
  const { locale } = useIntl();
  return { dir: localeInfo(locale).dir, lang: locale };
}

/** Rendered inside QuitJourneyApp: reports the UI language so text built outside React can follow it. */
export function LocaleListener({ onLocale }: { onLocale: (locale: string) => void }) {
  const { locale } = useIntl();
  useEffect(() => onLocale(locale), [locale, onLocale]);
  return null;
}
