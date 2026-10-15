import { cid } from "../../editors/quit-journey-editor/i18n/content.js";
import { profileForPlan, type QuitPlan } from "./core.js";

/**
 * The addiction's name for a plan in the active language: the user's own name for a custom
 * addiction, otherwise the translated substance name. `lookup` is `tc` from useContent or translate.ts.
 */
export function profileDisplayName(plan: QuitPlan, lookup: (id: string, english: string) => string): string {
  const profile = profileForPlan(plan);
  return plan.customName?.trim() ? profile.name : lookup(cid.substance(profile.key, "name"), profile.name);
}
