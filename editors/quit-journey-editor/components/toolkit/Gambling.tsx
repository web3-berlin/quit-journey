import { generateId } from "document-model";
import { actions, localDateKey, protectionLinksFor, type ExclusionScheme } from "document-models/quit-journey";
import { useState, type ReactNode } from "react";
import { useIntl } from "react-intl";
import { cid, useContent } from "../../i18n/content.js";
import { formatMoney } from "../../lib/format.js";
import { useLabels } from "../../lib/labels.js";
import type { TabProps } from "../../lib/types.js";
import { Field, Select } from "../ui.js";

export function GamblingProtection({ state, snapshot, dispatch }: TabProps) {
  const intl = useIntl();
  const L = useLabels();
  const { tc } = useContent();
  const [scheme, setScheme] = useState<ExclusionScheme>("GAMSTOP");
  const [start, setStart] = useState(localDateKey(snapshot.now));
  const [end, setEnd] = useState("");
  const [loss, setLoss] = useState("");
  const statuses = new Map(snapshot.toolkit.exclusions.map((s) => [s.exclusionId, s]));
  const links = protectionLinksFor("GAMBLING").filter((l) => !/meeting|narcotics|smart/i.test(l.name));
  const losses = state.gamblingLosses ?? [];
  const total = losses.reduce((s, l) => s + l.amount, 0);
  const currency = state.plan?.currency ?? "EUR";
  const bold = (c: ReactNode[]) => <strong>{c}</strong>;
  const amountLost = intl.formatMessage({ id: "toolkit.gambling.amountLost", defaultMessage: "Amount lost" });

  return (
    <section className="stack">
      <h3>{intl.formatMessage({ id: "toolkit.gambling.heading", defaultMessage: "Protection kit" })}</h3>
      <p className="soft">
        {intl.formatMessage({
          id: "toolkit.gambling.intro",
          defaultMessage: "Make gambling hard to reach on your worst day: self-exclude, block, and let your bank stop gambling payments. Most blocks have a cooling-off delay before they can be lifted — that's the point.",
        })}
      </p>
      <ul className="list">
        {links.map((l) => (
          <li key={l.key}><span><a href={l.url} target="_blank" rel="noreferrer"><strong>{l.name}</strong></a> <span className="muted">({l.region})</span><br /><span className="soft">{tc(cid.link(l.key), l.description)}</span></span></li>
        ))}
      </ul>
      <h3>{intl.formatMessage({ id: "toolkit.gambling.exclusionsHeading", defaultMessage: "My exclusions & blocks" })}</h3>
      <ul className="list">
        {(state.exclusions ?? []).map((x) => {
          const s = statuses.get(x.id);
          const statusText =
            s?.state === "OPEN_ENDED"
              ? intl.formatMessage({ id: "toolkit.gambling.noEndDate", defaultMessage: "No end date" })
              : s?.state === "ENDED"
                ? intl.formatMessage({ id: "toolkit.gambling.ended", defaultMessage: "Ended {date}" }, { date: x.endDate ?? "" })
                : s?.daysLeft == null
                  ? intl.formatMessage({ id: "toolkit.gambling.daysLeftUnknown", defaultMessage: "? days left" })
                  : s.state === "ENDING_SOON"
                    ? intl.formatMessage(
                        { id: "toolkit.gambling.daysLeftRenew", defaultMessage: "{days, plural, one {# day left} other {# days left}} — renew it before it lapses" },
                        { days: s.daysLeft },
                      )
                    : intl.formatMessage({ id: "toolkit.gambling.daysLeft", defaultMessage: "{days, plural, one {# day left} other {# days left}}" }, { days: s.daysLeft });
          return (
            <li key={x.id}>
              <span>
                {intl.formatMessage({ id: "toolkit.gambling.exclusionSince", defaultMessage: "<b>{scheme}</b> since {date}" }, { b: bold, scheme: L.label("exclusion", x.scheme), date: x.startDate })}<br />
                <span className={s?.state === "ENDING_SOON" ? "error" : "muted"}>{statusText}</span>
              </span>
              <button type="button" className="linkish" onClick={() => dispatch(actions.deleteExclusion({ id: x.id }))}>
                {intl.formatMessage({ id: "toolkit.gambling.delete", defaultMessage: "Delete" })}
              </button>
            </li>
          );
        })}
      </ul>
      <div className="grid2">
        <Field label={intl.formatMessage({ id: "toolkit.gambling.schemeLabel", defaultMessage: "Scheme" })}>
          <Select value={scheme} options={L.options("exclusion")} onChange={(v) => v && setScheme(v)} />
        </Field>
        <Field label={intl.formatMessage({ id: "toolkit.gambling.startLabel", defaultMessage: "Start" })}>
          <input type="date" value={start} onChange={(e) => setStart(e.target.value)} />
        </Field>
        <Field label={intl.formatMessage({ id: "toolkit.gambling.endLabel", defaultMessage: "End (optional)" })}>
          <input type="date" value={end} onChange={(e) => setEnd(e.target.value)} />
        </Field>
      </div>
      <button type="button" className="btn ghost" disabled={!start || (end !== "" && end < start)} onClick={() => {
        dispatch(actions.addExclusion({ id: generateId(), scheme, startDate: start, endDate: end || null, note: null }));
        setEnd("");
      }}>{intl.formatMessage({ id: "toolkit.gambling.addExclusion", defaultMessage: "Add exclusion" })}</button>

      <h3>{intl.formatMessage({ id: "toolkit.gambling.lossesHeading", defaultMessage: "Losses" })}</h3>
      <p className="soft">
        {intl.formatMessage(
          { id: "toolkit.gambling.lossesTotal", defaultMessage: "Seeing the real number helps. Logged so far: <b>{total}</b>." },
          { b: bold, total: formatMoney(total, currency) },
        )}
      </p>
      <div className="row" style={{ flexWrap: "nowrap" }}>
        <input type="number" min="0" step="0.01" value={loss} onChange={(e) => setLoss(e.target.value)} aria-label={amountLost} placeholder={amountLost} />
        <button type="button" className="btn ghost" disabled={!(Number(loss) > 0)} onClick={() => {
          dispatch(actions.logGamblingLoss({ id: generateId(), date: localDateKey(snapshot.now), amount: Number(loss), note: null }));
          setLoss("");
        }}>{intl.formatMessage({ id: "toolkit.gambling.logLoss", defaultMessage: "Log loss" })}</button>
      </div>
      {losses.length > 0 && (
        <ul className="list">
          {[...losses].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 6).map((l) => (
            <li key={l.id}>
              <span>{intl.formatMessage({ id: "toolkit.gambling.lossEntry", defaultMessage: "{date}: {amount}" }, { date: l.date, amount: formatMoney(l.amount, currency) })}</span>
              <button type="button" className="linkish" onClick={() => dispatch(actions.deleteGamblingLoss({ id: l.id }))}>
                {intl.formatMessage({ id: "toolkit.gambling.deleteLoss", defaultMessage: "Delete" })}
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
