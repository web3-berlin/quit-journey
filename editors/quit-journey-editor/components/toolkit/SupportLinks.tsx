import { helplinesFor, protectionLinksFor } from "document-models/quit-journey";
import { useState } from "react";
import { formatNumber } from "../../lib/format.js";
import type { TabProps } from "../../lib/types.js";

/** Helplines and services for this journey, plus a summary to share with an accountability partner. */
export function SupportLinks({ state, snapshot, host }: TabProps) {
  const [copied, setCopied] = useState(false);
  const key = snapshot.profile.key;
  const helplines = helplinesFor(key);
  const links = protectionLinksFor(key).filter((l) => key === "GAMBLING" ? /meeting|narcotics|smart/i.test(l.name) : true);

  // Only progress, never slip details: the partner sees effort, not a ledger of lapses.
  const summary = [
    `My ${snapshot.profile.name.toLowerCase()} journey:`,
    snapshot.reduction
      ? `${snapshot.reduction.streakDays} days within my limit (${snapshot.reduction.daysWithinLimit}/${snapshot.reduction.daysTracked} on track)`
      : `${Math.floor(snapshot.elapsedMs / 86_400_000)} days since I started`,
    `${snapshot.streaks.checkInStreak}-day check-in streak`,
    `${snapshot.insights.resistedCravings} cravings beaten`,
    snapshot.money ? `${formatNumber(snapshot.money.moneySaved)} ${snapshot.money.currency} kept` : null,
  ].filter(Boolean).join("\n");

  async function share() {
    if (host.shareText) {
      await host.shareText("My progress", summary);
      return;
    }
    await navigator.clipboard.writeText(summary);
    setCopied(true);
  }

  return (
    <section className="stack">
      <h3>People who can help</h3>
      <ul className="list">
        {helplines.map((h) => (
          <li key={h.key}><span><strong>{h.name}</strong> <span className="muted">({h.region})</span></span><a className="btn ghost small" href={`tel:${h.phone}`}>{h.phone}</a></li>
        ))}
        {links.map((l) => (
          <li key={l.key}><span><a href={l.url} target="_blank" rel="noreferrer"><strong>{l.name}</strong></a> <span className="muted">({l.region})</span><br /><span className="soft">{l.description}</span></span></li>
        ))}
      </ul>
      <h3>Share progress with your partner</h3>
      <p className="soft">Sends your streak, check-ins and cravings beaten — never your slips or notes.</p>
      <pre className="panel" style={{ whiteSpace: "pre-wrap", fontFamily: "inherit", margin: 0 }}>{summary}</pre>
      <button type="button" className="btn ghost" onClick={() => void share()}>{host.shareText ? "Share" : copied ? "Copied" : "Copy"}</button>
      {state.supportContacts.length === 0 && <p className="muted">Add your partner under My plan → Support network.</p>}
    </section>
  );
}
