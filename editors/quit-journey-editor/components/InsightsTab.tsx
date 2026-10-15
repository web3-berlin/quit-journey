import { formatNumber } from "../lib/format.js";
import { STRATEGY_LABELS, SYMPTOM_LABELS, TRIGGER_LABELS, WEEKDAYS } from "../lib/labels.js";
import type { TabProps } from "../lib/types.js";
import { Empty } from "./ui.js";

/** Single-hue sequential ramp (leaf) for the craving heatmap; 0 stays on the surface tone. */
const HEAT = ["#e9f1f4", "#c4e6d2", "#8fcfa9", "#55b17e", "#2f9e62", "#1d6b42"];

export function InsightsTab({ state, snapshot }: TabProps) {
  const ins = snapshot.insights;
  if (ins.totalCravings === 0 && state.checkIns.length === 0) {
    return <Empty>Insights appear once you've logged a few cravings or check-ins. Each one makes the patterns sharper.</Empty>;
  }
  const maxHeat = Math.max(1, ...ins.heatmap.flat());
  const maxWeek = Math.max(1, ...ins.weeklyTrend.map((w) => w.cravings));

  return (
    <div className="stack-lg">
      <h2>What your data says</h2>

      {ins.strategies.length > 0 && (
        <section className="stack">
          <h3>What works for you</h3>
          <p className="soft">Share of cravings beaten with each strategy.</p>
          {ins.strategies.map((s) => (
            <div key={s.strategy} className="hbar" title={`${s.resisted} of ${s.uses} beaten`}>
              <span>{STRATEGY_LABELS[s.strategy]}</span>
              <div className="track"><i style={{ width: `${s.rate * 100}%` }} /></div>
              <span className="soft" style={{ textAlign: "right" }}>{formatNumber(s.rate * 100)}%</span>
            </div>
          ))}
        </section>
      )}

      {ins.triggers.length > 0 && (
        <section className="stack">
          <h3>Your triggers</h3>
          <ul className="list">
            {ins.triggers.map((t) => (
              <li key={t.trigger}>
                <span>{TRIGGER_LABELS[t.trigger]}</span>
                <span className="soft">{t.count} {t.count === 1 ? "craving" : "cravings"}, avg intensity {formatNumber(t.avgIntensity, 1)}{t.smoked ? `, ${t.smoked} slipped` : ""}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {ins.totalCravings > 0 && (
        <section className="stack">
          <h3>When cravings hit</h3>
          <p className="soft">
            {ins.riskWindow
              ? `Your riskiest window is ${WEEKDAYS[ins.riskWindow.weekday]} ${ins.riskWindow.startHour}:00–${ins.riskWindow.startHour + 2}:00.`
              : "Not enough cravings yet to spot a pattern."}
          </p>
          <div className="heat" role="img" aria-label="Cravings by weekday and hour">
            <span />
            {Array.from({ length: 24 }, (_, h) => <span key={h} style={{ textAlign: "center" }}>{h % 6 === 0 ? h : ""}</span>)}
            {ins.heatmap.map((row, d) => [
              <span key={`l${d}`}>{WEEKDAYS[d]}</span>,
              ...row.map((n, h) => (
                <span key={`${d}-${h}`} className="cell" title={`${WEEKDAYS[d]} ${h}:00 — ${n} cravings`}
                  style={{ background: HEAT[n === 0 ? 0 : Math.min(HEAT.length - 1, Math.ceil((n / maxHeat) * (HEAT.length - 1)))] }} />
              )),
            ])}
          </div>
        </section>
      )}

      {ins.totalCravings > 0 && (
        <section className="stack">
          <h3>Cravings per week</h3>
          <p className="soft">Last {ins.weeklyTrend.length} weeks. Fewer and weaker over time is the goal.</p>
          <div className="bars">
            {ins.weeklyTrend.map((w) => (
              <div key={w.weekStart} title={`Week of ${new Date(w.weekStart).toLocaleDateString()}: ${w.cravings} cravings, avg intensity ${formatNumber(w.avgIntensity, 1)}`}>
                <i style={{ height: `${(w.cravings / maxWeek) * 100}%` }} />
              </div>
            ))}
          </div>
        </section>
      )}

      {(ins.weightChangeKg !== null || ins.frequentSymptoms.length > 0) && (
        <section className="stack">
          <h3>Body check</h3>
          {ins.weightChangeKg !== null && (
            <p>
              Weight {ins.weightChangeKg >= 0 ? "up" : "down"} {formatNumber(Math.abs(ins.weightChangeKg), 1)} kg since your first weigh-in.
              {ins.weightChangeKg > 0 && snapshot.profile.category === "NICOTINE" && " A few kilos is common and far less harmful than smoking; it usually levels off after three months."}
              {ins.weightChangeKg > 0 && snapshot.profile.category !== "NICOTINE" && " Appetite often changes in early recovery; it tends to settle as routines do."}
            </p>
          )}
          {ins.frequentSymptoms.length > 0 && (
            <p className="soft">
              Most frequent this week: {ins.frequentSymptoms.slice(0, 3).map((s) => SYMPTOM_LABELS[s.symptom].toLowerCase()).join(", ")}. Withdrawal usually fades within 2–4 weeks.
            </p>
          )}
        </section>
      )}
    </div>
  );
}
