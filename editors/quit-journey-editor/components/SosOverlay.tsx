import { useEffect, useState } from "react";
import { useIntl, type IntlShape } from "react-intl";
import { formatMoney, inSentence, pad2 } from "../lib/format.js";
import { useLabels } from "../lib/labels.js";
import type { TabProps } from "../lib/types.js";
import { plansForTrigger } from "document-models/quit-journey";
import { CravingLogForm } from "./CravingLogForm.js";
import { PlanCard } from "./toolkit/IfThenPlans.js";
import { SafetyTimer } from "./SafetyTimer.js";
import { UrgeSurfing } from "./UrgeSurfing.js";
import { SafetyNotes } from "./SafetyNotes.js";

/** 4-7-8 breathing: inhale 4s, hold 7s, exhale 8s. */
const PHASES = [
  { key: "in", seconds: 4, scale: 1.25 },
  { key: "hold", seconds: 7, scale: 1.25 },
  { key: "out", seconds: 8, scale: 0.85 },
] as const;
const CYCLE = PHASES.reduce((s, p) => s + p.seconds, 0);

function phaseName(intl: IntlShape, key: (typeof PHASES)[number]["key"]): string {
  switch (key) {
    case "in": return intl.formatMessage({ id: "sos.phase.in", defaultMessage: "Breathe in" });
    case "hold": return intl.formatMessage({ id: "sos.phase.hold", defaultMessage: "Hold" });
    case "out": return intl.formatMessage({ id: "sos.phase.out", defaultMessage: "Breathe out" });
  }
}

export function SosOverlay(props: TabProps & { onClose: () => void }) {
  const { state, snapshot, dispatch, onClose } = props;
  const intl = useIntl();
  const L = useLabels();
  const [mode, setMode] = useState<"breathe" | "surf" | "safety">("breathe");
  const [startedAt] = useState(() => Date.now());
  const [tick, setTick] = useState(() => Date.now());
  const [logging, setLogging] = useState(false);
  const target = snapshot.insights.typicalCravingMinutes * 60;

  useEffect(() => {
    const id = window.setInterval(() => setTick(Date.now()), 250);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      window.clearInterval(id);
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  const elapsed = Math.floor((tick - startedAt) / 1000);
  const left = Math.max(0, target - elapsed);
  let t = elapsed % CYCLE;
  let phase: (typeof PHASES)[number] = PHASES[0];
  for (const p of PHASES) {
    if (t < p.seconds) { phase = p; break; }
    t -= p.seconds;
  }
  const best = snapshot.insights.bestStrategy;
  const why = state.motivations.length ? state.motivations[Math.floor(elapsed / 12) % state.motivations.length] : null;
  const money = snapshot.money;
  const plan = plansForTrigger(state.ifThenPlans ?? [], null).at(0) ?? null;
  const offerSafety = snapshot.profile.overdoseRiskAfterBreak || snapshot.profile.key === "STIMULANTS" || snapshot.profile.key === "KRATOM";

  return (
    <div className="sos" role="dialog" aria-modal="true" aria-label={intl.formatMessage({ id: "sos.dialogLabel", defaultMessage: "Craving SOS" })}>
      <div className="sheet stack">
        <div className="spread">
          <h2>{intl.formatMessage({ id: "sos.heading", defaultMessage: "Ride it out" })}</h2>
          <button type="button" className="linkish" onClick={onClose}>{intl.formatMessage({ id: "common.close", defaultMessage: "Close" })}</button>
        </div>
        {mode === "surf" && !logging ? (
          <UrgeSurfing dispatch={dispatch} onDone={onClose} />
        ) : mode === "safety" && !logging ? (
          <>
            <SafetyTimer {...props} />
            <button type="button" className="linkish" onClick={() => setMode("breathe")}>{intl.formatMessage({ id: "sos.backToBreathing", defaultMessage: "Back to breathing" })}</button>
          </>
        ) : logging ? (
          <CravingLogForm dispatch={dispatch} now={Date.now()} profile={snapshot.profile} reducing={snapshot.reduction !== null} plans={state.ifThenPlans ?? []} initialStrategy="BREATHING" initialDurationMinutes={Math.max(1, Math.round(elapsed / 60))} onDone={onClose} />
        ) : (
          <>
            <div className="breath-stage"><div className="breath" style={{ transform: `scale(${phase.scale})`, transitionDuration: `${phase.seconds}s` }} aria-live="polite">
              {phaseName(intl, phase.key)}
              <br />
              <span className="muted" style={{ fontSize: ".9rem" }}>{intl.formatMessage({ id: "sos.phase.secondsLeft", defaultMessage: "{seconds}s" }, { seconds: phase.seconds - t })}</span>
            </div></div>
            <p style={{ textAlign: "center", fontFamily: "var(--display)", fontSize: "1.4rem", fontWeight: 600 }}>
              {left > 0
                ? intl.formatMessage({ id: "sos.countdown", defaultMessage: "{time} — it's already fading" }, { time: `${Math.floor(left / 60)}:${pad2(left % 60)}` })
                : intl.formatMessage({ id: "sos.madeIt", defaultMessage: "You made it through. That's a win." })}
            </p>
            {plan && <div className="panel tint-amber"><p className="soft">{intl.formatMessage({ id: "sos.yourPlan", defaultMessage: "Your plan:" })}</p><PlanCard plan={plan} /></div>}
            {why && <blockquote className="panel tint-leaf" style={{ margin: 0 }}><p className="soft">{intl.formatMessage({ id: "sos.rememberWhy", defaultMessage: "Remember why:" })}</p><p style={{ fontSize: "1.15rem" }}>{why.text}</p></blockquote>}
            {best && (
              <p>
                {intl.formatMessage(
                  { id: "sos.bestMove", defaultMessage: "Your best move so far: <b>{strategy}</b>." },
                  { strategy: inSentence(L.label("strategy", best), intl.locale), b: (c) => <strong>{c}</strong> },
                )}
              </p>
            )}
            {money && money.moneySaved > 0 && (
              <p className="soft">
                {intl.formatMessage(
                  { id: "sos.moneyKept", defaultMessage: "You've kept {amount} so far. Don't hand it back." },
                  { amount: formatMoney(money.moneySaved, money.currency) },
                )}
              </p>
            )}
            {(state.supportContacts.length > 0 || state.quitlinePhone) && (
              <div className="row">
                {state.supportContacts.filter((c) => c.phone).map((c) => (
                  <a key={c.id} className="btn ghost small" href={`tel:${c.phone}`}>{intl.formatMessage({ id: "sos.callContact", defaultMessage: "Call {name}" }, { name: c.name })}</a>
                ))}
                {state.quitlinePhone && <a className="btn ghost small" href={`tel:${state.quitlinePhone}`}>{intl.formatMessage({ id: "sos.callHelpline", defaultMessage: "Call the helpline" })}</a>}
              </div>
            )}
            {snapshot.profile.overdoseRiskAfterBreak && <SafetyNotes notes={snapshot.profile.safety.slice(0, 2)} />}
            <div className="row">
              <button type="button" className="btn" onClick={() => setLogging(true)}>
                {left > 0
                  ? intl.formatMessage({ id: "sos.logCraving", defaultMessage: "Log this craving" })
                  : intl.formatMessage({ id: "sos.logWin", defaultMessage: "Log my win" })}
              </button>
              <button type="button" className="btn ghost" onClick={() => setMode("surf")}>{intl.formatMessage({ id: "sos.tryUrgeSurfing", defaultMessage: "Try urge surfing" })}</button>
              {offerSafety && <button type="button" className="btn ghost" onClick={() => setMode("safety")}>{intl.formatMessage({ id: "sos.checkOnMe", defaultMessage: "Check on me" })}</button>}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
