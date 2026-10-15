import { generateId } from "document-model";
import { actions } from "document-models/quit-journey";
import { useState } from "react";
import { useIntl } from "react-intl";
import type { TabProps } from "../../lib/types.js";
import { Empty } from "../ui.js";

/** High-risk places, stored only on this device (local scope). Alerts fire while the app is open. */
export function RiskyPlaces({ state, local, dispatch, host }: TabProps) {
  const intl = useIntl();
  const [label, setLabel] = useState("");
  const [radius, setRadius] = useState("150");
  const [planId, setPlanId] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const places = local.riskyPlaces ?? [];
  const plans = state.ifThenPlans ?? [];

  const heading = intl.formatMessage({ id: "toolkit.places.heading", defaultMessage: "Risky places" });

  if (!host.currentPosition) {
    return (
      <section className="stack">
        <h3>{heading}</h3>
        <p className="muted">{intl.formatMessage({ id: "toolkit.places.androidOnly", defaultMessage: "Location alerts are available in the Android app." })}</p>
      </section>
    );
  }

  async function addHere() {
    const pos = await host.currentPosition?.();
    if (!pos) {
      setMessage(intl.formatMessage({ id: "toolkit.places.noLocation", defaultMessage: "Couldn't get your location. Allow location for Quit Journey and try again outside." }));
      return;
    }
    dispatch(actions.addRiskyPlace({ id: generateId(), label: label.trim(), lat: pos.lat, lng: pos.lng, radiusM: Math.round(Number(radius)), planId: planId || null }));
    setLabel("");
    setMessage(intl.formatMessage({ id: "toolkit.places.saved", defaultMessage: "Saved. When you open the app near here, it shows your plan." }));
  }

  return (
    <section className="stack">
      <h3>{heading}</h3>
      <p className="soft">
        {intl.formatMessage({
          id: "toolkit.places.intro",
          defaultMessage: "Save places that pull you back — a bar, a dealer's street, the casino. When you open the app near one, it shows your if-then plan. Locations never leave this phone.",
        })}
      </p>
      {places.length === 0 && <Empty>{intl.formatMessage({ id: "toolkit.places.empty", defaultMessage: "No places saved." })}</Empty>}
      <ul className="list">
        {places.map((p) => (
          <li key={p.id}>
            <span><strong>{p.label}</strong> <span className="muted">{intl.formatMessage({ id: "toolkit.places.radius", defaultMessage: "({radius} m)" }, { radius: p.radiusM })}</span></span>
            <button type="button" className="linkish" onClick={() => dispatch(actions.deleteRiskyPlace({ id: p.id }))}>{intl.formatMessage({ id: "toolkit.places.delete", defaultMessage: "Delete" })}</button>
          </li>
        ))}
      </ul>
      <div className="grid2">
        <label className="field"><span>{intl.formatMessage({ id: "toolkit.places.nameLabel", defaultMessage: "Name this place" })}</span><input value={label} onChange={(e) => setLabel(e.target.value)} placeholder={intl.formatMessage({ id: "toolkit.places.namePlaceholder", defaultMessage: "The corner bar" })} /></label>
        <label className="field"><span>{intl.formatMessage({ id: "toolkit.places.radiusLabel", defaultMessage: "Radius (m)" })}</span><input type="number" min="25" max="5000" value={radius} onChange={(e) => setRadius(e.target.value)} /></label>
        {plans.length > 0 && (
          <label className="field"><span>{intl.formatMessage({ id: "toolkit.places.planLabel", defaultMessage: "Show this plan" })}</span>
            <select value={planId} onChange={(e) => setPlanId(e.target.value)}>
              <option value="">{intl.formatMessage({ id: "toolkit.places.bestPlan", defaultMessage: "My best plan" })}</option>
              {plans.map((p) => <option key={p.id} value={p.id}>{p.ifText}</option>)}
            </select>
          </label>
        )}
      </div>
      <button type="button" className="btn ghost" disabled={!label.trim() || !(Number(radius) >= 25 && Number(radius) <= 5000)} onClick={() => void addHere()}>{intl.formatMessage({ id: "toolkit.places.saveHere", defaultMessage: "Save where I am now" })}</button>
      {message && <p className="soft">{message}</p>}
    </section>
  );
}
