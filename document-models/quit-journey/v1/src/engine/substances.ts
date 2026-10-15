import type { ProductType, QuitPlan } from "document-models/quit-journey/v1";
import { HEALTH_MILESTONES, type HealthMilestoneDef } from "./health.js";
import { DAY } from "./time.js";

export type SubstanceCategory = "NICOTINE" | "ALCOHOL" | "DRUG" | "BEHAVIOR" | "OTHER";

export interface SafetyNote {
  /** "critical" notes are shown on Today, in SOS and when logging a slip. */
  level: "critical" | "info";
  title: string;
  body: string;
}

export interface SubstanceProfile {
  key: ProductType;
  name: string;
  category: SubstanceCategory;
  /** Plural unit, e.g. "drinks". */
  unit: string;
  /** What one purchase is called, e.g. "bottle". */
  purchase: string;
  /** "{x}-free" wording for the hero. */
  freeWord: string;
  /** Minutes of life expectancy per unit (tobacco only). */
  lifeMinutesPerUnit: number | null;
  /** Minutes of your day each unit used to take (behavioural addictions). */
  minutesPerUnit: number | null;
  /** Tolerance drops quickly, so using again after a break can be fatal. */
  overdoseRiskAfterBreak: boolean;
  /** Stopping suddenly after regular heavy use can be medically dangerous. */
  dangerousWithdrawal: boolean;
  milestones: HealthMilestoneDef[];
  safety: SafetyNote[];
  sources: string[];
}

const m = (key: string, afterMs: number, icon: string, title: string, description: string): HealthMilestoneDef => ({ key, afterMs, icon, title, description });

const NEVER_ALONE: SafetyNote = {
  level: "critical",
  title: "Your tolerance drops fast",
  body: "After even a few days without opioids, an amount you used to take can stop your breathing. If you use again: use far less, never use alone, keep naloxone (Narcan) nearby, and call emergency services (112 / 911) if someone can't be woken or is breathing slowly.",
};

const OVERDOSE_SIGNS: SafetyNote = {
  level: "info",
  title: "Signs of an overdose",
  body: "Tiny pupils, slow or stopped breathing, blue or grey lips and fingertips, gurgling or snoring sounds, can't be woken. Call emergency services, give naloxone if you have it, and put the person in the recovery position.",
};

const MIXING: SafetyNote = {
  level: "info",
  title: "Don't mix depressants",
  body: "Combining opioids, benzodiazepines, alcohol or other sedatives multiplies the risk of breathing stopping.",
};

const CRISIS: SafetyNote = {
  level: "info",
  title: "If it gets dark",
  body: "Low mood is common in early recovery. If you have thoughts of suicide, call your local crisis line (988 in the US, 116 123 Samaritans in the UK and Ireland) or emergency services.",
};

const NICOTINE_SOURCES = ["WHO", "US CDC", "American Cancer Society", "NHS"];

/** Nicotine without combustion: no carbon-monoxide or smoke-specific milestones. */
const NON_COMBUSTIBLE = HEALTH_MILESTONES.filter((h) => ["heart-rate", "taste-smell", "nicotine-free", "withdrawal-fades"].includes(h.key));

const BEHAVIOR_MILESTONES: HealthMilestoneDef[] = [
  m("b-day-one", DAY, "🌅", "First day back in control", "One full day of choosing differently. That's the hardest one."),
  m("b-urges-peak", 3 * DAY, "🌊", "First urge wave ridden out", "Urges are often strongest in the first days; each one you ride out weakens the habit loop."),
  m("b-week", 7 * DAY, "🧭", "A week of new routines", "Your days have new shapes now. Notice what you're doing with the time and energy you got back."),
  m("b-month", 30 * DAY, "🔗", "Habit loop weakening", "Around a month in, many people notice urges come less often and fade faster."),
  m("b-90", 90 * DAY, "🧠", "Ninety days", "A classic recovery milestone: new routines are becoming automatic."),
  m("b-year", 365 * DAY, "🏆", "One year free", "A full year of choosing yourself. Lapses get rarer the longer you go."),
];

const PROFILES: Record<ProductType, Omit<SubstanceProfile, "key">> = {
  CIGARETTES: { name: "Cigarettes", category: "NICOTINE", unit: "cigarettes", purchase: "pack", freeWord: "smoke-free", lifeMinutesPerUnit: 20, minutesPerUnit: null, overdoseRiskAfterBreak: false, dangerousWithdrawal: false, milestones: HEALTH_MILESTONES, safety: [], sources: NICOTINE_SOURCES },
  ROLL_YOUR_OWN: { name: "Roll-your-own", category: "NICOTINE", unit: "cigarettes", purchase: "pouch", freeWord: "smoke-free", lifeMinutesPerUnit: 20, minutesPerUnit: null, overdoseRiskAfterBreak: false, dangerousWithdrawal: false, milestones: HEALTH_MILESTONES, safety: [], sources: NICOTINE_SOURCES },
  CIGARS: { name: "Cigars", category: "NICOTINE", unit: "cigars", purchase: "box", freeWord: "smoke-free", lifeMinutesPerUnit: null, minutesPerUnit: null, overdoseRiskAfterBreak: false, dangerousWithdrawal: false, milestones: HEALTH_MILESTONES, safety: [], sources: NICOTINE_SOURCES },
  VAPE: { name: "Vape", category: "NICOTINE", unit: "pods", purchase: "pack", freeWord: "vape-free", lifeMinutesPerUnit: null, minutesPerUnit: null, overdoseRiskAfterBreak: false, dangerousWithdrawal: false, milestones: NON_COMBUSTIBLE, safety: [], sources: NICOTINE_SOURCES },
  HEATED_TOBACCO: { name: "Heated tobacco", category: "NICOTINE", unit: "sticks", purchase: "pack", freeWord: "nicotine-free", lifeMinutesPerUnit: null, minutesPerUnit: null, overdoseRiskAfterBreak: false, dangerousWithdrawal: false, milestones: NON_COMBUSTIBLE, safety: [], sources: NICOTINE_SOURCES },
  ALCOHOL: {
    name: "Alcohol", category: "ALCOHOL", unit: "drinks", purchase: "bottle", freeWord: "alcohol-free", lifeMinutesPerUnit: null, minutesPerUnit: null, overdoseRiskAfterBreak: false, dangerousWithdrawal: true,
    milestones: [
      m("alc-withdrawal-peak", 3 * DAY, "🧯", "Riskiest withdrawal window passed", "Physical withdrawal usually peaks 24–72 hours after the last drink, then eases. Shaking, confusion or seeing things still need urgent medical help."),
      m("alc-sleep", 7 * DAY, "😴", "Sleep starts to recover", "Without alcohol fragmenting it, deep and REM sleep begin to return; most people sleep better within a week or two."),
      m("alc-month", 30 * DAY, "🫀", "Liver, blood pressure & blood sugar improve", "In a study of a month without alcohol, liver fat, blood pressure and insulin resistance all dropped (Mehta et al., BMJ Open 2018)."),
      m("alc-mood", 90 * DAY, "🌤️", "Mood steadies", "Anxiety and low mood caused by drinking often lift within weeks to months of stopping."),
      m("alc-liver-year", 365 * DAY, "💪", "Liver given a full year", "Fatty liver from drinking is usually reversible. A year alcohol-free gives your liver its best chance (scarring from cirrhosis doesn't reverse)."),
      m("alc-cancer", 5 * 365 * DAY, "🎗️", "Cancer risk keeps falling", "Risk of alcohol-related cancers (mouth, throat, oesophagus, liver, breast, bowel) declines the longer you stay stopped."),
    ],
    safety: [
      { level: "critical", title: "Heavy daily drinker? Don't stop alone", body: "Stopping suddenly after heavy daily drinking can cause seizures or delirium tremens, which can be fatal. Talk to a doctor about a supervised detox or taper. Get emergency help for shaking you can't control, confusion, seizures or hallucinations." },
      MIXING,
      CRISIS,
    ],
    sources: ["NHS", "NIAAA", "Mehta et al., BMJ Open 2018"],
  },
  CANNABIS: {
    name: "Cannabis", category: "DRUG", unit: "joints", purchase: "bag", freeWord: "cannabis-free", lifeMinutesPerUnit: null, minutesPerUnit: null, overdoseRiskAfterBreak: false, dangerousWithdrawal: false,
    milestones: [
      m("can-start", DAY, "🌅", "Withdrawal begins", "Irritability, restlessness and trouble sleeping often start within a day or two. They're temporary."),
      m("can-peak", 7 * DAY, "⛰️", "Past the peak", "Cannabis withdrawal usually peaks between days 2 and 6, then fades."),
      m("can-two-weeks", 14 * DAY, "🧘", "Withdrawal mostly over", "Most withdrawal symptoms are gone within about two weeks; vivid dreams and sleep changes can last a little longer."),
      m("can-receptors", 28 * DAY, "🧠", "Brain receptors reset", "Cannabinoid (CB1) receptors, reduced by regular use, return to normal levels after about four weeks (Hirvonen et al., Molecular Psychiatry 2012)."),
      m("can-memory", 30 * DAY, "💡", "Sharper memory", "Memory and attention measurably improve within a month of stopping (Schuster et al., J Clin Psychiatry 2018)."),
      m("can-sleep", 45 * DAY, "😴", "Sleep settles", "Sleep without cannabis usually feels normal again within about a month or two."),
      m("can-year", 365 * DAY, "🏆", "One year free", "A year of new routines, clearer mornings and money kept."),
    ],
    safety: [
      { level: "info", title: "Get help for unusual thoughts", body: "If you notice paranoia, hearing voices or thoughts that feel very out of character, talk to a doctor promptly." },
      CRISIS,
    ],
    sources: ["NIDA", "Budney et al. (withdrawal timeline)", "Hirvonen et al., Mol Psychiatry 2012", "Schuster et al., J Clin Psychiatry 2018"],
  },
  OPIOIDS: {
    name: "Opioids", category: "DRUG", unit: "doses", purchase: "bag", freeWord: "opioid-free", lifeMinutesPerUnit: null, minutesPerUnit: null, overdoseRiskAfterBreak: true, dangerousWithdrawal: false,
    milestones: [
      m("op-peak", 3 * DAY, "⛰️", "Through the peak", "Withdrawal from short-acting opioids like heroin usually peaks on days 1–3. Withdrawal from methadone starts later and lasts longer."),
      m("op-acute-over", 10 * DAY, "🧘", "Acute withdrawal fading", "Physical symptoms from short-acting opioids usually ease within 5–10 days."),
      m("op-sleep", 30 * DAY, "😴", "Sleep & appetite return", "Sleep, appetite and energy keep improving over the following weeks."),
      m("op-reward", 90 * DAY, "🧠", "Reward system recovering", "Low mood, anxiety and cravings can come in waves for months (post-acute withdrawal). They get further apart."),
      m("op-year", 365 * DAY, "🏆", "One year in recovery", "Every month in recovery makes the next one more likely. Medication like methadone or buprenorphine counts as recovery too."),
    ],
    safety: [NEVER_ALONE, OVERDOSE_SIGNS, MIXING, CRISIS],
    sources: ["SAMHSA", "NIDA", "WHO"],
  },
  STIMULANTS: {
    name: "Stimulants (cocaine, meth, speed)", category: "DRUG", unit: "doses", purchase: "gram", freeWord: "stimulant-free", lifeMinutesPerUnit: null, minutesPerUnit: null, overdoseRiskAfterBreak: false, dangerousWithdrawal: false,
    milestones: [
      m("st-crash", 3 * DAY, "🛌", "The crash passes", "The first days often bring exhaustion, hunger and low mood. It's the body recovering, and it passes."),
      m("st-withdrawal", 14 * DAY, "🧘", "Withdrawal easing", "Fatigue, low mood and strong cravings usually ease over one to two weeks (longer after methamphetamine)."),
      m("st-sleep", 30 * DAY, "😴", "Sleep & appetite normalise", "Sleep and eating patterns settle back into a rhythm."),
      m("st-mood", 90 * DAY, "🌤️", "Joy coming back", "Flat mood (anhedonia) can last weeks to months, then lifts as the brain's reward system heals."),
      m("st-dopamine", 425 * DAY, "🧠", "Dopamine system recovered", "After about 14 months without methamphetamine, dopamine transporter levels recovered substantially (Volkow et al., J Neurosci 2001)."),
    ],
    safety: [
      { level: "critical", title: "Drug supply can contain fentanyl", body: "Cocaine and meth are increasingly cut with fentanyl. If you use again: never alone, test with fentanyl strips if you can, and keep naloxone nearby." },
      CRISIS,
    ],
    sources: ["NIDA", "SAMHSA", "Volkow et al., J Neurosci 2001"],
  },
  BENZODIAZEPINES: {
    name: "Benzodiazepines", category: "DRUG", unit: "pills", purchase: "pack", freeWord: "benzo-free", lifeMinutesPerUnit: null, minutesPerUnit: null, overdoseRiskAfterBreak: true, dangerousWithdrawal: true,
    milestones: [
      m("bz-early", 3 * DAY, "🌅", "Early withdrawal window", "Symptoms start within 1–2 days for short-acting benzos and up to a week for long-acting ones."),
      m("bz-acute", 28 * DAY, "🧘", "Acute withdrawal fading", "Acute withdrawal often lasts two to four weeks after the last dose."),
      m("bz-sleep", 90 * DAY, "😴", "Sleep & calm improving", "Sleep and anxiety keep improving; some people have lingering symptoms for months, which do fade."),
      m("bz-year", 365 * DAY, "🏆", "One year free", "A year without benzodiazepines."),
    ],
    safety: [
      { level: "critical", title: "Never stop benzos suddenly", body: "Stopping suddenly after regular use can cause seizures. Reduce slowly with a doctor's taper plan. Get emergency help for seizures, confusion or hallucinations." },
      MIXING,
      CRISIS,
    ],
    sources: ["NHS", "US FDA (2020 boxed warning)", "Ashton Manual"],
  },
  KRATOM: {
    name: "Kratom", category: "DRUG", unit: "doses", purchase: "pack", freeWord: "kratom-free", lifeMinutesPerUnit: null, minutesPerUnit: null, overdoseRiskAfterBreak: false, dangerousWithdrawal: false,
    milestones: [
      m("kr-peak", 3 * DAY, "⛰️", "Through the peak", "Kratom withdrawal resembles mild opioid withdrawal and usually peaks within the first three days."),
      m("kr-acute", 7 * DAY, "🧘", "Acute withdrawal fading", "Most physical symptoms ease within about a week."),
      m("kr-month", 30 * DAY, "😴", "Energy & sleep return", "Sleep and energy keep improving over the following weeks."),
      m("kr-year", 365 * DAY, "🏆", "One year free", "A year without kratom."),
    ],
    safety: [MIXING, CRISIS],
    sources: ["NIDA", "US FDA"],
  },
  GAMBLING: {
    name: "Gambling", category: "BEHAVIOR", unit: "sessions", purchase: "session", freeWord: "gambling-free", lifeMinutesPerUnit: null, minutesPerUnit: 60, overdoseRiskAfterBreak: false, dangerousWithdrawal: false,
    milestones: BEHAVIOR_MILESTONES,
    safety: [
      { level: "info", title: "Make gambling harder to reach", body: "Self-exclude from betting sites and venues, install a gambling blocker, and let someone you trust help manage money for a while." },
      CRISIS,
    ],
    sources: ["NHS", "GamCare", "National Council on Problem Gambling"],
  },
  GAMING: { name: "Gaming", category: "BEHAVIOR", unit: "hours", purchase: "purchase", freeWord: "gaming-free", lifeMinutesPerUnit: null, minutesPerUnit: 60, overdoseRiskAfterBreak: false, dangerousWithdrawal: false, milestones: BEHAVIOR_MILESTONES, safety: [], sources: ["WHO (ICD-11 gaming disorder)"] },
  PORNOGRAPHY: { name: "Pornography", category: "BEHAVIOR", unit: "sessions", purchase: "subscription", freeWord: "porn-free", lifeMinutesPerUnit: null, minutesPerUnit: 30, overdoseRiskAfterBreak: false, dangerousWithdrawal: false, milestones: BEHAVIOR_MILESTONES, safety: [], sources: ["Compulsive sexual behaviour disorder (WHO ICD-11)"] },
  SOCIAL_MEDIA: { name: "Social media", category: "BEHAVIOR", unit: "hours", purchase: "purchase", freeWord: "scroll-free", lifeMinutesPerUnit: null, minutesPerUnit: 60, overdoseRiskAfterBreak: false, dangerousWithdrawal: false, milestones: BEHAVIOR_MILESTONES, safety: [], sources: [] },
  CAFFEINE: {
    name: "Caffeine", category: "OTHER", unit: "cups", purchase: "bag", freeWord: "caffeine-free", lifeMinutesPerUnit: null, minutesPerUnit: null, overdoseRiskAfterBreak: false, dangerousWithdrawal: false,
    milestones: [
      m("caf-peak", 2 * DAY, "🤕", "Headache peak passing", "Caffeine withdrawal headaches and tiredness peak 20–51 hours after the last cup (Juliano & Griffiths 2004)."),
      m("caf-over", 9 * DAY, "🧘", "Withdrawal over", "Withdrawal symptoms last 2–9 days."),
      m("caf-sleep", 14 * DAY, "😴", "Deeper sleep", "Without late caffeine, falling asleep and deep sleep usually improve."),
      m("caf-energy", 30 * DAY, "⚡", "Natural energy", "Your energy now comes without the mid-afternoon crash."),
    ],
    safety: [],
    sources: ["Juliano & Griffiths, Psychopharmacology 2004"],
  },
  SUGAR: {
    name: "Sugar", category: "OTHER", unit: "sweets", purchase: "pack", freeWord: "sugar-free", lifeMinutesPerUnit: null, minutesPerUnit: null, overdoseRiskAfterBreak: false, dangerousWithdrawal: false,
    milestones: [
      m("sug-cravings", 3 * DAY, "🌊", "First cravings ridden out", "Cravings are often strongest in the first few days."),
      m("sug-energy", 7 * DAY, "⚡", "Steadier energy", "Without sugar spikes, energy through the day tends to even out."),
      m("sug-taste", 21 * DAY, "👅", "Taste adjusting", "Many people find naturally sweet foods taste sweeter after a few weeks."),
      m("sug-month", 30 * DAY, "🔗", "New habits", "The after-dinner sweet reflex is fading."),
    ],
    safety: [],
    sources: [],
  },
  OTHER: { name: "Something else", category: "OTHER", unit: "times", purchase: "purchase", freeWord: "free", lifeMinutesPerUnit: null, minutesPerUnit: null, overdoseRiskAfterBreak: false, dangerousWithdrawal: false, milestones: BEHAVIOR_MILESTONES, safety: [CRISIS], sources: [] },
};

/** Grouping used by pickers. */
export const SUBSTANCE_GROUPS: { label: string; keys: ProductType[] }[] = [
  { label: "Nicotine", keys: ["CIGARETTES", "ROLL_YOUR_OWN", "CIGARS", "VAPE", "HEATED_TOBACCO"] },
  { label: "Alcohol & drugs", keys: ["ALCOHOL", "CANNABIS", "OPIOIDS", "STIMULANTS", "BENZODIAZEPINES", "KRATOM"] },
  { label: "Behaviours", keys: ["GAMBLING", "GAMING", "PORNOGRAPHY", "SOCIAL_MEDIA"] },
  { label: "Everyday", keys: ["CAFFEINE", "SUGAR", "OTHER"] },
];

export function substanceProfile(key: ProductType): SubstanceProfile {
  return { key, ...PROFILES[key] };
}

/**
 * Profile for a plan, with the user's own name and unit label applied.
 * Plans saved before these fields existed (customName/unitLabel undefined) fall back to the defaults.
 */
export function profileForPlan(plan: QuitPlan | null | undefined): SubstanceProfile {
  const base = substanceProfile(plan?.productType ?? "CIGARETTES");
  const customName = plan?.customName?.trim();
  const unitLabel = plan?.unitLabel?.trim();
  return {
    ...base,
    name: customName || base.name,
    unit: unitLabel || base.unit,
    freeWord: customName && plan?.productType === "OTHER" ? `${customName.toLowerCase()}-free` : base.freeWord,
  };
}

