import type { AssessmentInstrument, ProductType } from "document-models/quit-journey/v1";
import { ALL_PRODUCTS } from "./dates.js";
import type { AssessmentDefinition, AssessmentItem, AssessmentOption, AssessmentResult, ScoreBand } from "./types.js";

/**
 * [number of items, lowest answer, highest answer] per instrument.
 * Mirrors the RECORD_ASSESSMENT reducer validation.
 */
export const ASSESSMENT_SHAPES: Record<AssessmentInstrument, [number, number, number]> = {
  AUDIT_C: [3, 0, 4],
  AUDIT: [10, 0, 4],
  HSI: [2, 0, 3],
  CUDIT_R: [8, 0, 4],
  PGSI: [9, 0, 3],
  BARC_10: [10, 1, 6],
  SOWS: [16, 0, 4],
  SAWS: [10, 0, 3],
  CWS: [19, 0, 10],
  ACSA: [16, 0, 4],
};

const opts = (labels: string[], values: number[] = labels.map((_, i) => i)): AssessmentOption[] =>
  labels.map((label, i) => ({ value: values[i], label }));

/** Neutral numeric options for instruments whose wording we may not reproduce. */
function genericOptions(min: number, max: number): AssessmentOption[] {
  const out: AssessmentOption[] = [];
  for (let v = min; v <= max; v++) {
    out.push({ value: v, label: v === min ? `${v} (lowest)` : v === max ? `${v} (highest)` : String(v) });
  }
  return out;
}

/** Placeholder items: correct count and range, no copyrighted wording. */
function unlicensedItems(instrument: AssessmentInstrument): AssessmentItem[] {
  const [count, min, max] = ASSESSMENT_SHAPES[instrument];
  return Array.from({ length: count }, () => ({ text: "", options: genericOptions(min, max) }));
}

const band = (min: number, max: number, label: string, level: ScoreBand["level"], description: string): ScoreBand => ({
  min,
  max,
  label,
  level,
  description,
});

// ---------- AUDIT (WHO, Babor et al. 2001) — verbatim, unaltered ----------

const FREQUENCY = opts(["Never", "Less than monthly", "Monthly", "Weekly", "Daily or almost daily"]);
const YES_NO_YEAR = opts(["No", "Yes, but not in the last year", "Yes, during the last year"], [0, 2, 4]);

const AUDIT_ITEMS: AssessmentItem[] = [
  {
    text: "How often do you have a drink containing alcohol?",
    options: opts(["Never", "Monthly or less", "2 to 4 times a month", "2 to 3 times a week", "4 or more times a week"]),
  },
  {
    text: "How many drinks containing alcohol do you have on a typical day when you are drinking?",
    options: opts(["1 or 2", "3 or 4", "5 or 6", "7, 8, or 9", "10 or more"]),
  },
  { text: "How often do you have six or more drinks on one occasion?", options: FREQUENCY },
  {
    text: "How often during the last year have you found that you were not able to stop drinking once you had started?",
    options: FREQUENCY,
  },
  {
    text: "How often during the last year have you failed to do what was normally expected from you because of drinking?",
    options: FREQUENCY,
  },
  {
    text: "How often during the last year have you needed a first drink in the morning to get yourself going after a heavy drinking session?",
    options: FREQUENCY,
  },
  { text: "How often during the last year have you had a feeling of guilt or remorse after drinking?", options: FREQUENCY },
  {
    text: "How often during the last year have you been unable to remember what happened the night before because you had been drinking?",
    options: FREQUENCY,
  },
  { text: "Have you or someone else been injured as a result of your drinking?", options: YES_NO_YEAR },
  {
    text: "Has a relative or friend or a doctor or another health worker been concerned about your drinking or suggested you cut down?",
    options: YES_NO_YEAR,
  },
];

const AUDIT_CITATION =
  "Babor TF, Higgins-Biddle JC, Saunders JB, Monteiro MG. AUDIT: The Alcohol Use Disorders Identification Test. Guidelines for Use in Primary Care, 2nd ed. World Health Organization, 2001 (WHO/MSD/MSB/01.6a). Reproduced unaltered; may be freely reproduced, not for sale or commercial use.";

// ---------- SOWS (Handelsman et al. 1987) — verbatim ----------

const SOWS_OPTIONS = opts(["Not at all", "A little", "Moderately", "Quite a bit", "Extremely"]);
const SOWS_ITEMS: AssessmentItem[] = [
  "I feel anxious",
  "I feel like yawning",
  "I am perspiring",
  "My eyes are teary",
  "My nose is running",
  "I have goose flesh",
  "I am shaking",
  "I have hot flushes",
  "I have cold flushes",
  "My bones & muscles ache",
  "I feel restless",
  "I feel nauseous",
  "I feel like vomiting",
  "My muscles twitch",
  "I have cramps in my stomach",
  "I feel like shooting up",
].map((text) => ({ text, options: SOWS_OPTIONS }));

// ---------- CWS (Allsop et al. 2011) — verbatim, "experience" rating ----------

const CWS_OPTIONS: AssessmentOption[] = Array.from({ length: 11 }, (_, v) => ({
  value: v,
  label: v === 0 ? "0 – Not at all" : v === 5 ? "5 – Moderately" : v === 10 ? "10 – Extremely" : String(v),
}));
const CWS_ITEMS: AssessmentItem[] = [
  "The only thing I could think about was smoking some cannabis",
  "I had a headache",
  "I had no appetite",
  "I felt nauseous (like vomiting)",
  "I felt nervous",
  "I had some angry outbursts",
  "I had mood swings",
  "I felt depressed",
  "I was easily irritated",
  "I had been imagining being stoned",
  "I felt restless",
  "I woke up early",
  "I had a stomach ache",
  "I had nightmares and/or strange dreams",
  "Life seemed like an uphill struggle",
  "I woke up sweating at night",
  "I had trouble getting to sleep at night",
  "I felt physically tense",
  "I had hot flashes",
].map((text) => ({ text, options: CWS_OPTIONS }));

const TALK = "This is not a diagnosis. Talking it through with a doctor or support service can help you decide what to do next.";

export const ASSESSMENTS: AssessmentDefinition[] = [
  {
    instrument: "AUDIT",
    name: "AUDIT",
    purpose: "A 10-question check of how drinking is affecting you, developed by the World Health Organization.",
    appliesTo: ["ALCOHOL"],
    kind: "SCREEN",
    retakeDays: 30,
    items: AUDIT_ITEMS,
    bands: [
      band(0, 7, "Lower risk", "low", "Your answers suggest a lower-risk drinking pattern."),
      band(8, 15, "Increasing risk", "moderate", "Your answers suggest drinking at a level that can raise health risks. Cutting down is likely to help."),
      band(16, 19, "Higher risk", "high", `Your answers suggest drinking that may already be causing harm. ${TALK}`),
      band(20, 40, "Highest risk", "high", `Your answers suggest you could benefit from professional support. ${TALK}`),
    ],
    citation: AUDIT_CITATION,
    licensed: true,
  },
  {
    instrument: "AUDIT_C",
    name: "AUDIT-C",
    purpose: "The first three AUDIT questions: a quick look at how often and how much you drink.",
    appliesTo: ["ALCOHOL"],
    kind: "SCREEN",
    retakeDays: 30,
    items: AUDIT_ITEMS.slice(0, 3),
    bands: [
      band(0, 3, "Lower risk", "low", "Your answers suggest a lower-risk drinking pattern."),
      band(
        4,
        12,
        "Increasing risk",
        "moderate",
        "Your answers suggest drinking that may raise health risks. Some services use 3 or more as the threshold for women. The full AUDIT gives a fuller picture.",
      ),
    ],
    citation: `Bush K, Kivlahan DR, McDonell MB, Fihn SD, Bradley KA. The AUDIT alcohol consumption questions (AUDIT-C). Arch Intern Med 1998;158:1789-95. Items 1-3 of the WHO AUDIT. ${AUDIT_CITATION}`,
    licensed: true,
  },
  {
    instrument: "HSI",
    name: "Heaviness of Smoking Index",
    purpose: "Two questions about how soon and how much you smoke, used to gauge nicotine dependence.",
    appliesTo: ["CIGARETTES", "ROLL_YOUR_OWN", "CIGARS"],
    kind: "SCREEN",
    retakeDays: 30,
    items: unlicensedItems("HSI"),
    bands: [
      band(0, 1, "Lower dependence", "low", "Your answers suggest lower nicotine dependence."),
      band(2, 4, "Moderate dependence", "moderate", "Nicotine replacement or other quit aids may make withdrawal easier."),
      band(5, 6, "Higher dependence", "high", `Stop-smoking medicines and support roughly double your chances. ${TALK}`),
    ],
    citation:
      "Heatherton TF, Kozlowski LT, Frecker RC, Rickert W, Robinson J. Measuring the heaviness of smoking. Br J Addict 1989;84:791-9.",
    licensed: false,
  },
  {
    instrument: "CUDIT_R",
    name: "CUDIT-R",
    purpose: "Eight questions about how cannabis use is affecting you.",
    appliesTo: ["CANNABIS"],
    kind: "SCREEN",
    retakeDays: 30,
    items: unlicensedItems("CUDIT_R"),
    bands: [
      band(0, 7, "Lower risk", "low", "Your answers suggest a lower-risk pattern of use."),
      band(8, 11, "Increasing risk", "moderate", "Your answers suggest use that may be causing some harm."),
      band(12, 32, "Higher risk", "high", `Your answers suggest you could benefit from support. ${TALK}`),
    ],
    citation:
      "Adamson SJ, Kay-Lambkin FJ, Baker AL, et al. An improved brief measure of cannabis misuse: the CUDIT-R. Drug Alcohol Depend 2010;110:137-43.",
    licensed: false,
  },
  {
    instrument: "PGSI",
    name: "Problem Gambling Severity Index",
    purpose: "Nine questions about how gambling has affected you over the last 12 months.",
    appliesTo: ["GAMBLING"],
    kind: "SCREEN",
    retakeDays: 30,
    items: unlicensedItems("PGSI"),
    bands: [
      band(0, 0, "No signs of harm", "low", "Your answers show no signs of gambling harm."),
      band(1, 2, "Lower risk", "low", "Your answers suggest a low level of gambling harm."),
      band(3, 7, "Moderate risk", "moderate", "Your answers suggest gambling is causing some harm. Blocking tools can help."),
      band(8, 27, "Higher risk", "high", `Your answers suggest gambling is causing significant harm. ${TALK}`),
    ],
    citation: "Ferris J, Wynne H. The Canadian Problem Gambling Index: Final Report. Canadian Centre on Substance Abuse, 2001.",
    licensed: false,
  },
  {
    instrument: "BARC_10",
    name: "Brief Assessment of Recovery Capital",
    purpose: "Ten statements about the strengths and resources that support your recovery.",
    appliesTo: ALL_PRODUCTS,
    kind: "RECOVERY_CAPITAL",
    retakeDays: 30,
    items: unlicensedItems("BARC_10"),
    bands: [
      band(10, 46, "Building recovery capital", "moderate", "You have room to grow the supports around you. Small steps such as one new contact or routine add up."),
      band(47, 60, "Strong recovery capital", "low", "You have a strong base of supports. Keep using them."),
    ],
    citation:
      "Vilsaint CL, Kelly JF, Bergman BG, et al. Development and validation of a Brief Assessment of Recovery Capital (BARC-10). Drug Alcohol Depend 2017;177:71-6.",
    licensed: false,
  },
  {
    instrument: "SOWS",
    name: "Subjective Opiate Withdrawal Scale",
    purpose: "Sixteen symptoms rated right now, to track how opioid withdrawal feels.",
    appliesTo: ["OPIOIDS", "KRATOM"],
    kind: "WITHDRAWAL",
    retakeDays: 1,
    items: SOWS_ITEMS,
    bands: [
      band(0, 0, "No symptoms", "low", "You are not reporting withdrawal symptoms right now."),
      band(1, 10, "Mild withdrawal", "low", "Mild symptoms. Rest, fluids and distraction can help."),
      band(11, 20, "Moderate withdrawal", "moderate", "Moderate symptoms. A doctor or pharmacist can advise on medicines that ease withdrawal."),
      band(21, 64, "Severe withdrawal", "high", "Severe symptoms. Please contact a doctor, treatment service or emergency services now."),
    ],
    citation:
      "Handelsman L, Cochrane KJ, Aronson MJ, et al. Two new rating scales for opiate withdrawal. Am J Drug Alcohol Abuse 1987;13(3):293-308. Interpretation bands as reproduced by NCETA, Flinders University.",
    licensed: true,
  },
  {
    instrument: "SAWS",
    name: "Short Alcohol Withdrawal Scale",
    purpose: "Ten symptoms rated to track alcohol withdrawal.",
    appliesTo: ["ALCOHOL"],
    kind: "WITHDRAWAL",
    retakeDays: 1,
    items: unlicensedItems("SAWS"),
    bands: [
      band(0, 11, "Mild withdrawal", "low", "Mild symptoms. If they get worse, seek medical advice — alcohol withdrawal can become dangerous."),
      band(12, 30, "Higher withdrawal", "high", "Strong symptoms. Alcohol withdrawal can be dangerous: contact a doctor or emergency services now."),
    ],
    citation:
      "Gossop M, Keaney F, Stewart D, Marshall EJ, Strang J. A Short Alcohol Withdrawal Scale (SAWS): development and psychometric properties. Addict Biol 2002;7(1):37-43.",
    licensed: false,
  },
  {
    instrument: "CWS",
    name: "Cannabis Withdrawal Scale",
    purpose: "Nineteen experiences from the last 24 hours, rated 0–10, to track cannabis withdrawal.",
    appliesTo: ["CANNABIS"],
    kind: "WITHDRAWAL",
    retakeDays: 1,
    items: CWS_ITEMS,
    bands: [
      band(0, 37, "Lower", "low", "Few or mild symptoms. They usually ease within one to two weeks."),
      band(38, 94, "Moderate", "moderate", "Noticeable symptoms. Sleep, exercise and support can help while they pass."),
      band(
        95,
        190,
        "Higher",
        "high",
        "Strong symptoms. A doctor can help with sleep and mood. If you have thoughts of harming yourself, call a crisis line now. (The CWS has no official cut-offs; these bands are a guide.)",
      ),
    ],
    citation:
      "Allsop DJ, Norberg MM, Copeland J, Fu S, Budney AJ. The Cannabis Withdrawal Scale development: patterns and predictors of cannabis withdrawal and distress. Drug Alcohol Depend 2011;119(1-2):123-9. Public domain with acknowledgement (NCETA, Flinders University).",
    licensed: true,
  },
  {
    instrument: "ACSA",
    name: "Amphetamine Cessation Symptom Assessment",
    purpose: "Sixteen symptoms rated to track stimulant withdrawal.",
    appliesTo: ["STIMULANTS"],
    kind: "WITHDRAWAL",
    retakeDays: 1,
    items: unlicensedItems("ACSA"),
    bands: [
      band(0, 15, "Lower", "low", "Few or mild symptoms."),
      band(16, 31, "Moderate", "moderate", "Noticeable symptoms. Low mood and tiredness are common and usually ease over a few weeks."),
      band(
        32,
        64,
        "Higher",
        "high",
        "Strong symptoms. Please talk to a doctor. If you have thoughts of harming yourself, call a crisis line or emergency services now. (No official cut-offs; these bands are a guide.)",
      ),
    ],
    citation:
      "McGregor C, Srisurapanont M, Mitchell A, et al. Psychometric evaluation of the Amphetamine Cessation Symptom Assessment. J Subst Abuse Treat 2008;34(4):443-9.",
    licensed: false,
  },
];

export function assessmentFor(instrument: AssessmentInstrument): AssessmentDefinition {
  const def = ASSESSMENTS.find((a) => a.instrument === instrument);
  if (!def) throw new Error(`Unknown assessment ${instrument}`);
  return def;
}

/** Instruments offered for a journey; unlicensed ones only when the build enables them. */
export function availableAssessments(product: ProductType, includeUnlicensed = false): AssessmentDefinition[] {
  return ASSESSMENTS.filter((a) => a.appliesTo.includes(product) && (includeUnlicensed || a.licensed));
}

/** Same sum as the RECORD_ASSESSMENT reducer, plus band lookup and red-flag escalation. */
export function scoreAssessment(instrument: AssessmentInstrument, answers: number[]): AssessmentResult {
  const def = assessmentFor(instrument);
  const [count, , max] = ASSESSMENT_SHAPES[instrument];
  const score = answers.reduce((sum, a) => sum + a, 0);
  const found = def.bands.find((b) => score >= b.min && score <= b.max) ?? null;
  return {
    instrument,
    score,
    maxScore: count * max,
    band: found,
    redFlag: def.kind === "WITHDRAWAL" && found?.level === "high",
  };
}
