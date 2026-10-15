import { generateId } from "document-model";
import {
  actions,
  ASSESSMENTS,
  availableAssessments,
  scoreAssessment,
  type AssessmentDefinition,
  type AssessmentInstrument,
  type ScoreBand,
} from "document-models/quit-journey";
import { useState } from "react";
import { useIntl } from "react-intl";
import { cid, useContent } from "../../i18n/content.js";
import { formatDateTime } from "../../lib/format.js";
import type { Dispatch, TabProps } from "../../lib/types.js";
import { Empty } from "../ui.js";

/** Translated label of a score band, found by its index in the instrument's bands. */
function useBandLabel() {
  const { tc } = useContent();
  return (instrument: AssessmentInstrument, band: ScoreBand): string => {
    const def = ASSESSMENTS.find((a) => a.instrument === instrument);
    const index = def ? def.bands.indexOf(band) : -1;
    return index >= 0 ? tc(cid.band(instrument, index, "label"), band.label) : band.label;
  };
}

function AssessmentForm({ def, dispatch, onDone }: { def: AssessmentDefinition; dispatch: Dispatch; onDone: () => void }) {
  const intl = useIntl();
  const { tc } = useContent();
  const [answers, setAnswers] = useState<(number | null)[]>(() => def.items.map(() => null));
  const complete = answers.every((a) => a !== null);
  const english = intl.locale.toLowerCase().startsWith("en");

  function save() {
    const values = answers.filter((a): a is number => a !== null);
    if (values.length !== def.items.length) return;
    dispatch(actions.recordAssessment({ id: generateId(), instrument: def.instrument, takenAt: new Date().toISOString(), answers: values }));
    onDone();
  }

  return (
    <div className="panel stack">
      <h3>{tc(cid.assessment(def.instrument, "name"), def.name)}</h3>
      <p className="soft">{tc(cid.assessment(def.instrument, "purpose"), def.purpose)}</p>
      {!english && (
        <p className="muted">
          {intl.formatMessage({
            id: "toolkit.scales.englishOnly",
            defaultMessage: "This questionnaire is shown in English because a validated translation isn't available yet.",
          })}
        </p>
      )}
      {/* Validated items and answer options stay in English: translating them would invalidate the instrument. */}
      <ol className="stack" style={{ paddingLeft: 20, margin: 0 }} lang="en">
        {def.items.map((item, n) => (
          <li key={n}>
            <p style={{ marginBottom: 6 }}>{item.text}</p>
            <div className="chips" role="group" aria-label={item.text}>
              {item.options.map((o) => (
                <button key={o.value} type="button" className="chip" aria-pressed={answers[n] === o.value}
                  onClick={() => setAnswers((cur) => cur.map((a, i) => (i === n ? o.value : a)))}>{o.label}</button>
              ))}
            </div>
          </li>
        ))}
      </ol>
      <p className="muted" style={{ fontSize: ".85rem" }} lang="en">{def.citation}</p>
      <div className="row">
        <button type="button" className="btn" disabled={!complete} onClick={save}>{intl.formatMessage({ id: "toolkit.scales.save", defaultMessage: "Save my answers" })}</button>
        <button type="button" className="btn ghost" onClick={onDone}>{intl.formatMessage({ id: "toolkit.scales.cancel", defaultMessage: "Cancel" })}</button>
      </div>
    </div>
  );
}

export function Assessments({ state, snapshot, dispatch }: TabProps) {
  const intl = useIntl();
  const { tc } = useContent();
  const bandLabel = useBandLabel();
  const [open, setOpen] = useState<AssessmentInstrument | null>(null);
  const defs = availableAssessments(snapshot.profile.key);
  const history = [...(state.assessments ?? [])].sort((a, b) => b.takenAt.localeCompare(a.takenAt));
  const active = defs.find((d) => d.instrument === open);

  const scoreLine = (instrument: AssessmentInstrument, score: number, max: number, band: ScoreBand | null) =>
    band
      ? intl.formatMessage({ id: "toolkit.scales.scoreWithBand", defaultMessage: "{score}/{max} — {band}" }, { score, max, band: bandLabel(instrument, band) })
      : intl.formatMessage({ id: "toolkit.scales.score", defaultMessage: "{score}/{max}" }, { score, max });

  return (
    <section className="stack">
      <h3>{intl.formatMessage({ id: "toolkit.scales.heading", defaultMessage: "Check-ins & scales" })}</h3>
      <p className="soft">
        {intl.formatMessage({
          id: "toolkit.scales.intro",
          defaultMessage: "Short, validated questionnaires. Retaking them shows your progress over time — they're information for you, not a diagnosis.",
        })}
      </p>
      {active ? (
        <AssessmentForm def={active} dispatch={dispatch} onDone={() => setOpen(null)} />
      ) : defs.length === 0 ? (
        <Empty>{intl.formatMessage({ id: "toolkit.scales.empty", defaultMessage: "No scales for this journey yet." })}</Empty>
      ) : (
        <ul className="list">
          {defs.map((d) => {
            const latest = snapshot.toolkit.latestAssessments[d.instrument];
            const due = !latest || snapshot.now - Date.parse(latest.takenAt) > d.retakeDays * 86_400_000;
            return (
              <li key={d.instrument}>
                <div>
                  <strong>{tc(cid.assessment(d.instrument, "name"), d.name)}</strong>
                  <p className="muted">{tc(cid.assessment(d.instrument, "purpose"), d.purpose)}</p>
                  {latest && (
                    <p className={latest.redFlag ? "error" : "soft"}>
                      {latest.band
                        ? intl.formatMessage(
                            { id: "toolkit.scales.lastWithBand", defaultMessage: "Last: {score}/{max} — {band} ({date})" },
                            { score: latest.score, max: latest.maxScore, band: bandLabel(d.instrument, latest.band), date: formatDateTime(latest.takenAt) },
                          )
                        : intl.formatMessage(
                            { id: "toolkit.scales.last", defaultMessage: "Last: {score}/{max} ({date})" },
                            { score: latest.score, max: latest.maxScore, date: formatDateTime(latest.takenAt) },
                          )}
                    </p>
                  )}
                  {latest?.redFlag && (
                    <p className="error">
                      {intl.formatMessage({
                        id: "toolkit.scales.redFlag",
                        defaultMessage: "Your last answers point to severe symptoms. Contact your doctor or prescriber today, or emergency services if you feel unsafe.",
                      })}
                    </p>
                  )}
                </div>
                <button type="button" className={due ? "btn small" : "btn ghost small"} onClick={() => setOpen(d.instrument)}>
                  {latest
                    ? intl.formatMessage({ id: "toolkit.scales.retake", defaultMessage: "Retake" })
                    : intl.formatMessage({ id: "toolkit.scales.start", defaultMessage: "Start" })}
                </button>
              </li>
            );
          })}
        </ul>
      )}
      {history.length > 0 && !active && (
        <details>
          <summary className="soft" style={{ cursor: "pointer" }}>
            {intl.formatMessage({ id: "toolkit.scales.history", defaultMessage: "History ({count})" }, { count: history.length })}
          </summary>
          <ul className="list">
            {history.map((h) => {
              const result = scoreAssessment(h.instrument, h.answers);
              const def = defs.find((d) => d.instrument === h.instrument);
              const name = def ? tc(cid.assessment(def.instrument, "name"), def.name) : h.instrument;
              return (
                <li key={h.id}>
                  <span>
                    {intl.formatMessage(
                      { id: "toolkit.scales.historyEntry", defaultMessage: "{name}: {result}" },
                      { name, result: scoreLine(h.instrument, h.score, result.maxScore, result.band) },
                    )}
                    <br /><span className="muted">{formatDateTime(h.takenAt)}</span>
                  </span>
                  <button type="button" className="linkish" onClick={() => dispatch(actions.deleteAssessment({ id: h.id }))}>
                    {intl.formatMessage({ id: "toolkit.scales.delete", defaultMessage: "Delete" })}
                  </button>
                </li>
              );
            })}
          </ul>
        </details>
      )}
    </section>
  );
}
