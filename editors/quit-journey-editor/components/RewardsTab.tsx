import { generateId } from "document-model";
import { actions } from "document-models/quit-journey";
import { useState } from "react";
import { useIntl } from "react-intl";
import { formatMoney } from "../lib/format.js";
import type { TabProps } from "../lib/types.js";
import { Empty, Field, Meter } from "./ui.js";

export function RewardsTab({ state, snapshot, dispatch }: TabProps) {
  const intl = useIntl();
  const [title, setTitle] = useState("");
  const [cost, setCost] = useState("");
  const [emoji, setEmoji] = useState("🎁");
  const money = snapshot.money;
  const currency = money?.currency ?? state.plan?.currency ?? "EUR";
  const available = money?.moneyAvailable ?? 0;

  function add() {
    const c = Number(cost);
    if (!title.trim() || !(c > 0)) return;
    dispatch(actions.addRewardGoal({ id: generateId(), title: title.trim(), cost: c, emoji: emoji || null }));
    setTitle("");
    setCost("");
  }

  const open = state.rewards.filter((r) => !r.claimedAt);
  const claimed = state.rewards.filter((r) => r.claimedAt);

  return (
    <div className="stack-lg">
      <section className="panel tint-amber stack">
        <p className="soft">{intl.formatMessage({ id: "rewards.jar.heading", defaultMessage: "In your savings jar" })}</p>
        <p style={{ fontFamily: "var(--display)", fontWeight: 800, fontSize: "2.6rem", lineHeight: 1 }}>{formatMoney(available, currency)}</p>
        {money && money.moneySpentOnRewards > 0 && (
          <p className="muted">
            {intl.formatMessage(
              { id: "rewards.jar.breakdown", defaultMessage: "{saved} saved, {spent} spent on rewards." },
              { saved: formatMoney(money.moneySaved, currency), spent: formatMoney(money.moneySpentOnRewards, currency) },
            )}
          </p>
        )}
      </section>

      <section className="stack">
        <h2>{intl.formatMessage({ id: "rewards.goals.heading", defaultMessage: "Save up for something" })}</h2>
        {open.length === 0 && <Empty>{intl.formatMessage({ id: "rewards.goals.empty", defaultMessage: "Pick a treat — a dinner out, new trainers, a weekend away. Watching it fill up is strangely addictive." })}</Empty>}
        <ul className="list">
          {open.map((r) => {
            const progress = available / r.cost;
            const daysLeft = money && money.costPerDay > 0 ? Math.ceil(Math.max(0, r.cost - available) / money.costPerDay) : null;
            return (
              <li key={r.id} style={{ display: "block" }}>
                <div className="spread">
                  <strong>{r.emoji} {r.title}</strong>
                  <span className="soft">{formatMoney(r.cost, currency)}</span>
                </div>
                <div style={{ margin: "8px 0" }}><Meter value={progress} tone="amber" label={intl.formatMessage({ id: "rewards.goal.progress", defaultMessage: "Progress towards {reward}" }, { reward: r.title })} /></div>
                <div className="spread">
                  <span className="muted">{progress >= 1
                      ? intl.formatMessage({ id: "rewards.goal.affordable", defaultMessage: "You can afford it now." })
                      : daysLeft !== null
                        ? intl.formatMessage({ id: "rewards.goal.daysLeft", defaultMessage: "About {days, plural, one {# more day} other {# more days}} on track." }, { days: daysLeft })
                        : ""}</span>
                  <span className="row">
                    <button type="button" className="linkish" onClick={() => dispatch(actions.deleteRewardGoal({ id: r.id }))}>{intl.formatMessage({ id: "rewards.goal.remove", defaultMessage: "Remove" })}</button>
                    <button type="button" className="btn small" disabled={progress < 1}
                      onClick={() => dispatch(actions.claimReward({ id: r.id, claimedAt: new Date().toISOString() }))}>{intl.formatMessage({ id: "rewards.goal.claim", defaultMessage: "Claim reward" })}</button>
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
        <div className="panel stack">
          <div className="grid2">
            <Field label={intl.formatMessage({ id: "rewards.form.reward", defaultMessage: "Reward" })}><input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={intl.formatMessage({ id: "rewards.form.rewardPlaceholder", defaultMessage: "Concert tickets" })} /></Field>
            <Field label={intl.formatMessage({ id: "rewards.form.cost", defaultMessage: "Cost ({currency})" }, { currency })}><input type="number" min="0" step="1" value={cost} onChange={(e) => setCost(e.target.value)} /></Field>
            <Field label={intl.formatMessage({ id: "rewards.form.emoji", defaultMessage: "Emoji" })}><input value={emoji} maxLength={4} onChange={(e) => setEmoji(e.target.value)} /></Field>
          </div>
          <button type="button" className="btn" disabled={!title.trim() || !(Number(cost) > 0)} onClick={add}>{intl.formatMessage({ id: "rewards.form.add", defaultMessage: "Add reward" })}</button>
        </div>
      </section>

      {claimed.length > 0 && (
        <section>
          <h3>{intl.formatMessage({ id: "rewards.claimed.heading", defaultMessage: "Claimed" })}</h3>
          <ul className="list">
            {claimed.map((r) => (
              <li key={r.id}><span>{r.emoji} {r.title}</span><span className="muted">{formatMoney(r.cost, currency)}</span></li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
