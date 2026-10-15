import { useIntl } from "react-intl";
import type { TabProps } from "../../lib/types.js";
import { SafetyTimer } from "../SafetyTimer.js";
import { Assessments } from "./Assessments.js";
import { DrinkDiary } from "./DrinkDiary.js";
import { GamblingProtection } from "./Gambling.js";
import { DrugChecks, Naloxone } from "./HarmReduction.js";
import { IfThenPlans } from "./IfThenPlans.js";
import { Medication } from "./Medication.js";
import { Programs } from "./Programs.js";
import { RiskyPlaces } from "./RiskyPlaces.js";
import { ScreenTime } from "./ScreenTime.js";
import { SupportLinks } from "./SupportLinks.js";

/** Substance-specific tools; each section only appears for the journeys it helps. */
export function ToolkitTab(props: TabProps) {
  const intl = useIntl();
  const { profile } = props.snapshot;
  const drug = profile.category === "DRUG";
  const opioidLike = profile.overdoseRiskAfterBreak || profile.key === "STIMULANTS" || profile.key === "KRATOM";
  const screen = profile.key === "GAMING" || profile.key === "SOCIAL_MEDIA" || profile.key === "PORNOGRAPHY";

  return (
    <div className="stack-lg">
      <h2>{intl.formatMessage({ id: "toolkit.tab.heading", defaultMessage: "Your toolkit" })}</h2>
      {opioidLike && <SafetyTimer {...props} />}
      {opioidLike && <Naloxone {...props} />}
      {drug && <DrugChecks {...props} />}
      {profile.key === "ALCOHOL" && <DrinkDiary {...props} />}
      {profile.key === "GAMBLING" && <GamblingProtection {...props} />}
      {screen && <ScreenTime {...props} />}
      <IfThenPlans {...props} />
      <Programs {...props} />
      <Assessments {...props} />
      <Medication {...props} />
      <RiskyPlaces {...props} />
      <SupportLinks {...props} />
    </div>
  );
}
