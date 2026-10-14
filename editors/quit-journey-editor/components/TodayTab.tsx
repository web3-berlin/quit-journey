import { actions, PREP_TASKS } from "document-models/quit-journey";
import { useState } from "react";
import { formatLifeMinutes, formatMoney, formatNumber, formatShortDuration } from "../lib/format.js";
import { STRATEGY_LABELS, TRIGGER_LABELS, WEEKDAYS } from "../lib/labels.js";
import type { TabProps } from "../lib/types.js";
import { CheckInForm } from "./CheckInForm.js";
import { PlanForm } from "./PlanForm.js";
import { Meter, Ring } from "./ui.js";

export function TodayTab({ state, snapshot, dispatch }: TabProps) {
  const [checkingIn, setCheckingIn] = useState(false);
  const { money, gamification, streaks, insights, prep } = snapshot;
  const level = gamification.level;

  if (snapshot.phase === "NOT_STARTED") {
    return (
      <section className="panel stack">
        <h2>Your quit plan</h2>
        <p className="soft">Tell us what you smoked and what it cost. Everything else — savings, health, badges — is calculated from this.</p>
        <PlanForm plan={state.plan} dispatch={dispatch} now={snapshot.now} onSaved={() => window.scrollTo({ top: 0, behavior: "smooth" })} />
      </section>
    );
  }

  const unit = state.plan?.productType === "VAPE" ? "pods" : "cigarettes";
  const next = snapshot.nextHealthMilestone;

  return (
    <div className="stack-lg">
      {snapshot.phase === "PREP" && (
        <section className="panel tint-leaf stack">
          <h3>Getting ready</h3>
          <p>
            {prep.taperTargetToday !== null && `Cut down gently: aim for no more than ${prep.taperTargetToday} ${unit} today. `}
            You're {Math.round(prep.readiness * 100)}% prepared.
          </p>
          <Meter value={prep.readiness} label="Preparation" />
          <ul className="list">
            {PREP_TASKS.map((t) => {
              const done = state.prepTasksDone.includes(t.key);
              return (
                <li key={t.key}>
                  <label className="row" style={{ alignItems: "flex-start", cursor: "pointer", flexWrap: "nowrap" }}>
                    <input type="checkbox" style={{ width: 20, height: 20, marginTop: 2 }} checked={done}
                      onChange={(e) => dispatch(actions.togglePrepTask({ taskKey: t.key, done: e.target.checked }))} />
                    <span><strong>{t.title}</strong><br /><span className="muted">{t.hint}</span></span>
                  </label>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {money && snapshot.phase === "QUIT" && (
        <section>
          <dl className="ledger">
            <div><dt>Money saved</dt><dd>{formatMoney(money.moneySaved, money.currency)}</dd></div>
            <div><dt>{unit[0].toUpperCase() + unit.slice(1)} not smoked</dt><dd>{formatNumber(money.unitsAvoided)}</dd></div>
            {money.lifeRegainedMinutes !== null && (
              <div><dt>Life expectancy regained</dt><dd>{formatLifeMinutes(money.lifeRegainedMinutes)}</dd></div>
            )}
            <div><dt>Since last cigarette</dt><dd>{formatShortDuration(streaks.smokeFreeStreakMs)}</dd></div>
          </dl>
          <p className="muted" style={{ marginTop: 12 }}>
            At this pace you'll keep {formatMoney(money.projectedYearlySavings, money.currency)} a year.
          </p>
        </section>
      )}

      <section className="panel stack">
        <div className="spread">
          <h3>{level.icon} {level.name}, level {level.level}</h3>
          <span className="muted">{formatNumber(level.xp)} XP</span>
        </div>
        <Meter value={level.progress} tone="amber" label="Level progress" />
        <p className="muted">
          {level.nextLevelXp !== null ? `${formatNumber(level.nextLevelXp - level.xp)} XP to the next level. Every smoke-free day is worth 100.` : "Top level reached."}
        </p>
        {gamification.nextBadge && (
          <div className="row" style={{ flexWrap: "nowrap" }}>
            <span style={{ fontSize: "1.8rem" }}>{gamification.nextBadge.icon}</span>
            <div style={{ flex: 1 }}>
              <p><strong>Closest badge: {gamification.nextBadge.title}</strong> <span className="muted">— {gamification.nextBadge.description.toLowerCase()}</span></p>
              <Meter value={gamification.nextBadge.progress} label="Badge progress" />
            </div>
          </div>
        )}
      </section>

      {next && snapshot.phase === "QUIT" && (
        <section className="row" style={{ flexWrap: "nowrap" }}>
          <Ring value={next.progress}>{next.icon}</Ring>
          <div>
            <h3>{next.title} in {formatShortDuration(next.remainingMs)}</h3>
            <p className="soft">{next.description}</p>
          </div>
        </section>
      )}

      <section className="panel stack">
        <div className="spread">
          <h3>Daily check-in</h3>
          <span className="muted">{streaks.checkInStreak > 0 ? `${streaks.checkInStreak}-day streak` : "Start a streak today"}</span>
        </div>
        {streaks.checkedInToday ? (
          <p className="soft">Done for today. Come back tomorrow to keep the streak going.</p>
        ) : checkingIn ? (
          <CheckInForm dispatch={dispatch} now={snapshot.now} onDone={() => setCheckingIn(false)} />
        ) : (
          <button type="button" className="btn" onClick={() => setCheckingIn(true)}>Check in for today</button>
        )}
      </section>

      {(insights.riskWindow || insights.bestStrategy) && (
        <section className="panel tint-amber stack">
          <h3>Heads-up</h3>
          {insights.riskWindow && (
            <p>Your cravings cluster on {WEEKDAYS[insights.riskWindow.weekday]} between {insights.riskWindow.startHour}:00 and {insights.riskWindow.startHour + 2}:00. Plan something for that window.</p>
          )}
          {insights.bestStrategy && <p>What works best for you: <strong>{STRATEGY_LABELS[insights.bestStrategy].toLowerCase()}</strong>.</p>}
          {insights.topTrigger && <p className="soft">Most common trigger: {TRIGGER_LABELS[insights.topTrigger].toLowerCase()}.</p>}
        </section>
      )}
    </div>
  );
}
