import { useIntl } from "react-intl";
import { cid, useContent } from "../i18n/content.js";
import { formatDateTime, formatShortDuration } from "../lib/format.js";
import type { TabProps } from "../lib/types.js";
import { useProfileText } from "./SkyHero.js";
import { Ring } from "./ui.js";

export function HealthTab({ snapshot }: TabProps) {
  const intl = useIntl();
  const { tc } = useContent();
  const text = useProfileText(snapshot.profile);
  const started = snapshot.streaks.recoveryStart !== null;
  return (
    <section className="stack">
      <h2>{intl.formatMessage({ id: "health.heading", defaultMessage: "How your body is recovering" })}</h2>
      <p className="soft">
        {intl.formatMessage(
          { id: "health.intro", defaultMessage: "{substance}: measured from your last use. These are typical timelines, not guarantees — everyone heals at their own pace." },
          { substance: text.name },
        )}
        {snapshot.reduction && ` ${intl.formatMessage({ id: "health.reductionNote", defaultMessage: "While you're cutting down, the timeline restarts after each use; it fills up during your longest breaks." })}`}
      </p>
      <ol className="timeline" style={{ marginTop: 20 }}>
        {snapshot.health.map((h) => (
          <li key={h.key} className={h.reached ? "done" : undefined}>
            <Ring value={h.progress}>{h.icon}</Ring>
            <div>
              <h3>{tc(cid.milestone(h.key, "title"), h.title)}</h3>
              <p className="soft">{tc(cid.milestone(h.key, "description"), h.description)}</p>
              <p className="when">
                {!started
                  ? intl.formatMessage({ id: "health.startsOnQuitDay", defaultMessage: "Starts on your quit day" })
                  : h.reached
                    ? intl.formatMessage({ id: "health.reached", defaultMessage: "Reached {date}" }, { date: formatDateTime(new Date(h.reachedAt).toISOString()) })
                    : intl.formatMessage(
                      { id: "health.progress", defaultMessage: "{percent}% there, {remaining} to go" },
                      { percent: Math.floor(h.progress * 100), remaining: formatShortDuration(h.remainingMs) },
                    )}
              </p>
            </div>
          </li>
        ))}
      </ol>
      {snapshot.profile.sources.length > 0 && (
        <p className="muted">
          {intl.formatMessage({ id: "health.sources", defaultMessage: "Sources: {sources}." }, { sources: intl.formatList(snapshot.profile.sources, { type: "unit" }) })}
        </p>
      )}
    </section>
  );
}
