import { BADGES, type BadgeCategory } from "document-models/quit-journey";
import { useIntl } from "react-intl";
import { cid, useContent } from "../i18n/content.js";
import { capitalize } from "../lib/format.js";
import type { TabProps } from "../lib/types.js";
import { useProfileText } from "./SkyHero.js";
import { Meter } from "./ui.js";

const CATEGORIES: BadgeCategory[] = ["TIME", "MONEY", "AVOIDED", "CRAVINGS", "HABITS", "SUPPORT"];

export function BadgesTab({ snapshot }: TabProps) {
  const intl = useIntl();
  const { tc, tf } = useContent();
  const { unit } = useProfileText(snapshot.profile);
  const { badges, earnedBadges } = snapshot.gamification;
  const categoryTitle = (cat: BadgeCategory): string => {
    switch (cat) {
      case "TIME": return intl.formatMessage({ id: "badges.category.time", defaultMessage: "Time on your journey" });
      case "MONEY": return intl.formatMessage({ id: "badges.category.money", defaultMessage: "Money saved" });
      case "AVOIDED": return intl.formatMessage({ id: "badges.category.avoided", defaultMessage: "{unit} skipped" }, { unit: capitalize(unit) });
      case "CRAVINGS": return intl.formatMessage({ id: "badges.category.cravings", defaultMessage: "Beating cravings" });
      case "HABITS": return intl.formatMessage({ id: "badges.category.habits", defaultMessage: "Healthy habits" });
      case "SUPPORT": return intl.formatMessage({ id: "badges.category.support", defaultMessage: "Your support system" });
    }
  };
  return (
    <div className="stack-lg">
      <div className="spread">
        <h2>{intl.formatMessage({ id: "badges.heading", defaultMessage: "Badges" })}</h2>
        <span className="soft">{intl.formatMessage({ id: "badges.earned", defaultMessage: "{earned} of {total} earned" }, { earned: earnedBadges, total: badges.length })}</span>
      </div>
      {CATEGORIES.map((cat) => (
        <section key={cat} className="stack">
          <h3>{categoryTitle(cat)}</h3>
          <div className="badges">
            {badges.filter((b) => b.category === cat).map((b) => {
              const title = tc(cid.badge(b.key, "title"), b.title);
              const template = BADGES.find((x) => x.key === b.key)?.description;
              const description = template ? tf(cid.badge(b.key, "description"), template, { unit }) : b.description;
              return (
                <div key={b.key} className={b.earned ? "badge earned" : "badge locked"}>
                  <div className="icon" aria-hidden>{b.icon}</div>
                  <p className="name">{title}</p>
                  <p className="muted" style={{ fontSize: ".85rem" }}>{description}</p>
                  {!b.earned && (
                    <div style={{ marginTop: 8 }}>
                      <Meter value={b.progress} label={intl.formatMessage({ id: "badges.progress", defaultMessage: "{badge} progress" }, { badge: title })} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
