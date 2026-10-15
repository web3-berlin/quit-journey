import { formatDateTime, formatShortDuration } from "../lib/format.js";
import type { TabProps } from "../lib/types.js";
import { Ring } from "./ui.js";

export function HealthTab({ snapshot }: TabProps) {
  const started = snapshot.streaks.recoveryStart !== null;
  return (
    <section className="stack">
      <h2>How your body is recovering</h2>
      <p className="soft">
        {snapshot.profile.name}: measured from your last use. These are typical timelines, not guarantees — everyone heals at their own pace.
        {snapshot.reduction && " While you're cutting down, the timeline restarts after each use; it fills up during your longest breaks."}
      </p>
      <ol className="timeline" style={{ marginTop: 20 }}>
        {snapshot.health.map((h) => (
          <li key={h.key} className={h.reached ? "done" : undefined}>
            <Ring value={h.progress}>{h.icon}</Ring>
            <div>
              <h3>{h.title}</h3>
              <p className="soft">{h.description}</p>
              <p className="when">
                {!started
                  ? "Starts on your quit day"
                  : h.reached
                    ? `Reached ${formatDateTime(new Date(h.reachedAt).toISOString())}`
                    : `${Math.floor(h.progress * 100)}% there, ${formatShortDuration(h.remainingMs)} to go`}
              </p>
            </div>
          </li>
        ))}
      </ol>
      {snapshot.profile.sources.length > 0 && <p className="muted">Sources: {snapshot.profile.sources.join(", ")}.</p>}
    </section>
  );
}
