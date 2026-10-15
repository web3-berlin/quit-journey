import { generateId } from "document-model";
import { actions, availablePrograms, type ProgramStatus } from "document-models/quit-journey";
import type { Dispatch, TabProps } from "../../lib/types.js";
import { Meter } from "../ui.js";

/** Today's due missions of an active program, with a done button. Shared with the Today tab. */
export function ProgramMissions({ status, dispatch, limit }: { status: ProgramStatus; dispatch: Dispatch; limit?: number }) {
  const due = limit ? status.due.slice(0, limit) : status.due;
  return (
    <div className="stack">
      <div className="spread">
        <strong>{status.definition.name}</strong>
        <span className="muted">Day {status.day} of {status.definition.lengthDays}</span>
      </div>
      <Meter value={status.completed / Math.max(1, status.total)} label={`${status.definition.name} progress`} />
      {due.length === 0 ? (
        <p className="soft">{status.finished ? "Program complete. Well done." : "All caught up — the next mission unlocks tomorrow."}</p>
      ) : (
        due.map((m) => (
          <div key={m.key} className="panel stack">
            <p><strong>{m.title}</strong></p>
            <p className="soft">{m.body}</p>
            <button type="button" className="btn small" onClick={() => dispatch(actions.completeMission({ programId: status.enrollmentId, missionKey: m.key }))}>Done</button>
          </div>
        ))
      )}
    </div>
  );
}

export function Programs({ state, snapshot, dispatch }: TabProps) {
  const active = snapshot.toolkit.programs;
  const activeKeys = new Set(active.map((p) => p.definition.key));
  const offers = availablePrograms(snapshot.profile.key).filter((p) => !activeKeys.has(p.key));
  const finished = (state.programs ?? []).filter((p) => p.endedAt).length;

  return (
    <section className="stack">
      <h3>Programs</h3>
      {active.map((status) => (
        <div key={status.enrollmentId} className="stack">
          <ProgramMissions status={status} dispatch={dispatch} />
          <button type="button" className="linkish" onClick={() => dispatch(actions.endProgram({ programId: status.enrollmentId, endedAt: new Date().toISOString() }))}>
            {status.finished ? "Close program" : "Stop this program"}
          </button>
        </div>
      ))}
      {offers.map((p) => (
        <div key={p.key} className="panel stack">
          <div className="spread"><strong>{p.name}</strong><span className="muted">{p.lengthDays} days</span></div>
          <p className="soft">{p.summary}</p>
          <p className="muted" style={{ fontSize: ".85rem" }}>{p.evidence}</p>
          <button type="button" className="btn ghost small" onClick={() => dispatch(actions.startProgram({ id: generateId(), program: p.key, startedAt: new Date().toISOString() }))}>Start</button>
        </div>
      ))}
      {finished > 0 && <p className="muted">{finished} program{finished === 1 ? "" : "s"} completed or stopped before.</p>}
    </section>
  );
}
