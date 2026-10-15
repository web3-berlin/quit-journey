import { useIntl } from "react-intl";

/**
 * Stable message ids for engine content (timelines, safety notes, programs…). The engine keeps
 * English as the source; the UI looks up a translation by id and falls back to the English text.
 * `buildContentCatalog()` (catalog.ts) generates the English catalog from the same ids.
 */
export const cid = {
  substance: (key: string, field: "name" | "unit" | "purchase" | "freeWord") => `content.substance.${key}.${field}`,
  milestone: (key: string, field: "title" | "description") => `content.milestone.${key}.${field}`,
  safety: (title: string, field: "title" | "body") => `content.safety.${slug(title)}.${field}`,
  prep: (key: string, field: "title" | "hint") => `content.prep.${key}.${field}`,
  badge: (key: string, field: "title" | "description") => `content.badge.${key}.${field}`,
  level: (name: string) => `content.level.${slug(name)}`,
  program: (key: string, field: "name" | "summary" | "evidence") => `content.program.${key}.${field}`,
  mission: (program: string, key: string, field: "title" | "body") => `content.mission.${program}.${key}.${field}`,
  assessment: (instrument: string, field: "name" | "purpose") => `content.assessment.${instrument}.${field}`,
  band: (instrument: string, index: number, field: "label" | "description") => `content.assessment.${instrument}.band${index}.${field}`,
  alert: (key: string, field: "title" | "body") => `content.alert.${key}.${field}`,
  link: (key: string) => `content.link.${key}.description`,
  drink: (key: string) => `content.drink.${key}`,
};

export function slug(text: string): string {
  return text.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 48);
}

/**
 * `tc(id, english)` returns the translated content string or the English source, verbatim
 * (content isn't parsed as ICU, so apostrophes and braces in prose are safe).
 * `tf(id, englishTemplate, values)` formats content that has ICU placeholders such as `{unit}`.
 */
export function useContent() {
  const intl = useIntl();
  const tc = (id: string, english: string): string => {
    const m = intl.messages[id];
    return typeof m === "string" && m.length > 0 ? m : english;
  };
  const tf = (id: string, english: string, values: Record<string, string | number>): string =>
    intl.formatMessage({ id, defaultMessage: english }, values);
  return { tc, tf };
}
