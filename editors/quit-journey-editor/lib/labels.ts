import type {
  BeverageType,
  CopingStrategy,
  CravingTrigger,
  DrugTestResult,
  DrugTestType,
  ExclusionScheme,
  HarmReductionAction,
  MedicationPlanSource,
  NaloxoneKind,
  ProductType,
  QuitAidType,
  WithdrawalSymptom,
} from "document-models/quit-journey";

export const PRODUCT_LABELS: Record<ProductType, string> = {
  CIGARETTES: "Cigarettes",
  ROLL_YOUR_OWN: "Roll-your-own",
  CIGARS: "Cigars",
  VAPE: "Vape",
  HEATED_TOBACCO: "Heated tobacco",
  OTHER: "Something else",
  ALCOHOL: "Alcohol",
  CANNABIS: "Cannabis",
  OPIOIDS: "Opioids (heroin, fentanyl, pills)",
  STIMULANTS: "Stimulants (cocaine, meth, speed)",
  BENZODIAZEPINES: "Benzodiazepines",
  KRATOM: "Kratom",
  GAMBLING: "Gambling",
  GAMING: "Gaming",
  PORNOGRAPHY: "Pornography",
  SOCIAL_MEDIA: "Social media",
  CAFFEINE: "Caffeine",
  SUGAR: "Sugar",
};

export const TRIGGER_LABELS: Record<CravingTrigger, string> = {
  STRESS: "Stress",
  COFFEE: "Coffee",
  ALCOHOL: "Alcohol",
  AFTER_MEAL: "After a meal",
  BOREDOM: "Boredom",
  SOCIAL: "Around people who use",
  WORK: "Work break",
  DRIVING: "Driving",
  WAKING_UP: "Waking up",
  PHONE: "On the phone",
  ARGUMENT: "Argument",
  CELEBRATION: "Celebrating",
  LONELINESS: "Feeling lonely",
  OTHER: "Something else",
  HUNGRY: "Hungry",
  ANGRY: "Angry",
  TIRED: "Tired",
  PAIN: "In pain",
  PAYDAY: "Payday / cash in hand",
  PEOPLE_PLACES: "Certain people or places",
  SEEING_IT: "Saw it or an ad for it",
  BAD_NEWS: "Bad news",
};

export const STRATEGY_LABELS: Record<CopingStrategy, string> = {
  BREATHING: "Deep breathing",
  WALK: "Went for a walk",
  WATER: "Glass of water",
  SNACK: "Healthy snack",
  GUM: "Chewing gum",
  CALL_SOMEONE: "Called someone",
  DISTRACTION: "Distraction",
  EXERCISE: "Exercise",
  MEDITATION: "Meditation",
  QUIT_AID: "Used my quit aid",
  WAIT_IT_OUT: "Waited it out",
  OTHER: "Something else",
  URGE_SURFING: "Urge surfing",
  SUPPORT_MEETING: "Went to a meeting",
  PLAY_THE_TAPE: "Played the tape forward",
  COLD_WATER: "Cold water on face",
  PRAYER: "Prayer or reflection",
};

export const AID_LABELS: Record<QuitAidType, string> = {
  PATCH: "Nicotine patch",
  GUM: "Nicotine gum",
  LOZENGE: "Lozenge",
  INHALER: "Inhaler",
  MOUTH_SPRAY: "Mouth spray",
  NASAL_SPRAY: "Nasal spray",
  VARENICLINE: "Varenicline",
  BUPROPION: "Bupropion",
  CYTISINE: "Cytisine",
  COUNSELING: "Counseling",
  APP_PROGRAM: "Support program",
  OTHER: "Other",
  METHADONE: "Methadone",
  BUPRENORPHINE: "Buprenorphine",
  NALTREXONE: "Naltrexone",
  ACAMPROSATE: "Acamprosate",
  DISULFIRAM: "Disulfiram",
  SUPPORT_GROUP: "Support group (AA, NA, SMART…)",
  THERAPY: "Therapy (CBT etc.)",
};

export const SYMPTOM_LABELS: Record<WithdrawalSymptom, string> = {
  IRRITABILITY: "Irritable",
  ANXIETY: "Anxious",
  RESTLESSNESS: "Restless",
  INSOMNIA: "Poor sleep",
  HUNGER: "Hungry",
  HEADACHE: "Headache",
  LOW_MOOD: "Low mood",
  POOR_CONCENTRATION: "Foggy",
  COUGH: "Coughing",
  CONSTIPATION: "Constipation",
  DIZZINESS: "Dizzy",
  NAUSEA: "Nauseous",
  SWEATING: "Sweating",
  MUSCLE_ACHES: "Aching muscles",
  TREMOR: "Shaky",
  CHILLS: "Chills",
  VIVID_DREAMS: "Vivid dreams",
  ANHEDONIA: "Nothing feels good",
  DIARRHEA: "Diarrhea",
};

export const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function entries<K extends string>(labels: Record<K, string>): [K, string][] {
  return Object.entries(labels) as [K, string][];
}

export const NALOXONE_LABELS: Record<NaloxoneKind, string> = {
  NASAL_SPRAY_4MG: "Nasal spray 4 mg",
  NASAL_SPRAY_8MG: "Nasal spray 8 mg",
  INJECTABLE: "Injectable",
  AUTO_INJECTOR: "Auto-injector",
  OTHER: "Other",
};

export const DRUG_TEST_LABELS: Record<DrugTestType, string> = {
  FENTANYL_STRIP: "Fentanyl strip",
  XYLAZINE_STRIP: "Xylazine strip",
  NITAZENE_STRIP: "Nitazene strip",
  MEDETOMIDINE_STRIP: "Medetomidine strip",
  BENZO_STRIP: "Benzo strip",
  REAGENT_KIT: "Reagent kit",
  CHECKING_SERVICE: "Drug-checking service",
  OTHER: "Other test",
};

export const DRUG_RESULT_LABELS: Record<DrugTestResult, string> = {
  POSITIVE: "Positive (detected)",
  NEGATIVE: "Negative (not detected)",
  INCONCLUSIVE: "Unclear",
};

export const HARM_ACTION_LABELS: Record<HarmReductionAction, string> = {
  DID_NOT_USE: "Didn't use it",
  USED_LESS: "Used less",
  WENT_SLOWER: "Went slower",
  NOT_ALONE: "Wasn't alone",
  NALOXONE_READY: "Naloxone ready",
  DISCARDED: "Threw it away",
  TOLD_SOMEONE: "Told someone",
};

export const BEVERAGE_LABELS: Record<BeverageType, string> = {
  BEER: "Beer",
  WINE: "Wine",
  SPIRITS: "Spirits",
  CIDER: "Cider",
  COCKTAIL: "Cocktail",
  OTHER: "Other",
};

export const EXCLUSION_LABELS: Record<ExclusionScheme, string> = {
  GAMSTOP: "GAMSTOP (UK)",
  OASIS: "OASIS (Germany)",
  BETBLOCKER: "BetBlocker",
  GAMBAN: "Gamban",
  BANK_BLOCK: "Bank gambling block",
  VENUE: "Venue self-exclusion",
  OTHER: "Other",
};

export const MED_SOURCE_LABELS: Record<MedicationPlanSource, string> = {
  CLINICIAN: "From my clinician",
  LEAFLET: "From the package leaflet",
  SELF: "My own notes",
};
