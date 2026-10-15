import { helplinesFor, protectionLinksFor } from "document-models/quit-journey";
import { useState } from "react";
import { useIntl } from "react-intl";
import { cid, useContent } from "../../i18n/content.js";
import { formatNumber, inSentence } from "../../lib/format.js";
import type { TabProps } from "../../lib/types.js";

/** Helplines and services for this journey, plus a summary to share with an accountability partner. */
export function SupportLinks({ state, snapshot, host }: TabProps) {
  const intl = useIntl();
  const { tc } = useContent();
  const [copied, setCopied] = useState(false);
  const key = snapshot.profile.key;
  const helplines = helplinesFor(key);
  const links = protectionLinksFor(key).filter((l) => key === "GAMBLING" ? /meeting|narcotics|smart/i.test(l.name) : true);
  const substance = inSentence(tc(cid.substance(key, "name"), snapshot.profile.name), intl.locale);

  // Only progress, never slip details: the partner sees effort, not a ledger of lapses.
  const summary = [
    intl.formatMessage({ id: "toolkit.support.summary.title", defaultMessage: "My {substance} journey:" }, { substance }),
    snapshot.reduction
      ? intl.formatMessage(
          {
            id: "toolkit.support.summary.withinLimit",
            defaultMessage: "{days, plural, one {# day} other {# days}} within my limit ({within}/{tracked} on track)",
          },
          { days: snapshot.reduction.streakDays, within: snapshot.reduction.daysWithinLimit, tracked: snapshot.reduction.daysTracked },
        )
      : intl.formatMessage(
          { id: "toolkit.support.summary.sinceStart", defaultMessage: "{days, plural, one {# day} other {# days}} since I started" },
          { days: Math.floor(snapshot.elapsedMs / 86_400_000) },
        ),
    intl.formatMessage({ id: "toolkit.support.summary.checkInStreak", defaultMessage: "{days}-day check-in streak" }, { days: snapshot.streaks.checkInStreak }),
    intl.formatMessage(
      { id: "toolkit.support.summary.cravingsBeaten", defaultMessage: "{count, plural, one {# craving beaten} other {# cravings beaten}}" },
      { count: snapshot.insights.resistedCravings },
    ),
    snapshot.money
      ? intl.formatMessage(
          { id: "toolkit.support.summary.moneyKept", defaultMessage: "{amount} {currency} kept" },
          { amount: formatNumber(snapshot.money.moneySaved), currency: snapshot.money.currency },
        )
      : null,
  ].filter(Boolean).join("\n");

  async function share() {
    if (host.shareText) {
      await host.shareText(intl.formatMessage({ id: "toolkit.support.shareTitle", defaultMessage: "My progress" }), summary);
      return;
    }
    await navigator.clipboard.writeText(summary);
    setCopied(true);
  }

  return (
    <section className="stack">
      <h3>{intl.formatMessage({ id: "toolkit.support.heading", defaultMessage: "People who can help" })}</h3>
      <ul className="list">
        {helplines.map((h) => (
          <li key={h.key}><span><strong>{h.name}</strong> <span className="muted">({h.region})</span></span><a className="btn ghost small" href={`tel:${h.phone}`}>{h.phone}</a></li>
        ))}
        {links.map((l) => (
          <li key={l.key}><span><a href={l.url} target="_blank" rel="noreferrer"><strong>{l.name}</strong></a> <span className="muted">({l.region})</span><br /><span className="soft">{tc(cid.link(l.key), l.description)}</span></span></li>
        ))}
      </ul>
      <h3>{intl.formatMessage({ id: "toolkit.support.shareHeading", defaultMessage: "Share progress with your partner" })}</h3>
      <p className="soft">{intl.formatMessage({ id: "toolkit.support.shareIntro", defaultMessage: "Sends your streak, check-ins and cravings beaten — never your slips or notes." })}</p>
      <pre className="panel" style={{ whiteSpace: "pre-wrap", fontFamily: "inherit", margin: 0 }}>{summary}</pre>
      <button type="button" className="btn ghost" onClick={() => void share()}>
        {host.shareText
          ? intl.formatMessage({ id: "toolkit.support.share", defaultMessage: "Share" })
          : copied
            ? intl.formatMessage({ id: "toolkit.support.copied", defaultMessage: "Copied" })
            : intl.formatMessage({ id: "toolkit.support.copy", defaultMessage: "Copy" })}
      </button>
      {state.supportContacts.length === 0 && (
        <p className="muted">{intl.formatMessage({ id: "toolkit.support.addPartner", defaultMessage: "Add your partner under My plan → Support network." })}</p>
      )}
    </section>
  );
}
