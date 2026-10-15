import { useIntl } from "react-intl";
import { useLanguage } from "../i18n/I18nProvider.js";
import { LOCALES, localeInfo, resolveLocale } from "../i18n/locales.js";

const DEVICE = "__device__";

/** Language choice, remembered on this device; "device language" follows the phone/browser setting. */
export function LanguagePicker() {
  const intl = useIntl();
  const { chosen, setLocale } = useLanguage();
  const device = localeInfo(resolveLocale(typeof navigator === "undefined" ? [] : navigator.languages));
  return (
    <section className="stack">
      <h3>{intl.formatMessage({ id: "language.heading", defaultMessage: "Language" })}</h3>
      <select value={chosen ?? DEVICE} onChange={(e) => setLocale(e.target.value === DEVICE ? null : e.target.value)} aria-label={intl.formatMessage({ id: "language.heading", defaultMessage: "Language" })}>
        <option value={DEVICE}>{intl.formatMessage({ id: "language.device", defaultMessage: "Device language ({name})" }, { name: device.name })}</option>
        {LOCALES.map((l) => <option key={l.code} value={l.code} lang={l.code}>{l.name}</option>)}
      </select>
      {(chosen ?? device.code) !== "en" && (
        <p className="muted">
          {intl.formatMessage({ id: "language.machineNote", defaultMessage: "This translation was made with AI and hasn't been reviewed by a native speaker yet. Recovery scales stay in English until validated translations are available." })}
        </p>
      )}
    </section>
  );
}
