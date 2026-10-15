import { computeJourney, type QuitJourneyLocalState, type QuitJourneyState } from "document-models/quit-journey";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { defineMessages, useIntl } from "react-intl";
import { BadgesTab } from "./components/BadgesTab.js";
import { CravingsTab } from "./components/CravingsTab.js";
import { HealthTab } from "./components/HealthTab.js";
import { InsightsTab } from "./components/InsightsTab.js";
import { PlanTab } from "./components/PlanTab.js";
import { RewardsTab } from "./components/RewardsTab.js";
import { SkyHero } from "./components/SkyHero.js";
import { SosOverlay } from "./components/SosOverlay.js";
import { TodayTab } from "./components/TodayTab.js";
import { ToolkitTab } from "./components/toolkit/ToolkitTab.js";
import { RiskyPlaceBanner } from "./components/RiskyPlaceBanner.js";
import type { HostCapabilities } from "./lib/host.js";
import type { Dispatch, TabProps } from "./lib/types.js";
import { useNow } from "./lib/useNow.js";
import { styles } from "./styles.js";
import { I18nProvider, useDirection, useLanguage } from "./i18n/I18nProvider.js";
import { LanguagePicker } from "./components/LanguagePicker.js";

const TAB_LABELS = defineMessages({
  today: { id: "app.tab.today", defaultMessage: "Today" },
  health: { id: "app.tab.health", defaultMessage: "Health" },
  cravings: { id: "app.tab.cravings", defaultMessage: "Cravings" },
  toolkit: { id: "app.tab.toolkit", defaultMessage: "Toolkit" },
  rewards: { id: "app.tab.rewards", defaultMessage: "Rewards" },
  badges: { id: "app.tab.badges", defaultMessage: "Badges" },
  insights: { id: "app.tab.insights", defaultMessage: "Insights" },
  plan: { id: "app.tab.plan", defaultMessage: "My plan" },
});

const TABS = [
  { key: "today", label: TAB_LABELS.today, Component: TodayTab },
  { key: "health", label: TAB_LABELS.health, Component: HealthTab },
  { key: "cravings", label: TAB_LABELS.cravings, Component: CravingsTab },
  { key: "toolkit", label: TAB_LABELS.toolkit, Component: ToolkitTab },
  { key: "rewards", label: TAB_LABELS.rewards, Component: RewardsTab },
  { key: "badges", label: TAB_LABELS.badges, Component: BadgesTab },
  { key: "insights", label: TAB_LABELS.insights, Component: InsightsTab },
  { key: "plan", label: TAB_LABELS.plan, Component: PlanTab },
] as const;

type TabKey = (typeof TABS)[number]["key"];

/** Returns true when the back press was handled. */
export type BackHandler = () => boolean;

export interface QuitJourneyAppProps {
  state: QuitJourneyState;
  /** Device-private state; defaults to empty. */
  local?: QuitJourneyLocalState;
  dispatch: Dispatch;
  /** Native capabilities offered by the host (alarms, location, screen time…). */
  host?: HostCapabilities;
  /** Rendered above the hero (Connect puts its DocumentToolbar here). */
  toolbar?: ReactNode;
  /** Host-specific settings shown at the end of the "My plan" tab. */
  settings?: ReactNode;
  /** Lets a native host route the hardware back button into the app. */
  registerBackHandler?: (handler: BackHandler) => () => void;
  /** Force a language (BCP 47); by default the device language or the user's choice. */
  locale?: string;
}

const NO_HOST: HostCapabilities = {};
const NO_LOCAL: QuitJourneyLocalState = { safetyChecks: null, riskyPlaces: null };

/** The whole Quit Journey experience, independent of where the document lives. */
export function QuitJourneyApp(props: QuitJourneyAppProps) {
  return (
    <I18nProvider locale={props.locale}>
      <JourneyShell {...props} />
    </I18nProvider>
  );
}

function JourneyShell({ state, local = NO_LOCAL, dispatch, host = NO_HOST, toolbar, settings, registerBackHandler }: QuitJourneyAppProps) {
  const intl = useIntl();
  const dir = useDirection();
  const { locale } = useLanguage();
  const now = useNow();
  const snapshot = useMemo(() => computeJourney(state, now), [state, now]);
  const [tab, setTab] = useState<TabKey>("today");
  const [sos, setSos] = useState(false);

  useEffect(() => {
    if (!registerBackHandler) return;
    return registerBackHandler(() => {
      if (sos) {
        setSos(false);
        return true;
      }
      if (tab !== "today") {
        setTab("today");
        return true;
      }
      return false;
    });
  }, [registerBackHandler, sos, tab]);

  const props: TabProps = { state, local, snapshot, dispatch, host };
  const Active = TABS.find((t) => t.key === tab)?.Component ?? TodayTab;

  return (
    <div className="qj" dir={dir} lang={locale}>
      <style>{styles}</style>
      {toolbar}
      <div className="qj-wrap">
        <SkyHero snapshot={snapshot} displayName={state.displayName ?? null} />
        <nav className="tabs" role="tablist" aria-label={intl.formatMessage({ id: "app.tabs.label", defaultMessage: "Sections" })}>
          {TABS.map((t) => (
            <button key={t.key} type="button" role="tab" aria-selected={tab === t.key} onClick={() => setTab(t.key)}>
              {intl.formatMessage(t.label)}
            </button>
          ))}
        </nav>
        <RiskyPlaceBanner {...props} />
        <main style={{ marginTop: 24 }} role="tabpanel">
          <Active {...props} />
          {tab === "plan" && settings && <div style={{ marginTop: 28 }}>{settings}</div>}
          {tab === "plan" && <div style={{ marginTop: 28 }}><LanguagePicker /></div>}
        </main>
      </div>
      {snapshot.phase !== "NOT_STARTED" && (
        <button type="button" className="sos-fab" onClick={() => setSos(true)} aria-label={intl.formatMessage({ id: "app.sos.label", defaultMessage: "Craving SOS" })}>
          {intl.formatMessage({ id: "app.sos.button", defaultMessage: "SOS" })}
        </button>
      )}
      {sos && <SosOverlay {...props} onClose={() => setSos(false)} />}
    </div>
  );
}
