import {
  ALL_PRODUCTS,
  ASSESSMENTS,
  BADGES,
  COMMON_DRINKS,
  LEVELS,
  PREP_TASKS,
  PROGRAMS,
  PROTECTION_LINKS,
  substanceProfile,
  SUPPLY_ALERTS,
} from "document-models/quit-journey";
import { enumId, LABEL_GROUPS, type LabelGroup } from "../lib/labels.js";
import { cid } from "./content.js";

/**
 * English source catalog for all engine content, keyed by the ids in content.ts.
 * Validated scale items are deliberately excluded: translating them would invalidate the
 * instruments, so they stay in English until a validated translation is licensed.
 */
export function buildContentCatalog(): Record<string, string> {
  const out: Record<string, string> = {};
  const put = (id: string, text: string) => {
    if (text) out[id] = text;
  };

  for (const key of ALL_PRODUCTS) {
    const p = substanceProfile(key);
    put(cid.substance(key, "name"), p.name);
    put(cid.substance(key, "unit"), p.unit);
    put(cid.substance(key, "purchase"), p.purchase);
    put(cid.substance(key, "freeWord"), p.freeWord);
    for (const m of p.milestones) {
      put(cid.milestone(m.key, "title"), m.title);
      put(cid.milestone(m.key, "description"), m.description);
    }
    for (const n of p.safety) {
      put(cid.safety(n.title, "title"), n.title);
      put(cid.safety(n.title, "body"), n.body);
    }
  }
  for (const t of PREP_TASKS) {
    put(cid.prep(t.key, "title"), t.title);
    put(cid.prep(t.key, "hint"), t.hint);
  }
  for (const b of BADGES) {
    put(cid.badge(b.key, "title"), b.title);
    put(cid.badge(b.key, "description"), b.description);
  }
  for (const l of LEVELS) put(cid.level(l.name), l.name);
  for (const p of PROGRAMS) {
    put(cid.program(p.key, "name"), p.name);
    put(cid.program(p.key, "summary"), p.summary);
    put(cid.program(p.key, "evidence"), p.evidence);
    for (const m of p.missions) {
      put(cid.mission(p.key, m.key, "title"), m.title);
      put(cid.mission(p.key, m.key, "body"), m.body);
    }
  }
  for (const a of ASSESSMENTS) {
    put(cid.assessment(a.instrument, "name"), a.name);
    put(cid.assessment(a.instrument, "purpose"), a.purpose);
    a.bands.forEach((band, i) => {
      put(cid.band(a.instrument, i, "label"), band.label);
      put(cid.band(a.instrument, i, "description"), band.description);
    });
  }
  for (const al of SUPPLY_ALERTS) {
    put(cid.alert(al.key, "title"), al.title);
    put(cid.alert(al.key, "body"), al.body);
  }
  for (const l of PROTECTION_LINKS) put(cid.link(l.key), l.description);
  for (const d of COMMON_DRINKS) put(cid.drink(d.key), d.label);
  for (const group of Object.keys(LABEL_GROUPS) as LabelGroup[]) {
    for (const [key, text] of Object.entries(LABEL_GROUPS[group] as Record<string, string>)) put(enumId(group, key), text);
  }
  return out;
}
