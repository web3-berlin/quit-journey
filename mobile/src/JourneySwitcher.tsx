import { profileForPlan, type QuitJourneyDocument } from "./core.js";

const NEW = "__new__";

export function journeyName(doc: QuitJourneyDocument): string {
  return doc.state.global.plan ? profileForPlan(doc.state.global.plan).name : "New journey";
}

/** Pill over the sky for switching between journeys (one per addiction). */
export function JourneySwitcher({ docs, activeId, onSelect, onNew }: { docs: QuitJourneyDocument[]; activeId: string; onSelect: (id: string) => void; onNew: () => void }) {
  return (
    <label className="journey-switcher">
      <span className="visually-hidden">Journey</span>
      <select value={activeId} onChange={(e) => (e.target.value === NEW ? onNew() : onSelect(e.target.value))}>
        {docs.map((d) => <option key={d.header.id} value={d.header.id}>{journeyName(d)}</option>)}
        <option value={NEW}>+ Start another journey</option>
      </select>
    </label>
  );
}
