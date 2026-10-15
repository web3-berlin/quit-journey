import { useIntl } from "react-intl";

/** Placeholder while journeys load; rendered outside QuitJourneyApp, so wrap it in MobileIntlProvider. */
export function BootScreen() {
  const intl = useIntl();
  return <div className="boot" aria-busy="true" aria-label={intl.formatMessage({ id: "mobile.boot.loading", defaultMessage: "Loading your journeys…" })} />;
}
