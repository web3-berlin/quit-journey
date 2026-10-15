import { generateId } from "document-model";
import { actions, assessmentFor } from "document-models/quit-journey";
import type { TabProps } from "../../lib/types.js";
import { SafetyTimer } from "../SafetyTimer.js";
import { Meter } from "../ui.js";
import { ProgramMissions } from "./Programs.js";

/** Toolkit highlights for the Today tab: only what needs attention now. */
export function TodayCards(props: TabProps) {
  const { state, local, snapshot, dispatch } = props;
  const { toolkit, profile } = snapshot;
  const activeCheck = (local.safetyChecks ?? []).some((c) => c.outcome === "ACTIVE");
  const kitWarnings = toolkit.naloxone.filter((k) => k.state !== "OK");
  const endingExclusions = toolkit.exclusions.filter((x) => x.state === "ENDING_SOON");
  const redFlags = Object.values(toolkit.latestAssessments).filter((a) => a.redFlag && snapshot.now - Date.parse(a.takenAt) < 2 * 86_400_000);
  const program = toolkit.programs.find((p) => p.due.length > 0) ?? null;
  const ladder = profile.key === "STIMULANTS" ? toolkit.ladder : null;

  return (
    <>
      {activeCheck && <SafetyTimer {...props} />}

      {redFlags.map((r) => (
        <section key={r.instrument} className="panel tint-ember stack" role="alert">
          <h3>⚠️ Severe symptoms on your last {assessmentFor(r.instrument).name}</h3>
          <p>Please contact your doctor or prescriber today. If you have a seizure, confusion, hallucinations or chest pain, call emergency services now.</p>
        </section>
      ))}

      {(kitWarnings.length > 0 || endingExclusions.length > 0) && (
        <section className="panel tint-amber stack">
          {kitWarnings.length > 0 && <p>🩹 {kitWarnings.length === 1 ? "A naloxone kit needs" : `${kitWarnings.length} naloxone kits need`} replacing or renewing soon — see Toolkit.</p>}
          {endingExclusions.map((x) => <p key={x.exclusionId}>🛡️ A gambling block ends in {x.daysLeft} days. Renew it before it lapses.</p>)}
        </section>
      )}

      {toolkit.medication.map((m) => {
        const aid = state.aids.find((a) => a.id === m.aidId);
        if (!aid) return null;
        return (
          <section key={m.aidId} className="panel stack">
            <div className="spread"><h3>Today's dose</h3><span className="muted">day {m.day}</span></div>
            <p><strong>{m.dose}</strong>, {m.timesPerDay}× a day — {m.takenToday} of {m.timesPerDay} logged.</p>
            {m.takenToday < m.timesPerDay && (
              <button type="button" className="btn small" onClick={() => dispatch(actions.logAidUse({ id: generateId(), aidId: aid.id, timestamp: new Date().toISOString(), note: null, beforeDrinking: null }))}>Log a dose</button>
            )}
          </section>
        );
      })}

      {program && (
        <section className="panel stack">
          <h3>Today's mission</h3>
          <ProgramMissions status={program} dispatch={dispatch} limit={1} />
        </section>
      )}

      {ladder && (
        <section className="panel tint-leaf stack">
          <div className="spread"><h3>Reward ladder</h3><span className="soft">{ladder.totalPoints} points</span></div>
          <p>
            {ladder.recovering
              ? `Rebuilding: ${ladder.restoreInDays} more clean day${ladder.restoreInDays === 1 ? "" : "s"} restores your old level.`
              : `Day ${ladder.streakDays} of your streak. Tomorrow is worth ${ladder.nextPoints} points.`}
          </p>
          <Meter value={Math.min(1, ladder.nextPoints / 100)} tone="amber" label="Ladder level" />
          <p className="muted">Each clean day is worth more than the last; a slip resets the value, and three good days bring it back. Ask a supporter to turn points into real rewards.</p>
        </section>
      )}
    </>
  );
}
