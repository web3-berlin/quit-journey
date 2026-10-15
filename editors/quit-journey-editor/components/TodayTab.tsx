import { generateId } from "document-model";
import { actions, PREP_TASKS } from "document-models/quit-journey";
import { useState } from "react";
import { capitalize, formatLifeMinutes, formatMoney, formatNumber, formatShortDuration, singular } from "../lib/format.js";
import { STRATEGY_LABELS, TRIGGER_LABELS, WEEKDAYS } from "../lib/labels.js";
import type { TabProps } from "../lib/types.js";
import { CheckInForm } from "./CheckInForm.js";
import { PlanForm } from "./PlanForm.js";
import { SafetyNotes } from "./SafetyNotes.js";
import { TodayCards } from "./toolkit/TodayCards.js";
import { Meter, Ring } from "./ui.js";

export function TodayTab(props: TabProps) {
  const { state, snapshot, dispatch } = props;
  const [checkingIn, setCheckingIn] = useState(false);
  const [useAmount, setUseAmount] = useState("1");
  const { money, gamification, streaks, insights, prep, profile, reduction } = snapshot;
  const level = gamification.level;

  if (snapshot.phase === "NOT_STARTED") {
    return (
      <section className="panel stack">
        <h2>Your plan</h2>
        <p className="soft">Tell us what you're leaving behind, how much you used and what it cost. Everything else — savings, recovery, badges — is calculated from this.</p>
        <PlanForm plan={state.plan} dispatch={dispatch} now={snapshot.now} onSaved={() => window.scrollTo({ top: 0, behavior: "smooth" })} />
      </section>
    );
  }

  const unit = profile.unit;
  const next = snapshot.nextHealthMilestone;
  const critical = profile.safety.filter((n) => n.level === "critical");

  function logUse() {
    const units = Number(useAmount);
    if (!(units > 0)) return;
    dispatch(actions.logSlip({ id: generateId(), timestamp: new Date(snapshot.now).toISOString(), units, trigger: null, note: null }));
    setUseAmount("1");
  }

  return (
    <div className="stack-lg">
      <SafetyNotes notes={critical} collapsed={snapshot.elapsedMs > 7 * 24 * 3_600_000} />

      {snapshot.phase === "QUIT" && <TodayCards {...props} />}

      {reduction && snapshot.phase === "QUIT" && (
        <section className="panel tint-leaf stack">
          <div className="spread">
            <h3>Today's limit</h3>
            <span className="soft">{formatNumber(reduction.usedToday, 1)} / {formatNumber(reduction.dailyLimit, 1)} {unit}</span>
          </div>
          <Meter value={reduction.usedToday / reduction.dailyLimit} tone={reduction.usedToday > reduction.dailyLimit ? "amber" : undefined} label="Used of today's limit" />
          <p className="soft">
            {reduction.usedToday > reduction.dailyLimit
              ? "Over the limit today. Tomorrow is a fresh day — no streak math can take away what you've already cut."
              : `${formatNumber(reduction.remainingToday, 1)} ${reduction.remainingToday === 1 ? singular(unit) : unit} left within today's limit. Best run so far: ${reduction.bestStreakDays} days.`}
          </p>
          <div className="row" style={{ flexWrap: "nowrap" }}>
            <input type="number" min="0.5" step="0.5" value={useAmount} onChange={(e) => setUseAmount(e.target.value)} aria-label={`How many ${unit}`} style={{ maxWidth: 110 }} />
            <button type="button" className="btn ghost" onClick={logUse}>Log use</button>
          </div>
        </section>
      )}

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
            <div><dt>{capitalize(unit)} skipped</dt><dd>{formatNumber(money.unitsAvoided)}</dd></div>
            {money.lifeRegainedMinutes !== null && (
              <div><dt>Life expectancy regained</dt><dd>{formatLifeMinutes(money.lifeRegainedMinutes)}</dd></div>
            )}
            {money.timeRegainedMinutes !== null && (
              <div><dt>Time given back</dt><dd>{formatLifeMinutes(money.timeRegainedMinutes)}</dd></div>
            )}
            {!reduction && <div><dt>Since last use</dt><dd>{formatShortDuration(streaks.smokeFreeStreakMs)}</dd></div>}
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
          {level.nextLevelXp !== null ? `${formatNumber(level.nextLevelXp - level.xp)} XP to the next level. Every day on track is worth 100.` : "Top level reached."}
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
