import { splitDuration, type JourneySnapshot } from "document-models/quit-journey";
import { formatNumber, pad2 } from "../lib/format.js";

/**
 * The signature element: the clock over a sky whose haze thins as the body
 * recovers (average progress across the substance's recovery milestones).
 */
export function SkyHero({ snapshot, displayName }: { snapshot: JourneySnapshot; displayName: string | null }) {
  const recovery = snapshot.health.reduce((s, h) => s + h.progress, 0) / Math.max(1, snapshot.health.length);
  const hazeOpacity = snapshot.phase === "QUIT" ? Math.max(0.04, 0.9 * (1 - recovery) ** 1.4) : 0.9;
  const hello = displayName ? `Hi ${displayName}` : "Hi there";
  const { profile, reduction } = snapshot;

  if (snapshot.phase !== "QUIT") {
    const d = splitDuration(snapshot.prep.msUntilQuit);
    return (
      <header className="sky">
        <div className="haze" style={{ opacity: hazeOpacity }} />
        <p className="greeting">{hello}</p>
        {snapshot.phase === "PREP" ? (
          <>
            <div className="clock" aria-live="off">
              <span className="big">{d.days}</span><span className="unit">days</span>
              <span className="small">{pad2(d.hours)}:{pad2(d.minutes)}:{pad2(d.seconds)}</span>
            </div>
            <p className="caption">until your day one. The haze starts lifting the moment you stop.</p>
          </>
        ) : (
          <>
            <h2 style={{ fontSize: "2.4rem", margin: "8px 0" }}>Clear skies start with a date.</h2>
            <p className="caption">Tell us what you're leaving behind and this sky starts clearing the moment you stop.</p>
          </>
        )}
      </header>
    );
  }

  if (reduction) {
    return (
      <header className="sky">
        <div className="haze" style={{ opacity: hazeOpacity }} />
        <p className="greeting">{hello}, you've stayed within your limit for</p>
        <div className="clock">
          <span className="big">{reduction.streakDays}</span><span className="unit">{reduction.streakDays === 1 ? "day" : "days"}</span>
        </div>
        <p className="caption">
          Today: {formatNumber(reduction.usedToday, 1)} of {formatNumber(reduction.dailyLimit, 1)} {profile.unit}.
          {" "}{reduction.daysWithinLimit} of {reduction.daysTracked} days on track so far.
        </p>
      </header>
    );
  }

  const d = splitDuration(snapshot.elapsedMs);
  const next = snapshot.nextHealthMilestone;
  return (
    <header className="sky">
      <div className="haze" style={{ opacity: hazeOpacity }} />
      <p className="greeting">{hello}, you've been {profile.freeWord} for</p>
      <div className="clock">
        <span className="big">{d.days}</span><span className="unit">{d.days === 1 ? "day" : "days"}</span>
        <span className="small">{pad2(d.hours)}:{pad2(d.minutes)}:{pad2(d.seconds)}</span>
      </div>
      <p className="caption">
        {next
          ? `You're ${Math.round(recovery * 100)}% through your recovery timeline. Next up: ${next.title.toLowerCase()}.`
          : "Every recovery milestone reached. The sky is yours."}
      </p>
    </header>
  );
}
