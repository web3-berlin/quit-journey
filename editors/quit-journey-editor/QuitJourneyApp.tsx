import { computeJourney, type QuitJourneyState } from "document-models/quit-journey";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { BadgesTab } from "./components/BadgesTab.js";
import { CravingsTab } from "./components/CravingsTab.js";
import { HealthTab } from "./components/HealthTab.js";
import { InsightsTab } from "./components/InsightsTab.js";
import { PlanTab } from "./components/PlanTab.js";
import { RewardsTab } from "./components/RewardsTab.js";
import { SkyHero } from "./components/SkyHero.js";
import { SosOverlay } from "./components/SosOverlay.js";
import { TodayTab } from "./components/TodayTab.js";
import type { Dispatch, TabProps } from "./lib/types.js";
import { useNow } from "./lib/useNow.js";
import { styles } from "./styles.js";

const TABS = [
  { key: "today", label: "Today", Component: TodayTab },
  { key: "health", label: "Health", Component: HealthTab },
  { key: "cravings", label: "Cravings", Component: CravingsTab },
  { key: "rewards", label: "Rewards", Component: RewardsTab },
  { key: "badges", label: "Badges", Component: BadgesTab },
  { key: "insights", label: "Insights", Component: InsightsTab },
  { key: "plan", label: "My plan", Component: PlanTab },
] as const;

type TabKey = (typeof TABS)[number]["key"];

/** Returns true when the back press was handled. */
export type BackHandler = () => boolean;

export interface QuitJourneyAppProps {
  state: QuitJourneyState;
  dispatch: Dispatch;
  /** Rendered above the hero (Connect puts its DocumentToolbar here). */
  toolbar?: ReactNode;
  /** Host-specific settings shown at the end of the "My plan" tab. */
  settings?: ReactNode;
  /** Lets a native host route the hardware back button into the app. */
  registerBackHandler?: (handler: BackHandler) => () => void;
}

/** The whole Quit Journey experience, independent of where the document lives. */
export function QuitJourneyApp({ state, dispatch, toolbar, settings, registerBackHandler }: QuitJourneyAppProps) {
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

  const props: TabProps = { state, snapshot, dispatch };
  const Active = TABS.find((t) => t.key === tab)?.Component ?? TodayTab;

  return (
    <div className="qj">
      <style>{styles}</style>
      {toolbar}
      <div className="qj-wrap">
        <SkyHero snapshot={snapshot} displayName={state.displayName ?? null} />
        <nav className="tabs" role="tablist" aria-label="Sections">
          {TABS.map((t) => (
            <button key={t.key} type="button" role="tab" aria-selected={tab === t.key} onClick={() => setTab(t.key)}>
              {t.label}
            </button>
          ))}
        </nav>
        <main style={{ marginTop: 24 }} role="tabpanel">
          <Active {...props} />
          {tab === "plan" && settings && <div style={{ marginTop: 28 }}>{settings}</div>}
        </main>
      </div>
      {snapshot.phase !== "NOT_STARTED" && (
        <button type="button" className="sos-fab" onClick={() => setSos(true)} aria-label="Craving SOS">SOS</button>
      )}
      {sos && <SosOverlay {...props} onClose={() => setSos(false)} />}
    </div>
  );
}
