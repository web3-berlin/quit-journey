import { plansForTrigger, placesNear, type RiskyPlace } from "document-models/quit-journey";
import { useEffect, useMemo, useState } from "react";
import { useIntl } from "react-intl";
import type { TabProps } from "../lib/types.js";
import { PlanCard } from "./toolkit/IfThenPlans.js";

const CHECK_EVERY_MS = 3 * 60_000;

/** While the app is open, checks the position every few minutes and shows the plan for a nearby risky place. */
export function RiskyPlaceBanner({ state, local, host }: TabProps) {
  const intl = useIntl();
  const [near, setNear] = useState<RiskyPlace | null>(null);
  const [dismissed, setDismissed] = useState<string | null>(null);
  const places = useMemo(() => local.riskyPlaces ?? [], [local.riskyPlaces]);
  const locate = host.currentPosition;

  useEffect(() => {
    if (!locate || places.length === 0) return;
    let alive = true;
    const check = async () => {
      const pos = await locate();
      if (alive) setNear(pos ? (placesNear(places, pos).at(0) ?? null) : null);
    };
    void check();
    const id = window.setInterval(() => void check(), CHECK_EVERY_MS);
    return () => {
      alive = false;
      window.clearInterval(id);
    };
  }, [locate, places]);

  if (!near || dismissed === near.id) return null;
  const plans = state.ifThenPlans ?? [];
  const plan = plans.find((p) => p.id === near.planId) ?? plansForTrigger(plans, null).at(0) ?? null;

  return (
    <section className="panel tint-amber stack" role="alert" style={{ marginTop: 16 }}>
      <h3>{intl.formatMessage({ id: "safety.riskyPlace.near", defaultMessage: "You're near {place}" }, { place: near.label })}</h3>
      {plan ? <PlanCard plan={plan} /> : <p>{intl.formatMessage({ id: "safety.riskyPlace.noPlan", defaultMessage: "This is one of your risky places. Keep moving, call someone, or open SOS." })}</p>}
      <button type="button" className="linkish" onClick={() => setDismissed(near.id)}>{intl.formatMessage({ id: "common.gotIt", defaultMessage: "Got it" })}</button>
    </section>
  );
}
