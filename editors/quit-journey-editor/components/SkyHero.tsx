import { splitDuration, substanceProfile, type JourneySnapshot, type SubstanceProfile } from "document-models/quit-journey";
import { useIntl } from "react-intl";
import { cid, useContent } from "../i18n/content.js";
import { formatNumber, pad2, singular } from "../lib/format.js";

/**
 * Translated substance wording. Values the user typed (custom name, unit label) differ from the
 * built-in English profile and are shown as-is; built-in values are looked up by content id.
 * `lower` lowercases English source text mid-sentence (other languages keep the translator's casing).
 */
export function useProfileText(profile: SubstanceProfile) {
  const intl = useIntl();
  const { tc } = useContent();
  const base = substanceProfile(profile.key);
  const pick = (field: "name" | "unit" | "freeWord", value: string, english: string) =>
    value === english ? tc(cid.substance(profile.key, field), english) : value;
  const unit = pick("unit", profile.unit, base.unit);
  const isEnglish = intl.locale.split("-")[0] === "en";
  return {
    name: pick("name", profile.name, base.name),
    unit,
    /** Singular of the unit; only the English heuristic is applied, translations stay as written. */
    unitOne: unit === profile.unit ? singular(unit) : unit,
    freeWord: pick("freeWord", profile.freeWord, base.freeWord),
    lower: (s: string) => (isEnglish ? s.toLowerCase() : s),
  };
}

/**
 * The signature element: the clock over a sky whose haze thins as the body
 * recovers (average progress across the substance's recovery milestones).
 */
export function SkyHero({ snapshot, displayName }: { snapshot: JourneySnapshot; displayName: string | null }) {
  const intl = useIntl();
  const { tc } = useContent();
  const recovery = snapshot.health.reduce((s, h) => s + h.progress, 0) / Math.max(1, snapshot.health.length);
  const hazeOpacity = snapshot.phase === "QUIT" ? Math.max(0.04, 0.9 * (1 - recovery) ** 1.4) : 0.9;
  const greet = { hasName: displayName ? "yes" : "no", name: displayName ?? "" };
  const { profile, reduction } = snapshot;
  const text = useProfileText(profile);
  const daysUnit = (count: number) =>
    intl.formatMessage({ id: "hero.clock.days", defaultMessage: "{count, plural, one {day} other {days}}" }, { count });

  if (snapshot.phase !== "QUIT") {
    const d = splitDuration(snapshot.prep.msUntilQuit);
    return (
      <header className="sky">
        <div className="haze" style={{ opacity: hazeOpacity }} />
        <p className="greeting">{intl.formatMessage({ id: "hero.greeting", defaultMessage: "{hasName, select, yes {Hi {name}} other {Hi there}}" }, greet)}</p>
        {snapshot.phase === "PREP" ? (
          <>
            <div className="clock" aria-live="off">
              <span className="big">{d.days}</span><span className="unit">{daysUnit(d.days)}</span>
              <span className="small">{pad2(d.hours)}:{pad2(d.minutes)}:{pad2(d.seconds)}</span>
            </div>
            <p className="caption">{intl.formatMessage({ id: "hero.prep.caption", defaultMessage: "until your day one. The haze starts lifting the moment you stop." })}</p>
          </>
        ) : (
          <>
            <h2 style={{ fontSize: "2.4rem", margin: "8px 0" }}>{intl.formatMessage({ id: "hero.notStarted.title", defaultMessage: "Clear skies start with a date." })}</h2>
            <p className="caption">{intl.formatMessage({ id: "hero.notStarted.caption", defaultMessage: "Tell us what you're leaving behind and this sky starts clearing the moment you stop." })}</p>
          </>
        )}
      </header>
    );
  }

  if (reduction) {
    return (
      <header className="sky">
        <div className="haze" style={{ opacity: hazeOpacity }} />
        <p className="greeting">
          {intl.formatMessage({ id: "hero.reduction.greeting", defaultMessage: "{hasName, select, yes {Hi {name}} other {Hi there}}, you've stayed within your limit for" }, greet)}
        </p>
        <div className="clock">
          <span className="big">{reduction.streakDays}</span><span className="unit">{daysUnit(reduction.streakDays)}</span>
        </div>
        <p className="caption">
          {intl.formatMessage(
            { id: "hero.reduction.today", defaultMessage: "Today: {used} of {limit} {unit}." },
            { used: formatNumber(reduction.usedToday, 1), limit: formatNumber(reduction.dailyLimit, 1), unit: text.unit },
          )}
          {" "}
          {intl.formatMessage(
            { id: "hero.reduction.onTrack", defaultMessage: "{within} of {tracked, plural, one {# day} other {# days}} on track so far." },
            { within: reduction.daysWithinLimit, tracked: reduction.daysTracked },
          )}
        </p>
      </header>
    );
  }

  const d = splitDuration(snapshot.elapsedMs);
  const next = snapshot.nextHealthMilestone;
  return (
    <header className="sky">
      <div className="haze" style={{ opacity: hazeOpacity }} />
      <p className="greeting">
        {intl.formatMessage(
          { id: "hero.quit.greeting", defaultMessage: "{hasName, select, yes {Hi {name}} other {Hi there}}, you've been {freeWord} for" },
          { ...greet, freeWord: text.freeWord },
        )}
      </p>
      <div className="clock">
        <span className="big">{d.days}</span><span className="unit">{daysUnit(d.days)}</span>
        <span className="small">{pad2(d.hours)}:{pad2(d.minutes)}:{pad2(d.seconds)}</span>
      </div>
      <p className="caption">
        {next
          ? intl.formatMessage(
            { id: "hero.quit.progress", defaultMessage: "You're {percent}% through your recovery timeline. Next up: {milestone}." },
            { percent: Math.round(recovery * 100), milestone: text.lower(tc(cid.milestone(next.key, "title"), next.title)) },
          )
          : intl.formatMessage({ id: "hero.quit.allReached", defaultMessage: "Every recovery milestone reached. The sky is yours." })}
      </p>
    </header>
  );
}
