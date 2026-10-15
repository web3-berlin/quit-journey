import { generateId } from "document-model";
import { actions, type DrugTestResult, type DrugTestType, type HarmReductionAction, type NaloxoneKind } from "document-models/quit-journey";
import { useState, type ReactNode } from "react";
import { useIntl } from "react-intl";
import { cid, useContent } from "../../i18n/content.js";
import { formatDateTime } from "../../lib/format.js";
import { useLabels } from "../../lib/labels.js";
import type { TabProps } from "../../lib/types.js";
import { Chips, Empty, Field, Select } from "../ui.js";

export function Naloxone({ state, snapshot, dispatch }: TabProps) {
  const intl = useIntl();
  const L = useLabels();
  const [kind, setKind] = useState<NaloxoneKind>("NASAL_SPRAY_4MG");
  const [location, setLocation] = useState("");
  const [expires, setExpires] = useState("");
  const kits = state.naloxoneKits ?? [];
  const status = new Map(snapshot.toolkit.naloxone.map((s) => [s.kitId, s]));

  return (
    <section className="stack">
      <h3>{intl.formatMessage({ id: "toolkit.naloxone.heading", defaultMessage: "Naloxone" })}</h3>
      <p className="soft">
        {intl.formatMessage({
          id: "toolkit.naloxone.intro",
          defaultMessage: "Naloxone (Narcan) reverses an opioid overdose. Keep it where you and the people around you can find it, and replace it when it expires or after use.",
        })}
      </p>
      {kits.length === 0 && (
        <Empty>{intl.formatMessage({ id: "toolkit.naloxone.empty", defaultMessage: "No naloxone logged. Pharmacies and harm-reduction services often give it out free." })}</Empty>
      )}
      <ul className="list">
        {kits.map((k) => {
          const s = status.get(k.id);
          const statusText =
            s?.state === "USED"
              ? intl.formatMessage({ id: "toolkit.naloxone.used", defaultMessage: "Used — replace it" })
              : s?.state === "EXPIRED"
                ? intl.formatMessage({ id: "toolkit.naloxone.expired", defaultMessage: "Expired — replace it" })
                : k.expiresOn
                  ? s?.state === "EXPIRING"
                    ? intl.formatMessage({ id: "toolkit.naloxone.expiresSoon", defaultMessage: "Expires {date} (soon)" }, { date: k.expiresOn })
                    : intl.formatMessage({ id: "toolkit.naloxone.expires", defaultMessage: "Expires {date}" }, { date: k.expiresOn })
                  : intl.formatMessage({ id: "toolkit.naloxone.noExpiry", defaultMessage: "No expiry date logged" });
          return (
            <li key={k.id}>
              <span>
                <strong>{L.label("naloxone", k.kind)}</strong>{k.location && <span className="soft"> — {k.location}</span>}<br />
                <span className={s?.state === "EXPIRED" || s?.state === "USED" ? "error" : "muted"}>{statusText}</span>
              </span>
              <span className="row" style={{ flexWrap: "nowrap" }}>
                {!k.usedAt && (
                  <button type="button" className="linkish" onClick={() => dispatch(actions.markNaloxoneUsed({ id: k.id, usedAt: new Date().toISOString() }))}>
                    {intl.formatMessage({ id: "toolkit.naloxone.markUsed", defaultMessage: "Used it" })}
                  </button>
                )}
                <button type="button" className="linkish" onClick={() => dispatch(actions.removeNaloxoneKit({ id: k.id }))}>
                  {intl.formatMessage({ id: "toolkit.naloxone.remove", defaultMessage: "Remove" })}
                </button>
              </span>
            </li>
          );
        })}
      </ul>
      <div className="grid2">
        <Field label={intl.formatMessage({ id: "toolkit.naloxone.typeLabel", defaultMessage: "Type" })}>
          <Select value={kind} options={L.options("naloxone")} onChange={(v) => v && setKind(v)} />
        </Field>
        <Field label={intl.formatMessage({ id: "toolkit.naloxone.locationLabel", defaultMessage: "Where is it?" })}>
          <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder={intl.formatMessage({ id: "toolkit.naloxone.locationPlaceholder", defaultMessage: "Bag, kitchen drawer…" })} />
        </Field>
        <Field label={intl.formatMessage({ id: "toolkit.naloxone.expiryLabel", defaultMessage: "Expiry date" })}>
          <input type="date" value={expires} onChange={(e) => setExpires(e.target.value)} />
        </Field>
      </div>
      <button type="button" className="btn ghost" onClick={() => {
        dispatch(actions.addNaloxoneKit({ id: generateId(), kind, location: location.trim() || null, expiresOn: expires || null, addedAt: new Date().toISOString() }));
        setLocation("");
        setExpires("");
      }}>{intl.formatMessage({ id: "toolkit.naloxone.add", defaultMessage: "Add naloxone kit" })}</button>
    </section>
  );
}

export function DrugChecks({ state, snapshot, dispatch }: TabProps) {
  const intl = useIntl();
  const L = useLabels();
  const { tc } = useContent();
  const [testType, setTestType] = useState<DrugTestType>("FENTANYL_STRIP");
  const [result, setResult] = useState<DrugTestResult | "">("");
  const [expected, setExpected] = useState("");
  const [taken, setTaken] = useState<HarmReductionAction[]>([]);
  const checks = [...(state.drugChecks ?? [])].sort((a, b) => b.checkedAt.localeCompare(a.checkedAt));
  const alerts = snapshot.toolkit.alerts;

  return (
    <section className="stack">
      <h3>{intl.formatMessage({ id: "toolkit.drugChecks.heading", defaultMessage: "Drug checking" })}</h3>
      <p className="soft">
        {intl.formatMessage({
          id: "toolkit.drugChecks.intro",
          defaultMessage: "Testing tells you more, not everything: a negative strip doesn't mean a drug is safe. Log what you found and what you did — it helps you see your own safety habits.",
        })}
      </p>
      {alerts.map((a) => (
        <details key={a.key} className="panel">
          <summary style={{ cursor: "pointer" }}>
            <strong>{tc(cid.alert(a.key, "title"), a.title)}</strong>{" "}
            <span className="muted">{intl.formatMessage({ id: "toolkit.drugChecks.alertChecked", defaultMessage: "(checked {date})" }, { date: a.reviewedOn })}</span>
          </summary>
          <p style={{ marginTop: 8 }}>{tc(cid.alert(a.key, "body"), a.body)}</p>
          <p className="muted" style={{ fontSize: ".85rem" }}>{intl.formatMessage({ id: "toolkit.drugChecks.alertSource", defaultMessage: "Source: {source}" }, { source: a.source })}</p>
        </details>
      ))}
      <div className="grid2">
        <Field label={intl.formatMessage({ id: "toolkit.drugChecks.testLabel", defaultMessage: "Test" })}>
          <Select value={testType} options={L.options("drugTest")} onChange={(v) => v && setTestType(v)} />
        </Field>
        <Field label={intl.formatMessage({ id: "toolkit.drugChecks.resultLabel", defaultMessage: "Result" })}>
          <Select value={result} options={L.options("drugResult")} onChange={setResult} allowEmpty={intl.formatMessage({ id: "toolkit.drugChecks.chooseResult", defaultMessage: "Choose result" })} />
        </Field>
        <Field label={intl.formatMessage({ id: "toolkit.drugChecks.expectedLabel", defaultMessage: "What was it supposed to be?" })}>
          <input value={expected} onChange={(e) => setExpected(e.target.value)} placeholder={intl.formatMessage({ id: "toolkit.drugChecks.optional", defaultMessage: "optional" })} />
        </Field>
      </div>
      {result === "POSITIVE" && (
        <p className="error">
          {intl.formatMessage({
            id: "toolkit.drugChecks.positiveWarning",
            defaultMessage: "Detected. The safest choice is not to use it. If you do: use much less, go slow, never alone, naloxone ready.",
          })}
        </p>
      )}
      <div>
        <p className="soft" style={{ marginBottom: 6 }}>{intl.formatMessage({ id: "toolkit.drugChecks.whatDidYouDo", defaultMessage: "What did you do?" })}</p>
        <Chips label={intl.formatMessage({ id: "toolkit.drugChecks.actionsLabel", defaultMessage: "Actions taken" })} options={L.options("harmAction")} selected={taken}
          onToggle={(k) => setTaken((cur) => (cur.includes(k) ? cur.filter((x) => x !== k) : [...cur, k]))} />
      </div>
      <button type="button" className="btn ghost" disabled={!result} onClick={() => {
        if (!result) return;
        dispatch(actions.logDrugCheck({ id: generateId(), checkedAt: new Date().toISOString(), expectedSubstance: expected.trim() || null, testType, result, actions: taken, note: null }));
        setResult("");
        setExpected("");
        setTaken([]);
      }}>{intl.formatMessage({ id: "toolkit.drugChecks.log", defaultMessage: "Log check" })}</button>
      {checks.length > 0 && (
        <ul className="list">
          {checks.slice(0, 10).map((c) => (
            <li key={c.id}>
              <span>
                {intl.formatMessage(
                  { id: "toolkit.drugChecks.entry", defaultMessage: "{test}: <b>{result}</b>" },
                  { b: (chunks: ReactNode[]) => <strong>{chunks}</strong>, test: L.label("drugTest", c.testType), result: L.label("drugResult", c.result) },
                )}
                {c.expectedSubstance && <span className="soft"> ({c.expectedSubstance})</span>}<br />
                <span className="muted">
                  {intl.formatMessage(
                    { id: "toolkit.drugChecks.entryMeta", defaultMessage: "{actions}, {date}" },
                    {
                      actions: c.actions.length > 0
                        ? intl.formatList(c.actions.map((a) => L.label("harmAction", a)), { type: "unit" })
                        : intl.formatMessage({ id: "toolkit.drugChecks.noAction", defaultMessage: "No action logged" }),
                      date: formatDateTime(c.checkedAt),
                    },
                  )}
                </span>
              </span>
              <button type="button" className="linkish" onClick={() => dispatch(actions.deleteDrugCheck({ id: c.id }))}>
                {intl.formatMessage({ id: "toolkit.drugChecks.delete", defaultMessage: "Delete" })}
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
