import { actions } from "document-models/quit-journey";
import { useState } from "react";
import { useIntl } from "react-intl";
import { formatDateTime, formatNumber, inSentence } from "../lib/format.js";
import { useLabels } from "../lib/labels.js";
import type { TabProps } from "../lib/types.js";
import { CravingLogForm } from "./CravingLogForm.js";
import { Empty } from "./ui.js";

export function CravingsTab({ state, snapshot, dispatch }: TabProps) {
  const intl = useIntl();
  const L = useLabels();
  const [logging, setLogging] = useState(false);
  const { insights } = snapshot;
  const cravings = [...state.cravings].sort((a, b) => b.timestamp.localeCompare(a.timestamp));

  return (
    <div className="stack-lg">
      <section className="stack">
        <div className="spread">
          <h2>{intl.formatMessage({ id: "cravings.heading", defaultMessage: "Cravings" })}</h2>
          {insights.totalCravings > 0 && (
            <span className="soft">
              {intl.formatMessage(
                { id: "cravings.beatenSummary", defaultMessage: "{resisted} of {total} beaten ({percent}%)" },
                { resisted: insights.resistedCravings, total: insights.totalCravings, percent: formatNumber(insights.resistRate * 100) },
              )}
            </span>
          )}
        </div>
        <p className="soft">
          {intl.formatMessage(
            { id: "cravings.intro", defaultMessage: "Most cravings pass within {minutes} minutes. Logging each one teaches the app what works for you." },
            { minutes: insights.typicalCravingMinutes },
          )}
        </p>
        {logging ? (
          <div className="panel"><CravingLogForm dispatch={dispatch} now={snapshot.now} profile={snapshot.profile} reducing={snapshot.reduction !== null} plans={state.ifThenPlans ?? []} onDone={() => setLogging(false)} /></div>
        ) : (
          <button type="button" className="btn" onClick={() => setLogging(true)}>{intl.formatMessage({ id: "cravings.logButton", defaultMessage: "Log a craving" })}</button>
        )}
      </section>

      <section>
        <h3>{intl.formatMessage({ id: "cravings.history.heading", defaultMessage: "History" })}</h3>
        {cravings.length === 0 ? (
          <Empty>{intl.formatMessage({ id: "cravings.history.empty", defaultMessage: "No cravings logged yet. When one hits, tap SOS first, log it after." })}</Empty>
        ) : (
          <ul className="list">
            {cravings.map((c) => (
              <li key={c.id}>
                <div>
                  <strong>
                    {c.outcome === "RESISTED"
                      ? intl.formatMessage({ id: "cravings.outcome.beaten", defaultMessage: "Beaten" })
                      : intl.formatMessage({ id: "cravings.outcome.used", defaultMessage: "Used" })}
                  </strong>
                  <span className="soft">
                    {intl.formatMessage(
                      { id: "cravings.history.detail", defaultMessage: " — {trigger}, intensity {intensity}/5" },
                      { trigger: inSentence(L.label("trigger", c.trigger), intl.locale), intensity: c.intensity },
                    )}
                  </span>
                  {c.strategy && <p className="muted">{L.label("strategy", c.strategy)}</p>}
                  {c.note && <p className="soft">{c.note}</p>}
                  <p className="muted" style={{ fontSize: ".85rem" }}>{formatDateTime(c.timestamp)}</p>
                </div>
                <button type="button" className="linkish" onClick={() => dispatch(actions.deleteCraving({ id: c.id }))}>{intl.formatMessage({ id: "common.delete", defaultMessage: "Delete" })}</button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
