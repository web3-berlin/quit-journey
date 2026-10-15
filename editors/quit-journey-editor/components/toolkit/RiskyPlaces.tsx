import { generateId } from "document-model";
import { actions } from "document-models/quit-journey";
import { useState } from "react";
import type { TabProps } from "../../lib/types.js";
import { Empty } from "../ui.js";

/** High-risk places, stored only on this device (local scope). Alerts fire while the app is open. */
export function RiskyPlaces({ state, local, dispatch, host }: TabProps) {
  const [label, setLabel] = useState("");
  const [radius, setRadius] = useState("150");
  const [planId, setPlanId] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const places = local.riskyPlaces ?? [];
  const plans = state.ifThenPlans ?? [];

  if (!host.currentPosition) {
    return (
      <section className="stack">
        <h3>Risky places</h3>
        <p className="muted">Location alerts are available in the Android app.</p>
      </section>
    );
  }

  async function addHere() {
    const pos = await host.currentPosition?.();
    if (!pos) {
      setMessage("Couldn't get your location. Allow location for Quit Journey and try again outside.");
      return;
    }
    dispatch(actions.addRiskyPlace({ id: generateId(), label: label.trim(), lat: pos.lat, lng: pos.lng, radiusM: Math.round(Number(radius)), planId: planId || null }));
    setLabel("");
    setMessage("Saved. When you open the app near here, it shows your plan.");
  }

  return (
    <section className="stack">
      <h3>Risky places</h3>
      <p className="soft">Save places that pull you back — a bar, a dealer's street, the casino. When you open the app near one, it shows your if-then plan. Locations never leave this phone.</p>
      {places.length === 0 && <Empty>No places saved.</Empty>}
      <ul className="list">
        {places.map((p) => (
          <li key={p.id}>
            <span><strong>{p.label}</strong> <span className="muted">({p.radiusM} m)</span></span>
            <button type="button" className="linkish" onClick={() => dispatch(actions.deleteRiskyPlace({ id: p.id }))}>Delete</button>
          </li>
        ))}
      </ul>
      <div className="grid2">
        <label className="field"><span>Name this place</span><input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="The corner bar" /></label>
        <label className="field"><span>Radius (m)</span><input type="number" min="25" max="5000" value={radius} onChange={(e) => setRadius(e.target.value)} /></label>
        {plans.length > 0 && (
          <label className="field"><span>Show this plan</span>
            <select value={planId} onChange={(e) => setPlanId(e.target.value)}>
              <option value="">My best plan</option>
              {plans.map((p) => <option key={p.id} value={p.id}>{p.ifText}</option>)}
            </select>
          </label>
        )}
      </div>
      <button type="button" className="btn ghost" disabled={!label.trim() || !(Number(radius) >= 25 && Number(radius) <= 5000)} onClick={() => void addHere()}>Save where I am now</button>
      {message && <p className="soft">{message}</p>}
    </section>
  );
}
