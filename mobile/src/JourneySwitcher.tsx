import { useIntl } from "react-intl";
import { useContent } from "../../editors/quit-journey-editor/i18n/content.js";
import type { QuitJourneyDocument } from "./core.js";
import { profileDisplayName } from "./names.js";

const NEW = "__new__";

/** Display name of a journey in the active language ("Cigarettes", "Alcohol", the user's own name…). */
export function useJourneyName(): (doc: QuitJourneyDocument) => string {
  const intl = useIntl();
  const { tc } = useContent();
  return (doc) => {
    const plan = doc.state.global.plan;
    return plan ? profileDisplayName(plan, tc) : intl.formatMessage({ id: "mobile.journeys.new", defaultMessage: "New journey" });
  };
}

/** Pill over the sky for switching between journeys (one per addiction). */
export function JourneySwitcher({ docs, activeId, onSelect, onNew }: { docs: QuitJourneyDocument[]; activeId: string; onSelect: (id: string) => void; onNew: () => void }) {
  const intl = useIntl();
  const journeyName = useJourneyName();
  return (
    <label className="journey-switcher">
      <span className="visually-hidden">{intl.formatMessage({ id: "mobile.journeys.label", defaultMessage: "Journey" })}</span>
      <select value={activeId} onChange={(e) => (e.target.value === NEW ? onNew() : onSelect(e.target.value))}>
        {docs.map((d) => <option key={d.header.id} value={d.header.id}>{journeyName(d)}</option>)}
        <option value={NEW}>{intl.formatMessage({ id: "mobile.journeys.startAnother", defaultMessage: "+ Start another journey" })}</option>
      </select>
    </label>
  );
}
