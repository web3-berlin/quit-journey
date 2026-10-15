import { generateId } from "document-model";
import { actions, availablePrograms, type ProgramStatus } from "document-models/quit-journey";
import { useIntl } from "react-intl";
import { cid, useContent } from "../../i18n/content.js";
import type { Dispatch, TabProps } from "../../lib/types.js";
import { Meter } from "../ui.js";

/** Today's due missions of an active program, with a done button. Shared with the Today tab. */
export function ProgramMissions({ status, dispatch, limit }: { status: ProgramStatus; dispatch: Dispatch; limit?: number }) {
  const intl = useIntl();
  const { tc } = useContent();
  const due = limit ? status.due.slice(0, limit) : status.due;
  const def = status.definition;
  const name = tc(cid.program(def.key, "name"), def.name);
  return (
    <div className="stack">
      <div className="spread">
        <strong>{name}</strong>
        <span className="muted">
          {intl.formatMessage({ id: "toolkit.programs.dayOf", defaultMessage: "Day {day} of {total}" }, { day: status.day, total: def.lengthDays })}
        </span>
      </div>
      <Meter value={status.completed / Math.max(1, status.total)} label={intl.formatMessage({ id: "toolkit.programs.progress", defaultMessage: "{program} progress" }, { program: name })} />
      {due.length === 0 ? (
        <p className="soft">
          {status.finished
            ? intl.formatMessage({ id: "toolkit.programs.complete", defaultMessage: "Program complete. Well done." })
            : intl.formatMessage({ id: "toolkit.programs.caughtUp", defaultMessage: "All caught up — the next mission unlocks tomorrow." })}
        </p>
      ) : (
        due.map((m) => (
          <div key={m.key} className="panel stack">
            <p><strong>{tc(cid.mission(def.key, m.key, "title"), m.title)}</strong></p>
            <p className="soft">{tc(cid.mission(def.key, m.key, "body"), m.body)}</p>
            <button type="button" className="btn small" onClick={() => dispatch(actions.completeMission({ programId: status.enrollmentId, missionKey: m.key }))}>
              {intl.formatMessage({ id: "toolkit.programs.done", defaultMessage: "Done" })}
            </button>
          </div>
        ))
      )}
    </div>
  );
}

export function Programs({ state, snapshot, dispatch }: TabProps) {
  const intl = useIntl();
  const { tc } = useContent();
  const active = snapshot.toolkit.programs;
  const activeKeys = new Set(active.map((p) => p.definition.key));
  const offers = availablePrograms(snapshot.profile.key).filter((p) => !activeKeys.has(p.key));
  const finished = (state.programs ?? []).filter((p) => p.endedAt).length;

  return (
    <section className="stack">
      <h3>{intl.formatMessage({ id: "toolkit.programs.heading", defaultMessage: "Programs" })}</h3>
      {active.map((status) => (
        <div key={status.enrollmentId} className="stack">
          <ProgramMissions status={status} dispatch={dispatch} />
          <button type="button" className="linkish" onClick={() => dispatch(actions.endProgram({ programId: status.enrollmentId, endedAt: new Date().toISOString() }))}>
            {status.finished
              ? intl.formatMessage({ id: "toolkit.programs.close", defaultMessage: "Close program" })
              : intl.formatMessage({ id: "toolkit.programs.stop", defaultMessage: "Stop this program" })}
          </button>
        </div>
      ))}
      {offers.map((p) => (
        <div key={p.key} className="panel stack">
          <div className="spread">
            <strong>{tc(cid.program(p.key, "name"), p.name)}</strong>
            <span className="muted">{intl.formatMessage({ id: "toolkit.programs.length", defaultMessage: "{days, plural, one {# day} other {# days}}" }, { days: p.lengthDays })}</span>
          </div>
          <p className="soft">{tc(cid.program(p.key, "summary"), p.summary)}</p>
          <p className="muted" style={{ fontSize: ".85rem" }}>{tc(cid.program(p.key, "evidence"), p.evidence)}</p>
          <button type="button" className="btn ghost small" onClick={() => dispatch(actions.startProgram({ id: generateId(), program: p.key, startedAt: new Date().toISOString() }))}>
            {intl.formatMessage({ id: "toolkit.programs.start", defaultMessage: "Start" })}
          </button>
        </div>
      ))}
      {finished > 0 && (
        <p className="muted">
          {intl.formatMessage(
            { id: "toolkit.programs.finishedBefore", defaultMessage: "{count, plural, one {# program} other {# programs}} completed or stopped before." },
            { count: finished },
          )}
        </p>
      )}
    </section>
  );
}
