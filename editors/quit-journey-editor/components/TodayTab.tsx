import { generateId } from "document-model";
import { actions, BADGES, PREP_TASKS } from "document-models/quit-journey";
import { useState } from "react";
import { useIntl } from "react-intl";
import { cid, useContent } from "../i18n/content.js";
import { capitalize, formatLifeMinutes, formatMoney, formatNumber, formatShortDuration, weekdayName } from "../lib/format.js";
import { useLabels } from "../lib/labels.js";
import type { TabProps } from "../lib/types.js";
import { CheckInForm } from "./CheckInForm.js";
import { PlanForm } from "./PlanForm.js";
import { SafetyNotes } from "./SafetyNotes.js";
import { useProfileText } from "./SkyHero.js";
import { TodayCards } from "./toolkit/TodayCards.js";
import { Meter, Ring } from "./ui.js";

export function TodayTab(props: TabProps) {
  const { state, snapshot, dispatch } = props;
  const intl = useIntl();
  const { tc, tf } = useContent();
  const L = useLabels();
  const [checkingIn, setCheckingIn] = useState(false);
  const [useAmount, setUseAmount] = useState("1");
  const { money, gamification, streaks, insights, prep, profile, reduction } = snapshot;
  const text = useProfileText(profile);
  const level = gamification.level;

  if (snapshot.phase === "NOT_STARTED") {
    return (
      <section className="panel stack">
        <h2>{intl.formatMessage({ id: "today.setup.heading", defaultMessage: "Your plan" })}</h2>
        <p className="soft">{intl.formatMessage({ id: "today.setup.intro", defaultMessage: "Tell us what you're leaving behind, how much you used and what it cost. Everything else — savings, recovery, badges — is calculated from this." })}</p>
        <PlanForm plan={state.plan} dispatch={dispatch} now={snapshot.now} onSaved={() => window.scrollTo({ top: 0, behavior: "smooth" })} />
      </section>
    );
  }

  const unit = text.unit;
  const next = snapshot.nextHealthMilestone;
  const critical = profile.safety.filter((n) => n.level === "critical");
  const nextBadge = gamification.nextBadge;
  const nextBadgeTemplate = nextBadge ? BADGES.find((x) => x.key === nextBadge.key)?.description : undefined;

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
            <h3>{intl.formatMessage({ id: "today.limit.heading", defaultMessage: "Today's limit" })}</h3>
            <span className="soft">
              {intl.formatMessage(
                { id: "today.limit.usage", defaultMessage: "{used} / {limit} {unit}" },
                { used: formatNumber(reduction.usedToday, 1), limit: formatNumber(reduction.dailyLimit, 1), unit },
              )}
            </span>
          </div>
          <Meter value={reduction.usedToday / reduction.dailyLimit} tone={reduction.usedToday > reduction.dailyLimit ? "amber" : undefined}
            label={intl.formatMessage({ id: "today.limit.meter", defaultMessage: "Used of today's limit" })} />
          <p className="soft">
            {reduction.usedToday > reduction.dailyLimit
              ? intl.formatMessage({ id: "today.limit.over", defaultMessage: "Over the limit today. Tomorrow is a fresh day — no streak math can take away what you've already cut." })
              : intl.formatMessage(
                { id: "today.limit.remaining", defaultMessage: "{remaining} {remainingCount, plural, one {{unitOne}} other {{unit}}} left within today's limit. Best run so far: {best, plural, one {# day} other {# days}}." },
                { remaining: formatNumber(reduction.remainingToday, 1), remainingCount: reduction.remainingToday, unitOne: text.unitOne, unit, best: reduction.bestStreakDays },
              )}
          </p>
          <div className="row" style={{ flexWrap: "nowrap" }}>
            <input type="number" min="0.5" step="0.5" value={useAmount} onChange={(e) => setUseAmount(e.target.value)}
              aria-label={intl.formatMessage({ id: "today.limit.amount", defaultMessage: "How many {unit}" }, { unit })} style={{ maxWidth: 110 }} />
            <button type="button" className="btn ghost" onClick={logUse}>{intl.formatMessage({ id: "today.limit.logUse", defaultMessage: "Log use" })}</button>
          </div>
        </section>
      )}

      {snapshot.phase === "PREP" && (
        <section className="panel tint-leaf stack">
          <h3>{intl.formatMessage({ id: "today.prep.heading", defaultMessage: "Getting ready" })}</h3>
          <p>
            {prep.taperTargetToday !== null
              ? intl.formatMessage(
                { id: "today.prep.taper", defaultMessage: "Cut down gently: aim for no more than {target} {unit} today. You're {percent}% prepared." },
                { target: prep.taperTargetToday, unit, percent: Math.round(prep.readiness * 100) },
              )
              : intl.formatMessage({ id: "today.prep.readiness", defaultMessage: "You're {percent}% prepared." }, { percent: Math.round(prep.readiness * 100) })}
          </p>
          <Meter value={prep.readiness} label={intl.formatMessage({ id: "today.prep.meter", defaultMessage: "Preparation" })} />
          <ul className="list">
            {PREP_TASKS.map((t) => {
              const done = state.prepTasksDone.includes(t.key);
              return (
                <li key={t.key}>
                  <label className="row" style={{ alignItems: "flex-start", cursor: "pointer", flexWrap: "nowrap" }}>
                    <input type="checkbox" style={{ width: 20, height: 20, marginTop: 2 }} checked={done}
                      onChange={(e) => dispatch(actions.togglePrepTask({ taskKey: t.key, done: e.target.checked }))} />
                    <span><strong>{tc(cid.prep(t.key, "title"), t.title)}</strong><br /><span className="muted">{tc(cid.prep(t.key, "hint"), t.hint)}</span></span>
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
            <div><dt>{intl.formatMessage({ id: "today.ledger.moneySaved", defaultMessage: "Money saved" })}</dt><dd>{formatMoney(money.moneySaved, money.currency)}</dd></div>
            <div><dt>{intl.formatMessage({ id: "today.ledger.unitsSkipped", defaultMessage: "{unit} skipped" }, { unit: capitalize(unit) })}</dt><dd>{formatNumber(money.unitsAvoided)}</dd></div>
            {money.lifeRegainedMinutes !== null && (
              <div><dt>{intl.formatMessage({ id: "today.ledger.lifeRegained", defaultMessage: "Life expectancy regained" })}</dt><dd>{formatLifeMinutes(money.lifeRegainedMinutes)}</dd></div>
            )}
            {money.timeRegainedMinutes !== null && (
              <div><dt>{intl.formatMessage({ id: "today.ledger.timeRegained", defaultMessage: "Time given back" })}</dt><dd>{formatLifeMinutes(money.timeRegainedMinutes)}</dd></div>
            )}
            {!reduction && <div><dt>{intl.formatMessage({ id: "today.ledger.sinceLastUse", defaultMessage: "Since last use" })}</dt><dd>{formatShortDuration(streaks.smokeFreeStreakMs)}</dd></div>}
          </dl>
          <p className="muted" style={{ marginTop: 12 }}>
            {intl.formatMessage(
              { id: "today.ledger.projection", defaultMessage: "At this pace you'll keep {amount} a year." },
              { amount: formatMoney(money.projectedYearlySavings, money.currency) },
            )}
          </p>
        </section>
      )}

      <section className="panel stack">
        <div className="spread">
          <h3>
            {intl.formatMessage(
              { id: "today.level.heading", defaultMessage: "{icon} {name}, level {level}" },
              { icon: level.icon, name: tc(cid.level(level.name), level.name), level: level.level },
            )}
          </h3>
          <span className="muted">{intl.formatMessage({ id: "today.level.xp", defaultMessage: "{xp} XP" }, { xp: formatNumber(level.xp) })}</span>
        </div>
        <Meter value={level.progress} tone="amber" label={intl.formatMessage({ id: "today.level.meter", defaultMessage: "Level progress" })} />
        <p className="muted">
          {level.nextLevelXp !== null
            ? intl.formatMessage(
              { id: "today.level.toNext", defaultMessage: "{xp} XP to the next level. Every day on track is worth 100." },
              { xp: formatNumber(level.nextLevelXp - level.xp) },
            )
            : intl.formatMessage({ id: "today.level.top", defaultMessage: "Top level reached." })}
        </p>
        {nextBadge && (
          <div className="row" style={{ flexWrap: "nowrap" }}>
            <span style={{ fontSize: "1.8rem" }}>{nextBadge.icon}</span>
            <div style={{ flex: 1 }}>
              <p>
                {intl.formatMessage(
                  { id: "today.badge.closest", defaultMessage: "<b>Closest badge: {title}</b> <m>— {description}</m>" },
                  {
                    title: tc(cid.badge(nextBadge.key, "title"), nextBadge.title),
                    description: text.lower(nextBadgeTemplate ? tf(cid.badge(nextBadge.key, "description"), nextBadgeTemplate, { unit }) : nextBadge.description),
                    b: (c) => <strong>{c}</strong>,
                    m: (c) => <span className="muted">{c}</span>,
                  },
                )}
              </p>
              <Meter value={nextBadge.progress} label={intl.formatMessage({ id: "today.badge.meter", defaultMessage: "Badge progress" })} />
            </div>
          </div>
        )}
      </section>

      {next && snapshot.phase === "QUIT" && (
        <section className="row" style={{ flexWrap: "nowrap" }}>
          <Ring value={next.progress}>{next.icon}</Ring>
          <div>
            <h3>
              {intl.formatMessage(
                { id: "today.milestone.next", defaultMessage: "{title} in {duration}" },
                { title: tc(cid.milestone(next.key, "title"), next.title), duration: formatShortDuration(next.remainingMs) },
              )}
            </h3>
            <p className="soft">{tc(cid.milestone(next.key, "description"), next.description)}</p>
          </div>
        </section>
      )}

      <section className="panel stack">
        <div className="spread">
          <h3>{intl.formatMessage({ id: "today.checkin.heading", defaultMessage: "Daily check-in" })}</h3>
          <span className="muted">
            {streaks.checkInStreak > 0
              ? intl.formatMessage({ id: "today.checkin.streak", defaultMessage: "{days}-day streak" }, { days: streaks.checkInStreak })
              : intl.formatMessage({ id: "today.checkin.startStreak", defaultMessage: "Start a streak today" })}
          </span>
        </div>
        {streaks.checkedInToday ? (
          <p className="soft">{intl.formatMessage({ id: "today.checkin.done", defaultMessage: "Done for today. Come back tomorrow to keep the streak going." })}</p>
        ) : checkingIn ? (
          <CheckInForm dispatch={dispatch} now={snapshot.now} onDone={() => setCheckingIn(false)} />
        ) : (
          <button type="button" className="btn" onClick={() => setCheckingIn(true)}>{intl.formatMessage({ id: "today.checkin.start", defaultMessage: "Check in for today" })}</button>
        )}
      </section>

      {(insights.riskWindow || insights.bestStrategy) && (
        <section className="panel tint-amber stack">
          <h3>{intl.formatMessage({ id: "today.headsUp.heading", defaultMessage: "Heads-up" })}</h3>
          {insights.riskWindow && (
            <p>
              {intl.formatMessage(
                { id: "today.headsUp.riskWindow", defaultMessage: "Your cravings cluster on {weekday} between {start}:00 and {end}:00. Plan something for that window." },
                { weekday: weekdayName(insights.riskWindow.weekday), start: insights.riskWindow.startHour, end: insights.riskWindow.startHour + 2 },
              )}
            </p>
          )}
          {insights.bestStrategy && (
            <p>
              {intl.formatMessage(
                { id: "today.headsUp.bestStrategy", defaultMessage: "What works best for you: <b>{strategy}</b>." },
                { strategy: text.lower(L.label("strategy", insights.bestStrategy)), b: (c) => <strong>{c}</strong> },
              )}
            </p>
          )}
          {insights.topTrigger && (
            <p className="soft">
              {intl.formatMessage(
                { id: "today.headsUp.topTrigger", defaultMessage: "Most common trigger: {trigger}." },
                { trigger: text.lower(L.label("trigger", insights.topTrigger)) },
              )}
            </p>
          )}
        </section>
      )}
    </div>
  );
}
