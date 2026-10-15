import { generateId } from "document-model";
import { actions, assessmentFor } from "document-models/quit-journey";
import { useIntl } from "react-intl";
import { cid, useContent } from "../../i18n/content.js";
import type { TabProps } from "../../lib/types.js";
import { SafetyTimer } from "../SafetyTimer.js";
import { Meter } from "../ui.js";
import { ProgramMissions } from "./Programs.js";

/** Toolkit highlights for the Today tab: only what needs attention now. */
export function TodayCards(props: TabProps) {
  const { state, local, snapshot, dispatch } = props;
  const intl = useIntl();
  const { tc } = useContent();
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
          <h3>
            {intl.formatMessage(
              { id: "toolkit.today.redFlag.heading", defaultMessage: "⚠️ Severe symptoms on your last {assessment}" },
              { assessment: tc(cid.assessment(r.instrument, "name"), assessmentFor(r.instrument).name) },
            )}
          </h3>
          <p>{intl.formatMessage({ id: "toolkit.today.redFlag.body", defaultMessage: "Please contact your doctor or prescriber today. If you have a seizure, confusion, hallucinations or chest pain, call emergency services now." })}</p>
        </section>
      ))}

      {(kitWarnings.length > 0 || endingExclusions.length > 0) && (
        <section className="panel tint-amber stack">
          {kitWarnings.length > 0 && (
            <p>
              {intl.formatMessage(
                { id: "toolkit.today.naloxoneWarning", defaultMessage: "🩹 {count, plural, one {A naloxone kit needs} other {# naloxone kits need}} replacing or renewing soon — see Toolkit." },
                { count: kitWarnings.length },
              )}
            </p>
          )}
          {endingExclusions.map((x) => (
            <p key={x.exclusionId}>
              {intl.formatMessage(
                { id: "toolkit.today.exclusionEnding", defaultMessage: "🛡️ A gambling block ends in {days, plural, one {# day} other {# days}}. Renew it before it lapses." },
                { days: x.daysLeft },
              )}
            </p>
          ))}
        </section>
      )}

      {toolkit.medication.map((m) => {
        const aid = state.aids.find((a) => a.id === m.aidId);
        if (!aid) return null;
        return (
          <section key={m.aidId} className="panel stack">
            <div className="spread">
              <h3>{intl.formatMessage({ id: "toolkit.today.dose.heading", defaultMessage: "Today's dose" })}</h3>
              <span className="muted">{intl.formatMessage({ id: "toolkit.today.dose.day", defaultMessage: "day {day}" }, { day: m.day })}</span>
            </div>
            <p>
              {intl.formatMessage(
                { id: "toolkit.today.dose.summary", defaultMessage: "<b>{dose}</b>, {times}× a day — {taken} of {times} logged." },
                { dose: m.dose, times: m.timesPerDay, taken: m.takenToday, b: (c) => <strong>{c}</strong> },
              )}
            </p>
            {m.takenToday < m.timesPerDay && (
              <button type="button" className="btn small" onClick={() => dispatch(actions.logAidUse({ id: generateId(), aidId: aid.id, timestamp: new Date().toISOString(), note: null, beforeDrinking: null }))}>
                {intl.formatMessage({ id: "toolkit.today.dose.log", defaultMessage: "Log a dose" })}
              </button>
            )}
          </section>
        );
      })}

      {program && (
        <section className="panel stack">
          <h3>{intl.formatMessage({ id: "toolkit.today.mission.heading", defaultMessage: "Today's mission" })}</h3>
          <ProgramMissions status={program} dispatch={dispatch} limit={1} />
        </section>
      )}

      {ladder && (
        <section className="panel tint-leaf stack">
          <div className="spread">
            <h3>{intl.formatMessage({ id: "toolkit.today.ladder.heading", defaultMessage: "Reward ladder" })}</h3>
            <span className="soft">{intl.formatMessage({ id: "toolkit.today.ladder.points", defaultMessage: "{points, plural, one {# point} other {# points}}" }, { points: ladder.totalPoints })}</span>
          </div>
          <p>
            {ladder.recovering
              ? intl.formatMessage(
                { id: "toolkit.today.ladder.rebuilding", defaultMessage: "Rebuilding: {days, plural, one {# more day without using} other {# more days without using}} restores your old level." },
                { days: ladder.restoreInDays },
              )
              : intl.formatMessage(
                { id: "toolkit.today.ladder.streak", defaultMessage: "Day {day} of your streak. Tomorrow is worth {points, plural, one {# point} other {# points}}." },
                { day: ladder.streakDays, points: ladder.nextPoints },
              )}
          </p>
          <Meter value={Math.min(1, ladder.nextPoints / 100)} tone="amber" label={intl.formatMessage({ id: "toolkit.today.ladder.meter", defaultMessage: "Ladder level" })} />
          <p className="muted">{intl.formatMessage({ id: "toolkit.today.ladder.explainer", defaultMessage: "Each day without using is worth more than the last; a slip resets the value, and three good days bring it back. Ask a supporter to turn points into real rewards." })}</p>
        </section>
      )}
    </>
  );
}
