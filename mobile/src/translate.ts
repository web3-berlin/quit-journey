/**
 * Translations for text built outside React (notifications, channel names, thrown errors).
 * Uses the same catalogs and locale choice as the shared UI's I18nProvider.
 * Call `prepareTranslations()` before building text; `formatMessage` uses whatever catalog is loaded
 * (English until then). Call sites pass `{ id, defaultMessage }` literals so `formatjs extract` finds them.
 */
import { createIntl, createIntlCache, type IntlShape, type MessageDescriptor } from "react-intl";
import { loadMessages, type Messages } from "../../editors/quit-journey-editor/i18n/loaders.js";
import { resolveLocale, SOURCE_LOCALE } from "../../editors/quit-journey-editor/i18n/locales.js";

/** Same key as I18nProvider: the user's explicit language choice on this device. */
const STORAGE_KEY = "qj-locale";

/** The user's chosen language, or the best match for the device languages. */
export function activeLocale(): string {
  let chosen: string | null = null;
  try {
    chosen = localStorage.getItem(STORAGE_KEY);
  } catch {
    // No storage: follow the device.
  }
  return chosen ? resolveLocale([chosen]) : resolveLocale(typeof navigator === "undefined" ? [] : navigator.languages);
}

const catalogs = new Map<string, Promise<Messages>>();

/** Loads (once) the catalog for a locale; an unavailable catalog falls back to English. */
export function loadCatalog(locale: string): Promise<Messages> {
  let pending = catalogs.get(locale);
  if (!pending) {
    pending = loadMessages(locale).catch((e: unknown) => {
      console.error(`Could not load ${locale} messages`, e);
      catalogs.delete(locale);
      return {};
    });
    catalogs.set(locale, pending);
  }
  return pending;
}

export function onIntlError(err: { code: string }) {
  // Missing keys fall back to English by design; report anything else.
  if (err.code !== "MISSING_TRANSLATION") console.error(err);
}

const cache = createIntlCache();
const build = (locale: string, messages: Messages) => createIntl({ locale, defaultLocale: SOURCE_LOCALE, messages, onError: onIntlError }, cache);
let intl: IntlShape = build(SOURCE_LOCALE, {});

/** Makes sure the active locale's catalog is loaded; resolves to that locale. */
export async function prepareTranslations(): Promise<string> {
  const locale = activeLocale();
  if (intl.locale !== locale) {
    const messages = await loadCatalog(locale);
    intl = build(locale, messages);
  }
  return locale;
}

export type MessageValues = Record<string, string | number | boolean | Date | null | undefined>;

/** ICU message in the loaded language, falling back to `defaultMessage`. */
export function formatMessage(descriptor: MessageDescriptor, values?: MessageValues): string {
  return intl.formatMessage(descriptor, values);
}

/** Engine content by id (see `cid` in content.ts), verbatim, or the English source. */
export function tc(id: string, english: string): string {
  const m = intl.messages[id];
  return typeof m === "string" && m.length > 0 ? m : english;
}
