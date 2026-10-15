import type { BadgeCategory } from "document-models/quit-journey";
import { capitalize } from "../lib/format.js";
import type { TabProps } from "../lib/types.js";
import { Meter } from "./ui.js";

const CATEGORY_TITLES: Record<BadgeCategory, string> = {
  TIME: "Time on your journey",
  MONEY: "Money saved",
  AVOIDED: "Skipped",
  CRAVINGS: "Beating cravings",
  HABITS: "Healthy habits",
  SUPPORT: "Your support system",
};

export function BadgesTab({ snapshot }: TabProps) {
  const { badges, earnedBadges } = snapshot.gamification;
  const categories = Object.keys(CATEGORY_TITLES) as BadgeCategory[];
  return (
    <div className="stack-lg">
      <div className="spread">
        <h2>Badges</h2>
        <span className="soft">{earnedBadges} of {badges.length} earned</span>
      </div>
      {categories.map((cat) => (
        <section key={cat} className="stack">
          <h3>{cat === "AVOIDED" ? `${capitalize(snapshot.profile.unit)} skipped` : CATEGORY_TITLES[cat]}</h3>
          <div className="badges">
            {badges.filter((b) => b.category === cat).map((b) => (
              <div key={b.key} className={b.earned ? "badge earned" : "badge locked"}>
                <div className="icon" aria-hidden>{b.icon}</div>
                <p className="name">{b.title}</p>
                <p className="muted" style={{ fontSize: ".85rem" }}>{b.description}</p>
                {!b.earned && <div style={{ marginTop: 8 }}><Meter value={b.progress} label={`${b.title} progress`} /></div>}
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
