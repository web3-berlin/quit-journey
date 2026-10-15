import { useIntl } from "react-intl";
import { formatDate, formatNumber, weekdayName } from "../lib/format.js";
import { useLabels } from "../lib/labels.js";
import type { TabProps } from "../lib/types.js";
import { useProfileText } from "./SkyHero.js";
import { Empty } from "./ui.js";

/** Single-hue sequential ramp (leaf) for the craving heatmap; 0 stays on the surface tone. */
const HEAT = ["#e9f1f4", "#c4e6d2", "#8fcfa9", "#55b17e", "#2f9e62", "#1d6b42"];

export function InsightsTab({ state, snapshot }: TabProps) {
  const intl = useIntl();
  const L = useLabels();
  const { lower } = useProfileText(snapshot.profile);
  const ins = snapshot.insights;
  if (ins.totalCravings === 0 && state.checkIns.length === 0) {
    return <Empty>{intl.formatMessage({ id: "insights.empty", defaultMessage: "Insights appear once you've logged a few cravings or check-ins. Each one makes the patterns sharper." })}</Empty>;
  }
  const maxHeat = Math.max(1, ...ins.heatmap.flat());
  const maxWeek = Math.max(1, ...ins.weeklyTrend.map((w) => w.cravings));

  return (
    <div className="stack-lg">
      <h2>{intl.formatMessage({ id: "insights.heading", defaultMessage: "What your data says" })}</h2>

      {ins.strategies.length > 0 && (
        <section className="stack">
          <h3>{intl.formatMessage({ id: "insights.strategies.heading", defaultMessage: "What works for you" })}</h3>
          <p className="soft">{intl.formatMessage({ id: "insights.strategies.intro", defaultMessage: "Share of cravings beaten with each strategy." })}</p>
          {ins.strategies.map((s) => (
            <div key={s.strategy} className="hbar"
              title={intl.formatMessage({ id: "insights.strategies.beaten", defaultMessage: "{resisted} of {uses} beaten" }, { resisted: s.resisted, uses: s.uses })}>
              <span>{L.label("strategy", s.strategy)}</span>
              <div className="track"><i style={{ width: `${s.rate * 100}%` }} /></div>
              <span className="soft" style={{ textAlign: "right" }}>
                {intl.formatMessage({ id: "insights.strategies.rate", defaultMessage: "{rate}%" }, { rate: formatNumber(s.rate * 100) })}
              </span>
            </div>
          ))}
        </section>
      )}

      {ins.triggers.length > 0 && (
        <section className="stack">
          <h3>{intl.formatMessage({ id: "insights.triggers.heading", defaultMessage: "Your triggers" })}</h3>
          <ul className="list">
            {ins.triggers.map((t) => (
              <li key={t.trigger}>
                <span>{L.label("trigger", t.trigger)}</span>
                <span className="soft">
                  {t.smoked
                    ? intl.formatMessage(
                      { id: "insights.triggers.statsSlipped", defaultMessage: "{count, plural, one {# craving} other {# cravings}}, avg intensity {intensity}, {slipped} slipped" },
                      { count: t.count, intensity: formatNumber(t.avgIntensity, 1), slipped: t.smoked },
                    )
                    : intl.formatMessage(
                      { id: "insights.triggers.stats", defaultMessage: "{count, plural, one {# craving} other {# cravings}}, avg intensity {intensity}" },
                      { count: t.count, intensity: formatNumber(t.avgIntensity, 1) },
                    )}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {ins.totalCravings > 0 && (
        <section className="stack">
          <h3>{intl.formatMessage({ id: "insights.heatmap.heading", defaultMessage: "When cravings hit" })}</h3>
          <p className="soft">
            {ins.riskWindow
              ? intl.formatMessage(
                { id: "insights.heatmap.riskWindow", defaultMessage: "Your riskiest window is {weekday} {start}:00–{end}:00." },
                { weekday: weekdayName(ins.riskWindow.weekday), start: ins.riskWindow.startHour, end: ins.riskWindow.startHour + 2 },
              )
              : intl.formatMessage({ id: "insights.heatmap.notEnough", defaultMessage: "Not enough cravings yet to spot a pattern." })}
          </p>
          <div className="heat" role="img" aria-label={intl.formatMessage({ id: "insights.heatmap.label", defaultMessage: "Cravings by weekday and hour" })}>
            <span />
            {Array.from({ length: 24 }, (_, h) => <span key={h} style={{ textAlign: "center" }}>{h % 6 === 0 ? h : ""}</span>)}
            {ins.heatmap.map((row, d) => [
              <span key={`l${d}`}>{weekdayName(d)}</span>,
              ...row.map((n, h) => (
                <span key={`${d}-${h}`} className="cell"
                  title={intl.formatMessage(
                    { id: "insights.heatmap.cell", defaultMessage: "{weekday} {hour}:00 — {count, plural, one {# craving} other {# cravings}}" },
                    { weekday: weekdayName(d), hour: h, count: n },
                  )}
                  style={{ background: HEAT[n === 0 ? 0 : Math.min(HEAT.length - 1, Math.ceil((n / maxHeat) * (HEAT.length - 1)))] }} />
              )),
            ])}
          </div>
        </section>
      )}

      {ins.totalCravings > 0 && (
        <section className="stack">
          <h3>{intl.formatMessage({ id: "insights.weekly.heading", defaultMessage: "Cravings per week" })}</h3>
          <p className="soft">
            {intl.formatMessage(
              { id: "insights.weekly.intro", defaultMessage: "Last {weeks, plural, one {# week} other {# weeks}}. Fewer and weaker over time is the goal." },
              { weeks: ins.weeklyTrend.length },
            )}
          </p>
          <div className="bars">
            {ins.weeklyTrend.map((w) => (
              <div key={w.weekStart}
                title={intl.formatMessage(
                  { id: "insights.weekly.bar", defaultMessage: "Week of {date}: {count, plural, one {# craving} other {# cravings}}, avg intensity {intensity}" },
                  { date: formatDate(w.weekStart), count: w.cravings, intensity: formatNumber(w.avgIntensity, 1) },
                )}>
                <i style={{ height: `${(w.cravings / maxWeek) * 100}%` }} />
              </div>
            ))}
          </div>
        </section>
      )}

      {(ins.weightChangeKg !== null || ins.frequentSymptoms.length > 0) && (
        <section className="stack">
          <h3>{intl.formatMessage({ id: "insights.body.heading", defaultMessage: "Body check" })}</h3>
          {ins.weightChangeKg !== null && (
            <p>
              {intl.formatMessage(
                { id: "insights.body.weight", defaultMessage: "Weight {direction, select, up {up} other {down}} {kg} kg since your first weigh-in." },
                { direction: ins.weightChangeKg >= 0 ? "up" : "down", kg: formatNumber(Math.abs(ins.weightChangeKg), 1) },
              )}
              {ins.weightChangeKg > 0 && snapshot.profile.category === "NICOTINE" &&
                ` ${intl.formatMessage({ id: "insights.body.weightNicotine", defaultMessage: "A few kilos is common and far less harmful than smoking; it usually levels off after three months." })}`}
              {ins.weightChangeKg > 0 && snapshot.profile.category !== "NICOTINE" &&
                ` ${intl.formatMessage({ id: "insights.body.weightOther", defaultMessage: "Appetite often changes in early recovery; it tends to settle as routines do." })}`}
            </p>
          )}
          {ins.frequentSymptoms.length > 0 && (
            <p className="soft">
              {intl.formatMessage(
                { id: "insights.body.symptoms", defaultMessage: "Most frequent this week: {symptoms}. Withdrawal usually fades within 2–4 weeks." },
                { symptoms: intl.formatList(ins.frequentSymptoms.slice(0, 3).map((s) => lower(L.label("symptom", s.symptom))), { type: "unit" }) },
              )}
            </p>
          )}
        </section>
      )}
    </div>
  );
}
